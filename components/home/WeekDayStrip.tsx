import WeatherIcon from "@/components/WeatherIcon";
import type { WeatherData } from "@/lib/weather";

export interface WeekDaySummary {
  offset: number;
  dayLabel: string;
  dateLabel: string;
  weather: WeatherData | null;
  eventCount: number;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
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
                ? "bg-white shadow-card"
                : "bg-transparent"
            }`}
          >
            <span
              className={`text-xs font-bold tracking-wide ${
                selected ? "text-brand-blue" : "text-brand-brown/40"
              }`}
            >
              {day.dayLabel}
            </span>
            <WeatherIcon
              condition={condition}
              className={`my-2 ${
                selected
                  ? "h-6 w-6 text-amber-500"
                  : "h-5 w-5 text-brand-brown/35"
              }`}
            />
            <span
              className={`text-lg font-bold ${
                selected ? "text-brand-brown" : "text-brand-brown/50"
              }`}
            >
              {day.weather ? `${day.weather.temperatureF}°` : "—"}
            </span>
            <span
              className={`mt-0.5 text-[10px] capitalize ${
                selected ? "text-brand-brown/50" : "text-brand-brown/35"
              }`}
            >
              {day.weather ? capitalize(day.weather.condition) : "—"}
            </span>
            {selected ? (
              <span className="mt-2 rounded-full bg-brand-blue/10 px-2.5 py-0.5 text-[10px] font-medium text-brand-blue">
                {day.eventCount} event{day.eventCount === 1 ? "" : "s"}
              </span>
            ) : (
              <span className="mt-2 text-[10px] text-brand-brown/35">
                {day.eventCount} event{day.eventCount === 1 ? "" : "s"}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
