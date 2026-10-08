import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, enrollmentsTable, coursesTable, liveClassesTable, attendanceTable } from "@workspace/db/schema";
import { eq, sql, count } from "drizzle-orm";
import { requireAdmin } from "../lib/auth.js";

const router = Router();

router.get("/dashboard", requireAdmin, async (req, res) => {
  try {
    const [studentCount] = await db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.role, "student"));
    const [courseCount] = await db.select({ count: sql<number>`count(*)` }).from(coursesTable);
    const [enrollmentCount] = await db.select({ count: sql<number>`count(*)` }).from(enrollmentsTable);
    const [upcomingCount] = await db.select({ count: sql<number>`count(*)` }).from(liveClassesTable).where(eq(liveClassesTable.status, "upcoming"));

    const recentEnrollments = await db
      .select({
        studentName: usersTable.name,
        courseTitle: coursesTable.title,
        enrolledAt: enrollmentsTable.enrolledAt,
      })
      .from(enrollmentsTable)
      .innerJoin(usersTable, eq(enrollmentsTable.studentId, usersTable.id))
      .innerJoin(coursesTable, eq(enrollmentsTable.courseId, coursesTable.id))
      .limit(5);

    res.json({
      totalStudents: Number(studentCount?.count ?? 0),
      totalCourses: Number(courseCount?.count ?? 0),
      totalEnrollments: Number(enrollmentCount?.count ?? 0),
      upcomingLiveClasses: Number(upcomingCount?.count ?? 0),
      recentEnrollments: recentEnrollments.map(e => ({
        studentName: e.studentName,
        courseTitle: e.courseTitle,
        enrolledAt: e.enrolledAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error(err, "Get admin dashboard failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/students", requireAdmin, async (req, res) => {
  try {
    const students = await db.select().from(usersTable).where(eq(usersTable.role, "student"));
    const enrollmentCounts = await db
      .select({ studentId: enrollmentsTable.studentId, count: sql<number>`count(*)` })
      .from(enrollmentsTable)
      .groupBy(enrollmentsTable.studentId);
    const countMap = new Map(enrollmentCounts.map(e => [e.studentId, Number(e.count)]));
    res.json({
      students: students.map(s => ({
        id: s.id, name: s.name, email: s.email,
        phone: s.phone || "", parentPhone: s.parentPhone || "",
        qualification: s.qualification || "", enrolledCourses: countMap.get(s.id) ?? 0,
        joinedAt: s.createdAt.toISOString(),
      })),
      total: students.length,
    });
  } catch (err) {
    req.log.error(err, "Get students failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/attendance", requireAdmin, async (req, res) => {
  try {
    const records = await db
      .select({
        id: attendanceTable.id,
        studentId: attendanceTable.studentId,
        studentName: usersTable.name,
        liveClassId: attendanceTable.liveClassId,
        liveClassTitle: liveClassesTable.title,
        courseTitle: coursesTable.title,
        joinedAt: attendanceTable.joinedAt,
      })
      .from(attendanceTable)
      .innerJoin(usersTable, eq(attendanceTable.studentId, usersTable.id))
      .innerJoin(liveClassesTable, eq(attendanceTable.liveClassId, liveClassesTable.id))
      .innerJoin(coursesTable, eq(liveClassesTable.courseId, coursesTable.id));

    res.json({
      records: records.map(r => ({
        id: r.id, studentId: r.studentId, studentName: r.studentName,
        liveClassId: r.liveClassId, liveClassTitle: r.liveClassTitle,
        courseTitle: r.courseTitle, joinedAt: r.joinedAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error(err, "Get attendance failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
