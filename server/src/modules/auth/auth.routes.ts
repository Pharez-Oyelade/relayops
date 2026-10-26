import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { registerSchema, loginSchema } from "./auth.schema.js";
import { acceptInviteSchema } from "../tenant/tenant.schema.js";
import { authRateLimiter } from "../../middleware/rateLimiter.middleware.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/register",
  authRateLimiter,
  validateRequest(registerSchema),
  AuthController.register,
);

router.post(
  "/login",
  authRateLimiter,
  validateRequest(loginSchema),
  AuthController.login,
);

router.post(
  "/invite/:token/accept",
  authRateLimiter,
  validateRequest(acceptInviteSchema),
  AuthController.acceptInvite,
);

router.post("/refresh", AuthController.refresh);
router.post("/logout", AuthController.logout);
router.get("/me", authenticate, AuthController.me);

export default router;
