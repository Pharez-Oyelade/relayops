import mongoose, { Types } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { UserModel } from "../user/user.model.js";
import { TenantModel, ITenant } from "../tenant/tenant.model.js";
import { MembershipModel } from "../tenant/membership.model.js";
import { RefreshTokenModel } from "./refreshToken.model.js";
import { RegisterInput, LoginInput } from "./auth.schema.js";
import { AppError } from "../../utils/AppError.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} from "../../utils/jwt.js";

export interface RequestMeta {
  ipAddress?: string;
  userAgent?: string;
}

export class AuthService {
  /* 
  Issues access token and refresh token and persists hashed refresh token
  */
  static async createSessionTokens(
    userId: Types.ObjectId,
    email: string,
    meta: RequestMeta,
    existingFamilyId?: string,
    session?: mongoose.ClientSession,
  ) {
    const familyId = existingFamilyId ?? crypto.randomUUID();
    const jti = crypto.randomUUID(); // unique identifier for the token

    const accessToken = signAccessToken({ sub: userId.toString(), email });
    const refreshToken = signRefreshToken({
      sub: userId.toString(),
      familyId,
      jti,
    });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await RefreshTokenModel.create(
      [
        {
          userId,
          tokenHash: hashToken(refreshToken),
          familyId,
          expiresAt,
          ...(meta.ipAddress !== undefined && { ipAddress: meta.ipAddress }),
          ...(meta.userAgent !== undefined && { userAgent: meta.userAgent }),
        },
      ],
      { ...(session !== undefined ? { session } : {}) },
    );

    return { accessToken, refreshToken };
  }

  /* Fetch all active memberships populated with Tenant */
  static async getUserWorkspaces(userId: Types.ObjectId) {
    const memberships = await MembershipModel.find({
      userId,
      status: "ACTIVE",
    })
      .populate<{ tenantId: ITenant }>("tenantId", "name slug plan settings")
      .lean();

    return memberships
      .filter((membership) => membership.tenantId)
      .map((membership) => ({
        tenantId: membership.tenantId._id.toString(),
        name: membership.tenantId.name,
        slug: membership.tenantId.slug,
        plan: membership.tenantId.plan,
        currency: membership.tenantId.settings.currency,
        role: membership.role,
      }));
  }

