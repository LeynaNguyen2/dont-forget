import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";

function DecorativeBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <span className="absolute left-6 top-24 text-lg opacity-60">⏰</span>
      <span className="absolute left-10 top-44 text-sm opacity-70">✦</span>
      <span className="absolute right-8 top-20 text-xl opacity-80">☀️</span>
      <span className="absolute right-14 top-52 text-sm opacity-60">✦</span>
      <span className="absolute left-8 top-[55%] text-lg opacity-50">☕</span>
      <span className="absolute right-10 top-[48%] text-lg opacity-50">☂️</span>
      <span className="absolute left-16 top-[70%] text-sm opacity-50">✦</span>
      <span className="absolute right-20 top-[72%] text-sm opacity-50">✦</span>
    </div>
  );
}

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
  weatherIcon: string;
  weatherPillClass: string;
  temp: string;
  time: string;
  title: string;
  location: string;
  footerIcon: string;
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
        <span>{weatherIcon}</span>
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
        <span>{footerIcon}</span>
        <span>{footerText}</span>
      </div>
    </div>
  );
}

function GoogleSignInLink() {
  return (
    <a
      href="/api/auth/signin/google?callbackUrl=%2F"
      className="flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-4 text-sm font-semibold text-brand-brown shadow-card transition hover:bg-brand-cream-dark"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      Continue with Google
    </a>
  );
}

export default async function SignIn() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-brand-cream">
      <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-b from-transparent via-brand-lavender/25 to-brand-blue-light/50" />
      <DecorativeBackground />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-6 pb-6 pt-16">
        <div className="flex flex-1 flex-col items-center text-center">
          <h1 className="font-serif text-5xl font-bold leading-tight text-brand-brown">
            Don&apos;t{" "}
            <span className="inline-block rounded-2xl bg-brand-blue px-4 py-1 text-white">
              Forget
            </span>
          </h1>

          <p className="mt-5 rounded-lg border border-dashed border-brand-brown/20 bg-white/50 px-4 py-2 font-serif text-sm italic text-brand-brown/80">
            Your day, already figured out.
          </p>

          <div className="mt-10 w-full">
            <GoogleSignInLink />
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
              weatherIcon="☀️"
              weatherPillClass="bg-amber-50 text-brand-brown"
              temp="72°"
              time="1:00 PM"
              title="Lunch with Maya"
              location="Tartine Manufactory"
              footerIcon="🚗"
              footerText="18 min drive"
              footerClass="bg-amber-50/80 text-brand-brown/70"
            />
            <PreviewCard
              tilt="rotate-2"
              weatherIcon="🌧"
              weatherPillClass="bg-sky-50 text-brand-brown"
              temp="57°"
              time="7:00 PM"
              title="Dinner at Nopa"
              location="560 Divisadero St"
              footerIcon="☂️"
              footerText="Pack umbrella"
              footerClass="border border-brand-blue/20 bg-white text-brand-blue"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
