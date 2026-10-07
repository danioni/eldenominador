"use client";

import { useMemo, useState } from "react";
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Datos, PuntoAgregado, Ratio, SeriePublicada } from "@/lib/series";
import { aBillones, decimalesPara, etiquetaMes, formatearCompacto, formatearNumero, formatearPct } from "@/lib/formato";
import { COLORES, type Colores } from "./theme";
import MetricCard from "./MetricCard";
import ChartSection from "./ChartSection";
import GraficoSerie, { GraficoRatio, RANGOS, recortar, ticksAnuales, type Rango } from "./GraficoSerie";
import TarjetaNoMedida from "./TarjetaNoMedida";
import Fichas from "./Fichas";
import { CREDITO_API_BOJ, usaApiBoj } from "@/lib/creditos";

// ── Controles ──────────────────────────────────────────────

function SelectorRango({ rango, onChange }: { rango: Rango; onChange: (r: Rango) => void }) {
  return (
    <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--controls-bg)", border: "1px solid var(--border-subtle)" }}>
      {RANGOS.map((opcion) => {
        const activo = rango === opcion.clave;
        return (
          <button
            key={opcion.clave}
            onClick={() => onChange(opcion.clave)}
            className="px-2.5 sm:px-3.5 py-1.5 rounded-md text-[9px] sm:text-[10px] tracking-wider uppercase transition-all"
            style={{
              background: activo ? "var(--accent-bg-active)" : "transparent",
              color: activo ? "var(--accent)" : "var(--text-muted)",
              border: activo ? "1px solid var(--accent-border-active)" : "1px solid transparent",
              boxShadow: activo ? "var(--accent-glow)" : "none",
            }}
          >
            {opcion.etiqueta}
          </button>
        );
      })}
    </div>
  );
}

function BotonLog({ activo, onToggle }: { activo: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="px-3.5 py-1.5 rounded-md text-[10px] tracking-wider uppercase transition-all"
      style={{
        background: activo ? "var(--accent-bg-active)" : "transparent",
        color: activo ? "var(--accent)" : "var(--text-muted)",
        border: activo ? "1px solid var(--accent-border-active)" : "1px solid var(--border-subtle)",
      }}
      aria-pressed={activo}
    >
      Log
    </button>
  );
}

function Leyenda({ items }: { items: { color: string; label: string; dashed?: boolean }[] }) {
  return (
    <div className="flex flex-wrap gap-4 mt-4 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          {item.dashed ? (
            <div className="w-4 h-0" style={{ borderTop: `2px dashed ${item.color}` }} />
          ) : (
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
          )}
          <span className="text-[10px] tracking-wider" style={{ color: "var(--text-muted)" }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function Nota({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] leading-relaxed mt-3" style={{ color: "var(--text-muted)" }}>
      {children}
    </p>
  );
}

// ── Una serie pequeña con su encabezado ────────────────────

/** "2001-01: ampliación de la zona del euro: Grecia" → "2001-01 Grecia" */
function quiebreCorto(q: string): string {
  const partes = q.split(": ");
  return partes.length > 2 ? `${partes[0]} ${partes.slice(2).join(": ")}` : q.replace(": ", " ");
}

