const STATS = [
  { value: "94%", label: "Triage Accuracy", color: "bg-bauhaus-red", rotate: false },
  { value: "2min", label: "Avg. Intake Time", color: "bg-bauhaus-blue", rotate: true },
  { value: "24/7", label: "Always Available", color: "bg-white", rotate: false },
  { value: "500+", label: "Cases Processed", color: "bg-bauhaus-red", rotate: true },
];

export default function StatsSection() {
  return (
    <section className="bauhaus-section bg-bauhaus-yellow">
      <div className="bauhaus-container">
        <p className="bauhaus-label mb-8 text-center text-foreground/70">By the Numbers</p>
        <div className="grid divide-y-2 divide-foreground border-2 border-foreground sm:grid-cols-2 sm:divide-x-2 sm:divide-y-0 lg:grid-cols-4 lg:border-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center px-6 py-8 text-center">
              <div
                className={`mb-4 h-3 w-3 border-2 border-foreground lg:h-4 lg:w-4 lg:border-4 ${stat.color} ${
                  stat.rotate ? "rotate-45" : "rounded-full"
                }`}
                aria-hidden="true"
              />
              <p className="bauhaus-heading text-3xl sm:text-4xl lg:text-5xl">{stat.value}</p>
              <p className="bauhaus-label mt-2 text-foreground/70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
