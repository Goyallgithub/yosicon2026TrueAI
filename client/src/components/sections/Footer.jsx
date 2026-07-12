import GeometricLogo from "../ui/GeometricLogo.jsx";

export default function Footer() {
  return (
    <footer className="border-t-4 border-foreground bg-foreground py-12 text-white">
      <div className="bauhaus-container px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <GeometricLogo size="lg" />
            <div>
              <p className="bauhaus-heading text-xl text-white">TrueComplaint</p>
              <p className="mt-1 text-sm font-medium text-white/60">Voice-powered clinical intake</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm font-medium sm:grid-cols-3">
            <div>
              <p className="bauhaus-label mb-3 text-bauhaus-yellow">Product</p>
              <ul className="space-y-2 text-white/70">
                <li><a href="#features" className="hover:text-bauhaus-yellow">Features</a></li>
                <li><a href="#get-started" className="hover:text-bauhaus-yellow">Get Started</a></li>
              </ul>
            </div>
            <div>
              <p className="bauhaus-label mb-3 text-bauhaus-yellow">For Teams</p>
              <ul className="space-y-2 text-white/70">
                <li>Patient Intake</li>
                <li>Doctor Dashboard</li>
                <li>Urgency Triage</li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="bauhaus-label mb-3 text-bauhaus-yellow">Built With</p>
              <ul className="space-y-2 text-white/70">
                <li>OpenAI Realtime</li>
                <li>React + Vite</li>
                <li>WebRTC Voice</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t-2 border-white/20 pt-6">
          <p className="text-xs font-medium uppercase tracking-widest text-white/40">
            © 2026 TrueComplaint AI — Form Follows Function
          </p>
        </div>
      </div>
    </footer>
  );
}
