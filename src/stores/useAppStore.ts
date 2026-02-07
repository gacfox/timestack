import { create } from "zustand";
import { ThemeType } from "@/constants";

interface AppStore {
  currentDate: Date;
  selectedDate: Date;
  viewMode: "day" | "week" | "next_4_days" | "around_5_days";
  theme: ThemeType;
  showCompletedTasks: boolean;
  scrollToTime: Date | null;
  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date) => void;
  setViewMode: (mode: "day" | "week" | "next_4_days" | "around_5_days") => void;
  setTheme: (theme: ThemeType) => void;
  setShowCompletedTasks: (show: boolean) => void;
  setScrollToTime: (time: Date | null) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  currentDate: new Date(),
  selectedDate: new Date(),
  viewMode: "day",
  theme: "system",
  showCompletedTasks: false,
  scrollToTime: null,
  setCurrentDate: (date) => set({ currentDate: date }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setTheme: (theme) => set({ theme }),
  setShowCompletedTasks: (show) => set({ showCompletedTasks: show }),
  setScrollToTime: (time) => set({ scrollToTime: time }),
}));
