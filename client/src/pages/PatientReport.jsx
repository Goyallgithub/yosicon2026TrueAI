import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Stethoscope, CheckCircle, ArrowRight } from "lucide-react";
import { apiCall } from "../api/client.js";
import { useAppStore } from "../store/useAppStore.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import UrgencyBadge from "../components/UrgencyBadge.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";

export default function PatientReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const openDoctorView = useAppStore((s) => s.openDoctorView);
  const setCurrentCaseId = useAppStore((s) => s.setCurrentCaseId);
  const [state, setState] = useState("loading");
  const [caseData, setCaseData] = useState(null);
  const [error, setError] = useState(null);

  const fetchCase = useCallback(async () => {
    try {
      setState("loading");
      setError(null);
      const { data } = await apiCall(`/api/cases/${id}`);
      setCaseData(data);
      setCurrentCaseId(data.id);
      setState("success");
    } catch (err) {
      setError(err.message);
      setState("error");
    }
  }, [id, setCurrentCaseId]);

  useEffect(() => {
    fetchCase();
  }, [fetchCase]);

  if (state === "loading") {
    return (
      <div className="bauhaus-container px-4 py-12">
        <LoadingSpinner label="Loading report…" />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="bauhaus-container px-4 py-12">
        <ErrorBanner message={error} onRetry={fetchCase} />
      </div>
    );
  }

  const { brief } = caseData;

  return (
    <div className="bauhaus-section bg-background">
      <div className="bauhaus-container mx-auto max-w-2xl">
        {/* Handoff success banner */}
        <Card decorationIndex={1} className="mb-6 !border-bauhaus-blue !bg-bauhaus-blue !text-white !shadow-bauhaus-lg">
          <div className="flex items-start gap-4">
            <CheckCircle className="h-10 w-10 shrink-0 text-bauhaus-yellow" strokeWidth={2.5} />
            <div>
              <p className="bauhaus-label text-bauhaus-yellow">Sent to Doctor</p>
              <h1 className="bauhaus-heading mt-1 text-3xl sm:text-4xl">Intake Complete</h1>
              <p className="mt-2 font-medium text-white/80">
                Your voice conversation was parsed into a clinical brief with imaging, labs, and
                vitals — ready for physician review.
              </p>
            </div>
          </div>
        </Card>

        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="bauhaus-label text-bauhaus-blue">Your Brief</p>
            <h2 className="text-2xl font-black uppercase">{brief.patient_name || "Patient"}</h2>
            <p className="font-medium text-foreground/70">{brief.chief_complaint}</p>
          </div>
          <UrgencyBadge level={brief.urgency_level} />
        </div>

        <Card decorationIndex={0} className="mb-6 !shadow-bauhaus">
          <p className="bauhaus-label text-bauhaus-red">Clinical Summary</p>
          <p className="mt-2 font-medium leading-relaxed">{brief.clinical_summary}</p>
          <p className="mt-3 font-bold text-bauhaus-blue">{brief.recommended_action}</p>
        </Card>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="red"
            shape="square"
            className="flex-1 !py-4"
            onClick={() => openDoctorView(navigate, caseData.id)}
          >
            <Stethoscope className="h-5 w-5" strokeWidth={3} />
            Open Doctor Dashboard
            <ArrowRight className="h-5 w-5" strokeWidth={3} />
          </Button>
          <Button variant="outline" shape="square" as={Link} to="/patient/talk" className="!py-4">
            New Intake
          </Button>
        </div>
      </div>
    </div>
  );
}
