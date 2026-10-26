import mongoose, { Types } from "mongoose";
import {
  DeliverableModel,
  IDeliverable,
  DeliverableStatus,
} from "./deliverable.model.js";
import { ProjectModel } from "../project/project.model.js";
import { TenantModel } from "../tenant/tenant.model.js";
import { UserModel } from "../user/user.model.js";
import { InvoiceModel } from "../invoice/invoice.model.js";
import { Role } from "../tenant/membership.model.js";
import { AuditService } from "../audit/audit.service.js";
import { EmailService } from "../../services/email.service.js";
import { streamUploadToCloudinary } from "../../middleware/upload.middleware.js";
import { AppError } from "../../utils/AppError.js";
import {
  CreateDeliverableInput,
  MoveDeliverableInput,
  DecisionDeliverableInput,
  GetProjectDeliverablesQuery,
} from "./deliverable.schema.js";

export class DeliverableService {
  /**
   * Retrieves deliverables for a project sorted by status and orderIndex.
   * Enforces row-level client scoping for CLIENT_VIEWER.
   */
  static async getProjectDeliverables(
    tenantId: Types.ObjectId,
    role: Role,
    userId: string,
    projectId: string,
    query: GetProjectDeliverablesQuery,
  ) {
    const project = await ProjectModel.findOne({
      _id: new Types.ObjectId(projectId),
      tenantId,
    }).lean();

    if (!project) {
      throw new AppError("Project not found in active workspace", 404, "PROJECT_NOT_FOUND");
    }

    // Row-level client permission check
    if (role === "CLIENT_VIEWER") {
      const isAssigned = project.clientUserIds.some(
        (id: any) => id.toString() === userId,
      );
      if (!isAssigned) {
        throw new AppError("Project not found in active workspace", 404, "PROJECT_NOT_FOUND");
      }
    }

    const filter: Record<string, unknown> = {
      tenantId,
      projectId: project._id,
    };

    if (query.status) {
      filter.status = query.status;
    }
    if (query.priority) {
      filter.priority = query.priority;
    }
    if (query.search) {
      filter.title = { $regex: query.search, $options: "i" };
    }

    const deliverables = await DeliverableModel.find(filter)
      .populate("assigneeId", "name email avatarUrl")
      .populate("assets.uploadedBy", "name email")
      .populate("approvalMetadata.decidedBy", "name email")
      .sort({ status: 1, orderIndex: 1 })
      .lean();

    return deliverables;
  }

  /**
   * Retrieves a single deliverable by ID with client visibility check.
   */
  static async getDeliverableById(
    tenantId: Types.ObjectId,
    role: Role,
    userId: string,
    deliverableId: string,
  ) {
    const deliverable = await DeliverableModel.findOne({
      _id: new Types.ObjectId(deliverableId),
      tenantId,
    })
      .populate("assigneeId", "name email avatarUrl")
      .populate("assets.uploadedBy", "name email")
      .populate("approvalMetadata.decidedBy", "name email")
      .lean();

    if (!deliverable) {
      throw new AppError("Deliverable not found", 404, "DELIVERABLE_NOT_FOUND");
    }

    if (role === "CLIENT_VIEWER") {
      const project = await ProjectModel.findOne({
        _id: deliverable.projectId,
        tenantId,
      }).lean();

      const isAssigned = project?.clientUserIds.some(
        (id: any) => id.toString() === userId,
      );
      if (!isAssigned) {
        throw new AppError("Deliverable not found", 404, "DELIVERABLE_NOT_FOUND");
      }
    }

    return deliverable;
  }

  /**
   * Creates a deliverable card with a sequential code prefix (e.g. ACME-1)
   */
  static async createDeliverable(
    tenantId: Types.ObjectId,
    actorId: string,
    projectId: string,
    input: CreateDeliverableInput,
  ) {
    const project = await ProjectModel.findOne({
      _id: new Types.ObjectId(projectId),
      tenantId,
    });

    if (!project) {
      throw new AppError("Project not found in active workspace", 404, "PROJECT_NOT_FOUND");
    }

    // Generate sequential card code (e.g. ACME-1)
    const deliverableCount = await DeliverableModel.countDocuments({
      tenantId,
      projectId: project._id,
    });

    let seqNumber = deliverableCount + 1;
    let candidateCode = `${project.key}-${seqNumber}`;

    while (await DeliverableModel.exists({ tenantId, code: candidateCode })) {
      seqNumber++;
      candidateCode = `${project.key}-${seqNumber}`;
    }

    // Determine orderIndex for column positioning
    const lastInColumn = await DeliverableModel.findOne({
      tenantId,
      projectId: project._id,
      status: "BACKLOG",
    })
      .sort({ orderIndex: -1 })
      .select("orderIndex")
      .lean();

    const orderIndex = lastInColumn ? lastInColumn.orderIndex + 1 : 0;

    const deliverable = await DeliverableModel.create({
      tenantId,
      projectId: project._id,
      code: candidateCode,
      title: input.title,
      description: input.description || "",
      priority: input.priority,
      assigneeId: input.assigneeId
        ? new Types.ObjectId(input.assigneeId)
        : undefined,
      dueDate: input.dueDate,
      isBillableMilestone: input.isBillableMilestone,
      milestoneAmount: input.isBillableMilestone ? input.milestoneAmount : 0,
      orderIndex,
      status: "BACKLOG",
    });

    // Record compliance audit log
    await AuditService.logAction({
      tenantId,
      actorId,
      action: "DELIVERABLE_CREATED",
      entityType: "DELIVERABLE",
      entityId: deliverable._id,
      metadata: {
        code: deliverable.code,
        title: deliverable.title,
        isBillableMilestone: deliverable.isBillableMilestone,
        milestoneAmount: deliverable.milestoneAmount,
        projectId: project._id,
      },
    });

    return deliverable;
  }

