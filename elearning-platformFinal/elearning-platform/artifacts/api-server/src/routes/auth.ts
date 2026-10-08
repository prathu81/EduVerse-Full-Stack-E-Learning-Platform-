import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, requireAuth } from "../lib/auth.js";

const router = Router();

router.post("/register/student", async (req, res) => {
  try {
    const { fullName, email, password, phone, parentPhone, address, courseId, qualification, photoUrl } = req.body;
    if (!fullName || !email || !password || !phone || !parentPhone || !address || !courseId || !qualification) {
      res.status(400).json({ error: "Bad Request", message: "All fields are required" });
      return;
    }
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "Bad Request", message: "Email already registered" });
      return;
    }
    const passwordHash = hashPassword(password);
    const [user] = await db.insert(usersTable).values({
      name: fullName,
      email,
      passwordHash,
      role: "student",
      phone,
      parentPhone,
      address,
      qualification,
      photoUrl: photoUrl || null,
    }).returning();
    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.name = user.name;
    req.session.email = user.email;
    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, photoUrl: user.photoUrl },
      message: "Registration successful",
    });
  } catch (err) {
    req.log.error(err, "Register student failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/register/admin", async (req, res) => {
  try {
    const { fullName, email, password, phone, qualification, experience, address } = req.body;
    if (!fullName || !email || !password || !phone || !qualification || !experience || !address) {
      res.status(400).json({ error: "Bad Request", message: "All fields are required" });
      return;
    }
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "Bad Request", message: "Email already registered" });
      return;
    }
    const passwordHash = hashPassword(password);
    const [user] = await db.insert(usersTable).values({
      name: fullName,
      email,
      passwordHash,
      role: "admin",
      phone,
      qualification,
      experience,
      address,
    }).returning();
    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.name = user.name;
    req.session.email = user.email;
    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, photoUrl: null },
      message: "Admin registration successful",
    });
  } catch (err) {
    req.log.error(err, "Register admin failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Bad Request", message: "Email and password required" });
      return;
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid email or password" });
      return;
    }
    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.name = user.name;
    req.session.email = user.email;
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, photoUrl: user.photoUrl },
      message: "Login successful",
    });
  } catch (err) {
    req.log.error(err, "Login failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, photoUrl: user.photoUrl });
  } catch (err) {
    req.log.error(err, "Get me failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
});

export default router;
