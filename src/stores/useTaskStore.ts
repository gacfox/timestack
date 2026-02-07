import { create } from "zustand";
import { Task } from "@/types";

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  loadTasks: () => Promise<void>;
  addTask: (
    task: Omit<Task, "id" | "createdAt" | "updatedAt">,
  ) => Promise<string>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  getTaskById: (id: string) => Task | undefined;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  loading: false,
  loadTasks: async () => {
    set({ loading: true });
    try {
      if (window.electron?.db?.getTasks) {
        const tasks = await window.electron.db.getTasks();
        set({ tasks, loading: false });
      }
    } catch (error) {
      console.error("Failed to load tasks:", error);
      set({ loading: false });
    }
  },
  addTask: async (taskData) => {
    if (window.electron?.db?.addTask) {
      const id = await window.electron.db.addTask(taskData);
      const newTask: Task = {
        ...taskData,
        id,
        type: "task",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set((state) => ({ tasks: [...state.tasks, newTask] }));
      return id;
    }
    throw new Error("Electron API not available");
  },
  updateTask: async (id, updates) => {
    if (window.electron?.db?.updateTask) {
      await window.electron.db.updateTask(id, updates);
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id
            ? { ...task, ...updates, updatedAt: new Date() }
            : task,
        ),
      }));
    }
  },
  deleteTask: async (id) => {
    if (window.electron?.db?.deleteTask) {
      await window.electron.db.deleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      }));
    }
  },
  toggleTaskComplete: async (id) => {
    const task = get().tasks.find((task) => task.id === id);
    if (task) {
      await get().updateTask(id, { isCompleted: !task.isCompleted });
    }
  },
  getTaskById: (id) => {
    return get().tasks.find((task) => task.id === id);
  },
}));
