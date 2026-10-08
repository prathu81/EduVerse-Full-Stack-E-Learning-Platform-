import { pgTable, serial, text, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const certificatesTable = pgTable("certificates", {
  id: serial("id").primaryKey(),
  enrollmentId: integer("enrollment_id").notNull(),
  studentId: integer("student_id").notNull(),
  courseId: integer("course_id").notNull(),
  certificateNumber: varchar("certificate_number", { length: 50 }).notNull().unique(),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
});

export const insertCertificateSchema = createInsertSchema(certificatesTable).omit({ id: true, issuedAt: true });
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type Certificate = typeof certificatesTable.$inferSelect;
