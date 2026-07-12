import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Pill, AlertCircle, Calendar, Stethoscope, ArrowLeft } from "lucide-react";
import { apiCall } from "../api/client.js";
import { useAppStore } from "../store/useAppStore.js";
import { buildPatientPrescription, DEMO_PATIENT_PRESCRIPTION } from "../utils/buildPatientPrescription.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";

export default function PatientPrescription() {
  const { id: paramId } = useParams();
  const currentCaseId = useAppStore((s) => s.currentCaseId);
  const caseId = paramId || currentCaseId;
  const [state, setState] = useState("loading");
  const [prescription, setPrescription] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!caseId) {
      setPrescription(DEMO_PATIENT_PRESCRIPTION);
      setState("success");
      return;
    }
    try {
      setState("loading");
      const { data } = await apiCall(`/api/cases/${caseId}`);
      setPrescription(buildPatientPrescription(data));
      setState("success");
    } catch {
      setPrescription(DEMO_PATIENT_PRESCRIPTION);
      setState("success");
    }
  }, [caseId]);

  useEffect(() => {
    load();
  }, [load]);

  if (state === "loading") {
    return (
      <div className="bauhaus-container px-4 py-12">
        <LoadingSpinner label="Loading your report…" />
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="bauhaus-container px-4 py-12">
        <ErrorBanner message={error || "Report not found"} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="bauhaus-section bg-background dot-grid min-h-screen">
      <div className="bauhaus-container mx-auto max-w-2xl pb-12">
        <Link
          to="/patient/talk"
          className="mb-6 inline-flex items-center gap-2 font-bold uppercase tracking-wider text-foreground/60 hover:text-bauhaus-red"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={3} />
          Back to Intake
        </Link>

        <Card decorationIndex={1} className="mb-6 !bg-bauhaus-blue !text-white !shadow-bauhaus-lg">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="bauhaus-label text-bauhaus-yellow">Doctor ne bheja · Your Eye Report</p>
              <h1 className="bauhaus-heading mt-1 text-3xl sm:text-4xl">{prescription.patientName}</h1>
              <p className="mt-2 text-sm font-medium text-white/70">
                Date: {prescription.date} · {prescription.doctorName}
              </p>
            </div>
            <div className="border-2 border-bauhaus-yellow bg-bauhaus-yellow px-3 py-2 text-center text-foreground">
              <Pill className="mx-auto h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card decorationIndex={0} className="mb-6 !shadow-bauhaus">
          <p className="bauhaus-label text-bauhaus-red">Kya problem hai (Simple)</p>
          <p className="mt-2 text-lg font-bold leading-relaxed">{prescription.diagnosis_simple}</p>
        </Card>

        <div className="mb-6">
          <p className="bauhaus-label mb-4 text-bauhaus-blue">Dawai kaise leni hai · Medicines</p>
          <div className="space-y-4">
            {prescription.medicines.map((med, index) => (
              <Card key={med.id} decorationIndex={index % 3} className="!shadow-bauhaus">
                <div className="flex gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-foreground bg-bauhaus-red text-xl font-black text-white">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-black uppercase tracking-tight">{med.name}</p>
                    <p className="text-xs font-bold text-bauhaus-blue">{med.form}</p>
                  </div>
                </div>
                <div className="mt-4 border-2 border-foreground bg-muted p-4">
                  <p className="bauhaus-label text-foreground/50">Kaise leni hai</p>
                  <p className="mt-1 text-lg font-black text-bauhaus-red">{med.instruction}</p>
                  {med.voiceScript && (
                    <p className="mt-2 text-sm font-medium leading-relaxed text-foreground/70">{med.voiceScript}</p>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {med.timing.map((t, i) => (
                    <span key={i} className="border border-foreground bg-bauhaus-yellow px-2 py-0.5 text-xs font-bold">
                      {t}
                    </span>
                  ))}
                  <span className="border border-foreground bg-white px-2 py-0.5 text-xs font-bold">
                    {med.duration}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card decorationIndex={2} className="mb-6 !shadow-bauhaus">
          <p className="font-black uppercase">Savdhani · Precautions</p>
          <ul className="mt-3 space-y-2">
            {prescription.precautions.map((p, i) => (
              <li key={i} className="flex gap-2 font-medium">
                <span className="font-black text-bauhaus-red">{i + 1}.</span>
                {p}
              </li>
            ))}
          </ul>
        </Card>

        <Card decorationIndex={0} className="mb-8 !border-bauhaus-yellow !bg-bauhaus-yellow !shadow-bauhaus-lg">
          <div className="flex items-start gap-3">
            <Calendar className="h-6 w-6 shrink-0" />
            <div>
              <p className="font-black uppercase">Follow-up</p>
              <p className="mt-2 font-bold leading-relaxed">{prescription.followUp}</p>
            </div>
          </div>
        </Card>

        <Button variant="blue" shape="square" as={Link} to="/patient/talk" className="w-full !py-4">
          <Stethoscope className="h-5 w-5" />
          Naya Intake
        </Button>
      </div>
    </div>
  );
}
