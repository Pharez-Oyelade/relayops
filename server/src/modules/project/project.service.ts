import mongoose, { Types } from "mongoose";
import { ProjectModel, IProject, ProjectStatus } from "./project.model.js";
import { TenantModel } from "../tenant/tenant.model.js";
import { UserModel } from "../user/user.model.js";
import { MembershipModel, Role } from "../tenant/membership.model.js";
import { AuditService } from "../audit/audit.service.js";
import { AppError } from "../../utils/AppError.js";
import {
  CreateProjectInput,
  ProposeProjectInput,
  UpdateProjectInput,
  ListProjectsQuery,
} from "./project.schema.js";

export class ProjectService {
  /**
   * Generates a unique 2-6 character project key scoped to the tenant.
   */
  private static async generateUniqueProjectKey(
    tenantId: Types.ObjectId,
    name: string,
  ): Promise<string> {
    let clean = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (clean.length < 2) clean = "PRJ";
    const baseKey = clean.slice(0, 4);

    let candidate = baseKey;
    let counter = 1;

    while (await ProjectModel.exists({ tenantId, key: candidate })) {
      const suffix = counter.toString();
      candidate = `${baseKey.slice(0, 6 - suffix.length)}${suffix}`;
      counter++;
    }

    return candidate;
  }

