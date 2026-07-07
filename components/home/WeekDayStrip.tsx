import { Cloud, CloudSun, Sun, type LucideIcon } from "lucide-react";

import type { WeatherData } from "@/lib/weather";

export interface WeekDaySummary {
  offset: number;
  dayLabel: string;
  dateLabel: string;
  weather: WeatherData | null;
  eventCount: number;
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

function getWeekWeatherIcon(condition: string | undefined): {
  Icon: LucideIcon;
  colorClass: string;
} {
  const normalized = (condition ?? "cloudy").toLowerCase();

  if (normalized.includes("clear") || normalized.includes("sunny")) {
    return { Icon: Sun, colorClass: "text-[#E8C84A]" };
  }
  if (normalized.includes("partly")) {
    return { Icon: CloudSun, colorClass: "text-[#6B5744]/45" };
  }
  if (normalized.includes("cloud")) {
    return { Icon: Cloud, colorClass: "text-[#6B5744]/40" };
  }

  return { Icon: CloudSun, colorClass: "text-[#6B5744]/45" };
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
    <div className="mb-6 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {days.map((day) => {
        const selected = day.offset === selectedOffset;
        const condition = day.weather?.condition;
        const { Icon, colorClass } = getWeekWeatherIcon(condition);

        return (
          <button
            key={day.offset}
            type="button"
            onClick={() => onSelect(day.offset)}
            className={`flex min-w-[calc(25%-0.75rem)] shrink-0 snap-start flex-col items-center rounded-[22px] px-3 py-4 transition ${
              selected
                ? "bg-white shadow-[0_4px_20px_rgba(61,46,31,0.08)]"
                : "bg-transparent"
            }`}
          >
            <span
              className={`text-[11px] font-bold uppercase tracking-[0.14em] ${
                selected ? "text-[#4A80F0]" : "text-[#6B5744]/45"
              }`}
            >
              {day.dayLabel}
            </span>

            <Icon
              className={`my-2.5 ${
                selected ? "h-8 w-8" : "h-7 w-7"
              } ${colorClass}`}
              strokeWidth={1.75}
              aria-hidden
            />

            <span
              className={`font-bold leading-none ${
                selected
                  ? "text-[26px] text-[#4A3F35]"
                  : "text-[22px] text-[#4A3F35]/75"
              }`}
            >
              {day.weather ? `${day.weather.temperatureF}°` : "—"}
            </span>

            <span
              className={`mt-1.5 text-[11px] ${
                selected ? "text-[#6B5744]/55" : "text-[#6B5744]/45"
              }`}
            >
              {formatConditionLabel(condition)}
            </span>

            <span
              className={`mt-3 rounded-full px-2.5 py-1 text-[10px] font-medium ${
                selected
                  ? "bg-[#4A80F0]/10 text-[#4A80F0]"
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
