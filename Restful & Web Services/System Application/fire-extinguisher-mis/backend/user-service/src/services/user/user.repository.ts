import type { Prisma, User } from "@prisma/client";
import { prisma } from "../../shared/prisma";

export const userRepository = {
  findMany(args: Prisma.UserFindManyArgs): Promise<User[]> {
    return prisma.user.findMany(args);
  },

  count(where: Prisma.UserWhereInput): Promise<number> {
    return prisma.user.count({ where });
  },

  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  },

  update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  },

  delete(id: string): Promise<User> {
    return prisma.user.delete({ where: { id } });
  },
};
