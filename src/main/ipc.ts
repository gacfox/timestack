import { ipcMain } from "electron";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { initializeDatabase } from "./database";
import type { Event, Task, Appointment, Settings } from "../types";
import {
  REPORT_TEMPLATE_DAILY,
  REPORT_TEMPLATE_WEEKLY,
  REPORT_TEMPLATE_QUARTERLY,
  REPORT_TEMPLATE_YEARLY,
} from "../constants/reportTemplates";

let db: ReturnType<typeof initializeDatabase>;

export const initializeDatabaseHandlers = () => {
  db = initializeDatabase();

  const defaultSettings: Settings = {
    theme: "system",
    llm: {
      apiKey: "",
      baseUrl: "",
      modelName: "",
    },
    reportTemplates: {
      daily: REPORT_TEMPLATE_DAILY,
      weekly: REPORT_TEMPLATE_WEEKLY,
      monthly: REPORT_TEMPLATE_QUARTERLY,
      yearly: REPORT_TEMPLATE_YEARLY,
    },
  };

  const existingSettings = db
    .prepare("SELECT id FROM settings WHERE id = 1")
    .get();
  if (!existingSettings) {
    const now = Date.now();
    db.prepare(
      `
      INSERT INTO settings (
        id, theme, llm_api_key, llm_base_url, llm_model_name,
        report_daily, report_weekly, report_monthly, report_yearly, updated_at
      )
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      defaultSettings.theme,
      defaultSettings.llm.apiKey,
      defaultSettings.llm.baseUrl || "",
      defaultSettings.llm.modelName,
      defaultSettings.reportTemplates.daily,
      defaultSettings.reportTemplates.weekly,
      defaultSettings.reportTemplates.monthly,
      defaultSettings.reportTemplates.yearly,
      now,
    );
  }

  ipcMain.handle("db:get-events", async () => {
    const stmt = db.prepare("SELECT * FROM events ORDER BY start_time");
    return stmt.all().map((row: any) => ({
      ...row,
      type: "event" as const,
      startTime: new Date(row.start_time),
      endTime: new Date(row.end_time),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  });

  ipcMain.handle(
    "db:add-event",
    async (_, event: Omit<Event, "id" | "createdAt" | "updatedAt">) => {
      const id = crypto.randomUUID();
      const now = Date.now();
      db.prepare(
        `
      INSERT INTO events (id, title, description, priority, start_time, end_time, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      ).run(
        id,
        event.title,
        event.description,
        event.priority,
        event.startTime.getTime(),
        event.endTime.getTime(),
        now,
        now,
      );
      return id;
    },
  );

  ipcMain.handle(
    "db:update-event",
    async (_, id: string, updates: Partial<Event>) => {
      const now = Date.now();
      const setClause = [];
      const params: any[] = [];

      if (updates.title !== undefined) {
        setClause.push("title = ?");
        params.push(updates.title);
      }
      if (updates.description !== undefined) {
        setClause.push("description = ?");
        params.push(updates.description);
      }
      if (updates.priority !== undefined) {
        setClause.push("priority = ?");
        params.push(updates.priority);
      }
      if (updates.startTime !== undefined) {
        setClause.push("start_time = ?");
        params.push(updates.startTime.getTime());
      }
      if (updates.endTime !== undefined) {
        setClause.push("end_time = ?");
        params.push(updates.endTime.getTime());
      }

      setClause.push("updated_at = ?");
      params.push(now);
      params.push(id);

      db.prepare(`UPDATE events SET ${setClause.join(", ")} WHERE id = ?`).run(
        ...params,
      );
      return true;
    },
  );

  ipcMain.handle("db:delete-event", async (_, id: string) => {
    db.prepare("DELETE FROM events WHERE id = ?").run(id);
    return true;
  });

  ipcMain.handle("db:get-tasks", async () => {
    const stmt = db.prepare("SELECT * FROM tasks ORDER BY due_date");
    return stmt.all().map((row: any) => ({
      ...row,
      type: "task" as const,
      startTime: new Date(row.start_time),
      dueDate: new Date(row.due_date),
      isCompleted: Boolean(row.is_completed),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  });

  ipcMain.handle(
    "db:add-task",
    async (_, task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
      const id = crypto.randomUUID();
      const now = Date.now();
      db.prepare(
        `
      INSERT INTO tasks (id, title, description, priority, start_time, due_date, is_completed, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      ).run(
        id,
        task.title,
        task.description,
        task.priority,
        task.startTime.getTime(),
        task.dueDate.getTime(),
        task.isCompleted ? 1 : 0,
        now,
        now,
      );
      return id;
    },
  );

  ipcMain.handle(
    "db:update-task",
    async (_, id: string, updates: Partial<Task>) => {
      const now = Date.now();
      const setClause = [];
      const params: any[] = [];

      if (updates.title !== undefined) {
        setClause.push("title = ?");
        params.push(updates.title);
      }
      if (updates.description !== undefined) {
        setClause.push("description = ?");
        params.push(updates.description);
      }
      if (updates.priority !== undefined) {
        setClause.push("priority = ?");
        params.push(updates.priority);
      }
      if (updates.startTime !== undefined) {
        setClause.push("start_time = ?");
        params.push(updates.startTime.getTime());
      }
      if (updates.dueDate !== undefined) {
        setClause.push("due_date = ?");
        params.push(updates.dueDate.getTime());
      }
      if (updates.isCompleted !== undefined) {
        setClause.push("is_completed = ?");
        params.push(updates.isCompleted ? 1 : 0);
      }

      setClause.push("updated_at = ?");
      params.push(now);
      params.push(id);

      db.prepare(`UPDATE tasks SET ${setClause.join(", ")} WHERE id = ?`).run(
        ...params,
      );
      return true;
    },
  );

  ipcMain.handle("db:delete-task", async (_, id: string) => {
    db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
    return true;
  });

  ipcMain.handle("db:get-appointments", async () => {
    const stmt = db.prepare("SELECT * FROM appointments ORDER BY start_time");
    return stmt.all().map((row: any) => ({
      ...row,
      type: "appointment" as const,
      startTime: new Date(row.start_time),
      endTime: new Date(row.end_time),
      reminderEnabled: Boolean(row.reminder_enabled),
      reminderMinutesBefore: row.reminder_minutes_before,
      reminderSent: Boolean(row.reminder_sent),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  });

  ipcMain.handle(
    "db:add-appointment",
    async (
      _,
      appointment: Omit<
        Appointment,
        "id" | "createdAt" | "updatedAt" | "reminderSent"
      >,
    ) => {
      const id = crypto.randomUUID();
      const now = Date.now();
      db.prepare(
        `
      INSERT INTO appointments (id, title, description, priority, start_time, end_time, reminder_enabled, reminder_minutes_before, reminder_sent, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      ).run(
        id,
        appointment.title,
        appointment.description,
        appointment.priority,
        appointment.startTime.getTime(),
        appointment.endTime.getTime(),
        appointment.reminderEnabled ? 1 : 0,
        appointment.reminderMinutesBefore,
        0,
        now,
        now,
      );
      return id;
    },
  );

  ipcMain.handle(
    "db:update-appointment",
    async (_, id: string, updates: Partial<Appointment>) => {
      const now = Date.now();
      const setClause = [];
      const params: any[] = [];

      if (updates.title !== undefined) {
        setClause.push("title = ?");
        params.push(updates.title);
      }
      if (updates.description !== undefined) {
        setClause.push("description = ?");
        params.push(updates.description);
      }
      if (updates.priority !== undefined) {
        setClause.push("priority = ?");
        params.push(updates.priority);
      }
      if (updates.startTime !== undefined) {
        setClause.push("start_time = ?");
        params.push(updates.startTime.getTime());
      }
      if (updates.endTime !== undefined) {
        setClause.push("end_time = ?");
        params.push(updates.endTime.getTime());
      }
      if (updates.reminderEnabled !== undefined) {
        setClause.push("reminder_enabled = ?");
        params.push(updates.reminderEnabled ? 1 : 0);
      }
      if (updates.reminderMinutesBefore !== undefined) {
        setClause.push("reminder_minutes_before = ?");
        params.push(updates.reminderMinutesBefore);
      }
      if (updates.reminderSent !== undefined) {
        setClause.push("reminder_sent = ?");
        params.push(updates.reminderSent ? 1 : 0);
      }

      setClause.push("updated_at = ?");
      params.push(now);
      params.push(id);

      db.prepare(
        `UPDATE appointments SET ${setClause.join(", ")} WHERE id = ?`,
      ).run(...params);
      return true;
    },
  );

  ipcMain.handle("db:delete-appointment", async (_, id: string) => {
    db.prepare("DELETE FROM appointments WHERE id = ?").run(id);
    return true;
  });

  ipcMain.handle("db:get-reports", async () => {
    const stmt = db.prepare(
      "SELECT * FROM reports ORDER BY end_date DESC, created_at DESC",
    );
    return stmt.all().map((row: any) => ({
      ...row,
      startDate: new Date(row.start_date),
      endDate: new Date(row.end_date),
      createdAt: new Date(row.created_at),
    }));
  });

  ipcMain.handle(
    "db:add-report",
    async (
      _,
      report: {
        type: "daily" | "weekly" | "quarterly" | "yearly";
        content: string;
        startDate: number;
        endDate: number;
      },
    ) => {
      const id = crypto.randomUUID();
      const now = Date.now();
      db.prepare(
        `
      INSERT INTO reports (id, type, content, start_date, end_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      ).run(
        id,
        report.type,
        report.content,
        report.startDate,
        report.endDate,
        now,
      );
      return id;
    },
  );

  ipcMain.handle("db:delete-report", async (_, id: string) => {
    db.prepare("DELETE FROM reports WHERE id = ?").run(id);
    return true;
  });

  ipcMain.handle(
    "db:update-report",
    async (
      _,
      id: string,
      updates: {
        type?: "daily" | "weekly" | "quarterly" | "yearly";
        content?: string;
        startDate?: number;
        endDate?: number;
      },
    ) => {
      const setClause = [];
      const params: any[] = [];

      if (updates.type !== undefined) {
        setClause.push("type = ?");
        params.push(updates.type);
      }
      if (updates.content !== undefined) {
        setClause.push("content = ?");
        params.push(updates.content);
      }
      if (updates.startDate !== undefined) {
        setClause.push("start_date = ?");
        params.push(updates.startDate);
      }
      if (updates.endDate !== undefined) {
        setClause.push("end_date = ?");
        params.push(updates.endDate);
      }

      if (setClause.length === 0) return true;

      params.push(id);
      db.prepare(`UPDATE reports SET ${setClause.join(", ")} WHERE id = ?`).run(
        ...params,
      );
      return true;
    },
  );

  ipcMain.handle("db:get-settings", async () => {
    const row: any = db.prepare("SELECT * FROM settings WHERE id = 1").get();
    if (!row) return defaultSettings;
    return {
      theme: row.theme,
      llm: {
        apiKey: row.llm_api_key,
        baseUrl: row.llm_base_url,
        modelName: row.llm_model_name,
      },
      reportTemplates: {
        daily: row.report_daily,
        weekly: row.report_weekly,
        monthly: row.report_monthly,
        yearly: row.report_yearly,
      },
    } as Settings;
  });

  ipcMain.handle(
    "db:update-settings",
    async (_, updates: Partial<Settings>) => {
      const row: any = db.prepare("SELECT * FROM settings WHERE id = 1").get();
      const current = row
        ? {
            theme: row.theme,
            llm: {
              apiKey: row.llm_api_key,
              baseUrl: row.llm_base_url,
              modelName: row.llm_model_name,
            },
            reportTemplates: {
              daily: row.report_daily,
              weekly: row.report_weekly,
              monthly: row.report_monthly,
              yearly: row.report_yearly,
            },
          }
        : defaultSettings;

      const merged: Settings = {
        theme: updates.theme ?? current.theme,
        llm: {
          apiKey: updates.llm?.apiKey ?? current.llm.apiKey,
          baseUrl: updates.llm?.baseUrl ?? current.llm.baseUrl,
          modelName: updates.llm?.modelName ?? current.llm.modelName,
        },
        reportTemplates: {
          daily:
            updates.reportTemplates?.daily ?? current.reportTemplates.daily,
          weekly:
            updates.reportTemplates?.weekly ?? current.reportTemplates.weekly,
          monthly:
            updates.reportTemplates?.monthly ?? current.reportTemplates.monthly,
          yearly:
            updates.reportTemplates?.yearly ?? current.reportTemplates.yearly,
        },
      };

      const now = Date.now();
      db.prepare(
        `
      UPDATE settings SET
        theme = ?,
        llm_api_key = ?,
        llm_base_url = ?,
        llm_model_name = ?,
        report_daily = ?,
        report_weekly = ?,
        report_monthly = ?,
        report_yearly = ?,
        updated_at = ?
      WHERE id = 1
    `,
      ).run(
        merged.theme,
        merged.llm.apiKey,
        merged.llm.baseUrl || "",
        merged.llm.modelName,
        merged.reportTemplates.daily,
        merged.reportTemplates.weekly,
        merged.reportTemplates.monthly,
        merged.reportTemplates.yearly,
        now,
      );

      return merged;
    },
  );

  ipcMain.handle(
    "llm:generate-report",
    async (
      event,
      {
        requestId,
        systemPrompt,
        userPrompt,
      }: { requestId: string; systemPrompt: string; userPrompt: string },
    ) => {
      try {
        const row: any = db
          .prepare("SELECT * FROM settings WHERE id = 1")
          .get();
        if (!row || !row.llm_api_key) {
          event.sender.send("llm:report-error", {
            requestId,
            error: "请先在系统设置中配置 API Key",
          });
          return true;
        }

        const model = new ChatOpenAI({
          apiKey: row.llm_api_key,
          model: row.llm_model_name || "gpt-4o-mini",
          temperature: 0.2,
          ...(row.llm_base_url
            ? { configuration: { baseURL: row.llm_base_url } }
            : {}),
        });

        const messages = [];
        if (systemPrompt?.trim()) {
          messages.push(new SystemMessage(systemPrompt));
        }
        messages.push(new HumanMessage(userPrompt));
        const stream = await model.stream(messages);
        for await (const chunk of stream) {
          const content =
            typeof chunk?.content === "string"
              ? chunk.content
              : Array.isArray(chunk?.content)
                ? chunk.content
                    .map((part: any) =>
                      typeof part === "string" ? part : part?.text || "",
                    )
                    .join("")
                : "";
          if (content) {
            event.sender.send("llm:report-chunk", { requestId, content });
          }
        }
        event.sender.send("llm:report-done", { requestId });
        return true;
      } catch (error: any) {
        event.sender.send("llm:report-error", {
          requestId,
          error: error?.message || "生成报告失败",
        });
        return true;
      }
    },
  );
};