  /**
   * Uploads an asset (image, PDF, ZIP) to Cloudinary and attaches metadata to the deliverable
   */
  static async uploadAsset(
    tenantId: Types.ObjectId,
    actorId: string,
    deliverableId: string,
    file: Express.Multer.File,
  ) {
    const deliverable = await DeliverableModel.findOne({
      _id: new Types.ObjectId(deliverableId),
      tenantId,
    });

    if (!deliverable) {
      throw new AppError("Deliverable not found", 404, "DELIVERABLE_NOT_FOUND");
    }

    const folderPath = `relayops/${tenantId.toString()}/deliverables`;
    const uploadResult = await streamUploadToCloudinary(
      file.buffer,
      folderPath,
      file.originalname,
    );

    const assetData = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      fileName: file.originalname,
      mimeType: file.mimetype,
      bytes: uploadResult.bytes,
      uploadedBy: new Types.ObjectId(actorId),
      uploadedAt: new Date(),
    };

    deliverable.assets.push(assetData);
    await deliverable.save();

    await AuditService.logAction({
      tenantId,
      actorId,
      action: "DELIVERABLE_ASSET_UPLOADED",
      entityType: "DELIVERABLE",
      entityId: deliverable._id,
      metadata: {
        fileName: file.originalname,
        publicId: uploadResult.public_id,
        bytes: uploadResult.bytes,
        deliverableCode: deliverable.code,
      },
    });