  /* Atomic Registration: Create User, tenant and owner membership in one transaction */
  static async register(input: RegisterInput, meta: RequestMeta) {
    const derivedSlug = (
      input.workspaceSlug ||
      input.workspaceName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    );
    const workspaceSlug = derivedSlug.length >= 3 ? derivedSlug : `${derivedSlug || "agency"}-os`;

    const [existingEmail, existingSlug] = await Promise.all([
      UserModel.exists({ email: input.email }),
      TenantModel.exists({ slug: workspaceSlug }),
    ]);

    if (existingEmail) {
      throw new AppError("Email already exists", 409, "EMAIL_TAKEN");
    }

    if (existingSlug) {
      throw new AppError(
        "Workspace slug already taken. Please choose another",
        409,
        "SLUG_TAKEN",
      );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const passwordHash = await bcrypt.hash(input.password, 12);

      // Create Tenant
      const [tenant] = await TenantModel.create(
        [
          {
            name: input.workspaceName,
            slug: workspaceSlug,
            plan: "FREE",
            settings: {
              currency: input.currency || "USD",
              invoicePrefix: workspaceSlug.slice(0, 3).toUpperCase(),
              maxProjects: 3,
            },
          },
        ],
        { session },
      );

      // create User (lastActiveTenantId points to new Tenant)
      const [user] = await UserModel.create(
        [
          {
            name: input.name,
            email: input.email,
            passwordHash,
            lastActiveTenantId: tenant._id,
          },
        ],
        { session },
      );

      // Create owner membership (linking user and tenant)
      await MembershipModel.create(
        [
          {
            tenantId: tenant._id,
            userId: user._id,
            role: "OWNER",
            status: "ACTIVE",
          },
        ],
        { session },
      );

      // issue session tokens in transaction
      const tokens = await this.createSessionTokens(
        user._id,
        user.email,
        meta,
        undefined,
        session,
      );

      await session.commitTransaction();

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          lastActiveTenantId: tenant._id.toString(),
        },
        workspaces: [
          {
            tenantId: tenant._id.toString(),
            name: tenant.name,
            slug: tenant.slug,
            plan: tenant.plan,
            currency: tenant.settings.currency,
            role: "OWNER" as const,
          },
        ],
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /* Login: validate credentials. load workspaces and issue tokens */
  static async login(input: LoginInput, meta: RequestMeta) {
    const user = await UserModel.findOne({ email: input.email }).select(
      "+passwordHash",
    );

    if (!user || !(await user.comparePassword(input.password))) {
      throw new AppError(
        "Invalid email or password",
        401,
        "INVALID_CREDENTIALS",
      );
    }

    const [workspaces, tokens] = await Promise.all([
      this.getUserWorkspaces(user._id),
      this.createSessionTokens(user._id, user.email, meta),
    ]);

    const defaultTenantId =
      user.lastActiveTenantId?.toString() ?? workspaces[0]?.tenantId ?? null;

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        lastActiveTenantId: defaultTenantId,
      },
      workspaces,
    };
  }

  /* Refresh token rotation with reuse detection */
  static async refresh(rawRefreshToken: string | undefined, meta: RequestMeta) {
    if (!rawRefreshToken) {
      throw new AppError("Missing refresh token", 401, "NO_REFRESH_TOKEN");
    }

    let payload;
    try {
      payload = verifyRefreshToken(rawRefreshToken);
    } catch {
      throw new AppError(
        "Invalid or expired refresh token",
        401,
        "INVALID_REFRESH_TOKEN",
      );
    }

    const incomingTokenHash = hashToken(rawRefreshToken);
    const storedToken = await RefreshTokenModel.findOne({
      tokenHash: incomingTokenHash,
    });

    if (!storedToken) {
      throw new AppError("Refresh session not found", 401, "SESSION_NOT_FOUND");
    }

    // Reuse Detection
    if (storedToken.isRevoked) {
      await RefreshTokenModel.updateMany(
        { familyId: storedToken.familyId },
        { $set: { isRevoked: true } },
      );
      throw new AppError(
        "Session revoked. Log in again",
        401,
        "TOKEN_REUSE_DETECTED",
      );
    }

    const user = await UserModel.findById(payload.sub);
    if (!user) {
      throw new AppError("User no longer exists", 401, "USER_NOT_FOUND");
    }

    // mark current token as revoked and issue a new one in the familyId
    storedToken.isRevoked = true;
    await storedToken.save();

    const [workspaces, tokens] = await Promise.all([
      this.getUserWorkspaces(user._id),
      this.createSessionTokens(
        user._id,
        user.email,
        meta,
        storedToken.familyId,
      ),
    ]);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        lastActiveTenantId: user.lastActiveTenantId?.toString() ?? null,
      },
      workspaces,
    };
  }

  /* Logout */
  static async logout(rawRefreshToken?: string): Promise<void> {
    if (!rawRefreshToken) return;

    const tokenHash = hashToken(rawRefreshToken);
    const storedToken = await RefreshTokenModel.findOne({ tokenHash });

    if (storedToken) {
      await RefreshTokenModel.updateMany(
        { familyId: storedToken.familyId },
        { $set: { isRevoked: true } },
      );
    }
  }

  /* Accept Workspace Invite via Token */
  static async acceptInvite(
    token: string,
    input: { name?: string; password?: string },
    meta: RequestMeta,
  ) {
    const inviteTokenHash = hashToken(token);
    const membership = await MembershipModel.findOne({
      inviteTokenHash,
    }).select("+inviteTokenHash");

    if (!membership) {
      throw new AppError(
        "Invalid or expired invitation token",
        400,
        "INVALID_INVITE_TOKEN",
      );
    }

    if (
      !membership.inviteTokenExpires ||
      membership.inviteTokenExpires < new Date()
    ) {
      throw new AppError(
        "Invitation token has expired. Please ask for a new invite.",
        400,
        "INVITE_EXPIRED",
      );
    }

    const user = await UserModel.findById(membership.userId).select("+passwordHash");
    if (!user) {
      throw new AppError("Invited user account not found", 404, "USER_NOT_FOUND");
    }

    if (!user.passwordHash && !input.password) {
      throw new AppError(
        "Password is required to complete your registration",
        400,
        "PASSWORD_REQUIRED",
      );
    }

    if (input.password) {
      user.passwordHash = await bcrypt.hash(input.password, 12);
    }

    if (input.name) {
      user.name = input.name;
    }

    user.lastActiveTenantId = membership.tenantId;
    await user.save();

    membership.status = "ACTIVE";
    membership.inviteTokenHash = undefined;
    membership.inviteTokenExpires = undefined;
    await membership.save();

    const [workspaces, tokens] = await Promise.all([
      this.getUserWorkspaces(user._id),
      this.createSessionTokens(user._id, user.email, meta),
    ]);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        lastActiveTenantId: user.lastActiveTenantId?.toString() ?? null,
      },
      workspaces,
    };
  }
}
