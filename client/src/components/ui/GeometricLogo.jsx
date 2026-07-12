const ACCENTS = ["bg-bauhaus-red", "bg-bauhaus-blue", "bg-bauhaus-yellow"];
const SHAPES = ["rounded-full", "rounded-none", "triangle"];

export default function GeometricLogo({ size = "md" }) {
  const dim = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4";

  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      <div className={`${dim} rounded-full border-2 border-foreground bg-bauhaus-red`} />
      <div className={`${dim} rotate-45 border-2 border-foreground bg-bauhaus-blue`} />
      <div
        className={`${dim} border-2 border-foreground bg-bauhaus-yellow`}
        style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
      />
    </div>
  );
}

export function CardDecoration({ index = 0 }) {
  const accent = ACCENTS[index % 3];
  const shape = SHAPES[index % 3];

  if (shape === "triangle") {
    return (
      <div
        className={`absolute right-4 top-4 h-4 w-4 border-2 border-foreground ${accent}`}
        style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className={`absolute right-4 top-4 h-4 w-4 border-2 border-foreground ${accent} ${shape}`}
      aria-hidden="true"
    />
  );
}
