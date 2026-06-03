import express, { type Application, type Request, type Response } from "express";
import helmet from "helmet";
import hpp from "hpp";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { sendSuccess } from "./shared/response";
import authRoutes from "./services/auth/auth.routes";

// Standalone Auth microservice. Cross-cutting concerns like CORS and global
// rate limiting are handled at the API gateway; this app focuses on its domain.
export function createApp(): Application {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(hpp());
  app.use(requestLogger);

  app.get("/health", (_req: Request, res: Response) =>
    sendSuccess(
      res,
      { status: "ok", service: "auth-service", uptime: process.uptime() },
      "Service healthy"
    )
  );

  app.use("/api/auth", authRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
