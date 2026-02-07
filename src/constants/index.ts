export const PIXELS_PER_MINUTE = 2;

export const TIME_STEP_MINUTES = 15;

export const SLOT_HEIGHT = PIXELS_PER_MINUTE * TIME_STEP_MINUTES;

export const DAY_HEIGHT = 24 * 60 * PIXELS_PER_MINUTE;

export const VIEW_MODES = {
  DAY: "day",
  WEEK: "week",
  NEXT_4_DAYS: "next_4_days",
  AROUND_5_DAYS: "around_5_days",
} as const;

export type ViewModeType = (typeof VIEW_MODES)[keyof typeof VIEW_MODES];

export const ITEM_TYPES = {
  EVENT: "event",
  TASK: "task",
  APPOINTMENT: "appointment",
} as const;

export type ItemTypeType = (typeof ITEM_TYPES)[keyof typeof ITEM_TYPES];

export const PRIORITY_LEVELS = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
} as const;

export type PriorityLevel =
  (typeof PRIORITY_LEVELS)[keyof typeof PRIORITY_LEVELS];

export const EVENT_DURATIONS = [15, 30, 45, 60, 90, 120, 150, 180];
export const REMINDER_TIMES = [5, 10, 15, 30, 60, 120, 1440];

export const DEFAULT_EVENT_DURATION_MINUTES = 30;
export const DEFAULT_TASK_HEIGHT_MINUTES = 15;
export const DEFAULT_REMINDER_MINUTES = 30;

export const HOURS_IN_DAY = 24;

export const THEME = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const;

export type ThemeType = (typeof THEME)[keyof typeof THEME];
