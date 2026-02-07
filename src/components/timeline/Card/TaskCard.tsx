import React from "react";
import { format } from "date-fns";
import { getPriorityStyles } from "@/utils/common";
import { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  left: string;
  width: string;
  top: number;
  height: number;
  zIndex?: number;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onToggleComplete: (e: React.MouseEvent) => void;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
  onDragEnd?: (e: React.DragEvent, task: Task) => void;
}

export default function TaskCard({
  task,
  left,
  width,
  top,
  height,
  zIndex,
  onClick,
  onContextMenu,
  onToggleComplete,
  onDragStart,
  onDragEnd,
}: TaskCardProps) {
  const priorityStyle = getPriorityStyles(task.priority);

  const handleDragStart = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        type: "task",
        id: task.id,
        originalStartTime: task.startTime,
        originalDueDate: task.dueDate,
        dragOffsetY: offsetY,
      }),
    );
    if (onDragStart) onDragStart(e, task);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (onDragEnd) onDragEnd(e, task);
  };

  return (
    <div
      draggable
      data-card="true"
      className={`absolute rounded-md border p-2 flex items-center gap-2 cursor-move transition-shadow hover:shadow-md ${priorityStyle.bg} ${priorityStyle.border} ${priorityStyle.hover}`}
      style={{
        left,
        width,
        top: `${top}px`,
        height: `${height}px`,
        zIndex,
      }}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <button
        className={`shrink-0 w-4 h-4 rounded border ${
          task.isCompleted ? "bg-primary border-primary" : "border-primary"
        } flex items-center justify-center`}
        onClick={onToggleComplete}
      >
        {task.isCompleted && (
          <svg
            className="w-3 h-3 text-primary-foreground"
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
      <div
        className={`text-xs font-medium ${priorityStyle.text} truncate flex-1 ${task.isCompleted ? "line-through opacity-70" : ""}`}
      >
        {task.title || "无标题"}
      </div>
      <div
        className={`text-xs ${priorityStyle.text} opacity-70 whitespace-nowrap ${task.isCompleted ? "line-through" : ""}`}
      >
        截止: {format(task.dueDate, "MM/dd")}
      </div>
    </div>
  );
}
