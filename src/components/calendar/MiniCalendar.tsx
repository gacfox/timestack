import React from "react";
import {
  format,
  isSameDay,
  addMonths,
  subMonths,
  startOfMonth,
} from "date-fns";
import { zhCN } from "date-fns/locale";

interface MiniCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export default function MiniCalendar({
  selectedDate,
  onSelectDate,
}: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    startOfMonth(selectedDate),
  );

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const totalDays = lastDay.getDate();

    const days = [];
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const weekDays = ["一", "二", "三", "四", "五", "六", "日"];
  const days = getDaysInMonth();

  return (
    <div className="mini-calendar">
      <div className="flex items-center justify-between mb-4">
        <button
          className="p-1 hover:bg-muted rounded transition-colors"
          onClick={goToPreviousMonth}
        >
          ‹
        </button>
        <span className="font-medium">
          {format(currentMonth, "yyyy年 M月", { locale: zhCN })}
        </span>
        <button
          className="p-1 hover:bg-muted rounded transition-colors"
          onClick={goToNextMonth}
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {weekDays.map((day) => (
          <div key={day} className="text-muted-foreground py-1">
            {day}
          </div>
        ))}

        {days.map((day, index) => (
          <button
            key={index}
            className={`
              p-1 rounded transition-colors
              ${day ? "hover:bg-muted cursor-pointer" : ""}
              ${day && isSameDay(day, selectedDate) ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
              ${day && isSameDay(day, new Date()) && !isSameDay(day, selectedDate) ? "font-bold text-primary bg-primary/10" : ""}
            `}
            onClick={() => day && onSelectDate(day)}
            disabled={!day}
          >
            {day ? format(day, "d") : ""}
          </button>
        ))}
      </div>
    </div>
  );
}
