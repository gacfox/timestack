import { useState } from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTaskStore } from "@/stores/useTaskStore";
import { useAppStore } from "@/stores/useAppStore";

type SortOption = "dueDate" | "priority" | "created";

export default function TaskList() {
  const tasks = useTaskStore((state) => state.tasks);
  const toggleTaskComplete = useTaskStore((state) => state.toggleTaskComplete);
  const showCompleted = useAppStore((state) => state.showCompletedTasks);
  const setShowCompleted = useAppStore((state) => state.setShowCompletedTasks);
  const [sortBy, setSortBy] = useState<SortOption>("dueDate");
  const [detailTask, setDetailTask] = useState<any>(null);

  const incompleteTasks = tasks.filter((t) => !t.isCompleted);
  const completeTasks = tasks.filter((t) => t.isCompleted);

  const sortedTasks = (list: any[], forceSortBy?: SortOption) => {
    const activeSort = forceSortBy ?? sortBy;
    return [...list].sort((a, b) => {
      if (activeSort === "dueDate") {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (activeSort === "priority") {
        const priorityOrder: Record<string, number> = {
          high: 0,
          medium: 1,
          low: 2,
        };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={sortBy === "dueDate" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("dueDate")}
          >
            按截止日期
          </Button>
          <Button
            variant={sortBy === "priority" ? "default" : "outline"}
            size="sm"
            onClick={() => setSortBy("priority")}
          >
            按优先级
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCompleted(!showCompleted)}
        >
          {showCompleted ? "隐藏已完成" : "显示已完成"}
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            未完成任务 ({incompleteTasks.length})
          </h3>
          <div className="space-y-2">
            {incompleteTasks.length === 0 ? (
              <Card className="p-4 text-center text-muted-foreground">
                没有未完成的任务
              </Card>
            ) : (
              sortedTasks(incompleteTasks).map((task) => (
                <TaskCardItem
                  key={task.id}
                  task={task}
                  onToggle={() => toggleTaskComplete(task.id)}
                  onShowDetail={() => setDetailTask(task)}
                />
              ))
            )}
          </div>
        </div>

        {showCompleted && completeTasks.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              已完成任务 ({completeTasks.length})
            </h3>
            <div className="space-y-2">
              {sortedTasks(completeTasks, "dueDate")
                .reverse()
                .map((task) => (
                  <TaskCardItem
                    key={task.id}
                    task={task}
                    onToggle={() => toggleTaskComplete(task.id)}
                    onShowDetail={() => setDetailTask(task)}
                  />
                ))}
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!detailTask} onOpenChange={() => setDetailTask(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{detailTask?.title || "任务详情"}</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-64 overflow-auto">
            {detailTask?.description || "暂无详情"}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface TaskCardItemProps {
  task: any;
  onToggle: () => void;
  onShowDetail: () => void;
}

function TaskCardItem({ task, onToggle, onShowDetail }: TaskCardItemProps) {
  const priorityColors: Record<string, string> = {
    high: "bg-red-500",
    medium: "bg-yellow-500",
    low: "bg-blue-500",
  };

  return (
    <Card className="p-4 flex items-start gap-3 hover:shadow-md transition-shadow cursor-pointer">
      <button
        className={`flex-shrink-0 w-5 h-5 rounded border ${
          task.isCompleted ? "bg-primary border-primary" : "border-primary"
        } flex items-center justify-center mt-0.5`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        {task.isCompleted && (
          <svg
            className="w-3.5 h-3.5 text-primary-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4
            className={`font-medium ${task.isCompleted ? "line-through text-muted-foreground" : ""}`}
          >
            {task.title || "无标题"}
          </h4>
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onShowDetail();
            }}
          >
            详情
          </Button>
          <div
            className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`}
            title={`优先级: ${task.priority}`}
          />
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>截止: {format(task.dueDate, "yyyy-MM-dd HH:mm")}</span>
        </div>
      </div>
    </Card>
  );
}
