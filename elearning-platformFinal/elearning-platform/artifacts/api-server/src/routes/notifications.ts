import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const notifications = await db.select().from(notificationsTable)
      .where(eq(notificationsTable.userId, userId))
      .orderBy(notificationsTable.createdAt);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({
      notifications: notifications.map(n => ({
        id: n.id, title: n.title, message: n.message,
        type: n.type, isRead: n.isRead, createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    });
  } catch (err) {
    req.log.error(err, "Get notifications failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id/read", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.id, id));
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    req.log.error(err, "Mark notification read failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
