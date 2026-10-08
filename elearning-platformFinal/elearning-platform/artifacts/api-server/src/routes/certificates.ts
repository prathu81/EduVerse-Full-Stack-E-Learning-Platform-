import { Router } from "express";
import { db } from "@workspace/db";
import { certificatesTable, enrollmentsTable, coursesTable, usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import crypto from "crypto";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const studentId = req.session.userId!;
    const certs = await db
      .select({
        id: certificatesTable.id,
        certificateNumber: certificatesTable.certificateNumber,
        issuedAt: certificatesTable.issuedAt,
        studentName: usersTable.name,
        courseTitle: coursesTable.title,
        instructorName: coursesTable.instructorName,
      })
      .from(certificatesTable)
      .innerJoin(usersTable, eq(certificatesTable.studentId, usersTable.id))
      .innerJoin(coursesTable, eq(certificatesTable.courseId, coursesTable.id))
      .where(eq(certificatesTable.studentId, studentId));

    res.json({
      certificates: certs.map(c => ({
        id: c.id, studentName: c.studentName, courseTitle: c.courseTitle,
        instructorName: c.instructorName, issuedAt: c.issuedAt.toISOString(),
        certificateNumber: c.certificateNumber,
      })),
    });
  } catch (err) {
    req.log.error(err, "Get certificates failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/generate/:enrollmentId", requireAuth, async (req, res) => {
  try {
    const enrollmentId = parseInt(req.params.enrollmentId);
    const studentId = req.session.userId!;
    const [enrollment] = await db.select().from(enrollmentsTable).where(eq(enrollmentsTable.id, enrollmentId)).limit(1);
    if (!enrollment || enrollment.studentId !== studentId) {
      res.status(404).json({ error: "Not Found" });
      return;
    }
    const existing = await db.select().from(certificatesTable).where(eq(certificatesTable.enrollmentId, enrollmentId)).limit(1);
    if (existing.length > 0) {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, studentId)).limit(1);
      const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, enrollment.courseId)).limit(1);
      res.json({
        id: existing[0].id, studentName: user.name, courseTitle: course.title,
        instructorName: course.instructorName, issuedAt: existing[0].issuedAt.toISOString(),
        certificateNumber: existing[0].certificateNumber,
      });
      return;
    }
    const certNumber = `CERT-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const [cert] = await db.insert(certificatesTable).values({
      enrollmentId, studentId, courseId: enrollment.courseId, certificateNumber: certNumber,
    }).returning();
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, studentId)).limit(1);
    const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, enrollment.courseId)).limit(1);
    res.json({
      id: cert.id, studentName: user.name, courseTitle: course.title,
      instructorName: course.instructorName, issuedAt: cert.issuedAt.toISOString(),
      certificateNumber: cert.certificateNumber,
    });
  } catch (err) {
    req.log.error(err, "Generate certificate failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
