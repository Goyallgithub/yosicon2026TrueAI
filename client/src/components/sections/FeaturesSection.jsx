import { Mic, Brain, Shield, Clock, FileText, Zap } from "lucide-react";
import Card from "../ui/Card.jsx";

const FEATURES = [
  {
    icon: Mic,
    title: "Voice-First Intake",
    description:
      "Patients speak naturally with Rakshak, our AI intake coordinator. No forms, no typing — just a human conversation.",
    accent: "bg-bauhaus-red",
  },
  {
    icon: Brain,
    title: "AI Clinical Briefs",
    description:
      "Every conversation is structured into physician-ready briefs with urgency triage, symptoms, and recommended actions.",
    accent: "bg-bauhaus-blue",
  },
  {
    icon: Shield,
    title: "Red Flag Detection",
    description:
      "Emergency symptoms like chest pain or stroke signs are flagged instantly so critical cases never wait in queue.",
    accent: "bg-bauhaus-yellow",
  },
  {
    icon: Clock,
    title: "Real-Time Triage",
    description:
      "Doctors see cases sorted by urgency — emergency first, urgent next, routine last. Zero manual sorting.",
    accent: "bg-bauhaus-red",
  },
  {
    icon: FileText,
    title: "Full Transcripts",
    description:
      "Every word is captured and stored alongside the structured brief so physicians can review the full context.",
    accent: "bg-bauhaus-blue",
  },
  {
    icon: Zap,
    title: "WebRTC Voice Engine",
    description:
      "Powered by OpenAI Realtime API over WebRTC for low-latency, natural voice conversations that feel truly human.",
    accent: "bg-bauhaus-yellow",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="bauhaus-section bg-background dot-grid">
      <div className="bauhaus-container">
        <div className="mb-12 max-w-3xl">
          <p className="bauhaus-label mb-3 text-bauhaus-red">Platform Features</p>
          <h2 className="bauhaus-heading text-4xl sm:text-5xl lg:text-6xl">
            Built for
            <br />
            <span className="text-bauhaus-blue">Modern Care</span>
          </h2>
          <p className="mt-6 text-base font-medium leading-relaxed text-foreground/80 sm:text-lg">
            TrueComplaint AI transforms patient intake from a paperwork bottleneck into a
            fast, voice-driven workflow — designed with the same precision as a Bauhaus composition.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} decorationIndex={i} className="!shadow-bauhaus">
                <div
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center border-2 border-foreground shadow-bauhaus-sm ${feature.accent}`}
                >
                  <Icon
                    className={`h-6 w-6 ${feature.accent === "bg-bauhaus-yellow" ? "text-foreground" : "text-white"}`}
                    strokeWidth={2.5}
                  />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tight">{feature.title}</h3>
                <p className="mt-3 font-medium leading-relaxed text-foreground/75">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
