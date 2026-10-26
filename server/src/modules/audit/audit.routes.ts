import { Router } from "express";
import { AuditController } from "./audit.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  resolveTenant,
  authorize,
  tenantApiRateLimiter,
} from "../../middleware/tenant.middleware.js";

const router = Router();

// Audit logs require authentication, active workspace resolution, and OWNER/ADMIN role
router.use(authenticate, resolveTenant, tenantApiRateLimiter);

router.get("/", authorize("OWNER", "ADMIN"), AuditController.list);

export default router;
