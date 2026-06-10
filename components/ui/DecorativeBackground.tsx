import { AlarmClock, Coffee, Star, Sun, Umbrella } from "lucide-react";

export default function DecorativeBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <AlarmClock
        className="absolute left-6 top-24 h-5 w-5 text-[#E8A090] opacity-70"
        strokeWidth={1.5}
      />
      <Star
        className="absolute left-10 top-44 h-3.5 w-3.5 fill-brand-gold/40 text-brand-gold opacity-80"
        strokeWidth={1.5}
      />
      <Sun
        className="absolute right-8 top-20 h-5 w-5 text-amber-400 opacity-80"
        strokeWidth={1.5}
      />
      <Star
        className="absolute right-14 top-52 h-3 w-3 fill-brand-gold/30 text-brand-gold opacity-70"
        strokeWidth={1.5}
      />
      <Coffee
        className="absolute left-8 top-[55%] h-5 w-5 text-amber-800/50 opacity-70"
        strokeWidth={1.5}
      />
      <Umbrella
        className="absolute right-10 top-[48%] h-5 w-5 text-sky-400/70 opacity-70"
        strokeWidth={1.5}
      />
      <Star
        className="absolute left-16 top-[70%] h-3 w-3 fill-brand-gold/30 text-brand-gold opacity-60"
        strokeWidth={1.5}
      />
      <Star
        className="absolute right-20 top-[72%] h-3 w-3 fill-brand-gold/30 text-brand-gold opacity-60"
        strokeWidth={1.5}
      />
    </div>
  );
}
