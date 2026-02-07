import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Calendar as CalendarIcon,
  FileText,
  Settings,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import MiniCalendar from "@/components/calendar/MiniCalendar";
import logo from "@/assets/icon@512.png";

interface SidebarProps {
  onCreateEvent: () => void;
  onCreateTask: () => void;
  onCreateAppointment: () => void;
  onOpenReports: () => void;
  onOpenSettings: () => void;
}

export default function Sidebar({
  onCreateEvent,
  onCreateTask,
  onCreateAppointment,
  onOpenReports,
  onOpenSettings,
}: SidebarProps) {
  const { selectedDate, setSelectedDate, theme, setTheme } = useAppStore();
  const { updateSettings } = useSettingsStore();

  const cycleTheme = async () => {
    const nextTheme =
      theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(nextTheme);
    await updateSettings({ theme: nextTheme });
  };

  const themeIcon =
    theme === "light" ? (
      <Sun className="h-4 w-4" />
    ) : theme === "dark" ? (
      <Moon className="h-4 w-4" />
    ) : (
      <Monitor className="h-4 w-4" />
    );

  return (
    <div className="w-64 bg-secondary border-r flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-4">
          <img src={logo} alt="Timestack" className="h-6 w-6 rounded" />
          <h1 className="text-xl font-bold">Timestack</h1>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={cycleTheme}
            aria-label="切换主题"
            title="切换主题"
          >
            {themeIcon}
          </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              新建
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={onCreateEvent}>
              <CalendarIcon className="w-4 h-4 mr-2" />
              新建事件
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCreateTask}>
              <FileText className="w-4 h-4 mr-2" />
              新建任务
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCreateAppointment}>
              <CalendarIcon className="w-4 h-4 mr-2" />
              新建预约
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="bg-background rounded-lg p-4">
          <MiniCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>
      </div>

      <div className="p-4 border-t space-y-2">
        <Button variant="outline" className="w-full" onClick={onOpenReports}>
          <FileText className="w-4 h-4 mr-2" />
          撰写报告
        </Button>
        <Button variant="ghost" className="w-full" onClick={onOpenSettings}>
          <Settings className="w-4 h-4 mr-2" />
          系统设置
        </Button>
      </div>
    </div>
  );
}
