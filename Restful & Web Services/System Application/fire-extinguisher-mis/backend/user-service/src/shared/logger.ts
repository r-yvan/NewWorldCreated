import fs from "fs";
import path from "path";
import winston from "winston";
import { env } from "../config/env";

const logsDir = path.resolve(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const { combine, timestamp, json, colorize, printf, errors } = winston.format;

const consoleFormat = combine(
  colorize(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  printf(({ level, message, timestamp: ts, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${ts} [${level}] ${message}${metaStr}`;
  })
);

export const logger = winston.createLogger({
  level: env.logLevel,
  format: combine(errors({ stack: true }), timestamp(), json()),
  defaultMeta: { service: "fems-backend" },
  transports: [
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
    }),
  ],
});

if (!env.isProd) {
  logger.add(new winston.transports.Console({ format: consoleFormat }));
}
