import type { NextFunction, Request, Response } from "express";
import { logger } from "../shared/logger";

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("http_request", {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      userId: req.user?.id,
      ip: req.ip,
    });
  });
  next();
}
