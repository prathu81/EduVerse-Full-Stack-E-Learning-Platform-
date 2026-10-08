import { Router } from "express";
import { db } from "@workspace/db";
import { chatMessagesTable, usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";

const router = Router();

router.get("/messages", requireAuth, async (req, res) => {
  try {
    const { courseId } = req.query;
    const messages = await db
      .select({
        id: chatMessagesTable.id,
        senderId: chatMessagesTable.senderId,
        senderName: usersTable.name,
        senderRole: usersTable.role,
        courseId: chatMessagesTable.courseId,
        message: chatMessagesTable.message,
        sentAt: chatMessagesTable.sentAt,
      })
      .from(chatMessagesTable)
      .innerJoin(usersTable, eq(chatMessagesTable.senderId, usersTable.id))
      .where(courseId ? eq(chatMessagesTable.courseId, parseInt(courseId as string)) : undefined)
      .orderBy(chatMessagesTable.sentAt);

    res.json({
      messages: messages.map(m => ({
        id: m.id, senderId: m.senderId, senderName: m.senderName,
        senderRole: m.senderRole, courseId: m.courseId, message: m.message,
        sentAt: m.sentAt.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error(err, "Get chat messages failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/messages", requireAuth, async (req, res) => {
  try {
    const { courseId, message } = req.body;
    const senderId = req.session.userId!;
    const [msg] = await db.insert(chatMessagesTable).values({ senderId, courseId, message }).returning();
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, senderId)).limit(1);
    res.status(201).json({
      id: msg.id, senderId: msg.senderId, senderName: user.name,
      senderRole: user.role, courseId: msg.courseId, message: msg.message,
      sentAt: msg.sentAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err, "Send chat message failed");
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
