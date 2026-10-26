import mongoose, { Types } from "mongoose";
import crypto from "crypto";
import { LeadModel, ILead } from "./lead.model.js";
import { TenantModel } from "../tenant/tenant.model.js";
import { UserModel } from "../user/user.model.js";
import { MembershipModel } from "../tenant/membership.model.js";
import { ProjectModel } from "../project/project.model.js";
import { AuditService } from "../audit/audit.service.js";
import { EmailService } from "../../services/email.service.js";
import { AppError } from "../../utils/AppError.js";
import { hashToken } from "../../utils/jwt.js";
import { PublicLeadInput, UpdateLeadInput, ListLeadsQuery } from "./lead.schema.js";

export class LeadService {
  /**
   * Helper to generate a unique project key (2-6 uppercase chars) scoped to the tenant.
   */
  private static async generateUniqueProjectKey(
    tenantId: Types.ObjectId,
    company: string,
    session?: mongoose.ClientSession,
  ): Promise<string> {
    let clean = company.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (clean.length < 2) clean = "PRJ";
    const baseKey = clean.slice(0, 4);

    let candidate = baseKey;
    let counter = 1;

    while (true) {
      const query = ProjectModel.exists({ tenantId, key: candidate });
      if (session) query.session(session);
      const exists = await query;
      if (!exists) break;

      const suffix = counter.toString();
      candidate = `${baseKey.slice(0, 6 - suffix.length)}${suffix}`;
      counter++;
    }

    return candidate;
  }

  /**
   * Inbound public lead capture endpoint with email deduplication.
   * If an inquiry from the same email already exists in this tenant, appends the message
   * to message history and updates details without duplicating lead cards.
   */
  static async capturePublicLead(tenantSlug: string, input: PublicLeadInput) {
    const tenant = await TenantModel.findOne({ slug: tenantSlug });
    if (!tenant) {
      throw new AppError("Workspace not found", 404, "TENANT_NOT_FOUND");
    }

    let lead = await LeadModel.findOne({
      tenantId: tenant._id,
      email: input.email,
    });

    if (lead) {
      if (input.message) {
        lead.messages.push({
          body: input.message,
          sender: "PROSPECT",
          createdAt: new Date(),
        });
      }
      lead.name = input.name;
      lead.company = input.company;
      if (input.projectType) lead.projectType = input.projectType;
      if (input.budgetRange) lead.budgetRange = input.budgetRange;
      if (lead.stage === "LOST") lead.stage = "NEW";
      if (lead.archived) lead.archived = false;

      await lead.save();
      return lead;
    }

    lead = await LeadModel.create({
      tenantId: tenant._id,
      name: input.name,
      email: input.email,
      company: input.company,
      projectType: input.projectType || "",
      budgetRange: input.budgetRange || "",
      stage: "NEW",
      messages: input.message
        ? [
            {
              body: input.message,
              sender: "PROSPECT",
              createdAt: new Date(),
            },
          ]
        : [],
      archived: false,
    });

    return lead;
  }

