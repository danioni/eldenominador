"use client";

import { useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Punto, PuntoRatio } from "@/lib/series";
import { aBillones, anioDe, decimalesPara, etiquetaMes, formatearCompacto, formatearNumero } from "@/lib/formato";

// ── Rango de meses y marcas del eje ────────────────────────

export type Rango = "10a" | "25a" | "todo";

export const RANGOS: { clave: Rango; etiqueta: string; meses: number | null }[] = [
  { clave: "10a", etiqueta: "10 años", meses: 120 },
  { clave: "25a", etiqueta: "25 años", meses: 300 },
  { clave: "todo", etiqueta: "Todo", meses: null },
];

export function recortar<T>(puntos: T[], rango: Rango): T[] {
  const meses = RANGOS.find((r) => r.clave === rango)?.meses ?? null;
  return meses === null ? puntos : puntos.slice(-meses);
}

/** Un mes por año marcado, con el paso que admite el tramo. */
export function ticksAnuales(meses: string[]): string[] | undefined {
  if (meses.length === 0) return undefined;
  const primerAnio = anioDe(meses[0]);
  const ultimoAnio = anioDe(meses[meses.length - 1]);
  const tramo = ultimoAnio - primerAnio;
  const paso = tramo <= 12 ? 2 : tramo <= 30 ? 5 : tramo <= 70 ? 10 : 20;
  const ticks: string[] = [];
  for (let a = Math.ceil(primerAnio / paso) * paso; a <= ultimoAnio; a += paso) {
    const mes = meses.find((m) => m.startsWith(`${a}-`));
    if (mes) ticks.push(mes);
  }
  return ticks;
}

const ESTILO_TOOLTIP = {
  background: "var(--bg-tooltip)",
  border: "1px solid var(--border)",
  backdropFilter: "blur(10px)",
} as const;

/** Lo que recharts le pasa al contenido del tooltip; la fila de datos va en payload[i].payload. */
interface PropsTooltip {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: unknown }>;
}

const EJE_X = {
  stroke: "var(--text-muted)",
  tick: { fontSize: 10 },
  axisLine: false,
  tickLine: false,
  minTickGap: 12,
} as const;

const EJE_Y = {
  stroke: "var(--text-muted)",
  tick: { fontSize: 10 },
  axisLine: false,
  tickLine: false,
  width: 46,
} as const;

// ── Una serie mensual en su unidad nativa ──────────────────

interface FilaSerie {
  mes: string;
  dato: number | null;
  estimacion: number | null;
  punto: Punto;
}

interface GraficoSerieProps {
  id: string;
  puntos: Punto[];
  unidad: string;
  color: string;
  rango: Rango;
  log: boolean;
  alto?: string;
}

function TooltipSerie({ active, payload, unidad, color }: PropsTooltip & { unidad: string; color: string }) {
  if (!active || !payload?.length) return null;
  const fila = payload[0].payload as FilaSerie | undefined;
  if (!fila) return null;
  const p = fila.punto;
  const conversion = aBillones(p.valor, unidad);
  return (
    <div className="rounded-lg px-4 py-3 text-xs max-w-[280px]" style={ESTILO_TOOLTIP}>
      <p className="mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>
        {etiquetaMes(p.mes)}
      </p>
      <p className="tabular-nums font-medium" style={{ color }}>
        {formatearNumero(p.valor, decimalesPara(p.valor))}{" "}
        <span className="font-normal" style={{ color: "var(--text-muted)" }}>
          {unidad}
        </span>
      </p>
      {conversion && (
        <p className="tabular-nums text-[10px]" style={{ color: "var(--text-muted)" }}>
          ≈ {formatearNumero(conversion.valor, 2)} {conversion.unidad}
        </p>
      )}
      {p.estado !== "dato" && (
        <p className="text-[10px] mt-1" style={{ color: "var(--accent-amber)" }}>
          {p.estado}, según la fuente
        </p>
      )}
      {p.fechaOrigen && (
        <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
          dato semanal del {p.fechaOrigen}
        </p>
      )}
      {p.quiebre && (
        <p className="text-[10px] mt-1" style={{ color: "var(--text-secondary)" }}>
          quiebre: {p.quiebre}
        </p>
      )}
    </div>
  );
}

