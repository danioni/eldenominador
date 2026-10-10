"use client";

import type { ReactNode } from "react";
import { aBillones, decimalesPara, formatearNumero, formatearPct, valorConUnidad } from "@/lib/formato";
import Desplegable from "./Desplegable";

export interface FuenteVisible {
  /** Nombre comprensible: "Junta de la Reserva Federal, H.6 Money Stock Measures". */
  nombre: string;
  url?: string;
}

interface MetricCardProps {
  label: string;
  /** Qué mide el indicador, en una frase. */
  descripcion: string;
  /** El valor en su unidad nativa, tal como lo publica la fuente. */
  valor: number;
  unidad: string;
  /** Variación contra el mismo mes del año anterior, en %. Cálculo propio. */
  interanualPct: number | null;
  /** El mes del dato, ya formateado ("ago 2026"). */
  mes: string;
  fuente: FuenteVisible;
  /** La limitación indispensable para leer la cifra, si la hay. */
  limitacion?: string;
  /** Códigos, identificadores, archivos y validaciones: van al desplegable. */
  metodologia: ReactNode;
  delay?: number;
}

export default function MetricCard({
  label,
  descripcion,
  valor,
  unidad,
  interanualPct,
  mes,
  fuente,
  limitacion,
  metodologia,
  delay = 0,
}: MetricCardProps) {
  const sube = interanualPct !== null && interanualPct >= 0;
  const colorVariacion = interanualPct === null ? "var(--text-muted)" : sube ? "var(--accent)" : "var(--accent-blue)";
  // Los agregados en moneda se destacan en billones (10¹²); un ratio se queda
  // en su unidad propia.
  const billones = aBillones(valor, unidad);

  return (
    <div className={`card-glass card-accent-top rounded-xl p-5 md:p-6 fade-in-up fade-in-up-${delay} flex flex-col`}>
      <p className="rotulo mb-1.5 flex items-center gap-2">
        <span className="w-1 h-1 rounded-full inline-block" style={{ background: colorVariacion }} />
        {label}
      </p>
      <p className="texto mb-4" style={{ fontSize: "0.75rem", lineHeight: 1.5 }}>
        {descripcion}
      </p>

      {billones ? (
        <>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-mono text-[28px] font-light tabular-nums tracking-tight" style={{ color: "var(--text-primary)" }}>
              {formatearNumero(billones.valor, 2)}
            </span>
            <span className="font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
              {billones.unidad}
            </span>
          </div>
          <p className="meta mt-1 tabular-nums">= {valorConUnidad(valor, unidad)}</p>
        </>
      ) : (
        <>
          <span className="font-mono text-[28px] font-light tabular-nums tracking-tight" style={{ color: "var(--text-primary)" }}>
            {formatearNumero(valor, decimalesPara(valor))}
          </span>
          <p className="meta mt-1" style={{ color: "var(--text-secondary)" }}>
            {unidad}
          </p>
        </>
      )}

      <div className="flex items-center gap-2 mt-3 pt-3 flex-wrap" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        {interanualPct === null ? (
          <span className="meta">sin dato doce meses atrás</span>
        ) : (
          <>
            <span
              className="font-mono text-xs font-medium tabular-nums px-1.5 py-0.5 rounded"
              style={{
                color: colorVariacion,
                background: sube ? "var(--accent-bg)" : "var(--accent-blue-bg)",
              }}
            >
              {formatearPct(interanualPct)}
            </span>
            <span className="meta">interanual · cálculo propio</span>
          </>
        )}
        <span className="meta ml-auto tabular-nums" style={{ color: "var(--text-secondary)" }}>
          {mes}
        </span>
      </div>

      <p className="meta mt-3">
        Fuente:{" "}
        {fuente.url ? (
          <a href={fuente.url} target="_blank" rel="noopener noreferrer">
            {fuente.nombre}
          </a>
        ) : (
          fuente.nombre
        )}
      </p>
      {limitacion && (
        <p className="texto mt-2" style={{ fontSize: "0.75rem", lineHeight: 1.5 }}>
          {limitacion}
        </p>
      )}

      <div className="mt-auto pt-3">
        <Desplegable>{metodologia}</Desplegable>
      </div>
    </div>
  );
}
