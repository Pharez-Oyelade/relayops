import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Response } from "express";
import { env } from "../config/env.js";

export interface AccessTokenPayload {
  sub: string;
  email: string;
}

export interface RefreshTokenPayload {
  sub: string;
  familyId: string;
  jti: string; // unique identifier for the token
}

export const REFRESH_COOKIE_NAME = "relayops_rt";

export const signAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as NonNullable<
      jwt.SignOptions["expiresIn"]
    >,
  });
};

export const signRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as NonNullable<
      jwt.SignOptions["expiresIn"]
    >,
  });
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
};

// Hash refresh token before storing in DB
export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// Attach refresh token to HTTP-only cookie
export const setRefreshTokenCookie = (
  res: Response,
  refreshToken: string,
): void => {
  const isProd = env.NODE_ENV === "production";

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/api/v1/auth", //only send cookie to auth endpoints minimizing exposure
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  const isProd = env.NODE_ENV === "production";

  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/api/v1/auth",
  });
};
