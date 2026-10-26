import mongoose, { Schema, Document, Types } from "mongoose";

export const AUDIT_ENTITY_TYPES = [
  "LEAD",
  "PROJECT",
  "DELIVERABLE",
  "INVOICE",
  "MEMBERSHIP",
] as const;
export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];

export interface IAuditLog extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  actorId: Types.ObjectId;
  action: string;
  entityType: AuditEntityType;
  entityId: Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    entityType: {
      type: String,
      enum: AUDIT_ENTITY_TYPES,
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

// Performance indexes: query activity stream by tenant sorted by recency
auditLogSchema.index({ tenantId: 1, createdAt: -1 });

// Query activity by specific entity
auditLogSchema.index({ tenantId: 1, entityType: 1, entityId: 1 });

export const AuditLogModel = mongoose.model<IAuditLog>(
  "AuditLog",
  auditLogSchema,
);
