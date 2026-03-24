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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import { addDays } from "date-fns";

interface EditTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (task: any) => Promise<void>;
  initialData?: {
    title: string;
    description: string;
    priority: string;
    startTime: Date;
    dueDate: Date;
  };
  seedData?: {
    title?: string;
    description?: string;
    priority?: string;
    startTime: Date;
    dueDate: Date;
  };
}

const priorities = ["high", "medium", "low"];
const priorityLabels = { high: "高", medium: "中", low: "低" };

export default function EditTaskModal({
  open,
  onClose,
  onSave,
  initialData,
  seedData,
}: EditTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("low");
  const [startTime, setStartTime] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (open) {
      if (initialData) {
        setTitle(initialData.title || "");
        setDescription(initialData.description || "");
        setPriority(initialData.priority || "low");
        setStartTime(formatDateTimeInput(initialData.startTime));
        setDueDate(formatDateTimeInput(initialData.dueDate));
      } else if (seedData) {
        setTitle(seedData.title || "");
        setDescription(seedData.description || "");
        setPriority(seedData.priority || "low");
        setStartTime(formatDateTimeInput(seedData.startTime));
        setDueDate(formatDateTimeInput(seedData.dueDate));
      } else {
        const now = new Date();
        setTitle("");
        setDescription("");
        setPriority("low");
        setStartTime(formatDateTimeInput(now));
        setDueDate(formatDateTimeInput(addDays(now, 1)));
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

  const handleSubmit = async () => {
    if (!title.trim()) return;
    const start = parseDateTimeInput(startTime);
    const due = parseDateTimeInput(dueDate);
    if (due.getTime() < start.getTime()) {
      setDueDate(formatDateTimeInput(start));
      return;
    }
    await onSave({
      title,
      description,
      priority: priority as "high" | "medium" | "low",
      startTime: start,
      dueDate: due,
      isCompleted: false,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialData ? "编辑任务" : "新建任务"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Field>
            <FieldLabel htmlFor="task-title">标题 *</FieldLabel>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="任务标题"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="task-description">描述</FieldLabel>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="任务描述"
              className="min-h-24 resize-y"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="task-priority">优先级</FieldLabel>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="task-priority">
                <SelectValue placeholder="选择优先级" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((p) => (
                  <SelectItem key={p} value={p}>
                    {priorityLabels[p as keyof typeof priorityLabels]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel htmlFor="task-start-time">开始时间</FieldLabel>
              <Input
                id="task-start-time"
                type="datetime-local"
                value={startTime}
                onChange={(e) => {
                  const nextStart = e.target.value;
                  setStartTime(nextStart);
                  if (
                    dueDate &&
                    new Date(dueDate).getTime() < new Date(nextStart).getTime()
                  ) {
                    setDueDate(nextStart);
                  }
                }}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="task-due-date">截止时间</FieldLabel>
              <Input
                id="task-due-date"
                type="datetime-local"
                value={dueDate}
                min={startTime || undefined}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </Field>
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
