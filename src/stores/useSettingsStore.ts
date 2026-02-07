import { create } from "zustand";
import { Settings } from "@/types";
import {
  REPORT_TEMPLATE_DAILY,
  REPORT_TEMPLATE_WEEKLY,
  REPORT_TEMPLATE_QUARTERLY,
  REPORT_TEMPLATE_YEARLY,
} from "@/constants/reportTemplates";

interface SettingsStore {
  settings: Settings;
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  updateLLMConfig: (
    apiKey: string,
    baseUrl?: string,
    modelName?: string,
  ) => Promise<void>;
  updateReportTemplate: (
    type: keyof Settings["reportTemplates"],
    template: string,
  ) => Promise<void>;
}

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

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: defaultSettings,
  loadSettings: async () => {
    try {
      if (window.electron?.db?.getSettings) {
        const settings = await window.electron.db.getSettings();
        set({ settings });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  },
  updateSettings: async (updates) => {
    set((state) => ({
      settings: { ...state.settings, ...updates },
    }));
    try {
      if (window.electron?.db?.updateSettings) {
        const merged = await window.electron.db.updateSettings(updates);
        if (merged) set({ settings: merged });
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  },
  updateLLMConfig: async (apiKey, baseUrl, modelName) => {
    const updates: Partial<Settings> = {
      llm: {
        apiKey,
        baseUrl: baseUrl ?? "",
        modelName: modelName ?? "",
      },
    };
    set((state) => ({
      settings: {
        ...state.settings,
        llm: {
          ...state.settings.llm,
          apiKey,
          ...(baseUrl !== undefined && { baseUrl }),
          ...(modelName !== undefined && { modelName }),
        },
      },
    }));
    try {
      if (window.electron?.db?.updateSettings) {
        const merged = await window.electron.db.updateSettings(updates);
        if (merged) set({ settings: merged });
      }
    } catch (error) {
      console.error("Failed to update LLM config:", error);
    }
  },
  updateReportTemplate: async (type, template) => {
    const updates: Partial<Settings> = {
      reportTemplates: {
        [type]: template,
      } as Settings["reportTemplates"],
    };
    set((state) => ({
      settings: {
        ...state.settings,
        reportTemplates: {
          ...state.settings.reportTemplates,
          [type]: template,
        },
      },
    }));
    try {
      if (window.electron?.db?.updateSettings) {
        const merged = await window.electron.db.updateSettings(updates);
        if (merged) set({ settings: merged });
      }
    } catch (error) {
      console.error("Failed to update report template:", error);
    }
  },
}));
