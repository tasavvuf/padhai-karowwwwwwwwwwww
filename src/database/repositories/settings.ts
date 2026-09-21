import { getDatabase } from "../client";

export async function getPreference(key: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM app_preferences WHERE key = ?",
    [key]
  );
  return row?.value ?? null;
}

export async function setPreference(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "INSERT OR REPLACE INTO app_preferences (key, value, updated_at) VALUES (?, ?, ?)",
    [key, value, Date.now()]
  );
}

export async function removePreference(key: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM app_preferences WHERE key = ?", [key]);
}
