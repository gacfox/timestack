import { useEffect, useRef, useState } from "react";
import { addMilliseconds, isSameDay } from "date-fns";
import ViewModeTabs from "./ViewModeTabs";
import DateHeader from "./DateHeader";
import TimeAxis from "./TimeAxis";
import TimeGrid from "./TimeGrid";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/useAppStore";
import { useEventStore } from "@/stores/useEventStore";
import { useTaskStore } from "@/stores/useTaskStore";
import { useAppointmentStore } from "@/stores/useAppointmentStore";
import { getDatesForView } from "@/utils/time";
import {
  getItemTop,
  getItemHeight,
  pixelToTime,
  getOverlapIndex,
} from "@/utils/overlap";
import { DAY_HEIGHT } from "@/constants";
import EventCard from "./Card/EventCard";
import TaskCard from "./Card/TaskCard";
import AppointmentCard from "./Card/AppointmentCard";
import { CalendarItem } from "@/types";

type ContextMenuState = {
  x: number;
  y: number;
  item: CalendarItem;
} | null;

type BlankMenuState = {
  x: number;
  y: number;
  dateTime: Date;
} | null;

type PendingDelete = {
  type: "event" | "task" | "appointment";
  id: string;
  title?: string;
} | null;

interface TimelineViewProps {
  onEditEvent: (event: any) => void;
  onEditTask: (task: any) => void;
  onEditAppointment: (appointment: any) => void;
  onCreateEventAt: (startTime: Date) => void;
  onCreateTaskAt: (startTime: Date) => void;
  onCreateAppointmentAt: (startTime: Date) => void;
  isActive: boolean;
}

