import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";

declare global {
  interface Window {
    electron: {
      showNotification: (title: string, body: string) => Promise<any>;
      openExternal: (url: string) => Promise<boolean>;
      db: {
        getEvents: () => Promise<any[]>;
        addEvent: (event: any) => Promise<string>;
        updateEvent: (id: string, updates: any) => Promise<boolean>;
        deleteEvent: (id: string) => Promise<boolean>;
        getTasks: () => Promise<any[]>;
        addTask: (task: any) => Promise<string>;
        updateTask: (id: string, updates: any) => Promise<boolean>;
        deleteTask: (id: string) => Promise<boolean>;
        getAppointments: () => Promise<any[]>;
        addAppointment: (appointment: any) => Promise<string>;
        updateAppointment: (id: string, updates: any) => Promise<boolean>;
        deleteAppointment: (id: string) => Promise<boolean>;
        getSettings: () => Promise<any>;
        updateSettings: (updates: any) => Promise<any>;
        getReports: () => Promise<any[]>;
        addReport: (report: any) => Promise<string>;
        deleteReport: (id: string) => Promise<boolean>;
        updateReport: (id: string, updates: any) => Promise<boolean>;
      };
      llm: {
        generateReport: (
          requestId: string,
          systemPrompt: string,
          userPrompt: string,
        ) => Promise<any>;
        onReportChunk: (callback: (payload: any) => void) => void;
        onReportDone: (callback: (payload: any) => void) => void;
        onReportError: (callback: (payload: any) => void) => void;
        removeReportListeners: () => void;
      };
    };
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
