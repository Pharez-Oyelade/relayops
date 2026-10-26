import { z } from "zod";
import { LEAD_STAGES } from "./lead.model.js";

export const publicLeadSchema = z.object({
  params: z.object({
    tenantSlug: z
      .string()
      .trim()
      .toLowerCase()
      .min(2, "Workspace slug must be at least 2 characters"),
  }),
  body: z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().trim().toLowerCase().email("Valid email required"),
    company: z
      .string()
      .trim()
      .min(2, "Company name must be at least 2 characters")
      .max(120),
    projectType: z.string().trim().max(100).optional(),
    budgetRange: z.string().trim().max(100).optional(),
    message: z.string().trim().max(3000).optional(),
  }),
});

export const updateLeadSchema = z.object({
  params: z.object({
    leadId: z.string().min(1, "Lead ID is required"),
  }),
  body: z.object({
    stage: z.enum(LEAD_STAGES).optional(),
    name: z.string().trim().min(2).max(100).optional(),
    company: z.string().trim().min(2).max(120).optional(),
    projectType: z.string().trim().max(100).optional(),
    budgetRange: z.string().trim().max(100).optional(),
    adminMessage: z.string().trim().max(3000).optional(),
  }),
});

export const listLeadsSchema = z.object({
  query: z.object({
    stage: z.enum(LEAD_STAGES).optional(),
    search: z.string().trim().optional(),
    archived: z
      .enum(["true", "false"])
      .optional()
      .transform((val) => val === "true"),
  }),
});

export const convertLeadSchema = z.object({
  params: z.object({
    leadId: z.string().min(1, "Lead ID is required"),
  }),
});

export type PublicLeadInput = z.infer<typeof publicLeadSchema>["body"];
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>["body"];
export type ListLeadsQuery = z.infer<typeof listLeadsSchema>["query"];
