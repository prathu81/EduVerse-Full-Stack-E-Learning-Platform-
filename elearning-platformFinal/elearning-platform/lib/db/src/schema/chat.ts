import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const chatMessagesTable = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  courseId: integer("course_id").notNull(),
  message: text("message").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessagesTable).omit({ id: true, sentAt: true });
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessagesTable.$inferSelect;
