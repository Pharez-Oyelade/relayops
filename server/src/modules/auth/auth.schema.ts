// auth validation schemas
import { z } from "zod";
import { CURRENCIES } from "../tenant/tenant.model.js";

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100),
    email: z.string().email("Invalid email address").trim().toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password cannot exceed 72 characters"),
    workspaceName: z
      .string()
      .trim()
      .min(2, "Workspace name must be at least 2 characters")
      .max(100),
    workspaceSlug: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Slug must be at least 3 characters")
      .max(40)
      .regex(
        /^[a-z0-9-]+$/,
        "Slug can only contain lowercase letters, numbers, and hyphens",
      )
      .optional(),
    currency: z.enum(CURRENCIES).optional().default("USD"),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address").trim().toLowerCase(),
    password: z.string().min(1, "Password is required"),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
