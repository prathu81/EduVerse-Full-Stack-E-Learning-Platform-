import { pgTable, serial, text, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const roleEnum = pgEnum("role", ["student", "admin"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: roleEnum("role").notNull().default("student"),
  phone: varchar("phone", { length: 50 }),
  parentPhone: varchar("parent_phone", { length: 50 }),
  address: text("address"),
  qualification: varchar("qualification", { length: 255 }),
  experience: varchar("experience", { length: 255 }),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
