import { FocusSession } from "../models/FocusSession";
import { StudyTask } from "../models/StudyTask";

export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekStart(week?: string): Date {
  const base = week ? new Date(`${week}T00:00:00`) : new Date();
  base.setHours(0, 0, 0, 0);
  base.setDate(base.getDate() - ((base.getDay() + 6) % 7));
  return base;
}

export async function getStreak(userId: unknown): Promise<number> {
  const sessions = await FocusSession.find({ userId, status: "completed", completionPercentage: { $gte: 80 } }).sort({ createdAt: -1 });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;

  for (let index = 0; index < 365; index++) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    const hasCompletedSession = sessions.some((session) => formatLocalDate(new Date(session.createdAt)) === formatLocalDate(date));
    if (hasCompletedSession) streak++;
    else if (index > 0) break;
  }

  return streak;
}

export async function getWeeklyProgress(userId: unknown, week?: string) {
  const weekStartDate = getWeekStart(week);
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 7);
  const weekStart = formatLocalDate(weekStartDate);
  const weekEnd = formatLocalDate(new Date(weekEndDate.getTime() - 1));
  const [sessions, tasks, streak] = await Promise.all([
    FocusSession.find({ userId, status: "completed", createdAt: { $gte: weekStartDate, $lt: weekEndDate } }),
    StudyTask.find({ userId, date: { $gte: weekStart, $lte: weekEnd } }),
    getStreak(userId),
  ]);

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStartDate);
    date.setDate(weekStartDate.getDate() + index);
    const dateKey = formatLocalDate(date);
    const daySessions = sessions.filter((session) => formatLocalDate(new Date(session.createdAt)) === dateKey);
    const dayTasks = tasks.filter((task) => task.date === dateKey);
    const focusedMinutes = Math.round(daySessions.reduce((total, session) => total + session.totalFocusedMs, 0) / 60000);
    const plannedMinutes = dayTasks.reduce((total, task) => total + task.targetMinutes, 0);
    const tasksCompleted = dayTasks.filter((task) => task.status === "completed").length;

    return {
      date: dateKey,
      label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
      focusedMinutes,
      plannedMinutes,
      tasksCompleted,
      tasksTotal: dayTasks.length,
      completionPercentage: plannedMinutes > 0 ? Math.min(100, Math.round((focusedMinutes / plannedMinutes) * 100)) : 0,
      isToday: dateKey === formatLocalDate(new Date()),
    };
  });

  const totalFocusedMinutes = days.reduce((total, day) => total + day.focusedMinutes, 0);
  const totalPlannedMinutes = days.reduce((total, day) => total + day.plannedMinutes, 0);
  const plannedDays = days.filter((day) => day.plannedMinutes > 0);
  const strongestDay = plannedDays.reduce((best, day) => !best || day.completionPercentage > best.completionPercentage ? day : best, undefined as typeof days[number] | undefined);
  const weakestDay = plannedDays.reduce((worst, day) => !worst || day.completionPercentage < worst.completionPercentage ? day : worst, undefined as typeof days[number] | undefined);

  return {
    weekStart,
    weekEnd,
    totalPlannedMinutes,
    totalFocusedMinutes,
    totalInterruptedMinutes: Math.round(sessions.reduce((total, session) => total + session.totalInterruptedMs, 0) / 60000),
    overallCompletion: totalPlannedMinutes > 0 ? Math.min(100, Math.round((totalFocusedMinutes / totalPlannedMinutes) * 100)) : 0,
    tasksTotal: tasks.length,
    tasksCompleted: tasks.filter((task) => task.status === "completed").length,
    tasksMissed: tasks.filter((task) => task.status === "missed" || task.status === "expired").length,
    strongestDay: strongestDay?.label ?? "—",
    weakestDay: weakestDay?.label ?? "—",
    streak,
    days,
  };
}
