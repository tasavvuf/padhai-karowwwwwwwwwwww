import { Router, Response } from "express";
import { StudyTask } from "../models/StudyTask";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, planId } = req.query;
    const query: Record<string, unknown> = { userId: req.user!._id };
    if (date) query.date = date;
    if (planId) query.planId = planId;

    const tasks = await StudyTask.find(query).sort({ date: 1, startTime: 1 });
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});

router.get("/:id", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await StudyTask.findById(req.params.id);
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }
    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch task" });
  }
});

router.post("/", authenticate, requireRole("student"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await StudyTask.create({
      ...req.body,
      userId: req.user!._id,
    });
    res.status(201).json({ task });
  } catch (error) {
    res.status(500).json({ message: "Failed to create task" });
  }
});

router.put("/:id", authenticate, requireRole("student"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await StudyTask.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!._id },
      req.body,
      { new: true }
    );
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }
    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: "Failed to update task" });
  }
});

router.delete("/:id", authenticate, requireRole("student"), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await StudyTask.findOneAndDelete({ _id: req.params.id, userId: req.user!._id });
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task" });
  }
});

export default router;
