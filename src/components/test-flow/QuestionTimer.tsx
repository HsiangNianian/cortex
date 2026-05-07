export function QuestionTimer({
  remaining,
  total,
}: {
  remaining: number;
  total: number;
}) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = remaining / total;
  const offset = circumference * (1 - progress);
  const isUrgent = remaining <= 10 && remaining > 0;

  const color = isUrgent
    ? "#ef4444"
    : progress > 0.5
      ? "#16a34a"
      : progress > 0.25
        ? "#d97706"
        : "#dc2626";
  const textColor = isUrgent
    ? "text-red-500"
    : progress > 0.5
      ? "text-green-600"
      : progress > 0.25
        ? "text-amber-600"
        : "text-red-600";

  return (
    <div
      className={`relative h-16 w-16 shrink-0 sm:h-20 sm:w-20 ${isUrgent ? "animate-pulse" : ""}`}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="5"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-300 ease-linear"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`text-base font-bold tabular-nums sm:text-xl transition-all ${textColor} ${isUrgent ? "scale-125" : ""
            }`}
        >
          {remaining}
        </span>
      </div>
    </div>
  );
}
