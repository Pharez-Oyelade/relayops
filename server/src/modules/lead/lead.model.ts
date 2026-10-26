import mongoose, { Schema, Document, Types } from "mongoose";

export const LEAD_STAGES = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "LOST",
] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];

export const MESSAGE_SENDERS = ["PROSPECT", "ADMIN"] as const;
export type MessageSender = (typeof MESSAGE_SENDERS)[number];

export interface ILeadMessage {
  body: string;
  sender: MessageSender;
  createdAt: Date;
}

export interface ILead extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  name: string;
  email: string;
  company: string;
  projectType?: string;
  budgetRange?: string;
  stage: LeadStage;
  messages: ILeadMessage[];
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const leadMessageSchema = new Schema<ILeadMessage>(
  {
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    sender: {
      type: String,
      enum: MESSAGE_SENDERS,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const leadSchema = new Schema<ILead>(
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
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    projectType: {
      type: String,
      trim: true,
      default: "",
    },
    budgetRange: {
      type: String,
      trim: true,
      default: "",
    },
    stage: {
      type: String,
      enum: LEAD_STAGES,
      default: "NEW",
      required: true,
    },
    messages: {
      type: [leadMessageSchema],
      default: [],
    },
    archived: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { timestamps: true },
);

// Deduplication index: email must be unique per tenant
leadSchema.index({ tenantId: 1, email: 1 }, { unique: true });

// CRM Kanban filter performance (active leads by stage)
leadSchema.index({ tenantId: 1, archived: 1, stage: 1 });

export const LeadModel = mongoose.model<ILead>("Lead", leadSchema);
