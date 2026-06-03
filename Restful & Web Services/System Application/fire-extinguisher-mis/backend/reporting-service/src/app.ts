import express, { type Application, type Request, type Response } from "express";
import helmet from "helmet";
import hpp from "hpp";
import { requestLogger } from "./middleware/requestLogger";
import { errorHandler, notFoundHandler } from "./middleware/error";
import { sendSuccess } from "./shared/response";
import reportingRoutes from "./services/reporting/reporting.routes";

// Standalone Reporting microservice (analytics + PDF/CSV exports).
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
      { status: "ok", service: "reporting-service", uptime: process.uptime() },
      "Service healthy"
    )
  );

  app.use("/api/reports", reportingRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
