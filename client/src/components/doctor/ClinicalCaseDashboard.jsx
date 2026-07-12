import {
  AlertTriangle,
  Activity,
  Brain,
  Eye,
  FlaskConical,
  MessageSquare,
  Scan,
  Stethoscope,
} from "lucide-react";
import UrgencyBadge from "../UrgencyBadge.jsx";
import Card from "../ui/Card.jsx";
import { ImagingThumbnail } from "./MedicalImaging.jsx";
import { parseTranscriptLines } from "../../utils/parseTranscript.js";

const ASSOC_LABELS = {
  pain: "Ocular Pain",
  redness: "Conjunctival Injection / Redness",
  watering_discharge: "Lacrimation / Discharge",
  flashes_floaters: "Photopsia / Floaters",
};

export default function ClinicalCaseDashboard({ caseData, compact = false }) {
  const { brief, reports = {}, transcript = "", patientSnapshot, visualObservation } = caseData;
  const { vitals = {}, labs = [], imaging = [], aiInsight = "" } = reports;
  const conversation = parseTranscriptLines(transcript);
  const assoc = brief.associated_symptoms || {};
  const highlights = brief.highlight_points || brief.red_flags || [];

  return (
    <div className="space-y-4">
      {/* DO NOT MISS — critical highlights */}
      {highlights.length > 0 && (
        <div className="border-4 border-bauhaus-red bg-bauhaus-red text-white shadow-bauhaus-lg">
          <div className="flex items-center gap-3 border-b-4 border-white/20 px-5 py-3">
            <AlertTriangle className="h-6 w-6 shrink-0 text-bauhaus-yellow" strokeWidth={2.5} />
            <div>
              <p className="font-black uppercase tracking-widest text-bauhaus-yellow">Do Not Miss</p>
              <p className="text-xs font-medium text-white/70">Critical clinical highlights for physician review</p>
            </div>
          </div>
          <ul className="space-y-2 px-5 py-4">
            {highlights.map((point, i) => (
              <li key={i} className="flex gap-3 font-bold leading-snug">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-bauhaus-yellow text-xs font-black text-foreground">
                  {i + 1}
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Patient header */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card decorationIndex={0} className="!bg-foreground !text-white !shadow-bauhaus-lg lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="bauhaus-label text-bauhaus-yellow">Ophthalmology Intake Sheet</p>
              <h2 className="bauhaus-heading mt-1 text-3xl sm:text-4xl">{caseData.patientName}</h2>
              <p className="mt-1 font-bold text-white/80">
                {caseData.patientAge != null ? `${caseData.patientAge} y/o · ` : ""}
                MRN: {caseData.id?.slice(0, 8).toUpperCase()}
              </p>
              <p className="mt-2 text-sm font-medium text-white/60">
                Intake: {new Date(caseData.createdAt).toLocaleString()} · Status: {caseData.status}
              </p>
            </div>
            <UrgencyBadge level={brief.urgency_level} />
          </div>
        </Card>

        <Card decorationIndex={1} className="!shadow-bauhaus-lg">
          {patientSnapshot && (
            <div className="mb-4">
              <p className="bauhaus-label mb-2 text-bauhaus-blue">External Examination Capture</p>
              <div className="overflow-hidden border-2 border-foreground">
                <img src={patientSnapshot} alt="Patient capture" className="aspect-[4/3] w-full object-cover" />
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <Brain className="h-6 w-6 shrink-0 text-bauhaus-blue" strokeWidth={2.5} />
            <div>
              <p className="bauhaus-label text-bauhaus-red">AI Triage Assessment</p>
              <p className="mt-2 font-bold leading-relaxed">{aiInsight || brief.recommended_action}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Standard ophthalmology sheet */}
      <div className={`grid gap-4 ${compact ? "md:grid-cols-1" : "lg:grid-cols-2"}`}>
        <SheetSection title="Chief Complaint (CC)" icon={Eye} accent="bg-bauhaus-red">
          <Field label="Presenting Complaint" value={brief.chief_complaint} highlight />
          <Field label="Category / Type" value={brief.complaint_category || brief.chief_complaint} />
          <Field label="Duration" value={brief.symptom_duration} />
          <Field label="Severity" value={brief.severity?.toUpperCase()} />
        </SheetSection>

        <SheetSection title="History of Present Illness (HPI)" icon={Stethoscope} accent="bg-bauhaus-blue">
          <p className="font-medium leading-relaxed">{brief.clinical_summary}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Field label="Onset" value={brief.onset_type || "—"} />
            <Field label="Mechanism" value={brief.onset_context || "—"} />
          </div>
          {brief.onset_details && (
            <Field label="Onset Details" value={brief.onset_details} className="mt-2" />
          )}
        </SheetSection>

        <SheetSection title="Associated Symptoms" icon={Eye} accent="bg-bauhaus-yellow">
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(ASSOC_LABELS).map(([key, label]) => (
              <SymptomFlag key={key} label={label} present={assoc[key]} />
            ))}
          </div>
          {brief.symptoms?.length > 0 && (
            <div className="mt-4 border-t-2 border-foreground/10 pt-3">
              <p className="bauhaus-label text-foreground/50">Additional Symptoms</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {brief.symptoms.map((s, i) => (
                  <span key={i} className="border border-foreground bg-muted px-2 py-0.5 text-xs font-bold uppercase">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </SheetSection>

        <SheetSection title="Past Ocular History (POH)" icon={Eye} accent="bg-bauhaus-blue">
          <Field label="Prior Ophthalmic Care (this complaint)" value={brief.prior_ophthalmic_care || "None reported"} />
          <Field label="Past Ocular Treatment / Surgery" value={brief.past_ocular_treatment || "None reported"} className="mt-3" />
        </SheetSection>

        <SheetSection title="Systemic Disease" icon={Activity} accent="bg-bauhaus-red">
          <TagList items={brief.systemic_illness} empty="No systemic illness reported" />
          <div className="mt-4 border-t-2 border-foreground/10 pt-3">
            <p className="bauhaus-label text-foreground/50">Comorbidities / PMH</p>
            <TagList items={brief.medical_history} empty="None reported" className="mt-2" />
          </div>
        </SheetSection>

        <SheetSection title="Differential Diagnosis (DDx)" icon={Brain} accent="bg-bauhaus-yellow">
          {brief.differential_diagnosis?.length ? (
            <ol className="space-y-2">
              {brief.differential_diagnosis.map((dx, i) => (
                <li key={i} className="flex gap-2 font-bold">
                  <span className="text-bauhaus-red">{i + 1}.</span>
                  {dx}
                </li>
              ))}
            </ol>
          ) : (
            <p className="font-medium text-foreground/50">Pending clinical examination</p>
          )}
          <div className="mt-4 border-t-2 border-foreground/10 pt-3">
            <p className="bauhaus-label text-foreground/50">Recommended Plan</p>
            <p className="mt-1 font-black text-bauhaus-red">{brief.recommended_action}</p>
          </div>
        </SheetSection>
      </div>

      {/* Investigations row */}
      <div className={`grid gap-4 ${compact ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3"}`}>
        <DashboardBox title="Ocular Imaging" icon={Scan} accent="bg-bauhaus-yellow">
          <div className="grid grid-cols-2 gap-3">
            {imaging.slice(0, 2).map((img) => (
              <div key={img.id} className="overflow-hidden border-2 border-foreground">
                <div className="relative h-28 bg-[#0a1628] p-1">
                  <ImagingThumbnail type={img.type} />
                </div>
                <div className="border-t-2 border-foreground bg-white p-2">
                  <p className="text-[10px] font-black uppercase">{img.type}</p>
                  <p className="text-[9px] font-medium text-foreground/60">{img.finding}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardBox>

        <DashboardBox title="Laboratory" icon={FlaskConical} accent="bg-bauhaus-blue">
          <div className="space-y-2">
            {labs.slice(0, 5).map((lab) => (
              <div key={lab.name} className="flex items-center justify-between border-b border-foreground/10 py-1.5 text-sm">
                <span className="font-bold">{lab.name}</span>
                <span className="font-black">{lab.value} {lab.unit}</span>
              </div>
            ))}
          </div>
        </DashboardBox>

        <DashboardBox title="Vitals" icon={Activity} accent="bg-bauhaus-red">
          <div className="grid grid-cols-2 gap-2 text-center">
            {[
              { label: "BP", value: vitals.bp },
              { label: "HR", value: vitals.hr ? `${vitals.hr}` : "—" },
              { label: "Temp", value: vitals.temp },
              { label: "SpO₂", value: vitals.spo2 },
            ].map(({ label, value }) => (
              <div key={label} className="border-2 border-foreground bg-muted p-2">
                <p className="text-[9px] font-bold uppercase text-foreground/50">{label}</p>
                <p className="font-black">{value || "—"}</p>
              </div>
            ))}
          </div>
        </DashboardBox>
      </div>

      {/* Medications + transcript */}
      <div className="grid gap-4 lg:grid-cols-3">
        <TagPanel title="Current Medications" items={brief.current_medications} empty="None" />
        <TagPanel title="Allergies" items={brief.allergies} empty="NKDA" />
        <TagPanel title="Red Flags" items={brief.red_flags} empty="None identified" variant="danger" />
      </div>

      <DashboardBox title="Voice Intake Transcript" icon={MessageSquare} accent="bg-bauhaus-yellow">
        {conversation.length === 0 ? (
          <p className="font-medium text-foreground/50">No transcript captured.</p>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {conversation.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[90%] border-2 border-foreground px-3 py-2 text-sm ${
                    msg.role === "user" ? "bg-bauhaus-yellow" : "bg-bauhaus-blue text-white"
                  }`}
                >
                  <p className="text-[9px] font-bold uppercase opacity-60">
                    {msg.role === "user" ? "Patient" : "Rakshak"}
                  </p>
                  <p className="mt-0.5 font-medium">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardBox>
    </div>
  );
}

function SheetSection({ title, icon: Icon, accent, children }) {
  const iconColor = accent.includes("yellow") ? "text-foreground" : "text-white";
  return (
    <Card decorationIndex={0} className="!shadow-bauhaus-lg">
      <div className="mb-4 flex items-center gap-3 border-b-2 border-foreground pb-3">
        <div className={`flex h-10 w-10 items-center justify-center border-2 border-foreground ${accent}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} strokeWidth={2.5} />
        </div>
        <p className="font-black uppercase tracking-tight">{title}</p>
      </div>
      {children}
    </Card>
  );
}

function Field({ label, value, highlight, className = "" }) {
  return (
    <div className={className}>
      <p className="bauhaus-label text-foreground/50">{label}</p>
      <p className={`mt-0.5 font-bold ${highlight ? "text-lg text-bauhaus-red" : ""}`}>{value || "—"}</p>
    </div>
  );
}

function SymptomFlag({ label, present }) {
  return (
    <div
      className={`flex items-center justify-between border-2 border-foreground px-3 py-2 ${
        present ? "bg-bauhaus-red text-white" : "bg-muted"
      }`}
    >
      <span className="text-xs font-bold">{label}</span>
      <span className="font-black uppercase">{present ? "Yes" : "No"}</span>
    </div>
  );
}

function DashboardBox({ title, icon: Icon, accent, children, className = "" }) {
  const iconColor = accent.includes("yellow") ? "text-foreground" : "text-white";
  return (
    <Card decorationIndex={0} className={`!shadow-bauhaus-lg ${className}`}>
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center border-2 border-foreground ${accent}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} strokeWidth={2.5} />
        </div>
        <p className="font-black uppercase tracking-tight">{title}</p>
      </div>
      {children}
    </Card>
  );
}

function TagPanel({ title, items, empty = "None", variant }) {
  return (
    <div className={`border-2 border-foreground bg-white p-4 shadow-bauhaus ${variant === "danger" ? "border-bauhaus-red" : ""}`}>
      <p className="bauhaus-label text-foreground/50">{title}</p>
      {items?.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <span
              key={i}
              className={`border border-foreground px-2 py-0.5 text-xs font-bold uppercase ${
                variant === "danger" ? "bg-bauhaus-red text-white" : "bg-muted"
              }`}
            >
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm font-medium text-foreground/40">{empty}</p>
      )}
    </div>
  );
}

function TagList({ items, empty, className = "" }) {
  if (!items?.length) return <p className={`text-sm font-medium text-foreground/40 ${className}`}>{empty}</p>;
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {items.map((item, i) => (
        <span key={i} className="border border-foreground bg-bauhaus-yellow px-2 py-0.5 text-xs font-bold uppercase">
          {item}
        </span>
      ))}
    </div>
  );
}
