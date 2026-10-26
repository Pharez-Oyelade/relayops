import mongoose, { Schema, Document, Types } from "mongoose";

export const DELIVERABLE_STATUSES = [
  "BACKLOG",
  "IN_PROGRESS",
  "IN_REVIEW",
  "CHANGES_REQUESTED",
  "APPROVED",
] as const;
export type DeliverableStatus = (typeof DELIVERABLE_STATUSES)[number];

export const DELIVERABLE_PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
] as const;
export type DeliverablePriority = (typeof DELIVERABLE_PRIORITIES)[number];

export interface IDeliverableAsset {
  url: string;
  publicId: string;
  fileName: string;
  mimeType: string;
  bytes: number;
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
}

export interface IApprovalMetadata {
  decidedBy: Types.ObjectId;
  decidedAt: Date;
  clientFeedback?: string;
}

export interface IDeliverable extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  projectId: Types.ObjectId;
  code: string;
  title: string;
  description?: string;
  status: DeliverableStatus;
  priority: DeliverablePriority;
  assigneeId?: Types.ObjectId;
  dueDate?: Date;
  orderIndex: number;
  isBillableMilestone: boolean;
  milestoneAmount: number; // minor units (e.g. cents/kobo)
  assets: IDeliverableAsset[];
  approvalMetadata?: IApprovalMetadata;
  createdAt: Date;
  updatedAt: Date;
}

const deliverableAssetSchema = new Schema<IDeliverableAsset>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    bytes: { type: Number, required: true },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const approvalMetadataSchema = new Schema<IApprovalMetadata>(
  {
    decidedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    decidedAt: {
      type: Date,
      default: Date.now,
    },
    clientFeedback: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const deliverableSchema = new Schema<IDeliverable>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      default: "",
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: DELIVERABLE_STATUSES,
      default: "BACKLOG",
      required: true,
    },
    priority: {
      type: String,
      enum: DELIVERABLE_PRIORITIES,
      default: "MEDIUM",
      required: true,
    },
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    dueDate: {
      type: Date,
    },
    orderIndex: {
      type: Number,
      default: 0,
      required: true,
    },
    isBillableMilestone: {
      type: Boolean,
      default: false,
      required: true,
    },
    milestoneAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    assets: {
      type: [deliverableAssetSchema],
      default: [],
    },
    approvalMetadata: {
      type: approvalMetadataSchema,
    },
  },
  { timestamps: true },
);

// Performance index: Kanban board ordering per project and column
deliverableSchema.index(
  { tenantId: 1, projectId: 1, status: 1, orderIndex: 1 },
);

// Scoped uniqueness for deliverable card code per workspace (e.g. ACME-1)
deliverableSchema.index({ tenantId: 1, code: 1 }, { unique: true });

export const DeliverableModel = mongoose.model<IDeliverable>(
  "Deliverable",
  deliverableSchema,
);
