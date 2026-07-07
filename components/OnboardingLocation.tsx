"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import OnboardingShell, {
  LocationPinIcon,
  ProgressBar,
  StepBadge,
} from "@/components/ui/OnboardingShell";
import { updateProfile } from "@/lib/profile-client";
import { getPreferences, savePreferences } from "@/lib/settings";

const QUICK_PICKS = [
  { label: "San Francisco", value: "San Francisco, CA" },
  { label: "Los Angeles", value: "Los Angeles, CA" },
  { label: "New York", value: "New York, NY" },
];

interface CityResult {
  label: string;
  name: string;
  state: string;
}

export default function OnboardingLocation() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [results, setResults] = useState<CityResult[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/cities/search?q=${encodeURIComponent(query.trim())}`
        );
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        setResults(data.cities ?? []);
      } catch {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  async function handleSave() {
    const city = selectedCity.trim();
    if (!city) {
      setError("Please select or enter a city.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updateProfile({ homeCity: city });
      savePreferences({
        ...getPreferences(),
        homeAddress: city,
      });
      router.push("/onboarding/time");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save location.");
      setSaving(false);
    }
  }

  function selectCity(city: string) {
    setSelectedCity(city);
    setQuery(city);
    setResults([]);
  }

  return (
    <OnboardingShell variant="location">
      <ProgressBar step={1} total={2} />
      <StepBadge icon="location" label="STEP ONE" />

      <h1 className="font-serif text-[34px] font-bold leading-[1.08] tracking-tight text-[#4A3F35]">
        Where do you start your day?
      </h1>
      <p className="mt-3 font-serif text-[16px] italic text-[#4A80F0]">
        Set your home base
      </p>
      <p className="mt-4 font-sans text-[14px] leading-relaxed text-[#6B5744]/80">
        I&apos;ll use this for your morning weather before any events kick in.
        You can update this any time in Settings.
      </p>

      <div className="mt-8 flex-1">
        <label className="font-sans text-[10px] font-bold tracking-[0.16em] text-[#B8956A]">
          YOUR CITY
        </label>
        <div className="relative mt-2.5">
          <LocationPinIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
          <input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedCity(event.target.value);
            }}
            placeholder="Search US cities..."
            className="w-full rounded-[18px] border border-[#6B5744]/10 bg-[#FBF9F5] py-4 pl-11 pr-4 font-sans text-[14px] text-[#4A3F35] shadow-[0_4px_18px_rgba(61,46,31,0.08)] outline-none placeholder:text-[#6B5744]/35 focus:ring-2 focus:ring-[#4A80F0]/25"
          />
          {results.length > 0 && (
            <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-[18px] bg-white shadow-[0_6px_24px_rgba(61,46,31,0.12)]">
              {results.map((city) => (
                <li key={city.label}>
                  <button
                    type="button"
                    onClick={() => selectCity(city.label)}
                    className="w-full px-4 py-3 text-left font-sans text-[14px] text-[#4A3F35] hover:bg-[#F5F2E8]"
                  >
                    {city.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2.5">
          {QUICK_PICKS.map((city) => (
            <button
              key={city.value}
              type="button"
              onClick={() => selectCity(city.value)}
              className={`rounded-full px-4 py-2 font-sans text-[13px] font-medium transition ${
                selectedCity === city.value
                  ? "bg-[#4A80F0] text-white shadow-[0_4px_14px_rgba(74,128,240,0.28)]"
                  : "bg-[#FBF9F5] text-[#4A3F35] shadow-[0_3px_12px_rgba(61,46,31,0.08)] hover:bg-white"
              }`}
            >
              {city.label}
            </button>
          ))}
        </div>

        {error && <p className="mt-4 font-sans text-[14px] text-red-600">{error}</p>}
      </div>

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={saving}
        className="mt-auto w-full rounded-[20px] bg-[#4A80F0] py-[18px] font-sans text-[16px] font-bold text-white shadow-[0_6px_28px_rgba(74,128,240,0.35)] transition hover:bg-[#3A70E0] disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save location"}
      </button>
    </OnboardingShell>
  );
}
