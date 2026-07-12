const BARS = [
  { color: "bg-bauhaus-red", scale: 0.4 },
  { color: "bg-bauhaus-blue", scale: 0.7 },
  { color: "bg-bauhaus-yellow", scale: 1 },
  { color: "bg-bauhaus-red", scale: 0.6 },
  { color: "bg-bauhaus-blue", scale: 0.9 },
  { color: "bg-bauhaus-yellow", scale: 0.5 },
  { color: "bg-bauhaus-red", scale: 0.8 },
];

export default function VoiceWaveform({ active }) {
  return (
    <div className="flex h-12 items-end justify-center gap-1.5" aria-hidden="true">
      {BARS.map((bar, i) => (
        <div
          key={i}
          className={`w-2 border border-foreground transition-all duration-150 ${bar.color} ${
            active ? "animate-pulse" : "opacity-30"
          }`}
          style={{
            height: `${bar.scale * 100}%`,
            animationDelay: `${i * 80}ms`,
          }}
        />
      ))}
    </div>
  );
}
