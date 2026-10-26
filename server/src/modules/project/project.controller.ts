import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ProjectService } from "./project.service.js";
import { AppError } from "../../utils/AppError.js";
import { ListProjectsQuery } from "./project.schema.js";

export class ProjectController {
  static list = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantContext || !req.user) {
      throw new AppError("Missing context", 500, "MISSING_CONTEXT");
    }

    const result = await ProjectService.listProjects(
      req.tenantContext.tenantId,
      req.tenantContext.role,
      req.user.id,
      req.query as unknown as ListProjectsQuery,
    );

    res.status(200).json({
      success: true,
      data: result.items,
      meta: result.meta,
    });
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantContext || !req.user) {
      throw new AppError("Missing context", 500, "MISSING_CONTEXT");
    }

    const projectId = req.params.projectId as string;
    const project = await ProjectService.getProjectById(
      req.tenantContext.tenantId,
      req.tenantContext.role,
      req.user.id,
      projectId,
    );

    res.status(200).json({
      success: true,
      data: project,
    });
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantContext || !req.user) {
      throw new AppError("Missing context", 500, "MISSING_CONTEXT");
    }

    const project = await ProjectService.createProject(
      req.tenantContext.tenantId,
      req.user.id,
      req.body,
    );

    res.status(201).json({
      success: true,
      data: project,
    });
  });

  static propose = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantContext || !req.user) {
      throw new AppError("Missing context", 500, "MISSING_CONTEXT");
    }

    const project = await ProjectService.proposeProject(
      req.tenantContext.tenantId,
      req.user.id,
      req.body,
    );

    res.status(201).json({
      success: true,
      data: project,
    });
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantContext || !req.user) {
      throw new AppError("Missing context", 500, "MISSING_CONTEXT");
    }

    const projectId = req.params.projectId as string;
    const project = await ProjectService.updateProject(
      req.tenantContext.tenantId,
      req.user.id,
      projectId,
      req.body,
    );

    res.status(200).json({
      success: true,
      data: project,
    });
  });
}
