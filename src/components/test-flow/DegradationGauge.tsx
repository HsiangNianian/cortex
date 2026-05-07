export function DegradationGauge({
  index,
  ringColor,
}: {
  index: number;
  ringColor: string;
}) {
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - index / 100);

  return (
    <div className="relative mx-auto h-40 w-40">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="10"
        />
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tracking-tight">{index}</span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}
