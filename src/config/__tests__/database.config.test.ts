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
});
