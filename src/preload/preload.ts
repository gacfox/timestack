import { contextBridge, ipcRenderer } from "electron";

const electronAPI = {
  showNotification: (title: string, body: string) =>
    ipcRenderer.invoke("show-notification", { title, body }),
  openExternal: (url: string) => ipcRenderer.invoke("open-external", url),
  db: {
    getEvents: () => ipcRenderer.invoke("db:get-events"),
    addEvent: (event: any) => ipcRenderer.invoke("db:add-event", event),
    updateEvent: (id: string, updates: any) =>
      ipcRenderer.invoke("db:update-event", id, updates),
    deleteEvent: (id: string) => ipcRenderer.invoke("db:delete-event", id),
    getTasks: () => ipcRenderer.invoke("db:get-tasks"),
    addTask: (task: any) => ipcRenderer.invoke("db:add-task", task),
    updateTask: (id: string, updates: any) =>
      ipcRenderer.invoke("db:update-task", id, updates),
    deleteTask: (id: string) => ipcRenderer.invoke("db:delete-task", id),
    getAppointments: () => ipcRenderer.invoke("db:get-appointments"),
    addAppointment: (appointment: any) =>
      ipcRenderer.invoke("db:add-appointment", appointment),
    updateAppointment: (id: string, updates: any) =>
      ipcRenderer.invoke("db:update-appointment", id, updates),
    deleteAppointment: (id: string) =>
      ipcRenderer.invoke("db:delete-appointment", id),
    getSettings: () => ipcRenderer.invoke("db:get-settings"),
    updateSettings: (updates: any) =>
      ipcRenderer.invoke("db:update-settings", updates),
    getReports: () => ipcRenderer.invoke("db:get-reports"),
    addReport: (report: any) => ipcRenderer.invoke("db:add-report", report),
    deleteReport: (id: string) => ipcRenderer.invoke("db:delete-report", id),
    updateReport: (id: string, updates: any) =>
      ipcRenderer.invoke("db:update-report", id, updates),
  },
  llm: {
    generateReport: (
      requestId: string,
      systemPrompt: string,
      userPrompt: string,
    ) =>
      ipcRenderer.invoke("llm:generate-report", {
        requestId,
        systemPrompt,
        userPrompt,
      }),
    onReportChunk: (callback: (payload: any) => void) => {
      ipcRenderer.on("llm:report-chunk", (_event, payload) =>
        callback(payload),
      );
    },
    onReportDone: (callback: (payload: any) => void) => {
      ipcRenderer.on("llm:report-done", (_event, payload) => callback(payload));
    },
    onReportError: (callback: (payload: any) => void) => {
      ipcRenderer.on("llm:report-error", (_event, payload) =>
        callback(payload),
      );
    },
    removeReportListeners: () => {
      ipcRenderer.removeAllListeners("llm:report-chunk");
      ipcRenderer.removeAllListeners("llm:report-done");
      ipcRenderer.removeAllListeners("llm:report-error");
    },
  },
};

contextBridge.exposeInMainWorld("electron", electronAPI);
