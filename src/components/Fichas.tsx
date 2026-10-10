"use client";

import type { Familia, Ficha } from "@/lib/series";
import { etiquetaMes } from "@/lib/formato";

const FAMILIAS: { familia: Familia; titulo: string }[] = [
  { familia: "dinero", titulo: "Dinero" },
  { familia: "balance", titulo: "Balances de bancos centrales" },
  { familia: "tipo de cambio", titulo: "Tipos de cambio" },
  { familia: "riqueza", titulo: "Riqueza por clase de activo" },
];

export function Fila({ nombre, children, compacta = false }: { nombre: string; children: React.ReactNode; compacta?: boolean }) {
  if (children === null || children === undefined || children === "") return null;
  // Compacta: el rótulo va encima del valor, para las tarjetas estrechas.
  const columnas = compacta ? "grid-cols-1" : "grid-cols-[6.5rem_minmax(0,1fr)] sm:grid-cols-[9rem_minmax(0,1fr)]";
  return (
    <div className={`grid ${columnas} gap-x-3 gap-y-0.5 py-1.5`} style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <dt className="rotulo pt-0.5" style={{ fontSize: "0.5625rem" }}>
        {nombre}
      </dt>
      <dd className="texto min-w-0 break-words" style={{ fontSize: "0.75rem", lineHeight: 1.55 }}>
        {children}
      </dd>
    </div>
  );
}

/**
 * "2001-01: ampliación de la zona del euro: Grecia" → "2001-01 Grecia"; las
 * descripciones largas, como la del Banco de Japón, se dejan enteras.
 */
export function quiebreCorto(q: string): string {
  const partes = q.split(": ");
  return partes.length > 2 ? `${partes[0]} ${partes.slice(2).join(": ")}` : q;
}

/**
 * Nombre comprensible de la fuente, sin el detalle operativo que viene detrás
 * ("historia completa en XML", "(copia bajada a mano)", el conjunto exacto). El
 * texto completo sigue en la ficha.
 */
export function fuenteCorta(fuente: string): string {
  return fuente
    .replace(/\s*\(copia bajada a mano\)/, "")
    .replace(/,\s*historia completa en XML/, "")
    .split(": ")[0]
    .trim();
}

/** Las filas de la ficha, para el desplegable de un panel o la lista completa. */
export function DetalleFicha({ ficha, conEstado = true, compacta = false }: { ficha: Ficha; conEstado?: boolean; compacta?: boolean }) {
  return (
    <dl>
      {conEstado && <Fila compacta={compacta} nombre="Estado">{ficha.estado}</Fila>}
      <Fila compacta={compacta} nombre="Identificador">
        <code className="font-mono" style={{ fontSize: "0.6875rem" }}>{ficha.serie}</code>
        {ficha.identificador && (
          <>
            {" · "}
            <code className="font-mono" style={{ fontSize: "0.6875rem" }}>{ficha.identificador}</code>
          </>
        )}
      </Fila>
      <Fila compacta={compacta} nombre="Emisor">{ficha.emisor}</Fila>
      <Fila compacta={compacta} nombre="Fuente">
        {ficha.url ? (
          <a href={ficha.url} target="_blank" rel="noopener noreferrer">
            {ficha.fuente}
          </a>
        ) : (
          ficha.fuente
        )}
      </Fila>
      <Fila compacta={compacta} nombre="Unidad">{ficha.unidad}</Fila>
      <Fila compacta={compacta} nombre="Convención">
        {[ficha.convencion, ficha.frecuenciaNativa && `frecuencia nativa ${ficha.frecuenciaNativa}`, ficha.ajusteEstacional]
          .filter(Boolean)
          .join(" · ")}
      </Fila>
      {ficha.publicada && (
        <Fila compacta={compacta} nombre="Cobertura">
          {etiquetaMes(ficha.primerMes)} a {etiquetaMes(ficha.ultimoMes)}, {ficha.meses} meses
        </Fila>
      )}
      <Fila compacta={compacta} nombre="Validación">{ficha.validacion}</Fila>
      <Fila compacta={compacta} nombre="Licencia">{ficha.licencia}</Fila>
      <Fila compacta={compacta} nombre="Atribución">{ficha.atribucion}</Fila>
      <Fila compacta={compacta} nombre="Supuestos">
        <span className="font-mono" style={{ fontSize: "0.6875rem" }}>{ficha.supuestos.join(", ")}</span>
      </Fila>
      {ficha.quiebres.length > 0 && (
        <Fila compacta={compacta} nombre="Quiebres">
          <ul className="space-y-0.5">
            {ficha.quiebres.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </Fila>
      )}
    </dl>
  );
}

function FichaSerie({ ficha }: { ficha: Ficha }) {
  return (
    <details className="group rounded-lg" style={{ border: "1px solid var(--border-subtle)" }}>
      <summary className="cursor-pointer list-none px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <span className="texto" style={{ color: "var(--text-primary)" }}>
          {ficha.nombre}
        </span>
        <span className="meta tabular-nums" style={{ color: ficha.publicada ? "var(--text-muted)" : "var(--text-secondary)" }}>
          {ficha.publicada
            ? `${ficha.estado} · ${etiquetaMes(ficha.primerMes)} a ${etiquetaMes(ficha.ultimoMes)} · ${ficha.meses} meses`
            : "no medido"}
        </span>
      </summary>
      <div className="px-3 sm:px-4 pb-3">
        <DetalleFicha ficha={ficha} />
      </div>
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
            <p className="rotulo mb-2" style={{ color: "var(--text-secondary)" }}>
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
