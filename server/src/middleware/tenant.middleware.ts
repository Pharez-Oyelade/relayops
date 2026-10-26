import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import { MembershipModel, Role } from "../modules/tenant/membership.model.js";
import { TenantModel } from "../modules/tenant/tenant.model.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Resolves the tenant context from the `x-tenant-id` request header.
 * Ensures the authenticated user has an ACTIVE membership in the requested workspace.
 */
export const resolveTenant = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const rawTenantId = req.headers["x-tenant-id"];

    if (!rawTenantId || typeof rawTenantId !== "string") {
      throw new AppError(
        "Workspace context required. Provide x-tenant-id header.",
        400,
        "MISSING_TENANT_CONTEXT",
      );
    }

    if (!mongoose.Types.ObjectId.isValid(rawTenantId)) {
      throw new AppError("Malformed x-tenant-id header", 400, "INVALID_TENANT_ID");
    }

    if (!req.user) {
      throw new AppError(
        "User must be authenticated before resolving tenant",
        401,
        "UNAUTHORIZED",
      );
    }

    const tenantObjectId = new mongoose.Types.ObjectId(rawTenantId);

    // Parallel lookup of membership and tenant
    const [membership, tenant] = await Promise.all([
      MembershipModel.findOne({
        tenantId: tenantObjectId,
        userId: new mongoose.Types.ObjectId(req.user.id),
        status: "ACTIVE",
      }).lean(),
      TenantModel.findById(tenantObjectId).select("plan").lean(),
    ]);

    if (!membership || !tenant) {
      throw new AppError(
        "You do not have access to this workspace.",
        403,
        "TENANT_ACCESS_DENIED",
      );
    }

    req.tenantContext = {
      tenantId: tenantObjectId,
      role: membership.role,
      plan: tenant.plan,
    };

    next();
  },
);

/**
 * Role-Based Access Control (RBAC) factory middleware.
 * Verifies that the user's role in the active tenant matches at least one allowed role.
 */
export const authorize = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.tenantContext) {
      throw new AppError(
        "Tenant context not initialized",
        500,
        "MISSING_TENANT_CONTEXT",
      );
    }

    if (!allowedRoles.includes(req.tenantContext.role)) {
      throw new AppError(
        `Insufficient permissions. Required role: ${allowedRoles.join(" or ")}`,
        403,
        "INSUFFICIENT_PERMISSIONS",
      );
    }

    next();
  };
};

/**
 * Plan-tiered API rate limiter.
 * Partitions limits by (tenantId + userId) and scales ceiling based on workspace subscription plan.
 */
export const tenantApiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: (req: Request) => {
    const plan = req.tenantContext?.plan;
    if (plan === "ENTERPRISE") return 1000;
    if (plan === "PRO") return 300;
    return 60; // Default FREE tier limit
  },
  keyGenerator: (req: Request) => {
    const tenantId = req.tenantContext?.tenantId.toString() ?? "anon-tenant";
    const userId = req.user?.id ?? req.ip ?? "anon-user";
    return `${tenantId}:${userId}`;
  },
  standardHeaders: true,
  legacyHeaders: false,
});
