import { Router } from "express";
import { TenantController } from "./tenant.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  resolveTenant,
  authorize,
  tenantApiRateLimiter,
} from "../../middleware/tenant.middleware.js";
import { validateRequest } from "../../middleware/validate.middleware.js";
import {
  createTenantSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from "./tenant.schema.js";

const router = Router();

// Global user routes (authenticated, not scoped to a specific tenant)
router.use(authenticate);

router.get("/my-workspaces", TenantController.getMyWorkspaces);
router.post(
  "/",
  validateRequest(createTenantSchema),
  TenantController.create,
);

// Workspace-scoped routes (require active workspace context header: x-tenant-id)
router.use(resolveTenant, tenantApiRateLimiter);

router.get(
  "/members",
  authorize("OWNER", "ADMIN", "MEMBER"),
  TenantController.getMembers,
);

router.post(
  "/members/invite",
  authorize("OWNER", "ADMIN"),
  validateRequest(inviteMemberSchema),
  TenantController.inviteMember,
);

router.patch(
  "/members/:membershipId/role",
  authorize("OWNER", "ADMIN"),
  validateRequest(updateMemberRoleSchema),
  TenantController.updateMemberRole,
);

export default router;
