import { Router, Response } from "express";
import { WeeklyPlan } from "../models/WeeklyPlan";
import { StudyTask } from "../models/StudyTask";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, requireRole("student"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { week } = req.query;
    const query: Record<string, unknown> = { userId: req.user!._id };
    if (week) query.weekStart = week;

    const plans = await WeeklyPlan.find(query).sort({ weekStart: -1 });
    res.json({ plans });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch plans" });
  }
});

router.get("/:id", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const plan = await WeeklyPlan.findById(req.params.id);
    if (!plan) {
      res.status(404).json({ message: "Plan not found" });
      return;
    }
    res.json({ plan });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch plan" });
  }
});

router.post("/", authenticate, requireRole("student"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { weekStart, weekEnd, tasks } = req.body;

    if (!weekStart || !weekEnd) {
      res.status(400).json({ message: "weekStart and weekEnd are required" });
      return;
    }

    const plan = await WeeklyPlan.create({
      userId: req.user!._id,
      weekStart,
      weekEnd,
      status: "draft",
    });

    if (tasks && Array.isArray(tasks)) {
      const taskDocs = tasks.map((t: Record<string, unknown>) => ({
        ...t,
        planId: plan._id,
        userId: req.user!._id,
      }));
      await StudyTask.insertMany(taskDocs);
    }

    res.status(201).json({ plan });
  } catch (error) {
    res.status(500).json({ message: "Failed to create plan" });
  }
});

router.post("/:id/lock", authenticate, requireRole("student"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const plan = await WeeklyPlan.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!._id },
      { status: "locked", lockedAt: new Date() },
      { new: true }
    );
    if (!plan) {
      res.status(404).json({ message: "Plan not found" });
      return;
    }
    res.json({ plan });
  } catch (error) {
    res.status(500).json({ message: "Failed to lock plan" });
  }
});

router.put("/:id", authenticate, requireRole("student"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const plan = await WeeklyPlan.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!._id },
      req.body,
      { new: true }
    );
    if (!plan) {
      res.status(404).json({ message: "Plan not found" });
      return;
    }
    res.json({ plan });
  } catch (error) {
    res.status(500).json({ message: "Failed to update plan" });
  }
});

export default router;
