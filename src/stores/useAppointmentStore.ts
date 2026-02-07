import { create } from "zustand";
import { Appointment, Event } from "@/types";
import { useEventStore } from "./useEventStore";

interface AppointmentStore {
  appointments: Appointment[];
  loading: boolean;
  loadAppointments: () => Promise<void>;
  addAppointment: (
    appointment: Omit<
      Appointment,
      "id" | "createdAt" | "updatedAt" | "reminderSent"
    >,
  ) => Promise<string>;
  updateAppointment: (
    id: string,
    updates: Partial<Appointment>,
  ) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  convertToEvent: (id: string) => Promise<void>;
  getAppointmentById: (id: string) => Appointment | undefined;
}

export const useAppointmentStore = create<AppointmentStore>((set, get) => ({
  appointments: [],
  loading: false,
  loadAppointments: async () => {
    set({ loading: true });
    try {
      if (window.electron?.db?.getAppointments) {
        const appointments = await window.electron.db.getAppointments();
        set({ appointments, loading: false });
      }
    } catch (error) {
      console.error("Failed to load appointments:", error);
      set({ loading: false });
    }
  },
  addAppointment: async (appointmentData) => {
    if (window.electron?.db?.addAppointment) {
      const id = await window.electron.db.addAppointment(appointmentData);
      const newAppointment: Appointment = {
        ...appointmentData,
        id,
        type: "appointment",
        reminderSent: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      set((state) => ({
        appointments: [...state.appointments, newAppointment],
      }));
      return id;
    }
    throw new Error("Electron API not available");
  },
  updateAppointment: async (id, updates) => {
    if (window.electron?.db?.updateAppointment) {
      await window.electron.db.updateAppointment(id, updates);
      set((state) => ({
        appointments: state.appointments.map((appointment) =>
          appointment.id === id
            ? { ...appointment, ...updates, updatedAt: new Date() }
            : appointment,
        ),
      }));
    }
  },
  deleteAppointment: async (id) => {
    if (window.electron?.db?.deleteAppointment) {
      await window.electron.db.deleteAppointment(id);
      set((state) => ({
        appointments: state.appointments.filter(
          (appointment) => appointment.id !== id,
        ),
      }));
    }
  },
  convertToEvent: async (id) => {
    const appointment = get().appointments.find((app) => app.id === id);
    if (
      appointment &&
      window.electron?.db?.addEvent &&
      window.electron?.db?.deleteAppointment
    ) {
      const {
        id: _id,
        type,
        reminderEnabled,
        reminderMinutesBefore,
        reminderSent,
        ...eventData
      } = appointment;
      const eventId = await window.electron.db.addEvent({
        ...eventData,
        type: "event" as const,
      });
      await window.electron.db.deleteAppointment(id);
      set((state) => ({
        appointments: state.appointments.filter((app) => app.id !== id),
      }));
      const newEvent: Event = {
        ...eventData,
        id: eventId,
        type: "event" as const,
        createdAt: appointment.createdAt,
        updatedAt: new Date(),
      };
      useEventStore.setState((state) => ({
        events: [...state.events, newEvent],
      }));
    }
  },
  getAppointmentById: (id) => {
    return get().appointments.find((appointment) => appointment.id === id);
  },
}));
