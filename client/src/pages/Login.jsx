import { Navigate, useNavigate } from "react-router-dom";
import { Mic, Stethoscope, ArrowRight } from "lucide-react";
import { useAppStore } from "../store/useAppStore.js";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import GeometricLogo from "../components/ui/GeometricLogo.jsx";
import FeaturesSection from "../components/sections/FeaturesSection.jsx";
import StatsSection from "../components/sections/StatsSection.jsx";
import HowItWorksSection from "../components/sections/HowItWorksSection.jsx";
import Footer from "../components/sections/Footer.jsx";

export default function Login() {
  const navigate = useNavigate();
  const setRole = useAppStore((s) => s.setRole);

  const handleSelect = (role) => {
    setRole(role);
    navigate(role === "patient" ? "/patient/talk" : "/doctor/dashboard");
  };

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="bauhaus-section border-b-4 border-foreground !py-0">
        <div className="bauhaus-container grid min-h-[70vh] lg:grid-cols-2">
          {/* Left — copy */}
          <div className="flex flex-col justify-center py-12 pr-0 lg:py-24 lg:pr-12">
            <GeometricLogo size="lg" />
            <p className="bauhaus-label mt-6 text-bauhaus-red">Clinical Intake, Reimagined</p>
            <h1 className="bauhaus-heading mt-4 text-4xl sm:text-6xl lg:text-7xl xl:text-8xl">
              Voice
              <br />
              <span className="text-bauhaus-blue">Meets</span>
              <br />
              Medicine
            </h1>
            <p className="mt-6 max-w-lg text-base font-medium leading-relaxed text-foreground/80 sm:text-lg">
              TrueComplaint AI turns patient intake into a natural voice conversation — then
              delivers structured clinical briefs to your care team, triaged by urgency.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#get-started" className="bauhaus-btn-red rounded-none px-8 py-4 text-sm">
                Get Started
              </a>
              <a href="#features" className="bauhaus-btn-outline rounded-none px-8 py-4 text-sm">
                See Features
              </a>
            </div>
          </div>

          {/* Right — geometric composition */}
          <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-bauhaus-blue lg:min-h-0">
            <div className="absolute right-8 top-8 h-32 w-32 rounded-full border-4 border-foreground bg-bauhaus-red opacity-90" />
            <div className="absolute bottom-12 left-8 h-24 w-24 rotate-45 border-4 border-foreground bg-bauhaus-yellow shadow-bauhaus-lg" />
            <div className="relative z-10 flex h-40 w-40 items-center justify-center border-4 border-foreground bg-white shadow-bauhaus-lg">
              <div
                className="h-16 w-16 bg-bauhaus-yellow"
                style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
              />
            </div>
            <div className="absolute bottom-8 right-16 h-8 w-8 rounded-full border-2 border-foreground bg-white" />
            <div className="absolute left-1/2 top-12 h-6 w-6 rotate-45 border-2 border-foreground bg-bauhaus-red" />
          </div>
        </div>
      </section>

      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />

      {/* Role selection CTA */}
      <section id="get-started" className="bauhaus-section relative overflow-hidden bg-bauhaus-red text-white">
        <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full border-4 border-foreground/30 opacity-50" />
        <div className="absolute -bottom-12 -right-12 h-40 w-40 rotate-45 border-4 border-foreground/30 bg-bauhaus-yellow opacity-20" />

        <div className="bauhaus-container relative z-10">
          <div className="mb-10 text-center">
            <p className="bauhaus-label text-bauhaus-yellow">Get Started</p>
            <h2 className="bauhaus-heading mt-3 text-4xl text-white sm:text-5xl lg:text-6xl">
              Choose Your Path
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-medium text-white/80">
              Select your role to enter the platform. Patients start a voice intake; physicians
              review triaged cases.
            </p>
          </div>

          <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
            <button type="button" onClick={() => handleSelect("patient")} className="text-left">
              <Card decorationIndex={0} className="group !border-foreground !bg-white !text-foreground !shadow-bauhaus-lg hover:!-translate-y-2">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-foreground bg-bauhaus-red text-white shadow-bauhaus">
                  <Mic className="h-7 w-7" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">I'm a Patient</h3>
                <p className="mt-2 font-medium leading-relaxed text-foreground/70">
                  Describe your symptoms in a natural voice conversation with Rakshak, our AI intake coordinator.
                </p>
                <span className="mt-4 inline-flex items-center gap-2 font-bold uppercase tracking-wider text-bauhaus-red group-hover:gap-3 transition-all duration-200">
                  Start intake <ArrowRight className="h-5 w-5" strokeWidth={3} />
                </span>
              </Card>
            </button>

            <button type="button" onClick={() => handleSelect("doctor")} className="text-left">
              <Card decorationIndex={1} className="group !border-foreground !bg-white !text-foreground !shadow-bauhaus-lg hover:!-translate-y-2">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center border-2 border-foreground bg-bauhaus-blue text-white shadow-bauhaus">
                  <Stethoscope className="h-7 w-7" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">I'm a Doctor</h3>
                <p className="mt-2 font-medium leading-relaxed text-foreground/70">
                  Review patient cases on a triage dashboard — emergency cases always surface first.
                </p>
                <span className="mt-4 inline-flex items-center gap-2 font-bold uppercase tracking-wider text-bauhaus-blue group-hover:gap-3 transition-all duration-200">
                  Open dashboard <ArrowRight className="h-5 w-5" strokeWidth={3} />
                </span>
              </Card>
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA strip */}
      <section className="bauhaus-section bg-bauhaus-yellow">
        <div className="bauhaus-container flex flex-col items-center text-center">
          <h2 className="bauhaus-heading text-3xl sm:text-4xl lg:text-5xl">
            Ready to Transform Intake?
          </h2>
          <p className="mt-4 max-w-lg font-medium text-foreground/80">
            No forms. No waiting rooms full of clipboards. Just voice, AI, and better care coordination.
          </p>
          <Button
            variant="red"
            shape="square"
            className="mt-8 !px-10 !py-4"
            onClick={() => document.getElementById("get-started")?.scrollIntoView({ behavior: "smooth" })}
          >
            Enter Platform
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export function RequireRole({ role, children }) {
  const currentRole = useAppStore((s) => s.role);
  if (currentRole !== role) {
    return <Navigate to="/" replace />;
  }
  return children;
}
