import { Monitor, Sparkles } from "lucide-react";
import { IS_DEMO_MODE } from "../config/mode.js";

export default function DemoBanner() {
  if (!IS_DEMO_MODE) return null;

  return (
    <div className="border-b-4 border-foreground bg-bauhaus-yellow px-4 py-3">
      <div className="bauhaus-container flex flex-wrap items-center justify-center gap-2 text-center sm:gap-3">
        <Sparkles className="h-4 w-4 shrink-0 text-bauhaus-red" strokeWidth={2.5} />
        <p className="text-sm font-bold">
          <span className="uppercase tracking-wide text-bauhaus-red">Public UI Demo</span>
          {" — "}
          Browse EMR & doctor dashboard with sample data.{" "}
          <span className="inline-flex items-center gap-1">
            <Monitor className="inline h-3.5 w-3.5" />
            Live Rakshak voice + OpenAI runs on{" "}
            <code className="rounded border border-foreground/30 bg-white/60 px-1 py-0.5 text-xs">localhost</code>
          </span>
        </p>
      </div>
    </div>
  );
}
