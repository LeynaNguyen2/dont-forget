"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import OnboardingShell, {
  ProgressBar,
  StepBadge,
} from "@/components/ui/OnboardingShell";
import { updateProfile } from "@/lib/profile-client";
import { savePreferences, getPreferences } from "@/lib/settings";

const QUICK_PICKS = [
  "San Francisco, CA",
  "Los Angeles, CA",
  "New York, NY",
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
    <OnboardingShell>
      <ProgressBar step={1} total={2} />
      <StepBadge icon="📍" label="STEP ONE" />

      <h1 className="font-serif text-4xl font-bold leading-tight text-brand-brown">
        Where do you start your day?
      </h1>
      <p className="mt-2 text-base italic text-brand-blue">
        Set your home base
      </p>
      <p className="mt-4 text-sm leading-relaxed text-brand-brown/70">
        I&apos;ll use this for your morning weather before any events kick in.
        You can update this any time in Settings.
      </p>

      <div className="mt-8 flex-1">
        <label className="text-[10px] font-bold tracking-[0.15em] text-brand-gold">
          YOUR CITY
        </label>
        <div className="relative mt-2">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-brown/40">
            📍
          </span>
          <input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedCity(event.target.value);
            }}
            placeholder="Search US cities..."
            className="w-full rounded-2xl border-0 bg-white py-4 pl-11 pr-4 text-sm text-brand-brown shadow-card outline-none placeholder:text-brand-brown/35 focus:ring-2 focus:ring-brand-blue/30"
          />
          {results.length > 0 && (
            <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-2xl bg-white shadow-card">
              {results.map((city) => (
                <li key={city.label}>
                  <button
                    type="button"
                    onClick={() => selectCity(city.label)}
                    className="w-full px-4 py-3 text-left text-sm text-brand-brown hover:bg-brand-cream"
                  >
                    {city.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {QUICK_PICKS.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => selectCity(city)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                selectedCity === city
                  ? "bg-brand-blue text-white shadow-sm"
                  : "bg-white text-brand-brown shadow-sm hover:bg-brand-cream-dark"
              }`}
            >
              {city.split(",")[0]}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={saving}
        className="mt-6 w-full rounded-full bg-brand-blue py-4 text-base font-semibold text-white shadow-card transition hover:bg-brand-blue-dark disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save location"}
      </button>
    </OnboardingShell>
  );
}
