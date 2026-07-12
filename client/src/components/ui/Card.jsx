import { CardDecoration } from "./GeometricLogo.jsx";

export default function Card({ children, className = "", decorationIndex = 0, hover = true }) {
  return (
    <div
      className={`bauhaus-card p-6 ${hover ? "hover:-translate-y-1" : ""} ${className}`}
    >
      <CardDecoration index={decorationIndex} />
      {children}
    </div>
  );
}
