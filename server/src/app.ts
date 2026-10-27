import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import { env } from "./config/env.js";
import authRoutes from "./modules/auth/auth.routes.js";
import tenantRoutes from "./modules/tenant/tenant.routes.js";
import leadRoutes from "./modules/lead/lead.routes.js";
import projectRoutes from "./modules/project/project.routes.js";
import deliverableRoutes from "./modules/deliverable/deliverable.routes.js";
import invoiceRoutes from "./modules/invoice/invoice.routes.js";
import auditRoutes from "./modules/audit/audit.routes.js";
import { InvoiceController } from "./modules/invoice/invoice.controller.js";
import { errorHandler } from "./middleware/error.middleware.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-tenant-id"],
  }),
);
app.use(
  express.json({
    limit: "10kb",
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Express 5 compatible mongo sanitization (avoids direct re-assignment of read-only req.query getter)
app.use((req, _res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.query) {
    for (const key of Object.keys(req.query)) {
      const val = req.query[key];
      if (val && typeof val === "object") {
        mongoSanitize.sanitize(val as any);
      }
    }
  }
  next();
});
app.use(hpp());

// Paystack Webhook (Public, signature-verified via HMAC SHA-512)
app.post("/api/v1/webhooks/paystack", InvoiceController.webhook);

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tenants", tenantRoutes);
app.use("/api/v1/leads", leadRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/deliverables", deliverableRoutes);
app.use("/api/v1/invoices", invoiceRoutes);
app.use("/api/v1/audit-logs", auditRoutes);

// Centralized Error Handling Middleware
app.use(errorHandler);

