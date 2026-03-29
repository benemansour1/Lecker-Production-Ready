import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";

export const adminSessionsTable = pgTable("admin_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  phone: text("phone"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  deviceType: text("device_type"),
  browser: text("browser"),
  os: text("os"),
  city: text("city"),
  country: text("country"),
  loginAt: timestamp("login_at").defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export type AdminSession = typeof adminSessionsTable.$inferSelect;