export default function TimelineView({
  onEditEvent,
  onEditTask,
  onEditAppointment,
  onCreateEventAt,
  onCreateTaskAt,
  onCreateAppointmentAt,
  isActive,
}: TimelineViewProps) {
  const { selectedDate, viewMode, setViewMode, scrollToTime, setScrollToTime } =
    useAppStore();
  const events = useEventStore((state) => state.events);
  const updateEvent = useEventStore((state) => state.updateEvent);
  const deleteEvent = useEventStore((state) => state.deleteEvent);
  const tasks = useTaskStore((state) => state.tasks);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const appointments = useAppointmentStore((state) => state.appointments);
  const deleteAppointment = useAppointmentStore(
    (state) => state.deleteAppointment,
  );

  const dates = getDatesForView(viewMode, selectedDate);
  const [draggedEvent, setDraggedEvent] = useState<any>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [blankMenu, setBlankMenu] = useState<BlankMenuState>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [detailItem, setDetailItem] = useState<CalendarItem | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const overlapOffsetPx = 6;

  useEffect(() => {
    const handleGlobalClick = () => {
      setContextMenu(null);
      setBlankMenu(null);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setContextMenu(null);
        setBlankMenu(null);
      }
    };
    window.addEventListener("click", handleGlobalClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const container = scrollRef.current;
    if (!container) return;
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const target = minutes * (DAY_HEIGHT / (24 * 60));
    const offset = 120;
    const top = Math.max(
      0,
      Math.min(DAY_HEIGHT - container.clientHeight, target - offset),
    );
    requestAnimationFrame(() => {
      container.scrollTop = top;
    });
  }, [isActive]);

  useEffect(() => {
    if (!isActive || !scrollToTime) return;
    const container = scrollRef.current;
    if (!container) return;
    const minutes = scrollToTime.getHours() * 60 + scrollToTime.getMinutes();
    const target = minutes * (DAY_HEIGHT / (24 * 60));
    const offset = 120;
    const top = Math.max(
      0,
      Math.min(DAY_HEIGHT - container.clientHeight, target - offset),
    );
    requestAnimationFrame(() => {
      container.scrollTop = top;
    });
    setScrollToTime(null);
  }, [isActive, scrollToTime, setScrollToTime]);

  const handleViewModeChange = (value: string) => {
    setViewMode(value as "day" | "week" | "next_4_days" | "around_5_days");
  };

  const handleDragStart = (_e: React.DragEvent, item: any) => {
    setDraggedEvent(item);
  };

  const handleDragEnd = (_e: React.DragEvent) => {
    setDraggedEvent(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    try {
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));
      if (!draggedEvent) return;

      const container = e.currentTarget as HTMLElement;
      const rect = container.getBoundingClientRect();
      const scrollRect = scrollRef.current?.getBoundingClientRect();
      const scrollTop = scrollRef.current?.scrollTop ?? 0;
      const y = scrollRect ? e.clientY - scrollRect.top : e.clientY - rect.top;
      const x = e.clientX - rect.left;

      const dragOffsetY =
        typeof data.dragOffsetY === "number" ? data.dragOffsetY : 0;
      const offsetPixels = y + scrollTop - dragOffsetY;
      const clampedPixels = Math.max(0, Math.min(DAY_HEIGHT, offsetPixels));
      const { hour: hours, minute: minutes } = pixelToTime(clampedPixels);

      const dayCount = dates.length;
      const dayIndex = Math.floor(x / (rect.width / dayCount));
      const targetDate = dates[dayIndex] || new Date();

      if (data.type === "event") {
        const originalStartTime = new Date(draggedEvent.startTime);
        const originalEndTime = new Date(draggedEvent.endTime);
        const durationMs =
          originalEndTime.getTime() - originalStartTime.getTime();

        const newStartTime = new Date(targetDate);
        newStartTime.setHours(hours, minutes, 0, 0);
        const newEndTime = addMilliseconds(newStartTime, durationMs);

        updateEvent(draggedEvent.id, {
          startTime: newStartTime,
          endTime: newEndTime,
        });
      } else if (data.type === "task" || data.type === "appointment") {
        const newTime = new Date(targetDate);
        newTime.setHours(hours, minutes, 0, 0);

        if (data.type === "task") {
          const taskStore = useTaskStore.getState();
          const originalDueDate = new Date(draggedEvent.dueDate);
          const dueTimeMs =
            originalDueDate.getTime() -
            new Date(draggedEvent.startTime).getTime();
          const newDueDate = addMilliseconds(newTime, dueTimeMs);

          taskStore.updateTask(draggedEvent.id, {
            startTime: newTime,
            dueDate: newDueDate,
          });
        } else {
          const appointmentStore = useAppointmentStore.getState();
          const originalEndTime = new Date(draggedEvent.endTime);
          const durationMs =
            originalEndTime.getTime() -
            new Date(draggedEvent.startTime).getTime();
          const newEndTime = addMilliseconds(newTime, durationMs);

          appointmentStore.updateAppointment(draggedEvent.id, {
            startTime: newTime,
            endTime: newEndTime,
          });
        }
      }
    } catch (err) {
      console.error("Drop error:", err);
    }
  };

  const handleBlankContextMenu = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-card="true"]')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const container = e.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    const scrollRect = scrollRef.current?.getBoundingClientRect();
    const scrollTop = scrollRef.current?.scrollTop ?? 0;
    const y = scrollRect ? e.clientY - scrollRect.top : e.clientY - rect.top;
    const x = e.clientX - rect.left;

    const offsetPixels = y + scrollTop;
    const { hour: hours, minute: minutes } = pixelToTime(offsetPixels);

    const dayCount = dates.length;
    const dayIndex = Math.floor(x / (rect.width / dayCount));
    const targetDate = dates[dayIndex] || new Date();
    const dateTime = new Date(targetDate);
    dateTime.setHours(hours, minutes, 0, 0);

    setContextMenu(null);
    setBlankMenu({ x: e.clientX, y: e.clientY, dateTime });
  };

  const handleTaskComplete = async (task: any) => {
    const taskStore = useTaskStore.getState();
    await taskStore.toggleTaskComplete(task.id);
  };

  const handleConvertAppointmentToEvent = async (appointment: any) => {
    const appointmentStore = useAppointmentStore.getState();
    await appointmentStore.convertToEvent(appointment.id);
  };

  const renderCardsForDate = (date: Date) => {
    const allItems: CalendarItem[] = [
      ...events.filter((e) => isSameDay(new Date(e.startTime), date)),
      ...tasks.filter((t) => isSameDay(new Date(t.startTime), date)),
      ...appointments.filter((a) => isSameDay(new Date(a.startTime), date)),
    ];

    return allItems.map((item) => {
      const overlapIndex = getOverlapIndex(item, allItems);
      const overlapShift = overlapIndex * overlapOffsetPx;
      const itemWidth = `calc(100% - ${overlapShift}px)`;
      const itemLeft = `${overlapShift}px`;
      const itemTop = getItemTop(item.startTime);
      const itemHeight = getItemHeight(item);
      const baseZIndex = 10 + overlapIndex;
      const zIndex = activeItemId === item.id ? 50 : baseZIndex;
      const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setActiveItemId(item.id);
        setContextMenu({ x: e.clientX, y: e.clientY, item });
      };

      if (item.type === "event") {
        return (
          <EventCard
            key={item.id}
            event={item}
            left={itemLeft}
            width={itemWidth}
            top={itemTop}
            height={itemHeight}
            zIndex={zIndex}
            onClick={() => setActiveItemId(item.id)}
            onContextMenu={handleContextMenu}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onResizeEnd={(endTime) => {
              updateEvent(item.id, { endTime });
            }}
          />
        );
      } else if (item.type === "task") {
        return (
          <TaskCard
            key={item.id}
            task={item}
            left={itemLeft}
            width={itemWidth}
            top={itemTop}
            height={itemHeight}
            zIndex={zIndex}
            onClick={() => setActiveItemId(item.id)}
            onContextMenu={handleContextMenu}
            onToggleComplete={(e) => {
              e.stopPropagation();
              handleTaskComplete(item);
            }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
        );
      } else if (item.type === "appointment") {
        return (
          <AppointmentCard
            key={item.id}
            appointment={item}
            left={itemLeft}
            width={itemWidth}
            top={itemTop}
            height={itemHeight}
            zIndex={zIndex}
            onClick={() => setActiveItemId(item.id)}
            onContextMenu={handleContextMenu}
            onConvertToEvent={(e) => {
              e.stopPropagation();
              handleConvertAppointmentToEvent(item);
            }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onResizeEnd={(endTime) => {
              const appointmentStore = useAppointmentStore.getState();
              appointmentStore.updateAppointment(item.id, { endTime });
            }}
          />
        );
      }
      return null;
    });
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="p-4 border-b flex items-center gap-4">
        <ViewModeTabs value={viewMode} onChange={handleViewModeChange} />
      </div>
      <DateHeader dates={dates} />
      <div
        className="flex-1 min-h-0 overflow-auto scrollbar-hide"
        ref={scrollRef}
      >
        <div className="flex" style={{ height: DAY_HEIGHT }}>
          <TimeAxis />
          <div className="flex-1 relative">
            <TimeGrid />
            <div
              className="absolute top-0 left-0 right-0"
              style={{ height: DAY_HEIGHT }}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onContextMenu={handleBlankContextMenu}
            >
              {dates.map((date, index) => (
                <div
                  key={date.toISOString()}
                  className="absolute top-0 left-0"
                  style={{
                    left: `${(100 / dates.length) * index}%`,
                    width: `${100 / dates.length}%`,
                  }}
                >
                  {renderCardsForDate(date)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {contextMenu && (
        <div
          className="fixed z-50 min-w-35 rounded-md border bg-popover p-1 shadow-md"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent"
            onClick={() => {
              const item = contextMenu.item;
              setContextMenu(null);
              if (item.type === "event") onEditEvent(item);
              if (item.type === "task") onEditTask(item);
              if (item.type === "appointment") onEditAppointment(item);
            }}
          >
            编辑
          </button>
          <button
            className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent"
            onClick={() => {
              setDetailItem(contextMenu.item);
              setContextMenu(null);
            }}
          >
            详情
          </button>
          <button
            className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent text-destructive"
            onClick={() => {
              const item = contextMenu.item;
              setContextMenu(null);
              setPendingDelete({
                type: item.type,
                id: item.id,
                title: item.title,
              });
            }}
          >
            删除
          </button>
        </div>
      )}

      {blankMenu && (
        <div
          className="fixed z-50 min-w-40 rounded-md border bg-popover p-1 shadow-md"
          style={{ left: blankMenu.x, top: blankMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent"
            onClick={() => {
              const { dateTime } = blankMenu;
              setBlankMenu(null);
              onCreateEventAt(dateTime);
            }}
          >
            新建事件
          </button>
          <button
            className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent"
            onClick={() => {
              const { dateTime } = blankMenu;
              setBlankMenu(null);
              onCreateTaskAt(dateTime);
            }}
          >
            新建任务
          </button>
          <button
            className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent"
            onClick={() => {
              const { dateTime } = blankMenu;
              setBlankMenu(null);
              onCreateAppointmentAt(dateTime);
            }}
          >
            新建预约
          </button>
        </div>
      )}

      <Dialog
        open={!!pendingDelete}
        onOpenChange={() => setPendingDelete(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            确认删除
            {pendingDelete?.title ? `「${pendingDelete.title}」` : "该条目"}
            吗？此操作无法撤销。
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!pendingDelete) return;
                if (pendingDelete.type === "event")
                  await deleteEvent(pendingDelete.id);
                if (pendingDelete.type === "task")
                  await deleteTask(pendingDelete.id);
                if (pendingDelete.type === "appointment")
                  await deleteAppointment(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailItem} onOpenChange={() => setDetailItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{detailItem?.title || "详情"}</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground whitespace-pre-wrap max-h-64 overflow-auto">
            {detailItem?.description || "暂无详情"}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
