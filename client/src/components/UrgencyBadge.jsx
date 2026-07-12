const STYLES = {
  routine: "bg-bauhaus-blue text-white border-foreground",
  urgent: "bg-bauhaus-yellow text-foreground border-foreground",
  emergency: "bg-bauhaus-red text-white border-foreground",
};

export default function UrgencyBadge({ level }) {
  const normalized = level?.toLowerCase() || "routine";
  const style = STYLES[normalized] || STYLES.routine;

  return (
    <span
      className={`inline-flex items-center border-2 px-3 py-1 text-xs font-bold uppercase tracking-widest shadow-bauhaus-sm lg:border-4 ${style}`}
    >
      {normalized}
    </span>
  );
}
