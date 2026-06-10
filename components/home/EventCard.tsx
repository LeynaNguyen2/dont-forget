import { MapPin, Umbrella } from "lucide-react";

import WeatherIcon from "@/components/WeatherIcon";
import type { CalendarEventWithWeather } from "@/lib/brief";
import { formatEventLocation } from "@/lib/event-location";

const ACCENT_COLORS = [
  "bg-brand-blue",
  "bg-violet-500",
  "bg-amber-500",
  "bg-emerald-500",
];

function capitalize(text: string | undefined): string {
  if (!text) return "Unknown";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatTimeRange(
  startIso: string,
  endIso: string,
  timezone: string | null
): string {
  const format = (iso: string) => {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: timezone ?? undefined,
    }).format(date);
  };

  return `${format(startIso)} – ${format(endIso)}`;
}

export default function EventCard({
  event,
  timezone,
  index,
}: {
  event: CalendarEventWithWeather;
  timezone: string | null;
  index: number;
}) {
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const location = formatEventLocation(event.location, event.displayName);
  const showUmbrella = event.weather && event.weather.chanceOfRain > 30;

  return (
    <article className="relative overflow-hidden rounded-3xl bg-white p-4 shadow-card">
      <div
        className={`absolute bottom-3 left-0 top-3 w-1.5 rounded-full ${accent}`}
      />
      <div className="flex items-start justify-between gap-3 pl-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-brand-brown/50">
            {formatTimeRange(event.startTime, event.endTime, timezone)}
          </p>
          <h3 className="mt-1 font-serif text-lg font-bold text-brand-brown">
            {event.title}
          </h3>
          {location && (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-brand-brown/60">
              <MapPin
                className="h-3.5 w-3.5 shrink-0 text-brand-brown/40"
                strokeWidth={2}
              />
              <span className="truncate">{location}</span>
            </p>
          )}
          {showUmbrella && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-brand-blue">
              <Umbrella className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Pack umbrella · {event.weather!.chanceOfRain}% rain</span>
            </p>
          )}
        </div>
        {event.weather && (
          <div className="flex shrink-0 flex-col items-center gap-1 rounded-2xl bg-[#EEF2F8] px-3 py-2.5">
            <WeatherIcon
              condition={event.weather.condition}
              className="h-5 w-5 text-amber-500"
            />
            <span className="text-base font-bold text-brand-blue">
              {event.weather.temperatureF}°
            </span>
            <span className="text-[10px] text-brand-brown/50">
              {capitalize(event.weather.condition)}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
