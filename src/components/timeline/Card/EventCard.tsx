import { useEffect, useRef, useState } from "react";
import { formatTimeRange, addMinutes } from "@/utils/time";
import { getPriorityStyles } from "@/utils/common";
import { Event } from "@/types";
import { PIXELS_PER_MINUTE, TIME_STEP_MINUTES } from "@/constants";

interface EventCardProps {
  event: Event;
  left: string;
  width: string;
  top: number;
  height: number;
  zIndex?: number;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onDragStart: (e: React.DragEvent, event: Event) => void;
  onDragEnd: (e: React.DragEvent, event: Event) => void;
  onResizeEnd: (endTime: Date) => void;
}

export default function EventCard({
  event,
  left,
  width,
  top,
  height,
  zIndex,
  onClick,
  onContextMenu,
  onDragStart,
  onDragEnd,
  onResizeEnd,
}: EventCardProps) {
  const priorityStyle = getPriorityStyles(event.priority);
  const [resizeHeight, setResizeHeight] = useState<number | null>(null);
  const resizeHeightRef = useRef<number | null>(null);
  const effectiveHeight = resizeHeight ?? height;
  const showTime = effectiveHeight >= 40;

  useEffect(() => {
    setResizeHeight(null);
    resizeHeightRef.current = null;
  }, [height]);

  const handleDragStart = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        type: "event",
        id: event.id,
        originalStartTime: event.startTime,
        originalEndTime: event.endTime,
        dragOffsetY: offsetY,
      }),
    );
    onDragStart(e, event);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    onDragEnd(e, event);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const startHeight = height;
    const startTime = new Date(event.startTime);

    const onMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientY - startY;
      const nextHeight = Math.max(
        TIME_STEP_MINUTES * PIXELS_PER_MINUTE,
        startHeight + delta,
      );
      resizeHeightRef.current = nextHeight;
      setResizeHeight(nextHeight);
    };

    const onUp = () => {
      const finalHeight = resizeHeightRef.current ?? height;
      const rawMinutes = finalHeight / PIXELS_PER_MINUTE;
      const snappedMinutes = Math.max(
        TIME_STEP_MINUTES,
        Math.round(rawMinutes / TIME_STEP_MINUTES) * TIME_STEP_MINUTES,
      );
      const endOfDay = new Date(startTime);
      endOfDay.setHours(24, 0, 0, 0);
      const maxMinutes = Math.max(
        0,
        (endOfDay.getTime() - startTime.getTime()) / (1000 * 60),
      );
      const clampedMinutes = Math.min(snappedMinutes, maxMinutes);
      const nextEndTime = addMinutes(startTime, clampedMinutes);
      setResizeHeight(null);
      resizeHeightRef.current = null;
      onResizeEnd(nextEndTime);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      draggable
      data-card="true"
      className={`absolute rounded-md border p-2 cursor-move transition-shadow hover:shadow-md ${priorityStyle.bg} ${priorityStyle.border} ${priorityStyle.hover}`}
      style={{
        left,
        width,
        top: `${top}px`,
        height: `${effectiveHeight}px`,
        zIndex,
      }}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={`text-xs font-medium ${priorityStyle.text} truncate`}>
        {event.title || "无标题"}
      </div>
      {showTime && (
        <div className={`text-xs ${priorityStyle.text} opacity-70`}>
          {formatTimeRange(event.startTime, event.endTime)}
        </div>
      )}
      <div
        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize"
        onMouseDown={handleResizeStart}
        onDragStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />
    </div>
  );
}
