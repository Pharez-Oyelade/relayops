import mongoose, { Types } from "mongoose";
import { InvoiceModel, IInvoice, InvoiceStatus } from "./invoice.model.js";
import { ProjectModel } from "../project/project.model.js";
import { TenantModel } from "../tenant/tenant.model.js";
import { UserModel } from "../user/user.model.js";
import { Role } from "../tenant/membership.model.js";
import { AuditService } from "../audit/audit.service.js";
import { PaystackService } from "../../services/paystack.service.js";
import { EmailService } from "../../services/email.service.js";
import { AppError } from "../../utils/AppError.js";
import {
  CreateInvoiceInput,
  ListInvoicesQuery,
} from "./invoice.schema.js";

export class InvoiceService {
  /**
   * Lists invoices with role-based scoping:
   * When `role === 'CLIENT_VIEWER'`:
   * 1. Suppresses all DRAFT invoices (`status: { $ne: 'DRAFT' }`)
   * 2. Restricts results strictly to projects where `clientUserIds` contains `userId`
   */
  static async listInvoices(
    tenantId: Types.ObjectId,
    role: Role,
    userId: string,
    query: ListInvoicesQuery,
  ) {
    const filter: Record<string, unknown> = { tenantId };

    // Row-level client scoping & draft suppression
    if (role === "CLIENT_VIEWER") {
      // Clients must never see drafts
      filter.status = { $ne: "DRAFT" };

      // Find all projects in active workspace assigned to this client
      const assignedProjects = await ProjectModel.find({
        tenantId,
        clientUserIds: new Types.ObjectId(userId),
      })
        .select("_id")
        .lean();

      const assignedProjectIds = assignedProjects.map((p) => p._id);
      filter.projectId = { $in: assignedProjectIds };

      // If client attempts to filter by DRAFT, return empty list
      if (query.status === "DRAFT") {
        return {
          items: [],
          meta: { page: query.page || 1, limit: query.limit || 20, total: 0, totalPages: 0 },
        };
      }
    }

    if (query.status && role !== "CLIENT_VIEWER") {
      filter.status = query.status;
    } else if (query.status && role === "CLIENT_VIEWER" && query.status !== "DRAFT") {
      filter.status = query.status;
    }

    if (query.projectId) {
      filter.projectId = new Types.ObjectId(query.projectId);
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      InvoiceModel.find(filter)
        .populate("projectId", "name key clientName")
        .populate("deliverableId", "code title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      InvoiceModel.countDocuments(filter),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves an invoice by ID with client draft suppression and project membership check.
   */
  static async getInvoiceById(
    tenantId: Types.ObjectId,
    role: Role,
    userId: string,
    invoiceId: string,
  ) {
    const invoice = await InvoiceModel.findOne({
      _id: new Types.ObjectId(invoiceId),
      tenantId,
    })
      .populate("projectId", "name key clientName clientUserIds")
      .populate("deliverableId", "code title")
      .lean();

    if (!invoice) {
      throw new AppError("Invoice not found in active workspace", 404, "INVOICE_NOT_FOUND");
    }

    // Role-based draft suppression and client check
    if (role === "CLIENT_VIEWER") {
      if (invoice.status === "DRAFT") {
        throw new AppError("Invoice not found in active workspace", 404, "INVOICE_NOT_FOUND");
      }

      const isAssigned = (invoice.projectId as any)?.clientUserIds?.some(
        (id: any) => id.toString() === userId,
      );

      if (!isAssigned) {
        throw new AppError("Invoice not found in active workspace", 404, "INVOICE_NOT_FOUND");
      }
    }

    return invoice;
  }

  /**
   * Creates a custom multi-line-item invoice with sequential numbering (e.g. INV-0001)
   */
  static async createInvoice(
    tenantId: Types.ObjectId,
    actorId: string,
    input: CreateInvoiceInput,
  ) {
    const project = await ProjectModel.findOne({
      _id: new Types.ObjectId(input.projectId),
      tenantId,
    });

    if (!project) {
      throw new AppError("Project not found in active workspace", 404, "PROJECT_NOT_FOUND");
    }

    const tenant = await TenantModel.findById(tenantId);
    if (!tenant) {
      throw new AppError("Workspace not found", 404, "TENANT_NOT_FOUND");
    }

    const currency = input.currency || tenant.settings.currency || "USD";
    const prefix = tenant.settings.invoicePrefix || "INV";

    // Sum line items (minor units)
    const totalAmount = input.lineItems.reduce(
      (sum, item) => sum + item.amount,
      0,
    );

    // Generate sequential invoice number
    const count = await InvoiceModel.countDocuments({ tenantId });
    let nextNum = count + 1;
    let candidateNumber = `${prefix}-${String(nextNum).padStart(4, "0")}`;

    while (await InvoiceModel.exists({ tenantId, invoiceNumber: candidateNumber })) {
      nextNum++;
      candidateNumber = `${prefix}-${String(nextNum).padStart(4, "0")}`;
    }

    const dueDate =
      input.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days default

    const invoice = await InvoiceModel.create({
      tenantId,
      projectId: project._id,
      deliverableId: input.deliverableId
        ? new Types.ObjectId(input.deliverableId)
        : undefined,
      invoiceNumber: candidateNumber,
      lineItems: input.lineItems,
      totalAmount,
      currency,
      status: input.status,
      dueDate,
    });

    await AuditService.logAction({
      tenantId,
      actorId,
      action: "INVOICE_CREATED",
      entityType: "INVOICE",
      entityId: invoice._id,
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount,
        currency: invoice.currency,
        status: invoice.status,
      },
    });

    // If initial status was set to SENT, dispatch email
    if (input.status === "SENT" && project.clientUserIds.length > 0) {
      const clientUser = await UserModel.findById(
        project.clientUserIds[0],
      ).lean();

      if (clientUser?.email) {
        await EmailService.sendInvoiceNotice({
          to: clientUser.email,
          workspaceName: tenant.name,
          clientName: project.clientName,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.totalAmount,
          currency: invoice.currency,
          deliverableTitle: `Project: ${project.name}`,
        });
      }
    }

    return invoice;
  }

  /**
   * Transitions invoice from DRAFT to SENT and emails a branded payment notice
   */
  static async sendInvoice(
    tenantId: Types.ObjectId,
    actorId: string,
    invoiceId: string,
  ) {
    const invoice = await InvoiceModel.findOne({
      _id: new Types.ObjectId(invoiceId),
      tenantId,
    });

    if (!invoice) {
      throw new AppError("Invoice not found in active workspace", 404, "INVOICE_NOT_FOUND");
    }

    if (invoice.status === "PAID") {
      throw new AppError("Invoice is already paid", 400, "INVOICE_ALREADY_PAID");
    }

    invoice.status = "SENT";
    await invoice.save();

    const [project, tenant] = await Promise.all([
      ProjectModel.findById(invoice.projectId).lean(),
      TenantModel.findById(tenantId).lean(),
    ]);

    if (project?.clientUserIds?.length && tenant) {
      const clientUser = await UserModel.findById(
        project.clientUserIds[0],
      ).lean();

      if (clientUser?.email) {
        await EmailService.sendInvoiceNotice({
          to: clientUser.email,
          workspaceName: tenant.name,
          clientName: project.clientName,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.totalAmount,
          currency: invoice.currency,
          deliverableTitle: `Engagement: ${project.name}`,
        });
      }
    }

    await AuditService.logAction({
      tenantId,
      actorId,
      action: "INVOICE_SENT",
      entityType: "INVOICE",
      entityId: invoice._id,
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount,
      },
    });

    return invoice;
  }

  /**
   * Client-side Paystack verification endpoint:
   * Called immediately when PaystackPop modal completes in the frontend for 0ms UI feedback.
   */
  static async verifyPaystackPayment(
    tenantId: Types.ObjectId,
    actorId: string,
    invoiceId: string,
    reference: string,
  ) {
    const invoice = await InvoiceModel.findOne({
      _id: new Types.ObjectId(invoiceId),
      tenantId,
    });

    if (!invoice) {
      throw new AppError("Invoice not found in active workspace", 404, "INVOICE_NOT_FOUND");
    }

    // Idempotency: if already paid, return success immediately
    if (invoice.status === "PAID") {
      return {
        message: "Invoice is already paid",
        invoice,
        paid: true,
      };
    }

    // Reference collision guard
    const existingPayment = await InvoiceModel.findOne({
      paystackRef: reference,
    }).lean();

    if (
      existingPayment &&
      existingPayment._id.toString() !== invoice._id.toString()
    ) {
      throw new AppError(
        "This Paystack reference has already been claimed for another transaction.",
        409,
        "DUPLICATE_PAYMENT_REF",
      );
    }

    // Authoritative verification via Paystack REST API
    const verifyRes = await PaystackService.verifyTransaction(reference);

    if (verifyRes.data.status !== "success") {
      throw new AppError(
        `Payment verification failed: ${verifyRes.data.gateway_response}`,
        400,
        "PAYMENT_NOT_SUCCESSFUL",
      );
    }

    // Verify amount match in minor units
    if (verifyRes.data.amount < invoice.totalAmount) {
      throw new AppError(
        "Paid amount is less than the invoice total amount",
        400,
        "AMOUNT_MISMATCH",
      );
    }

    invoice.status = "PAID";
    invoice.paidAt = verifyRes.data.paid_at
      ? new Date(verifyRes.data.paid_at)
      : new Date();
    invoice.paystackRef = reference;
    await invoice.save();

    await AuditService.logAction({
      tenantId,
      actorId,
      action: "INVOICE_PAID",
      entityType: "INVOICE",
      entityId: invoice._id,
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount,
        reference,
        channel: verifyRes.data.channel,
      },
    });

    // Send payment receipt email
    const [project, tenant] = await Promise.all([
      ProjectModel.findById(invoice.projectId).lean(),
      TenantModel.findById(tenantId).lean(),
    ]);

    if (project && tenant) {
      const clientEmail =
        verifyRes.data.customer?.email ||
        (project.clientUserIds.length > 0
          ? (await UserModel.findById(project.clientUserIds[0]).lean())?.email
          : null);

      if (clientEmail) {
        await EmailService.sendPaymentReceipt({
          to: clientEmail,
          workspaceName: tenant.name,
          clientName: project.clientName,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.totalAmount,
          currency: invoice.currency,
          paymentReference: reference,
        });
      }
    }

    return {
      message: "Payment successfully verified and invoice marked as PAID",
      invoice,
      paid: true,
    };
  }

