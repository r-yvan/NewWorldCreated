import express, { type Application, type Request, type Response } from "express";
import helmet from "helmet";
import hpp from "hpp";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { sendSuccess } from "./shared/response";
import extinguisherRoutes from "./services/extinguisher/extinguisher.routes";

// Standalone Extinguisher microservice.
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
      { status: "ok", service: "extinguisher-service", uptime: process.uptime() },
      "Service healthy"
    )
  );

  app.use("/api/extinguishers", extinguisherRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
