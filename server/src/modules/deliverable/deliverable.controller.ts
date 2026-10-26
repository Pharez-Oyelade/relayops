import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { DeliverableService } from "./deliverable.service.js";
import { AppError } from "../../utils/AppError.js";
import { GetProjectDeliverablesQuery } from "./deliverable.schema.js";

export class DeliverableController {
  static getProjectDeliverables = asyncHandler(
    async (req: Request, res: Response) => {
      if (!req.tenantContext || !req.user) {
        throw new AppError("Missing context", 500, "MISSING_CONTEXT");
      }

      const projectId = req.params.projectId as string;
      const deliverables = await DeliverableService.getProjectDeliverables(
        req.tenantContext.tenantId,
        req.tenantContext.role,
        req.user.id,
        projectId,
        req.query as unknown as GetProjectDeliverablesQuery,
      );

      res.status(200).json({
        success: true,
        data: deliverables,
      });
    },
  );

  static getById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantContext || !req.user) {
      throw new AppError("Missing context", 500, "MISSING_CONTEXT");
    }

    const deliverableId = req.params.deliverableId as string;
    const deliverable = await DeliverableService.getDeliverableById(
      req.tenantContext.tenantId,
      req.tenantContext.role,
      req.user.id,
      deliverableId,
    );

    res.status(200).json({
      success: true,
      data: deliverable,
    });
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantContext || !req.user) {
      throw new AppError("Missing context", 500, "MISSING_CONTEXT");
    }

    const projectId = req.params.projectId as string;
    const deliverable = await DeliverableService.createDeliverable(
      req.tenantContext.tenantId,
      req.user.id,
      projectId,
      req.body,
    );

    res.status(201).json({
      success: true,
      data: deliverable,
    });
  });

  static uploadAsset = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantContext || !req.user) {
      throw new AppError("Missing context", 500, "MISSING_CONTEXT");
    }

    if (!req.file) {
      throw new AppError("File is required for asset upload", 400, "FILE_REQUIRED");
    }

    const deliverableId = req.params.deliverableId as string;
    const deliverable = await DeliverableService.uploadAsset(
      req.tenantContext.tenantId,
      req.user.id,
      deliverableId,
      req.file,
    );

    res.status(200).json({
      success: true,
      data: deliverable,
    });
  });

  static move = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantContext || !req.user) {
      throw new AppError("Missing context", 500, "MISSING_CONTEXT");
    }

    const deliverableId = req.params.deliverableId as string;
    const deliverable = await DeliverableService.moveDeliverable(
      req.tenantContext.tenantId,
      req.user.id,
      deliverableId,
      req.body,
    );

    res.status(200).json({
      success: true,
      data: deliverable,
    });
  });

  static decision = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantContext || !req.user) {
      throw new AppError("Missing context", 500, "MISSING_CONTEXT");
    }

    const deliverableId = req.params.deliverableId as string;
    const result = await DeliverableService.submitDecision(
      req.tenantContext.tenantId,
      req.tenantContext.role,
      req.user.id,
      deliverableId,
      req.body,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  });
}
