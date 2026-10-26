import { Router } from "express";
import { LeadController } from "./lead.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  resolveTenant,
  authorize,
  tenantApiRateLimiter,
} from "../../middleware/tenant.middleware.js";
import { publicLeadRateLimiter } from "../../middleware/rateLimiter.middleware.js";
import { validateRequest } from "../../middleware/validate.middleware.js";
import {
  publicLeadSchema,
  updateLeadSchema,
  listLeadsSchema,
  convertLeadSchema,
} from "./lead.schema.js";

const router = Router();

// 1. Inbound Public Lead Capture Route (No Auth, Slug-scoped, Rate Limited)
router.post(
  "/public/:tenantSlug",
  publicLeadRateLimiter,
  validateRequest(publicLeadSchema),
  LeadController.capturePublic,
);

// 2. Workspace CRM Management Routes (Require Auth, Active Workspace & Admin Role)
router.use(authenticate, resolveTenant, tenantApiRateLimiter);

router.get(
  "/",
  authorize("OWNER", "ADMIN"),
  validateRequest(listLeadsSchema),
  LeadController.list,
);

router.get(
  "/:leadId",
  authorize("OWNER", "ADMIN"),
  LeadController.getById,
);

router.patch(
  "/:leadId",
  authorize("OWNER", "ADMIN"),
  validateRequest(updateLeadSchema),
  LeadController.update,
);

router.post(
  "/:leadId/convert",
  authorize("OWNER", "ADMIN"),
  validateRequest(convertLeadSchema),
  LeadController.convert,
);

export default router;
