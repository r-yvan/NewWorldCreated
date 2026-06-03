import type { User } from "@prisma/client";
import { authRepository } from "./auth.repository";
import { hashPassword, comparePassword } from "../../utils/password";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  durationToMs,
} from "../../utils/jwt";
import { generateOpaqueToken } from "../../utils/token";
import { env } from "../../config/env";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../../shared/errors";
import { recordAudit } from "../../shared/audit";
import { logger } from "../../shared/logger";
import type { RegisterInput, LoginInput } from "./auth.validation";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function toPublicUser(user: User): PublicUser {
  const { passwordHash, ...rest } = user;
  return rest;
}

async function issueTokens(user: User): Promise<AuthTokens> {
  const payload = { sub: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const expiresAt = new Date(
    Date.now() + durationToMs(env.jwt.refreshExpiresIn)
  );
  await authRepository.createRefreshToken({
    token: refreshToken,
    userId: user.id,
    expiresAt,
  });
  return { accessToken, refreshToken };
}

export const authService = {
  async register(
    input: RegisterInput
  ): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw new ConflictError("An account with this email already exists");
    }
    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.createUser({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
    });
    const tokens = await issueTokens(user);
    await recordAudit({
      userId: user.id,
      action: "USER_REGISTERED",
      entity: "User",
      entityId: user.id,
      metadata: { email: user.email },
    });
    logger.info("User registered", { userId: user.id, email: user.email });
    return { user: toPublicUser(user), tokens };
  },

  async login(
    input: LoginInput
  ): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }
    if (!user.isActive) {
      throw new UnauthorizedError("Account is deactivated");
    }
    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Invalid email or password");
    }
    const tokens = await issueTokens(user);
    await recordAudit({
      userId: user.id,
      action: "USER_LOGIN",
      entity: "User",
      entityId: user.id,
    });
    logger.info("User logged in", { userId: user.id });
    return { user: toPublicUser(user), tokens };
  },

  async logout(refreshToken: string, userId?: string): Promise<void> {
    await authRepository.revokeRefreshToken(refreshToken);
    await recordAudit({
      userId: userId ?? null,
      action: "USER_LOGOUT",
      entity: "User",
      entityId: userId ?? null,
    });
  },

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }
    const stored = await authRepository.findRefreshToken(refreshToken);
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw new UnauthorizedError("Refresh token is no longer valid");
    }
    const user = await authRepository.findUserById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedError("User no longer active");
    }
    // Rotate: revoke old token, issue a new pair.
    await authRepository.revokeRefreshToken(refreshToken);
    return issueTokens(user);
  },

  async getMe(userId: string): Promise<PublicUser> {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return toPublicUser(user);
  },

  async forgotPassword(email: string): Promise<{ resetToken?: string }> {
    const user = await authRepository.findUserByEmail(email);
    // Do not reveal whether the email exists.
    if (!user) {
      return {};
    }
    const token = generateOpaqueToken();
    const expiresAt = new Date(
      Date.now() + env.resetTokenExpiresMin * 60 * 1000
    );
    await authRepository.createPasswordResetToken({
      token,
      userId: user.id,
      expiresAt,
    });
    await recordAudit({
      userId: user.id,
      action: "PASSWORD_RESET_REQUESTED",
      entity: "User",
      entityId: user.id,
    });
    logger.info("Password reset requested", { userId: user.id });
    // In production this token would be emailed. Returned here for testability.
    return { resetToken: token };
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const record = await authRepository.findPasswordResetToken(token);
    if (!record || record.used || record.expiresAt < new Date()) {
      throw new BadRequestError("Reset token is invalid or has expired");
    }
    const passwordHash = await hashPassword(newPassword);
    await authRepository.updatePassword(record.userId, passwordHash);
    await authRepository.markResetTokenUsed(token);
    await authRepository.revokeAllRefreshTokens(record.userId);
    await recordAudit({
      userId: record.userId,
      action: "PASSWORD_RESET_COMPLETED",
      entity: "User",
      entityId: record.userId,
    });
    logger.info("Password reset completed", { userId: record.userId });
  },
};