  /**
   * Lists projects with row-level scoping:
   * When `role === 'CLIENT_VIEWER'`, strictly restricts results to projects where `clientUserIds` contains `userId`.
   */
  static async listProjects(
    tenantId: Types.ObjectId,
    role: Role,
    userId: string,
    query: ListProjectsQuery,
  ) {
    const filter: Record<string, unknown> = { tenantId };

    // Row-level client scoping (external clients only see assigned projects)
    if (role === "CLIENT_VIEWER") {
      filter.clientUserIds = new Types.ObjectId(userId);
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { key: { $regex: query.search, $options: "i" } },
        { clientName: { $regex: query.search, $options: "i" } },
      ];
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      ProjectModel.find(filter)
        .populate("clientUserIds", "name email avatarUrl")
        .populate("createdBy", "name email avatarUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ProjectModel.countDocuments(filter),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves a single project by ID with row-level client access verification.
   */
  static async getProjectById(
    tenantId: Types.ObjectId,
    role: Role,
    userId: string,
    projectId: string,
  ) {
    const project = await ProjectModel.findOne({
      _id: new Types.ObjectId(projectId),
      tenantId,
    })
      .populate("clientUserIds", "name email avatarUrl")
      .populate("createdBy", "name email avatarUrl")
      .lean();

    if (!project) {
      throw new AppError("Project not found in active workspace", 404, "PROJECT_NOT_FOUND");
    }

    // Row-level client check
    if (role === "CLIENT_VIEWER") {
      const isAssigned = project.clientUserIds.some(
        (c: any) => c._id?.toString() === userId,
      );
      if (!isAssigned) {
        throw new AppError("Project not found in active workspace", 404, "PROJECT_NOT_FOUND");
      }
    }

    return project;
  }

  /**
   * Creates a new project in the workspace.
   * Enforces Free plan quota (maxProjects) and key uniqueness within the tenant.
   */
  static async createProject(
    tenantId: Types.ObjectId,
    actorId: string,
    input: CreateProjectInput,
  ) {
    const tenant = await TenantModel.findById(tenantId);
    if (!tenant) {
      throw new AppError("Workspace not found", 404, "TENANT_NOT_FOUND");
    }

    // Free plan quota enforcement
    if (tenant.plan === "FREE") {
      const projectCount = await ProjectModel.countDocuments({ tenantId });
      if (projectCount >= tenant.settings.maxProjects) {
        throw new AppError(
          `Project limit reached for ${tenant.plan} tier (max ${tenant.settings.maxProjects}). Upgrade to create more projects.`,
          403,
          "PLAN_QUOTA_EXCEEDED",
        );
      }
    }

    // Scoped uniqueness check for project key
    const keyExists = await ProjectModel.exists({
      tenantId,
      key: input.key,
    });
    if (keyExists) {
      throw new AppError(
        `Project key '${input.key}' is already in use in this workspace. Choose a different key.`,
        409,
        "KEY_TAKEN",
      );
    }

    const clientUserObjectIds = (input.clientUserIds || []).map(
      (id) => new Types.ObjectId(id),
    );

    const project = await ProjectModel.create({
      tenantId,
      name: input.name,
      key: input.key,
      description: input.description || "",
      clientName: input.clientName,
      clientUserIds: clientUserObjectIds,
      totalBudget: input.totalBudget || 0,
      dueDate: input.dueDate,
      status: input.status || "PLANNING",
      createdBy: new Types.ObjectId(actorId),
    });

    // Record compliance audit log
    await AuditService.logAction({
      tenantId,
      actorId,
      action: "PROJECT_CREATED",
      entityType: "PROJECT",
      entityId: project._id,
      metadata: {
        name: project.name,
        key: project.key,
        clientName: project.clientName,
        totalBudget: project.totalBudget,
      },
    });

    return project;
  }

  /**
   * Allows external clients (or team members) to propose a new project from their portal.
   * Initialized with `status: 'PROPOSED'` and assigned to the proposing client.
   */
  static async proposeProject(
    tenantId: Types.ObjectId,
    clientUserId: string,
    input: ProposeProjectInput,
  ) {
    const tenant = await TenantModel.findById(tenantId);
    if (!tenant) {
      throw new AppError("Workspace not found", 404, "TENANT_NOT_FOUND");
    }

    const [user, membership] = await Promise.all([
      UserModel.findById(clientUserId).lean(),
      MembershipModel.findOne({
        tenantId,
        userId: new Types.ObjectId(clientUserId),
      }).lean(),
    ]);

    const clientName =
      membership?.clientCompany || user?.name || "Client Proposal";

    const projectKey = await this.generateUniqueProjectKey(
      tenantId,
      input.name,
    );

    const project = await ProjectModel.create({
      tenantId,
      name: input.name,
      key: projectKey,
      description: input.description || "",
      clientName,
      clientUserIds: [new Types.ObjectId(clientUserId)],
      totalBudget: input.estimatedBudget || 0,
      dueDate: input.dueDate,
      status: "PROPOSED",
      createdBy: new Types.ObjectId(clientUserId),
    });

    // Record compliance audit log
    await AuditService.logAction({
      tenantId,
      actorId: clientUserId,
      action: "PROJECT_PROPOSED",
      entityType: "PROJECT",
      entityId: project._id,
      metadata: {
        name: project.name,
        key: project.key,
        estimatedBudget: input.estimatedBudget,
      },
    });

    return project;
  }

  /**
   * Updates an existing project and logs the modification in the audit trail.
   */
  static async updateProject(
    tenantId: Types.ObjectId,
    actorId: string,
    projectId: string,
    input: UpdateProjectInput,
  ) {
    const project = await ProjectModel.findOne({
      _id: new Types.ObjectId(projectId),
      tenantId,
    });

    if (!project) {
      throw new AppError("Project not found in active workspace", 404, "PROJECT_NOT_FOUND");
    }

    const previousStatus = project.status;

    if (input.name) project.name = input.name;
    if (input.description !== undefined) project.description = input.description;
    if (input.clientName) project.clientName = input.clientName;
    if (input.totalBudget !== undefined) project.totalBudget = input.totalBudget;
    if (input.dueDate !== undefined) project.dueDate = input.dueDate || undefined;
    if (input.clientUserIds) {
      project.clientUserIds = input.clientUserIds.map((id) => new Types.ObjectId(id));
    }
    if (input.status) {
      project.status = input.status;
    }

    await project.save();

    const isStatusChange = input.status && input.status !== previousStatus;

    await AuditService.logAction({
      tenantId,
      actorId,
      action: isStatusChange ? "PROJECT_STATUS_UPDATED" : "PROJECT_UPDATED",
      entityType: "PROJECT",
      entityId: project._id,
      metadata: {
        previousStatus,
        newStatus: project.status,
        updatedFields: Object.keys(input),
      },
    });

    return project;
  }
}
