import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/layout/Navbar.jsx";
import DemoBanner from "./components/DemoBanner.jsx";
import Login, { RequireRole } from "./pages/Login.jsx";
import PatientTalk from "./pages/PatientTalk.jsx";
import PatientReport from "./pages/PatientReport.jsx";
import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import DoctorCase from "./pages/DoctorCase.jsx";
import PatientPrescription from "./pages/PatientPrescription.jsx";
import EMR from "./pages/EMR.jsx";

function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <DemoBanner />
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/patient/talk"
            element={
              <RequireRole role="patient">
                <PatientTalk />
              </RequireRole>
            }
          />
          <Route
            path="/patient/report/:id"
            element={
              <RequireRole role="patient">
                <PatientReport />
              </RequireRole>
            }
          />
          <Route
            path="/doctor/dashboard"
            element={
              <RequireRole role="doctor">
                <DoctorDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/doctor/case/:id"
            element={
              <RequireRole role="doctor">
                <DoctorCase />
              </RequireRole>
            }
          />
          <Route
            path="/patient/prescription"
            element={
              <RequireRole role="patient">
                <PatientPrescription />
              </RequireRole>
            }
          />
          <Route
            path="/patient/prescription/:id"
            element={
              <RequireRole role="patient">
                <PatientPrescription />
              </RequireRole>
            }
          />
          <Route
            path="/doctor/emr"
            element={
              <RequireRole role="doctor">
                <EMR />
              </RequireRole>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
 