function PanelSerie({ serie, color, rango, log, titulo }: { serie: SeriePublicada; color: string; rango: Rango; log: boolean; titulo: string }) {
  const { ficha, ultimo, interanualPct } = serie;
  const conversion = aBillones(ultimo.valor, ficha.unidad);
  const estimados = serie.puntos.filter((p) => p.estado !== "dato");
  return (
    <div className="card-glass rounded-xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="min-w-0">
          <h3 className="font-serif text-base tracking-wide" style={{ color: "var(--text-primary)" }}>
            {titulo}
          </h3>
          <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
            {ficha.nombre} · {ficha.convencion}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="tabular-nums text-sm" style={{ color: "var(--text-primary)" }}>
            {formatearNumero(ultimo.valor, decimalesPara(ultimo.valor))}
          </p>
          <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>
            {ficha.unidad} · {etiquetaMes(ultimo.mes)}
          </p>
          {conversion && (
            <p className="text-[9px] tabular-nums" style={{ color: "var(--text-muted)" }}>
              ≈ {formatearNumero(conversion.valor, 2)} {conversion.unidad}
            </p>
          )}
          {interanualPct !== null && (
            <p className="text-[9px] tabular-nums" style={{ color: "var(--text-secondary)" }}>
              {formatearPct(interanualPct)} interanual · cálculo propio
            </p>
          )}
        </div>
      </div>
      <GraficoSerie id={ficha.serie} puntos={serie.puntos} unidad={ficha.unidad} color={color} rango={rango} log={log} />
      <p className="text-[9px] leading-relaxed mt-2" style={{ color: "var(--text-muted)" }}>
        {ficha.fuente}
        {ficha.identificador && ` · ${ficha.identificador}`}. Desde {etiquetaMes(ficha.primerMes)}, {ficha.meses} meses.
        {estimados.length > 0 &&
          ` Línea punteada, ${etiquetaMes(estimados[0].mes)} a ${etiquetaMes(estimados[estimados.length - 1].mes)}: estimación según la fuente (${ficha.supuestos.includes("A-D0-5") ? "A-D0-5" : "ver ficha"}).`}
        {ficha.quiebres.length > 2 &&
          ` Líneas verticales, quiebres declarados: ${ficha.quiebres.map(quiebreCorto).join(" · ")}.`}
        {ficha.quiebres.length > 0 && ficha.quiebres.length <= 2 && ` Línea vertical: ${ficha.quiebres.join("; ")}.`}
      </p>
      {usaApiBoj(ficha.atribucion) && (
        <p className="text-[9px] leading-relaxed mt-1.5" lang="en" style={{ color: "var(--text-secondary)" }}>
          {CREDITO_API_BOJ}
        </p>
      )}
    </div>
  );
}

function PanelRatio({ ratio, color, rango, log, unidad, notaNoApto }: { ratio: Ratio; color: string; rango: Rango; log: boolean; unidad: string; notaNoApto: string }) {
  const noAptos = ratio.meses - ratio.mesesAptos;
  return (
    <div className="card-glass rounded-xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="min-w-0">
          <h3 className="font-serif text-base tracking-wide" style={{ color: "var(--text-primary)" }}>
            {ratio.nombre}
          </h3>
          <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
            promedio mensual en los dos lados
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="tabular-nums text-sm" style={{ color: "var(--text-primary)" }}>
            {formatearNumero(ratio.ultimo.valor, decimalesPara(ratio.ultimo.valor))}
          </p>
          <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>
            {unidad} · {etiquetaMes(ratio.ultimo.mes)}
          </p>
          {ratio.interanualPct !== null && (
            <p className="text-[9px] tabular-nums" style={{ color: "var(--text-secondary)" }}>
              {formatearPct(ratio.interanualPct)} interanual · cálculo propio
            </p>
          )}
        </div>
      </div>
      <GraficoRatio id={ratio.par} puntos={ratio.puntos} unidad={unidad} color={color} rango={rango} log={log} notaNoApto={notaNoApto} />
      <p className="text-[9px] leading-relaxed mt-2" style={{ color: "var(--text-muted)" }}>
        Desde {etiquetaMes(ratio.primerMes)}, {ratio.meses} meses; apto para métricas desde {etiquetaMes(ratio.aptoDesde)}, {ratio.mesesAptos} meses.
        {noAptos > 0 && ` Punteado: ${noAptos} meses no aptos (A-R0-17)`}
        {ratio.mesesEnDisputa > 0 && `, ${ratio.mesesEnDisputa} de ellos con el valor en disputa (A-R0-20)`}
        {noAptos > 0 && "."}
      </p>
    </div>
  );
}

// ── El agregado en USD ─────────────────────────────────────

interface FilaAgregado {
  mes: string;
  eeuu: number;
  eurozona: number;
  japon: number;
  total: number;
  totalTcConstante: number;
}

