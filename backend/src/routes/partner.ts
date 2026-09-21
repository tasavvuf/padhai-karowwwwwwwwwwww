import { Response, Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { authenticate, AuthRequest, requireRole } from "../middleware/auth";
import { FocusSession } from "../models/FocusSession";
import { PartnerMessage } from "../models/PartnerMessage";
import { StudyTask } from "../models/StudyTask";
import { User } from "../models/User";
import { getWeeklyProgress } from "../services/progress";

const router = Router();

router.post(
  "/messages",
  authenticate,
  requireRole("partner"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const message =
        typeof req.body.message === "string" ? req.body.message.trim() : "";
      if (!message || message.length > 280) {
        res
          .status(400)
          .json({ message: "Message must contain 1 to 280 characters" });
        return;
      }
      if (!req.user!.partnerId) {
        res.status(404).json({ message: "No connected student" });
        return;
      }
      const created = await PartnerMessage.create({
        fromUserId: req.user!._id,
        toUserId: req.user!.partnerId,
        message,
      });
      res.status(201).json({ message: created });
    } catch {
      res.status(500).json({ message: "Failed to send message" });
    }
  },
);

router.get(
  "/messages",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const messages = await PartnerMessage.find({
        $or: [{ fromUserId: req.user!._id }, { toUserId: req.user!._id }],
      })
        .sort({ createdAt: -1 })
        .limit(50);
      res.json({ messages });
    } catch {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  },
);

router.post(
  "/invite",
  authenticate,
  requireRole("student"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = req.user!;
      if (!user.inviteCode) {
        user.inviteCode = uuidv4().slice(0, 8).toUpperCase();
        await user.save();
      }
      res.json({ inviteCode: user.inviteCode });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate invite" });
    }
  },
);

router.post(
  "/connect",
  authenticate,
  requireRole("partner"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { code } = req.body;
      if (!code) {
        res.status(400).json({ message: "Invite code is required" });
        return;
      }

      const student = await User.findOne({ inviteCode: code, role: "student" });
      if (!student) {
        res.status(404).json({ message: "Invalid invite code" });
        return;
      }

      const user = req.user!;
      user.partnerId = student._id;
      await user.save();

      student.partnerId = user._id;
      await student.save();

      res.json({
        message: "Connected successfully",
        studentName: student.name,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to connect" });
    }
  },
);

router.get(
  "/progress",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = req.user!;
      if (!user.partnerId) {
        res.status(404).json({ message: "No connected student" });
        return;
      }

      const student = await User.findById(user.partnerId);
      if (!student) {
        res.status(404).json({ message: "Student not found" });
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const todayTasks = await StudyTask.find({
        userId: student._id,
        date: today,
      });
      const todaySessions = await FocusSession.find({
        userId: student._id,
        status: "completed",
        createdAt: { $gte: new Date(today) },
      });

      const completedTasks = todayTasks.filter(
        (t) => t.status === "completed",
      ).length;
      const totalFocusedMs = todaySessions.reduce(
        (a, s) => a + s.totalFocusedMs,
        0,
      );

      const activeSession = await FocusSession.findOne({
        userId: student._id,
        status: { $in: ["active", "interrupted", "paused"] },
      }).sort({ createdAt: -1 });

      let activeSessionData = null;
      if (activeSession) {
        const task = await StudyTask.findById(activeSession.taskId);
        activeSessionData = {
          id: activeSession._id,
          taskId: activeSession.taskId,
          subject: task?.subject,
          title: task?.title,
          status: activeSession.status,
          plannedStart: activeSession.plannedStart,
          plannedEnd: activeSession.plannedEnd,
          totalFocusedMs: activeSession.totalFocusedMs,
          interruptionCount: activeSession.interruptionCount,
        };
      }

      res.json({
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
        },
        today: {
          tasksCompleted: completedTasks,
          tasksTotal: todayTasks.length,
          focusedMinutes: Math.round(totalFocusedMs / 60000),
        },
        activeSession: activeSessionData,
        tasks: todayTasks.map((t) => ({
          id: t._id,
          title: t.title,
          subject: t.subject,
          startTime: t.startTime,
          endTime: t.endTime,
          targetMinutes: t.targetMinutes,
          status: t.status,
        })),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  },
);

router.get(
  "/sessions",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = req.user!;
      if (!user.partnerId) {
        res.status(404).json({ message: "No connected student" });
        return;
      }

      const sessions = await FocusSession.find({ userId: user.partnerId })
        .sort({ createdAt: -1 })
        .limit(20);
      res.json({ sessions });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  },
);

router.get(
  "/weekly",
  authenticate,
  requireRole("partner"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user!.partnerId) {
        res.status(404).json({ message: "No connected student" });
        return;
      }
      res.json(
        await getWeeklyProgress(
          req.user!.partnerId,
          req.query.week as string | undefined,
        ),
      );
    } catch {
      res.status(500).json({ message: "Failed to fetch student progress" });
    }
  },
);

router.get(
  "/tasks",
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = req.user!;
      if (!user.partnerId) {
        res.status(404).json({ message: "No connected student" });
        return;
      }

      const { date } = req.query;
      const query: Record<string, unknown> = { userId: user.partnerId };
      if (date) query.date = date;

      const tasks = await StudyTask.find(query).sort({ startTime: 1 });
      res.json({ tasks });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  },
);

export default router;
