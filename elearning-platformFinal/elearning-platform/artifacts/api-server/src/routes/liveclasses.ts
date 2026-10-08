import { Router } from "express";
import { db } from "@workspace/db";
import { liveClassesTable, coursesTable, attendanceTable, notificationsTable, enrollmentsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const { courseId } = req.query;
    const classes = await db
      .select({
        id: liveClassesTable.id,
        courseId: liveClassesTable.courseId,
        title: liveClassesTable.title,
        zoomLink: liveClassesTable.zoomLink,
        scheduledAt: liveClassesTable.scheduledAt,
        duration: liveClassesTable.duration,
        status: liveClassesTable.status,
        courseTitle: coursesTable.title,
      })
      .from(liveClassesTable)
      .innerJoin(coursesTable, eq(liveClassesTable.courseId, coursesTable.id))
      .where(courseId ? eq(liveClassesTable.courseId, parseInt(courseId as string)) : undefined);

    const attendanceCounts = await db
      .select({ liveClassId: attendanceTable.liveClassId, count: eq(attendanceTable.liveClassId, attendanceTable.liveClassId) })
      .from(attendanceTable);

    res.json({
      liveClasses: classes.map(lc => {
        const now = new Date();
        const scheduled = new Date(lc.scheduledAt);
        const endTime = new Date(scheduled.getTime() + lc.duration * 60000);
        let status: string = lc.status;
        if (now >= scheduled && now <= endTime) status = "live";
        else if (now > endTime) status = "completed";
        return {
          id: lc.id, courseId: lc.courseId, courseTitle: lc.courseTitle,
          title: lc.title, zoomLink: lc.zoomLink,
          scheduledAt: lc.scheduledAt.toISOString(),
          duration: lc.duration, status, attendanceCount: 0,
        };
      }),
    });
  } catch (err) {
    req.log.error(err, "Get live classes failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const { courseId, title, zoomLink, scheduledAt, duration } = req.body;
    const [lc] = await db.insert(liveClassesTable).values({
      courseId, title, zoomLink, scheduledAt: new Date(scheduledAt), duration, status: "upcoming",
    }).returning();

    const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId)).limit(1);

    const enrolledStudents = await db.select().from(enrollmentsTable).where(eq(enrollmentsTable.courseId, courseId));
    for (const enrollment of enrolledStudents) {
      await db.insert(notificationsTable).values({
        userId: enrollment.studentId,
        title: "New Live Class Scheduled",
        message: `A new live class "${title}" has been scheduled for ${new Date(scheduledAt).toLocaleString()}`,
        type: "info",
        isRead: false,
      });
    }

    res.status(201).json({
      id: lc.id, courseId: lc.courseId, courseTitle: course?.title || "",
      title: lc.title, zoomLink: lc.zoomLink,
      scheduledAt: lc.scheduledAt.toISOString(),
      duration: lc.duration, status: lc.status, attendanceCount: 0,
    });
  } catch (err) {
    req.log.error(err, "Create live class failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/:id/join", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const studentId = req.session.userId!;
    const [lc] = await db.select().from(liveClassesTable).where(eq(liveClassesTable.id, id)).limit(1);
    if (!lc) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    const existing = await db.select().from(attendanceTable)
      .where(and(eq(attendanceTable.liveClassId, id), eq(attendanceTable.studentId, studentId)))
      .limit(1);
    if (existing.length === 0) {
      await db.insert(attendanceTable).values({ studentId, liveClassId: id });
    }
    res.json({ zoomLink: lc.zoomLink, message: "Attendance marked. Redirecting to Zoom..." });
  } catch (err) {
    req.log.error(err, "Join live class failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
