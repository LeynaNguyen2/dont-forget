"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Lock,
  LogOut,
  MapPin,
  MessageCircle,
  Plus,
  Star,
} from "lucide-react";
import {
  getNotificationPermission,
  registerPushNotifications,
} from "@/lib/push-client";
import { fetchProfile, updateProfile } from "@/lib/profile-client";
import {
  DEFAULT_PREFERENCES,
  getPreferences,
  savePreferences,
  type UserPreferences,
} from "@/lib/settings";

const NOTIFICATION_TIMES = ["06:00", "06:30", "07:00", "07:30", "08:00", "08:30"];
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

interface GoogleCalendarItem {
  id: string;
  name: string;
  backgroundColor: string;
  primary?: boolean;
}

interface CityResult {
  label: string;
  name: string;
  state: string;
}

function formatTimeLabel(value: string): string {
  const [hour, minute] = value.split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
}

function formatLocationDisplay(address: string): string {
  const trimmed = address.trim();
  if (!trimmed) {
    return "Not set";
  }

  const parts = trimmed
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]}, ${parts[1]}`;
  }

  return trimmed;
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="mb-2.5 flex items-center gap-3">
      <span className="shrink-0 font-sans text-[10px] font-bold tracking-[0.16em] text-brand-brown/40">
        {label}
      </span>
      <div className="h-px flex-1 bg-brand-brown/10" />
    </div>
  );
}

function SettingsCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[24px] bg-white p-4 shadow-card ${className}`}>
      {children}
    </div>
  );
}

