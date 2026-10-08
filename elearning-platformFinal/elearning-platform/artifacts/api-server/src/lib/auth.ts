import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "elearning-salt").digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Unauthorized", message: "Please login first" });
    return;
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Unauthorized", message: "Please login first" });
    return;
  }
  if (req.session.role !== "admin") {
    res.status(403).json({ error: "Forbidden", message: "Admin access required" });
    return;
  }
  next();
}

declare module "express-session" {
  interface SessionData {
    userId: number;
    role: "student" | "admin";
    name: string;
    email: string;
  }
}
