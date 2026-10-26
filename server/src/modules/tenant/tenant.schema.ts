import { z } from "zod";
import { ROLES, MEMBERSHIP_STATUSES } from "./membership.model.js";
import { CURRENCIES } from "./tenant.model.js";

export const createTenantSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Workspace name must be at least 2 characters")
      .max(100),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(2, "Workspace slug must be at least 2 characters")
      .max(50)
      .regex(
        /^[a-z0-9-]+$/,
        "Slug can only contain lowercase letters, numbers, and hyphens",
      ),
    currency: z.enum(CURRENCIES).default("USD"),
  }),
});

export const inviteMemberSchema = z.object({
  body: z
    .object({
      email: z.string().trim().toLowerCase().email("Invalid email address"),
      role: z.enum(ROLES),
      clientCompany: z.string().trim().optional(),
    })
    .refine(
      (data) => {
        if (data.role === "CLIENT_VIEWER" && !data.clientCompany) {
          return false;
        }
        return true;
      },
      {
        message: "clientCompany is required when role is CLIENT_VIEWER",
        path: ["clientCompany"],
      },
    ),
});

export const updateMemberRoleSchema = z.object({
  params: z.object({
    membershipId: z.string().min(1, "Membership ID is required"),
  }),
  body: z.object({
    role: z.enum(ROLES).optional(),
    status: z.enum(MEMBERSHIP_STATUSES).optional(),
  }),
});

export const acceptInviteSchema = z.object({
  params: z.object({
    token: z.string().min(10, "Invalid invitation token"),
  }),
  body: z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .optional(),
  }),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>["body"];
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>["body"];
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>["body"];
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>["body"];
