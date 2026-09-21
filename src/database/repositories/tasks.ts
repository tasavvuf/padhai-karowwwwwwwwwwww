import { getDatabase } from "../client";
import type { StudyTask, TaskStatus } from "@/types/models";

interface TaskRow {
  id: string;
  plan_id: string;
  user_id: string;
  title: string;
  subject: string;
  description: string | null;
  date: string;
  start_time: string;
  end_time: string;
  target_minutes: number;
  category: string | null;
  priority: string;
  status: string;
  completion_threshold: number;
  allowed_apps: string | null;
  distracting_apps: string | null;
  created_at: number;
  updated_at: number;
}

function rowToTask(row: TaskRow): StudyTask {
  return {
    id: row.id,
    planId: row.plan_id,
    userId: row.user_id,
    title: row.title,
    subject: row.subject,
    description: row.description ?? undefined,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    targetMinutes: row.target_minutes,
    category: row.category ?? undefined,
    priority: row.priority as StudyTask["priority"],
    status: row.status as StudyTask["status"],
    completionThreshold: row.completion_threshold,
    allowedApps: row.allowed_apps ? JSON.parse(row.allowed_apps) : undefined,
    distractingApps: row.distracting_apps ? JSON.parse(row.distracting_apps) : undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getTasksForDate(userId: string, date: string): Promise<StudyTask[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TaskRow>(
    "SELECT * FROM study_tasks WHERE user_id = ? AND date = ? ORDER BY start_time",
    [userId, date]
  );
  return rows.map(rowToTask);
}

export async function getTasksForPlan(planId: string): Promise<StudyTask[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TaskRow>(
    "SELECT * FROM study_tasks WHERE plan_id = ? ORDER BY date, start_time",
    [planId]
  );
  return rows.map(rowToTask);
}

export async function getTaskById(id: string): Promise<StudyTask | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<TaskRow>("SELECT * FROM study_tasks WHERE id = ?", [id]);
  return row ? rowToTask(row) : null;
}

export async function createTask(task: Omit<StudyTask, "id" | "created_at" | "updated_at">): Promise<StudyTask> {
  const db = await getDatabase();
  const now = Date.now();
  const id = `task-${now}-${Math.random().toString(36).slice(2, 8)}`;

  await db.runAsync(
    `INSERT INTO study_tasks (id, plan_id, user_id, title, subject, description, date, start_time, end_time, target_minutes, category, priority, status, completion_threshold, allowed_apps, distracting_apps, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, task.planId, task.userId, task.title, task.subject,
      task.description ?? null, task.date, task.startTime, task.endTime,
      task.targetMinutes, task.category ?? null, task.priority,
      task.status, task.completionThreshold,
      task.allowedApps ? JSON.stringify(task.allowedApps) : null,
      task.distractingApps ? JSON.stringify(task.distractingApps) : null,
      now, now,
    ]
  );

  return { ...task, id, createdAt: now, updatedAt: now } as StudyTask;
}

export async function updateTask(id: string, updates: Partial<StudyTask>): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.title !== undefined) { fields.push("title = ?"); values.push(updates.title); }
  if (updates.subject !== undefined) { fields.push("subject = ?"); values.push(updates.subject); }
  if (updates.status !== undefined) { fields.push("status = ?"); values.push(updates.status); }
  if (updates.description !== undefined) { fields.push("description = ?"); values.push(updates.description); }

  if (fields.length === 0) return;

  fields.push("updated_at = ?");
  values.push(now);
  values.push(id);

  await db.runAsync(`UPDATE study_tasks SET ${fields.join(", ")} WHERE id = ?`, values);
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM study_tasks WHERE id = ?", [id]);
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("UPDATE study_tasks SET status = ?, updated_at = ? WHERE id = ?", [status, Date.now(), id]);
}
