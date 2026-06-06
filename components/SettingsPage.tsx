"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import {
  DEFAULT_PREFERENCES,
  getPreferences,
  savePreferences,
  type UserPreferences,
} from "@/lib/settings";

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
    <label className="flex cursor-pointer items-center justify-between gap-4">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked ? "bg-[#5B8DEF]" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </label>
  );
}

export default function SettingsPage() {
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPreferences(getPreferences());
  }, []);

  function updatePreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) {
    setPreferences((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    savePreferences(preferences);
    setSaved(true);
  }

  return (
    <main className="min-h-screen bg-[#EEF2FF] px-4 pb-10 pt-6">
      <div className="mx-auto max-w-md">
        <header className="mb-6 flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-white/60"
            aria-label="Back to home"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 18l-6-6 6-6"
              />
            </svg>
          </Link>
          <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        </header>

        <section className="mb-4 rounded-3xl bg-white p-5 shadow-sm">
          <label
            htmlFor="home-address"
            className="block text-sm font-semibold text-slate-900"
          >
            Home address
          </label>
          <p className="mt-1 text-xs text-slate-500">
            Used for weather when you have no events with locations.
          </p>
          <input
            id="home-address"
            type="text"
            value={preferences.homeAddress}
            onChange={(event) =>
              updatePreference("homeAddress", event.target.value)
            }
            placeholder="e.g. Hayward, CA"
            className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#5B8DEF]"
          />
        </section>

        <section className="mb-4 rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">
            Preferences
          </h2>
          <div className="space-y-4">
            <Toggle
              label="I always carry water"
              checked={preferences.carryWater}
              onChange={(value) => updatePreference("carryWater", value)}
            />
            <Toggle
              label="I always carry an umbrella"
              checked={preferences.carryUmbrella}
              onChange={(value) => updatePreference("carryUmbrella", value)}
            />
          </div>
        </section>

        <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm">
          <label
            htmlFor="notification-time"
            className="block text-sm font-semibold text-slate-900"
          >
            Morning notification time
          </label>
          <p className="mt-1 text-xs text-slate-500">
            When you&apos;d like your daily brief reminder.
          </p>
          <input
            id="notification-time"
            type="time"
            value={preferences.notificationTime}
            onChange={(event) =>
              updatePreference("notificationTime", event.target.value)
            }
            className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#5B8DEF]"
          />
        </section>

        <button
          type="button"
          onClick={handleSave}
          className="w-full rounded-2xl bg-[#5B8DEF] px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[#4A7DE0]"
        >
          Save
        </button>

        {saved && (
          <p className="mt-3 text-center text-sm text-[#3B6FD9]">
            Preferences saved.
          </p>
        )}

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-6 w-full rounded-2xl px-4 py-3 text-sm text-slate-600 transition hover:bg-white/60"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}
