"use client";

import type { ReactNode } from "react";
import type { Cita, Ficha } from "@/lib/series";
import { etiquetaMes, formatearNumero } from "@/lib/formato";
import Desplegable from "./Desplegable";

interface TarjetaNoMedidaProps {
  titulo: string;
  /** Qué falta y por qué importa, en dos o tres frases. */
  queFalta: ReactNode;
  /** Las fichas de serie_D0.csv que están NO MEDIDO. */
  fichas: Ficha[];
  /** Cifras puntuales de terceros que se citan, fuera de todo cálculo (A-D0-28). */
  citas?: Cita[];
  /** Lo operativo: lecturas pendientes, PR, gates, restricciones de descarga. Va al desplegable. */
  detalle?: ReactNode;
  delay?: number;
}

/** "NO MEDIDO: sin validación externa" → "sin validación externa" */
function motivo(estado: string): string {
  return estado.replace(/^NO MEDIDO:?\s*/, "");
}

export default function TarjetaNoMedida({ titulo, queFalta, fichas, citas = [], detalle, delay = 0 }: TarjetaNoMedidaProps) {
  return (
    <div className={`card-glass rounded-xl p-5 md:p-6 fade-in-up fade-in-up-${delay} h-full flex flex-col`} style={{ borderStyle: "dashed" }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-serif text-xl sm:text-2xl tracking-wide" style={{ color: "var(--text-primary)" }}>
          {titulo}
        </h3>
        <span
          className="rotulo shrink-0 px-2 py-1 rounded"
          style={{ color: "var(--text-secondary)", border: "1px solid var(--border)", background: "var(--controls-bg)" }}
        >
          No medido
        </span>
      </div>

      <p className="texto mb-3">{queFalta}</p>

      {fichas.length > 0 && (
        <ul className="space-y-1.5 mb-3">
          {fichas.map((f) => (
            <li key={f.serie} className="texto" style={{ fontSize: "0.75rem", lineHeight: 1.5 }}>
              <span style={{ color: "var(--text-primary)" }}>{f.nombre}</span>
              {f.fuente && <span style={{ color: "var(--text-muted)" }}> · fuente: {f.fuente}</span>}
            </li>
          ))}
        </ul>
      )}

      {citas.length > 0 && (
        <div className="mt-1 mb-3 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <p className="rotulo mb-2">Cifras citadas · estimación de terceros, fuera de todo cálculo</p>
          <ul className="space-y-1.5">
            {citas.map((c) => (
              <li key={`${c.clase}-${c.fechaDelDato}`} className="texto" style={{ fontSize: "0.75rem", lineHeight: 1.5 }}>
                <span className="font-mono tabular-nums" style={{ color: "var(--text-primary)" }}>
                  {formatearNumero(c.cifra, Number.isInteger(c.cifra) ? 0 : 1)} {c.unidad.replace("(10^12)", "(10¹²)")}
                </span>{" "}
                a {etiquetaMes(c.fechaDelDato)} ·{" "}
                <a href={c.url} target="_blank" rel="noopener noreferrer">
                  {c.fuente}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto pt-2">
        <Desplegable>
          {detalle && <p className="texto mt-2 mb-2" style={{ fontSize: "0.75rem", lineHeight: 1.55 }}>{detalle}</p>}
          <ul className="space-y-2 mt-2">
            {fichas.map((f) => (
              <li key={f.serie} className="texto" style={{ fontSize: "0.75rem", lineHeight: 1.55 }}>
                <span className="font-mono" style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>{f.serie}</span>
                {" · "}
                <span style={{ color: "var(--text-primary)" }}>{f.nombre}.</span> Estado: {motivo(f.estado)}.
                {f.fuente && <> Fuente: {f.fuente}.</>}
                {f.supuestos.length > 0 && (
                  <>
                    {" "}
                    Supuestos: <span className="font-mono" style={{ fontSize: "0.6875rem" }}>{f.supuestos.join(", ")}</span>.
                  </>
                )}
              </li>
            ))}
          </ul>
          {citas.length > 0 && (
            <ul className="space-y-1.5 mt-3 pt-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              {citas.map((c) => (
                <li key={`${c.clase}-${c.fechaDelDato}-detalle`} className="meta">
                  {c.fuente}: {c.seccion}; leído el {c.fechaLectura}; {c.estado} ({c.supuesto}).
                </li>
              ))}
            </ul>
          )}
        </Desplegable>
      </div>
    </div>
  );
}
