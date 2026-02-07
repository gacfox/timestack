import React from "react";
import { PIXELS_PER_MINUTE, HOURS_IN_DAY } from "@/constants";

export default function TimeGrid() {
  return (
    <div
      className="relative border-l"
      style={{
        height: HOURS_IN_DAY * 60 * PIXELS_PER_MINUTE,
      }}
    >
      {Array.from({ length: HOURS_IN_DAY }, (_, hour) => (
        <React.Fragment key={hour}>
          <div
            className={`absolute w-full border-dashed ${
              hour % 6 === 0 ? "border-border/60" : "border-border/30"
            }`}
            style={{ top: hour * 60 * PIXELS_PER_MINUTE }}
          />
          <div
            className="absolute w-full h-0.5 bg-background"
            style={{ top: hour * 60 * PIXELS_PER_MINUTE - 1 }}
          />
        </React.Fragment>
      ))}

      {Array.from({ length: HOURS_IN_DAY * 4 }, (_, slot) => (
        <div
          key={slot}
          className="absolute w-full"
          style={{
            top: slot * 15 * PIXELS_PER_MINUTE,
            height: 15 * PIXELS_PER_MINUTE,
            borderTop: "1px solid",
            borderTopColor:
              slot % 4 === 0
                ? "hsl(var(--border) / 0.85)"
                : "hsl(var(--border) / 0.6)",
            cursor: "pointer",
          }}
        />
      ))}

      <CurrentTimeLine />
    </div>
  );
}

function CurrentTimeLine() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const top = (hours * 60 + minutes) * PIXELS_PER_MINUTE;

  return (
    <div className="absolute left-0 right-0 flex items-center" style={{ top }}>
      <div className="absolute -left-4 bg-destructive rounded-full w-3 h-3" />
      <div className="w-full h-0.5 bg-destructive" />
    </div>
  );
}
