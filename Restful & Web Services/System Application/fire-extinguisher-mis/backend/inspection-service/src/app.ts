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
  
  // Custom JSON parser to avoid iconv-lite issues with Bun
  app.use((req, res, next) => {
    if (req.headers['content-type']?.includes('application/json')) {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => {
        try {
          if (data) req.body = JSON.parse(data);
          else req.body = {};
          next();
        } catch (err) {
          res.status(400).json({ success: false, message: 'Invalid JSON' });
        }
      });
    } else {
      req.body = {};
      next();
    }
  });
  
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
