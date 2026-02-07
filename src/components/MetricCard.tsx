"use client";

interface MetricCardProps {
  label: string;
  value: number;
  change: number;
  unit: string;
  delay?: number;
}

export default function MetricCard({ label, value, change, unit, delay = 0 }: MetricCardProps) {
  const isPositive = change >= 0;
  const changeColor = isPositive ? "var(--accent-green)" : "var(--accent-red)";
  const arrow = isPositive ? "↑" : "↓";

  return (
    <div
      className={`card-glass rounded-xl p-5 fade-in-up fade-in-up-${delay}`}
    >
      <p
        className="text-[10px] tracking-[0.15em] uppercase mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <span
          className="text-2xl font-light tabular-nums"
          style={{ color: "var(--text-primary)" }}
        >
          {unit === "T" ? "$" : ""}
          {value.toFixed(unit === "" ? 1 : 2)}
        </span>
        {unit && (
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {unit}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <span className="text-xs font-medium" style={{ color: changeColor }}>
          {arrow} {Math.abs(change)}
          {unit === "T" ? "%" : unit === "" ? " pts" : "%"}
        </span>
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          YoY
        </span>
      </div>
    </div>
  );
}
