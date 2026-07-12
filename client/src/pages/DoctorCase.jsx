import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { apiCall } from "../api/client.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import Button from "../components/ui/Button.jsx";
import ClinicalCaseDashboard from "../components/doctor/ClinicalCaseDashboard.jsx";

export default function DoctorCase() {
  const { id } = useParams();
  const [state, setState] = useState("loading");
  const [caseData, setCaseData] = useState(null);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchCase = useCallback(async () => {
    try {
      setState("loading");
      setError(null);
      const { data } = await apiCall(`/api/cases/${id}`);
      setCaseData(data);
      setState("success");
    } catch (err) {
      setError(err.message);
      setState("error");
    }
  }, [id]);

  useEffect(() => {
    fetchCase();
  }, [fetchCase]);

  const markReviewed = async () => {
    try {
      setUpdating(true);
      const { data } = await apiCall(`/api/cases/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "reviewed" }),
      });
      setCaseData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (state === "loading") {
    return (
      <div className="bauhaus-container px-4 py-12">
        <LoadingSpinner label="Loading clinical record…" />
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

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b-4 border-foreground bg-foreground py-6 text-white">
        <div className="bauhaus-container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              to="/doctor/dashboard"
              className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-white/80 hover:text-bauhaus-yellow"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={3} />
              All Cases
            </Link>
            {caseData.status !== "reviewed" && (
              <Button
                variant="yellow"
                shape="square"
                onClick={markReviewed}
                disabled={updating}
                className="!text-xs"
              >
                {updating ? "Saving…" : "Mark Reviewed"}
              </Button>
            )}
          </div>
          <p className="bauhaus-label mt-4 text-bauhaus-yellow">Ophthalmology Clinical Dashboard</p>
          <h1 className="bauhaus-heading text-3xl sm:text-5xl">
            {caseData.patientName}
            <span className="text-bauhaus-blue">'s Record</span>
          </h1>
        </div>
      </section>

      <section className="bauhaus-section dot-grid">
        <div className="bauhaus-container">
          <ClinicalCaseDashboard caseData={caseData} />
        </div>
      </section>
    </div>
  );
}
