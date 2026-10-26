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
import auditRoutes from "./modules/audit/audit.routes.js";
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
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp());

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tenants", tenantRoutes);
app.use("/api/v1/leads", leadRoutes);
app.use("/api/v1/audit-logs", auditRoutes);

// Centralized Error Handling Middleware
app.use(errorHandler);
