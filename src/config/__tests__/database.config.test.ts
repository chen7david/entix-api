import { pool } from "../database.config";

describe("Database Configuration", () => {
  afterAll(async () => {
    await pool.end();
  });

  it("should connect to the database successfully", async () => {
    const result = await pool.query("SELECT NOW()");
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].now).toBeDefined();
  });

  it("should have the correct connection parameters for test environment", () => {
    expect(process.env.NODE_ENV).toBe("test");
    expect(pool.options.host).toBe(process.env.POSTGRES_HOST || "localhost");
    expect(pool.options.database).toBe(process.env.POSTGRES_DB || "entix");
  });
});
