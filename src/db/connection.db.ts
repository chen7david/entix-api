import { Pool, PoolConfig } from "pg";
import { env } from "@src/config/env.config";
import { Environment } from "@src/types/app.types";

const getDbConfig = (): PoolConfig => {
  const baseConfig = {
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
    connectionTimeoutMillis: 5000,
    max: 20,
    idleTimeoutMillis: 30000,
  };

  if (env.NODE_ENV === Environment.Test) {
    return {
      ...baseConfig,
      max: 2,
    };
  }

  return baseConfig;
};

export const pool = new Pool(getDbConfig());

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
});

pool.on("connect", () => {
  console.log("New client connected to database");
});

process.on("SIGTERM", () => {
  pool.end().then(() => {
    console.log("Database pool has ended");
    process.exit(0);
  });
});
