import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

// Prefer the Neon direct (unpooled) connection for migrations; fall back to SQL_* vars.
const connectionString = process.env.DATABASE_URL_UNPOOLED;

let dbCredentials: Record<string, unknown>;
if (connectionString) {
  dbCredentials = { url: connectionString };
} else {
  const sqlHost = process.env.SQL_HOST;
  const sqlDbName = process.env.SQL_DB_NAME;
  const user = process.env.SQL_ADMIN_USER;
  const password = process.env.SQL_ADMIN_PASSWORD;

  if (!sqlHost) throw new Error("SQL_HOST must be set in environment variables.");
  if (!sqlDbName) throw new Error("SQL_DB_NAME must be set in environment variables.");
  if (!user) throw new Error("SQL_ADMIN_USER must be set in environment variables.");
  if (!password) throw new Error("SQL_ADMIN_PASSWORD must be set in environment variables.");

  dbCredentials = {
    host: sqlHost,
    port: Number(process.env.SQL_PORT || 5432),
    user,
    password,
    database: sqlDbName,
    ssl: process.env.SQL_SSL === 'true' ? 'require' : false,
  };
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: dbCredentials as any,
  verbose: true,
});
