import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DEFAULT_REMINDER_MINUTES, REMINDER_TIMES } from "@/constants";

interface EditAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (appointment: any) => Promise<void>;
  initialData?: {
    title: string;
    description: string;
    priority: string;
    startTime: Date;
    endTime: Date;
    reminderEnabled: boolean;
    reminderMinutesBefore: number;
  };
  seedData?: {
    title?: string;
    description?: string;
    priority?: string;
    startTime: Date;
    endTime: Date;
    reminderEnabled?: boolean;
    reminderMinutesBefore?: number;
  };
}

const priorities = ["high", "medium", "low"];
const priorityLabels = { high: "非常重要", medium: "重要", low: "一般" };
const durations = [15, 30, 45, 60, 90, 120];

export default function EditAppointmentModal({
  open,
  onClose,
  onSave,
  initialData,
  seedData,
}: EditAppointmentModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("low");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(
    DEFAULT_REMINDER_MINUTES,
  );
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setTitle(initialData.title || "");
        setDescription(initialData.description || "");
        setPriority(initialData.priority || "low");
        setStartTime(formatDateTimeInput(initialData.startTime));
        setEndTime(formatDateTimeInput(initialData.endTime));
        setReminderEnabled(initialData.reminderEnabled || false);
        setReminderMinutesBefore(
          initialData.reminderMinutesBefore || DEFAULT_REMINDER_MINUTES,
        );
        const duration = Math.round(
          (initialData.endTime.getTime() - initialData.startTime.getTime()) /
            (60 * 1000),
        );
        setSelectedDuration(durations.includes(duration) ? duration : null);
      } else if (seedData) {
        setTitle(seedData.title || "");
        setDescription(seedData.description || "");
        setPriority(seedData.priority || "low");
        setStartTime(formatDateTimeInput(seedData.startTime));
        setEndTime(formatDateTimeInput(seedData.endTime));
        setReminderEnabled(seedData.reminderEnabled || false);
        setReminderMinutesBefore(
          seedData.reminderMinutesBefore || DEFAULT_REMINDER_MINUTES,
        );
        const duration = Math.round(
          (seedData.endTime.getTime() - seedData.startTime.getTime()) /
            (60 * 1000),
        );
        setSelectedDuration(durations.includes(duration) ? duration : null);
      } else {
        const now = new Date();
        const nextHour = now.getHours() + 1;
        const endHour = nextHour + 0.5;
        const start = new Date(now.setHours(nextHour, 0, 0, 0));
        const end = new Date(now.setHours(endHour, 30, 0, 0));
        setTitle("");
        setDescription("");
        setPriority("low");
        setStartTime(formatDateTimeInput(start));
        setEndTime(formatDateTimeInput(end));
        setReminderEnabled(false);
        setReminderMinutesBefore(DEFAULT_REMINDER_MINUTES);
        const duration = Math.round(
          (end.getTime() - start.getTime()) / (60 * 1000),
        );
        setSelectedDuration(durations.includes(duration) ? duration : null);
      }
    }
  }, [open, initialData, seedData]);

  const formatDateTimeInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hour}:${minute}`;
  };

  const parseDateTimeInput = (value: string) => new Date(value);

  const handleQuickDuration = (duration: number) => {
    const start = parseDateTimeInput(startTime);
    const end = new Date(start.getTime() + duration * 60 * 1000);
    setEndTime(formatDateTimeInput(end));
    setSelectedDuration(duration);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    const start = parseDateTimeInput(startTime);
    const end = parseDateTimeInput(endTime);
    if (end.getTime() < start.getTime()) {
      setEndTime(formatDateTimeInput(start));
      return;
    }
    await onSave({
      title,
      description,
      priority: priority as "high" | "medium" | "low",
      startTime: start,
      endTime: end,
      reminderEnabled,
      reminderMinutesBefore,
    });
    onClose();
  };

  const getReminderLabel = (minutes: number) => {
    if (minutes < 60) return `${minutes}分钟`;
    return `${minutes / 60}小时`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "编辑预约" : "新建预约"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">标题 *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="预约标题"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="预约描述"
              className="w-full min-h-24 p-2 border rounded-md resize-y"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">优先级</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {priorityLabels[p as keyof typeof priorityLabels]}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block">开始时间</label>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={(e) => {
                  const nextStart = e.target.value;
                  setStartTime(nextStart);
                  setSelectedDuration(null);
                  if (
                    endTime &&
                    new Date(endTime).getTime() < new Date(nextStart).getTime()
                  ) {
                    setEndTime(nextStart);
                  }
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">结束时间</label>
              <Input
                type="datetime-local"
                value={endTime}
                min={startTime || undefined}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setSelectedDuration(null);
                }}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              快速设置时长
            </label>
            <div className="flex gap-2 flex-wrap">
              {durations.map((d) => (
                <Button
                  key={d}
                  variant={selectedDuration === d ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQuickDuration(d)}
                >
                  {d}分钟
                </Button>
              ))}
            </div>
          </div>
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">启用提醒</label>
              <button
                type="button"
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={`w-12 h-6 rounded-full transition-colors ${reminderEnabled ? "bg-primary" : "bg-muted"}`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform shadow ${reminderEnabled ? "translate-x-6" : "translate-x-0.5"}`}
                />
              </button>
            </div>
            {reminderEnabled && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  提前提醒时间
                </label>
                <select
                  value={reminderMinutesBefore}
                  onChange={(e) =>
                    setReminderMinutesBefore(Number(e.target.value))
                  }
                  className="w-full p-2 border rounded-md"
                >
                  {REMINDER_TIMES.map((t) => (
                    <option key={t} value={t}>
                      {getReminderLabel(t)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={handleSubmit}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
