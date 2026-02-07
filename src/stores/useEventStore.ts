import { create } from "zustand";
import { Event } from "@/types";

interface EventStore {
  events: Event[];
  loading: boolean;
  loadEvents: () => Promise<void>;
  addEvent: (
    event: Omit<Event, "id" | "createdAt" | "updatedAt">,
  ) => Promise<string>;
  updateEvent: (id: string, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  getEventById: (id: string) => Event | undefined;
}

export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  loading: false,
  loadEvents: async () => {
    set({ loading: true });
    try {
      if (window.electron?.db?.getEvents) {
        const events = await window.electron.db.getEvents();
        set({ events, loading: false });
      }
    } catch (error) {
      console.error("Failed to load events:", error);
      set({ loading: false });
    }
  },
  addEvent: async (eventData) => {
    if (window.electron?.db?.addEvent) {
      const id = await window.electron.db.addEvent(eventData);
      const newEvent: Event = {
        ...eventData,
        id,
        type: "event",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set((state) => ({ events: [...state.events, newEvent] }));
      return id;
    }
    throw new Error("Electron API not available");
  },
  updateEvent: async (id, updates) => {
    if (window.electron?.db?.updateEvent) {
      await window.electron.db.updateEvent(id, updates);
      set((state) => ({
        events: state.events.map((event) =>
          event.id === id
            ? { ...event, ...updates, updatedAt: new Date() }
            : event,
        ),
      }));
    }
  },
  deleteEvent: async (id) => {
    if (window.electron?.db?.deleteEvent) {
      await window.electron.db.deleteEvent(id);
      set((state) => ({
        events: state.events.filter((event) => event.id !== id),
      }));
    }
  },
  getEventById: (id) => {
    return get().events.find((event) => event.id === id);
  },
}));
