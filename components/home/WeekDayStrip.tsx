import type { CSSProperties, ReactNode } from "react";

import type { WeatherData } from "@/lib/weather";

export interface WeekDaySummary {
  offset: number;
  dayLabel: string;
  dateLabel: string;
  weather: WeatherData | null;
  eventCount: number;
}

type FlatIconProps = {
  size?: number;
  style?: CSSProperties;
};

function FlatSun({ size = 28, style }: FlatIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      style={style}
      aria-hidden
    >
      <circle cx="16" cy="16" r="6.5" fill="#E8C84A" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <rect
          key={deg}
          x="15"
          y="4"
          width="2"
          height="4.5"
          rx="1"
          fill="#E8C84A"
          transform={`rotate(${deg} 16 16)`}
        />
      ))}
    </svg>
  );
}

function FlatCloud({ size = 28, style }: FlatIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      style={style}
      aria-hidden
    >
      <ellipse cx="12.5" cy="18" rx="7.5" ry="5.5" fill="#6B8EC4" />
      <ellipse cx="21" cy="17" rx="7" ry="5" fill="#6B8EC4" />
      <rect x="7" y="15" width="18" height="8" rx="4" fill="#6B8EC4" />
    </svg>
  );
}

function FlatPartlyCloud({ size = 28, style }: FlatIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      style={style}
      aria-hidden
    >
      <circle cx="22" cy="12" r="5" fill="#E8C84A" />
      <rect x="20.5" y="5" width="1.8" height="3.5" rx="0.9" fill="#E8C84A" />
      <rect x="20.5" y="15" width="1.8" height="3.5" rx="0.9" fill="#E8C84A" />
      <rect x="25.5" y="10.5" width="3.5" height="1.8" rx="0.9" fill="#E8C84A" />
      <ellipse cx="12.5" cy="19" rx="7.5" ry="5.5" fill="#6B8EC4" />
      <ellipse cx="20.5" cy="18" rx="7" ry="5" fill="#6B8EC4" />
      <rect x="7" y="16" width="17" height="8" rx="4" fill="#6B8EC4" />
    </svg>
  );
}

function FlatRain({ size = 28, style }: FlatIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      style={style}
      aria-hidden
    >
      <ellipse cx="12.5" cy="15" rx="7.5" ry="5.5" fill="#6B8EC4" />
      <ellipse cx="21" cy="14" rx="7" ry="5" fill="#6B8EC4" />
      <rect x="7" y="12" width="18" height="8" rx="4" fill="#6B8EC4" />
      <rect x="11" y="22" width="2" height="5" rx="1" fill="#6B8EC4" />
      <rect x="16" y="22" width="2" height="5" rx="1" fill="#6B8EC4" />
      <rect x="21" y="22" width="2" height="5" rx="1" fill="#6B8EC4" />
    </svg>
  );
}

function formatConditionLabel(condition: string | undefined): string {
  const normalized = (condition ?? "").toLowerCase();

  if (normalized.includes("clear")) return "Clear";
  if (normalized.includes("sunny")) return "Sunny";
  if (normalized.includes("partly")) return "Partly";
  if (normalized.includes("cloud")) return "Cloudy";
  if (normalized.includes("rain")) return "Rainy";

  if (!condition) return "—";
  return condition.split(" ")[0];
}

function getWeekWeatherIcon(condition: string | undefined): ReactNode {
  const normalized = (condition ?? "cloudy").toLowerCase();
  const iconSize = 28;

  if (normalized.includes("rain") || normalized.includes("drizzle")) {
    return <FlatRain size={iconSize} />;
  }
  if (normalized.includes("partly")) {
    return <FlatPartlyCloud size={iconSize} />;
  }
  if (normalized.includes("clear") || normalized.includes("sunny")) {
    return <FlatSun size={iconSize} />;
  }
  if (normalized.includes("cloud")) {
    return <FlatCloud size={iconSize} />;
  }

  return <FlatPartlyCloud size={iconSize} />;
}

export default function WeekDayStrip({
  days,
  selectedOffset,
  onSelect,
}: {
  days: WeekDaySummary[];
  selectedOffset: number;
  onSelect: (offset: number) => void;
}) {
  return (
    <div
      className="mb-6 grid w-full gap-3 bg-[#F5F0E8]"
      style={{
        gridTemplateColumns: `repeat(${Math.max(days.length, 1)}, minmax(0, 1fr))`,
      }}
    >
      {days.map((day) => {
        const selected = day.offset === selectedOffset;
        const condition = day.weather?.condition;

        return (
          <button
            key={day.offset}
            type="button"
            onClick={() => onSelect(day.offset)}
            className={`flex w-full min-w-0 flex-col items-center rounded-[22px] px-2 py-3.5 transition ${
              selected
                ? "bg-white shadow-[0_4px_18px_rgba(61,46,31,0.08)]"
                : "bg-transparent"
            }`}
          >
            <span
              className={`text-[10px] font-bold uppercase tracking-[0.16em] ${
                selected ? "text-[#4A80F0]" : "text-[#6B5744]/45"
              }`}
            >
              {day.dayLabel}
            </span>

            <div className="my-2.5 flex h-7 w-7 items-center justify-center">
              {getWeekWeatherIcon(condition)}
            </div>

            <span
              className={`font-bold leading-none ${
                selected
                  ? "text-[28px] text-[#4A3F35]"
                  : "text-[20px] text-[#4A3F35]/80"
              }`}
            >
              {day.weather ? `${day.weather.temperatureF}°` : "—"}
            </span>

            <span className="mt-1.5 text-[11px] text-[#6B5744]/50">
              {formatConditionLabel(condition)}
            </span>

            <span
              className={`mt-3 rounded-full px-2 py-0.5 text-[9px] font-medium leading-tight ${
                selected
                  ? "bg-[#4A80F0]/12 text-[#4A80F0]"
                  : "bg-[#E8E3D8] text-[#6B5744]/50"
              }`}
            >
              {day.eventCount} event{day.eventCount === 1 ? "" : "s"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