function TooltipAgregado({ active, payload, colores, mesBase }: { active?: boolean; payload?: ReadonlyArray<{ payload?: unknown }>; colores: Colores; mesBase: string }) {
  if (!active || !payload?.length) return null;
  const f = payload[0].payload as FilaAgregado | undefined;
  if (!f) return null;
  const filas = [
    { label: "EE.UU.", valor: f.eeuu, color: colores.blue },
    { label: "Eurozona", valor: f.eurozona, color: colores.purple },
    { label: "Japón", valor: f.japon, color: colores.amber },
  ];
  return (
    <div className="rounded-lg px-4 py-3 text-xs max-w-[300px]" style={{ background: "var(--bg-tooltip)", border: "1px solid var(--border)", backdropFilter: "blur(10px)" }}>
      <p className="mb-2 font-medium" style={{ color: "var(--text-secondary)" }}>
        {etiquetaMes(f.mes)} · miles de millones de USD
      </p>
      {filas.map((r) => (
        <div key={r.label} className="flex items-center gap-2 py-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
          <span style={{ color: "var(--text-muted)" }}>{r.label}:</span>
          <span className="font-medium tabular-nums ml-auto" style={{ color: r.color }}>
            {formatearNumero(r.valor, 1)}
          </span>
        </div>
      ))}
      <div className="mt-1 pt-1 space-y-0.5" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 py-0.5">
          <span style={{ color: "var(--text-muted)" }}>Suma:</span>
          <span className="font-medium tabular-nums ml-auto" style={{ color: "var(--text-primary)" }}>
            {formatearNumero(f.total, 1)}
          </span>
        </div>
        <div className="flex items-center gap-2 py-0.5">
          <span style={{ color: "var(--text-muted)" }}>A tipo de cambio de {etiquetaMes(mesBase)}:</span>
          <span className="font-medium tabular-nums ml-auto" style={{ color: "var(--text-secondary)" }}>
            {formatearNumero(f.totalTcConstante, 1)}
          </span>
        </div>
        <p className="text-[10px] tabular-nums" style={{ color: "var(--text-muted)" }}>
          efecto del tipo de cambio: {formatearNumero(f.total - f.totalTcConstante, 1)} (cálculo propio, A-D0-11)
        </p>
      </div>
    </div>
  );
}

