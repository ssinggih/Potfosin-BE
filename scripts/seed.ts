import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  const pool = connectionString
    ? new Pool({ connectionString })
    : new Pool({
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USERNAME || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
        database: process.env.DB_NAME || "potfosin",
      });

  try {
    const bcrypt = await import("bcrypt");
    const password = await bcrypt.hash("password123", 10);

    await pool.query("DELETE FROM users");

    // await pool.query(
    //   `INSERT INTO users (email, name, password, role) VALUES
    //     ($1, $2, $3, 'admin'),
    //     ($4, $5, $6, 'owner'),
    //     ($7, $8, $9, 'user')`,
    //   [
    //     'admin@potfosin.com',
    //     'Super Admin',
    //     password,
    //     'owner@potfosin.com',
    //     'Project Owner',
    //     password,
    //     'user@potfosin.com',
    //     'Regular User',
    //     password,
    //   ],
    // );

    // console.log("Seed completed: 3 users created (password: password123)");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
