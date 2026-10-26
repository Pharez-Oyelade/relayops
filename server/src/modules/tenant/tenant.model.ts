import mongoose, { Schema, Document, Types } from "mongoose";

export const TENANT_PLANS = ["FREE", "PRO", "ENTERPRISE"] as const;
export type TenantPlan = (typeof TENANT_PLANS)[number];

export const CURRENCIES = ["USD", "NGN", "EUR", "GBP"] as const;
export type Currency = (typeof CURRENCIES)[number];

export interface ITenant extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  plan: TenantPlan;
  settings: {
    currency: Currency;
    invoicePrefix: string;
    maxProjects: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const tenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    plan: {
      type: String,
      enum: TENANT_PLANS,
      default: "FREE",
    },
    settings: {
      currency: {
        type: String,
        enum: CURRENCIES,
        default: "USD",
      },
      invoicePrefix: {
        type: String,
        uppercase: true,
        trim: true,
        default: "INV",
      },
      maxProjects: {
        type: Number,
        default: 3,
      },
    },
  },
  {
    timestamps: true,
  },
);

export const TenantModel = mongoose.model<ITenant>("Tenant", tenantSchema);
