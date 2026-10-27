import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { InvoiceService } from "./invoice.service.js";
import { AppError } from "../../utils/AppError.js";
import { ListInvoicesQuery } from "./invoice.schema.js";

export class InvoiceController {
  static list = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantContext || !req.user) {
      throw new AppError("Missing context", 500, "MISSING_CONTEXT");
    }

    const result = await InvoiceService.listInvoices(
      req.tenantContext.tenantId,
      req.tenantContext.role,
      req.user.id,
      req.query as unknown as ListInvoicesQuery,
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

    const invoiceId = req.params.invoiceId as string;
    const invoice = await InvoiceService.getInvoiceById(
      req.tenantContext.tenantId,
      req.tenantContext.role,
      req.user.id,
      invoiceId,
    );

    res.status(200).json({
      success: true,
      data: invoice,
    });
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantContext || !req.user) {
      throw new AppError("Missing context", 500, "MISSING_CONTEXT");
    }

    const invoice = await InvoiceService.createInvoice(
      req.tenantContext.tenantId,
      req.user.id,
      req.body,
    );

    res.status(201).json({
      success: true,
      data: invoice,
    });
  });

  static send = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantContext || !req.user) {
      throw new AppError("Missing context", 500, "MISSING_CONTEXT");
    }

    const invoiceId = req.params.invoiceId as string;
    const invoice = await InvoiceService.sendInvoice(
      req.tenantContext.tenantId,
      req.user.id,
      invoiceId,
    );

    res.status(200).json({
      success: true,
      message: "Invoice sent to client successfully",
      data: invoice,
    });
  });

  static verifyPaystack = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenantContext || !req.user) {
      throw new AppError("Missing context", 500, "MISSING_CONTEXT");
    }

    const invoiceId = req.params.invoiceId as string;
    const result = await InvoiceService.verifyPaystackPayment(
      req.tenantContext.tenantId,
      req.user.id,
      invoiceId,
      req.body.reference,
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  static webhook = asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers["x-paystack-signature"] as string | undefined;
    const rawBody = req.rawBody || JSON.stringify(req.body);

    const result = await InvoiceService.handlePaystackWebhook(
      rawBody,
      signature,
      req.body,
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  });
}
