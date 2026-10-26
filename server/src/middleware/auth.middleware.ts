import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

interface AccessTokenPayload {
  sub: string;
  email: string;
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Authentication token missing", 401, "UNAUTHORIZED");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      env.JWT_ACCESS_SECRET,
    ) as AccessTokenPayload;
    req.user = {
      id: decoded.sub,
      email: decoded.email,
    };
    next();
  } catch {
    throw new AppError("Invalid or expired access token", 401, "TOKEN_EXPIRED");
  }
};
