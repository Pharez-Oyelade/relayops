import mongoose, { Schema, Document, Types } from "mongoose";
import { CURRENCIES, Currency } from "../tenant/tenant.model.js";

export const INVOICE_STATUSES = [
  "DRAFT",
  "SENT",
  "PAID",
  "OVERDUE",
  "VOID",
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export interface IInvoiceLineItem {
  description: string;
  amount: number; // minor currency units (e.g. cents/kobo)
}

export interface IInvoice extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  projectId: Types.ObjectId;
  deliverableId?: Types.ObjectId;
  invoiceNumber: string;
  lineItems: IInvoiceLineItem[];
  totalAmount: number; // integer minor units
  currency: Currency;
  status: InvoiceStatus;
  dueDate?: Date;
  paidAt?: Date;
  paystackRef?: string;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceLineItemSchema = new Schema<IInvoiceLineItem>(
  {
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false },
);

const invoiceSchema = new Schema<IInvoice>(
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
    deliverableId: {
      type: Schema.Types.ObjectId,
      ref: "Deliverable",
    },
    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    lineItems: {
      type: [invoiceLineItemSchema],
      required: true,
      default: [],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: CURRENCIES,
      default: "USD",
      required: true,
    },
    status: {
      type: String,
      enum: INVOICE_STATUSES,
      default: "DRAFT",
      required: true,
    },
    dueDate: {
      type: Date,
    },
    paidAt: {
      type: Date,
    },
    paystackRef: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

// Scoped uniqueness for invoice number per workspace (e.g. INV-0001)
invoiceSchema.index({ tenantId: 1, invoiceNumber: 1 }, { unique: true });

// Query filter index: list invoices by project and status
invoiceSchema.index({ tenantId: 1, projectId: 1, status: 1 });

// Paystack payment reference idempotency lookup
invoiceSchema.index({ paystackRef: 1 }, { unique: true, sparse: true });

export const InvoiceModel = mongoose.model<IInvoice>("Invoice", invoiceSchema);
