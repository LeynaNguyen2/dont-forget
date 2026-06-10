import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";

function DecorativeBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {/* top left — alarm clock + star */}
      <svg
        className="absolute left-5 top-[72px] h-9 w-9 -rotate-12 opacity-90"
        viewBox="0 0 36 36"
        fill="none"
      >
        <circle cx="18" cy="20" r="11" fill="#F4A89A" stroke="#E8897A" strokeWidth="1.5" />
        <path d="M12 10 L10 6 M24 10 L26 6" stroke="#E8897A" strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="20" x2="18" y2="15" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="18" y1="20" x2="22" y2="22" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="absolute left-[52px] top-[108px] text-[11px] text-[#C9A84C]">✦</span>

      {/* top right — sun */}
      <svg
        className="absolute right-6 top-[68px] h-10 w-10 rotate-6 opacity-90"
        viewBox="0 0 40 40"
        fill="none"
      >
        <circle cx="20" cy="20" r="8" fill="#F5D76E" stroke="#E8C84A" strokeWidth="1" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1={20 + 11 * Math.cos((deg * Math.PI) / 180)}
            y1={20 + 11 * Math.sin((deg * Math.PI) / 180)}
            x2={20 + 15 * Math.cos((deg * Math.PI) / 180)}
            y2={20 + 15 * Math.sin((deg * Math.PI) / 180)}
            stroke="#E8C84A"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* middle left — star */}
      <span className="absolute left-7 top-[38%] text-xs text-[#C9A84C] opacity-80">✦</span>

      {/* middle right — two stars */}
      <span className="absolute right-10 top-[36%] text-[10px] text-[#C9A84C] opacity-75">✦</span>
      <span className="absolute right-6 top-[40%] text-[13px] text-[#C9A84C] opacity-80">✦</span>

      {/* lower left — coffee mug */}
      <svg
        className="absolute left-6 top-[58%] h-8 w-8 -rotate-6 opacity-80"
        viewBox="0 0 32 32"
        fill="none"
      >
        <path
          d="M6 14 C6 10 9 8 13 8 L19 8 C23 8 26 10 26 14 L26 22 C26 26 23 28 19 28 L13 28 C9 28 6 26 6 22 Z"
          fill="#8B6914"
          stroke="#6B5010"
          strokeWidth="1"
        />
        <path d="M26 16 C30 16 32 18 32 20 C32 22 30 24 26 24" stroke="#6B5010" strokeWidth="1.5" fill="none" />
        <path d="M10 5 Q11 2 13 4" stroke="#A0A0A0" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M16 4 Q17 1 19 3" stroke="#A0A0A0" strokeWidth="1" fill="none" strokeLinecap="round" />
      </svg>

      {/* lower right — umbrella */}
      <svg
        className="absolute right-7 top-[56%] h-9 w-9 rotate-6 opacity-85"
        viewBox="0 0 36 36"
        fill="none"
      >
        <path
          d="M6 20 C6 12 12 8 18 8 C24 8 30 12 30 20 L6 20 Z"
          fill="#6BAAE8"
          stroke="#4A90D9"
          strokeWidth="1"
        />
        <line x1="18" y1="20" x2="18" y2="30" stroke="#4A90D9" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M14 30 Q18 32 22 30" stroke="#4A90D9" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
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
  weatherIcon: React.ReactNode;
  weatherPillClass: string;
  temp: string;
  time: string;
  title: string;
  location: string;
  footerIcon: React.ReactNode;
  footerText: string;
  footerClass: string;
}) {
  return (
    <div
      className={`w-[168px] shrink-0 rounded-[22px] bg-[#FAF8F4] p-3.5 shadow-[0_4px_20px_rgba(61,46,31,0.1)] ${tilt}`}
    >
      <div
        className={`mb-2.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium ${weatherPillClass}`}
      >
        {weatherIcon}
        <span>{temp}</span>
        <span className="text-[#4A3F35]/35">·</span>
        <span>{time}</span>
      </div>
      <h3 className="font-serif text-[15px] font-bold leading-snug text-[#4A3F35]">
        {title}
      </h3>
      <p className="mt-0.5 font-serif text-[11px] text-[#4A3F35]/55">{location}</p>
      <div
        className={`mt-2.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium ${footerClass}`}
      >
        {footerIcon}
        <span>{footerText}</span>
      </div>
    </div>
  );
}

