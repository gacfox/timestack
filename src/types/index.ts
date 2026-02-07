export interface BaseItem {
  id: string;
  title: string;
  description?: string;
  priority: "high" | "medium" | "low";
  createdAt: Date;
  updatedAt: Date;
}

export interface Event extends BaseItem {
  type: "event";
  startTime: Date;
  endTime: Date;
}

export interface Task extends BaseItem {
  type: "task";
  startTime: Date;
  dueDate: Date;
  isCompleted: boolean;
}

export interface Appointment extends BaseItem {
  type: "appointment";
  startTime: Date;
  endTime: Date;
  reminderEnabled: boolean;
  reminderMinutesBefore: number;
  reminderSent: boolean;
}

export type CalendarItem = Event | Task | Appointment;

export interface Settings {
  theme: "light" | "dark" | "system";
  llm: {
    apiKey: string;
    baseUrl?: string;
    modelName: string;
  };
  reportTemplates: {
    daily: string;
    weekly: string;
    monthly: string;
    yearly: string;
  };
}
