import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Phone, PhoneOff, Stethoscope, Clock, Play } from "lucide-react";
import { apiCall, IS_DEMO_MODE } from "../api/client.js";
import { DEMO_SAMPLE_MESSAGES, DEMO_SAMPLE_TRANSCRIPT } from "../data/demoCases.js";
import { useAppStore } from "../store/useAppStore.js";
import { useVoice } from "../hooks/useVoice.js";
import ConversationStage from "../components/ConversationStage.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";

const LANGUAGES = [
  { id: "both", label: "Hindi + English + Tamil", sub: "Auto-detect — multilingual" },
  { id: "hi", label: "हिंदी", sub: "Hindi only" },
  { id: "ta", label: "தமிழ்", sub: "Tamil only" },
  { id: "en", label: "English", sub: "English only" },
];

const MAX_CALL_SECONDS = 180;

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PatientTalk() {
  const navigate = useNavigate();
  const setCurrentCaseId = useAppStore((s) => s.setCurrentCaseId);
  const openDoctorView = useAppStore((s) => s.openDoctorView);
  const [useRealtime, setUseRealtime] = useState(null);
  const [modeError, setModeError] = useState(null);
  const [language, setLanguage] = useState("both");
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [processError, setProcessError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [savedCaseId, setSavedCaseId] = useState(null);
  const [callSeconds, setCallSeconds] = useState(0);
  const [demoActive, setDemoActive] = useState(false);
  const [demoConnectionState, setDemoConnectionState] = useState("idle");

  const fetchMode = useCallback(async () => {
    if (IS_DEMO_MODE) {
      setUseRealtime(false);
      return;
    }
    try {
      setModeError(null);
      const data = await apiCall("/api/voice-mode");
      setUseRealtime(data.useRealtime);
    } catch (err) {
      setModeError(err.message);
      setUseRealtime(true);
    }
  }, []);

  useEffect(() => {
    fetchMode();
  }, [fetchMode]);

  const handleSessionEnd = useCallback(
    async (finalTranscript, sessionMeta = {}) => {
      if (!finalTranscript?.trim()) {
        setProcessError("No conversation captured. Please try again.");
        return;
      }

      try {
        setProcessing(true);
        setProcessError(null);

        const extractPath = useRealtime ? "/api/extract" : "/api/fallback-extract";
        const brief = await apiCall(extractPath, {
          method: "POST",
          body: JSON.stringify({ transcript: finalTranscript }),
        });

        let visualObservation = null;
        if (sessionMeta.patientSnapshot) {
          try {
            visualObservation = await apiCall("/api/analyze-snapshot", {
              method: "POST",
              body: JSON.stringify({ image: sessionMeta.patientSnapshot }),
            });
          } catch {
            /* vision analysis is optional — case still saves with photo */
          }
        }

        const { data: savedCase } = await apiCall("/api/cases", {
          method: "POST",
          body: JSON.stringify({
            transcript: finalTranscript,
            brief,
            patientName: brief.patient_name,
            patientAge: brief.patient_age,
            patientSnapshot: sessionMeta.patientSnapshot || null,
            visualObservation,
          }),
        });

        setCurrentCaseId(savedCase.id);
        setSavedCaseId(savedCase.id);
        setSubmitted(true);
      } catch (err) {
        setProcessError(err.message);
      } finally {
        setProcessing(false);
      }
    },
    [setCurrentCaseId, useRealtime]
  );

  const voice = useVoice({
    useRealtime: useRealtime !== false,
    language,
    onTranscriptUpdate: setTranscript,
    onMessagesUpdate: setMessages,
    onSessionEnd: handleSessionEnd,
  });

  const runDemoIntake = useCallback(async () => {
    setDemoActive(true);
    setDemoConnectionState("connecting");
    setMessages([]);
    setCallSeconds(0);

    await new Promise((r) => setTimeout(r, 800));
    setDemoConnectionState("agent-speaking");

    for (let i = 0; i < DEMO_SAMPLE_MESSAGES.length; i++) {
      const msg = DEMO_SAMPLE_MESSAGES[i];
      setDemoConnectionState(msg.role === "agent" ? "agent-speaking" : "user-speaking");
      await new Promise((r) => setTimeout(r, 1200));
      setMessages((prev) => [...prev, msg]);
    }

    setDemoConnectionState("wrapping-up");
    await handleSessionEnd(DEMO_SAMPLE_TRANSCRIPT, {});
    setDemoActive(false);
    setDemoConnectionState("idle");
  }, [handleSessionEnd]);

  const isConversationActive = IS_DEMO_MODE
    ? demoActive
    : !["idle", "error"].includes(voice.connectionState);
  const canStart = IS_DEMO_MODE
    ? !demoActive && !processing && !submitted
    : voice.connectionState === "idle" || voice.connectionState === "error";
  const stageConnectionState = IS_DEMO_MODE ? demoConnectionState : voice.connectionState;
  const stageMessages = IS_DEMO_MODE ? messages : voice.messages.length ? voice.messages : messages;

  useEffect(() => {
    if (!isConversationActive) {
      setCallSeconds(0);
      return;
    }
    const timer = setInterval(() => {
      setCallSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isConversationActive]);

  const handleNewCall = () => {
    setSubmitted(false);
    setSavedCaseId(null);
    setTranscript("");
    setMessages([]);
    setProcessError(null);
    setCallSeconds(0);
    setDemoActive(false);
    setDemoConnectionState("idle");
  };

  if (!IS_DEMO_MODE && useRealtime === null && !modeError) {
    return (
      <div className="bauhaus-container px-4 py-12 sm:px-6 lg:px-8">
        <LoadingSpinner label="Initializing voice service..." />
      </div>
    );
  }

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
            <p className="mt-2 text-sm font-medium text-white/60">
              They will review your case along with imaging, labs, and your voice transcript.
            </p>
          </Card>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="yellow"
              shape="square"
              className="flex-1 !py-4"
              onClick={() => openDoctorView(navigate, savedCaseId)}
            >
              <Stethoscope className="h-5 w-5" strokeWidth={3} />
              Preview Doctor View
            </Button>
            <Button variant="outline" shape="square" className="flex-1 !py-4" onClick={handleNewCall}>
              Start New Call
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bauhaus-section bg-background dot-grid">
      <div className="bauhaus-container mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <p className="bauhaus-label text-bauhaus-red">Eye Clinic · 2–3 Min Intake</p>
          <h1 className="bauhaus-heading mt-2 text-4xl sm:text-5xl">Call with Rakshak</h1>
          <p className="mt-4 font-medium leading-relaxed text-foreground/75">
            Ophthalmology voice intake for decreased vision and eye complaints. Rakshak asks structured
            questions — your doctor receives a standard clinical sheet in medical English.
            {IS_DEMO_MODE && (
              <span className="mt-2 block font-bold text-bauhaus-red">
                Public demo: tap Play Demo Intake below. Live mic + OpenAI voice on localhost only.
              </span>
            )}
          </p>
        </header>

        {modeError && (
          <div className="mb-6">
            <ErrorBanner message={modeError} onRetry={fetchMode} />
          </div>
        )}

        {canStart && !processing && (
          <Card decorationIndex={1} className="mb-6 !shadow-bauhaus">
            <p className="bauhaus-label mb-3 text-bauhaus-blue">Choose Language</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setLanguage(lang.id)}
                  className={`border-2 border-foreground p-3 text-left transition-all duration-200 ${
                    language === lang.id
                      ? "bg-bauhaus-yellow shadow-bauhaus"
                      : "bg-white hover:bg-muted"
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
            <LoadingSpinner label="Sending your details to the doctor…" />
          ) : (
            <>
              {isConversationActive && (
                <div className="mb-6 flex items-center justify-center gap-2 border-2 border-foreground bg-bauhaus-yellow px-4 py-2 shadow-bauhaus-sm">
                  <Clock className="h-4 w-4" strokeWidth={2.5} />
                  <span className="font-black tabular-nums">{formatTime(callSeconds)}</span>
                  <span className="text-xs font-bold uppercase text-foreground/60">
                    / {formatTime(MAX_CALL_SECONDS)} max
                  </span>
                </div>
              )}

              <ConversationStage
                connectionState={stageConnectionState}
                activeSpeaker={
                  IS_DEMO_MODE
                    ? demoConnectionState === "agent-speaking"
                      ? "agent"
                      : demoConnectionState === "user-speaking"
                        ? "user"
                        : null
                    : voice.activeSpeaker
                }
                messages={stageMessages}
                agentPartial={IS_DEMO_MODE ? "" : voice.agentPartial}
                error={IS_DEMO_MODE ? null : voice.error}
                videoStream={IS_DEMO_MODE ? null : voice.videoStream}
                videoRef={voice.videoRef}
              />

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                {canStart ? (
                  IS_DEMO_MODE ? (
                    <Button variant="red" shape="pill" onClick={runDemoIntake} className="!gap-2 !px-8">
                      <Play className="h-5 w-5" strokeWidth={3} />
                      Play Demo Intake
                    </Button>
                  ) : (
                    <Button variant="red" shape="pill" onClick={voice.start} className="!gap-2 !px-8">
                      <Phone className="h-5 w-5" strokeWidth={3} />
                      Start Call
                    </Button>
                  )
                ) : (
                  !IS_DEMO_MODE && (
                    <Button
                      variant="outline"
                      shape="pill"
                      onClick={voice.stop}
                      disabled={voice.connectionState === "wrapping-up"}
                      className="!gap-2 !px-8"
                    >
                      <PhoneOff className="h-5 w-5" strokeWidth={3} />
                      {voice.connectionState === "wrapping-up" ? "Sending…" : "End Call"}
                    </Button>
                  )
                )}
              </div>

              {isConversationActive && (
                <p className="mt-4 text-center text-xs font-medium text-foreground/50">
                  Quick 2–3 minute intake. Rakshak will wrap up and send your details to the doctor.
                </p>
              )}
            </>
          )}
        </Card>

        {processError && !processing && (
          <div className="mt-4">
            <ErrorBanner message={processError} />
          </div>
        )}
      </div>
    </div>
  );
}
