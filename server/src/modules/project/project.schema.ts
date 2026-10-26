import { z } from "zod";
import { PROJECT_STATUSES } from "./project.model.js";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z
  .string()
  .regex(objectIdRegex, "Must be a valid 24-character hexadecimal ObjectId");

export const createProjectSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Project name must be at least 2 characters")
      .max(120),
    key: z
      .string()
      .trim()
      .toUpperCase()
      .min(2, "Key must be 2-6 uppercase characters")
      .max(6)
      .regex(
        /^[A-Z0-9]+$/,
        "Key must be uppercase alphanumeric characters only (e.g. ACME)",
      ),
    description: z.string().trim().max(1000).optional(),
    clientName: z
      .string()
      .trim()
      .min(2, "Client name must be at least 2 characters")
      .max(100),
    clientUserIds: z.array(objectIdSchema).optional().default([]),
    totalBudget: z
      .number()
      .nonnegative("Total budget must be non-negative")
      .default(0),
    dueDate: z.coerce.date().optional(),
    status: z
      .enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"])
      .default("PLANNING"),
  }),
});

export const proposeProjectSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Project name must be at least 2 characters")
      .max(120),
    description: z.string().trim().max(1000).optional(),
    estimatedBudget: z
      .number()
      .nonnegative("Estimated budget must be non-negative")
      .optional()
      .default(0),
    dueDate: z.coerce.date().optional(),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    projectId: objectIdSchema,
  }),
  body: z.object({
    name: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().max(1000).optional(),
    clientName: z.string().trim().min(2).max(100).optional(),
    clientUserIds: z.array(objectIdSchema).optional(),
    status: z.enum(PROJECT_STATUSES).optional(),
    totalBudget: z.number().nonnegative().optional(),
    dueDate: z.coerce.date().nullable().optional(),
  }),
});

export const getProjectParamsSchema = z.object({
  params: z.object({
    projectId: objectIdSchema,
  }),
});

export const listProjectsSchema = z.object({
  query: z.object({
    status: z.enum(PROJECT_STATUSES).optional(),
    search: z.string().trim().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>["body"];
export type ProposeProjectInput = z.infer<typeof proposeProjectSchema>["body"];
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>["body"];
export type ListProjectsQuery = z.infer<typeof listProjectsSchema>["query"];
