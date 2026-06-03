import dotenv from "dotenv";

dotenv.config();

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProd: (process.env.NODE_ENV ?? "development") === "production",
  port: Number(process.env.PORT ?? 5000),

  databaseUrl: required("DATABASE_URL"),

  jwt: {
    accessSecret: required("JWT_SECRET", "dev_access_secret"),
    accessExpiresIn: process.env.JWT_EXPIRES_IN ?? "15m",
    refreshSecret: required("JWT_REFRESH_SECRET", "dev_refresh_secret"),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "7d",
  },

  resetTokenExpiresMin: Number(process.env.RESET_TOKEN_EXPIRES_MIN ?? 30),

  corsOrigin: (process.env.CORS_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((o) => o.trim()),

  logLevel: process.env.LOG_LEVEL ?? "info",

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX ?? 100),
    authMax: Number(process.env.AUTH_RATE_LIMIT_MAX ?? 10),
  },

  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS ?? 12),

  exportDir: process.env.EXPORT_DIR ?? "tmp/exports",
};
