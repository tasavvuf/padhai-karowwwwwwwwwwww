import { getDatabase } from "../client";
import type { WeeklyPlan } from "@/types/models";

interface PlanRow {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  status: string;
  locked_at: number | null;
  created_at: number;
  updated_at: number;
}

function rowToPlan(row: PlanRow): WeeklyPlan {
  return {
    id: row.id,
    userId: row.user_id,
    weekStart: row.week_start,
    weekEnd: row.week_end,
    status: row.status as WeeklyPlan["status"],
    lockedAt: row.locked_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getPlanForWeek(userId: string, weekStart: string): Promise<WeeklyPlan | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<PlanRow>(
    "SELECT * FROM weekly_plans WHERE user_id = ? AND week_start = ?",
    [userId, weekStart]
  );
  return row ? rowToPlan(row) : null;
}

export async function createPlan(plan: {
  userId: string;
  weekStart: string;
  weekEnd: string;
  status: WeeklyPlan["status"];
}): Promise<WeeklyPlan> {
  const db = await getDatabase();
  const now = Date.now();
  const id = `plan-${now}-${Math.random().toString(36).slice(2, 8)}`;

  await db.runAsync(
    `INSERT INTO weekly_plans (id, user_id, week_start, week_end, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, plan.userId, plan.weekStart, plan.weekEnd, plan.status, now, now]
  );

  return rowToPlan({
    id, user_id: plan.userId, week_start: plan.weekStart, week_end: plan.weekEnd,
    status: plan.status, locked_at: null, created_at: now, updated_at: now,
  } as PlanRow);
}

export async function updatePlanStatus(id: string, status: WeeklyPlan["status"]): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  const lockedAt = status === "locked" ? now : null;

  await db.runAsync(
    "UPDATE weekly_plans SET status = ?, locked_at = COALESCE(?, locked_at), updated_at = ? WHERE id = ?",
    [status, lockedAt, now, id]
  );
}
