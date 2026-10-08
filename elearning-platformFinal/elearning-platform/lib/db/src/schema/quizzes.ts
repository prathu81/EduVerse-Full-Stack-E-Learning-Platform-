import { pgTable, serial, text, varchar, integer, timestamp, jsonb, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const quizzesTable = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  duration: integer("duration").notNull(),
  totalMarks: integer("total_marks").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quizQuestionsTable = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull(),
  question: text("question").notNull(),
  options: jsonb("options").notNull().$type<string[]>(),
  correctAnswer: integer("correct_answer").notNull(),
  marks: integer("marks").notNull(),
});

export const quizResultsTable = pgTable("quiz_results", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull(),
  studentId: integer("student_id").notNull(),
  score: integer("score").notNull(),
  totalMarks: integer("total_marks").notNull(),
  percentage: numeric("percentage", { precision: 5, scale: 2 }).notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const insertQuizSchema = createInsertSchema(quizzesTable).omit({ id: true, createdAt: true });
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzesTable.$inferSelect;

export const insertQuizQuestionSchema = createInsertSchema(quizQuestionsTable).omit({ id: true });
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type QuizQuestion = typeof quizQuestionsTable.$inferSelect;

export const insertQuizResultSchema = createInsertSchema(quizResultsTable).omit({ id: true, submittedAt: true });
export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;
export type QuizResult = typeof quizResultsTable.$inferSelect;
