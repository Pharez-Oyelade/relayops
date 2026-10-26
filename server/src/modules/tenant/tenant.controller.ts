import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { TenantService } from "./tenant.service.js";
import { AppError } from "../../utils/AppError.js";

export class TenantController {
  static create = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }

    const tenant = await TenantService.createTenant(req.user.id, req.body);

    res.status(201).json({
      success: true,
      data: tenant,
    });
  });

  static getMyWorkspaces = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }

    const workspaces = await TenantService.getWorkspaces(req.user.id);

    res.status(200).json({
      success: true,
      data: workspaces,
    });
  });

  static getMembers = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantContext) {
      throw new AppError("Missing tenant context", 500, "MISSING_TENANT_CONTEXT");
    }

    const members = await TenantService.getMembers(req.tenantContext.tenantId);

    res.status(200).json({
      success: true,
      data: members,
    });
  });

  static inviteMember = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantContext || !req.user) {
      throw new AppError("Missing context", 500, "MISSING_CONTEXT");
    }

    const result = await TenantService.inviteMember(
      req.tenantContext.tenantId,
      req.user.id,
      req.body,
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  });

  static updateMemberRole = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantContext) {
      throw new AppError("Missing tenant context", 500, "MISSING_TENANT_CONTEXT");
    }

    const membershipId = req.params.membershipId as string;
    const updated = await TenantService.updateMemberRole(
      req.tenantContext.tenantId,
      membershipId,
      req.body,
    );

    res.status(200).json({
      success: true,
      data: updated,
    });
  });
}
