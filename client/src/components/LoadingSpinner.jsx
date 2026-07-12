export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rotate-45 border-2 border-foreground bg-bauhaus-yellow shadow-bauhaus" />
        <div className="absolute inset-2 animate-pulse rounded-full border-2 border-foreground bg-bauhaus-red" />
      </div>
      <p className="bauhaus-label text-foreground/70">{label}</p>
    </div>
  );
}
