import OnboardingDecorations from "@/components/ui/OnboardingDecorations";

export function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-6 flex items-center gap-2.5">
      <div className="flex flex-1 gap-1.5">
        {Array.from({ length: total }, (_, index) => (
          <div
            key={index}
            className={`h-1.5 flex-1 rounded-full ${
              index < step ? "bg-[#4A80F0]" : "bg-[#E5E0D8]"
            }`}
          />
        ))}
      </div>
      <span className="text-[12px] font-medium text-[#6B5744]/45">
        {step} / {total}
      </span>
    </div>
  );
}

export function LocationPinIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        fill="#4A80F0"
        d="M8 1.5C5.52 1.5 3.5 3.52 3.5 6c0 2.93 4.5 8.5 4.5 8.5S12.5 8.93 12.5 6c0-2.48-2.02-4.5-4.5-4.5Zm0 5.75a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z"
      />
    </svg>
  );
}

export function AlarmClockIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="11" r="6.5" fill="#F4A89A" stroke="#E8897A" strokeWidth="1.2" />
      <path
        d="M6.5 5.5 5 3.5M13.5 5.5 15 3.5"
        stroke="#E8897A"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="10"
        y1="11"
        x2="10"
        y2="8.5"
        stroke="#fff"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <line
        x1="10"
        y1="11"
        x2="12"
        y2="12.5"
        stroke="#fff"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StepBadge({
  icon,
  label,
}: {
  icon: "location" | "clock";
  label: string;
}) {
  return (
    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-dashed border-[#6B5744]/25 bg-[#F5F2E8]/80 px-3.5 py-1.5">
      {icon === "location" ? (
        <LocationPinIcon className="h-4 w-4" />
      ) : (
        <AlarmClockIcon className="h-4 w-4" />
      )}
      <span className="font-sans text-[10px] font-bold tracking-[0.16em] text-[#B8956A]">
        {label}
      </span>
    </div>
  );
}

export default function OnboardingShell({
  variant,
  children,
}: {
  variant: "location" | "time";
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen bg-[#F5F2E8]">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-b from-[#F5F2E8]/0 via-[#C8D4EF]/60 to-[#A8B8E0]/95" />
      <OnboardingDecorations variant={variant} />
      <div className="relative mx-auto flex min-h-screen max-w-[390px] flex-col px-5 pb-8 pt-12">
        {children}
      </div>
    </main>
  );
}
