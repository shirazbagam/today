import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { ordersTable } from "./orders";

export const supportTicketsTable = pgTable("support_tickets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  orderId: text("order_id").references(() => ordersTable.id, { onDelete: "set null" }),
  category: text("category").notNull().default("support"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"),
  priority: text("priority").notNull().default("normal"),
  assignedAdminId: text("assigned_admin_id"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
}, (t) => [
  index("support_tickets_user_id_idx").on(t.userId),
  index("support_tickets_order_id_idx").on(t.orderId),
  index("support_tickets_status_idx").on(t.status),
  index("support_tickets_created_at_idx").on(t.createdAt),
]);

export const insertSupportTicketSchema = createInsertSchema(supportTicketsTable).omit({ createdAt: true, updatedAt: true, resolvedAt: true });
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTicketsTable.$inferSelect;