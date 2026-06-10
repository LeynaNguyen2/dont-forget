"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import EventCard from "@/components/home/EventCard";
import WeekDayStrip, {
  type WeekDaySummary,
} from "@/components/home/WeekDayStrip";
import WeatherIcon from "@/components/WeatherIcon";
import type { CalendarEventWithWeather } from "@/lib/brief";
import { fetchProfile } from "@/lib/profile-client";
import { getHomeLocation } from "@/lib/settings";
import { buildWeatherSummary } from "@/lib/weather-description";
import type { WeatherData } from "@/lib/weather";

type Tab = "today" | "tomorrow" | "week";

async function parseApiError(response: Response, fallback: string): Promise<string> {
  try {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      return data.error ?? fallback;
    }
    const text = await response.text();
    return text || fallback;
  } catch {
    return fallback;
  }
}

function CardSkeleton({ className = "h-32" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-3xl bg-white/60 shadow-sm ${className}`}
    />
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  );
}

function formatDateHeader(timezone: string | null): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: timezone ?? undefined,
  }).format(new Date());
}

function formatShortDate(offset: number, timezone: string): string {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: timezone });
  const [y, m, d] = today.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + offset));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function getDayLabel(offset: number, timezone: string): string {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: timezone });
  const [y, m, d] = today.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + offset));
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "UTC",
  })
    .format(date)
    .toUpperCase();
}

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [tab, setTab] = useState<Tab>("today");
  const [timezone, setTimezone] = useState<string | null>(null);
  const [homeCity, setHomeCity] = useState<string | null>(null);

  const [heroWeather, setHeroWeather] = useState<WeatherData | null>(null);
  const [heroLocationLabel, setHeroLocationLabel] = useState<string | null>(null);
  const [weatherSummary, setWeatherSummary] = useState<string | null>(null);

  const [events, setEvents] = useState<CalendarEventWithWeather[]>([]);
  const [brief, setBrief] = useState<string | null>(null);
  const [briefGeneratedAt, setBriefGeneratedAt] = useState<Date | null>(null);

  const [weekDays, setWeekDays] = useState<WeekDaySummary[]>([]);
  const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);
  const [weekEventsByDay, setWeekEventsByDay] = useState<
    Record<number, CalendarEventWithWeather[]>
  >({});

  const [loadingHero, setLoadingHero] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingBrief, setLoadingBrief] = useState(false);
  const [loadingWeek, setLoadingWeek] = useState(false);

  const [heroError, setHeroError] = useState<string | null>(null);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [briefError, setBriefError] = useState<string | null>(null);

  const firstName = useMemo(() => {
    const name = session?.user?.name ?? session?.user?.email ?? "there";
    return name.split(" ")[0] ?? name;
  }, [session]);

  const userInitial = useMemo(() => {
    const name = session?.user?.name ?? session?.user?.email ?? "U";
    return name.charAt(0).toUpperCase();
  }, [session]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await fetchProfile();
        setTimezone(profile.timezone);
        setHomeCity(profile.homeCity || getHomeLocation());
      } catch {
        setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
        setHomeCity(getHomeLocation());
      }
    }

    if (status === "authenticated") {
      void loadProfile();
    }
  }, [status]);

  const fetchWeatherForDay = useCallback(
    async (dayOffset: number, location: string) => {
      const day = dayOffset === 0 ? "today" : dayOffset === 1 ? "tomorrow" : String(dayOffset);
      const params = new URLSearchParams({ location, day });
      const response = await fetch(`/api/weather?${params}`);
      if (!response.ok) return null;
      const data = await response.json();
      return {
        weather: data.weather as WeatherData | null,
        displayName: data.displayName as string | null,
      };
    },
    []
  );

  const resolveHeroWeather = useCallback(
    async (calendarEvents: CalendarEventWithWeather[], dayOffset: number) => {
      setLoadingHero(true);
      setHeroError(null);

      const firstEventWithWeather = calendarEvents.find((event) => event.weather);
      if (firstEventWithWeather?.weather) {
        const label =
          firstEventWithWeather.displayName ?? firstEventWithWeather.location;
        setHeroWeather(firstEventWithWeather.weather);
        setHeroLocationLabel(label);
        setWeatherSummary(
          buildWeatherSummary(firstEventWithWeather.weather, label)
        );
        setLoadingHero(false);
        return;
      }

      const location = homeCity;
      if (!location) {
        setHeroWeather(null);
        setHeroLocationLabel(null);
        setWeatherSummary(null);
        setHeroError("Set your home city in Settings to see weather.");
        setLoadingHero(false);
        return;
      }

      try {
        const result = await fetchWeatherForDay(dayOffset, location);
        if (!result?.weather) {
          setHeroWeather(null);
          setWeatherSummary(null);
          setHeroError("Weather unavailable.");
          return;
        }
        const label = result.displayName ?? location;
        setHeroWeather(result.weather);
        setHeroLocationLabel(label);
        setWeatherSummary(buildWeatherSummary(result.weather, label));
      } catch {
        setHeroError("Failed to load weather.");
      } finally {
        setLoadingHero(false);
      }
    },
    [homeCity, fetchWeatherForDay]
  );

  const fetchCalendarEvents = useCallback(
    async (dayOffset: number): Promise<CalendarEventWithWeather[]> => {
      if (!timezone) return [];

      const day =
        dayOffset === 0 ? "today" : dayOffset === 1 ? "tomorrow" : String(dayOffset);
      const params = new URLSearchParams({ timezone, day });
      const response = await fetch(`/api/calendar?${params}`, {
        credentials: "include",
        headers: { "x-timezone": timezone },
      });

      if (!response.ok) {
        throw new Error(
          await parseApiError(response, "Failed to load calendar events.")
        );
      }

      const data = await response.json();
      return data.events ?? [];
    },
    [timezone]
  );

  const fetchBrief = useCallback(async () => {
    if (!timezone) return;

    setLoadingBrief(true);
    setBriefError(null);

    try {
      const params = new URLSearchParams({ timezone });
      const response = await fetch(`/api/brief?${params}`, {
        credentials: "include",
        headers: { "x-timezone": timezone },
      });

      if (!response.ok) {
        setBrief(null);
        setBriefError(
          await parseApiError(response, "Failed to load morning brief.")
        );
        return;
      }

      setBrief(await response.text());
      setBriefGeneratedAt(new Date());
    } catch {
      setBrief(null);
      setBriefError("Failed to load morning brief.");
    } finally {
      setLoadingBrief(false);
    }
  }, [timezone]);

  const loadDayTab = useCallback(
    async (dayOffset: number) => {
      if (!timezone) return;

      setLoadingEvents(true);
      setEventsError(null);

      try {
        const calendarEvents = await fetchCalendarEvents(dayOffset);
        setEvents(calendarEvents);
        await resolveHeroWeather(calendarEvents, dayOffset);
      } catch (error) {
        setEvents([]);
        setEventsError(
          error instanceof Error ? error.message : "Failed to load events."
        );
        await resolveHeroWeather([], dayOffset);
      } finally {
        setLoadingEvents(false);
      }
    },
    [timezone, fetchCalendarEvents, resolveHeroWeather]
  );

  const loadWeekView = useCallback(async () => {
    if (!timezone) return;

    setLoadingWeek(true);
    setEventsError(null);

    try {
      const offsets = [0, 1, 2, 3];
      const results = await Promise.all(
        offsets.map(async (offset) => {
          const calendarEvents = await fetchCalendarEvents(offset);
          let weather: WeatherData | null = null;

          const eventWeather = calendarEvents.find((e) => e.weather)?.weather;
          if (eventWeather) {
            weather = eventWeather;
          } else if (homeCity) {
            const result = await fetchWeatherForDay(offset, homeCity);
            weather = result?.weather ?? null;
          }

          return { offset, calendarEvents, weather };
        })
      );

      const eventsMap: Record<number, CalendarEventWithWeather[]> = {};
      const summaries: WeekDaySummary[] = results.map(
        ({ offset, calendarEvents, weather }) => {
          eventsMap[offset] = calendarEvents;
          return {
            offset,
            dayLabel: getDayLabel(offset, timezone),
            dateLabel: formatShortDate(offset, timezone),
            weather,
            eventCount: calendarEvents.length,
          };
        }
      );

      setWeekEventsByDay(eventsMap);
      setWeekDays(summaries);
    } catch (error) {
      setEventsError(
        error instanceof Error ? error.message : "Failed to load week view."
      );
    } finally {
      setLoadingWeek(false);
    }
  }, [timezone, homeCity, fetchCalendarEvents, fetchWeatherForDay]);

  useEffect(() => {
    if (status !== "authenticated" || !timezone) return;

    if (tab === "week") {
      void loadWeekView();
      return;
    }

    const offset = tab === "tomorrow" ? 1 : 0;
    void loadDayTab(offset);

    if (tab === "today") {
      void fetchBrief();
    } else {
      setBrief(null);
      setBriefError(null);
    }
  }, [status, timezone, tab, loadDayTab, loadWeekView, fetchBrief]);

  useEffect(() => {
    if (tab !== "week" || !timezone) return;
    setEvents(weekEventsByDay[selectedWeekOffset] ?? []);
    void resolveHeroWeather(
      weekEventsByDay[selectedWeekOffset] ?? [],
      selectedWeekOffset
    );
  }, [selectedWeekOffset, tab, weekEventsByDay, timezone, resolveHeroWeather]);

  if (status !== "authenticated") {
    return (
      <main className="min-h-screen bg-brand-cream px-4 py-6">
        <div className="mx-auto max-w-md space-y-4">
          <CardSkeleton className="h-8 w-48" />
          <CardSkeleton className="h-24" />
          <CardSkeleton className="h-40" />
        </div>
      </main>
    );
  }

  const sectionTitle =
    tab === "week"
      ? weekDays.find((d) => d.offset === selectedWeekOffset)?.dateLabel ?? "Your Day"
      : tab === "today"
        ? "Your Day"
        : "Tomorrow";

  const isLoading = tab === "week" ? loadingWeek : loadingEvents;

  return (
    <main className="min-h-screen bg-brand-cream px-4 pb-10 pt-6">
      <div className="mx-auto max-w-md">
        <header className="mb-4">
          <p className="text-sm text-brand-brown/50">
            {formatDateHeader(timezone)}
          </p>
          <div className="mt-1 flex items-start justify-between gap-3">
            <h1 className="font-serif text-3xl font-bold leading-tight text-brand-brown">
              Good morning,{" "}
              <span className="italic text-brand-blue">{firstName}</span>{" "}
              <span className="text-2xl">☀️</span>
            </h1>
            <Link
              href="/settings"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-serif font-bold text-brand-blue shadow-card"
              aria-label="Settings"
            >
              {userInitial}
            </Link>
          </div>
        </header>

        {loadingHero ? (
          <CardSkeleton className="mb-5 h-24" />
        ) : heroError ? (
          <div className="mb-5">
            <ErrorMessage message={heroError} />
          </div>
        ) : weatherSummary ? (
          <section className="mb-5 rounded-3xl bg-brand-blue/8 px-4 py-4 shadow-sm">
            <p className="flex items-start gap-2 text-sm leading-relaxed text-brand-brown/80">
              {heroWeather && (
                <WeatherIcon
                  condition={heroWeather.condition}
                  className="mt-0.5 shrink-0 text-lg"
                />
              )}
              <span>
                <strong className="font-semibold text-brand-brown">
                  {heroWeather?.temperatureF}° now in {heroLocationLabel}
                </strong>
                {" · "}
                {weatherSummary.split(" · ").slice(1).join(" · ")}
              </span>
            </p>
          </section>
        ) : null}

        <div className="mb-6 flex rounded-full bg-brand-cream-dark/80 p-1">
          {(["today", "tomorrow", "week"] as Tab[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`flex-1 rounded-full py-2.5 text-sm font-semibold capitalize transition ${
                tab === value
                  ? "bg-white text-brand-brown shadow-card"
                  : "text-brand-brown/45"
              }`}
            >
              {value}
            </button>
          ))}
        </div>

        {tab === "week" && weekDays.length > 0 && (
          <WeekDayStrip
            days={weekDays}
            selectedOffset={selectedWeekOffset}
            onSelect={setSelectedWeekOffset}
          />
        )}

        {tab === "today" &&
          (loadingBrief ? (
            <CardSkeleton className="mb-6 h-36" />
          ) : (
            <section className="relative mb-6 overflow-hidden rounded-3xl bg-white p-5 shadow-card">
              <span className="pointer-events-none absolute -right-1 -top-1 text-sm opacity-60">
                ✦
              </span>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">✦</span>
                  <h2 className="text-xs font-bold tracking-[0.15em] text-brand-blue">
                    HEADS UP
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => void fetchBrief()}
                  disabled={loadingBrief}
                  className="flex items-center gap-1 rounded-full bg-brand-blue/10 px-3 py-1 text-xs font-medium text-brand-blue transition hover:bg-brand-blue/15 disabled:opacity-50"
                >
                  <span>↻</span>
                  Refresh
                </button>
              </div>
              {briefError ? (
                <ErrorMessage message={briefError} />
              ) : (
                <p className="text-sm leading-relaxed text-brand-brown/75">
                  {brief ?? "No brief available for today."}
                </p>
              )}
              {briefGeneratedAt && (
                <p className="mt-3 text-xs italic text-brand-brown/40">
                  Generated today at{" "}
                  {briefGeneratedAt.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    timeZone: timezone ?? undefined,
                  })}
                </p>
              )}
            </section>
          ))}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-brand-brown">
              {sectionTitle}
            </h2>
            <span className="text-xs text-brand-brown/45">
              {events.length} event{events.length === 1 ? "" : "s"}
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <CardSkeleton className="h-28" />
              <CardSkeleton className="h-28" />
            </div>
          ) : eventsError ? (
            <ErrorMessage message={eventsError} />
          ) : events.length === 0 ? (
            <div className="rounded-3xl bg-white p-6 text-center shadow-card">
              <p className="text-sm text-brand-brown/50">
                No events with locations scheduled.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event, index) => (
                <EventCard
                  key={`${event.title}-${event.startTime}`}
                  event={event}
                  timezone={timezone}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
