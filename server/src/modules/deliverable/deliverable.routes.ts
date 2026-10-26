import { Router } from "express";
import { DeliverableController } from "./deliverable.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  resolveTenant,
  authorize,
  tenantApiRateLimiter,
} from "../../middleware/tenant.middleware.js";
import { uploadDeliverableAsset } from "../../middleware/upload.middleware.js";
import { validateRequest } from "../../middleware/validate.middleware.js";
import {
  moveDeliverableSchema,
  decisionDeliverableSchema,
  deliverableParamsSchema,
  getProjectDeliverablesSchema,
  createDeliverableSchema,
} from "./deliverable.schema.js";

const router = Router();

// All deliverable routes require authentication, active workspace resolution, and tenant rate limiting
router.use(authenticate, resolveTenant, tenantApiRateLimiter);

// 1. Deliverable Detail & Inspection
router.get(
  "/:deliverableId",
  validateRequest(deliverableParamsSchema),
  DeliverableController.getById,
);

// 2. Cloudinary Asset Upload Pipeline
router.post(
  "/:deliverableId/assets",
  authorize("OWNER", "ADMIN", "MEMBER"),
  uploadDeliverableAsset.single("file"),
  DeliverableController.uploadAsset,
);

// 3. Kanban Drag-and-Drop Movement
router.patch(
  "/:deliverableId/move",
  authorize("OWNER", "ADMIN", "MEMBER"),
  validateRequest(moveDeliverableSchema),
  DeliverableController.move,
);

// 4. Client & Admin Sign-Off Review Decision (Approve vs Request Changes)
router.post(
  "/:deliverableId/decision",
  authorize("OWNER", "ADMIN", "CLIENT_VIEWER"),
  validateRequest(decisionDeliverableSchema),
  DeliverableController.decision,
);

// Optional helper route for direct /api/v1/deliverables/projects/:projectId access
router
  .route("/projects/:projectId")
  .get(
    validateRequest(getProjectDeliverablesSchema),
    DeliverableController.getProjectDeliverables,
  )
  .post(
    authorize("OWNER", "ADMIN", "MEMBER"),
    validateRequest(createDeliverableSchema),
    DeliverableController.create,
  );

export default router;
