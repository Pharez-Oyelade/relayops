import mongoose, { Schema, Document, Types } from "mongoose";

export const PROJECT_STATUSES = [
  "PROPOSED",
  "PLANNING",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETED",
  "ARCHIVED",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export interface IProject extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  name: string;
  key: string;
  description?: string;
  clientName: string;
  clientUserIds: Types.ObjectId[];
  status: ProjectStatus;
  totalBudget: number;
  dueDate?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    key: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 2,
      maxlength: 6,
    },
    description: {
      type: String,
      default: "",
      maxlength: 1000,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    clientUserIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    status: {
      type: String,
      enum: PROJECT_STATUSES,
      default: "PLANNING",
      required: true,
    },
    totalBudget: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueDate: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// Unique project key within a tenant (Tenant A and Tenant B can both have key "ENG")
projectSchema.index({ tenantId: 1, key: 1 }, { unique: true });

// Filter performance by status and recency
projectSchema.index({ tenantId: 1, status: 1, createdAt: -1 });

// Fast lookup for client-scoped visibility (CLIENT_VIEWER queries)
projectSchema.index({ tenantId: 1, clientUserIds: 1 });

export const ProjectModel = mongoose.model<IProject>("Project", projectSchema);
