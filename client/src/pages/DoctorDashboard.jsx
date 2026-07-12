import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, ArrowRight, Activity, AlertTriangle, Users, FileText } from "lucide-react";
import { apiCall } from "../api/client.js";
import { useAppStore } from "../store/useAppStore.js";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import ErrorBanner from "../components/ErrorBanner.jsx";
import UrgencyBadge from "../components/UrgencyBadge.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import { ImagingThumbnail } from "../components/doctor/MedicalImaging.jsx";

export default function DoctorDashboard() {
  const setCases = useAppStore((s) => s.setCases);
  const currentCaseId = useAppStore((s) => s.currentCaseId);
  const [state, setState] = useState("loading");
  const [cases, setLocalCases] = useState([]);
  const [error, setError] = useState(null);

  const fetchCases = useCallback(async () => {
    try {
      setState("loading");
      setError(null);
      const { data } = await apiCall("/api/cases");
      setLocalCases(data);
      setCases(data);
      setState("success");
    } catch (err) {
      setError(err.message);
      setState("error");
    }
  }, [setCases]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  if (state === "loading") {
    return (
      <div className="bauhaus-container px-4 py-12">
        <LoadingSpinner label="Loading clinical dashboard…" />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="bauhaus-container px-4 py-12">
        <ErrorBanner message={error} onRetry={fetchCases} />
      </div>
    );
  }

  const emergency = cases.filter((c) => c.brief?.urgency_level === "emergency").length;
  const urgent = cases.filter((c) => c.brief?.urgency_level === "urgent").length;
  const pending = cases.filter((c) => c.status === "pending").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero header */}
      <section className="border-b-4 border-foreground bg-foreground py-10 text-white">
        <div className="bauhaus-container px-4 sm:px-6 lg:px-8">
          <p className="bauhaus-label text-bauhaus-yellow">Clinical Command Center</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="bauhaus-heading text-4xl sm:text-5xl lg:text-7xl">
                Physician
                <br />
                <span className="text-bauhaus-blue">Dashboard</span>
              </h1>
              <p className="mt-3 max-w-xl font-medium text-white/70">
                AI-triaged patient cases with imaging, labs, vitals, and voice intake transcripts —
                all in one view.
              </p>
            </div>
            <Button variant="yellow" shape="square" onClick={fetchCases}>
              <RefreshCw className="h-4 w-4" strokeWidth={3} />
              Refresh
            </Button>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b-4 border-foreground bg-bauhaus-yellow">
        <div className="bauhaus-container grid divide-y-2 divide-foreground sm:grid-cols-4 sm:divide-x-2 sm:divide-y-0">
          {[
            { icon: Users, value: cases.length, label: "Total Cases", color: "text-foreground" },
            { icon: AlertTriangle, value: emergency, label: "Emergency", color: "text-bauhaus-red" },
            { icon: Activity, value: urgent, label: "Urgent", color: "text-bauhaus-blue" },
            { icon: FileText, value: pending, label: "Pending Review", color: "text-foreground" },
          ].map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="flex items-center gap-4 px-6 py-6">
              <div className="flex h-12 w-12 items-center justify-center border-2 border-foreground bg-white shadow-bauhaus">
                <Icon className={`h-6 w-6 ${color}`} strokeWidth={2.5} />
              </div>
              <div>
                <p className={`bauhaus-heading text-3xl ${color}`}>{value}</p>
                <p className="bauhaus-label text-foreground/60">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Case cards with imaging previews */}
      <section className="bauhaus-section dot-grid">
        <div className="bauhaus-container">
          <p className="bauhaus-label mb-6 text-bauhaus-red">Patient Queue · Urgency First</p>
          <div className="grid gap-6 lg:grid-cols-2">
            {cases.map((c, i) => {
              const reports = c.reports || {};
              const primaryImage = reports.imaging?.[0];
              const eyeImage = reports.imaging?.find((img) =>
                img.type?.toLowerCase().includes("eye") ||
                img.type?.toLowerCase().includes("retinal") ||
                img.modality?.toLowerCase().includes("ophthalm")
              );

              return (
                <Link key={c.id} to={`/doctor/case/${c.id}`} className="group block">
                  <Card
                    decorationIndex={i % 3}
                    className={`!p-0 overflow-hidden !shadow-bauhaus-lg transition-all duration-200 group-hover:!-translate-y-2 ${
                      c.id === currentCaseId ? "!ring-4 !ring-bauhaus-yellow" : ""
                    }`}
                  >
                    <div className="grid sm:grid-cols-5">
                      {/* Imaging preview column */}
                      <div className="relative col-span-2 min-h-[160px] border-b-2 border-foreground bg-[#0a1628] sm:border-b-0 sm:border-r-2 lg:border-r-4">
                        <div className="absolute inset-0 p-2">
                          <ImagingThumbnail type={eyeImage?.type || primaryImage?.type || "xray"} />
                        </div>
                        <div className="absolute inset-0 overflow-hidden opacity-20">
                          <div className="animate-scan-line h-1 w-full bg-bauhaus-blue" />
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 flex gap-1">
                          {(reports.imaging || []).slice(0, 2).map((img) => (
                            <span
                              key={img.id}
                              className="bauhaus-label bg-black/70 px-1.5 py-0.5 text-[9px] text-white"
                            >
                              {img.modality}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Case info */}
                      <div className="col-span-3 p-5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">
                              {c.patientName}
                              {c.patientAge != null && (
                                <span className="ml-1 text-sm text-foreground/40">{c.patientAge}Y</span>
                              )}
                              {c.id === currentCaseId && (
                                <span className="ml-2 text-xs font-bold text-bauhaus-red">NEW</span>
                              )}
                            </h2>
                            <p className="mt-1 font-bold text-bauhaus-blue">{c.brief?.chief_complaint}</p>
                          </div>
                          <UrgencyBadge level={c.brief?.urgency_level} />
                        </div>

                        <p className="mt-2 line-clamp-2 text-sm font-medium text-foreground/65">
                          {c.brief?.clinical_summary}
                        </p>

                        {/* Mini vitals row */}
                        {reports.vitals && (
                          <div className="mt-3 grid grid-cols-3 gap-2 border-t-2 border-foreground/10 pt-3">
                            {[
                              { k: "BP", v: reports.vitals.bp },
                              { k: "HR", v: reports.vitals.hr },
                              { k: "SpO₂", v: reports.vitals.spo2 },
                            ].map(({ k, v }) => (
                              <div key={k} className="text-center">
                                <p className="text-[10px] font-bold uppercase text-foreground/40">{k}</p>
                                <p className="text-xs font-black">{v}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-3 flex items-center justify-between">
                          <span className="bauhaus-label text-foreground/40">{c.status}</span>
                          <span className="flex items-center gap-1 text-xs font-bold uppercase text-bauhaus-red group-hover:gap-2 transition-all">
                            View Full Report <ArrowRight className="h-4 w-4" strokeWidth={3} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
