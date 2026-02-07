import { useEffect, useRef } from "react";

export const useAppointmentReminder = () => {
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      checkReminders();
    }, 60000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const checkReminders = async () => {
    try {
      const appointments = await window.electron?.db?.getAppointments();
      if (!appointments) return;

      const now = new Date();

      for (const appointment of appointments) {
        if (!appointment.reminderEnabled || appointment.reminderSent) {
          continue;
        }

        const reminderTime = new Date(
          appointment.startTime.getTime() -
            appointment.reminderMinutesBefore * 60 * 1000,
        );
        const timeDiff = reminderTime.getTime() - now.getTime();

        if (timeDiff > 0 && timeDiff < 60000) {
          await window.electron?.showNotification(
            `即将开始: ${appointment.title}`,
            `时间: ${new Date(appointment.startTime).toLocaleString("zh-CN", { hour: "2-digit", minute: "2-digit" })}（还有约${appointment.reminderMinutesBefore}分钟）`,
          );

          await window.electron?.db?.updateAppointment(appointment.id, {
            reminderSent: true,
          });
        }
      }
    } catch (error) {
      console.error("Failed to check reminders:", error);
    }
  };

  return { checkReminders };
};
