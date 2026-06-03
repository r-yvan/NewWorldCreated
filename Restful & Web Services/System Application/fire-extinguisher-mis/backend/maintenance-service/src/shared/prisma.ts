import { PrismaClient } from "@prisma/client";
import { env } from "../config/env";

// Single shared Prisma client used by every microservice module
// (Shared PostgreSQL database pattern).
export const prisma = new PrismaClient({
  log: env.isProd ? ["error"] : ["error", "warn"],
});

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
