import type { Prisma, User } from "@prisma/client";
import { prisma } from "../../shared/prisma";

export const authRepository = {
  findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  createUser(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  },

  updatePassword(userId: string, passwordHash: string): Promise<User> {
    return prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  },

  // ===== Refresh tokens =====
  createRefreshToken(data: {
    token: string;
    userId: string;
    expiresAt: Date;
  }) {
    return prisma.refreshToken.create({ data });
  },

  findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token } });
  },

  revokeRefreshToken(token: string) {
    return prisma.refreshToken.updateMany({
      where: { token },
      data: { revoked: true },
    });
  },

  revokeAllRefreshTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  },

  // ===== Password reset tokens =====
  createPasswordResetToken(data: {
    token: string;
    userId: string;
    expiresAt: Date;
  }) {
    return prisma.passwordResetToken.create({ data });
  },

  findPasswordResetToken(token: string) {
    return prisma.passwordResetToken.findUnique({ where: { token } });
  },

  markResetTokenUsed(token: string) {
    return prisma.passwordResetToken.updateMany({
      where: { token },
      data: { used: true },
    });
  },
};
