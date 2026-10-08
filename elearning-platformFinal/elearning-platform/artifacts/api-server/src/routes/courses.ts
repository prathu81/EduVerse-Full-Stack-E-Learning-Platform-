import { Router } from "express";
import { db } from "@workspace/db";
import { coursesTable, enrollmentsTable, courseMaterialsTable } from "@workspace/db/schema";
import { eq, ilike, and, sql, or } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { search, category, page = "1", limit = "20" } = req.query as Record<string, string>;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (search) conditions.push(or(ilike(coursesTable.title, `%${search}%`), ilike(coursesTable.description, `%${search}%`)));
    if (category) conditions.push(ilike(coursesTable.category, category));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [courses, countResult] = await Promise.all([
      db.select().from(coursesTable).where(whereClause).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(coursesTable).where(whereClause),
    ]);

    const enrollmentCounts = await db
      .select({ courseId: enrollmentsTable.courseId, count: sql<number>`count(*)` })
      .from(enrollmentsTable)
      .groupBy(enrollmentsTable.courseId);

    const countMap = new Map(enrollmentCounts.map(e => [e.courseId, Number(e.count)]));
    const total = Number(countResult[0]?.count ?? 0);

    res.json({
      courses: courses.map(c => ({
        id: c.id,
        title: c.title,
        instructorName: c.instructorName,
        category: c.category,
        description: c.description,
        price: Number(c.price),
        duration: c.duration,
        imageUrl: c.imageUrl,
        enrollmentCount: countMap.get(c.id) ?? 0,
        rating: c.rating ? Number(c.rating) : null,
      })),
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    req.log.error(err, "Get courses failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const { title, instructorName, category, description, price, duration, imageUrl, syllabus } = req.body;
    const [course] = await db.insert(coursesTable).values({
      title, instructorName, category, description, price: String(price), duration, imageUrl: imageUrl || null, syllabus,
    }).returning();
    res.status(201).json({
      id: course.id, title: course.title, instructorName: course.instructorName,
      category: course.category, description: course.description, price: Number(course.price),
      duration: course.duration, imageUrl: course.imageUrl, enrollmentCount: 0, rating: null,
    });
  } catch (err) {
    req.log.error(err, "Create course failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, id)).limit(1);
    if (!course) {
      res.status(404).json({ error: "Not Found", message: "Course not found" });
      return;
    }
    const [enrollmentCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(enrollmentsTable)
      .where(eq(enrollmentsTable.courseId, id));

    let isEnrolled = false;
    if (req.session?.userId) {
      const [enrollment] = await db.select().from(enrollmentsTable)
        .where(and(eq(enrollmentsTable.courseId, id), eq(enrollmentsTable.studentId, req.session.userId)))
        .limit(1);
      isEnrolled = !!enrollment;
    }

    res.json({
      id: course.id, title: course.title, instructorName: course.instructorName,
      category: course.category, description: course.description, syllabus: course.syllabus,
      price: Number(course.price), duration: course.duration, imageUrl: course.imageUrl,
      enrollmentCount: Number(enrollmentCount?.count ?? 0),
      rating: course.rating ? Number(course.rating) : null,
      isEnrolled,
    });
  } catch (err) {
    req.log.error(err, "Get course failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, instructorName, category, description, price, duration, imageUrl, syllabus } = req.body;
    const [course] = await db.update(coursesTable).set({
      title, instructorName, category, description, price: String(price), duration, imageUrl: imageUrl || null, syllabus,
    }).where(eq(coursesTable.id, id)).returning();
    res.json({
      id: course.id, title: course.title, instructorName: course.instructorName,
      category: course.category, description: course.description, price: Number(course.price),
      duration: course.duration, imageUrl: course.imageUrl, enrollmentCount: 0, rating: null,
    });
  } catch (err) {
    req.log.error(err, "Update course failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(coursesTable).where(eq(coursesTable.id, id));
    res.json({ message: "Course deleted" });
  } catch (err) {
    req.log.error(err, "Delete course failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/:id/enroll", requireAuth, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const studentId = req.session.userId!;
    const existing = await db.select().from(enrollmentsTable)
      .where(and(eq(enrollmentsTable.courseId, courseId), eq(enrollmentsTable.studentId, studentId)))
      .limit(1);
    if (existing.length > 0) {
      res.json({ message: "Already enrolled in this course" });
      return;
    }
    await db.insert(enrollmentsTable).values({ studentId, courseId, progress: 0 });
    res.json({ message: "Successfully enrolled in course" });
  } catch (err) {
    req.log.error(err, "Enroll failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id/materials", requireAuth, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const materials = await db.select().from(courseMaterialsTable).where(eq(courseMaterialsTable.courseId, courseId));
    res.json({
      materials: materials.map(m => ({
        id: m.id, courseId: m.courseId, title: m.title, type: m.type,
        url: m.url, description: m.description, createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error(err, "Get materials failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/:id/materials", requireAdmin, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const { title, type, url, description } = req.body;
    const [material] = await db.insert(courseMaterialsTable).values({ courseId, title, type, url, description: description || null }).returning();
    res.status(201).json({
      id: material.id, courseId: material.courseId, title: material.title,
      type: material.type, url: material.url, description: material.description,
      createdAt: material.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err, "Add material failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
