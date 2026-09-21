import { getDatabase } from "@/database/client";
import { getPreference, setPreference } from "@/database/repositories/settings";
import {
    getPendingSyncItems,
    getSyncQueueStats,
    markSyncFailed,
    markSyncSuccess,
} from "@/database/repositories/sync-queue";
import { syncApi } from "@/services/api-client";
import NetInfo from "@react-native-community/netinfo";

const SYNC_INTERVAL_MS = 30000;
let syncInterval: ReturnType<typeof setInterval> | null = null;
let unsubscribeNetwork: (() => void) | null = null;
let syncing = false;

export async function processSyncQueue(): Promise<{
  pending: number;
  failed: number;
}> {
  if (syncing) return getSyncQueueStats();
  const network = await NetInfo.fetch();
  if (!network.isConnected) return getSyncQueueStats();
  syncing = true;
  try {
    const items = await getPendingSyncItems();
    if (items.length > 0) {
      const payload = items.map((item) => ({
        entityType: item.entity_type,
        entityId: item.entity_id,
        operation: item.operation as "create" | "update" | "delete",
        payload: JSON.parse(item.payload) as Record<string, unknown>,
      }));
      const result = await syncApi.push(payload);
      const outcome = new Map(
        result.results.map((item) => [
          `${item.entityType}:${item.entityId}`,
          item.status,
        ]),
      );
      await Promise.all(
        items.map((item) =>
          outcome.get(`${item.entity_type}:${item.entity_id}`) === "ok"
            ? markSyncSuccess(item.id)
            : markSyncFailed(item.id, "The server rejected this change."),
        ),
      );
    }
    const lastSyncAt = Number((await getPreference("last_sync_at")) || 0);
    const pull = await syncApi.pull(lastSyncAt);
    const db = await getDatabase();
    await db.withTransactionAsync(async () => {
      for (const plan of pull.plans) {
        await db.runAsync(
          `INSERT OR REPLACE INTO weekly_plans (id, user_id, week_start, week_end, status, locked_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            plan.id,
            plan.userId,
            plan.weekStart,
            plan.weekEnd,
            plan.status,
            plan.lockedAt ?? null,
            plan.createdAt,
            plan.updatedAt,
          ],
        );
      }
      for (const task of pull.tasks) {
        await db.runAsync(
          `INSERT OR REPLACE INTO study_tasks (id, plan_id, user_id, title, subject, description, date, start_time, end_time, target_minutes, category, priority, status, completion_threshold, allowed_apps, distracting_apps, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            task.id,
            task.planId,
            task.userId,
            task.title,
            task.subject,
            task.description ?? null,
            task.date,
            task.startTime,
            task.endTime,
            task.targetMinutes,
            task.category ?? null,
            task.priority,
            task.status,
            task.completionThreshold,
            task.allowedApps ? JSON.stringify(task.allowedApps) : null,
            task.distractingApps ? JSON.stringify(task.distractingApps) : null,
            task.createdAt,
            task.updatedAt,
          ],
        );
      }
      for (const session of pull.sessions) {
        await db.runAsync(
          `INSERT OR REPLACE INTO focus_sessions (id, task_id, user_id, status, planned_start, planned_end, actual_start, actual_end, total_focused_ms, total_interrupted_ms, interruption_count, completion_percentage, monitoring_valid, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            session.id,
            session.taskId,
            session.userId,
            session.status,
            session.plannedStart,
            session.plannedEnd,
            session.actualStart ?? null,
            session.actualEnd ?? null,
            session.totalFocusedMs,
            session.totalInterruptedMs,
            session.interruptionCount,
            session.completionPercentage,
            session.monitoringValid ? 1 : 0,
            session.createdAt,
            session.updatedAt,
          ],
        );
      }
    });
    await setPreference("last_sync_at", String(pull.pulledAt));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed.";
    const items = await getPendingSyncItems();
    await Promise.all(items.map((item) => markSyncFailed(item.id, message)));
  } finally {
    syncing = false;
  }
  return getSyncQueueStats();
}

export function startSyncService(): void {
  if (syncInterval) return;
  processSyncQueue().catch(() => {});
  syncInterval = setInterval(
    () => processSyncQueue().catch(() => {}),
    SYNC_INTERVAL_MS,
  );
  unsubscribeNetwork = NetInfo.addEventListener((state) => {
    if (state.isConnected) processSyncQueue().catch(() => {});
  });
}

export function stopSyncService(): void {
  if (syncInterval) clearInterval(syncInterval);
  syncInterval = null;
  unsubscribeNetwork?.();
  unsubscribeNetwork = null;
}
