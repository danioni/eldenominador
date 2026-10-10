"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Datos, Ficha, PuntoAgregado, Ratio, SeriePublicada } from "@/lib/series";
import { aBillones, decimalesPara, etiquetaMes, formatearEje, formatearNumero, formatearPct, valorConUnidad } from "@/lib/formato";
import { COLORES, type Colores } from "./theme";
import MetricCard from "./MetricCard";
import ChartSection from "./ChartSection";
import GraficoSerie, { EJE_X, EJE_Y, ESTILO_TOOLTIP, GraficoRatio, RANGOS, RotuloEje, recortar, ticksAnuales, type Rango } from "./GraficoSerie";
import TarjetaNoMedida from "./TarjetaNoMedida";
import Fichas, { DetalleFicha, fuenteCorta, quiebreCorto } from "./Fichas";
import Interpretacion from "./Interpretacion";
import Desplegable from "./Desplegable";
import { CREDITO_API_BOJ, usaApiBoj } from "@/lib/creditos";

// ── Controles ──────────────────────────────────────────────

function SelectorRango({ rango, onChange }: { rango: Rango; onChange: (r: Rango) => void }) {
  return (
    <div className="flex gap-1 p-1 rounded-lg" role="group" aria-label="Rango de años" style={{ background: "var(--controls-bg)", border: "1px solid var(--border-subtle)" }}>
      {RANGOS.map((opcion) => {
        const activo = rango === opcion.clave;
        return (
          <button
            key={opcion.clave}
            onClick={() => onChange(opcion.clave)}
            className="font-mono px-2.5 sm:px-3.5 py-1.5 rounded-md text-[10px] sm:text-[11px] tracking-wider uppercase transition-all"
            style={{
              background: activo ? "var(--accent-bg-active)" : "transparent",
              color: activo ? "var(--accent)" : "var(--text-muted)",
              border: activo ? "1px solid var(--accent-border-active)" : "1px solid transparent",
              boxShadow: activo ? "var(--accent-glow)" : "none",
            }}
            aria-pressed={activo}
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
      className="font-mono px-3.5 py-1.5 rounded-md text-[10px] sm:text-[11px] tracking-wider uppercase transition-all"
      style={{
        background: activo ? "var(--accent-bg-active)" : "transparent",
        color: activo ? "var(--accent)" : "var(--text-muted)",
        border: activo ? "1px solid var(--accent-border-active)" : "1px solid var(--border-subtle)",
      }}
      aria-pressed={activo}
      title="Escala logarítmica en el eje vertical"
    >
      Log
    </button>
  );
}

type TrazoLeyenda = "linea" | "punteada" | "vertical";

function Leyenda({ items }: { items: { color: string; label: string; trazo?: TrazoLeyenda }[] }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          {item.trazo === "punteada" ? (
            <div className="w-4 h-0" style={{ borderTop: `2px dashed ${item.color}` }} />
          ) : item.trazo === "vertical" ? (
            <div className="w-0 h-3" style={{ borderLeft: `2px dotted ${item.color}` }} />
          ) : (
            <div className="w-4 h-0" style={{ borderTop: `2px solid ${item.color}` }} />
          )}
          <span className="meta">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function Encabezado({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="font-serif text-2xl sm:text-3xl mb-2" style={{ color: "var(--text-primary)" }}>
        {titulo}
      </h2>
      <p className="texto max-w-3xl">{children}</p>
    </div>
  );
}

// ── La cabecera numérica de un panel ──────────────────────

function CifraPanel({ valor, unidad, mes, interanualPct }: { valor: number; unidad: string; mes: string; interanualPct: number | null }) {
  const billones = aBillones(valor, unidad);
  return (
    <div className="sm:text-right sm:shrink-0">
      {billones ? (
        <>
          <p className="font-mono tabular-nums text-lg leading-tight" style={{ color: "var(--text-primary)" }}>
            {formatearNumero(billones.valor, 2)} <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{billones.unidad}</span>
          </p>
          <p className="meta tabular-nums">= {valorConUnidad(valor, unidad)}</p>
        </>
      ) : (
        <>
          <p className="font-mono tabular-nums text-lg leading-tight" style={{ color: "var(--text-primary)" }}>
            {formatearNumero(valor, decimalesPara(valor))}
          </p>
          <p className="meta">{unidad}</p>
        </>
      )}
      <p className="meta tabular-nums" style={{ color: "var(--text-secondary)" }}>
        {etiquetaMes(mes)}
        {interanualPct !== null && <> · {formatearPct(interanualPct)} interanual, cálculo propio</>}
      </p>
    </div>
  );
}

// ── Una serie con su encabezado, su gráfico y su lectura ───

interface PanelSerieProps {
  serie: SeriePublicada;
  color: string;
  rango: Rango;
  log: boolean;
  titulo: string;
  queMuestra: ReactNode;
  comoInterpretarlo: ReactNode;
}

function PanelSerie({ serie, color, rango, log, titulo, queMuestra, comoInterpretarlo }: PanelSerieProps) {
  const { ficha, ultimo, interanualPct } = serie;
  const estimados = serie.puntos.filter((p) => p.estado !== "dato");
  const leyenda: { color: string; label: string; trazo?: TrazoLeyenda }[] = [{ color, label: "dato" }];
  if (estimados.length > 0) {
    leyenda.push({ color, label: `estimación según la fuente, ${etiquetaMes(estimados[0].mes)} a ${etiquetaMes(estimados[estimados.length - 1].mes)}`, trazo: "punteada" });
  }
  if (ficha.quiebres.length > 0) leyenda.push({ color: "var(--text-secondary)", label: "quiebre declarado", trazo: "vertical" });

  return (
    <div className="card-glass rounded-xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3">
        <div className="min-w-0">
          <h3 className="font-serif text-xl tracking-wide" style={{ color: "var(--text-primary)" }}>
            {titulo}
          </h3>
          <p className="meta mt-0.5">
            {ficha.nombre} · {ficha.convencion}
          </p>
        </div>
        <CifraPanel valor={ultimo.valor} unidad={ficha.unidad} mes={ultimo.mes} interanualPct={interanualPct} />
      </div>
      <GraficoSerie id={ficha.serie} puntos={serie.puntos} unidad={ficha.unidad} color={color} rango={rango} log={log} />
      <Leyenda items={leyenda} />
      {ficha.quiebres.length > 0 && (
        <p className="meta mt-2">
          Quiebres: {ficha.quiebres.map(quiebreCorto).join(" · ")}.
        </p>
      )}
      <Interpretacion queMuestra={queMuestra} comoInterpretarlo={comoInterpretarlo} />
      <p className="meta mt-3">
        Fuente:{" "}
        {ficha.url ? (
          <a href={ficha.url} target="_blank" rel="noopener noreferrer">
            {fuenteCorta(ficha.fuente)}
          </a>
        ) : (
          fuenteCorta(ficha.fuente)
        )}{" "}
        · desde {etiquetaMes(ficha.primerMes)}, {ficha.meses} meses. Valores publicados sin cambios.
      </p>
      {usaApiBoj(ficha.atribucion) && (
        <p className="meta mt-1.5" lang="en" style={{ color: "var(--text-secondary)" }}>
          {CREDITO_API_BOJ}
        </p>
      )}
      <div className="mt-3">
        <Desplegable>
          <DetalleFicha ficha={ficha} />
          {estimados.length > 0 && (
            <p className="meta mt-2">
              Tramo estimado según la fuente: {etiquetaMes(estimados[0].mes)} a {etiquetaMes(estimados[estimados.length - 1].mes)}, {estimados.length} meses
              {ficha.supuestos.includes("A-D0-5") ? " (A-D0-5)" : ""}.
            </p>
          )}
        </Desplegable>
      </div>
    </div>
  );
}

interface PanelRatioProps {
  ratio: Ratio;
  color: string;
  rango: Rango;
  log: boolean;
  unidad: string;
  notaNoApto: string;
  queMuestra: ReactNode;
  comoInterpretarlo: ReactNode;
  fuente: ReactNode;
  metodologia: ReactNode;
}

function PanelRatio({ ratio, color, rango, log, unidad, notaNoApto, queMuestra, comoInterpretarlo, fuente, metodologia }: PanelRatioProps) {
  const noAptos = ratio.meses - ratio.mesesAptos;
  const leyenda: { color: string; label: string; trazo?: TrazoLeyenda }[] = [{ color, label: "apto para métricas" }];
  if (noAptos > 0) leyenda.push({ color, label: "no apto para métricas", trazo: "punteada" });
  return (
    <div className="card-glass rounded-xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3">
        <div className="min-w-0">
          <h3 className="font-serif text-xl tracking-wide" style={{ color: "var(--text-primary)" }}>
            {ratio.nombre}
          </h3>
          <p className="meta mt-0.5">promedio mensual en los dos lados</p>
        </div>
        <CifraPanel valor={ratio.ultimo.valor} unidad={unidad} mes={ratio.ultimo.mes} interanualPct={ratio.interanualPct} />
      </div>
      <GraficoRatio id={ratio.par} puntos={ratio.puntos} unidad={unidad} color={color} rango={rango} log={log} notaNoApto={notaNoApto} />
      <Leyenda items={leyenda} />
      <Interpretacion queMuestra={queMuestra} comoInterpretarlo={comoInterpretarlo} />
      <p className="meta mt-3">
        {fuente} · desde {etiquetaMes(ratio.primerMes)}, {ratio.meses} meses; apto para métricas desde {etiquetaMes(ratio.aptoDesde)}, {ratio.mesesAptos} meses
        {ratio.mesesEnDisputa > 0 && `, ${ratio.mesesEnDisputa} de ellos con el valor en disputa`}.
      </p>
      <div className="mt-3">
        <Desplegable>{metodologia}</Desplegable>
      </div>
    </div>
  );
}

// ── El agregado en USD ─────────────────────────────────────

const UNIDAD_AGREGADO_BILLONES = "billones (10¹²) de USD";

function TooltipAgregado({ active, payload, colores, mesBase }: { active?: boolean; payload?: ReadonlyArray<{ payload?: unknown }>; colores: Colores; mesBase: string }) {
  if (!active || !payload?.length) return null;
  const f = payload[0].payload as PuntoAgregado | undefined;
  if (!f) return null;
  // El archivo viene en miles de millones de USD; aquí se lee en billones.
  const b = (v: number) => formatearNumero(v / 1e3, 2);
  const filas = [
    { label: "EE.UU.", valor: f.eeuu, color: colores.blue },
    { label: "Eurozona", valor: f.eurozona, color: colores.purple },
    { label: "Japón", valor: f.japon, color: colores.amber },
  ];
  return (
    <div className="rounded-lg px-4 py-3 max-w-[300px]" style={ESTILO_TOOLTIP}>
      <p className="meta mb-2" style={{ color: "var(--text-secondary)" }}>
        {etiquetaMes(f.mes)} · {UNIDAD_AGREGADO_BILLONES}
      </p>
      {filas.map((r) => (
        <div key={r.label} className="flex items-center gap-2 py-0.5 font-mono text-xs">
          <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
          <span style={{ color: "var(--text-muted)" }}>{r.label}</span>
          <span className="font-medium tabular-nums ml-auto" style={{ color: r.color }}>
            {b(r.valor)}
          </span>
        </div>
      ))}
      <div className="mt-1 pt-1 space-y-0.5 font-mono text-xs" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 py-0.5">
          <span style={{ color: "var(--text-muted)" }}>Suma</span>
          <span className="font-medium tabular-nums ml-auto" style={{ color: "var(--text-primary)" }}>
            {b(f.total)}
          </span>
        </div>
        <div className="flex items-center gap-2 py-0.5">
          <span style={{ color: "var(--text-muted)" }}>A tipo de cambio de {etiquetaMes(mesBase)}</span>
          <span className="font-medium tabular-nums ml-auto" style={{ color: "var(--text-secondary)" }}>
            {b(f.totalTcConstante)}
          </span>
        </div>
        <p className="meta tabular-nums">efecto del tipo de cambio: {b(f.total - f.totalTcConstante)} · cálculo propio</p>
      </div>
    </div>
  );
}

function GraficoAgregado({ puntos, rango, colores, mesBase }: { puntos: PuntoAgregado[]; rango: Rango; colores: Colores; mesBase: string }) {
  const filas = useMemo(() => recortar(puntos, rango), [puntos, rango]);
  const ticks = useMemo(() => ticksAnuales(filas.map((f) => f.mes)), [filas]);
  return (
    <div>
      <RotuloEje unidad={UNIDAD_AGREGADO_BILLONES} />
      <div className="h-[280px] sm:h-[340px]">
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
            <XAxis dataKey="mes" ticks={ticks} tickFormatter={(m: string) => m.slice(0, 4)} {...EJE_X} />
            <YAxis {...EJE_Y} domain={[0, "auto"]} tickFormatter={(v: number) => formatearEje(v / 1e3)} />
            <Tooltip content={({ active, payload }) => <TooltipAgregado active={active} payload={payload} colores={colores} mesBase={mesBase} />} cursor={{ stroke: "var(--border)" }} />
            <Area type="monotone" dataKey="eeuu" name="EE.UU." stackId="1" stroke={colores.blue} fill="url(#gradAgEeuu)" strokeWidth={1.25} isAnimationActive={false} />
            <Area type="monotone" dataKey="eurozona" name="Eurozona" stackId="1" stroke={colores.purple} fill="url(#gradAgEurozona)" strokeWidth={1.25} isAnimationActive={false} />
            <Area type="monotone" dataKey="japon" name="Japón" stackId="1" stroke={colores.amber} fill="url(#gradAgJapon)" strokeWidth={1.25} isAnimationActive={false} />
            <Line type="monotone" dataKey="totalTcConstante" name="a tipo de cambio constante" stroke={colores.green} strokeDasharray="5 4" strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── La fracción, como figura ───────────────────────────────

function Fraccion() {
  return (
    <div className="text-center shrink-0" aria-hidden="true">
      <div className="rotulo mb-2">Precio</div>
      <div className="font-serif text-xl sm:text-2xl" style={{ color: "var(--text-primary)" }}>
        Lo que se compra
      </div>
      <div className="h-[2px] my-2" style={{ background: "var(--accent)" }} />
      <div className="font-serif text-xl sm:text-2xl glow-accent" style={{ color: "var(--accent)" }}>
        La moneda
      </div>
    </div>
  );
}

// ── La página ──────────────────────────────────────────────

export default function Dashboard({ datos }: { datos: Datos }) {
  const [rango, setRango] = useState<Rango>("todo");
  const [log, setLog] = useState(false);
  const colores = COLORES;
  const { series, agregado, ratios, fichas, citas, lock } = datos;

  const m2eeuu = series.m2_eeuu;
  const m2eurozona = series.m2_eurozona;
  const m2japon = series.m2_japon;
  const fed = series.balance_fed;
  const eurosistema = series.balance_eurosistema;
  const boj = series.balance_boj;
  const oro = ratios.find((r) => r.par === "oro_m2_eeuu");
  const btc = ratios.find((r) => r.par === "btc_m2_eeuu");

  const noMedidas = (ids: string[]) => ids.map((id) => fichas.find((f) => f.serie === id && !f.publicada)).filter((f): f is Ficha => f !== undefined);
  const china = noMedidas(["dinero_amplio_china"]);
  const pboc = noMedidas(["balance_pboc"]);
  const antesDe1959 = noMedidas(["dinero_eeuu_1892_1946", "dinero_eeuu_1947_1958"]);
  const riqueza = noMedidas(["riqueza_total", "riqueza_inmuebles", "riqueza_bonos", "riqueza_acciones", "riqueza_oro_cantidad", "riqueza_btc"]);

  const primero = agregado.puntos[0];
  const ultimo = agregado.ultimo;
  const enBillones = (v: number) => formatearNumero(v / 1e3, 2);
  const urlLosratios = `https://github.com/${lock.repositorio}/tree/${lock.commit}/senales`;
  const estimadosEurozona = m2eurozona.puntos.filter((p) => p.estado !== "dato");
  const fuenteDe = (f: Ficha) => ({ nombre: fuenteCorta(f.fuente), url: f.url || undefined });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
      {/* Portada */}
      <section className="mb-10 sm:mb-14 fade-in-up pt-2">
        <p className="rotulo mb-3">Tesis</p>
        <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.08] tracking-tight" style={{ color: "var(--text-primary)" }}>
          Cuando cambia el dinero,
          <br />
          <span className="glow-accent" style={{ color: "var(--accent)" }}>
            cambia la medida.
          </span>
        </h2>
        <p className="texto mt-5 max-w-2xl" style={{ fontSize: "1.0625rem", lineHeight: 1.55, color: "var(--text-primary)" }}>
          Observa cómo evoluciona la cantidad de dinero y qué cambia al medir los activos contra ella.
        </p>

        <div className="card-glass rounded-xl p-6 sm:p-8 mt-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
            <Fraccion />
            <div className="max-w-xl">
              <p className="texto">
                <strong>Un precio es una fracción.</strong> Arriba está lo que se compra; abajo, la moneda en que se expresa su
                precio. Este sitio sigue el lado de abajo: cuánto dinero hay, según lo publican sus emisores, y cómo se ve un
                activo cuando se mide contra esa cantidad.
              </p>
              <ul className="texto mt-4 space-y-1.5">
                <li>
                  <strong>Dinero:</strong> el M2 de EE.UU., la Eurozona y Japón.
                </li>
                <li>
                  <strong>Bancos centrales:</strong> los activos totales de la Reserva Federal, el Eurosistema y el Banco de Japón.
                </li>
                <li>
                  <strong>Activos medidos en M2:</strong> el oro y BTC contra el M2 de EE.UU.
                </li>
              </ul>
              <p className="meta mt-4">
                Cada cifra lleva fuente, unidad y fecha. Lo que no se pudo medir figura como no medido, con el motivo.
              </p>
            </div>
          </div>
        </div>
        <div className="divider-gradient mt-8 sm:mt-10" />
      </section>

      {/* Últimos datos */}
      <section className="mb-10 sm:mb-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4 sm:mb-5">
          <div>
            <p className="rotulo mb-1">Últimos datos</p>
            <p className="meta">Billón: un millón de millones (10¹²). Debajo de cada cifra, el valor en la unidad que publica la fuente.</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <BotonLog activo={log} onToggle={() => setLog(!log)} />
            <SelectorRango rango={rango} onChange={setRango} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          <MetricCard
            label="M2 de tres economías"
            descripcion="Suma en USD del M2 de EE.UU., la Eurozona y Japón, al tipo de cambio de cada mes."
            valor={ultimo.total}
            unidad={agregado.unidad}
            interanualPct={agregado.interanualPct}
            mes={etiquetaMes(ultimo.mes)}
            fuente={{ nombre: "cálculo propio sobre series de la Reserva Federal, el BCE y el Banco de Japón", url: urlLosratios }}
            limitacion="Mezcla tres convenciones de medición y no incluye a China: no es todo el dinero del mundo."
            metodologia={
              <p className="texto mt-2" style={{ fontSize: "0.75rem", lineHeight: 1.55 }}>
                EE.UU. + Eurozona + Japón, series sin ajustar, convertidas a USD al tipo de cambio del H.10 de la Junta de la Reserva
                Federal, promedio de cada mes (A-D0-10). La suma a tipo de cambio constante usa el de {etiquetaMes(agregado.primerMes)}{" "}
                (A-D0-11). No se publica ningún ratio contra esta suma (A-D0-12). China queda fuera (A-D0-9). Archivo:{" "}
                <code className="font-mono">denominador_agregado.csv</code>.
              </p>
            }
            delay={1}
          />
          <MetricCard
            label="M2 de EE.UU."
            descripcion={`Agregado monetario amplio de EE.UU.: ${m2eeuu.ficha.convencion}, ${m2eeuu.ficha.ajusteEstacional}.`}
            valor={m2eeuu.ultimo.valor}
            unidad={m2eeuu.ficha.unidad}
            interanualPct={m2eeuu.interanualPct}
            mes={etiquetaMes(m2eeuu.ultimo.mes)}
            fuente={fuenteDe(m2eeuu.ficha)}
            metodologia={<DetalleFicha ficha={m2eeuu.ficha} conEstado={false} compacta />}
            delay={2}
          />
          <MetricCard
            label="Balance de la Fed"
            descripcion={`Activos totales de la Reserva Federal, ${fed.ficha.convencion}.`}
            valor={fed.ultimo.valor}
            unidad={fed.ficha.unidad}
            interanualPct={fed.interanualPct}
            mes={etiquetaMes(fed.ultimo.mes)}
            fuente={fuenteDe(fed.ficha)}
            limitacion="Es el balance del banco central, no un agregado monetario como el M2 ni dinero disponible para gastar."
            metodologia={<DetalleFicha ficha={fed.ficha} conEstado={false} compacta />}
            delay={3}
          />
          {oro && (
            <MetricCard
              label="Oro / M2 de EE.UU."
              descripcion="Precio del oro, en USD por onza troy, dividido por el M2 de EE.UU. en billones de USD."
              valor={oro.ultimo.valor}
              unidad="USD por onza troy, por cada billón de USD de M2"
              interanualPct={oro.interanualPct}
              mes={etiquetaMes(oro.ultimo.mes)}
              fuente={{ nombre: "losratios, con el precio del oro del Banco Mundial y el M2 del H.6", url: urlLosratios }}
              limitacion="Compara un precio con el tamaño de un agregado monetario. No es un precio ajustado por inflación ni una señal de inversión."
              metodologia={
                <p className="texto mt-2" style={{ fontSize: "0.75rem", lineHeight: 1.55 }}>
                  losratios, <code className="font-mono">ratios.py</code>: precio del oro del Pink Sheet del Banco Mundial sobre el M2 ajustado
                  de EE.UU. en billones de USD; los dos lados son promedios mensuales (A-D0-21). Meses no aptos para métricas: antes del mercado
                  libre del oro o con error por redondeo mayor que 0,5 % (A-R0-17); valores en disputa con la segunda fuente (A-R0-20). Archivos:{" "}
                  <code className="font-mono">denominador_ratios.csv</code>, <code className="font-mono">denominador_pares.csv</code>.
                </p>
              }
              delay={4}
            />
          )}
        </div>
      </section>

      {/* Agregado */}
      <ChartSection
        title="M2 de tres economías — EE.UU., Eurozona y Japón, sumados en USD"
        subtitle={`Cálculo propio sobre las series oficiales, al tipo de cambio de cada mes. Desde ${etiquetaMes(agregado.primerMes)}, cuando empieza el M2 de Japón. Escala lineal.`}
        delay={3}
      >
        <GraficoAgregado puntos={agregado.puntos} rango={rango} colores={colores} mesBase={agregado.primerMes} />
        <Leyenda
          items={[
            { color: colores.blue, label: "EE.UU. (promedio mensual)" },
            { color: colores.purple, label: "Eurozona (saldo a fin de mes)" },
            { color: colores.amber, label: "Japón (promedio de saldos)" },
            { color: colores.green, label: `Suma a tipo de cambio de ${etiquetaMes(agregado.primerMes)}`, trazo: "punteada" },
          ]}
        />
        <Interpretacion
          queMuestra={
            <>
              La suma en USD del M2 de las tres economías, apilada por economía, al tipo de cambio de cada mes. La línea punteada
              repite la suma al tipo de cambio de {etiquetaMes(agregado.primerMes)}: la distancia entre las dos es el efecto cambiario,
              y permite distinguirlo del cambio en la cantidad de dinero. Entre {etiquetaMes(primero.mes)} y {etiquetaMes(ultimo.mes)} la
              suma pasó de {enBillones(primero.total)} a {enBillones(ultimo.total)} billones de USD; a tipo de cambio constante, a{" "}
              {enBillones(ultimo.totalTcConstante)}.
            </>
          }
          comoInterpretarlo={
            <>
              Las tres series no miden igual: EE.UU. publica un promedio mensual de cifras diarias; la Eurozona, el saldo a fin de mes;
              Japón, el promedio de saldos del mes. La suma mezcla esas convenciones y no representa todo el dinero del mundo: China y el
              resto de las economías quedan fuera. Por eso no se publica ningún ratio contra ella.
            </>
          }
        />
        <div className="mt-4">
          <Desplegable>
            <p className="texto mt-2" style={{ fontSize: "0.75rem", lineHeight: 1.55 }}>
              Suma de las series sin ajustar de EE.UU., la Eurozona y Japón, convertidas a USD al tipo de cambio del H.10 de la Junta de la
              Reserva Federal, promedio de cada mes (A-D0-10). La línea a tipo de cambio constante usa el de {etiquetaMes(agregado.primerMes)};
              la diferencia entre las dos sumas es el efecto del tipo de cambio, cálculo propio (A-D0-11). La suma mezcla promedios
              mensuales con saldos de fin de mes porque cada emisor publica una sola convención; por eso no se publica ningún ratio contra
              ella (A-D0-12). El dinero amplio de China no entra: su definición no es comparable con las otras tres y la serie está sin
              validar (A-D0-9). El Índice Denominador 60/40 que mostraba este sitio se retiró: la ponderación no tenía fuente, la base 1913
              no tiene dato en ninguna serie y el efectivo estaba en los dos lados (A-D0-13). Archivos:{" "}
              <code className="font-mono">denominador_agregado.csv</code> y <code className="font-mono">denominador_tipos_de_cambio.csv</code>;
              el tipo de cambio se valida como control de consistencia contra el BIS (WS_XRU), tolerancia ±0,5 %.
            </p>
          </Desplegable>
        </div>
      </ChartSection>

      {/* Dinero por economía */}
      <section className="mt-12 sm:mt-16">
        <Encabezado titulo="Dinero, economía por economía">
          Cada M2 en su moneda, su unidad y su convención, desde donde empieza su fuente oficial, sin empalmes y sin interpolar. Los
          valores se publican sin cambios; la variación interanual es el único cálculo propio.
        </Encabezado>
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-5">
          <PanelSerie
            titulo="EE.UU."
            serie={m2eeuu}
            color={colores.blue}
            rango={rango}
            log={log}
            queMuestra={
              <>
                El M2 de EE.UU. tal como lo publica la Junta de la Reserva Federal: {m2eeuu.ficha.convencion}, {m2eeuu.ficha.ajusteEstacional},
                en miles de millones de USD; aquí, en billones.
              </>
            }
            comoInterpretarlo={
              <>
                Es un nivel, no un flujo: cada punto es el promedio del mes. El ajuste estacional lo hace la fuente; la serie sin ajustar
                está en las fichas. La escala logarítmica ayuda a comparar tasas de cambio entre décadas.
              </>
            }
          />
          <PanelSerie
            titulo="Eurozona"
            serie={m2eurozona}
            color={colores.purple}
            rango={rango}
            log={log}
            queMuestra={
              <>
                El M2 de la zona del euro según el BCE: {m2eurozona.ficha.convencion}, {m2eurozona.ficha.ajusteEstacional}, en millones de EUR;
                aquí, en billones.
                {estimadosEurozona.length > 0 && (
                  <>
                    {" "}
                    Hasta {etiquetaMes(estimadosEurozona[estimadosEurozona.length - 1].mes)} la fuente lo marca como estimación: va punteado.
                  </>
                )}
              </>
            }
            comoInterpretarlo={
              <>
                La zona del euro cambió de tamaño {m2eurozona.ficha.quiebres.length} veces: cada línea vertical es una ampliación. En esos
                meses entra el dinero de un país nuevo, así que el nivel no es comparable a ambos lados del quiebre. Los quiebres se
                declaran, no se corrigen.
              </>
            }
          />
          <PanelSerie
            titulo="Japón"
            serie={m2japon}
            color={colores.amber}
            rango={rango}
            log={log}
            queMuestra={
              <>
                El M2 de Japón según el Banco de Japón: {m2japon.ficha.convencion}, {m2japon.ficha.ajusteEstacional}, en cientos de millones
                de JPY; aquí, en billones de JPY.
              </>
            }
            comoInterpretarlo={
              <>
                Está en yenes: no se compara con las otras dos series sin pasar por el tipo de cambio, que es lo que hace la suma de tres
                economías. Empieza en {etiquetaMes(m2japon.ficha.primerMes)}, donde empieza su fuente oficial.
              </>
            }
          />
          <TarjetaNoMedida
            titulo="China"
            queFalta={
              <>
                Falta el dinero amplio de China. Sin él, la suma de tres economías no incluye a China y no representa todo el dinero del
                mundo. La OCDE lo publica con el rótulo «M3», con otra definición, y no se pudo validar contra una segunda fuente leída a
                mano.
              </>
            }
            fichas={china}
            detalle="El dinero amplio de China sale de la OCDE con el rótulo que le pone la fuente, «M3», y nunca como M2. Se publica cuando tenga tres lecturas en pantalla de la Oficina Nacional de Estadísticas; hoy hay dos (A-D0-25)."
            delay={2}
          />
        </div>
      </section>

      {/* Balances */}
      <section className="mt-12 sm:mt-16">
        <Encabezado titulo="Balances de bancos centrales">
          Los activos totales de cada banco central, en su moneda. Es el tamaño de su balance, no la cantidad de dinero en la economía: no
          equivale al M2 ni a dinero disponible para gastar. Los balances semanales de la Fed y del Eurosistema pasan a mensual con el
          último dato fechado dentro del mes; la fecha se ve en cada punto.
        </Encabezado>
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-5">
          <PanelSerie
            titulo="Reserva Federal"
            serie={fed}
            color={colores.blue}
            rango={rango}
            log={log}
            queMuestra={
              <>
                Los activos totales del balance consolidado de la Reserva Federal, en millones de USD; aquí, en billones. Cada mes toma el{" "}
                {fed.ficha.convencion}, la fecha que publica el H.4.1.
              </>
            }
            comoInterpretarlo={
              <>
                Es el balance del banco central: lo que tiene en su activo, no el dinero que circula en la economía. Un dato semanal
                llevado a mensual: la fecha exacta de cada punto está en el tooltip.
              </>
            }
          />
          <PanelSerie
            titulo="Eurosistema"
            serie={eurosistema}
            color={colores.purple}
            rango={rango}
            log={log}
            queMuestra={
              <>
                Los activos totales del Eurosistema (el BCE y los bancos centrales nacionales), en millones de EUR; aquí, en billones. Cada
                mes toma el {eurosistema.ficha.convencion}.
              </>
            }
            comoInterpretarlo={
              <>
                Las líneas verticales marcan las ampliaciones de la zona del euro: entra el balance de otro banco central y el nivel no es
                comparable a ambos lados. Los quiebres se declaran, no se corrigen.
              </>
            }
          />
          <PanelSerie
            titulo="Banco de Japón"
            serie={boj}
            color={colores.amber}
            rango={rango}
            log={log}
            queMuestra={
              <>
                Los activos totales del Banco de Japón, {boj.ficha.convencion}, en cientos de millones de JPY; aquí, en billones de JPY.
              </>
            }
            comoInterpretarlo={
              <>
                En {etiquetaMes("2001-04")} cambió la contabilidad de las operaciones repo: el total anterior no es comparable con el
                posterior (línea vertical). Está en yenes: no se compara con la Fed ni con el Eurosistema sin un tipo de cambio.
              </>
            }
          />
          <TarjetaNoMedida
            titulo="Banco Popular de China"
            queFalta={
              <>
                Falta el balance del Banco Popular de China. Sin él, esta sección muestra tres de los cuatro balances que el sitio se
                propone seguir. La única serie disponible con licencia abierta es la del BIS, que la empalma, y no hay una segunda fuente
                leída a mano para validarla.
              </>
            }
            fichas={pboc}
            detalle="El balance del PBoC sale del BIS, que empalma la serie. Las únicas lecturas de la tabla del propio PBoC vinieron de descargas automáticas de su sitio, que su robots.txt veda, y se descartaron; dos valores leídos a mano por una persona lo destraban (A-D0-9)."
            delay={2}
          />
        </div>
      </section>

      {/* Activos contra el M2 */}
      <section className="mt-12 sm:mt-16">
        <Encabezado titulo="Activos medidos en M2 de EE.UU.">
          El precio mensual del activo dividido por el M2 de EE.UU. en billones de USD, tal como lo publica losratios. Compara el precio de
          un activo con el tamaño de un agregado monetario: no es un precio ajustado por inflación, no mide poder adquisitivo y no es una
          señal de inversión.
        </Encabezado>
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-5">
          {oro && (
            <PanelRatio
              ratio={oro}
              color={colores.amber}
              rango={rango}
              log={log}
              unidad="USD por onza troy, por billón de USD de M2"
              notaNoApto="antes del mercado libre del oro o con error por redondeo mayor que 0,5 %"
              queMuestra={
                <>
                  El precio del oro, en USD por onza troy, dividido por el M2 de EE.UU. en billones de USD; los dos lados son promedios
                  mensuales. El valor dice cuántos USD por onza corresponden a cada billón de M2.
                </>
              }
              comoInterpretarlo={
                <>
                  Antes de {etiquetaMes(oro.aptoDesde)} no había mercado libre del oro: esos meses van punteados y no entran en las métricas,
                  igual que los meses con error de redondeo mayor que 0,5 % o con valor en disputa entre fuentes. El ratio describe la
                  relación entre dos series publicadas; no mide poder adquisitivo ni anticipa nada.
                </>
              }
              fuente={
                <>
                  Fuente:{" "}
                  <a href={urlLosratios} target="_blank" rel="noopener noreferrer">
                    losratios
                  </a>
                  , con el precio del oro del Banco Mundial y el M2 del H.6
                </>
              }
              metodologia={
                <p className="texto mt-2" style={{ fontSize: "0.75rem", lineHeight: 1.55 }}>
                  losratios, <code className="font-mono">ratios.py</code>: precio del oro del Pink Sheet del Banco Mundial sobre el M2 ajustado
                  de EE.UU. en billones de USD; los dos lados son promedios mensuales, y solo de meses completos (A-D0-21). Sin base 100: es el
                  ratio tal como lo publica losratios. Meses no aptos para métricas: antes del mercado libre del oro o con error por redondeo
                  mayor que 0,5 % (A-R0-17); {oro.mesesEnDisputa} meses con el valor en disputa con la segunda fuente, control de consistencia
                  (A-R0-20). El S&amp;P 500 contra el M2 queda no medido hasta tener el permiso del dueño del índice (FUENTES.md, D0.10.5).
                  Archivos: <code className="font-mono">denominador_ratios.csv</code>, <code className="font-mono">denominador_pares.csv</code>.
                </p>
              }
            />
          )}
          {btc && (
            <PanelRatio
              ratio={btc}
              color={colores.orange}
              rango={rango}
              log={log}
              unidad="USD por BTC, por billón de USD de M2"
              notaNoApto="error por redondeo mayor que 0,5 %"
              queMuestra={
                <>
                  El precio de BTC, en USD, dividido por el M2 de EE.UU. en billones de USD; los dos lados son promedios mensuales. El valor
                  dice cuántos USD por BTC corresponden a cada billón de M2.
                </>
              }
              comoInterpretarlo={
                <>
                  La serie empieza en {etiquetaMes(btc.primerMes)} y es corta frente al M2. Los meses con error de redondeo mayor que 0,5 %
                  irían punteados. Compara el precio con el tamaño del agregado: no es un precio ajustado por inflación ni una señal de
                  inversión.
                </>
              }
              fuente={
                <>
                  Fuente:{" "}
                  <a href={urlLosratios} target="_blank" rel="noopener noreferrer">
                    losratios
                  </a>
                  , con el precio de BTC y el M2 del H.6
                </>
              }
              metodologia={
                <p className="texto mt-2" style={{ fontSize: "0.75rem", lineHeight: 1.55 }}>
                  losratios, <code className="font-mono">ratios.py</code>: precio de BTC sobre el M2 ajustado de EE.UU. en billones de USD; los
                  dos lados son promedios mensuales, y solo de meses completos (A-D0-21). La fuente del precio de BTC y su validación las
                  documenta losratios (SUPUESTOS.md, A-R0-*); este sitio copia el ratio publicado sin recalcularlo. Meses no aptos para
                  métricas: error por redondeo mayor que 0,5 % (A-R0-17). Archivos: <code className="font-mono">denominador_ratios.csv</code>,{" "}
                  <code className="font-mono">denominador_pares.csv</code>.
                </p>
              }
            />
          )}
        </div>
      </section>

      {/* Lo que no se mide todavía */}
      <section className="mt-12 sm:mt-16">
        <Encabezado titulo="Lo que todavía no se mide">
          Este sitio mostraba series desde 1913 y una riqueza global por clase de activo. Ninguna tenía una fuente que se pudiera leer y
          reproducir, así que se retiraron. Lo que las reemplaza se lista aquí con su estado.
        </Encabezado>
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-5">
          <TarjetaNoMedida
            titulo="EE.UU. antes de 1959"
            queFalta={
              <>
                Falta la cantidad de dinero de EE.UU. antes de 1959, donde empieza el M2 del H.6. Las publicaciones anteriores de la Junta
                miden otro concepto, «efectivo y depósitos en bancos comerciales», e irán como series separadas, sin empalmar y con los
                quiebres a la vista.
              </>
            }
            fichas={antesDe1959}
            detalle="La transcripción de las tablas de la Junta se hace dos veces, de forma independiente, con la página de origen de cada cifra (A-D0-19), sin empalmar con el M2 y con los quiebres declarados (A-D0-17). Se hace en un PR propio de losratios."
            delay={1}
          />
          <TarjetaNoMedida
            titulo="Riqueza por clase de activo"
            queFalta={
              <>
                Falta el tamaño de lo que se mide contra el dinero: inmuebles, bonos, acciones, oro, BTC y la riqueza total. Sin esas series,
                el sitio solo compara precios unitarios (una onza, un BTC) con el M2. No hay series globales con licencia abierta para
                inmuebles, oro sobre la superficie ni riqueza total; bonos, acciones y BTC tienen fuente prevista.
              </>
            }
            fichas={riqueza}
            citas={citas}
            detalle="Bonos, acciones y BTC están pendientes de implementar (A-D0-22, A-D0-23, A-R0-4). Inmuebles, oro sobre la superficie y riqueza total no tienen serie con licencia abierta (A-D0-24); las cifras de Savills y del World Gold Council se citan tal cual, fuera de todo cálculo (A-D0-28)."
            delay={2}
          />
        </div>
      </section>

      {/* Fichas */}
      <section className="mt-12 sm:mt-16">
        <Encabezado titulo="Metodología completa: las fichas de las series">
          Para cada serie: emisor, fuente e identificador, unidad y convención, cómo se validó contra una segunda fuente, licencia y
          atribución, los supuestos que la rigen y sus quiebres.
        </Encabezado>
        <p className="meta -mt-2 mb-4">
          Es el contenido de <code className="font-mono">serie_D0.csv</code> de losratios, fijado en <code className="font-mono">datos.lock</code>.
        </p>
        <div className="card-glass rounded-xl p-4 sm:p-6">
          <Fichas fichas={fichas} />
        </div>
      </section>

      {/* Cierre */}
      <div className="mt-14 mb-8 sm:mt-20 sm:mb-10 fade-in-up text-center">
        <div className="divider-gradient mb-6 sm:mb-8" />
        <p className="font-serif text-3xl sm:text-4xl md:text-5xl leading-tight tracking-tight" style={{ color: "var(--text-primary)" }}>
          Ningún precio viene solo.{" "}
          <span className="glow-accent" style={{ color: "var(--accent)" }}>
            Siempre trae su medida.
          </span>
        </p>
        <div className="divider-gradient mt-6 sm:mt-8" />
      </div>

      <div className="mt-10 text-center fade-in-up">
        <div className="card-glass rounded-xl p-6 sm:p-8 max-w-2xl mx-auto">
          <p className="font-serif text-xl sm:text-2xl mb-2" style={{ color: "var(--text-primary)" }}>
            La fracción tiene dos lados
          </p>
          <p className="texto">
            Esta página es el de abajo.{" "}
            <a href="https://elnumerador.com" target="_blank" rel="noopener noreferrer">
              El Numerador
            </a>{" "}
            muestra el de arriba, y{" "}
            <a href="https://losratios.com" target="_blank" rel="noopener noreferrer">
              Los Ratios
            </a>
            , un activo medido en otro.
          </p>
        </div>
      </div>
    </div>
  );
}
