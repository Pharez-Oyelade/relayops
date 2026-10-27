import { z } from "zod";
import { INVOICE_STATUSES } from "./invoice.model.js";
import { CURRENCIES } from "../tenant/tenant.model.js";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z
  .string()
  .regex(objectIdRegex, "Must be a valid 24-character hexadecimal ObjectId");

export const createInvoiceSchema = z.object({
  body: z.object({
    projectId: objectIdSchema,
    deliverableId: objectIdSchema.optional(),
    lineItems: z
      .array(
        z.object({
          description: z
            .string()
            .trim()
            .min(2, "Line item description must be at least 2 characters")
            .max(300),
          amount: z
            .number()
            .int()
            .positive("Line item amount must be a positive integer in minor units"),
        }),
      )
      .min(1, "At least one itemized line item is required"),
    currency: z.enum(CURRENCIES).optional(),
    dueDate: z.coerce.date().optional(),
    status: z.enum(["DRAFT", "SENT"]).default("DRAFT"),
  }),
});

export const verifyPaystackSchema = z.object({
  params: z.object({
    invoiceId: objectIdSchema,
  }),
  body: z.object({
    reference: z
      .string()
      .trim()
      .min(1, "Paystack transaction reference is required"),
  }),
});

export const invoiceParamsSchema = z.object({
  params: z.object({
    invoiceId: objectIdSchema,
  }),
});

export const listInvoicesSchema = z.object({
  query: z.object({
    status: z.enum(INVOICE_STATUSES).optional(),
    projectId: objectIdSchema.optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>["body"];
export type VerifyPaystackInput = z.infer<typeof verifyPaystackSchema>["body"];
export type ListInvoicesQuery = z.infer<typeof listInvoicesSchema>["query"];
