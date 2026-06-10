import SignInButton from "@/components/SignInButton";

function Star({
  size,
  className = "",
}: {
  size: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <path
        fill="#C9A84C"
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      />
    </svg>
  );
}

function CoffeeCupIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 44"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 8 C12.5 4 13.5 4 14 8"
        stroke="#8A7968"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M20 5 C20.5 1 21.5 1 22 5"
        stroke="#8A7968"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M28 8 C28.5 4 29.5 4 30 8"
        stroke="#8A7968"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <rect x="7" y="16" width="26" height="16" rx="5" fill="#6B4C35" />
      <path
        d="M33 19 C39 19 39 29 33 29"
        stroke="#6B4C35"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="9" y="18" width="22" height="3" rx="1.5" fill="#7A5A42" />
    </svg>
  );
}

function DecorativeBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {/* top left — alarm clock + medium star */}
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
      <Star size={18} className="absolute left-2 top-[98px] rotate-[10deg]" />

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

      {/* large star — right of tagline pill */}
      <Star size={24} className="absolute right-3 top-[206px] -rotate-[8deg]" />

      {/* small star — below Google button, left side */}
      <Star size={12} className="absolute left-6 top-[378px] rotate-[6deg]" />
    </div>
  );
}

function MiddleDecorations() {
  return (
    <div className="pointer-events-none relative min-h-[140px] flex-1" aria-hidden>
      <CoffeeCupIcon className="absolute left-5 top-1/2 h-10 w-10 -translate-y-1/2 -rotate-6" />
      <svg
        className="absolute right-7 top-1/2 h-9 w-9 -translate-y-1/2 rotate-6 opacity-85"
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
      className={`w-full rounded-3xl bg-[#FBF9F5] p-4 shadow-[0_6px_24px_rgba(61,46,31,0.12)] ${tilt}`}
    >
      <div
        className={`mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium ${weatherPillClass}`}
      >
        {weatherIcon}
        <span>{temp}</span>
        <span className="text-[#6B5744]/40">·</span>
        <span>{time}</span>
      </div>
      <h3 className="font-serif text-[16px] font-bold leading-snug text-[#4A3F35]">
        {title}
      </h3>
      <p className="mt-1 font-serif text-[12px] text-[#6B5744]/70">{location}</p>
      <div
        className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold ${footerClass}`}
      >
        {footerIcon}
        <span>{footerText}</span>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <main className="relative min-h-screen bg-[#F5F2E8]">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-b from-[#F5F2E8]/0 via-[#C8D4EF]/60 to-[#A8B8E0]/95" />

      <DecorativeBackground />

      <div className="relative mx-auto flex min-h-screen max-w-[390px] flex-col px-5 pb-8 pt-14">
        <div className="flex flex-col items-center">
          <div className="relative flex flex-col items-center">
            <span
              className="font-serif text-[50px] italic leading-none tracking-tight text-black -rotate-[2deg]"
              style={{ fontWeight: 400 }}
            >
              Don&apos;t
            </span>
            <span className="mt-3 inline-block rotate-[2deg] rounded-[18px] bg-[#4A80F0] px-7 py-1.5 font-serif text-[42px] font-bold leading-none text-white shadow-[0_4px_16px_rgba(74,128,240,0.35)]">
              Forget
            </span>
          </div>

          <p className="mt-5 rounded-full border border-dashed border-[#6B5744]/30 bg-[#F5F2E8] px-5 py-2 font-serif text-[14px] italic text-[#6B5744]">
            Your day, already figured out.
          </p>
        </div>

        <div className="mt-8 w-full">
          <SignInButton />
        </div>

        <p className="mx-auto mt-5 max-w-[280px] text-center font-serif text-[13px] italic leading-relaxed text-[#6B5744]">
          We read your calendar to personalize your morning. We never edit or
          share it.
        </p>

        <div className="mx-auto mt-4 rotate-[1deg] rounded-full border border-[#4A80F0]/50 bg-[#E8EEFC] px-5 py-2 font-sans text-[10px] font-bold tracking-[0.16em] text-[#4A80F0]">
          PRIVATE · SECURE · YOURS
        </div>

        <MiddleDecorations />

        <div className="mt-auto">
          <hr className="mb-4 border-0 border-t border-[#6B5744]/15" />
          <p className="mb-4 text-center font-serif text-[14px] italic text-[#6B5744]">
            a peek at your mornings
          </p>
          <div className="grid grid-cols-2 gap-3 px-1">
            <PreviewCard
              tilt="-rotate-[3deg]"
              weatherIcon={
                <svg className="h-3.5 w-3.5" viewBox="0 0 12 12" fill="none" aria-hidden>
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
              weatherPillClass="bg-[#FFF3D6] text-[#4A3F35]"
              temp="72°"
              time="1:00 PM"
              title="Lunch with Maya"
              location="Tartine Manufactory"
              footerIcon={
                <svg className="h-3.5 w-3.5" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <rect x="1" y="4" width="7" height="4" rx="1" fill="#8B6914" />
                  <rect x="8" y="5" width="3" height="2" rx="0.5" fill="#6B5010" />
                  <circle cx="3" cy="9" r="1.2" fill="#5C4A32" />
                  <circle cx="7" cy="9" r="1.2" fill="#5C4A32" />
                </svg>
              }
              footerText="18 min drive"
              footerClass="bg-[#EDE0C4] text-[#5C4A32]"
            />
            <PreviewCard
              tilt="rotate-[2deg]"
              weatherIcon={
                <svg className="h-3.5 w-3.5" viewBox="0 0 12 12" fill="none" aria-hidden>
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
                <svg className="h-3.5 w-3.5" viewBox="0 0 12 12" fill="none" aria-hidden>
                  <path
                    d="M1 6 C1 3 3.5 1.5 6 1.5 C8.5 1.5 11 3 11 6 L1 6 Z"
                    fill="#6BAAE8"
                  />
                  <line x1="6" y1="6" x2="6" y2="10.5" stroke="#4A90D9" strokeWidth="0.8" strokeLinecap="round" />
                </svg>
              }
              footerText="Pack umbrella"
              footerClass="border border-[#4A80F0] bg-[#EEF3FF] text-[#4A80F0]"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