  /**
   * Authoritative Paystack HMAC SHA-512 Webhook Engine:
   * Handles server-to-server confirmation with raw buffer verification and idempotency guards.
   */
  static async handlePaystackWebhook(
    rawBody: Buffer | string,
    signature: string | undefined,
    payload: any,
  ) {
    const isValid = PaystackService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      throw new AppError(
        "Invalid Paystack HMAC SHA-512 signature",
        400,
        "INVALID_SIGNATURE",
      );
    }

    // Only process charge.success events
    if (payload?.event !== "charge.success") {
      return { received: true, ignored: true, event: payload?.event };
    }

    const { reference, metadata } = payload.data || {};
    const invoiceId = metadata?.invoiceId;

    let invoice = null;

    if (reference) {
      invoice = await InvoiceModel.findOne({ paystackRef: reference });
    }

    if (!invoice && invoiceId && mongoose.Types.ObjectId.isValid(invoiceId)) {
      invoice = await InvoiceModel.findById(invoiceId);
    }

    if (!invoice) {
      return {
        received: true,
        message: "No matching invoice found for webhook event",
      };
    }

    // Idempotency guard: ignore duplicate deliveries
    if (invoice.status === "PAID") {
      return { received: true, message: "Invoice already marked as PAID" };
    }

    invoice.status = "PAID";
    invoice.paidAt = payload.data.paid_at
      ? new Date(payload.data.paid_at)
      : new Date();
    invoice.paystackRef = reference || invoice.paystackRef;
    await invoice.save();

    await AuditService.logAction({
      tenantId: invoice.tenantId,
      actorId: invoice.tenantId, // system actor
      action: "INVOICE_PAID",
      entityType: "INVOICE",
      entityId: invoice._id,
      metadata: {
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount,
        reference,
        webhook: true,
      },
    });

    // Send receipt email
    const [project, tenant] = await Promise.all([
      ProjectModel.findById(invoice.projectId).lean(),
      TenantModel.findById(invoice.tenantId).lean(),
    ]);

    if (project && tenant) {
      const recipientEmail =
        payload.data.customer?.email ||
        (project.clientUserIds.length > 0
          ? (await UserModel.findById(project.clientUserIds[0]).lean())?.email
          : null);

      if (recipientEmail) {
        await EmailService.sendPaymentReceipt({
          to: recipientEmail,
          workspaceName: tenant.name,
          clientName: project.clientName,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.totalAmount,
          currency: invoice.currency,
          paymentReference: reference || "N/A",
        });
      }
    }

    return { received: true, processed: true, invoiceNumber: invoice.invoiceNumber };
  }
}
