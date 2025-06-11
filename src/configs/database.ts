import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
const pool = new Pool({
  connectionString:
    process.env.PG_URL || 'postgres://postgres:postgres@localhost:5432/account',
});
export const dbConnection = drizzle({ client: pool });
