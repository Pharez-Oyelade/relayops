import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { LeadService } from "./lead.service.js";
import { AppError } from "../../utils/AppError.js";
import { ListLeadsQuery } from "./lead.schema.js";

export class LeadController {
  static capturePublic = asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.params.tenantSlug as string;
    const lead = await LeadService.capturePublicLead(tenantSlug, req.body);

    res.status(201).json({
      success: true,
      data: {
        message: "Thank you for reaching out. We will get back to you shortly.",
        leadId: lead._id.toString(),
      },
    });
  });

  static list = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantContext) {
      throw new AppError("Missing tenant context", 500, "MISSING_TENANT_CONTEXT");
    }

    const leads = await LeadService.listLeads(
      req.tenantContext.tenantId,
      req.query as unknown as ListLeadsQuery,
    );

    res.status(200).json({
      success: true,
      data: leads,
    });
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantContext) {
      throw new AppError("Missing tenant context", 500, "MISSING_TENANT_CONTEXT");
    }

    const leadId = req.params.leadId as string;
    const lead = await LeadService.getLeadById(
      req.tenantContext.tenantId,
      leadId,
    );

    res.status(200).json({
      success: true,
      data: lead,
    });
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantContext) {
      throw new AppError("Missing tenant context", 500, "MISSING_TENANT_CONTEXT");
    }

    const leadId = req.params.leadId as string;
    const updated = await LeadService.updateLead(
      req.tenantContext.tenantId,
      leadId,
      req.body,
    );

    res.status(200).json({
      success: true,
      data: updated,
    });
  });

  static convert = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantContext || !req.user) {
      throw new AppError("Missing context", 500, "MISSING_CONTEXT");
    }

    const leadId = req.params.leadId as string;
    const result = await LeadService.convertLeadToClient(
      req.tenantContext.tenantId,
      req.user.id,
      leadId,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  });
}
