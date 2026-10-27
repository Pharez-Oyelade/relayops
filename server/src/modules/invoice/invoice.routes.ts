import { Router } from "express";
import { InvoiceController } from "./invoice.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import {
  resolveTenant,
  authorize,
  tenantApiRateLimiter,
} from "../../middleware/tenant.middleware.js";
import { validateRequest } from "../../middleware/validate.middleware.js";
import {
  createInvoiceSchema,
  verifyPaystackSchema,
  invoiceParamsSchema,
  listInvoicesSchema,
} from "./invoice.schema.js";

const router = Router();

// Workspace-scoped routes require auth, tenant context resolution, and rate limiter
router.use(authenticate, resolveTenant, tenantApiRateLimiter);

// 1. List invoices (Row-level client scoping & draft suppression enforced in service)
router.get("/", validateRequest(listInvoicesSchema), InvoiceController.list);

// 2. Invoice details
router.get(
  "/:invoiceId",
  validateRequest(invoiceParamsSchema),
  InvoiceController.getById,
);

// 3. Create invoice (OWNER & ADMIN only)
router.post(
  "/",
  authorize("OWNER", "ADMIN"),
  validateRequest(createInvoiceSchema),
  InvoiceController.create,
);

// 4. Send invoice notice to client (OWNER & ADMIN only)
router.post(
  "/:invoiceId/send",
  authorize("OWNER", "ADMIN"),
  validateRequest(invoiceParamsSchema),
  InvoiceController.send,
);

// 5. Verify inline Paystack payment (CLIENT_VIEWER, OWNER, ADMIN, MEMBER)
router.post(
  "/:invoiceId/verify-paystack",
  validateRequest(verifyPaystackSchema),
  InvoiceController.verifyPaystack,
);

export default router;
