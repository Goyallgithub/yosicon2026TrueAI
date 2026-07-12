import { ArrowRight } from "lucide-react";

const STEPS = [
  {
    num: "01",
    title: "Choose Your Role",
    description: "Patient or physician — pick your path and enter the platform instantly.",
    color: "bg-bauhaus-red",
  },
  {
    num: "02",
    title: "Voice Conversation",
    description: "Patients talk naturally with Rakshak. She gathers symptoms, history, and context.",
    color: "bg-bauhaus-blue",
  },
  {
    num: "03",
    title: "AI Extraction",
    description: "GPT-4o structures the transcript into a clinical brief with urgency scoring.",
    color: "bg-bauhaus-yellow",
  },
  {
    num: "04",
    title: "Physician Review",
    description: "Doctors see triaged cases on a dashboard — emergency cases surface first.",
    color: "bg-bauhaus-red",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="bauhaus-section bg-white">
      <div className="bauhaus-container">
        <div className="mb-12 text-center">
          <p className="bauhaus-label mb-3 text-bauhaus-blue">How It Works</p>
          <h2 className="bauhaus-heading text-4xl sm:text-5xl lg:text-6xl">Four Steps to Better Intake</h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div key={step.num} className="group relative text-center">
              <div
                className={`mx-auto mb-6 flex h-20 w-20 rotate-45 items-center justify-center border-2 border-foreground ${step.color} shadow-bauhaus transition-transform duration-200 group-hover:-translate-y-1 lg:h-24 lg:w-24 lg:border-4`}
              >
                <span className="-rotate-45 text-2xl font-black lg:text-3xl">{step.num}</span>
              </div>
              <h3 className="text-lg font-bold uppercase tracking-tight">{step.title}</h3>
              <p className="mt-2 font-medium leading-relaxed text-foreground/70">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <a
            href="#get-started"
            className="bauhaus-btn-yellow inline-flex items-center gap-2 rounded-none px-8 py-4 text-sm"
          >
            Get Started <ArrowRight className="h-5 w-5" strokeWidth={3} />
          </a>
        </div>
      </div>
    </section>
  );
}
