import mongoose, { Types } from "mongoose";
import { AuditLogModel, AuditEntityType } from "./audit.model.js";

export class AuditService {
  /**
   * Records an immutable audit log entry. Supports optional Mongoose ClientSession for transactions.
   */
  static async logAction(params: {
    tenantId: Types.ObjectId;
    actorId: Types.ObjectId | string;
    action: string;
    entityType: AuditEntityType;
    entityId: Types.ObjectId | string;
    metadata?: Record<string, unknown>;
    session?: mongoose.ClientSession;
  }) {
    const actorObjectId =
      typeof params.actorId === "string"
        ? new Types.ObjectId(params.actorId)
        : params.actorId;

    const entityObjectId =
      typeof params.entityId === "string"
        ? new Types.ObjectId(params.entityId)
        : params.entityId;

    const [log] = await AuditLogModel.create(
      [
        {
          tenantId: params.tenantId,
          actorId: actorObjectId,
          action: params.action,
          entityType: params.entityType,
          entityId: entityObjectId,
          metadata: params.metadata || {},
        },
      ],
      params.session ? { session: params.session } : {},
    );

    return log;
  }

  /**
   * Lists audit logs for a workspace, sorted newest first with populated actor details.
   */
  static async listAuditLogs(
    tenantId: Types.ObjectId,
    query: {
      page?: number;
      limit?: number;
      entityType?: AuditEntityType;
    } = {},
  ) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 30));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { tenantId };
    if (query.entityType) {
      filter.entityType = query.entityType;
    }

    const [items, total] = await Promise.all([
      AuditLogModel.find(filter)
        .populate("actorId", "name email avatarUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLogModel.countDocuments(filter),
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
}
