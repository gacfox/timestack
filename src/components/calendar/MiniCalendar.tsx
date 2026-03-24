import React from "react";
import {
  format,
  isSameDay,
  addMonths,
  subMonths,
  startOfMonth,
} from "date-fns";
import { zhCN } from "date-fns/locale";
import { Button } from "@/components/ui/button";

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
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-7 w-7"
          onClick={goToPreviousMonth}
        >
          ‹
        </Button>
        <span className="font-medium">
          {format(currentMonth, "yyyy年 M月", { locale: zhCN })}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-7 w-7"
          onClick={goToNextMonth}
        >
          ›
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {weekDays.map((day) => (
          <div key={day} className="text-muted-foreground py-1">
            {day}
          </div>
        ))}

        {days.map((day, index) => {
          const isSelected = day && isSameDay(day, selectedDate);
          const isToday = day && isSameDay(day, new Date());
          return (
            <Button
              key={index}
              variant={isSelected ? "default" : "ghost"}
              size="icon-sm"
              className={`h-7 w-7 text-xs ${
                isSelected ? "hover:bg-primary/90" : ""
              } ${isToday && !isSelected ? "font-bold text-primary bg-primary/10" : ""}`}
              onClick={() => day && onSelectDate(day)}
              disabled={!day}
            >
              {day ? format(day, "d") : ""}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
