import { Router } from "express";
import { db } from "@workspace/db";
import { quizzesTable, quizQuestionsTable, quizResultsTable, coursesTable, usersTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth.js";

const router = Router();

router.get("/results", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const role = req.session.role;
    let results;
    if (role === "admin") {
      results = await db
        .select({
          id: quizResultsTable.id,
          quizId: quizResultsTable.quizId,
          quizTitle: quizzesTable.title,
          studentId: quizResultsTable.studentId,
          studentName: usersTable.name,
          score: quizResultsTable.score,
          totalMarks: quizResultsTable.totalMarks,
          percentage: quizResultsTable.percentage,
          submittedAt: quizResultsTable.submittedAt,
        })
        .from(quizResultsTable)
        .innerJoin(quizzesTable, eq(quizResultsTable.quizId, quizzesTable.id))
        .innerJoin(usersTable, eq(quizResultsTable.studentId, usersTable.id));
    } else {
      results = await db
        .select({
          id: quizResultsTable.id,
          quizId: quizResultsTable.quizId,
          quizTitle: quizzesTable.title,
          studentId: quizResultsTable.studentId,
          studentName: usersTable.name,
          score: quizResultsTable.score,
          totalMarks: quizResultsTable.totalMarks,
          percentage: quizResultsTable.percentage,
          submittedAt: quizResultsTable.submittedAt,
        })
        .from(quizResultsTable)
        .innerJoin(quizzesTable, eq(quizResultsTable.quizId, quizzesTable.id))
        .innerJoin(usersTable, eq(quizResultsTable.studentId, usersTable.id))
        .where(eq(quizResultsTable.studentId, userId));
    }
    res.json({
      results: results.map(r => ({
        id: r.id, quizId: r.quizId, quizTitle: r.quizTitle,
        studentId: r.studentId, studentName: r.studentName,
        score: r.score, totalMarks: r.totalMarks,
        percentage: Number(r.percentage),
        submittedAt: r.submittedAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error(err, "Get quiz results failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const { courseId } = req.query;
    const quizzes = await db
      .select({
        id: quizzesTable.id,
        courseId: quizzesTable.courseId,
        title: quizzesTable.title,
        duration: quizzesTable.duration,
        totalMarks: quizzesTable.totalMarks,
        courseTitle: coursesTable.title,
      })
      .from(quizzesTable)
      .innerJoin(coursesTable, eq(quizzesTable.courseId, coursesTable.id))
      .where(courseId ? eq(quizzesTable.courseId, parseInt(courseId as string)) : undefined);

    const questions = await db.select().from(quizQuestionsTable);
    const questionMap = new Map<number, number>();
    for (const q of questions) {
      questionMap.set(q.quizId, (questionMap.get(q.quizId) ?? 0) + 1);
    }

    res.json({
      quizzes: quizzes.map(q => ({
        id: q.id, courseId: q.courseId, courseTitle: q.courseTitle,
        title: q.title, duration: q.duration, totalMarks: q.totalMarks,
        questionCount: questionMap.get(q.id) ?? 0,
      })),
    });
  } catch (err) {
    req.log.error(err, "Get quizzes failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const { courseId, title, duration, questions } = req.body;
    const totalMarks = questions.reduce((sum: number, q: any) => sum + q.marks, 0);
    const [quiz] = await db.insert(quizzesTable).values({ courseId, title, duration, totalMarks }).returning();
    for (const q of questions) {
      await db.insert(quizQuestionsTable).values({
        quizId: quiz.id, question: q.question, options: q.options,
        correctAnswer: q.correctAnswer, marks: q.marks,
      });
    }
    const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId)).limit(1);
    res.status(201).json({
      id: quiz.id, courseId: quiz.courseId, courseTitle: course?.title || "",
      title: quiz.title, duration: quiz.duration, totalMarks: quiz.totalMarks,
      questionCount: questions.length,
    });
  } catch (err) {
    req.log.error(err, "Create quiz failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, id)).limit(1);
    if (!quiz) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    const questions = await db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.quizId, id));
    res.json({
      id: quiz.id, courseId: quiz.courseId, title: quiz.title,
      duration: quiz.duration, totalMarks: quiz.totalMarks,
      questions: questions.map(q => ({
        id: q.id, question: q.question, options: q.options as string[], marks: q.marks,
      })),
    });
  } catch (err) {
    req.log.error(err, "Get quiz failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/:id/submit", requireAuth, async (req, res) => {
  try {
    const quizId = parseInt(req.params.id);
    const studentId = req.session.userId!;
    const { answers } = req.body;
    const [quiz] = await db.select().from(quizzesTable).where(eq(quizzesTable.id, quizId)).limit(1);
    if (!quiz) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    const questions = await db.select().from(quizQuestionsTable).where(eq(quizQuestionsTable.quizId, quizId));
    let score = 0;
    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.questionId);
      if (question && question.correctAnswer === answer.answer) {
        score += question.marks;
      }
    }
    const percentage = quiz.totalMarks > 0 ? (score / quiz.totalMarks) * 100 : 0;
    await db.insert(quizResultsTable).values({
      quizId, studentId, score, totalMarks: quiz.totalMarks, percentage: String(percentage.toFixed(2)),
    });
    res.json({
      quizId, quizTitle: quiz.title, score, totalMarks: quiz.totalMarks,
      percentage, passed: percentage >= 50,
    });
  } catch (err) {
    req.log.error(err, "Submit quiz failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
