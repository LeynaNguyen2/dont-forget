"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import OnboardingShell, {
  ProgressBar,
  StepBadge,
} from "@/components/ui/OnboardingShell";
import { updateProfile } from "@/lib/profile-client";
import { getPreferences, savePreferences } from "@/lib/settings";

const TIMES = ["06:00", "06:30", "07:00", "07:30", "08:00", "08:30"];

const MORE_TIMES = ["05:00", "05:30", "09:00", "09:30", "10:00"];

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

function detectTimezone(): string {
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const match = TIMEZONES.find((tz) => tz.value === detected);
  return match?.value ?? "America/Los_Angeles";
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

  useEffect(() => {
    setSelectedTimezone(detectTimezone());
  }, []);

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
    <OnboardingShell variant="time">
      <ProgressBar step={2} total={2} />
      <StepBadge icon="clock" label="STEP TWO" />

      <h1 className="font-serif text-[34px] font-bold leading-[1.08] tracking-tight text-[#4A3F35]">
        When should we check in?
      </h1>
      <p className="mt-3 font-serif text-[16px] italic text-[#4A80F0]">
        Pick a time that works for you.
      </p>
      <p className="mt-4 font-sans text-[14px] leading-relaxed text-[#6B5744]/80">
        We&apos;ll send a gentle nudge each morning so your briefing is warm
        and ready. Most people set it 20–30 min before they leave.
      </p>

      <div className="mt-8 flex-1">
        <p className="font-sans text-[10px] font-bold tracking-[0.16em] text-[#B8956A]">
          CHECK IN WITH ME AT
        </p>

        <div className="mt-3 grid grid-cols-3 gap-2.5">
          {timeOptions.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => setSelectedTime(time)}
              className={`rounded-[16px] py-3.5 font-sans text-[13px] font-semibold transition ${
                selectedTime === time
                  ? "bg-[#4A80F0] text-white shadow-[0_4px_14px_rgba(74,128,240,0.28)]"
                  : "bg-[#FBF9F5] text-[#4A3F35] shadow-[0_3px_12px_rgba(61,46,31,0.08)] hover:bg-white"
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
            className="mt-3 rounded-full border border-dashed border-[#6B5744]/25 px-5 py-2.5 font-sans text-[13px] font-medium text-[#6B5744]/60"
          >
            More
          </button>
        )}

        <p className="mt-8 font-sans text-[10px] font-bold tracking-[0.16em] text-[#B8956A]">
          TIME ZONE
        </p>
        <div className="mt-3 flex gap-2">
          {TIMEZONES.map((tz) => (
            <button
              key={tz.value}
              type="button"
              onClick={() => setSelectedTimezone(tz.value)}
              className={`flex-1 rounded-full py-2.5 font-sans text-[13px] font-semibold transition ${
                selectedTimezone === tz.value
                  ? "bg-[#4A80F0] text-white shadow-[0_4px_14px_rgba(74,128,240,0.28)]"
                  : "bg-[#FBF9F5] text-[#4A3F35] shadow-[0_3px_12px_rgba(61,46,31,0.08)]"
              }`}
            >
              {tz.label}
            </button>
          ))}
        </div>

        {error && <p className="mt-4 font-sans text-[14px] text-red-600">{error}</p>}
      </div>

      <div className="relative mt-auto">
        <button
          type="button"
          onClick={() => void handleComplete()}
          disabled={saving}
          className="w-full rounded-[20px] bg-[#4A80F0] py-[18px] font-sans text-[16px] font-bold text-white shadow-[0_6px_28px_rgba(74,128,240,0.35)] transition hover:bg-[#3A70E0] disabled:opacity-60"
        >
          {saving ? "Saving..." : "You're all set →"}
        </button>
        <svg
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <path
            fill="#C9A84C"
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          />
        </svg>
      </div>

      <Link
        href="/onboarding/location"
        className="mt-4 block text-center font-sans text-[14px] text-[#B8956A]"
      >
        ← Back
      </Link>
    </OnboardingShell>
  );
}
