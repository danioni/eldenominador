"use client";

import { formatearPct } from "@/lib/formato";

interface MetricCardProps {
  label: string;
  /** El valor ya formateado, en su unidad nativa. */
  valor: string;
  unidad: string;
  /** La misma cifra llevada a billones, para leerla de un vistazo. */
  conversion?: string | null;
  /** Variación contra el mismo mes del año anterior, en %. Cálculo propio. */
  interanualPct: number | null;
  /** El mes del dato, ya formateado ("ago 2026"). */
  mes: string;
  /** De dónde sale el número: fuente o "cálculo propio sobre…". */
  origen: string;
  delay?: number;
}

export default function MetricCard({
  label,
  valor,
  unidad,
  conversion,
  interanualPct,
  mes,
  origen,
  delay = 0,
}: MetricCardProps) {
  const sube = interanualPct !== null && interanualPct >= 0;
  const colorVariacion = interanualPct === null ? "var(--text-muted)" : sube ? "var(--accent)" : "var(--accent-blue)";

  return (
    <div className={`card-glass card-accent-top rounded-xl p-5 md:p-6 fade-in-up fade-in-up-${delay}`}>
      <p
        className="text-[10px] tracking-[0.2em] uppercase mb-4 flex items-center gap-2"
        style={{ color: "var(--text-muted)" }}
      >
        <span className="w-1 h-1 rounded-full inline-block" style={{ background: colorVariacion }} />
        {label}
      </p>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-[26px] font-light tabular-nums tracking-tight" style={{ color: "var(--text-primary)" }}>
          {valor}
        </span>
        <span className="text-[10px] font-light leading-tight" style={{ color: "var(--text-secondary)" }}>
          {unidad}
        </span>
      </div>
      {conversion && (
        <p className="text-[10px] mt-1 tabular-nums" style={{ color: "var(--text-muted)" }}>
          {conversion}
        </p>
      )}
      <div
        className="flex items-center gap-2 mt-3 pt-3 flex-wrap"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        {interanualPct === null ? (
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            sin dato doce meses atrás
          </span>
        ) : (
          <>
            <span
              className="text-xs font-medium tabular-nums px-1.5 py-0.5 rounded"
              style={{
                color: colorVariacion,
                background: sube ? "var(--accent-bg)" : "var(--accent-blue-bg, rgba(51, 136, 255, 0.08))",
              }}
            >
              {formatearPct(interanualPct)}
            </span>
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              interanual · cálculo propio
            </span>
          </>
        )}
        <span className="text-[10px] ml-auto tabular-nums" style={{ color: "var(--text-muted)" }}>
          {mes}
        </span>
      </div>
      <p className="text-[9px] mt-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
        {origen}
      </p>
    </div>
  );
}
