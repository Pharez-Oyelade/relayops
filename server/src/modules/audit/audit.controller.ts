import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AuditService } from "./audit.service.js";
import { AppError } from "../../utils/AppError.js";
import { AuditEntityType } from "./audit.model.js";

export class AuditController {
  static list = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantContext) {
      throw new AppError("Missing tenant context", 500, "MISSING_TENANT_CONTEXT");
    }

    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;
    const entityType = req.query.entityType as AuditEntityType | undefined;

    const result = await AuditService.listAuditLogs(req.tenantContext.tenantId, {
      page,
      limit,
      entityType,
    });

    res.status(200).json({
      success: true,
      data: result.items,
      meta: result.meta,
    });
  });
}
