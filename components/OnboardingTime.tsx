"use client";

import { AlarmClock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import OnboardingShell, {
  ProgressBar,
  StepBadge,
} from "@/components/ui/OnboardingShell";
import { updateProfile } from "@/lib/profile-client";
import { getPreferences, savePreferences } from "@/lib/settings";

const TIMES = [
  "06:00",
  "06:30",
  "07:00",
  "07:30",
  "08:00",
  "08:30",
];

const MORE_TIMES = [
  "05:00",
  "05:30",
  "09:00",
  "09:30",
  "10:00",
];

const TIMEZONES = [
  { label: "PT", value: "America/Los_Angeles" },
  { label: "MT", value: "America/Denver" },
  { label: "CT", value: "America/Chicago" },
  { label: "ET", value: "America/New_York" },
];

function formatTimeLabel(value: string): string {
  const [hour, minute] = value.split(":").map(Number);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
}

export default function OnboardingTime() {
  const router = useRouter();
  const [selectedTime, setSelectedTime] = useState("07:00");
  const [selectedTimezone, setSelectedTimezone] = useState(
    "America/Los_Angeles"
  );
  const [showMore, setShowMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleComplete() {
    setSaving(true);
    setError(null);

    try {
      await updateProfile({
        notificationTime: selectedTime,
        timezone: selectedTimezone,
        onboardingCompleted: true,
      });
      savePreferences({
        ...getPreferences(),
        notificationTime: selectedTime,
      });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings.");
      setSaving(false);
    }
  }

  const timeOptions = showMore ? [...TIMES, ...MORE_TIMES] : TIMES;

  return (
    <OnboardingShell>
      <ProgressBar step={2} total={2} />
      <StepBadge
        icon={
          <AlarmClock
            className="h-3.5 w-3.5 text-brand-blue"
            strokeWidth={2}
          />
        }
        label="STEP TWO"
      />

      <h1 className="font-serif text-4xl font-bold leading-tight text-brand-brown">
        When should we check in?
      </h1>
      <p className="mt-2 text-base italic text-brand-blue">
        Pick a time that works for you.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-brand-brown/70">
        We&apos;ll send a gentle nudge each morning so your briefing is warm
        and ready. Most people set it 20–30 min before they leave.
      </p>

      <div className="mt-8 flex-1">
        <p className="text-[10px] font-bold tracking-[0.15em] text-brand-gold">
          CHECK IN WITH ME AT
        </p>

        <div className="mt-3 grid grid-cols-3 gap-2.5">
          {timeOptions.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => setSelectedTime(time)}
              className={`rounded-2xl py-3 text-sm font-semibold transition ${
                selectedTime === time
                  ? "bg-brand-blue text-white shadow-sm"
                  : "bg-white text-brand-brown shadow-sm hover:bg-brand-cream-dark"
              }`}
            >
              {formatTimeLabel(time)}
            </button>
          ))}
        </div>

        {!showMore && (
          <button
            type="button"
            onClick={() => setShowMore(true)}
            className="mt-3 w-full rounded-full border border-dashed border-brand-brown/25 py-2.5 text-sm font-medium text-brand-brown/60"
          >
            More
          </button>
        )}

        <p className="mt-8 text-[10px] font-bold tracking-[0.15em] text-brand-gold">
          TIME ZONE
        </p>
        <div className="mt-3 flex gap-2">
          {TIMEZONES.map((tz) => (
            <button
              key={tz.value}
              type="button"
              onClick={() => setSelectedTimezone(tz.value)}
              className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition ${
                selectedTimezone === tz.value
                  ? "bg-brand-blue text-white shadow-sm"
                  : "bg-white text-brand-brown shadow-sm"
              }`}
            >
              {tz.label}
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs italic text-brand-brown/50">
          You can always change it later in Settings.
        </p>

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => void handleComplete()}
        disabled={saving}
        className="mt-6 w-full rounded-full bg-brand-blue py-4 text-base font-semibold text-white shadow-card transition hover:bg-brand-blue-dark disabled:opacity-60"
      >
        {saving ? "Saving..." : "You're all set →"}
      </button>

      <Link
        href="/onboarding/location"
        className="mt-4 block text-center text-sm text-brand-brown/60"
      >
        ← Back
      </Link>
    </OnboardingShell>
  );
}
