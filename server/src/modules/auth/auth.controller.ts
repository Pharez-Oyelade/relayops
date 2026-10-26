import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AuthService } from "./auth.service.js";
import {
  REFRESH_COOKIE_NAME,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "../../utils/jwt.js";
import { UserModel } from "../user/user.model.js";
import { AppError } from "../../utils/AppError.js";

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.body, {
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    setRefreshTokenCookie(res, result.refreshToken);

    res.status(201).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user,
        workspaces: result.workspaces,
      },
    });
  });

  static login = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.body, {
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    setRefreshTokenCookie(res, result.refreshToken);

    res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user,
        workspaces: result.workspaces,
      },
    });
  });

  static refresh = asyncHandler(async (req: Request, res: Response) => {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    try {
      const result = await AuthService.refresh(rawRefreshToken, {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      setRefreshTokenCookie(res, result.refreshToken);

      res.status(200).json({
        success: true,
        data: {
          accessToken: result.accessToken,
          user: result.user,
          workspaces: result.workspaces,
        },
      });
    } catch (error) {
      clearRefreshTokenCookie(res);
      throw error;
    }
  });

  static logout = asyncHandler(async (req: Request, res: Response) => {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    await AuthService.logout(rawRefreshToken);

    res.status(200).json({
      success: true,
      data: {
        message: "Logged out successfully",
      },
    });
  });

  static me = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }

    const user = await UserModel.findById(req.user.id).lean();
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const workspaces = await AuthService.getUserWorkspaces(user._id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          lastActiveTenantId: user.lastActiveTenantId?.toString() ?? null,
        },
        workspaces,
      },
    });
  });

  static acceptInvite = asyncHandler(async (req: Request, res: Response) => {
    const token = req.params.token as string;
    const result = await AuthService.acceptInvite(
      token,
      req.body,
      {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
    );

    setRefreshTokenCookie(res, result.refreshToken);

    res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user,
        workspaces: result.workspaces,
      },
    });
  });
}
