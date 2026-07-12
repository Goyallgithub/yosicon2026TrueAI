export function ChestXRaySVG() {
  return (
    <svg viewBox="0 0 200 240" className="h-full w-full" aria-label="Chest X-Ray">
      <rect width="200" height="240" fill="#0a1628" />
      <rect x="8" y="8" width="184" height="224" fill="none" stroke="#334155" strokeWidth="2" />
      {[...Array(8)].map((_, i) => (
        <line key={i} x1={20 + i * 22} y1="10" x2={20 + i * 22} y2="230" stroke="#1e293b" strokeWidth="0.5" />
      ))}
      <ellipse cx="100" cy="55" rx="28" ry="22" fill="none" stroke="#64748b" strokeWidth="2" />
      <path d="M60 90 Q100 110 140 90 L130 200 Q100 220 70 200 Z" fill="none" stroke="#94a3b8" strokeWidth="2.5" />
      <path d="M85 95 L85 190 M115 95 L115 190" stroke="#64748b" strokeWidth="1.5" />
      <circle cx="100" cy="140" r="18" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4 2" />
      <text x="100" y="228" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">
        CHEST PA · AI ENHANCED
      </text>
    </svg>
  );
}

export function EyeScanSVG() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-label="Eye scan">
      <rect width="200" height="200" fill="#0f172a" />
      <circle cx="100" cy="100" r="70" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="6 4" opacity="0.5" />
      <ellipse cx="100" cy="100" rx="55" ry="35" fill="none" stroke="#60a5fa" strokeWidth="2" />
      <circle cx="100" cy="100" r="18" fill="#1e3a5f" stroke="#93c5fd" strokeWidth="2" />
      <circle cx="100" cy="100" r="8" fill="#0c1929" stroke="#fff" strokeWidth="1" />
      <line x1="30" y1="100" x2="170" y2="100" stroke="#334155" strokeWidth="0.5" />
      <line x1="100" y1="30" x2="100" y2="170" stroke="#334155" strokeWidth="0.5" />
      {[0, 45, 90, 135].map((deg) => (
        <line
          key={deg}
          x1="100"
          y1="100"
          x2={100 + 65 * Math.cos((deg * Math.PI) / 180)}
          y2={100 + 65 * Math.sin((deg * Math.PI) / 180)}
          stroke="#1e40af"
          strokeWidth="0.5"
          opacity="0.4"
        />
      ))}
      <text x="100" y="188" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">
        RETINAL · OCT SCAN
      </text>
    </svg>
  );
}

export function CTHeadSVG() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-label="CT Head">
      <rect width="200" height="200" fill="#111827" />
      <circle cx="100" cy="100" r="75" fill="#1f2937" stroke="#4b5563" strokeWidth="2" />
      <circle cx="100" cy="100" r="55" fill="none" stroke="#6b7280" strokeWidth="1.5" />
      <ellipse cx="85" cy="95" rx="12" ry="8" fill="#374151" stroke="#9ca3af" strokeWidth="1" />
      <ellipse cx="115" cy="95" rx="12" ry="8" fill="#374151" stroke="#9ca3af" strokeWidth="1" />
      <path d="M70 130 Q100 150 130 130" fill="none" stroke="#6b7280" strokeWidth="1" />
      <text x="100" y="188" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="monospace">
        CT HEAD · AXIAL
      </text>
    </svg>
  );
}

export function ImagingThumbnail({ type }) {
  const t = type?.toLowerCase() || "";
  if (t.includes("eye") || t.includes("retinal") || t.includes("fundus") || t.includes("ophthalm")) {
    return <EyeScanSVG />;
  }
  if (t.includes("ct") || t.includes("head")) {
    return <CTHeadSVG />;
  }
  return <ChestXRaySVG />;
}
