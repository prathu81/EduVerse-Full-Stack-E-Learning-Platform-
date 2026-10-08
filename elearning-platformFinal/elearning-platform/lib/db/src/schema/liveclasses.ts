import { pgTable, serial, text, varchar, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const liveClassStatusEnum = pgEnum("live_class_status", ["upcoming", "live", "completed"]);

export const liveClassesTable = pgTable("live_classes", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  zoomLink: text("zoom_link").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").notNull(),
  status: liveClassStatusEnum("status").notNull().default("upcoming"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const attendanceTable = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  liveClassId: integer("live_class_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const insertLiveClassSchema = createInsertSchema(liveClassesTable).omit({ id: true, createdAt: true });
export type InsertLiveClass = z.infer<typeof insertLiveClassSchema>;
export type LiveClass = typeof liveClassesTable.$inferSelect;

export const insertAttendanceSchema = createInsertSchema(attendanceTable).omit({ id: true, joinedAt: true });
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendanceTable.$inferSelect;
