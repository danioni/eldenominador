"use client";

import type { Cita, Ficha } from "@/lib/series";
import { etiquetaMes, formatearNumero } from "@/lib/formato";

interface TarjetaNoMedidaProps {
  titulo: string;
  /** Lo que la tarjeta reemplaza o por qué importa, en una frase. */
  descripcion?: string;
  /** Las fichas de serie_D0.csv que están NO MEDIDO. */
  fichas: Ficha[];
  /** Cifras puntuales de terceros que se citan, fuera de todo cálculo (A-D0-28). */
  citas?: Cita[];
  delay?: number;
}

/** "NO MEDIDO: sin validación externa" → "sin validación externa" */
function motivo(estado: string): string {
  return estado.replace(/^NO MEDIDO:?\s*/, "");
}

export default function TarjetaNoMedida({ titulo, descripcion, fichas, citas = [], delay = 0 }: TarjetaNoMedidaProps) {
  return (
    <div
      className={`card-glass rounded-xl p-5 md:p-6 fade-in-up fade-in-up-${delay} h-full`}
      style={{ borderStyle: "dashed" }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-serif text-base sm:text-lg tracking-wide" style={{ color: "var(--text-primary)" }}>
          {titulo}
        </h3>
        <span
          className="shrink-0 text-[9px] tracking-[0.2em] uppercase px-2 py-1 rounded"
          style={{ color: "var(--text-secondary)", border: "1px solid var(--border)", background: "var(--controls-bg)" }}
        >
          No medido
        </span>
      </div>
      {descripcion && (
        <p className="text-[11px] leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
          {descripcion}
        </p>
      )}
      <ul className="space-y-2.5">
        {fichas.map((f) => (
          <li key={f.serie} className="text-[11px] leading-relaxed">
            <span style={{ color: "var(--text-primary)" }}>{f.nombre}.</span>{" "}
            <span style={{ color: "var(--text-secondary)" }}>{motivo(f.estado)}.</span>
            {f.fuente && (
              <span style={{ color: "var(--text-muted)" }}> Fuente: {f.fuente}.</span>
            )}
            {f.supuestos.length > 0 && (
              <span className="ml-1 tabular-nums" style={{ color: "var(--text-muted)" }}>
                {f.supuestos.join(" ")}
              </span>
            )}
          </li>
        ))}
      </ul>
      {citas.length > 0 && (
        <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <p className="text-[9px] tracking-[0.2em] uppercase mb-2" style={{ color: "var(--text-muted)" }}>
            Cifras citadas · estimación de terceros, fuera de todo cálculo
          </p>
          <ul className="space-y-1.5">
            {citas.map((c) => (
              <li key={`${c.clase}-${c.fechaDelDato}`} className="text-[10px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                <span className="tabular-nums" style={{ color: "var(--text-primary)" }}>
                  {formatearNumero(c.cifra, Number.isInteger(c.cifra) ? 0 : 1)} {c.unidad}
                </span>{" "}
                a {etiquetaMes(c.fechaDelDato)} ·{" "}
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--accent)" }}>
                  {c.fuente}
                </a>{" "}
                <span style={{ color: "var(--text-muted)" }}>
                  ({c.seccion}; leído el {c.fechaLectura}; {c.supuesto})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
