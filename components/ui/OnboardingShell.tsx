import DecorativeBackground from "@/components/ui/DecorativeBackground";

export function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="mb-8 flex items-center gap-2">
      {Array.from({ length: total }, (_, index) => (
        <div
          key={index}
          className={`h-1.5 flex-1 rounded-full ${
            index < step ? "bg-brand-blue" : "bg-brand-cream-dark"
          }`}
        />
      ))}
      <span className="ml-1 text-xs font-medium text-brand-brown/60">
        {step} / {total}
      </span>
    </div>
  );
}

export function StepBadge({
  icon,
  label,
}: {
  icon: string;
  label: string;
}) {
  return (
    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-dashed border-brand-brown/25 bg-white/70 px-3 py-1.5">
      <span className="text-sm">{icon}</span>
      <span className="text-[10px] font-bold tracking-[0.15em] text-brand-gold">
        {label}
      </span>
    </div>
  );
}

export default function OnboardingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen bg-brand-cream">
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent via-brand-lavender/30 to-brand-blue-light/40" />
      <DecorativeBackground />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-5 pb-8 pt-10">
        {children}
      </div>
    </main>
  );
}
