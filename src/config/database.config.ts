import { Pool, PoolConfig } from "pg";

const getDbConfig = (): PoolConfig => {
  const env = process.env.NODE_ENV || "development";

  const baseConfig = {
    host: process.env.POSTGRES_HOST || "localhost",
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "postgres",
    database: process.env.POSTGRES_DB || "entix",
  };

  if (env === "test") {
    return {
      ...baseConfig,
      // Additional test-specific configurations if needed
      max: 1, // Use minimal connections for testing
    };
  }

  return baseConfig;
};

export const pool = new Pool(getDbConfig());
