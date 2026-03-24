import { PIXELS_PER_MINUTE } from "@/constants";
import { CalendarItem } from "@/types";
import { isSameDay, startOfDay } from "date-fns";

export interface OverlappingGroup {
  items: CalendarItem[];
  width: number;
}

export function findOverlappingGroups(
  items: CalendarItem[],
): OverlappingGroup[] {
  const sortedItems = [...items].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime(),
  );

  const groups: OverlappingGroup[] = [];

  for (const item of sortedItems) {
    let added = false;

    for (const group of groups) {
      const overlaps = group.items.some((groupItem) =>
        timesOverlap(item, groupItem),
      );

      if (overlaps) {
        group.items.push(item);
        added = true;
        break;
      }
    }

    if (!added) {
      groups.push({ items: [item], width: 100 });
    }
  }

  return groups;
}

function timesOverlap(a: CalendarItem, b: CalendarItem): boolean {
  const aStart = a.startTime?.getTime() || 0;
  const aEnd =
    a.type === "event" || a.type === "appointment"
      ? a.endTime?.getTime() || (a.startTime?.getTime() || 0) + 15 * 60 * 1000
      : (a.startTime?.getTime() || 0) + 15 * 60 * 1000;
  const bStart = b.startTime?.getTime() || 0;
  const bEnd =
    b.type === "event" || b.type === "appointment"
      ? b.endTime?.getTime() || (b.startTime?.getTime() || 0) + 15 * 60 * 1000
      : (b.startTime?.getTime() || 0) + 15 * 60 * 1000;

  return aStart < bEnd && bStart < aEnd;
}

export function getOverlapIndex(
  item: CalendarItem,
  items: CalendarItem[],
): number {
  const overlappingItems = items.filter(
    (other) => other.id !== item.id && timesOverlap(item, other),
  );
  const itemStart = item.startTime?.getTime() || 0;

  return overlappingItems.filter((other) => {
    const otherStart = other.startTime?.getTime() || 0;
    if (otherStart < itemStart) return true;
    if (otherStart === itemStart) return other.id < item.id;
    return false;
  }).length;
}

export function calculateItemWidth(
  item: CalendarItem,
  items: CalendarItem[],
): number {
  const overlappingItems = items.filter(
    (other) => other.id !== item.id && timesOverlap(item, other),
  );

  return 100 / (overlappingItems.length + 1);
}

export function calculateItemLeftPosition(
  item: CalendarItem,
  items: CalendarItem[],
): number {
  const overlappingItems = items
    .filter((other) => other.id !== item.id && timesOverlap(item, other))
    .sort(
      (a, b) => (a.startTime?.getTime() || 0) - (b.startTime?.getTime() || 0),
    );

  const index = overlappingItems.findIndex(
    (other) =>
      (other.startTime?.getTime() || 0) < (item.startTime?.getTime() || 0) ||
      ((other.startTime?.getTime() || 0) === (item.startTime?.getTime() || 0) &&
        other.id < item.id),
  );

  const totalOverlapping = overlappingItems.length + 1;

  if (index === -1) {
    return 0;
  }

  return index * (100 / totalOverlapping);
}

export function timeToPixel(hour: number, minute: number): number {
  return (hour * 60 + minute) * PIXELS_PER_MINUTE;
}

export function pixelToTime(pixels: number): { hour: number; minute: number } {
  const totalMinutes = pixels / PIXELS_PER_MINUTE;
  const hour = Math.floor(totalMinutes / 60);
  const minute = Math.round(totalMinutes % 60);
  return { hour, minute };
}

export function getItemTop(startTime: Date): number {
  if (!startTime || !(startTime instanceof Date)) {
    return 0;
  }
  return timeToPixel(startTime.getHours(), startTime.getMinutes());
}

export function getItemHeight(item: CalendarItem): number {
  if (item.type === "task") {
    return 15 * PIXELS_PER_MINUTE;
  }

  const startTime = item.startTime?.getTime() || 0;
  const endTime = item.endTime?.getTime() || startTime;
  const duration = (endTime - startTime) / (1000 * 60);
  return Math.max(15, duration) * PIXELS_PER_MINUTE;
}

export function isBeforeEnd(item: CalendarItem, time: Date): boolean {
  if (item.type === "task") {
    return item.dueDate > time;
  }
  return item.endTime > time;
}

export function filterItemsForDate(
  items: CalendarItem[],
  date: Date,
): CalendarItem[] {
  const dayStart = startOfDay(date);

  return items.filter((item) => {
    const itemStart = startOfDay(item.startTime);

    return isSameDay(itemStart, dayStart);
  });
}
