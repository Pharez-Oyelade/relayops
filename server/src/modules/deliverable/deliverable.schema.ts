import { z } from "zod";
import {
  DELIVERABLE_STATUSES,
  DELIVERABLE_PRIORITIES,
} from "./deliverable.model.js";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const objectIdSchema = z
  .string()
  .regex(objectIdRegex, "Must be a valid 24-character hexadecimal ObjectId");

export const createDeliverableSchema = z.object({
  params: z.object({
    projectId: objectIdSchema,
  }),
  body: z.object({
    title: z
      .string()
      .trim()
      .min(2, "Deliverable title must be at least 2 characters")
      .max(150),
    description: z.string().trim().max(2000).optional(),
    priority: z.enum(DELIVERABLE_PRIORITIES).default("MEDIUM"),
    assigneeId: objectIdSchema.optional(),
    dueDate: z.coerce.date().optional(),
    isBillableMilestone: z.boolean().default(false),
    milestoneAmount: z
      .number()
      .nonnegative("Milestone amount must be non-negative")
      .default(0),
  }),
});

// Drag-and-drop movement schema (strictly rejects moving directly to 'APPROVED')
export const moveDeliverableSchema = z.object({
  params: z.object({
    deliverableId: objectIdSchema,
  }),
  body: z.object({
    status: z.enum([
      "BACKLOG",
      "IN_PROGRESS",
      "IN_REVIEW",
      "CHANGES_REQUESTED",
    ]),
    orderIndex: z.number().int().nonnegative().default(0),
  }),
});

// Client sign-off review schema (discriminated union: APPROVE vs REQUEST_CHANGES)
export const decisionDeliverableSchema = z.object({
  params: z.object({
    deliverableId: objectIdSchema,
  }),
  body: z.discriminatedUnion("decision", [
    z.object({
      decision: z.literal("APPROVE"),
      feedback: z.string().trim().max(1000).optional(),
    }),
    z.object({
      decision: z.literal("REQUEST_CHANGES"),
      feedback: z
        .string()
        .trim()
        .min(10, "Please provide detailed feedback (at least 10 characters) explaining requested changes.")
        .max(2000),
    }),
  ]),
});

export const getProjectDeliverablesSchema = z.object({
  params: z.object({
    projectId: objectIdSchema,
  }),
  query: z.object({
    status: z.enum(DELIVERABLE_STATUSES).optional(),
    priority: z.enum(DELIVERABLE_PRIORITIES).optional(),
    search: z.string().trim().optional(),
  }),
});

export const deliverableParamsSchema = z.object({
  params: z.object({
    deliverableId: objectIdSchema,
  }),
});

export type CreateDeliverableInput = z.infer<
  typeof createDeliverableSchema
>["body"];
export type MoveDeliverableInput = z.infer<
  typeof moveDeliverableSchema
>["body"];
export type DecisionDeliverableInput = z.infer<
  typeof decisionDeliverableSchema
>["body"];
export type GetProjectDeliverablesQuery = z.infer<
  typeof getProjectDeliverablesSchema
>["query"];
