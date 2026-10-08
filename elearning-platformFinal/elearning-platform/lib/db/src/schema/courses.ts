import { pgTable, serial, text, varchar, numeric, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const coursesTable = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  instructorName: varchar("instructor_name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description").notNull(),
  syllabus: text("syllabus").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  duration: varchar("duration", { length: 100 }).notNull(),
  imageUrl: text("image_url"),
  rating: numeric("rating", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const enrollmentsTable = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  courseId: integer("course_id").notNull(),
  progress: integer("progress").notNull().default(0),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
});

export const insertCourseSchema = createInsertSchema(coursesTable).omit({ id: true, createdAt: true });
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof coursesTable.$inferSelect;

export const insertEnrollmentSchema = createInsertSchema(enrollmentsTable).omit({ id: true, enrolledAt: true });
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollmentsTable.$inferSelect;
