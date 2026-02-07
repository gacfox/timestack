import Database from "better-sqlite3";
import { join } from "path";
import { app } from "electron";
import fs from "fs";

const DB_NAME = "timestack.db";

export const getDbPath = (): string => {
  const userDataPath = app.getPath("userData");
  const dbDir = join(userDataPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  return join(dbDir, DB_NAME);
};

export const initializeDatabase = (): Database.Database => {
  const db = new Database(getDbPath());

  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT NOT NULL,
      start_time INTEGER NOT NULL,
      end_time INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT NOT NULL,
      start_time INTEGER NOT NULL,
      due_date INTEGER NOT NULL,
      is_completed INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT NOT NULL,
      start_time INTEGER NOT NULL,
      end_time INTEGER NOT NULL,
      reminder_enabled INTEGER NOT NULL DEFAULT 0,
      reminder_minutes_before INTEGER NOT NULL DEFAULT 30,
      reminder_sent INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      start_date INTEGER NOT NULL,
      end_date INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      theme TEXT NOT NULL,
      llm_api_key TEXT NOT NULL,
      llm_base_url TEXT NOT NULL,
      llm_model_name TEXT NOT NULL,
      report_daily TEXT NOT NULL,
      report_weekly TEXT NOT NULL,
      report_monthly TEXT NOT NULL,
      report_yearly TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
    CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON appointments(start_time);
  `);

  return db;
};

export const closeDatabase = (db: Database.Database): void => {
  db.close();
};
