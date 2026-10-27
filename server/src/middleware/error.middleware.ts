import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const fieldErrors = err.flatten().fieldErrors;
    const firstErrorMessage = Object.values(fieldErrors).flat()[0] as string | undefined;
    const message = firstErrorMessage || "Invalid request data";

    res.status(400).json({
      success: false,
      message,
      error: {
        code: "VALIDATION_ERROR",
        message,
        details: fieldErrors,
      },
    });
    return;
  }

  // Handle custom operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // Handle Mongoose duplicate key error (11000)
  if ("code" in err && (err as { code: number }).code === 11000) {
    res.status(409).json({
      success: false,
      message: "Resource already exists",
      error: {
        code: "DUPLICATE_RESOURCE",
        message: "Resource already exists",
      },
    });
    return;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
      error: {
        code: "INVALID_ID",
        message: `Invalid ${err.path}: ${err.value}`,
      },
    });
    return;
  }

  // Fallback for unhandled errors
  console.error("Unhandled error:", err);
  const fallbackMessage =
    env.NODE_ENV === "production"
      ? "An unexpected error occurred"
      : err.message;

  res.status(500).json({
    success: false,
    message: fallbackMessage,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: fallbackMessage,
    },
  });
};
