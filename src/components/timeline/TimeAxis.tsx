import { PIXELS_PER_MINUTE } from "@/constants";

export default function TimeAxis() {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const pixelsPerHour = 60 * PIXELS_PER_MINUTE;

  const getPrefix = (hour: number) => {
    if (hour < 6) return "凌晨";
    if (hour < 12) return "上午";
    if (hour === 12) return "中午";
    if (hour < 18) return "下午";
    return "晚上";
  };

  const formatHour = (hour: number) => {
    const time = `${hour.toString().padStart(2, "0")}:00`;
    return { prefix: getPrefix(hour), time };
  };

  return (
    <div className="w-16 flex-shrink-0 bg-muted text-xs text-muted-foreground select-none">
      {hours.map((hour) => {
        const { prefix, time } = formatHour(hour);
        return (
          <div
            key={hour}
            className="pr-2 text-right border-b flex flex-col items-end justify-start pt-1 leading-tight"
            style={{ height: `${pixelsPerHour}px` }}
          >
            <div>{prefix}</div>
            <div>{time}</div>
          </div>
        );
      })}
    </div>
  );
}
