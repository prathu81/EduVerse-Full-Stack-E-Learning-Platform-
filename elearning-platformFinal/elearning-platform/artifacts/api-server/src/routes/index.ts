import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import coursesRouter from "./courses.js";
import studentsRouter from "./students.js";
import liveclassesRouter from "./liveclasses.js";
import quizzesRouter from "./quizzes.js";
import adminRouter from "./admin.js";
import certificatesRouter from "./certificates.js";
import notificationsRouter from "./notifications.js";
import chatRouter from "./chat.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/courses", coursesRouter);
router.use("/students", studentsRouter);
router.use("/liveclasses", liveclassesRouter);
router.use("/quizzes", quizzesRouter);
router.use("/admin", adminRouter);
router.use("/certificates", certificatesRouter);
router.use("/notifications", notificationsRouter);
router.use("/chat", chatRouter);

export default router;
