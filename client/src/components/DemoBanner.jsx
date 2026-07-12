import { Monitor, Sparkles } from "lucide-react";

export default function DemoBanner() {
  return (
    <div className="border-b-4 border-foreground bg-bauhaus-yellow px-4 py-2">
      <div className="bauhaus-container flex items-center justify-center gap-2 text-center">
        <Sparkles className="h-4 w-4 shrink-0 text-bauhaus-red" />
        <p className="text-sm font-bold">
          <span className="uppercase text-bauhaus-red">Frontend Demo</span>
          {" — "}EMR · Doctor Dashboard · Patient Intake · Dawai Report (no backend required)
        </p>
        <Monitor className="hidden h-4 w-4 sm:inline text-bauhaus-blue" />
      </div>
    </div>
  );
}
