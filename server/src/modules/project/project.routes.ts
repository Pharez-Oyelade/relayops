import { Router } from "express";
import { ProjectController } from "./project.controller.js";
import { DeliverableController } from "../deliverable/deliverable.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  resolveTenant,
  authorize,
  tenantApiRateLimiter,
} from "../../middleware/tenant.middleware.js";
import { validateRequest } from "../../middleware/validate.middleware.js";
import {
  createProjectSchema,
  proposeProjectSchema,
  updateProjectSchema,
  getProjectParamsSchema,
  listProjectsSchema,
} from "./project.schema.js";
import {
  getProjectDeliverablesSchema,
  createDeliverableSchema,
} from "../deliverable/deliverable.schema.js";

const router = Router();

// All project routes require authentication, valid workspace membership, and tenant rate limiting
router.use(authenticate, resolveTenant, tenantApiRateLimiter);

router
  .route("/")
  .get(validateRequest(listProjectsSchema), ProjectController.list)
  .post(
    authorize("OWNER", "ADMIN"),
    validateRequest(createProjectSchema),
    ProjectController.create,
  );

router.post(
  "/propose",
  authorize("CLIENT_VIEWER", "OWNER", "ADMIN"),
  validateRequest(proposeProjectSchema),
  ProjectController.propose,
);

router
  .route("/:projectId")
  .get(validateRequest(getProjectParamsSchema), ProjectController.getById)
  .patch(
    authorize("OWNER", "ADMIN"),
    validateRequest(updateProjectSchema),
    ProjectController.update,
  );

// Nested deliverables for project: GET & POST /api/v1/projects/:projectId/deliverables
router
  .route("/:projectId/deliverables")
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