function IconBox({
  children,
  className = "bg-[#E8EDF5]",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${className}`}
    >
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
        checked ? "bg-brand-blue" : "bg-brand-cream-dark"
      }`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function AboutRow({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 py-3.5 text-left transition hover:opacity-80"
    >
      <IconBox>{icon}</IconBox>
      <div className="min-w-0 flex-1">
        <p className="font-serif text-[15px] font-bold text-brand-brown">{title}</p>
        <p className="font-sans text-[12px] text-brand-brown/50">{subtitle}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-brand-brown/30" aria-hidden />
    </button>
  );
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(
    null
  );
  const [enablingNotifications, setEnablingNotifications] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState<CityResult[]>([]);
  const [calendars, setCalendars] = useState<GoogleCalendarItem[]>([]);
  const [loadingCalendars, setLoadingCalendars] = useState(true);
  const [calendarError, setCalendarError] = useState<string | null>(null);

  const userName = session?.user?.name ?? "User";
  const userEmail = session?.user?.email ?? "";
  const userInitial = useMemo(() => {
    const name = session?.user?.name ?? session?.user?.email ?? "U";
    return name.charAt(0).toUpperCase();
  }, [session]);

  const persistPreferences = useCallback(async (next: UserPreferences) => {
    savePreferences(next);
    try {
      await updateProfile({
        homeCity: next.homeAddress,
        notificationTime: next.notificationTime,
      });
      setSaveStatus("Saved");
      window.setTimeout(() => setSaveStatus(null), 2000);
    } catch {
      setSaveStatus("Saved locally");
      window.setTimeout(() => setSaveStatus(null), 2000);
    }
  }, []);

  const updatePreferences = useCallback(
    (updater: (current: UserPreferences) => UserPreferences) => {
      setPreferences((current) => {
        const next = updater(current);
        void persistPreferences(next);
        return next;
      });
    },
    [persistPreferences]
  );

  useEffect(() => {
    const initial = getPreferences();
    const permission = getNotificationPermission();
    setPreferences(initial);
    setNotificationPermission(permission);

    if (permission === "granted" && !initial.morningBriefingEnabled) {
      const next = { ...initial, morningBriefingEnabled: true };
      savePreferences(next);
      setPreferences(next);
    }

    void fetchProfile()
      .then((profile) => {
        setPreferences((current) => {
          const next = {
            ...current,
            homeAddress: profile.homeCity || current.homeAddress,
            notificationTime:
              profile.notificationTime || current.notificationTime,
          };
          savePreferences(next);
          return next;
        });
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    async function loadCalendars() {
      setLoadingCalendars(true);
      setCalendarError(null);

      try {
        const response = await fetch("/api/calendars", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to load calendars.");
        }

        const data = await response.json();
        const items = (data.calendars ?? []) as GoogleCalendarItem[];
        setCalendars(items);

        setPreferences((current) => {
          const enabledCalendars = { ...current.enabledCalendars };
          let changed = false;

          for (const calendar of items) {
            if (!(calendar.id in enabledCalendars)) {
              enabledCalendars[calendar.id] = !/holiday/i.test(calendar.name);
              changed = true;
            }
          }

          if (!changed) {
            return current;
          }

          const next = { ...current, enabledCalendars };
          savePreferences(next);
          return next;
        });
      } catch {
        setCalendarError("Could not load calendars.");
      } finally {
        setLoadingCalendars(false);
      }
    }

    void loadCalendars();
  }, []);

  useEffect(() => {
    if (locationQuery.trim().length < 2) {
      setLocationResults([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/cities/search?q=${encodeURIComponent(locationQuery.trim())}`
        );
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        setLocationResults(data.cities ?? []);
      } catch {
        setLocationResults([]);
      }
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [locationQuery]);

  async function handleMorningBriefingToggle(enabled: boolean) {
    if (!enabled) {
      updatePreferences((current) => ({
        ...current,
        morningBriefingEnabled: false,
      }));
      setNotificationStatus(null);
      return;
    }

    setEnablingNotifications(true);
    setNotificationStatus(null);

    const result = await registerPushNotifications();
    setNotificationPermission(result.permission ?? getNotificationPermission());

    if (result.success) {
      updatePreferences((current) => ({
        ...current,
        morningBriefingEnabled: true,
      }));
      setNotificationStatus(null);
    } else {
      setNotificationStatus(result.error);
    }

    setEnablingNotifications(false);
  }

  function handleSelectLocation(city: string) {
    updatePreferences((current) => ({
      ...current,
      homeAddress: city,
    }));
    setEditingLocation(false);
    setLocationQuery("");
    setLocationResults([]);
  }

  const morningBriefingOn =
    preferences.morningBriefingEnabled &&
    notificationPermission === "granted";

  return (
    <main className="relative min-h-screen bg-brand-cream pb-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-brand-lavender/50 to-transparent" />

      <div className="relative mx-auto max-w-md px-4 pt-6">
        <header className="relative mb-7 flex items-center justify-between">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white text-brand-blue shadow-card transition hover:bg-brand-cream-dark"
            aria-label="Back to home"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
          </Link>
          <h1 className="pointer-events-none absolute left-1/2 -translate-x-1/2 font-serif text-[28px] font-bold italic text-brand-brown">
            Settings
          </h1>
          <Star
            className="h-4 w-4 fill-[#C9A84C] text-[#C9A84C]"
            aria-hidden
          />
        </header>

        <div className="space-y-5">
          <section>
            <SectionHeader label="ACCOUNT" />
            <SettingsCard>
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-brand-blue font-serif text-xl font-bold text-white">
                  {userInitial}
                </div>
                <div className="min-w-0">
                  <p className="font-serif text-[17px] font-bold text-brand-brown">
                    {userName}
                  </p>
                  <p className="truncate font-sans text-[13px] text-brand-brown/50">
                    {userEmail}
                  </p>
                  <p className="mt-1.5 font-sans text-[12px] font-medium text-emerald-600">
                    ● Google Calendar connected
                  </p>
                </div>
              </div>
            </SettingsCard>
          </section>

          <section>
            <SectionHeader label="NOTIFICATIONS" />
            <SettingsCard>
              <div className="flex items-center gap-3">
                <IconBox>
                  <Bell className="h-[18px] w-[18px] text-[#E8897A]" aria-hidden />
                </IconBox>
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-[15px] font-bold text-brand-brown">
                    Morning briefing
                  </p>
                  <p className="font-sans text-[12px] text-brand-brown/50">
                    Daily at {formatTimeLabel(preferences.notificationTime)}
                  </p>
                </div>
                <Toggle
                  checked={morningBriefingOn}
                  onChange={(value) => void handleMorningBriefingToggle(value)}
                  label="Morning briefing notifications"
                />
              </div>

              {notificationStatus && (
                <p className="mt-3 font-sans text-[12px] text-red-600">
                  {notificationStatus}
                </p>
              )}
              {enablingNotifications && (
                <p className="mt-3 font-sans text-[12px] text-brand-blue">
                  Enabling notifications...
                </p>
              )}

              <div className="my-4 h-px bg-brand-brown/8" />

              <p className="font-sans text-[10px] font-bold tracking-[0.16em] text-brand-brown/40">
                NOTIFY ME AT
              </p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {NOTIFICATION_TIMES.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() =>
                      updatePreferences((current) => ({
                        ...current,
                        notificationTime: time,
                      }))
                    }
                    className={`rounded-[14px] py-3 font-sans text-[12px] font-semibold transition ${
                      preferences.notificationTime === time
                        ? "bg-brand-blue text-white shadow-[0_4px_14px_rgba(59,111,232,0.28)]"
                        : "bg-brand-cream text-brand-brown shadow-[0_2px_8px_rgba(61,46,31,0.06)]"
                    }`}
                  >
                    {formatTimeLabel(time)}
                  </button>
                ))}
              </div>

              <p className="mt-5 font-sans text-[10px] font-bold tracking-[0.16em] text-brand-brown/40">
                ACTIVE DAYS
              </p>
              <div className="mt-3 flex gap-2">
                {DAY_LABELS.map((label, index) => {
                  const active = preferences.activeDays[index];
                  return (
                    <button
                      key={`${label}-${index}`}
                      type="button"
                      onClick={() =>
                        updatePreferences((current) => {
                          const activeDays = [...current.activeDays];
                          activeDays[index] = !activeDays[index];
                          return { ...current, activeDays };
                        })
                      }
                      className={`flex h-10 flex-1 items-center justify-center rounded-[12px] font-sans text-[12px] font-bold transition ${
                        active
                          ? "bg-brand-blue text-white"
                          : "bg-brand-cream text-brand-brown/60"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </SettingsCard>
          </section>

          <section>
            <SectionHeader label="LOCATION" />
            <SettingsCard>
              <div className="flex items-start gap-3">
                <IconBox>
                  <MapPin
                    className="h-[18px] w-[18px] text-[#E8897A]"
                    aria-hidden
                  />
                </IconBox>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-sans text-[15px] font-bold text-brand-brown">
                      Home location
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingLocation((value) => !value);
                        setLocationQuery(preferences.homeAddress);
                      }}
                      className="font-sans text-[13px] font-semibold text-brand-blue"
                    >
                      {editingLocation ? "Done" : "Edit"}
                    </button>
                  </div>
                  <p className="mt-0.5 font-sans text-[13px] text-brand-brown/50">
                    {formatLocationDisplay(preferences.homeAddress)}
                  </p>
                </div>
              </div>

              {editingLocation && (
                <div className="mt-4 border-t border-brand-brown/8 pt-4">
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(event) => setLocationQuery(event.target.value)}
                    placeholder="Search for a city"
                    className="w-full rounded-[14px] border border-brand-cream-dark bg-brand-cream/50 px-4 py-3 font-sans text-sm text-brand-brown outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                  />
                  {locationResults.length > 0 && (
                    <ul className="mt-2 overflow-hidden rounded-[14px] border border-brand-cream-dark bg-white">
                      {locationResults.map((city) => (
                        <li key={city.label}>
                          <button
                            type="button"
                            onClick={() => handleSelectLocation(city.label)}
                            className="w-full px-4 py-3 text-left font-sans text-sm text-brand-brown transition hover:bg-brand-cream/60"
                          >
                            {city.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </SettingsCard>
          </section>

          <section>
            <SectionHeader label="CALENDARS" />
            <SettingsCard className="px-0 py-0">
              {loadingCalendars ? (
                <p className="px-4 py-5 font-sans text-[13px] text-brand-brown/50">
                  Loading calendars...
                </p>
              ) : calendarError ? (
                <p className="px-4 py-5 font-sans text-[13px] text-red-600">
                  {calendarError}
                </p>
              ) : calendars.length === 0 ? (
                <p className="px-4 py-5 font-sans text-[13px] text-brand-brown/50">
                  No calendars found.
                </p>
              ) : (
                <ul>
                  {calendars.map((calendar, index) => {
                    const enabled =
                      preferences.enabledCalendars[calendar.id] !== false;
                    return (
                      <li key={calendar.id}>
                        {index > 0 && (
                          <div className="mx-4 h-px bg-brand-brown/8" />
                        )}
                        <div className="flex items-center gap-3 px-4 py-3.5">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: calendar.backgroundColor }}
                            aria-hidden
                          />
                          <p className="min-w-0 flex-1 truncate font-sans text-[14px] font-medium text-brand-brown">
                            {calendar.name}
                          </p>
                          <Toggle
                            checked={enabled}
                            onChange={(value) =>
                              updatePreferences((current) => ({
                                ...current,
                                enabledCalendars: {
                                  ...current.enabledCalendars,
                                  [calendar.id]: value,
                                },
                              }))
                            }
                            label={`Toggle ${calendar.name}`}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="mx-4 h-px bg-brand-brown/8" />
              <button
                type="button"
                onClick={() =>
                  window.open(
                    "https://calendar.google.com/calendar/u/0/r/settings/createcalendar",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
                className="flex w-full items-center gap-2 px-4 py-4 font-sans text-[13px] font-semibold text-brand-blue transition hover:opacity-80"
              >
                <Plus className="h-4 w-4 text-emerald-500" aria-hidden />
                Add another calendar
              </button>
            </SettingsCard>
          </section>

          <section>
            <SectionHeader label="ABOUT" />
            <SettingsCard className="px-4 py-0">
              <AboutRow
                icon={<Lock className="h-[18px] w-[18px] text-brand-blue" />}
                title="Privacy Policy"
                subtitle="How we handle your data"
                onClick={() =>
                  window.open(
                    "https://github.com/LeynaNguyen2/dont-forget",
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
              />
              <div className="h-px bg-brand-brown/8" />
              <AboutRow
                icon={
                  <MessageCircle className="h-[18px] w-[18px] text-brand-blue" />
                }
                title="Send Feedback"
                subtitle="Help us get better"
                onClick={() => {
                  window.location.href =
                    "mailto:leynanguyen2@gmail.com?subject=Don't%20Forget%20Feedback";
                }}
              />
              <div className="h-px bg-brand-brown/8" />
              <div className="flex items-center justify-between py-3.5">
                <span className="font-sans text-[13px] text-brand-brown/50">
                  Version
                </span>
                <span className="font-sans text-[13px] text-brand-brown/50">
                  1.0.0
                </span>
              </div>
            </SettingsCard>
          </section>

          <SettingsCard className="px-4 py-3.5">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="flex w-full items-center gap-3 text-left transition hover:opacity-80"
            >
              <IconBox className="bg-red-50">
                <LogOut className="h-[18px] w-[18px] text-red-500" aria-hidden />
              </IconBox>
              <span className="font-serif text-[16px] font-bold text-red-500">
                Sign Out
              </span>
            </button>
          </SettingsCard>

          {saveStatus && (
            <p className="text-center font-sans text-[12px] text-brand-blue">
              {saveStatus}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
