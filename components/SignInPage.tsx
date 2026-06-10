import { Car, CloudRain, Sun, Umbrella } from "lucide-react";
import type { ReactNode } from "react";

import SignInButton from "@/components/SignInButton";
import DecorativeBackground from "@/components/ui/DecorativeBackground";

function PreviewCard({
  tilt,
  weatherIcon,
  weatherPillClass,
  temp,
  time,
  title,
  location,
  footerIcon,
  footerText,
  footerClass,
}: {
  tilt: string;
  weatherIcon: ReactNode;
  weatherPillClass: string;
  temp: string;
  time: string;
  title: string;
  location: string;
  footerIcon: ReactNode;
  footerText: string;
  footerClass: string;
}) {
  return (
    <div
      className={`w-44 shrink-0 rounded-3xl bg-white p-4 shadow-card ${tilt}`}
    >
      <div
        className={`mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${weatherPillClass}`}
      >
        {weatherIcon}
        <span>{temp}</span>
        <span className="text-brand-brown/40">·</span>
        <span>{time}</span>
      </div>
      <h3 className="font-serif text-base font-bold text-brand-brown">
        {title}
      </h3>
      <p className="mt-1 text-xs text-brand-brown/60">{location}</p>
      <div
        className={`mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium ${footerClass}`}
      >
        {footerIcon}
        <span>{footerText}</span>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-brand-cream">
      <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-b from-transparent via-brand-lavender/25 to-brand-blue-light/50" />
      <DecorativeBackground />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 pb-6 pt-16">
        <div className="flex flex-1 flex-col items-center text-center">
          <h1 className="font-serif text-5xl font-bold leading-tight">
            <span className="inline-flex flex-row flex-wrap items-center justify-center gap-x-2">
              <span className="text-brand-brown">Don&apos;t</span>
              <span className="inline-block rounded-2xl bg-brand-blue px-4 py-1 text-white">
                Forget
              </span>
            </span>
          </h1>

          <p className="mt-5 rounded-lg border border-dashed border-brand-brown/20 bg-white/50 px-4 py-2 font-serif text-sm italic text-brand-brown/80">
            Your day, already figured out.
          </p>

          <div className="mt-10 w-full">
            <SignInButton />
          </div>

          <p className="mt-5 max-w-xs font-serif text-xs italic leading-relaxed text-brand-brown/70">
            We read your calendar to personalize your morning. We never edit or
            share it.
          </p>

          <div className="mt-4 rounded-full bg-brand-blue/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.2em] text-brand-blue">
            PRIVATE · SECURE · YOURS
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-3 text-center font-serif text-sm italic text-brand-brown/60">
            a peek at your mornings
          </p>
          <div className="flex justify-center gap-3 overflow-hidden px-2">
            <PreviewCard
              tilt="-rotate-3"
              weatherIcon={
                <Sun className="h-3 w-3 text-amber-500" strokeWidth={2} />
              }
              weatherPillClass="bg-amber-50 text-brand-brown"
              temp="72°"
              time="1:00 PM"
              title="Lunch with Maya"
              location="Tartine Manufactory"
              footerIcon={
                <Car className="h-3 w-3 text-brand-brown/60" strokeWidth={2} />
              }
              footerText="18 min drive"
              footerClass="bg-amber-50/80 text-brand-brown/70"
            />
            <PreviewCard
              tilt="rotate-2"
              weatherIcon={
                <CloudRain
                  className="h-3 w-3 text-sky-500"
                  strokeWidth={2}
                />
              }
              weatherPillClass="bg-sky-50 text-brand-brown"
              temp="57°"
              time="7:00 PM"
              title="Dinner at Nopa"
              location="560 Divisadero St"
              footerIcon={
                <Umbrella
                  className="h-3 w-3 text-brand-blue"
                  strokeWidth={2}
                />
              }
              footerText="Pack umbrella"
              footerClass="border border-brand-blue/20 bg-white text-brand-blue"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
