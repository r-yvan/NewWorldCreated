import type { User } from "@prisma/client";

// Self-contained copy of the auth public-user projection so the user service
// does not depend on the auth service at runtime (shared-database pattern).
export interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: User["role"];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function toPublicUser(user: User): PublicUser {
  const { passwordHash, ...rest } = user;
  return rest as PublicUser;
}
