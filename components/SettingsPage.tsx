"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
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
      <span className="text-sm text-brand-brown/80">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
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
    </label>
  );
}

export default function SettingsPage() {
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [saved, setSaved] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(
    null
  );
  const [enablingNotifications, setEnablingNotifications] = useState(false);

  useEffect(() => {
    setPreferences(getPreferences());
    setNotificationPermission(getNotificationPermission());

    void fetchProfile()
      .then((profile) => {
        setPreferences((current) => ({
          ...current,
          homeAddress: profile.homeCity || current.homeAddress,
          notificationTime: profile.notificationTime || current.notificationTime,
        }));
      })
      .catch(() => undefined);
  }, []);

  function updatePreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) {
    setPreferences((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    savePreferences(preferences);
    try {
      await updateProfile({
        homeCity: preferences.homeAddress,
        notificationTime: preferences.notificationTime,
      });
      setSaved(true);
    } catch {
      setSaved(true);
    }
  }

  async function handleEnableNotifications() {
    setEnablingNotifications(true);
    setNotificationStatus(null);

    const result = await registerPushNotifications();
    setNotificationPermission(result.permission ?? getNotificationPermission());

    if (result.success) {
      setNotificationStatus("Notifications enabled. You'll receive your morning brief.");
    } else {
      setNotificationStatus(result.error);
    }

    setEnablingNotifications(false);
  }

  return (
    <main className="min-h-screen bg-brand-cream px-4 pb-10 pt-6">
      <div className="mx-auto max-w-md">
        <header className="mb-6 flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-brand-brown/60 shadow-card transition hover:bg-brand-cream-dark"
            aria-label="Back to home"
          >
            ←
          </Link>
          <h1 className="font-serif text-2xl font-bold text-brand-brown">
            Settings
          </h1>
        </header>

        <section className="mb-4 rounded-3xl bg-white p-5 shadow-card">
          <label
            htmlFor="home-address"
            className="block text-sm font-semibold text-brand-brown"
          >
            Home city
          </label>
          <p className="mt-1 text-xs text-brand-brown/50">
            Used for your morning weather before events kick in.
          </p>
          <input
            id="home-address"
            type="text"
            value={preferences.homeAddress}
            onChange={(event) =>
              updatePreference("homeAddress", event.target.value)
            }
            placeholder="e.g. San Francisco, CA"
            className="mt-3 w-full rounded-2xl border border-brand-cream-dark bg-brand-cream/50 px-4 py-3 text-sm text-brand-brown outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
          />
        </section>

        <section className="mb-4 rounded-3xl bg-white p-5 shadow-card">
          <h2 className="mb-4 text-sm font-semibold text-brand-brown">
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

        <section className="mb-4 rounded-3xl bg-white p-5 shadow-card">
          <h2 className="text-sm font-semibold text-brand-brown">
            Notifications
          </h2>
          <p className="mt-1 text-xs text-brand-brown/50">
            Get your AI morning brief delivered as a push notification.
          </p>
          {notificationPermission === "granted" ? (
            <p className="mt-3 text-sm text-brand-blue">
              Notifications are enabled.
            </p>
          ) : (
            <button
              type="button"
              onClick={() => void handleEnableNotifications()}
              disabled={enablingNotifications}
              className="mt-3 w-full rounded-full bg-brand-blue px-4 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-brand-blue-dark disabled:opacity-70"
            >
              {enablingNotifications ? "Enabling..." : "Enable Notifications"}
            </button>
          )}
          {notificationStatus && (
            <p
              className={`mt-3 text-sm ${
                notificationPermission === "granted"
                  ? "text-brand-blue"
                  : "text-red-600"
              }`}
            >
              {notificationStatus}
            </p>
          )}
        </section>

        <section className="mb-6 rounded-3xl bg-white p-5 shadow-card">
          <label
            htmlFor="notification-time"
            className="block text-sm font-semibold text-brand-brown"
          >
            Morning notification time
          </label>
          <p className="mt-1 text-xs text-brand-brown/50">
            When you&apos;d like your daily brief reminder.
          </p>
          <input
            id="notification-time"
            type="time"
            value={preferences.notificationTime}
            onChange={(event) =>
              updatePreference("notificationTime", event.target.value)
            }
            className="mt-3 w-full rounded-2xl border border-brand-cream-dark bg-brand-cream/50 px-4 py-3 text-sm text-brand-brown outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
          />
        </section>

        <button
          type="button"
          onClick={() => void handleSave()}
          className="w-full rounded-full bg-brand-blue px-4 py-3.5 text-sm font-semibold text-white shadow-card transition hover:bg-brand-blue-dark"
        >
          Save
        </button>

        {saved && (
          <p className="mt-3 text-center text-sm text-brand-blue">
            Preferences saved.
          </p>
        )}

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/signin" })}
          className="mt-6 w-full rounded-full px-4 py-3 text-sm text-brand-brown/60 transition hover:bg-white/60"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}
