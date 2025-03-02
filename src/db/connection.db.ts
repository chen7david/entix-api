import { Pool, PoolConfig } from "pg";

const getDbConfig = (): PoolConfig => {
  const env = process.env.NODE_ENV || "development";

  const baseConfig = {
    host: process.env.POSTGRES_HOST || "db",
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "postgres",
    database: process.env.POSTGRES_DB || "postgres",
    connectionTimeoutMillis: 5000,
    max: 20,
    idleTimeoutMillis: 30000,
  };

  if (env === "test") {
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