  /**
   * Lists leads for the CRM Kanban board, scoped to active tenant.
   */
  static async listLeads(tenantId: Types.ObjectId, query: ListLeadsQuery) {
    const filter: Record<string, unknown> = {
      tenantId,
      archived: query.archived ?? false,
    };

    if (query.stage) {
      filter.stage = query.stage;
    }

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { email: { $regex: query.search, $options: "i" } },
        { company: { $regex: query.search, $options: "i" } },
      ];
    }

    return LeadModel.find(filter).sort({ updatedAt: -1 }).lean();
  }

  /**
   * Retrieves single lead by ID within active workspace context.
   */
  static async getLeadById(tenantId: Types.ObjectId, leadId: string) {
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      throw new AppError("Invalid lead ID", 400, "INVALID_LEAD_ID");
    }

    const lead = await LeadModel.findOne({
      _id: new Types.ObjectId(leadId),
      tenantId,
    }).lean();

    if (!lead) {
      throw new AppError("Lead not found in this workspace", 404, "LEAD_NOT_FOUND");
    }

    return lead;
  }

  /**
   * Updates lead details, moves stage, or appends admin correspondence.
   */
  static async updateLead(
    tenantId: Types.ObjectId,
    leadId: string,
    input: UpdateLeadInput,
  ) {
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      throw new AppError("Invalid lead ID", 400, "INVALID_LEAD_ID");
    }

    const lead = await LeadModel.findOne({
      _id: new Types.ObjectId(leadId),
      tenantId,
    });

    if (!lead) {
      throw new AppError("Lead not found in this workspace", 404, "LEAD_NOT_FOUND");
    }

    if (input.stage) lead.stage = input.stage;
    if (input.name) lead.name = input.name;
    if (input.company) lead.company = input.company;
    if (input.projectType !== undefined) lead.projectType = input.projectType;
    if (input.budgetRange !== undefined) lead.budgetRange = input.budgetRange;

    if (input.adminMessage) {
      lead.messages.push({
        body: input.adminMessage,
        sender: "ADMIN",
        createdAt: new Date(),
      });
    }

    await lead.save();
    return lead;
  }

  /**
   * One-Click Atomic Lead-to-Client Conversion Transaction:
   * 1. Finds or provisions global User by email
   * 2. Upserts Membership with role CLIENT_VIEWER, status INVITED, 24h crypto token
   * 3. Initializes Project with status PLANNING and clientUserIds
   * 4. Sets lead.archived = true, stage = QUALIFIED
   * 5. Writes AuditLog entry
   * 6. Commits transaction and dispatches onboarding invitation email via Resend
   */
  static async convertLeadToClient(
    tenantId: Types.ObjectId,
    actorId: string,
    leadId: string,
  ) {
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      throw new AppError("Invalid lead ID", 400, "INVALID_LEAD_ID");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    let rawToken: string;
    let tenantName: string;
    let clientEmail: string;

    try {
      const lead = await LeadModel.findOne({
        _id: new Types.ObjectId(leadId),
        tenantId,
      }).session(session);

      if (!lead) {
        throw new AppError("Lead not found in this workspace", 404, "LEAD_NOT_FOUND");
      }

      if (lead.archived) {
        throw new AppError(
          "This lead has already been converted and archived.",
          400,
          "LEAD_ALREADY_CONVERTED",
        );
      }

      const tenant = await TenantModel.findById(tenantId).session(session);
      if (!tenant) {
        throw new AppError("Workspace not found", 404, "TENANT_NOT_FOUND");
      }
      tenantName = tenant.name;
      clientEmail = lead.email;

      // Plan project quota check
      if (tenant.plan === "FREE") {
        const projectCount = await ProjectModel.countDocuments({
          tenantId,
        }).session(session);

        if (projectCount >= tenant.settings.maxProjects) {
          throw new AppError(
            `Project limit reached for ${tenant.plan} tier (max ${tenant.settings.maxProjects}). Upgrade to create more projects.`,
            403,
            "PLAN_QUOTA_EXCEEDED",
          );
        }
      }

      // 1. Find or provision user
      let user = await UserModel.findOne({ email: lead.email }).session(session);
      if (!user) {
        const [newUser] = await UserModel.create(
          [
            {
              name: lead.name,
              email: lead.email,
              lastActiveTenantId: tenantId,
            },
          ],
          { session },
        );
        user = newUser;
      }

      // 2. Generate 24h crypto token
      rawToken = crypto.randomBytes(32).toString("hex");
      const inviteTokenHash = hashToken(rawToken);
      const inviteTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Upsert membership as CLIENT_VIEWER
      let membership = await MembershipModel.findOne({
        tenantId,
        userId: user._id,
      }).session(session);

      if (membership) {
        membership.role = "CLIENT_VIEWER";
        membership.status = "INVITED";
        membership.clientCompany = lead.company;
        membership.inviteTokenHash = inviteTokenHash;
        membership.inviteTokenExpires = inviteTokenExpires;
        membership.invitedBy = new Types.ObjectId(actorId);
        await membership.save({ session });
      } else {
        const [newMembership] = await MembershipModel.create(
          [
            {
              tenantId,
              userId: user._id,
              role: "CLIENT_VIEWER",
              status: "INVITED",
              clientCompany: lead.company,
              inviteTokenHash,
              inviteTokenExpires,
              invitedBy: new Types.ObjectId(actorId),
            },
          ],
          { session },
        );
        membership = newMembership;
      }

      // 3. Generate unique project key
      const projectKey = await this.generateUniqueProjectKey(
        tenantId,
        lead.company,
        session,
      );

      // 4. Initialize Project
      const [project] = await ProjectModel.create(
        [
          {
            tenantId,
            name: `${lead.company} - Initial Project`,
            key: projectKey,
            description: `Engagement initialized from lead conversion. Inbound Project Type: ${lead.projectType || "General"}, Budget: ${lead.budgetRange || "To be scoped"}.`,
            clientName: lead.company,
            clientUserIds: [user._id],
            status: "PLANNING",
            totalBudget: 0,
            createdBy: new Types.ObjectId(actorId),
          },
        ],
        { session },
      );

      // 5. Update Lead state
      lead.archived = true;
      lead.stage = "QUALIFIED";
      await lead.save({ session });

      // 6. Record Audit Log
      await AuditService.logAction({
        tenantId,
        actorId,
        action: "LEAD_CONVERTED",
        entityType: "LEAD",
        entityId: lead._id,
        metadata: {
          company: lead.company,
          projectId: project._id,
          projectKey: project.key,
          clientUserId: user._id,
        },
        session,
      });

      await session.commitTransaction();

      // 7. Dispatch onboarding invite email outside of transaction
      await EmailService.sendWorkspaceInvite({
        to: clientEmail,
        workspaceName: tenantName,
        role: "Client (Viewer)",
        inviteToken: rawToken,
      });

      return {
        message: "Lead successfully converted to client and project initialized",
        leadId: lead._id.toString(),
        projectId: project._id.toString(),
        projectKey: project.key,
        clientUserId: user._id.toString(),
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
