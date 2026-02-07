import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const priorityColors = {
  high: {
    bg: "bg-red-100 dark:bg-red-900/30",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-700 dark:text-red-300",
    hover: "hover:bg-red-200 dark:hover:bg-red-900/50",
  },
  medium: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    border: "border-yellow-200 dark:border-yellow-800",
    text: "text-yellow-700 dark:text-yellow-300",
    hover: "hover:bg-yellow-200 dark:hover:bg-yellow-900/50",
  },
  low: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-300",
    hover: "hover:bg-blue-200 dark:hover:bg-blue-900/50",
  },
};

export function getPriorityStyles(priority: "high" | "medium" | "low") {
  return priorityColors[priority];
}
