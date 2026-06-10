export default function DecorativeBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
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
