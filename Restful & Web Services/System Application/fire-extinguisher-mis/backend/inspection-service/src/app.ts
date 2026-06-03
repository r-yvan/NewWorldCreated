import express, { type Application, type Request, type Response } from "express";
import helmet from "helmet";
import hpp from "hpp";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { sendSuccess } from "./shared/response";
import inspectionRoutes from "./services/inspection/inspection.routes";

// Standalone Inspection microservice.
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
      { status: "ok", service: "inspection-service", uptime: process.uptime() },
      "Service healthy"
    )
  );

  app.use("/api/inspections", inspectionRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
