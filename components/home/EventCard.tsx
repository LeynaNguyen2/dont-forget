import { MapPin, Umbrella, Video } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import type { CalendarEventWithWeather } from "@/lib/brief";

const ACCENT_COLORS = [
  "bg-brand-blue",
  "bg-violet-500",
  "bg-amber-500",
  "bg-emerald-500",
];

type FlatIconProps = {
  size?: number;
  sunColor?: string;
  cloudColor?: string;
  style?: CSSProperties;
};

function FlatSun({
  size = 24,
  sunColor = "#C4A03A",
  style,
}: FlatIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      style={style}
      aria-hidden
    >
      <circle cx="16" cy="16" r="6.5" fill={sunColor} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <rect
          key={deg}
          x="15"
          y="4"
          width="2"
          height="4.5"
          rx="1"
          fill={sunColor}
          transform={`rotate(${deg} 16 16)`}
        />
      ))}
    </svg>
  );
}

function FlatCloud({
  size = 24,
  cloudColor = "#7A9ABE",
  style,
}: FlatIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      style={style}
      aria-hidden
    >
      <ellipse cx="12.5" cy="18" rx="7.5" ry="5.5" fill={cloudColor} />
      <ellipse cx="21" cy="17" rx="7" ry="5" fill={cloudColor} />
      <rect x="7" y="15" width="18" height="8" rx="4" fill={cloudColor} />
    </svg>
  );
}

function FlatPartlyCloud({
  size = 24,
  sunColor = "#C4A03A",
  cloudColor = "#7A9ABE",
  style,
}: FlatIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      style={style}
      aria-hidden
    >
      <circle cx="22" cy="12" r="5" fill={sunColor} />
      <rect x="20.5" y="5" width="1.8" height="3.5" rx="0.9" fill={sunColor} />
      <rect x="20.5" y="15" width="1.8" height="3.5" rx="0.9" fill={sunColor} />
      <rect x="25.5" y="10.5" width="3.5" height="1.8" rx="0.9" fill={sunColor} />
      <ellipse cx="12.5" cy="19" rx="7.5" ry="5.5" fill={cloudColor} />
      <ellipse cx="20.5" cy="18" rx="7" ry="5" fill={cloudColor} />
      <rect x="7" y="16" width="17" height="8" rx="4" fill={cloudColor} />
    </svg>
  );
}

function FlatRain({
  size = 24,
  cloudColor = "#5A7AC8",
  style,
}: FlatIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      style={style}
      aria-hidden
    >
      <ellipse cx="12.5" cy="15" rx="7.5" ry="5.5" fill={cloudColor} />
      <ellipse cx="21" cy="14" rx="7" ry="5" fill={cloudColor} />
      <rect x="7" y="12" width="18" height="8" rx="4" fill={cloudColor} />
      <rect x="11" y="22" width="2" height="5" rx="1" fill={cloudColor} />
      <rect x="16" y="22" width="2" height="5" rx="1" fill={cloudColor} />
      <rect x="21" y="22" width="2" height="5" rx="1" fill={cloudColor} />
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
  if (normalized.includes("storm") || normalized.includes("thunder")) {
    return "Stormy";
  }

  if (!condition) return "—";
  return condition.charAt(0).toUpperCase() + condition.slice(1);
}

function getEventWeatherPresentation(condition: string | undefined): {
  gradientClass: string;
  icon: ReactNode;
} {
  const normalized = (condition ?? "cloudy").toLowerCase();
  const iconSize = 24;

  if (
    normalized.includes("rain") ||
    normalized.includes("drizzle") ||
    normalized.includes("storm") ||
    normalized.includes("thunder")
  ) {
    return {
      gradientClass: "from-[#E8EFF8] to-[#C5D8F0]",
      icon: <FlatRain size={iconSize} cloudColor="#5A7AC8" />,
    };
  }

  if (normalized.includes("partly")) {
    return {
      gradientClass: "from-[#FFF8E7] to-[#E8F0FB]",
      icon: (
        <FlatPartlyCloud
          size={iconSize}
          sunColor="#C4A03A"
          cloudColor="#7A9ABE"
        />
      ),
    };
  }

  if (normalized.includes("clear") || normalized.includes("sunny")) {
    return {
      gradientClass: "from-[#FFF8E7] to-[#E8F0FB]",
      icon: <FlatSun size={iconSize} sunColor="#C4A03A" />,
    };
  }

  if (normalized.includes("cloud")) {
    return {
      gradientClass: "from-[#EEF2F8] to-[#D6E4F5]",
      icon: <FlatCloud size={iconSize} cloudColor="#7A9ABE" />,
    };
  }

  return {
    gradientClass: "from-[#FFF8E7] to-[#E8F0FB]",
    icon: (
      <FlatPartlyCloud
        size={iconSize}
        sunColor="#C4A03A"
        cloudColor="#7A9ABE"
      />
    ),
  };
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
  const isVirtual = event.location === "Virtual";
  const locationLabel = isVirtual ? "Virtual" : event.displayName ?? event.location;
  const showUmbrella =
    event.weather && event.weather.chanceOfRain > 30;
  const weatherPresentation = event.weather
    ? getEventWeatherPresentation(event.weather.condition)
    : null;

  return (
    <article className="relative overflow-hidden rounded-3xl bg-[#FAFAF8] p-4 shadow-card">
      <div className={`absolute bottom-3 left-0 top-3 w-1.5 rounded-full ${accent}`} />
      <div className="flex items-start justify-between gap-3 pl-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-brand-brown/50">
            {formatTimeRange(event.startTime, event.endTime, timezone)}
          </p>
          <h3 className="mt-1 font-serif text-lg font-bold text-brand-brown">
            {event.title}
          </h3>
          {locationLabel && (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-brand-brown/60">
              {isVirtual ? (
                <Video className="h-3.5 w-3.5 shrink-0" aria-hidden />
              ) : (
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              )}
              <span className="truncate">{locationLabel}</span>
            </p>
          )}
          {showUmbrella && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-brand-blue">
              <Umbrella className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>Pack umbrella · {event.weather!.chanceOfRain}% rain</span>
            </p>
          )}
        </div>
        {event.weather && weatherPresentation && (
          <div
            className={`flex shrink-0 flex-col items-center gap-1 rounded-2xl bg-gradient-to-b px-3 py-2.5 ${weatherPresentation.gradientClass}`}
          >
            {weatherPresentation.icon}
            <span className="text-sm font-bold text-[#3B6FE8]">
              {event.weather.temperatureF}°
            </span>
            <span className="text-[10px] text-[#6B5744]/50">
              {formatConditionLabel(event.weather.condition)}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