    return deliverable;
  }

  /**
   * Updates deliverable Kanban position and column.
   * REJECTS moving directly to 'APPROVED' (must use /decision endpoint).
   */
  static async moveDeliverable(
    tenantId: Types.ObjectId,
    actorId: string,
    deliverableId: string,
    input: MoveDeliverableInput,
  ) {
    const deliverable = await DeliverableModel.findOne({
      _id: new Types.ObjectId(deliverableId),
      tenantId,
    });

    if (!deliverable) {
      throw new AppError("Deliverable not found", 404, "DELIVERABLE_NOT_FOUND");
    }

    // Direct approval guard
    if ((input.status as string) === "APPROVED") {
      throw new AppError(
        "Direct movement to APPROVED is forbidden. Deliverable approval must be submitted through the /decision sign-off endpoint.",
        403,
        "DIRECT_APPROVAL_FORBIDDEN",
      );
    }

    const previousStatus = deliverable.status;
    deliverable.status = input.status;
    deliverable.orderIndex = input.orderIndex;
    await deliverable.save();

    if (previousStatus !== input.status) {
      await AuditService.logAction({
        tenantId,
        actorId,
        action: "DELIVERABLE_MOVED",
        entityType: "DELIVERABLE",
        entityId: deliverable._id,
        metadata: {
          previousStatus,
          newStatus: input.status,
          orderIndex: input.orderIndex,
        },
      });
    }

    return deliverable;
  }

  /**
   * Client / Admin Decision Sign-Off:
   * - REQUEST_CHANGES: transitions card to CHANGES_REQUESTED and logs structured feedback.
   * - APPROVE: runs Multi-Document ACID Transaction updating status to APPROVED,
   *   generating an itemized Invoice (if billable milestone), writing AuditLog, and emailing invoice.
   */
  static async submitDecision(
    tenantId: Types.ObjectId,
    role: Role,
    actorId: string,
    deliverableId: string,
    input: DecisionDeliverableInput,
  ) {
    const deliverable = await DeliverableModel.findOne({
      _id: new Types.ObjectId(deliverableId),
      tenantId,
    });

    if (!deliverable) {
      throw new AppError("Deliverable not found", 404, "DELIVERABLE_NOT_FOUND");
    }

    const project = await ProjectModel.findOne({
      _id: deliverable.projectId,
      tenantId,
    });

    if (!project) {
      throw new AppError("Parent project not found", 404, "PROJECT_NOT_FOUND");
    }

    // If client is submitting, ensure client is assigned to this project
    if (role === "CLIENT_VIEWER") {
      const isAssigned = project.clientUserIds.some(
        (id) => id.toString() === actorId,
      );
      if (!isAssigned) {
        throw new AppError(
          "You do not have permission to review deliverables for this project",
          403,
          "FORBIDDEN",
        );
      }
    }

    // 1. Handled case: REQUEST_CHANGES
    if (input.decision === "REQUEST_CHANGES") {
      deliverable.status = "CHANGES_REQUESTED";
      deliverable.approvalMetadata = {
        decidedBy: new Types.ObjectId(actorId),
        decidedAt: new Date(),
        clientFeedback: input.feedback,
      };

      await deliverable.save();

      await AuditService.logAction({
        tenantId,
        actorId,
        action: "DELIVERABLE_CHANGES_REQUESTED",
        entityType: "DELIVERABLE",
        entityId: deliverable._id,
        metadata: {
          code: deliverable.code,
          title: deliverable.title,
          feedback: input.feedback,
        },
      });

      return {
        message: "Revision requested successfully",
        decision: "REQUEST_CHANGES",
        deliverable,
      };
    }

    // 2. Handled case: APPROVE (Multi-Document ACID Transaction)
    const session = await mongoose.startSession();
    session.startTransaction();

    let createdInvoice: any = null;
    let tenantDetails: any = null;

    try {
      const tenant = await TenantModel.findById(tenantId).session(session);
      if (!tenant) {
        throw new AppError("Workspace not found", 404, "TENANT_NOT_FOUND");
      }
      tenantDetails = tenant;

      // Update deliverable status to APPROVED
      deliverable.status = "APPROVED";
      deliverable.approvalMetadata = {
        decidedBy: new Types.ObjectId(actorId),
        decidedAt: new Date(),
        clientFeedback: input.feedback || "Approved without comments",
      };
      await deliverable.save({ session });

      // If billable milestone, atomically generate Invoice
      if (
        deliverable.isBillableMilestone &&
        deliverable.milestoneAmount > 0
      ) {
        const prefix = tenant.settings.invoicePrefix || "INV";
        const invoiceCount = await InvoiceModel.countDocuments({
          tenantId,
        }).session(session);

        let nextNum = invoiceCount + 1;
        let invoiceNumber = `${prefix}-${String(nextNum).padStart(4, "0")}`;

        while (
          await InvoiceModel.exists({ tenantId, invoiceNumber }).session(session)
        ) {
          nextNum++;
          invoiceNumber = `${prefix}-${String(nextNum).padStart(4, "0")}`;
        }

        const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14-day terms

        const [invoice] = await InvoiceModel.create(
          [
            {
              tenantId,
              projectId: project._id,
              deliverableId: deliverable._id,
              invoiceNumber,
              lineItems: [
                {
                  description: deliverable.title,
                  amount: deliverable.milestoneAmount,
                },
              ],
              totalAmount: deliverable.milestoneAmount,
              currency: tenant.settings.currency,
              status: "SENT",
              dueDate,
            },
          ],
          { session },
        );

        createdInvoice = invoice;
      }

      // Record Audit Log entry
      await AuditService.logAction({
        tenantId,
        actorId,
        action: "DELIVERABLE_APPROVED",
        entityType: "DELIVERABLE",
        entityId: deliverable._id,
        metadata: {
          code: deliverable.code,
          title: deliverable.title,
          isBillable: deliverable.isBillableMilestone,
          milestoneAmount: deliverable.milestoneAmount,
          invoiceId: createdInvoice?._id,
          invoiceNumber: createdInvoice?.invoiceNumber,
        },
        session,
      });

      await session.commitTransaction();

      // Dispatch invoice email if an invoice was generated
      if (createdInvoice && project.clientUserIds.length > 0) {
        const clientUser = await UserModel.findById(
          project.clientUserIds[0],
        ).lean();

        if (clientUser?.email) {
          await EmailService.sendInvoiceNotice({
            to: clientUser.email,
            workspaceName: tenantDetails.name,
            clientName: project.clientName,
            invoiceNumber: createdInvoice.invoiceNumber,
            amount: createdInvoice.totalAmount,
            currency: createdInvoice.currency,
            deliverableTitle: deliverable.title,
          });
        }
      }

      return {
        message: "Deliverable approved successfully",
        decision: "APPROVE",
        deliverable,
        invoice: createdInvoice,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
