import * as dotenv from 'dotenv';
dotenv.config();

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    // Prefer the Neon pooled connection string (set by `neon deploy`).
    // Fall back to individual SQL_* vars for local / legacy setups.
    const connectionString = process.env.DATABASE_URL;
    if (connectionString) {
      global._postgresPool = new Pool({
        connectionString,
        max: 10,
        connectionTimeoutMillis: 15000,
        ssl: { rejectUnauthorized: false },
      });
    } else {
      const password = process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD || 'postgres';
      global._postgresPool = new Pool({
        host: process.env.SQL_HOST || 'localhost',
        port: Number(process.env.SQL_PORT || 5432),
        user: process.env.SQL_USER || process.env.SQL_ADMIN_USER || 'postgres',
        password: String(password),
        database: process.env.SQL_DB_NAME || 'MediBenin',
        ssl: process.env.SQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
        max: 10,
        connectionTimeoutMillis: 15000,
      });
    }

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();

export const db = drizzle(pool, { schema });
