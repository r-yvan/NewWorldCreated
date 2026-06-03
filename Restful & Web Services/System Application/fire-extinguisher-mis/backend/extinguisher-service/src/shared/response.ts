import type { Response } from "express";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "Operation successful",
  statusCode = 200,
  pagination?: PaginationMeta
): Response {
  const body: Record<string, unknown> = { success: true, message, data };
  if (pagination) body.pagination = pagination;
  return res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errors: unknown[] = []
): Response {
  return res.status(statusCode).json({ success: false, message, errors });
}
