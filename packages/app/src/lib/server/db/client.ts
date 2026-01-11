// src/lib/server/db/client.ts

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from "pg";
import env from "$lib/server/env";

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: env.DATABASE_URL, // Use your connection string from environment variables
});

// Initialize drizzle with the PostgreSQL pool
const db = drizzle(pool);

export { db, pool };
