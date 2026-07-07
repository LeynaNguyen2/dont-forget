import WeatherIcon from "@/components/WeatherIcon";
import type { WeatherData } from "@/lib/weather";

export interface WeekDaySummary {
  offset: number;
  dayLabel: string;
  dateLabel: string;
  weather: WeatherData | null;
  eventCount: number;
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
    <div className="mb-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {days.map((day) => {
        const selected = day.offset === selectedOffset;
        const condition = day.weather?.condition ?? "cloudy";

        return (
          <button
            key={day.offset}
            type="button"
            onClick={() => onSelect(day.offset)}
            className={`flex min-w-[5.5rem] shrink-0 flex-col items-center rounded-3xl px-3 py-4 transition ${
              selected
                ? "bg-[#FAFAF8] shadow-card"
                : "bg-transparent text-brand-brown/50"
            }`}
          >
            <span
              className={`text-xs font-bold tracking-wide ${
                selected ? "text-brand-blue" : ""
              }`}
            >
              {day.dayLabel}
            </span>
            <WeatherIcon
              condition={condition}
              className={`my-2 ${selected ? "text-2xl" : "text-xl opacity-70"}`}
            />
            <span
              className={`text-lg font-bold ${
                selected ? "text-brand-brown" : "text-brand-brown/60"
              }`}
            >
              {day.weather ? `${day.weather.temperatureF}°` : "—"}
            </span>
            <span className="mt-0.5 text-[10px] capitalize text-brand-brown/50">
              {day.weather?.condition ?? "—"}
            </span>
            <span
              className={`mt-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                selected
                  ? "bg-brand-blue/10 text-brand-blue"
                  : "text-brand-brown/40"
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