function GraficoAgregado({ puntos, rango, colores, mesBase }: { puntos: PuntoAgregado[]; rango: Rango; colores: Colores; mesBase: string }) {
  const filas = useMemo(() => recortar(puntos, rango), [puntos, rango]);
  const ticks = useMemo(() => ticksAnuales(filas.map((f) => f.mes)), [filas]);
  return (
    <div className="h-[260px] sm:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={filas} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {[
              ["gradAgEeuu", colores.blue],
              ["gradAgEurozona", colores.purple],
              ["gradAgJapon", colores.amber],
            ].map(([id, color]) => (
              <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.45} />
                <stop offset="100%" stopColor={color} stopOpacity={0.08} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
          <XAxis dataKey="mes" ticks={ticks} tickFormatter={(m: string) => m.slice(0, 4)} stroke="var(--text-muted)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={12} />
          <YAxis stroke="var(--text-muted)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={46} domain={[0, "auto"]} tickFormatter={formatearCompacto} />
          <Tooltip content={({ active, payload }) => <TooltipAgregado active={active} payload={payload} colores={colores} mesBase={mesBase} />} cursor={{ stroke: "var(--border)" }} />
          <Area type="monotone" dataKey="eeuu" name="EE.UU." stackId="1" stroke={colores.blue} fill="url(#gradAgEeuu)" strokeWidth={1.25} isAnimationActive={false} />
          <Area type="monotone" dataKey="eurozona" name="Eurozona" stackId="1" stroke={colores.purple} fill="url(#gradAgEurozona)" strokeWidth={1.25} isAnimationActive={false} />
          <Area type="monotone" dataKey="japon" name="Japón" stackId="1" stroke={colores.amber} fill="url(#gradAgJapon)" strokeWidth={1.25} isAnimationActive={false} />
          <Line type="monotone" dataKey="totalTcConstante" name="a tipo de cambio constante" stroke={colores.green} strokeDasharray="5 4" strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── La página ──────────────────────────────────────────────

export default function Dashboard({ datos }: { datos: Datos }) {
  const [rango, setRango] = useState<Rango>("todo");
  const [log, setLog] = useState(false);
  const colores = COLORES;
  const { series, agregado, ratios, fichas, citas } = datos;

  const m2eeuu = series.m2_eeuu;
  const m2eurozona = series.m2_eurozona;
  const m2japon = series.m2_japon;
  const fed = series.balance_fed;
  const eurosistema = series.balance_eurosistema;
  const boj = series.balance_boj;
  const oro = ratios.find((r) => r.par === "oro_m2_eeuu");
  const btc = ratios.find((r) => r.par === "btc_m2_eeuu");

  const noMedidas = (ids: string[]) => ids.map((id) => fichas.find((f) => f.serie === id && !f.publicada)).filter((f): f is NonNullable<typeof f> => f !== undefined);
  const china = noMedidas(["dinero_amplio_china"]);
  const pboc = noMedidas(["balance_pboc"]);
  const antesDe1959 = noMedidas(["dinero_eeuu_1892_1946", "dinero_eeuu_1947_1958"]);
  const riqueza = noMedidas(["riqueza_total", "riqueza_inmuebles", "riqueza_bonos", "riqueza_acciones", "riqueza_oro_cantidad", "riqueza_btc"]);

  const primero = agregado.puntos[0];
  const ultimo = agregado.ultimo;
  const conversionAgregado = aBillones(ultimo.total, agregado.unidad);
  const conversionEeuu = aBillones(m2eeuu.ultimo.valor, m2eeuu.ficha.unidad);
  const conversionFed = aBillones(fed.ultimo.valor, fed.ficha.unidad);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
      {/* Tesis */}
      <div className="mb-8 sm:mb-12 fade-in-up pt-4">
        <p className="text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: "var(--text-muted)" }}>
          Tesis
        </p>
        <p className="font-serif text-3xl sm:text-4xl md:text-5xl leading-[1.15] tracking-tight" style={{ color: "var(--text-primary)" }}>
          Los precios no suben.
          <br />
          <span className="glow-accent" style={{ color: "var(--accent)" }}>
            El dinero se encoge.
          </span>
        </p>
        <p className="mt-3 sm:mt-4 text-xs sm:text-sm max-w-2xl leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Todo precio es una fracción: arriba, lo que se compra; abajo, la moneda con que se mide. Esta página muestra el de
          abajo con las series que publican sus emisores: el M2 de EE.UU., la Eurozona y Japón, los balances de la Reserva
          Federal, el Eurosistema y el Banco de Japón, y el oro y BTC medidos contra el M2 de EE.UU. Cada cifra lleva su
          fuente, su unidad y su convención. Lo que no se pudo medir figura como no medido, con el motivo.
        </p>
        <div className="divider-gradient mt-6 sm:mt-8" />
      </div>

      {/* ¿Qué es el denominador? */}
      <div className="mb-10 sm:mb-14 fade-in-up fade-in-up-2">
        <h2 className="font-serif text-xl sm:text-2xl mb-4" style={{ color: "var(--text-primary)" }}>
          ¿Qué es el denominador?
        </h2>
        <div className="card-glass rounded-xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
            <div className="text-center shrink-0">
              <div className="text-sm tracking-wider uppercase mb-2" style={{ color: "var(--text-muted)" }}>
                Precio
              </div>
              <div className="relative">
                <div className="text-xl sm:text-2xl font-light" style={{ color: "var(--text-primary)" }}>
                  Lo que se compra
                </div>
                <div className="h-[2px] my-2" style={{ background: "var(--accent)" }} />
                <div className="text-xl sm:text-2xl font-light glow-accent" style={{ color: "var(--accent)" }}>
                  La moneda &larr;
                </div>
              </div>
            </div>
            <div className="text-xs sm:text-sm leading-relaxed max-w-xl" style={{ color: "var(--text-secondary)" }}>
              <p className="mb-3">
                Cuando se dice que &laquo;el pan subió&raquo;, se da por fijo el denominador. No lo es: la cantidad de dinero
                cambia todos los meses, y con ella el tamaño de la unidad con que se mide todo lo demás.
              </p>
              <p>
                Entre {etiquetaMes(primero.mes)} y {etiquetaMes(ultimo.mes)}, el M2 de EE.UU., la Eurozona y Japón sumado en
                USD pasó de {formatearNumero(primero.total, 0)} a {formatearNumero(ultimo.total, 0)} miles de millones:{" "}
                {formatearNumero(ultimo.total / primero.total, 2)} veces. A tipo de cambio constante de{" "}
                {etiquetaMes(primero.mes)}, {formatearNumero(ultimo.totalTcConstante / primero.totalTcConstante, 2)} veces.
                Es un cálculo propio sobre las series de la Junta de la Reserva Federal, el BCE y el Banco de Japón
                (A-D0-10, A-D0-11).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="flex justify-end items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <BotonLog activo={log} onToggle={() => setLog(!log)} />
        <SelectorRango rango={rango} onChange={setRango} />
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-10">
        <MetricCard
          label="M2 de tres economías"
          valor={formatearNumero(ultimo.total, 0)}
          unidad={agregado.unidad}
          conversion={conversionAgregado && `≈ ${formatearNumero(conversionAgregado.valor, 2)} ${conversionAgregado.unidad}`}
          interanualPct={agregado.interanualPct}
          mes={etiquetaMes(ultimo.mes)}
          origen="Cálculo propio: EE.UU. + Eurozona + Japón, series sin ajustar, al tipo de cambio del H.10 de cada mes (A-D0-10). China queda fuera (A-D0-9)."
          delay={1}
        />
        <MetricCard
          label="M2 de EE.UU."
          valor={formatearNumero(m2eeuu.ultimo.valor, 1)}
          unidad={m2eeuu.ficha.unidad}
          conversion={conversionEeuu && `≈ ${formatearNumero(conversionEeuu.valor, 2)} ${conversionEeuu.unidad}`}
          interanualPct={m2eeuu.interanualPct}
          mes={etiquetaMes(m2eeuu.ultimo.mes)}
          origen={`${m2eeuu.ficha.fuente} · ${m2eeuu.ficha.identificador}, ${m2eeuu.ficha.ajusteEstacional}.`}
          delay={2}
        />
        <MetricCard
          label="Balance de la Fed"
          valor={formatearNumero(fed.ultimo.valor, 0)}
          unidad={fed.ficha.unidad}
          conversion={conversionFed && `≈ ${formatearNumero(conversionFed.valor, 2)} ${conversionFed.unidad}`}
          interanualPct={fed.interanualPct}
          mes={etiquetaMes(fed.ultimo.mes)}
          origen={`${fed.ficha.fuente} · ${fed.ficha.identificador}; ${fed.ficha.convencion} (A-D0-14).`}
          delay={3}
        />
        {oro && (
          <MetricCard
            label="Oro / M2 de EE.UU."
            valor={formatearNumero(oro.ultimo.valor, 1)}
            unidad="USD por onza troy, por cada billón de USD de M2"
            interanualPct={oro.interanualPct}
            mes={etiquetaMes(oro.ultimo.mes)}
            origen="losratios, ratios.py: precio del oro del Pink Sheet del Banco Mundial sobre el M2 ajustado de EE.UU. en billones de USD (A-D0-21)."
            delay={4}
          />
        )}
      </div>

      {/* Agregado */}
      <ChartSection
        title="M2 de tres economías — EE.UU., Eurozona y Japón, sumados en USD"
        subtitle={`Cálculo propio sobre las series oficiales sin ajustar, al tipo de cambio del H.10 de la Junta de cada mes; la línea punteada repite la suma al tipo de cambio de ${etiquetaMes(agregado.primerMes)}, y la diferencia entre las dos es el efecto del tipo de cambio (A-D0-10, A-D0-11). Escala lineal. Desde ${etiquetaMes(agregado.primerMes)}, cuando empieza el M2 de Japón.`}
        delay={3}
      >
        <GraficoAgregado puntos={agregado.puntos} rango={rango} colores={colores} mesBase={agregado.primerMes} />
        <Leyenda
          items={[
            { color: colores.blue, label: "EE.UU. (promedio mensual)" },
            { color: colores.purple, label: "Eurozona (saldo a fin de mes)" },
            { color: colores.amber, label: "Japón (promedio de saldos)" },
            { color: colores.green, label: `Suma a tipo de cambio de ${etiquetaMes(agregado.primerMes)}`, dashed: true },
          ]}
        />
        <Nota>
          La suma mezcla promedios mensuales con saldos de fin de mes, porque cada emisor publica una sola convención.
          Por eso no se publica ningún ratio contra ella (A-D0-12). El dinero amplio de China no entra: su definición no
          es comparable con las otras tres y la serie está sin validar (A-D0-9). El Índice Denominador 60/40 que mostraba
          este sitio se retiró: la ponderación no tenía fuente, la base 1913 no tiene dato en ninguna serie y el efectivo
          estaba en los dos lados (A-D0-13).
        </Nota>
      </ChartSection>

      {/* Dinero por economía */}
      <div className="mt-10 sm:mt-14">
        <h2 className="font-serif text-xl sm:text-2xl mb-1" style={{ color: "var(--text-primary)" }}>
          Dinero, economía por economía
        </h2>
        <p className="text-[11px] leading-relaxed max-w-3xl mb-4" style={{ color: "var(--text-muted)" }}>
          Cada M2 en su moneda, su unidad y su convención nativas, desde donde empieza su fuente oficial; sin empalmes y
          sin interpolar (A-D0-1). Los valores se publican sin cambios; la variación interanual es el único cálculo propio.
        </p>
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-5">
          <PanelSerie titulo="EE.UU." serie={m2eeuu} color={colores.blue} rango={rango} log={log} />
          <PanelSerie titulo="Eurozona" serie={m2eurozona} color={colores.purple} rango={rango} log={log} />
          <PanelSerie titulo="Japón" serie={m2japon} color={colores.amber} rango={rango} log={log} />
          <TarjetaNoMedida
            titulo="China"
            descripcion="El dinero amplio de China sale de la OCDE con el rótulo que le pone la fuente, «M3», y nunca como M2. Se publica cuando tenga tres lecturas en pantalla de la Oficina Nacional de Estadísticas; hoy hay dos (A-D0-25)."
            fichas={china}
            delay={2}
          />
        </div>
      </div>

      {/* Balances */}
      <div className="mt-10 sm:mt-14">
        <h2 className="font-serif text-xl sm:text-2xl mb-1" style={{ color: "var(--text-primary)" }}>
          Balances de bancos centrales
        </h2>
        <p className="text-[11px] leading-relaxed max-w-3xl mb-4" style={{ color: "var(--text-muted)" }}>
          Total de activos de cada banco central, en su moneda. Los balances semanales de la Fed y del Eurosistema pasan a
          mensual con el último dato fechado dentro del mes, cuya fecha se ve en cada punto (A-D0-14). Los quiebres se
          declaran, no se corrigen (A-D0-16).
        </p>
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-5">
          <PanelSerie titulo="Reserva Federal" serie={fed} color={colores.blue} rango={rango} log={log} />
          <PanelSerie titulo="Eurosistema" serie={eurosistema} color={colores.purple} rango={rango} log={log} />
          <PanelSerie titulo="Banco de Japón" serie={boj} color={colores.amber} rango={rango} log={log} />
          <TarjetaNoMedida
            titulo="Banco Popular de China"
            descripcion="El balance del PBoC sale del BIS, que empalma la serie. Las únicas lecturas de la tabla del propio PBoC vinieron de descargas automáticas de su sitio, que su robots.txt veda, y se descartaron; dos valores leídos a mano por una persona lo destraban (A-D0-9)."
            fichas={pboc}
            delay={2}
          />
        </div>
      </div>

      {/* Activos contra el M2 */}
      <div className="mt-10 sm:mt-14">
        <h2 className="font-serif text-xl sm:text-2xl mb-1" style={{ color: "var(--text-primary)" }}>
          Activos medidos en M2 de EE.UU.
        </h2>
        <p className="text-[11px] leading-relaxed max-w-3xl mb-4" style={{ color: "var(--text-muted)" }}>
          El precio mensual del activo dividido por el M2 ajustado de EE.UU. en billones (10¹²) de USD; los dos lados son
          promedios mensuales (A-D0-21). Sin base 100: lo que se muestra es el ratio tal como lo publica losratios. El S&P
          500 contra el M2 queda no medido hasta tener el permiso del dueño del índice (FUENTES.md, D0.10.5).
        </p>
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-5">
          {oro && (
            <PanelRatio
              ratio={oro}
              color={colores.amber}
              rango={rango}
              log={log}
              unidad="USD por onza troy, por billón de USD de M2"
              notaNoApto="antes del mercado libre del oro o con error por redondeo mayor que 0.5 % (A-R0-17)"
            />
          )}
          {btc && (
            <PanelRatio
              ratio={btc}
              color={colores.orange}
              rango={rango}
              log={log}
              unidad="USD por BTC, por billón de USD de M2"
              notaNoApto="error por redondeo mayor que 0.5 % (A-R0-17)"
            />
          )}
        </div>
      </div>

      {/* Lo que no se mide todavía */}
      <div className="mt-10 sm:mt-14">
        <h2 className="font-serif text-xl sm:text-2xl mb-1" style={{ color: "var(--text-primary)" }}>
          Lo que todavía no se mide
        </h2>
        <p className="text-[11px] leading-relaxed max-w-3xl mb-4" style={{ color: "var(--text-muted)" }}>
          Este sitio mostraba series desde 1913 y una riqueza global por clase de activo. Ninguna tenía una fuente que se
          pudiera leer y reproducir, así que se retiraron. Lo que las reemplaza se lista aquí con su estado, tal como
          figura en serie_D0.csv.
        </p>
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-5">
          <TarjetaNoMedida
            titulo="EE.UU. antes de 1959"
            descripcion="El M2 del H.6 empieza en 1959-01. Antes hay dos publicaciones de la Junta con otro concepto, «efectivo y depósitos en bancos comerciales», que irán como series separadas, sin empalmar y con los quiebres a la vista (A-D0-17). La transcripción se hace dos veces, de forma independiente, con la página de origen de cada cifra (A-D0-19)."
            fichas={antesDe1959}
            delay={1}
          />
          <TarjetaNoMedida
            titulo="Riqueza por clase de activo"
            descripcion="No hay series globales con licencia abierta para inmuebles, oro sobre la superficie ni riqueza total (A-D0-24). Bonos, acciones y BTC tienen fuente prevista y están pendientes de implementar. Las cifras de Savills y del World Gold Council se citan tal cual, fuera de todo cálculo (A-D0-28)."
            fichas={riqueza}
            citas={citas}
            delay={2}
          />
        </div>
      </div>

      {/* Fichas */}
      <div className="mt-10 sm:mt-14">
        <h2 className="font-serif text-xl sm:text-2xl mb-1" style={{ color: "var(--text-primary)" }}>
          Fichas de las series
        </h2>
        <p className="text-[11px] leading-relaxed max-w-3xl mb-4" style={{ color: "var(--text-muted)" }}>
          Para cada serie: emisor, fuente e identificador, unidad y convención, cómo se validó contra una segunda fuente,
          licencia y atribución, los supuestos que la rigen y sus quiebres. Es el contenido de serie_D0.csv de losratios.
        </p>
        <div className="card-glass rounded-xl p-4 sm:p-6">
          <Fichas fichas={fichas} />
        </div>
      </div>

      {/* Cierre */}
      <div className="mt-12 mb-8 sm:mt-16 sm:mb-10 fade-in-up text-center">
        <div className="divider-gradient mb-6 sm:mb-8" />
        <p className="font-serif text-2xl sm:text-3xl md:text-4xl leading-tight tracking-tight" style={{ color: "var(--text-primary)" }}>
          ¿Quién dijo que el dinero era{" "}
          <span className="glow-accent" style={{ color: "var(--accent)" }}>
            escaso
          </span>
          ?
        </p>
        <div className="divider-gradient mt-6 sm:mt-8" />
      </div>

      <div className="mt-10 text-center fade-in-up">
        <div className="card-glass rounded-xl p-6 sm:p-8 max-w-2xl mx-auto">
          <p className="font-serif text-lg sm:text-xl mb-2" style={{ color: "var(--text-primary)" }}>
            La fracción tiene dos lados
          </p>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Esta página es el de abajo.{" "}
            <a href="https://elnumerador.com" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--accent)" }}>
              El Numerador
            </a>{" "}
            muestra el de arriba, y{" "}
            <a href="https://losratios.com" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--accent)" }}>
              Los Ratios
            </a>
            , un activo medido en otro.
          </p>
        </div>
      </div>
    </div>
  );
}
