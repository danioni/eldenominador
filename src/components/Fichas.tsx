"use client";

import type { Familia, Ficha } from "@/lib/series";
import { etiquetaMes } from "@/lib/formato";

const FAMILIAS: { familia: Familia; titulo: string }[] = [
  { familia: "dinero", titulo: "Dinero" },
  { familia: "balance", titulo: "Balances de bancos centrales" },
  { familia: "tipo de cambio", titulo: "Tipos de cambio" },
  { familia: "riqueza", titulo: "Riqueza por clase de activo" },
];

function Fila({ nombre, children }: { nombre: string; children: React.ReactNode }) {
  if (children === null || children === undefined || children === "") return null;
  return (
    <div className="grid grid-cols-[7.5rem_1fr] sm:grid-cols-[10rem_1fr] gap-x-3 gap-y-0.5 py-1" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <dt className="text-[9px] tracking-[0.15em] uppercase pt-0.5" style={{ color: "var(--text-muted)" }}>
        {nombre}
      </dt>
      <dd className="text-[11px] leading-relaxed break-words" style={{ color: "var(--text-secondary)" }}>
        {children}
      </dd>
    </div>
  );
}

function FichaSerie({ ficha }: { ficha: Ficha }) {
  return (
    <details className="group rounded-lg" style={{ border: "1px solid var(--border-subtle)" }}>
      <summary className="cursor-pointer list-none px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className="text-[11px] sm:text-xs" style={{ color: "var(--text-primary)" }}>
          {ficha.nombre}
        </span>
        <span className="text-[9px] tracking-[0.15em] uppercase tabular-nums" style={{ color: ficha.publicada ? "var(--text-muted)" : "var(--text-secondary)" }}>
          {ficha.publicada
            ? `${ficha.estado} · ${etiquetaMes(ficha.primerMes)} a ${etiquetaMes(ficha.ultimoMes)} · ${ficha.meses} meses`
            : "no medido"}
        </span>
      </summary>
      <dl className="px-3 sm:px-4 pb-3">
        <Fila nombre="Estado">{ficha.estado}</Fila>
        <Fila nombre="Identificador">
          <code className="text-[10px]">{ficha.serie}</code>
          {ficha.identificador && (
            <>
              {" · "}
              <code className="text-[10px]">{ficha.identificador}</code>
            </>
          )}
        </Fila>
        <Fila nombre="Emisor">{ficha.emisor}</Fila>
        <Fila nombre="Fuente">
          {ficha.url ? (
            <a href={ficha.url} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--accent)" }}>
              {ficha.fuente}
            </a>
          ) : (
            ficha.fuente
          )}
        </Fila>
        <Fila nombre="Unidad">{ficha.unidad}</Fila>
        <Fila nombre="Convención">
          {[ficha.convencion, ficha.frecuenciaNativa && `frecuencia nativa ${ficha.frecuenciaNativa}`, ficha.ajusteEstacional]
            .filter(Boolean)
            .join(" · ")}
        </Fila>
        <Fila nombre="Validación">{ficha.validacion}</Fila>
        <Fila nombre="Licencia">{ficha.licencia}</Fila>
        <Fila nombre="Atribución">{ficha.atribucion}</Fila>
        <Fila nombre="Supuestos">{ficha.supuestos.join(", ")}</Fila>
        {ficha.quiebres.length > 0 && (
          <Fila nombre="Quiebres">
            <ul className="space-y-0.5">
              {ficha.quiebres.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </Fila>
        )}
      </dl>
    </details>
  );
}

export default function Fichas({ fichas }: { fichas: Ficha[] }) {
  return (
    <div className="space-y-6">
      {FAMILIAS.map(({ familia, titulo }) => {
        const lista = fichas.filter((f) => f.familia === familia);
        if (lista.length === 0) return null;
        return (
          <div key={familia}>
            <p className="text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: "var(--text-secondary)" }}>
              {titulo}
            </p>
            <div className="space-y-1.5">
              {lista.map((f) => (
                <FichaSerie key={f.serie} ficha={f} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
