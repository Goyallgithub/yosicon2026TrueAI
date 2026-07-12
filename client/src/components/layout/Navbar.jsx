import { Link, useNavigate } from "react-router-dom";
import { Stethoscope, LayoutDashboard, FileHeart } from "lucide-react";
import GeometricLogo from "../ui/GeometricLogo.jsx";
import Button from "../ui/Button.jsx";
import { useAppStore } from "../../store/useAppStore.js";

export default function Navbar() {
  const navigate = useNavigate();
  const role = useAppStore((s) => s.role);
  const currentCaseId = useAppStore((s) => s.currentCaseId);
  const logout = useAppStore((s) => s.logout);
  const openDoctorView = useAppStore((s) => s.openDoctorView);
  const setRole = useAppStore((s) => s.setRole);

  return (
    <nav className="border-b-4 border-foreground bg-white">
      <div className="bauhaus-container flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-3">
          <GeometricLogo size="lg" />
          <span className="bauhaus-heading text-lg sm:text-xl">TrueComplaint</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="yellow"
            shape="pill"
            onClick={() => {
              setRole("doctor");
              navigate("/doctor/emr");
            }}
            className="!px-3 !py-2 text-[10px] sm:!px-4 sm:text-xs"
          >
            <FileHeart className="h-4 w-4" strokeWidth={3} />
            <span className="hidden sm:inline">EMR System</span>
            <span className="sm:hidden">EMR</span>
          </Button>

          {/* Demo: always show doctor dashboard access */}
          <Button
            variant="blue"
            shape="pill"
            onClick={() => openDoctorView(navigate)}
            className="!px-3 !py-2 text-[10px] sm:!px-4 sm:text-xs"
          >
            <Stethoscope className="h-4 w-4" strokeWidth={3} />
            <span className="hidden sm:inline">Doctor Dashboard</span>
            <span className="sm:hidden">Doctor</span>
          </Button>

          {currentCaseId && role === "patient" && (
            <Button
              variant="yellow"
              shape="pill"
              onClick={() => openDoctorView(navigate, currentCaseId)}
              className="!px-3 !py-2 text-[10px] sm:!px-4 sm:text-xs"
            >
              <LayoutDashboard className="h-4 w-4" strokeWidth={3} />
              <span className="hidden sm:inline">View My Case</span>
            </Button>
          )}

          {role ? (
            <>
              <span className="bauhaus-label hidden text-foreground/70 md:inline">{role}</span>
              <Button variant="outline" shape="pill" onClick={logout} className="!px-3 !py-2 text-xs">
                Log out
              </Button>
            </>
          ) : (
            <a href="#get-started" className="bauhaus-label hidden text-bauhaus-blue hover:underline sm:inline">
              Get Started
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
