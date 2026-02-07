import { format, addDays, subDays, startOfWeek } from "date-fns";
import { zhCN } from "date-fns/locale";
import { ViewModeType } from "@/constants";

export function getDatesForView(
  viewMode: ViewModeType,
  baseDate: Date,
): Date[] {
  switch (viewMode) {
    case "day":
      return [baseDate];
    case "week":
      const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 });
      return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    case "next_4_days":
      return [
        baseDate,
        ...Array.from({ length: 3 }, (_, i) => addDays(baseDate, i + 1)),
      ];
    case "around_5_days":
      return [
        ...Array.from({ length: 2 }, (_, i) => subDays(baseDate, 2 - i)),
        baseDate,
        ...Array.from({ length: 2 }, (_, i) => addDays(baseDate, i + 1)),
      ];
    default:
      return [baseDate];
  }
}

export function formatDateLabel(date: Date): string {
  return format(date, "MM/dd EEEE", { locale: zhCN });
}

export function formatTimeRange(start: Date, end: Date): string {
  const startStr = format(start, "HH:mm");
  const endStr = format(end, "HH:mm");
  return `${startStr} - ${endStr}`;
}

export function formatDateTime(date: Date): string {
  return format(date, "yyyy-MM-dd HH:mm");
}

export function roundToMinutes(date: Date, minutes: number = 15): Date {
  const ms = 1000 * 60 * minutes;
  return new Date(Math.round(date.getTime() / ms) * ms);
}

export function snapToTime(date: Date, minutes: number = 15): Date {
  return roundToMinutes(date, minutes);
}

export function isSameHour(date1: Date, date2: Date): boolean {
  return date1.getHours() === date2.getHours();
}

export function getCurrentTimePosition(): number {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  return (hours * 60 + minutes) * 2; // 2px per minute
}

export function getPaddedNumber(num: number, pad: number = 2): string {
  return num.toString().padStart(pad, "0");
}

export function getDurationMinutes(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

export function subtractMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() - minutes * 60 * 1000);
}
