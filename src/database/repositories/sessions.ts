import { getDatabase } from "../client";
import type { FocusSession, FocusEvent } from "@/types/models";

interface SessionRow {
  id: string;
  task_id: string;
  user_id: string;
  status: string;
  planned_start: number;
  planned_end: number;
  actual_start: number | null;
  actual_end: number | null;
  total_focused_ms: number;
  total_interrupted_ms: number;
  interruption_count: number;
  completion_percentage: number;
  monitoring_valid: number;
  created_at: number;
  updated_at: number;
}

function rowToSession(row: SessionRow): FocusSession {
  return {
    id: row.id,
    taskId: row.task_id,
    userId: row.user_id,
    status: row.status as FocusSession["status"],
    plannedStart: row.planned_start,
    plannedEnd: row.planned_end,
    actualStart: row.actual_start ?? undefined,
    actualEnd: row.actual_end ?? undefined,
    totalFocusedMs: row.total_focused_ms,
    totalInterruptedMs: row.total_interrupted_ms,
    interruptionCount: row.interruption_count,
    completionPercentage: row.completion_percentage,
    monitoringValid: row.monitoring_valid === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getActiveSession(userId: string): Promise<FocusSession | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<SessionRow>(
    "SELECT * FROM focus_sessions WHERE user_id = ? AND status IN ('active', 'paused', 'interrupted') ORDER BY created_at DESC LIMIT 1",
    [userId]
  );
  return row ? rowToSession(row) : null;
}

export async function createSession(session: {
  taskId: string;
  userId: string;
  plannedStart: number;
  plannedEnd: number;
  actualStart?: number;
}): Promise<FocusSession> {
  const db = await getDatabase();
  const now = Date.now();
  const id = `session-${now}-${Math.random().toString(36).slice(2, 8)}`;

  await db.runAsync(
    `INSERT INTO focus_sessions (id, task_id, user_id, status, planned_start, planned_end, actual_start, total_focused_ms, total_interrupted_ms, interruption_count, completion_percentage, monitoring_valid, created_at, updated_at)
     VALUES (?, ?, ?, 'active', ?, ?, ?, 0, 0, 0, 0, 1, ?, ?)`,
    [id, session.taskId, session.userId, session.plannedStart, session.plannedEnd, session.actualStart ?? now, now, now]
  );

  return rowToSession({
    id, task_id: session.taskId, user_id: session.userId, status: "active",
    planned_start: session.plannedStart, planned_end: session.plannedEnd,
    actual_start: session.actualStart ?? now, actual_end: null,
    total_focused_ms: 0, total_interrupted_ms: 0, interruption_count: 0,
    completion_percentage: 0, monitoring_valid: 1, created_at: now, updated_at: now,
  } as SessionRow);
}

export async function updateSession(id: string, updates: Partial<FocusSession>): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.status !== undefined) { fields.push("status = ?"); values.push(updates.status); }
  if (updates.actualEnd !== undefined) { fields.push("actual_end = ?"); values.push(updates.actualEnd); }
  if (updates.totalFocusedMs !== undefined) { fields.push("total_focused_ms = ?"); values.push(updates.totalFocusedMs); }
  if (updates.totalInterruptedMs !== undefined) { fields.push("total_interrupted_ms = ?"); values.push(updates.totalInterruptedMs); }
  if (updates.interruptionCount !== undefined) { fields.push("interruption_count = ?"); values.push(updates.interruptionCount); }
  if (updates.completionPercentage !== undefined) { fields.push("completion_percentage = ?"); values.push(updates.completionPercentage); }
  if (updates.monitoringValid !== undefined) { fields.push("monitoring_valid = ?"); values.push(updates.monitoringValid ? 1 : 0); }

  if (fields.length === 0) return;
  fields.push("updated_at = ?");
  values.push(now);
  values.push(id);

  await db.runAsync(`UPDATE focus_sessions SET ${fields.join(", ")} WHERE id = ?`, values);
}

export async function addSessionEvent(event: {
  sessionId: string;
  eventType: string;
  timestamp: number;
  appPackage?: string;
  appName?: string;
  metadata?: string;
}): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  const id = `event-${now}-${Math.random().toString(36).slice(2, 8)}`;

  await db.runAsync(
    `INSERT INTO focus_events (id, session_id, event_type, timestamp, app_package, app_name, metadata, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, event.sessionId, event.eventType, event.timestamp, event.appPackage ?? null, event.appName ?? null, event.metadata ?? null, now]
  );
}

export async function getRecentSessions(userId: string, limit: number = 10): Promise<FocusSession[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<SessionRow>(
    "SELECT * FROM focus_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
    [userId, limit]
  );
  return rows.map(rowToSession);
}
