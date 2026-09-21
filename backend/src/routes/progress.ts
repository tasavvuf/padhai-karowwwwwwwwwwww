import { Router, Response } from "express";
import { FocusSession } from "../models/FocusSession";
import { StudyTask } from "../models/StudyTask";
import { authenticate, AuthRequest } from "../middleware/auth";
import { formatLocalDate, getStreak, getWeeklyProgress } from "../services/progress";

const router = Router();

router.get("/daily", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date } = req.query;
    const targetDate = (date as string) || formatLocalDate(new Date());
    const nextDate = new Date(`${targetDate}T00:00:00`);
    nextDate.setDate(nextDate.getDate() + 1);

    const tasks = await StudyTask.find({ userId: req.user!._id, date: targetDate });
    const sessions = await FocusSession.find({
      userId: req.user!._id,
      status: "completed",
      createdAt: { $gte: new Date(`${targetDate}T00:00:00`), $lt: nextDate },
    });

    const plannedMinutes = tasks.reduce((a, t) => a + t.targetMinutes, 0);
    const focusedMinutes = Math.round(sessions.reduce((a, s) => a + s.totalFocusedMs, 0) / 60000);
    const interruptedMinutes = Math.round(sessions.reduce((a, s) => a + s.totalInterruptedMs, 0) / 60000);
    const tasksCompleted = tasks.filter((t) => t.status === "completed").length;
    const tasksMissed = tasks.filter((t) => t.status === "missed").length;
    const interruptionCount = sessions.reduce((a, s) => a + s.interruptionCount, 0);

    res.json({
      date: targetDate,
      plannedMinutes,
      focusedMinutes,
      interruptedMinutes,
      completionPercentage: plannedMinutes > 0 ? Math.round((focusedMinutes / plannedMinutes) * 100) : 0,
      tasksTotal: tasks.length,
      tasksCompleted,
      tasksMissed,
      interruptionCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch daily progress" });
  }
});

router.get("/weekly", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json(await getWeeklyProgress(req.user!._id, req.query.week as string | undefined));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch weekly progress" });
  }
});

router.get("/streak", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const weeklyProgress = await getWeeklyProgress(req.user!._id);
    res.json({
      streak: await getStreak(req.user!._id),
      days: weeklyProgress.days.map((day) => ({ ...day, completed: day.completionPercentage >= 80 })),
      todayFocusedMinutes: weeklyProgress.days.find((day) => day.isToday)?.focusedMinutes ?? 0,
      todayPlannedMinutes: weeklyProgress.days.find((day) => day.isToday)?.plannedMinutes ?? 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch streak" });
  }
});

export default router;
