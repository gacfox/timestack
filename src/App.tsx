import { useEffect } from "react";
import MainContent from "@/components/layout/MainContent";
import { useAppointmentReminder } from "@/hooks/useAppointmentReminder";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useAppStore } from "@/stores/useAppStore";

function App() {
  useAppointmentReminder();
  const { settings, loadSettings } = useSettingsStore();
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (settings?.theme) {
      setTheme(settings.theme);
    }
  }, [settings?.theme, setTheme]);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const mode =
        theme === "system" ? (media.matches ? "dark" : "light") : theme;
      root.classList.toggle("dark", mode === "dark");
    };
    applyTheme();
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [theme]);

  return <MainContent />;
}

export default App;
