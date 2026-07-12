import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Bot,
  Eye,
  FileText,
  Mic,
  MicOff,
  Search,
  Sparkles,
  User,
  Volume2,
  VolumeX,
} from "lucide-react";
import { EMR_PATIENTS } from "../data/emrPatients.js";
import { apiCall, apiCallBlob, IS_DEMO_MODE } from "../api/client.js";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";

const URGENCY_COLORS = {
  emergency: "bg-bauhaus-red text-white",
  urgent: "bg-bauhaus-yellow text-foreground",
  routine: "bg-bauhaus-blue text-white",
};

export default function EMR() {
  const [selectedId, setSelectedId] = useState(EMR_PATIENTS[0].id);
  const [search, setSearch] = useState("");
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);

  const patient = EMR_PATIENTS.find((p) => p.id === selectedId) || EMR_PATIENTS[0];

  const filtered = EMR_PATIENTS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.mrn.toLowerCase().includes(search.toLowerCase()) ||
      p.chiefComplaint.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setAiMessages([
      {
        role: "assistant",
        text: `Ready to assist with ${patient.name}'s chart (${patient.mrn}). Ask about CC, DDx, investigations, or pre-consultation summary.`,
      },
    ]);
  }, [selectedId, patient.name, patient.mrn]);

  const speakText = useCallback(async (text) => {
    if (!text?.trim()) return;
    if (IS_DEMO_MODE && "speechSynthesis" in window) {
      setSpeaking(true);
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1;
      utter.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utter);
      return;
    }
    try {
      setSpeaking(true);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      const blob = await apiCallBlob("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setSpeaking(false);
      };
      await audio.play();
    } catch {
      setSpeaking(false);
    }
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setAiInput((prev) => prev + " [Voice not supported in this browser]");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript;
      if (transcript) setAiInput(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const sendAiMessage = async (text) => {
    const msg = text?.trim() || aiInput.trim();
    if (!msg || aiLoading) return;

    setAiInput("");
    setAiMessages((prev) => [...prev, { role: "user", text: msg }]);
    setAiLoading(true);

    try {
      const { reply } = await apiCall("/api/emr-assist", {
        method: "POST",
        body: JSON.stringify({ message: msg, patientContext: patient }),
      });
      setAiMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch (err) {
      setAiMessages((prev) => [...prev, { role: "assistant", text: `Error: ${err.message}` }]);
    } finally {
      setAiLoading(false);
    }
  };

  const quickPrompts = [
    "Summarize CC and HPI for consultation",
    "What are the do-not-miss findings?",
    "Suggest DDx and workup plan",
    "Draft pre-consultation note for physician",
  ];

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* EMR Header */}
      <header className="border-b-4 border-foreground bg-foreground text-white">
        <div className="bauhaus-container flex flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="bauhaus-label text-bauhaus-yellow">Ophthalmology EMR</p>
            <h1 className="bauhaus-heading text-3xl sm:text-4xl">
              TrueComplaint <span className="text-bauhaus-blue">Clinical Records</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 border-2 border-white/20 bg-white/10 px-4 py-2">
            <Eye className="h-5 w-5 text-bauhaus-yellow" />
            <span className="font-bold">{EMR_PATIENTS.length} Active Patients</span>
          </div>
        </div>
      </header>

      <div className="bauhaus-container grid gap-4 px-4 py-6 lg:grid-cols-12 lg:px-8">
        {/* Patient list sidebar */}
        <aside className="lg:col-span-3">
          <Card decorationIndex={1} className="!p-0 !shadow-bauhaus-lg overflow-hidden">
            <div className="border-b-2 border-foreground bg-bauhaus-blue p-4 text-white">
              <p className="font-black uppercase tracking-tight">Patient Registry</p>
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                <input
                  type="text"
                  placeholder="Search MRN, name, CC…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border-2 border-white/30 bg-white/10 py-2 pl-9 pr-3 text-sm font-medium text-white placeholder:text-white/50 focus:border-bauhaus-yellow focus:outline-none"
                />
              </div>
            </div>
            <ul className="max-h-[520px] overflow-y-auto">
              {filtered.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(p.id)}
                    className={`w-full border-b border-foreground/10 p-4 text-left transition-colors ${
                      selectedId === p.id ? "bg-bauhaus-yellow" : "hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-black">{p.name}</p>
                        <p className="text-xs font-bold text-foreground/60">{p.mrn} · {p.age}y {p.sex}</p>
                      </div>
                      <span className={`shrink-0 px-1.5 py-0.5 text-[9px] font-black uppercase ${URGENCY_COLORS[p.urgency]}`}>
                        {p.urgency}
                      </span>
                    </div>
                    <p className="mt-2 text-xs font-medium leading-snug text-foreground/70">{p.chiefComplaint}</p>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </aside>

        {/* Main chart */}
        <main className="lg:col-span-5 space-y-4">
          {/* Do not miss */}
          <div className="border-4 border-bauhaus-red bg-bauhaus-red text-white shadow-bauhaus-lg">
            <div className="flex items-center gap-2 border-b-2 border-white/20 px-4 py-2">
              <AlertTriangle className="h-5 w-5 text-bauhaus-yellow" />
              <span className="font-black uppercase tracking-widest">Do Not Miss</span>
            </div>
            <ul className="space-y-1.5 px-4 py-3">
              {patient.highlightPoints.map((pt, i) => (
                <li key={i} className="flex gap-2 text-sm font-bold">
                  <span className="text-bauhaus-yellow">{i + 1}.</span> {pt}
                </li>
              ))}
            </ul>
          </div>

          <Card decorationIndex={0} className="!shadow-bauhaus-lg">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-foreground pb-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center border-4 border-foreground bg-bauhaus-blue">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="bauhaus-heading text-2xl">{patient.name}</h2>
                  <p className="font-bold text-foreground/70">
                    {patient.mrn} · {patient.age}y · {patient.sex} · {patient.bloodGroup}
                  </p>
                  <p className="text-sm font-medium text-foreground/50">Last visit: {patient.lastVisit}</p>
                </div>
              </div>
              <span className={`px-3 py-1 font-black uppercase ${URGENCY_COLORS[patient.urgency]}`}>
                {patient.urgency}
              </span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <ChartBlock title="Chief Complaint (CC)" accent="border-bauhaus-red">
                <p className="font-black text-bauhaus-red">{patient.brief.chief_complaint}</p>
                <p className="mt-1 text-xs font-bold uppercase text-foreground/50">{patient.brief.complaint_category}</p>
              </ChartBlock>
              <ChartBlock title="Working Diagnosis" accent="border-bauhaus-blue">
                <p className="font-bold">{patient.diagnosis}</p>
              </ChartBlock>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <ChartBlock title="HPI / Onset">
                <p className="text-sm font-medium">{patient.brief.onset_details}</p>
                <p className="mt-2 text-xs font-bold">Onset: {patient.brief.onset_type} · {patient.brief.onset_context}</p>
              </ChartBlock>
              <ChartBlock title="Associated Symptoms">
                <div className="grid grid-cols-2 gap-1 text-xs font-bold">
                  {Object.entries(patient.brief.associated_symptoms).map(([k, v]) => (
                    <span key={k} className={v ? "text-bauhaus-red" : "text-foreground/40"}>
                      {k.replace(/_/g, " ")}: {v ? "Yes" : "No"}
                    </span>
                  ))}
                </div>
              </ChartBlock>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <ChartBlock title="POH">
                <p className="text-sm font-medium">{patient.brief.past_ocular_treatment}</p>
                <p className="mt-1 text-sm font-medium text-foreground/70">{patient.brief.prior_ophthalmic_care}</p>
              </ChartBlock>
              <ChartBlock title="Systemic Disease">
                <TagRow items={patient.brief.systemic_illness} empty="None" />
              </ChartBlock>
            </div>

            <div className="mt-4">
              <ChartBlock title="Differential Diagnosis (DDx)">
                <ol className="list-decimal pl-4 text-sm font-bold">
                  {patient.brief.differential_diagnosis.map((dx, i) => (
                    <li key={i}>{dx}</li>
                  ))}
                </ol>
              </ChartBlock>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <MiniStat label="VA OD" value={patient.investigations.va.od} />
              <MiniStat label="VA OS" value={patient.investigations.va.os} />
              <MiniStat label="IOP OD/OS" value={`${patient.investigations.iop.od}/${patient.investigations.iop.os}`} />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <ChartBlock title="Medications">
                <TagRow items={patient.medications} />
              </ChartBlock>
              <ChartBlock title="Allergies">
                <TagRow items={patient.allergies} variant="danger" />
              </ChartBlock>
            </div>

            <div className="mt-4">
              <ChartBlock title="Visit History">
                {patient.visits.map((v, i) => (
                  <div key={i} className="border-b border-foreground/10 py-2 last:border-0">
                    <p className="text-xs font-black uppercase text-bauhaus-blue">{v.date} · {v.type}</p>
                    <p className="mt-0.5 text-sm font-medium">{v.note}</p>
                  </div>
                ))}
              </ChartBlock>
            </div>

            <div className="mt-4 border-2 border-bauhaus-red bg-bauhaus-red/5 p-3">
              <p className="bauhaus-label text-bauhaus-red">Recommended Plan</p>
              <p className="mt-1 font-bold">{patient.brief.recommended_action}</p>
            </div>
          </Card>
        </main>

        {/* AI Assistant panel */}
        <aside className="lg:col-span-4">
          <Card decorationIndex={2} className="!p-0 !shadow-bauhaus-lg overflow-hidden sticky top-4">
            <div className="border-b-2 border-foreground bg-foreground p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-bauhaus-yellow">
                  <Sparkles className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="font-black uppercase tracking-tight">AI Clinical Assistant</p>
                  <p className="text-xs font-medium text-white/60">Voice + text · Medical terminology</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-foreground/10 bg-muted p-3">
              {quickPrompts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendAiMessage(q)}
                  className="border border-foreground bg-white px-2 py-1 text-[10px] font-bold uppercase hover:bg-bauhaus-yellow"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="h-72 space-y-3 overflow-y-auto p-4">
              {aiMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[92%] border-2 border-foreground px-3 py-2 text-sm ${
                      msg.role === "user" ? "bg-bauhaus-blue text-white" : "bg-white"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase text-bauhaus-blue">
                          <Bot className="h-3 w-3" /> AI
                        </span>
                        <button
                          type="button"
                          onClick={() => speakText(msg.text)}
                          disabled={speaking}
                          className="text-foreground/50 hover:text-bauhaus-blue"
                          title="Read aloud"
                        >
                          {speaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    )}
                    <p className="font-medium leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex items-center gap-2 text-sm font-medium text-foreground/50">
                  <Bot className="h-4 w-4 animate-pulse" /> Analyzing chart…
                </div>
              )}
            </div>

            <div className="border-t-2 border-foreground p-3">
              <div className="flex gap-2">
                <textarea
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendAiMessage();
                    }
                  }}
                  placeholder="Ask about this patient… (medical terms)"
                  rows={2}
                  className="flex-1 resize-none border-2 border-foreground p-2 text-sm font-medium focus:border-bauhaus-blue focus:outline-none"
                />
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={listening ? stopListening : startListening}
                    className={`flex h-10 w-10 items-center justify-center border-2 border-foreground ${
                      listening ? "bg-bauhaus-red text-white animate-pulse" : "bg-bauhaus-yellow"
                    }`}
                    title={listening ? "Stop listening" : "Voice to text"}
                  >
                    {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                  <Button variant="blue" shape="square" onClick={() => sendAiMessage()} disabled={aiLoading} className="!h-10 !w-10 !p-0">
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-[10px] font-medium text-foreground/40">
                Mic = voice-to-text · Speaker icon = text-to-speech on AI replies
              </p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function ChartBlock({ title, children, accent = "border-foreground" }) {
  return (
    <div className={`border-l-4 ${accent} bg-muted/50 p-3`}>
      <p className="bauhaus-label text-foreground/50">{title}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function TagRow({ items, empty = "—", variant }) {
  if (!items?.length) return <p className="text-sm font-medium text-foreground/40">{empty}</p>;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item, i) => (
        <span
          key={i}
          className={`border border-foreground px-2 py-0.5 text-xs font-bold ${
            variant === "danger" ? "bg-bauhaus-red text-white" : "bg-white"
          }`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="border-2 border-foreground bg-white p-3 text-center shadow-bauhaus-sm">
      <p className="text-[9px] font-black uppercase text-foreground/50">{label}</p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}
