import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../shared/errors";
import { sendError } from "../shared/response";
import { logger } from "../shared/logger";

export function notFoundHandler(req: Request, res: Response): void {
  sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(err.message, { stack: err.stack, path: req.originalUrl });
    }
    sendError(res, err.message, err.statusCode, err.errors ?? []);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = (err.meta?.target as string[])?.join(", ") ?? "field";
      sendError(res, `Duplicate value for unique field: ${target}`, 409);
      return;
    }
    if (err.code === "P2025") {
      sendError(res, "Requested record not found", 404);
      return;
    }
    sendError(res, "Database request error", 400, [{ code: err.code }]);
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    sendError(res, "Invalid database query", 400);
    return;
  }

  const message =
    err instanceof Error ? err.message : "Internal server error";
  logger.error(message, {
    stack: err instanceof Error ? err.stack : undefined,
    path: req.originalUrl,
  });
  sendError(res, "Internal server error", 500);
}
