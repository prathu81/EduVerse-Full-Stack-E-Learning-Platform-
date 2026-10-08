import { pgTable, serial, text, varchar, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const materialTypeEnum = pgEnum("material_type", ["video", "pdf", "document"]);

export const courseMaterialsTable = pgTable("course_materials", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  type: materialTypeEnum("type").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCourseMaterialSchema = createInsertSchema(courseMaterialsTable).omit({ id: true, createdAt: true });
export type InsertCourseMaterial = z.infer<typeof insertCourseMaterialSchema>;
export type CourseMaterial = typeof courseMaterialsTable.$inferSelect;
