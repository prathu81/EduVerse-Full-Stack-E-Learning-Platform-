import { Router } from "express";
import { db } from "@workspace/db";
import { enrollmentsTable, coursesTable, liveClassesTable, usersTable } from "@workspace/db/schema";
import { eq, avg, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

router.get("/dashboard", requireAuth, async (req, res) => {
  try {
    const studentId = req.session.userId!;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, studentId)).limit(1);
    const enrollments = await db.select().from(enrollmentsTable).where(eq(enrollmentsTable.studentId, studentId));
    const completedCourses = enrollments.filter(e => e.progress === 100).length;
    const avgProgress = enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
      : 0;

    const allLiveClasses = await db.select().from(liveClassesTable);
    const upcomingClasses = allLiveClasses.filter(lc => lc.status === "upcoming" || lc.status === "live").length;

    res.json({
      student: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, photoUrl: user.photoUrl },
      enrolledCourses: enrollments.length,
      completedCourses,
      upcomingClasses,
      averageProgress: avgProgress,
      recentActivity: [
        { type: "enrollment", description: "You have enrolled in courses", timestamp: new Date().toISOString() },
        { type: "class", description: "Live class sessions available", timestamp: new Date().toISOString() },
      ],
    });
  } catch (err) {
    req.log.error(err, "Get student dashboard failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/enrollments", requireAuth, async (req, res) => {
  try {
    const studentId = req.session.userId!;
    const enrollments = await db
      .select({
        id: enrollmentsTable.id,
        courseId: enrollmentsTable.courseId,
        progress: enrollmentsTable.progress,
        enrolledAt: enrollmentsTable.enrolledAt,
        courseTitle: coursesTable.title,
        instructorName: coursesTable.instructorName,
        imageUrl: coursesTable.imageUrl,
      })
      .from(enrollmentsTable)
      .innerJoin(coursesTable, eq(enrollmentsTable.courseId, coursesTable.id))
      .where(eq(enrollmentsTable.studentId, studentId));

    res.json({
      enrollments: enrollments.map(e => ({
        id: e.id,
        courseId: e.courseId,
        courseTitle: e.courseTitle,
        instructorName: e.instructorName,
        progress: e.progress,
        enrolledAt: e.enrolledAt.toISOString(),
        imageUrl: e.imageUrl,
      })),
    });
  } catch (err) {
    req.log.error(err, "Get enrollments failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/progress/:courseId", requireAuth, async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const studentId = req.session.userId!;
    const { progress } = req.body;
    await db.update(enrollmentsTable)
      .set({ progress: Math.min(100, Math.max(0, progress)) })
      .where(eq(enrollmentsTable.studentId, studentId));
    res.json({ message: "Progress updated" });
  } catch (err) {
    req.log.error(err, "Update progress failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
