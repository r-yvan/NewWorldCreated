import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createProxyMiddleware } from "http-proxy-middleware";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
import { swaggerSpec } from "./swagger";

dotenv.config();

const PORT = Number(process.env.PORT ?? 5000);

const CORS_ORIGIN = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

// Downstream service registry. In Docker these are overridden with the
// compose service hostnames (e.g. http://auth-service:5001).
const SERVICES = {
  auth: process.env.AUTH_SERVICE_URL ?? "http://localhost:5001",
  user: process.env.USER_SERVICE_URL ?? "http://localhost:5002",
  extinguisher: process.env.EXTINGUISHER_SERVICE_URL ?? "http://localhost:5003",
  inspection: process.env.INSPECTION_SERVICE_URL ?? "http://localhost:5004",
  maintenance: process.env.MAINTENANCE_SERVICE_URL ?? "http://localhost:5005",
  reporting: process.env.REPORTING_SERVICE_URL ?? "http://localhost:5006",
};

// path prefix -> target. Paths are forwarded unchanged so each service keeps
// its original `/api/<resource>` mounting (zero behavioural change).
const ROUTES: { path: string; target: string }[] = [
  { path: "/api/auth", target: SERVICES.auth },
  { path: "/api/users", target: SERVICES.user },
  { path: "/api/extinguishers", target: SERVICES.extinguisher },
  { path: "/api/inspections", target: SERVICES.inspection },
  { path: "/api/maintenance", target: SERVICES.maintenance },
  { path: "/api/reports", target: SERVICES.reporting },
];

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));

// Swagger Documentation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "FEMS API Documentation",
}));

// Swagger JSON endpoint
app.get("/api/docs.json", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Global rate limiting at the edge.
app.use(
  "/api",
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX ?? 100),
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later", errors: [] },
  })
);

// Gateway health + service map (does not proxy).
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "API gateway healthy",
    data: { status: "ok", uptime: process.uptime(), services: SERVICES },
  });
});

// IMPORTANT: no body parser here — requests are streamed to services raw so
// JSON bodies are forwarded intact.
for (const route of ROUTES) {
  app.use(
    createProxyMiddleware({
      pathFilter: route.path,
      target: route.target,
      changeOrigin: true,
      xfwd: true,
      proxyTimeout: 30_000,
      on: {
        error: (err: Error, _req, res) => {
          const response = res as Response;
          if (!response.headersSent && typeof response.status === "function") {
            response.status(502).json({
              success: false,
              message: `Upstream service unavailable (${route.path})`,
              errors: [{ detail: err.message }],
            });
          }
        },
      },
    })
  );
}

// Fallback 404 for anything not matched by a proxy route.
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    errors: [],
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API gateway running on http://localhost:${PORT}`);
  for (const r of ROUTES) {
    // eslint-disable-next-line no-console
    console.log(`  ${r.path}  ->  ${r.target}`);
  }
});
