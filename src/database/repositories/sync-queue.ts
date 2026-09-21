import { getDatabase } from "../client";

export async function addToSyncQueue(
  entityType: string,
  entityId: string,
  operation: "create" | "update" | "delete",
  payload: Record<string, unknown>
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO sync_queue (entity_type, entity_id, operation, payload, status, retries, created_at, next_attempt_at)
     VALUES (?, ?, ?, ?, 'pending', 0, ?, ?)`,
    [entityType, entityId, operation, JSON.stringify(payload), Date.now(), Date.now()]
  );
}

export async function getPendingSyncItems(): Promise<Array<{
  id: number;
  entity_type: string;
  entity_id: string;
  operation: string;
  payload: string;
  retries: number;
  next_attempt_at: number | null;
  last_error: string | null;
}>> {
  const db = await getDatabase();
  return db.getAllAsync(
    "SELECT * FROM sync_queue WHERE status = 'pending' AND (next_attempt_at IS NULL OR next_attempt_at <= ?) ORDER BY created_at ASC LIMIT 50",
    [Date.now()]
  );
}

export async function markSyncSuccess(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM sync_queue WHERE id = ?", [id]);
}

export async function markSyncFailed(id: number, error: string): Promise<void> {
  const db = await getDatabase();
  const item = await db.getFirstAsync<{ retries: number }>("SELECT retries FROM sync_queue WHERE id = ?", [id]);
  const retries = (item?.retries ?? 0) + 1;
  const retryDelayMs = Math.min(15 * 60 * 1000, 1000 * 2 ** retries);
  await db.runAsync(
    "UPDATE sync_queue SET retries = ?, next_attempt_at = ?, last_error = ?, status = CASE WHEN ? >= 5 THEN 'failed' ELSE 'pending' END WHERE id = ?",
    [retries, Date.now() + retryDelayMs, error.slice(0, 500), retries, id]
  );
}

export async function retryFailedSyncItems(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("UPDATE sync_queue SET status = 'pending', retries = 0, next_attempt_at = ?, last_error = NULL WHERE status = 'failed'", [Date.now()]);
}

export async function getSyncQueueStats(): Promise<{ pending: number; failed: number }> {
  const db = await getDatabase();
  const pending = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM sync_queue WHERE status = 'pending'"
  );
  const failed = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM sync_queue WHERE status = 'failed'"
  );
  return { pending: pending?.count ?? 0, failed: failed?.count ?? 0 };
}
