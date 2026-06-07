"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import SettingsMenu from "@/components/SettingsMenu";
import SignInScreen from "@/components/SignInScreen";
import WeatherIcon from "@/components/WeatherIcon";
import type { CalendarEventWithWeather } from "@/lib/brief";
import { getHomeLocation } from "@/lib/settings";
import type { WeatherData } from "@/lib/weather";

type Tab = "today" | "tomorrow";

function formatEventTime(iso: string, timezone: string | null): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  if (!timezone) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  }).format(date);
}

function capitalize(text: string | undefined): string {
  if (!text) {
    return "Unknown";
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

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
      className={`animate-pulse rounded-3xl bg-white/80 shadow-sm ${className}`}
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

function HomePageLoading() {
  return (
    <main className="min-h-screen bg-[#EEF2FF] px-4 pb-10 pt-6">
      <div className="mx-auto max-w-md">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Don&apos;t Forget
            </h1>
            <p className="mt-1 text-xs text-slate-400">Loading...</p>
          </div>
        </header>
        <CardSkeleton className="mb-4 h-36" />
        <CardSkeleton className="mb-6 h-28" />
        <div className="space-y-3">
          <CardSkeleton className="h-24" />
          <CardSkeleton className="h-24" />
          <CardSkeleton className="h-24" />
        </div>
      </div>
    </main>
  );
}

export default function HomePage() {
  const { status } = useSession();
  const [hasMounted, setHasMounted] = useState(false);
  const [tab, setTab] = useState<Tab>("today");
  const [timezone, setTimezone] = useState<string | null>(null);
  const [heroWeather, setHeroWeather] = useState<WeatherData | null>(null);
  const [heroLocationLabel, setHeroLocationLabel] = useState<string | null>(
    null
  );
  const [events, setEvents] = useState<CalendarEventWithWeather[]>([]);
  const [brief, setBrief] = useState<string | null>(null);

  const [loadingHero, setLoadingHero] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingBrief, setLoadingBrief] = useState(false);

  const [heroError, setHeroError] = useState<string | null>(null);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [briefError, setBriefError] = useState<string | null>(null);

  useEffect(() => {
    setHasMounted(true);
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const resolveHeroWeather = useCallback(
    async (calendarEvents: CalendarEventWithWeather[], day: Tab) => {
      setLoadingHero(true);
      setHeroError(null);

      const firstEventWithWeather = calendarEvents.find((event) => event.weather);
      if (firstEventWithWeather?.weather) {
        setHeroWeather(firstEventWithWeather.weather);
        setHeroLocationLabel(
          firstEventWithWeather.displayName ?? firstEventWithWeather.location
        );
        setLoadingHero(false);
        return;
      }

      const homeLocation = getHomeLocation();
      if (!homeLocation) {
        setHeroWeather(null);
        setHeroLocationLabel(null);
        setHeroError(
          `No events ${day === "today" ? "today" : "tomorrow"}. Set a home address in settings to see weather.`
        );
        setLoadingHero(false);
        return;
      }

      try {
        const params = new URLSearchParams({
          location: homeLocation,
          day,
        });
        const response = await fetch(`/api/weather?${params.toString()}`, {
          credentials: "same-origin",
        });

        if (!response.ok) {
          setHeroWeather(null);
          setHeroLocationLabel(null);
          setHeroError(
            await parseApiError(response, "Failed to load home location weather.")
          );
          return;
        }

        const data = await response.json();
        setHeroWeather(data.weather ?? null);
        setHeroLocationLabel(data.displayName ?? homeLocation);
      } catch {
        setHeroWeather(null);
        setHeroLocationLabel(null);
        setHeroError("Failed to load home location weather.");
      } finally {
        setLoadingHero(false);
      }
    },
    []
  );

  const fetchEvents = useCallback(async () => {
    if (!timezone) {
      return;
    }

    setLoadingEvents(true);
    setLoadingHero(true);
    setEventsError(null);

    try {
      const params = new URLSearchParams({
        timezone,
        day: tab,
      });

      const response = await fetch(`/api/calendar?${params.toString()}`, {
        credentials: "same-origin",
        headers: {
          "x-timezone": timezone,
        },
      });

      if (!response.ok) {
        setEvents([]);
        setEventsError(
          await parseApiError(
            response,
            `Failed to load calendar events (${response.status}).`
          )
        );
        await resolveHeroWeather([], tab);
        return;
      }

      const data = await response.json();
      const calendarEvents = data.events ?? [];
      setEvents(calendarEvents);
      await resolveHeroWeather(calendarEvents, tab);
    } catch {
      setEvents([]);
      setEventsError("Failed to load calendar events. Please try again.");
      await resolveHeroWeather([], tab);
    } finally {
      setLoadingEvents(false);
    }
  }, [timezone, tab, resolveHeroWeather]);

  const fetchBrief = useCallback(async () => {
    if (!timezone) {
      return;
    }

    if (tab !== "today") {
      setBrief(null);
      setBriefError(null);
      setLoadingBrief(false);
      return;
    }

    setLoadingBrief(true);
    setBriefError(null);

    try {
      const params = new URLSearchParams({ timezone });

      const response = await fetch(`/api/brief?${params.toString()}`, {
        credentials: "same-origin",
        headers: {
          "x-timezone": timezone,
        },
      });

      if (!response.ok) {
        setBrief(null);
        setBriefError(
          await parseApiError(
            response,
            `Failed to load morning brief (${response.status}).`
          )
        );
        return;
      }

      setBrief(await response.text());
    } catch {
      setBrief(null);
      setBriefError("Failed to load morning brief. Please try again.");
    } finally {
      setLoadingBrief(false);
    }
  }, [timezone, tab]);

  useEffect(() => {
    if (status !== "authenticated" || !timezone) {
      return;
    }

    fetchEvents();
    fetchBrief();
  }, [status, timezone, fetchEvents, fetchBrief]);

  if (!hasMounted || status === "loading") {
    return <HomePageLoading />;
  }

  if (status === "unauthenticated") {
    return <SignInScreen />;
  }

  const isSessionLoading = false;

  return (
    <main className="min-h-screen bg-[#EEF2FF] px-4 pb-10 pt-6">
      <div className="mx-auto max-w-md">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Don&apos;t Forget
            </h1>
            {isSessionLoading && (
              <p className="mt-1 text-xs text-slate-400">Checking sign-in...</p>
            )}
          </div>
          <SettingsMenu />
        </header>

        <div className="mb-6 flex rounded-2xl bg-white p-1 shadow-sm">
          {(["today", "tomorrow"] as Tab[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition ${
                tab === value
                  ? "bg-[#5B8DEF] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {value === "today" ? "Today" : "Tomorrow"}
            </button>
          ))}
        </div>

        {isSessionLoading || loadingHero ? (
          <CardSkeleton className="mb-4 h-36" />
        ) : (
          <section className="mb-4 rounded-3xl bg-gradient-to-br from-[#DDE8FF] to-white p-6 shadow-sm">
            {heroError ? (
              <ErrorMessage message={heroError} />
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {heroLocationLabel ?? "Weather"}
                  </p>
                  <p className="mt-1 text-5xl font-semibold text-slate-900">
                    {heroWeather ? `${heroWeather.temperatureF}°` : "—"}
                  </p>
                  <p className="mt-1 text-base text-slate-600">
                    {heroWeather
                      ? capitalize(heroWeather.condition)
                      : "Weather unavailable"}
                  </p>
                </div>
                {heroWeather && (
                  <WeatherIcon
                    condition={heroWeather.condition}
                    className="text-5xl"
                  />
                )}
              </div>
            )}
          </section>
        )}

        {tab === "today" &&
          (isSessionLoading || loadingBrief ? (
            <CardSkeleton className="mb-6 h-28" />
          ) : (
            <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Morning Brief
              </h2>
              {briefError ? (
                <ErrorMessage message={briefError} />
              ) : (
                <p className="text-sm leading-relaxed text-slate-600">
                  {brief ?? "No brief available for today."}
                </p>
              )}
            </section>
          ))}

        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">
            {tab === "today" ? "Your Day" : "Tomorrow"}
          </h2>

          {isSessionLoading || loadingEvents ? (
            <div className="space-y-3">
              <CardSkeleton className="h-24" />
              <CardSkeleton className="h-24" />
              <CardSkeleton className="h-24" />
            </div>
          ) : eventsError ? (
            <ErrorMessage message={eventsError} />
          ) : events.length === 0 ? (
            <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
              <p className="text-sm text-slate-500">
                No events with locations scheduled for{" "}
                {tab === "today" ? "today" : "tomorrow"}.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <article
                  key={`${event.title}-${event.startTime}`}
                  className="rounded-3xl bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-[#5B8DEF]">
                        {formatEventTime(event.startTime, timezone)}
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-slate-900">
                        {event.title}
                      </h3>
                      <p className="mt-1 truncate text-sm text-slate-500">
                        {event.displayName ?? event.location}
                      </p>
                    </div>
                    {event.weather && (
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <WeatherIcon
                          condition={event.weather.condition}
                          className="text-2xl"
                        />
                        <span className="text-sm font-medium text-slate-700">
                          {event.weather.temperatureF}°
                        </span>
                        <span className="text-xs text-slate-400">
                          {capitalize(event.weather.condition)}
                        </span>
                      </div>
                    )}
                  </div>
                  {event.weather && event.weather.chanceOfRain > 30 && (
                    <span className="mt-3 inline-flex rounded-full bg-[#E8F0FF] px-3 py-1 text-xs font-medium text-[#3B6FD9]">
                      🌧 {event.weather.chanceOfRain}% chance of rain
                    </span>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