export default function GraficoSerie({ id, puntos, unidad, color, rango, log, alto = "h-[200px] sm:h-[240px]" }: GraficoSerieProps) {
  const filas = useMemo(() => {
    const recortados = recortar(puntos, rango);
    return recortados.map((p, i): FilaSerie => {
      const esEstimacion = p.estado !== "dato";
      const fila: FilaSerie = {
        mes: p.mes,
        dato: esEstimacion ? null : p.valor,
        estimacion: esEstimacion ? p.valor : null,
        punto: p,
      };
      // El primer dato después de un tramo estimado también va en la línea
      // punteada, para que las dos se toquen.
      if (!esEstimacion && i > 0 && recortados[i - 1].estado !== "dato") fila.estimacion = p.valor;
      return fila;
    });
  }, [puntos, rango]);
  const ticks = useMemo(() => ticksAnuales(filas.map((f) => f.mes)), [filas]);
  const quiebres = useMemo(() => filas.filter((f) => f.punto.quiebre !== null), [filas]);
  const hayEstimacion = filas.some((f) => f.estimacion !== null);
  const gradiente = `grad-${id}`;

  return (
    <div className={alto}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={filas} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradiente} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
          <XAxis dataKey="mes" ticks={ticks} tickFormatter={(m: string) => m.slice(0, 4)} {...EJE_X} />
          <YAxis
            {...EJE_Y}
            scale={log ? "log" : "auto"}
            domain={log ? ["auto", "auto"] : [0, "auto"]}
            allowDataOverflow={log}
            tickFormatter={formatearCompacto}
          />
          <Tooltip
            content={({ active, payload }) => <TooltipSerie active={active} payload={payload} unidad={unidad} color={color} />}
            cursor={{ stroke: "var(--border)" }}
          />
          {quiebres.map((q) => (
            <ReferenceLine key={q.mes} x={q.mes} stroke="var(--text-muted)" strokeDasharray="2 4" strokeOpacity={0.7} />
          ))}
          {hayEstimacion && (
            <Line
              type="monotone"
              dataKey="estimacion"
              name="estimación"
              stroke={color}
              strokeDasharray="4 3"
              strokeWidth={1.5}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
          )}
          <Area
            type="monotone"
            dataKey="dato"
            name="dato"
            stroke={color}
            fill={`url(#${gradiente})`}
            strokeWidth={1.75}
            connectNulls={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Un ratio publicado por ratios.py, con sus meses no aptos ──

interface FilaRatio {
  mes: string;
  apto: number | null;
  noApto: number | null;
  punto: PuntoRatio;
}

interface GraficoRatioProps {
  id: string;
  puntos: PuntoRatio[];
  unidad: string;
  color: string;
  rango: Rango;
  log: boolean;
  /** Qué significa que un mes no sea apto antes de cierto mes (A-R0-17). */
  notaNoApto: string;
  alto?: string;
}

function TooltipRatio({ active, payload, unidad, color, notaNoApto }: PropsTooltip & { unidad: string; color: string; notaNoApto: string }) {
  if (!active || !payload?.length) return null;
  const fila = payload[0].payload as FilaRatio | undefined;
  if (!fila) return null;
  const p = fila.punto;
  return (
    <div className="rounded-lg px-4 py-3 text-xs max-w-[280px]" style={ESTILO_TOOLTIP}>
      <p className="mb-1 font-medium" style={{ color: "var(--text-secondary)" }}>
        {etiquetaMes(p.mes)}
      </p>
      <p className="tabular-nums font-medium" style={{ color }}>
        {formatearNumero(p.valor, decimalesPara(p.valor))}{" "}
        <span className="font-normal" style={{ color: "var(--text-muted)" }}>
          {unidad}
        </span>
      </p>
      <p className="text-[10px] mt-1 tabular-nums" style={{ color: "var(--text-muted)" }}>
        error máximo por redondeo {formatearNumero(p.errorRedondeoPct, 4)} %
      </p>
      {p.enDisputa && (
        <p className="text-[10px] mt-1" style={{ color: "var(--accent-amber)" }}>
          valor en disputa con la segunda fuente (A-R0-20)
        </p>
      )}
      {!p.apto && (
        <p className="text-[10px] mt-1" style={{ color: "var(--accent-amber)" }}>
          no apto para métricas: {p.enDisputa ? "valor en disputa" : notaNoApto}
        </p>
      )}
    </div>
  );
}

export function GraficoRatio({ id, puntos, unidad, color, rango, log, notaNoApto, alto = "h-[200px] sm:h-[240px]" }: GraficoRatioProps) {
  const filas = useMemo(() => {
    const recortados = recortar(puntos, rango);
    return recortados.map((p, i): FilaRatio => {
      const fila: FilaRatio = { mes: p.mes, apto: p.apto ? p.valor : null, noApto: p.apto ? null : p.valor, punto: p };
      // Los tramos se tocan: el mes que cambia de estado va en las dos líneas.
      if (i > 0 && recortados[i - 1].apto !== p.apto) {
        fila.apto = p.valor;
        fila.noApto = p.valor;
      }
      return fila;
    });
  }, [puntos, rango]);
  const ticks = useMemo(() => ticksAnuales(filas.map((f) => f.mes)), [filas]);
  const hayNoAptos = filas.some((f) => f.noApto !== null);
  const gradiente = `grad-${id}`;

  return (
    <div className={alto}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={filas} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradiente} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
          <XAxis dataKey="mes" ticks={ticks} tickFormatter={(m: string) => m.slice(0, 4)} {...EJE_X} />
          <YAxis
            {...EJE_Y}
            scale={log ? "log" : "auto"}
            domain={log ? ["auto", "auto"] : [0, "auto"]}
            allowDataOverflow={log}
            tickFormatter={formatearCompacto}
          />
          <Tooltip
            content={({ active, payload }) => (
              <TooltipRatio active={active} payload={payload} unidad={unidad} color={color} notaNoApto={notaNoApto} />
            )}
            cursor={{ stroke: "var(--border)" }}
          />
          {hayNoAptos && (
            <Line
              type="monotone"
              dataKey="noApto"
              name="no apto para métricas"
              stroke={color}
              strokeOpacity={0.45}
              strokeDasharray="3 3"
              strokeWidth={1.25}
              dot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
          )}
          <Area
            type="monotone"
            dataKey="apto"
            name="apto para métricas"
            stroke={color}
            fill={`url(#${gradiente})`}
            strokeWidth={1.75}
            connectNulls={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
