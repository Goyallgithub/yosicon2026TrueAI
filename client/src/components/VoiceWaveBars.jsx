import { useEffect, useState } from "react";

export default function VoiceWaveBars({ active, color = "bg-bauhaus-blue", count = 12 }) {
  const [heights, setHeights] = useState(() => Array(count).fill(20));

  useEffect(() => {
    if (!active) {
      setHeights(Array(count).fill(12));
      return;
    }

    const interval = setInterval(() => {
      setHeights(Array.from({ length: count }, () => 12 + Math.random() * 48));
    }, 120);

    return () => clearInterval(interval);
  }, [active, count]);

  return (
    <div className="flex h-14 items-end justify-center gap-1" aria-hidden="true">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`w-1.5 border border-foreground transition-all duration-100 ${color}`}
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}

export function SpeakingRings({ active, color = "border-bauhaus-blue" }) {
  if (!active) return null;
  return (
    <>
      <span className={`absolute inset-0 animate-ping rounded-full border-2 ${color} opacity-30`} />
      <span
        className={`absolute -inset-4 animate-pulse rounded-full border-2 ${color} opacity-20`}
        style={{ animationDuration: "1.4s" }}
      />
      <span
        className={`absolute -inset-8 animate-pulse rounded-full border ${color} opacity-10`}
        style={{ animationDuration: "2s" }}
      />
    </>
  );
}

export function TypingDots() {
  return (
    <span className="inline-flex gap-1 align-middle">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-2 w-2 animate-bounce border border-white bg-white"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  );
}
