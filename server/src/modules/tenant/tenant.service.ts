import mongoose, { Types } from "mongoose";
import crypto from "crypto";
import { TenantModel, ITenant } from "./tenant.model.js";
import { MembershipModel, IMembership } from "./membership.model.js";
import { UserModel } from "../user/user.model.js";
import { AuthService } from "../auth/auth.service.js";
import { EmailService } from "../../services/email.service.js";
import { AppError } from "../../utils/AppError.js";
import { hashToken } from "../../utils/jwt.js";
import {
  CreateTenantInput,
  InviteMemberInput,
  UpdateMemberRoleInput,
} from "./tenant.schema.js";

export class TenantService {
  /**
   * Creates a new workspace for an existing authenticated user.
   */
  static async createTenant(userId: string, input: CreateTenantInput) {
    const slugExists = await TenantModel.exists({ slug: input.slug });
    if (slugExists) {
      throw new AppError(
        "Workspace slug already taken. Please choose another.",
        409,
        "SLUG_TAKEN",
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const [tenant] = await TenantModel.create(
        [
          {
            name: input.name,
            slug: input.slug,
            plan: "FREE",
            settings: {
              currency: input.currency,
              invoicePrefix: input.slug.slice(0, 3).toUpperCase(),
              maxProjects: 3,
            },
          },
        ],
        { session },
      );

      await MembershipModel.create(
        [
          {
            tenantId: tenant._id,
            userId: new Types.ObjectId(userId),
            role: "OWNER",
            status: "ACTIVE",
          },
        ],
        { session },
      );

      await UserModel.findByIdAndUpdate(
        userId,
        { lastActiveTenantId: tenant._id },
        { session },
      );

      await session.commitTransaction();

      return {
        tenantId: tenant._id.toString(),
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
        currency: tenant.settings.currency,
        role: "OWNER" as const,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Retrieves all active workspaces for a user.
   */
  static async getWorkspaces(userId: string) {
    return AuthService.getUserWorkspaces(new Types.ObjectId(userId));
  }

  /**
   * Retrieves all members and invited collaborators for a workspace.
   */
  static async getMembers(tenantId: Types.ObjectId) {
    const memberships = await MembershipModel.find({ tenantId })
      .populate("userId", "name email avatarUrl")
      .sort({ createdAt: -1 })
      .lean();

    return memberships.map((m) => {
      const user = m.userId as unknown as {
        _id: Types.ObjectId;
        name: string;
        email: string;
        avatarUrl?: string;
      };

      return {
        membershipId: m._id.toString(),
        userId: user?._id?.toString() ?? null,
        name: user?.name ?? "Invited User",
        email: user?.email ?? "",
        avatarUrl: user?.avatarUrl,
        role: m.role,
        status: m.status,
        clientCompany: m.clientCompany,
        invitedAt: m.createdAt,
      };
    });
  }

  /**
   * Invites a new team member or client to the workspace.
   * Enforces Free plan quota (max 5 members).
   */
  static async inviteMember(
    tenantId: Types.ObjectId,
    actorId: string,
    input: InviteMemberInput,
  ) {
    const tenant = await TenantModel.findById(tenantId);
    if (!tenant) {
      throw new AppError("Workspace not found", 404, "TENANT_NOT_FOUND");
    }

    // Free plan quota enforcement
    if (tenant.plan === "FREE") {
      const memberCount = await MembershipModel.countDocuments({
        tenantId,
        status: { $in: ["ACTIVE", "INVITED"] },
      });

      if (memberCount >= 5) {
        throw new AppError(
          "Member quota exceeded on Free tier (max 5 members). Upgrade to Pro to invite more team members.",
          403,
          "PLAN_QUOTA_EXCEEDED",
        );
      }
    }

    // Find or provision user
    let user = await UserModel.findOne({ email: input.email });
    if (!user) {
      const defaultName = input.email.split("@")[0] || "Invited User";
      const [newUser] = await UserModel.create([
        {
          email: input.email,
          name: defaultName,
        },
      ]);
      user = newUser;
    }

    // Check for existing membership in this workspace
    let membership = await MembershipModel.findOne({
      tenantId,
      userId: user._id,
    });

    if (membership && membership.status === "ACTIVE") {
      throw new AppError(
        "User is already an active member of this workspace",
        409,
        "ALREADY_MEMBER",
      );
    }

    // Generate 24-hour invitation token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const inviteTokenHash = hashToken(rawToken);
    const inviteTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (membership) {
      membership.role = input.role;
      membership.status = "INVITED";
      membership.clientCompany = input.clientCompany;
      membership.inviteTokenHash = inviteTokenHash;
      membership.inviteTokenExpires = inviteTokenExpires;
      membership.invitedBy = new Types.ObjectId(actorId);
      await membership.save();
    } else {
      membership = await MembershipModel.create({
        tenantId,
        userId: user._id,
        role: input.role,
        status: "INVITED",
        clientCompany: input.clientCompany,
        inviteTokenHash,
        inviteTokenExpires,
        invitedBy: new Types.ObjectId(actorId),
      });
    }

    // Fetch inviter information
    const inviter = await UserModel.findById(actorId).lean();

    // Dispatch transactional invite email
    await EmailService.sendWorkspaceInvite({
      to: user.email,
      workspaceName: tenant.name,
      role: input.role,
      inviterName: inviter?.name,
      inviteToken: rawToken,
    });

    return {
      message: "Invitation sent successfully",
      membershipId: membership._id.toString(),
      email: user.email,
      role: input.role,
    };
  }

  /**
   * Updates a member's role or status.
   * Protects against demoting or suspending the last active OWNER.
   */
  static async updateMemberRole(
    tenantId: Types.ObjectId,
    membershipId: string,
    input: UpdateMemberRoleInput,
  ) {
    if (!mongoose.Types.ObjectId.isValid(membershipId)) {
      throw new AppError("Invalid membership ID", 400, "INVALID_MEMBERSHIP_ID");
    }

    const membership = await MembershipModel.findOne({
      _id: new Types.ObjectId(membershipId),
      tenantId,
    });

    if (!membership) {
      throw new AppError(
        "Membership not found in active workspace",
        404,
        "MEMBERSHIP_NOT_FOUND",
      );
    }

    const isDemotingOrSuspending =
      (input.role && input.role !== "OWNER") ||
      (input.status && input.status !== "ACTIVE");

    if (membership.role === "OWNER" && isDemotingOrSuspending) {
      const activeOwnerCount = await MembershipModel.countDocuments({
        tenantId,
        role: "OWNER",
        status: "ACTIVE",
      });

      if (activeOwnerCount <= 1) {
        throw new AppError(
          "Cannot demote or suspend the last active owner of the workspace.",
          400,
          "LAST_OWNER_ERROR",
        );
      }
    }

    if (input.role) {
      membership.role = input.role;
    }

    if (input.status) {
      membership.status = input.status;
    }

    await membership.save();

    return {
      membershipId: membership._id.toString(),
      role: membership.role,
      status: membership.status,
    };
  }
}
