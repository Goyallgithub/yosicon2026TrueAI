import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, Play, Stethoscope, Clock, FileText } from "lucide-react";
import { apiCall } from "../api/client.js";
import { DEMO_SAMPLE_MESSAGES, DEMO_SAMPLE_TRANSCRIPT } from "../data/demoCases.js";
import { useAppStore } from "../store/useAppStore.js";
import ConversationStage from "../components/ConversationStage.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";

const LANGUAGES = [
  { id: "both", label: "Hindi + English + Tamil", sub: "Multilingual demo" },
  { id: "hi", label: "हिंदी", sub: "Hindi" },
  { id: "ta", label: "தமிழ்", sub: "Tamil" },
  { id: "en", label: "English", sub: "English" },
];

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PatientTalk() {
  const navigate = useNavigate();
  const setCurrentCaseId = useAppStore((s) => s.setCurrentCaseId);
  const openDoctorView = useAppStore((s) => s.openDoctorView);
  const [language, setLanguage] = useState("both");
  const [messages, setMessages] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [savedCaseId, setSavedCaseId] = useState(null);
  const [callSeconds, setCallSeconds] = useState(0);
  const [demoActive, setDemoActive] = useState(false);
  const [demoConnectionState, setDemoConnectionState] = useState("idle");

  const finishIntake = useCallback(async () => {
    try {
      setProcessing(true);
      const brief = await apiCall("/api/extract", {
        method: "POST",
        body: JSON.stringify({ transcript: DEMO_SAMPLE_TRANSCRIPT }),
      });
      const { data: savedCase } = await apiCall("/api/cases", {
        method: "POST",
        body: JSON.stringify({
          transcript: DEMO_SAMPLE_TRANSCRIPT,
          brief,
          patientName: brief.patient_name,
          patientAge: brief.patient_age,
        }),
      });
      setCurrentCaseId(savedCase.id);
      setSavedCaseId(savedCase.id);
      setSubmitted(true);
    } finally {
      setProcessing(false);
      setDemoActive(false);
      setDemoConnectionState("idle");
    }
  }, [setCurrentCaseId]);

  const runDemoIntake = useCallback(async () => {
    setDemoActive(true);
    setDemoConnectionState("connecting");
    setMessages([]);
    setCallSeconds(0);

    await new Promise((r) => setTimeout(r, 600));
    for (let i = 0; i < DEMO_SAMPLE_MESSAGES.length; i++) {
      const msg = DEMO_SAMPLE_MESSAGES[i];
      setDemoConnectionState(msg.role === "agent" ? "agent-speaking" : "user-speaking");
      await new Promise((r) => setTimeout(r, 900));
      setMessages((prev) => [...prev, msg]);
    }
    setDemoConnectionState("wrapping-up");
    await finishIntake();
  }, [finishIntake]);

  useEffect(() => {
    if (!demoActive) {
      setCallSeconds(0);
      return;
    }
    const timer = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [demoActive]);

  const handleNewCall = () => {
    setSubmitted(false);
    setSavedCaseId(null);
    setMessages([]);
    setCallSeconds(0);
    setDemoActive(false);
    setDemoConnectionState("idle");
  };

  if (submitted) {
    return (
      <div className="bauhaus-section bg-background dot-grid">
        <div className="bauhaus-container mx-auto max-w-lg py-12">
          <Card decorationIndex={1} className="!border-bauhaus-blue !bg-bauhaus-blue !text-white !py-12 !text-center !shadow-bauhaus-lg">
            <CheckCircle className="mx-auto h-16 w-16 text-bauhaus-yellow" strokeWidth={2} />
            <h1 className="bauhaus-heading mt-6 text-3xl sm:text-4xl">All Done!</h1>
            <p className="mx-auto mt-4 max-w-sm text-lg font-bold leading-relaxed text-white/90">
              Your details have been sent to the doctor.
            </p>
          </Card>
          <div className="mt-6 flex flex-col gap-3">
            <Button
              variant="red"
              shape="square"
              className="w-full !py-4"
              as={Link}
              to={savedCaseId ? `/patient/prescription/${savedCaseId}` : "/patient/prescription"}
            >
              <FileText className="h-5 w-5" strokeWidth={3} />
              Dawai Report
            </Button>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="yellow" shape="square" className="flex-1 !py-4" onClick={() => openDoctorView(navigate, savedCaseId)}>
                <Stethoscope className="h-5 w-5" strokeWidth={3} />
                Doctor View
              </Button>
              <Button variant="outline" shape="square" className="flex-1 !py-4" onClick={handleNewCall}>
                New Intake
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bauhaus-section bg-background dot-grid">
      <div className="bauhaus-container mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <p className="bauhaus-label text-bauhaus-red">Eye Clinic · Intake Demo</p>
          <h1 className="bauhaus-heading mt-2 text-4xl sm:text-5xl">Rakshak Intake</h1>
          <p className="mt-4 font-medium leading-relaxed text-foreground/75">
            Structured ophthalmology intake demo — decreased vision questionnaire, then doctor handoff.
          </p>
        </header>

        {!demoActive && !processing && (
          <Card decorationIndex={1} className="mb-6 !shadow-bauhaus">
            <p className="bauhaus-label mb-3 text-bauhaus-blue">Language (Demo UI)</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setLanguage(lang.id)}
                  className={`border-2 border-foreground p-3 text-left transition-all ${
                    language === lang.id ? "bg-bauhaus-yellow shadow-bauhaus" : "bg-white hover:bg-muted"
                  }`}
                >
                  <p className="font-bold uppercase tracking-tight">{lang.label}</p>
                  <p className="mt-1 text-xs font-medium text-foreground/60">{lang.sub}</p>
                </button>
              ))}
            </div>
          </Card>
        )}

        <Card decorationIndex={2} className="!py-8">
          {processing ? (
            <LoadingSpinner label="Sending to doctor…" />
          ) : (
            <>
              {demoActive && (
                <div className="mb-6 flex items-center justify-center gap-2 border-2 border-foreground bg-bauhaus-yellow px-4 py-2 shadow-bauhaus-sm">
                  <Clock className="h-4 w-4" />
                  <span className="font-black tabular-nums">{formatTime(callSeconds)}</span>
                </div>
              )}

              <ConversationStage
                connectionState={demoConnectionState}
                activeSpeaker={
                  demoConnectionState === "agent-speaking"
                    ? "agent"
                    : demoConnectionState === "user-speaking"
                      ? "user"
                      : null
                }
                messages={messages}
                agentPartial=""
                error={null}
                videoStream={null}
                videoRef={{ current: null }}
              />

              {!demoActive && (
                <div className="mt-8 flex justify-center">
                  <Button variant="red" shape="pill" onClick={runDemoIntake} className="!gap-2 !px-8">
                    <Play className="h-5 w-5" strokeWidth={3} />
                    Play Demo Intake
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
