import { format } from "date-fns";
import { isSameDay } from "date-fns";
import { Target } from "lucide-react";
import { formatDateLabel } from "@/utils/time";
import { useTaskStore } from "@/stores/useTaskStore";
import { useAppStore } from "@/stores/useAppStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DateHeaderProps {
  dates: Date[];
}

export default function DateHeader({ dates }: DateHeaderProps) {
  const setSelectedDate = useAppStore((state) => state.setSelectedDate);
  const setScrollToTime = useAppStore((state) => state.setScrollToTime);
  const tasks = useTaskStore((state) => state.tasks);
  const toggleTaskComplete = useTaskStore((state) => state.toggleTaskComplete);

  return (
    <div className="flex border-b bg-muted/50">
      <div className="w-16 flex-shrink-0" />
      {dates.map((date) => {
        const isToday = new Date().toDateString() === date.toDateString();
        const dueTasks = tasks.filter((task) =>
          isSameDay(new Date(task.dueDate), date),
        );
        return (
          <div
            key={date.toISOString()}
            className={`flex-1 text-center py-2 border-l text-sm font-medium ${
              isToday ? "bg-primary/10" : ""
            }`}
          >
            <div
              className={`flex items-center justify-center gap-2 ${isToday ? "text-primary" : ""}`}
            >
              <span>{formatDateLabel(date)}</span>
              {dueTasks.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="inline-flex h-5 w-5 items-center justify-center rounded text-destructive/80 hover:text-destructive hover:bg-destructive/10"
                      aria-label="查看当天到期任务"
                    >
                      <Target className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[200px]">
                    {dueTasks.map((task) => (
                      <DropdownMenuItem
                        key={task.id}
                        className="flex items-center justify-between gap-2"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={task.isCompleted}
                            onChange={() => toggleTaskComplete(task.id)}
                            className="h-3.5 w-3.5 accent-primary"
                          />
                        </label>
                        <button
                          type="button"
                          className={`flex-1 min-w-0 text-left truncate ${
                            task.isCompleted
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                          onClick={() => {
                            setSelectedDate(new Date(task.startTime));
                            setScrollToTime(new Date(task.dueDate));
                          }}
                        >
                          {task.title || "无标题"}
                        </button>
                        <span
                          className={`text-xs text-muted-foreground ${task.isCompleted ? "line-through" : ""}`}
                        >
                          {format(new Date(task.dueDate), "HH:mm")}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
