function Star({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        fill="#C9A84C"
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      />
    </svg>
  );
}

function Sun({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden>
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
  );
}

function PinkPin({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 20" fill="none" aria-hidden>
      <path
        fill="#F4A89A"
        d="M8 1C5.24 1 3 3.24 3 6c0 3.5 5 9 5 9s5-5.5 5-9c0-2.76-2.24-5-5-5Zm0 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"
      />
    </svg>
  );
}

function AlarmClock({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" aria-hidden>
      <circle cx="18" cy="20" r="11" fill="#F4A89A" stroke="#E8897A" strokeWidth="1.5" />
      <path
        d="M12 10 10 6M24 10 26 6"
        stroke="#E8897A"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="18"
        y1="20"
        x2="18"
        y2="15"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="18"
        y1="20"
        x2="22"
        y2="22"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function OnboardingDecorations({
  variant,
}: {
  variant: "location" | "time";
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <Sun className="absolute right-5 top-[72px] h-9 w-9 rotate-6 opacity-90" />

      {variant === "location" ? (
        <>
          <Star className="absolute left-3 top-[300px] h-[18px] w-[18px] rotate-[8deg]" />
          <PinkPin className="absolute right-3 top-[318px] h-5 w-4 rotate-[6deg] opacity-90" />
          <AlarmClock className="absolute bottom-[108px] left-4 h-9 w-9 -rotate-12 opacity-90" />
          <Star className="absolute bottom-[96px] right-8 h-4 w-4 rotate-[10deg]" />
        </>
      ) : (
        <>
          <Star className="absolute left-2 top-[318px] h-4 w-4 rotate-[8deg]" />
          <PinkPin className="absolute right-3 top-[360px] h-5 w-4 rotate-[6deg] opacity-90" />
          <AlarmClock className="absolute left-5 top-[430px] h-7 w-7 -rotate-12 opacity-85" />
        </>
      )}
    </div>
  );
}
