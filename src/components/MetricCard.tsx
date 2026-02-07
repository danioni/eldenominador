"use client";

interface MetricCardProps {
  label: string;
  value: number;
  change: number;
  unit: string;
  delay?: number;
}

function formatMetricValue(value: number, unit: string): string {
  if (unit === "T") return `$${value.toFixed(2)}`;
  // Index values: format with locale separators
  if (value >= 1000) return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return value.toFixed(1);
}

function formatChangeValue(change: number): string {
  return `${Math.abs(change)}%`;
}

export default function MetricCard({ label, value, change, unit, delay = 0 }: MetricCardProps) {
  const isPositive = change >= 0;
  const changeColor = isPositive ? "var(--accent-green)" : "var(--accent-red)";
  const arrow = isPositive ? "\u2191" : "\u2193";

  return (
    <div
      className={`card-glass card-accent-top rounded-xl p-5 md:p-6 fade-in-up fade-in-up-${delay}`}
    >
      <p
        className="text-[10px] tracking-[0.2em] uppercase mb-4 flex items-center gap-2"
        style={{ color: "var(--text-muted)" }}
      >
        <span
          className="w-1 h-1 rounded-full inline-block"
          style={{ background: isPositive ? "var(--accent-green)" : "var(--accent-red)" }}
        />
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <span
          className="text-[28px] font-light tabular-nums tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {formatMetricValue(value, unit)}
        </span>
        {unit && (
          <span className="text-xs font-light" style={{ color: "var(--text-secondary)" }}>
            {unit}
          </span>
        )}
      </div>
      <div
        className="flex items-center gap-2 mt-3 pt-3"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <span
          className="text-xs font-medium tabular-nums px-1.5 py-0.5 rounded"
          style={{
            color: changeColor,
            background: isPositive ? "rgba(0,255,136,0.08)" : "rgba(255,51,85,0.08)",
          }}
        >
          {arrow} {formatChangeValue(change)}
        </span>
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          CAGR
        </span>
      </div>
    </div>
  );
}