function GoogleSignInLink() {
  return (
    <a
      href="/api/auth/signin/google?callbackUrl=%2F"
      className="flex w-full items-center justify-center gap-3 rounded-[20px] bg-white px-6 py-[18px] text-[15px] font-bold text-black shadow-[0_6px_28px_rgba(61,46,31,0.14)] transition hover:bg-[#FAFAFA]"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" aria-hidden>
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
    <main className="relative min-h-screen overflow-hidden bg-[#F5F2E8]">
      {/* bottom lavender gradient fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-b from-transparent via-[#DDE4FF]/30 to-[#DDE4FF]/70" />

      <DecorativeBackground />

      <div className="relative mx-auto flex min-h-screen max-w-[390px] flex-col px-7 pb-5 pt-14">
        {/* logo */}
        <div className="flex flex-col items-center">
          <div className="relative flex flex-col items-center">
            <span className="font-serif text-[52px] font-bold italic leading-none tracking-tight text-black -rotate-[2deg]">
              Don&apos;t
            </span>
            <span className="-mt-1 inline-block rotate-[2deg] rounded-[18px] bg-[#4A80F0] px-7 py-1.5 font-serif text-[40px] font-bold leading-none text-white shadow-[0_4px_16px_rgba(74,128,240,0.35)]">
              Forget
            </span>
          </div>

          {/* tagline pill */}
          <p className="mt-5 rounded-full border border-dashed border-[#4A3F35]/25 bg-[#F5F2E8] px-5 py-2 font-serif text-[13px] italic text-[#4A3F35]/80">
            Your day, already figured out.
          </p>
        </div>

        {/* sign in */}
        <div className="mt-9 w-full">
          <GoogleSignInLink />
        </div>

        {/* privacy */}
        <p className="mx-auto mt-5 max-w-[260px] text-center font-serif text-[11px] italic leading-relaxed text-[#4A3F35]/65">
          We read your calendar to personalize your morning. We never edit or
          share it.
        </p>

        {/* security pill */}
        <div className="mx-auto mt-4 rotate-[1deg] rounded-full border border-[#4A80F0]/35 bg-[#DDE4FF]/25 px-5 py-1.5 text-[9px] font-semibold tracking-[0.18em] text-[#4A80F0]">
          PRIVATE · SECURE · YOURS
        </div>

        {/* spacer pushes preview to bottom */}
        <div className="flex-1" />

        {/* preview section */}
        <div className="mt-6">
          <hr className="mb-4 border-0 border-t border-[#4A3F35]/12" />
          <p className="mb-3.5 text-center font-serif text-[13px] italic text-[#4A3F35]/55">
            a peek at your mornings
          </p>
          <div className="flex justify-center gap-2.5 overflow-hidden">
            <PreviewCard
              tilt="-rotate-[3deg]"
              weatherIcon={
                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <circle cx="6" cy="6" r="3" fill="#F5D76E" />
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                    <line
                      key={deg}
                      x1={6 + 4 * Math.cos((deg * Math.PI) / 180)}
                      y1={6 + 4 * Math.sin((deg * Math.PI) / 180)}
                      x2={6 + 5.5 * Math.cos((deg * Math.PI) / 180)}
                      y2={6 + 5.5 * Math.sin((deg * Math.PI) / 180)}
                      stroke="#E8C84A"
                      strokeWidth="0.8"
                      strokeLinecap="round"
                    />
                  ))}
                </svg>
              }
              weatherPillClass="bg-[#FFF8E7] text-[#4A3F35]"
              temp="72°"
              time="1:00 PM"
              title="Lunch with Maya"
              location="Tartine Manufactory"
              footerIcon={
                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <rect x="1" y="4" width="7" height="4" rx="1" fill="#8B6914" />
                  <rect x="8" y="5" width="3" height="2" rx="0.5" fill="#6B5010" />
                  <circle cx="3" cy="9" r="1.2" fill="#4A3F35" />
                  <circle cx="7" cy="9" r="1.2" fill="#4A3F35" />
                </svg>
              }
              footerText="18 min drive"
              footerClass="bg-[#FFF8E7]/90 text-[#4A3F35]/70"
            />
            <PreviewCard
              tilt="rotate-[2deg]"
              weatherIcon={
                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path
                    d="M2 7 C2 4.5 4 3 6 3 C7.5 3 8.5 3.8 9 5 C10.5 5 11.5 6 11.5 7.5 C11.5 8.5 10.8 9.2 9.8 9.5 L2 9.5 Z"
                    fill="#8BB8E8"
                  />
                  <line x1="4" y1="10" x2="4" y2="11.5" stroke="#6BAAD8" strokeWidth="0.8" strokeLinecap="round" />
                  <line x1="7" y1="10" x2="7" y2="11.5" stroke="#6BAAD8" strokeWidth="0.8" strokeLinecap="round" />
                </svg>
              }
              weatherPillClass="bg-[#EDF4FF] text-[#4A3F35]"
              temp="57°"
              time="7:00 PM"
              title="Dinner at Nopa"
              location="560 Divisadero St"
              footerIcon={
                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path
                    d="M1 6 C1 3 3.5 1.5 6 1.5 C8.5 1.5 11 3 11 6 L1 6 Z"
                    fill="#6BAAE8"
                  />
                  <line x1="6" y1="6" x2="6" y2="10.5" stroke="#4A90D9" strokeWidth="0.8" strokeLinecap="round" />
                </svg>
              }
              footerText="Pack umbrella"
              footerClass="border border-[#4A80F0]/25 bg-white text-[#4A80F0]"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
