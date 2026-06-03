import type { Prisma } from "@prisma/client";
import { userRepository } from "./user.repository";
import { hashPassword, comparePassword } from "../../utils/password";
import { getPagination, buildPaginationMeta } from "../../shared/pagination";
import type { PaginationMeta } from "../../shared/response";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../shared/errors";
import { recordAudit } from "../../shared/audit";
import { toPublicUser, type PublicUser } from "../auth/auth.service";
import type {
  CreateUserInput,
  ListUsersQuery,
  UpdateUserInput,
} from "./user.validation";

export const userService = {
  async list(
    query: ListUsersQuery
  ): Promise<{ users: PublicUser[]; pagination: PaginationMeta }> {
    const { page, limit, skip } = getPagination(query.page, query.limit);

    const where: Prisma.UserWhereInput = {};
    if (query.role) where.role = query.role;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: "insensitive" } },
        { lastName: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      userRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy]: query.sortOrder },
      }),
      userRepository.count(where),
    ]);

    return {
      users: users.map(toPublicUser),
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async getById(id: string): Promise<PublicUser> {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError("User not found");
    return toPublicUser(user);
  },

  async create(
    input: CreateUserInput,
    actorId?: string
  ): Promise<PublicUser> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw new ConflictError("Email already in use");
    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
      role: input.role,
      isActive: input.isActive,
    });
    await recordAudit({
      userId: actorId ?? null,
      action: "USER_CREATED",
      entity: "User",
      entityId: user.id,
      metadata: { email: user.email, role: user.role },
    });
    return toPublicUser(user);
  },

  async update(
    id: string,
    input: UpdateUserInput,
    actorId?: string
  ): Promise<PublicUser> {
    const existing = await userRepository.findById(id);
    if (!existing) throw new NotFoundError("User not found");
    if (input.email && input.email !== existing.email) {
      const taken = await userRepository.findByEmail(input.email);
      if (taken) throw new ConflictError("Email already in use");
    }
    const user = await userRepository.update(id, input);
    await recordAudit({
      userId: actorId ?? null,
      action: "USER_UPDATED",
      entity: "User",
      entityId: id,
      metadata: { before: toPublicUser(existing), after: toPublicUser(user) },
    });
    return toPublicUser(user);
  },

  async remove(id: string, actorId?: string): Promise<void> {
    const existing = await userRepository.findById(id);
    if (!existing) throw new NotFoundError("User not found");
    await userRepository.delete(id);
    await recordAudit({
      userId: actorId ?? null,
      action: "USER_DELETED",
      entity: "User",
      entityId: id,
      metadata: { email: existing.email },
    });
  },

  async updateProfile(
    userId: string,
    input: { firstName?: string; lastName?: string; email?: string }
  ): Promise<PublicUser> {
    return this.update(userId, input, userId);
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    const valid = await comparePassword(currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestError("Current password is incorrect");
    const passwordHash = await hashPassword(newPassword);
    await userRepository.update(userId, { passwordHash });
    await recordAudit({
      userId,
      action: "PASSWORD_CHANGED",
      entity: "User",
      entityId: userId,
    });
  },
};
