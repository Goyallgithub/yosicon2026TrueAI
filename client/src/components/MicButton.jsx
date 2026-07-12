import { Mic } from "lucide-react";
import VoiceWaveform from "./VoiceWaveform.jsx";

const STATE_CONFIG = {
  idle: { label: "Start conversation", variant: "red", disabled: false },
  "requesting-mic": { label: "Requesting mic...", variant: "outline", disabled: true },
  connecting: { label: "Connecting...", variant: "outline", disabled: true },
  listening: { label: "Listening — tap to end", variant: "blue", disabled: false },
  "agent-speaking": { label: "Agent speaking...", variant: "yellow", disabled: true },
  "wrapping-up": { label: "Wrapping up...", variant: "outline", disabled: true },
  error: { label: "Retry voice session", variant: "red", disabled: false },
};

const VARIANT_CLASSES = {
  red: "bg-bauhaus-red text-white hover:bg-bauhaus-red/90",
  blue: "bg-bauhaus-blue text-white hover:bg-bauhaus-blue/90",
  yellow: "bg-bauhaus-yellow text-foreground hover:bg-bauhaus-yellow/90",
  outline: "bg-muted text-foreground/50",
};

export default function MicButton({ connectionState, onClick, error }) {
  const config = STATE_CONFIG[connectionState] || STATE_CONFIG.idle;
  const isActive = ["listening", "agent-speaking"].includes(connectionState);
  const colorClass = VARIANT_CLASSES[config.variant] || VARIANT_CLASSES.red;

  return (
    <div className="flex flex-col items-center gap-6">
      <VoiceWaveform active={isActive} />
      <button
        type="button"
        onClick={onClick}
        disabled={config.disabled}
        aria-label={config.label}
        className={`flex h-24 w-24 items-center justify-center rounded-full border-2 border-foreground shadow-bauhaus-lg transition-all duration-200 ease-out active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 lg:h-28 lg:w-28 lg:border-4 ${colorClass}`}
      >
        <Mic className="h-10 w-10" strokeWidth={2.5} />
      </button>
      <p className="bauhaus-label text-foreground/80">{config.label}</p>
      {error && (
        <p className="max-w-xs border-2 border-foreground bg-bauhaus-red px-4 py-2 text-center text-sm font-medium text-white shadow-bauhaus-sm">
          {error}
        </p>
      )}
    </div>
  );
}
