import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./shared/logger";
import { connectDatabase, disconnectDatabase } from "./shared/prisma";
import { ensureExportDir } from "./shared/export";

const SERVICE = "reporting-service";

async function bootstrap(): Promise<void> {
  ensureExportDir();
  await connectDatabase();
  logger.info("Database connected", { service: SERVICE });

  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info(`${SERVICE} running on http://localhost:${env.port}`);
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received, shutting down gracefully`, { service: SERVICE });
    server.close(async () => {
      await disconnectDatabase();
      logger.info("Shutdown complete", { service: SERVICE });
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled rejection", { reason: String(reason), service: SERVICE });
  });
  process.on("uncaughtException", (err) => {
    logger.error("Uncaught exception", { error: err.message, stack: err.stack, service: SERVICE });
  });
}

bootstrap().catch((err) => {
  logger.error("Failed to start server", {
    error: err instanceof Error ? err.message : String(err),
    service: SERVICE,
  });
  process.exit(1);
});
