import { useState, useEffect } from "react";
import { addDays } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Sidebar from "@/components/layout/Sidebar";
import TimelineView from "@/components/timeline/TimelineView";
import TaskList from "@/components/tasks/TaskList";
import EditEventModal from "@/components/modals/EditEventModal";
import EditTaskModal from "@/components/modals/EditTaskModal";
import EditAppointmentModal from "@/components/modals/EditAppointmentModal";
import SettingsModal from "@/components/modals/SettingsModal";
import ReportPage from "@/components/report/ReportPage";
import { useEventStore } from "@/stores/useEventStore";
import { useTaskStore } from "@/stores/useTaskStore";
import { useAppointmentStore } from "@/stores/useAppointmentStore";
import { addMinutes } from "@/utils/time";
import {
  DEFAULT_EVENT_DURATION_MINUTES,
  DEFAULT_REMINDER_MINUTES,
} from "@/constants";

export default function MainContent() {
  const [activeTab, setActiveTab] = useState<"schedule" | "tasks" | "reports">(
    "schedule",
  );
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [newEventSeed, setNewEventSeed] = useState<any>(null);
  const [newTaskSeed, setNewTaskSeed] = useState<any>(null);
  const [newAppointmentSeed, setNewAppointmentSeed] = useState<any>(null);

  const [isReportPageOpen, setIsReportPageOpen] = useState(false);

  const loadEvents = useEventStore((state) => state.loadEvents);
  const loadTasks = useTaskStore((state) => state.loadTasks);
  const loadAppointments = useAppointmentStore(
    (state) => state.loadAppointments,
  );
  const addEvent = useEventStore((state) => state.addEvent);
  const updateEvent = useEventStore((state) => state.updateEvent);
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const addAppointment = useAppointmentStore((state) => state.addAppointment);
  const updateAppointment = useAppointmentStore(
    (state) => state.updateAppointment,
  );

  useEffect(() => {
    loadEvents();
    loadTasks();
    loadAppointments();
  }, [loadEvents, loadTasks, loadAppointments]);

  const handleCreateEvent = async (data: any) => {
    await addEvent(data);
  };

  const handleCreateTask = async (data: any) => {
    await addTask(data);
  };

  const handleCreateAppointment = async (data: any) => {
    await addAppointment(data);
  };

  const handleUpdateEvent = async (data: any) => {
    if (editingEvent) {
      await updateEvent(editingEvent.id, data);
      setEditingEvent(null);
    }
  };

  const handleUpdateTask = async (data: any) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
      setEditingTask(null);
    }
  };

  const handleUpdateAppointment = async (data: any) => {
    if (editingAppointment) {
      await updateAppointment(editingAppointment.id, data);
      setEditingAppointment(null);
    }
  };

  const openEventModal = (event?: any, seed?: any) => {
    if (event) {
      setEditingEvent(event);
      setNewEventSeed(null);
      setShowNewEventModal(true);
    } else {
      setEditingEvent(null);
      setNewEventSeed(seed || null);
      setShowNewEventModal(true);
    }
  };

  const openTaskModal = (task?: any, seed?: any) => {
    if (task) {
      setEditingTask(task);
      setNewTaskSeed(null);
      setShowNewTaskModal(true);
    } else {
      setEditingTask(null);
      setNewTaskSeed(seed || null);
      setShowNewTaskModal(true);
    }
  };

  const openAppointmentModal = (appointment?: any, seed?: any) => {
    if (appointment) {
      setEditingAppointment(appointment);
      setNewAppointmentSeed(null);
      setShowNewAppointmentModal(true);
    } else {
      setEditingAppointment(null);
      setNewAppointmentSeed(seed || null);
      setShowNewAppointmentModal(true);
    }
  };

  const closeModals = () => {
    setShowNewEventModal(false);
    setShowNewTaskModal(false);
    setShowNewAppointmentModal(false);
    setEditingEvent(null);
    setEditingTask(null);
    setEditingAppointment(null);
    setNewEventSeed(null);
    setNewTaskSeed(null);
    setNewAppointmentSeed(null);
  };

  if (isReportPageOpen) {
    return (
      <ReportPage
        open={isReportPageOpen}
        onClose={() => setIsReportPageOpen(false)}
      />
    );
  }

  return (
    <div className="h-screen">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}
        className="h-full flex min-h-0"
      >
        <Sidebar
          onCreateEvent={() => openEventModal()}
          onCreateTask={() => openTaskModal()}
          onCreateAppointment={() => openAppointmentModal()}
          onOpenReports={() => setIsReportPageOpen(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
        />
        <div className="flex-1 flex flex-col min-h-0">
          <TabsList className="m-4 w-fit">
            <TabsTrigger value="schedule">日程表</TabsTrigger>
            <TabsTrigger value="tasks">任务</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="flex-1 m-0 mt-0 min-h-0">
            <TimelineView
              onEditEvent={openEventModal}
              onEditTask={openTaskModal}
              onEditAppointment={openAppointmentModal}
              isActive={activeTab === "schedule"}
              onCreateEventAt={(startTime) => {
                const endTime = addMinutes(
                  startTime,
                  DEFAULT_EVENT_DURATION_MINUTES,
                );
                openEventModal(undefined, {
                  title: "",
                  description: "",
                  priority: "low",
                  startTime,
                  endTime,
                });
              }}
              onCreateTaskAt={(startTime) => {
                const dueDate = addDays(startTime, 1);
                openTaskModal(undefined, {
                  title: "",
                  description: "",
                  priority: "low",
                  startTime,
                  dueDate,
                });
              }}
              onCreateAppointmentAt={(startTime) => {
                const endTime = addMinutes(
                  startTime,
                  DEFAULT_EVENT_DURATION_MINUTES,
                );
                openAppointmentModal(undefined, {
                  title: "",
                  description: "",
                  priority: "low",
                  startTime,
                  endTime,
                  reminderEnabled: false,
                  reminderMinutesBefore: DEFAULT_REMINDER_MINUTES,
                });
              }}
            />
          </TabsContent>

          <TabsContent value="tasks" className="flex-1 m-0 mt-0 min-h-0">
            <TaskList />
          </TabsContent>
        </div>
      </Tabs>

      <EditEventModal
        open={showNewEventModal}
        onClose={closeModals}
        onSave={editingEvent ? handleUpdateEvent : handleCreateEvent}
        initialData={editingEvent}
        seedData={newEventSeed}
      />

      <EditTaskModal
        open={showNewTaskModal}
        onClose={closeModals}
        onSave={editingTask ? handleUpdateTask : handleCreateTask}
        initialData={editingTask}
        seedData={newTaskSeed}
      />

      <EditAppointmentModal
        open={showNewAppointmentModal}
        onClose={closeModals}
        onSave={
          editingAppointment ? handleUpdateAppointment : handleCreateAppointment
        }
        initialData={editingAppointment}
        seedData={newAppointmentSeed}
      />

      <SettingsModal
        open={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </div>
  );
}
