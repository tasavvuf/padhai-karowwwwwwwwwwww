import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync("padhaikarow.db");
  await initializeDatabase(db);
  return db;
}

async function initializeDatabase(database: SQLite.SQLiteDatabase) {
  await database.execAsync("PRAGMA journal_mode = WAL;");
  await database.execAsync("PRAGMA foreign_keys = ON;");

  const result = await database.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion < 1) {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        avatar_url TEXT,
        timezone TEXT DEFAULT 'UTC',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS weekly_plans (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        week_start TEXT NOT NULL,
        week_end TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'draft',
        locked_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS study_tasks (
        id TEXT PRIMARY KEY,
        plan_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        subject TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        target_minutes INTEGER NOT NULL,
        category TEXT,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'planned',
        completion_threshold REAL DEFAULT 0.9,
        allowed_apps TEXT,
        distracting_apps TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS focus_sessions (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        planned_start INTEGER NOT NULL,
        planned_end INTEGER NOT NULL,
        actual_start INTEGER,
        actual_end INTEGER,
        total_focused_ms INTEGER DEFAULT 0,
        total_interrupted_ms INTEGER DEFAULT 0,
        interruption_count INTEGER DEFAULT 0,
        completion_percentage REAL DEFAULT 0,
        monitoring_valid INTEGER DEFAULT 1,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS focus_events (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        app_package TEXT,
        app_name TEXT,
        metadata TEXT,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS distraction_profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        distracting_apps TEXT NOT NULL,
        allowed_apps TEXT,
        is_default INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        payload TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        retries INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS app_preferences (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_tasks_date ON study_tasks(date);
      CREATE INDEX IF NOT EXISTS idx_tasks_plan ON study_tasks(plan_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_task ON focus_sessions(task_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_user ON focus_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_events_session ON focus_events(session_id);
      CREATE INDEX IF NOT EXISTS idx_sync_status ON sync_queue(status);
    `);

    await database.execAsync("PRAGMA user_version = 1");
  }

  if (currentVersion < 2) {
    await database.execAsync(`
      ALTER TABLE sync_queue ADD COLUMN next_attempt_at INTEGER;
      ALTER TABLE sync_queue ADD COLUMN last_error TEXT;
      UPDATE sync_queue SET next_attempt_at = created_at WHERE next_attempt_at IS NULL;
      PRAGMA user_version = 2;
    `);
  }
}
