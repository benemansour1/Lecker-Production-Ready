import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

export const isDbAvailable = !!process.env.DATABASE_URL;

if (!process.env.DATABASE_URL) {
  console.warn(
    "⚠️  DATABASE_URL غير موجود — سيعمل المشروع في وضع القراءة فقط (JSON fallback للمنتجات)",
  );
}

// Use a dummy pool/db when DATABASE_URL is missing (routes will handle fallback)
export const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null as unknown as pg.Pool;

export const db = process.env.DATABASE_URL
  ? drizzle(pool, { schema })
  : null as unknown as ReturnType<typeof drizzle>;

export * from "./schema";
