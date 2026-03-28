import { pgTable, text, serial, timestamp, numeric, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id),
  customerPhone: text("customer_phone").notNull(),
  customerName: text("customer_name"),
  status: text("status", { enum: ["new", "preparing", "ready", "delivered", "cancelled"] }).notNull().default("new"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  items: json("items").notNull(),
  notes: text("notes"),
  deliveryAddress: text("delivery_address"),
  paymentMethod: text("payment_method", { enum: ["cash", "card", "online"] }).notNull().default("cash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
