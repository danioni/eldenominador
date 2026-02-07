"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from "recharts";
import { liquidityData, getLatestMetrics } from "@/lib/data";
import MetricCard from "./MetricCard";
import ChartSection from "./ChartSection";

type TimeRange = "10Y" | "25Y" | "50Y" | "ALL";

const DEFAULT_COLORS = {
  green: "#00ff88", greenDim: "#00cc6a", blue: "#3388ff",
  purple: "#aa55ff", amber: "#ffaa00", red: "#ff3355",
  cyan: "#00ddff", orange: "#ff8800", muted: "#55556a",
};

function useThemeColors() {
  const getColors = useCallback(() => {
    if (typeof window === "undefined") return DEFAULT_COLORS;
    const s = getComputedStyle(document.documentElement);
    const g = (v: string, fb: string) => s.getPropertyValue(v).trim() || fb;
    return {
      green: g("--accent-green", "#00ff88"),
      greenDim: g("--accent-green-dim", "#00cc6a"),
      blue: g("--accent-blue", "#3388ff"),
      purple: g("--accent-purple", "#aa55ff"),
      amber: g("--accent-amber", "#ffaa00"),
      red: g("--accent-red", "#ff3355"),
      cyan: g("--accent-cyan", "#00ddff"),
      orange: "#ff8800",
      muted: g("--text-muted", "#55556a"),
    };
  }, []);

  const [colors, setColors] = useState(DEFAULT_COLORS);

  useEffect(() => {
    setColors(getColors());
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === "data-theme") {
          requestAnimationFrame(() => setColors(getColors()));
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, [getColors]);

  return colors;
}

function formatValue(v: number): string {
  if (v >= 1) return `$${v.toFixed(2)}T`;
  if (v >= 0.001) return `$${(v * 1000).toFixed(1)}B`;
  return `$${(v * 1000000).toFixed(0)}M`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div
      className="rounded-lg px-4 py-3 text-xs"
      style={{
        background: "var(--bg-tooltip)",
        border: "1px solid var(--border)",
        backdropFilter: "blur(10px)",
      }}
    >
      <p className="mb-2 font-medium" style={{ color: "var(--text-secondary)" }}>
        {label}
      </p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span style={{ color: "var(--text-muted)" }}>{entry.name}:</span>
          <span className="font-medium tabular-nums" style={{ color: entry.color }}>
            {formatValue(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function DenominatorTooltip({ active, payload, label }: any) {
  if (!active || !payload) return null;
  return (
    <div
      className="rounded-lg px-4 py-3 text-xs"
      style={{
        background: "var(--bg-tooltip)",
        border: "1px solid var(--border)",
        backdropFilter: "blur(10px)",
      }}
    >
      <p className="mb-2 font-medium" style={{ color: "var(--text-secondary)" }}>
        {label}
      </p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span style={{ color: "var(--text-muted)" }}>{entry.name}:</span>
          <span className="font-medium tabular-nums" style={{ color: entry.color }}>
            {entry.value.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
}

function TimeRangeSelector({
  range,
  onChange,
}: {
  range: TimeRange;
  onChange: (r: TimeRange) => void;
}) {
  const options: TimeRange[] = ["10Y", "25Y", "50Y", "ALL"];
  return (
    <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--controls-bg)", border: "1px solid var(--border-subtle)" }}>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className="px-3.5 py-1.5 rounded-md text-[10px] tracking-wider uppercase transition-all"
          style={{
            background:
              range === opt
                ? "var(--accent-green-bg-active)"
                : "transparent",
            color:
              range === opt
                ? "var(--accent-green)"
                : "var(--text-muted)",
            border:
              range === opt
                ? "1px solid var(--accent-green-border-active)"
                : "1px solid transparent",
            boxShadow:
              range === opt
                ? "var(--accent-green-glow)"
                : "none",
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function ScaleToggle({ isLog, onToggle }: { isLog: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="px-3.5 py-1.5 rounded-md text-[10px] tracking-wider uppercase transition-all"
      style={{
        background: isLog ? "var(--accent-green-bg-active)" : "transparent",
        color: isLog ? "var(--accent-green)" : "var(--text-muted)",
        border: isLog ? "1px solid var(--accent-green-border-active)" : "1px solid var(--border-subtle)",
      }}
    >
      LOG
    </button>
  );
}

export default function Dashboard() {
  const [range, setRange] = useState<TimeRange>("ALL");
  const [logScale, setLogScale] = useState(false);
  const COLORS = useThemeColors();
  const metrics = useMemo(() => getLatestMetrics(), []);

  const filteredData = useMemo(() => {
    if (range === "10Y") return liquidityData.slice(-10);
    if (range === "25Y") return liquidityData.slice(-25);
    if (range === "50Y") return liquidityData.slice(-50);
    return liquidityData; // ALL: 1913-2025
  }, [range]);

  // Build custom ticks for clean X axis labels
  const xTicks = useMemo(() => {
    const dates = filteredData.map(d => d.date);
    const span = dates.length;
    if (span <= 12) return undefined; // show all years
    const yearStep = span <= 25 ? 5 : span <= 60 ? 10 : 20;
    const firstYear = parseInt(dates[0]);
    const lastYear = parseInt(dates[dates.length - 1]);
    const startYear = Math.ceil(firstYear / yearStep) * yearStep;
    const ticks: string[] = [];
    for (let y = startYear; y <= lastYear; y += yearStep) {
      const d = `${y}`;
      if (dates.includes(d)) ticks.push(d);
    }
    if (!ticks.includes(dates[0])) ticks.unshift(dates[0]);
    if (!ticks.includes(dates[dates.length - 1])) ticks.push(dates[dates.length - 1]);
    return ticks;
  }, [filteredData]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {/* Thesis banner */}
      <div className="mb-12 fade-in-up pt-4">
        <p
          className="font-serif text-4xl md:text-5xl leading-[1.15] tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Los precios no suben.
          <br />
          <span className="glow-green" style={{ color: "var(--accent-green)" }}>
            El dinero se encoge.
          </span>
        </p>
        <p
          className="mt-4 text-sm max-w-2xl leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Todo precio es una fracción. El denominador es la masa monetaria
          — la cantidad total de dinero en circulación. Cuando los bancos
          centrales imprimen más, el denominador crece, cada unidad vale menos,
          y los precios suben. Pero lo que cambió no fue el valor de las cosas,
          sino el tamaño de la unidad con la que se miden. Quienes entienden
          esto lo explotan. Quienes no, lo padecen.
        </p>
        <div className="divider-gradient mt-8" />
      </div>

      {/* Time range + scale toggle */}
      <div className="flex justify-end items-center gap-3 mb-6">
        <ScaleToggle isLog={logScale} onToggle={() => setLogScale(!logScale)} />
        <TimeRangeSelector range={range} onChange={setRange} />
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <MetricCard
          label={metrics.m2Global.label}
          value={metrics.m2Global.value}
          change={metrics.m2Global.change}
          unit={metrics.m2Global.unit}
          delay={1}
        />
        <MetricCard
          label={metrics.cbTotal.label}
          value={metrics.cbTotal.value}
          change={metrics.cbTotal.change}
          unit={metrics.cbTotal.unit}
          delay={2}
        />
        <MetricCard
          label={metrics.netLiquidity.label}
          value={metrics.netLiquidity.value}
          change={metrics.netLiquidity.change}
          unit={metrics.netLiquidity.unit}
          delay={3}
        />
        <MetricCard
          label={metrics.denominatorIndex.label}
          value={metrics.denominatorIndex.value}
          change={metrics.denominatorIndex.change}
          unit={metrics.denominatorIndex.unit}
          delay={4}
        />
      </div>

      {/* Denominator Index - hero chart */}
      <ChartSection
        title="Índice Denominador — Tu dinero pierde valor cada día"
        subtitle="Compuesto ponderado: 60 % M2 Global + 40 % Balance Bancos Centrales · Base 100 = 1913"
        delay={3}
      >
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="gradDenom" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.green} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={COLORS.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis
                dataKey="date"
                stroke="var(--text-muted)"
                tick={{ fontSize: 10 }}
                ticks={xTicks}

                axisLine={false}
                tickLine={false}
              />
              <YAxis
                stroke="var(--text-muted)"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                scale={logScale ? "log" : "auto"}
                domain={logScale ? ["auto", "auto"] : ["auto", "auto"]}
                allowDataOverflow={logScale}
                tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`}
              />
              <Tooltip content={<DenominatorTooltip />} />
              <Area
                type="monotone"
                dataKey="denominator_index"
                name="Índice"
                stroke={COLORS.green}
                fill="url(#gradDenom)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartSection>

      {/* Two column layout */}
      <div className="grid lg:grid-cols-2 gap-5 mt-6">
        {/* M2 Global */}
        <ChartSection
          title="Oferta Monetaria M2 — La impresora no para"
          subtitle="Agregado monetario M2 por región (trillones USD)"
          delay={4}
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData}>
                <defs>
                  <linearGradient id="gradChina" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.red} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={COLORS.red} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradUS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.blue} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={COLORS.blue} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradEU" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.purple} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={COLORS.purple} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradJP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.amber} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={COLORS.amber} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis
                  dataKey="date"
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 10 }}
                  ticks={xTicks}
  
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  scale={logScale ? "log" : "auto"}
                  domain={logScale ? ["auto", "auto"] : [0, "auto"]}
                  allowDataOverflow={logScale}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="m2_china" name="China" stroke={COLORS.red} fill="url(#gradChina)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="m2_us" name="EE.UU." stroke={COLORS.blue} fill="url(#gradUS)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="m2_eu" name="Eurozona" stroke={COLORS.purple} fill="url(#gradEU)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="m2_japan" name="Japón" stroke={COLORS.amber} fill="url(#gradJP)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <ChartLegend
            items={[
              { color: COLORS.red, label: "China" },
              { color: COLORS.blue, label: "EE.UU." },
              { color: COLORS.purple, label: "Eurozona" },
              { color: COLORS.amber, label: "Japón" },
            ]}
          />
        </ChartSection>

        {/* Central Bank Balance Sheets */}
        <ChartSection
          title="Balance Bancos Centrales — Los bancos centrales compran todo"
          subtitle="Hojas de balance de los 4 principales bancos centrales (trillones USD)"
          delay={5}
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData}>
                <defs>
                  <linearGradient id="gradFed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.blue} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={COLORS.blue} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradECB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.purple} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={COLORS.purple} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradBoJ" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.amber} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={COLORS.amber} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradPBoC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.red} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={COLORS.red} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis
                  dataKey="date"
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 10 }}
                  ticks={xTicks}
  
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  scale={logScale ? "log" : "auto"}
                  domain={logScale ? ["auto", "auto"] : [0, "auto"]}
                  allowDataOverflow={logScale}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="fed_bs" name="Fed" stroke={COLORS.blue} fill="url(#gradFed)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="ecb_bs" name="BCE" stroke={COLORS.purple} fill="url(#gradECB)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="boj_bs" name="BoJ" stroke={COLORS.amber} fill="url(#gradBoJ)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="pboc_bs" name="PBoC" stroke={COLORS.red} fill="url(#gradPBoC)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <ChartLegend
            items={[
              { color: COLORS.blue, label: "Fed" },
              { color: COLORS.purple, label: "BCE" },
              { color: COLORS.amber, label: "BoJ" },
              { color: COLORS.red, label: "PBoC" },
            ]}
          />
        </ChartSection>
      </div>

      {/* Net Liquidity - full width */}
      <div className="mt-6">
        <ChartSection
          title="Liquidez Neta Fed — La liquidez real que mueve los mercados"
          subtitle="Fed Balance Sheet − TGA − RRP = Liquidez neta disponible en el sistema (trillones USD)"
          delay={4}
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={filteredData}>
                <defs>
                  <linearGradient id="gradNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.cyan} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={COLORS.cyan} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis
                  dataKey="date"
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 10 }}
                  ticks={xTicks}
  
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="net_liquidity"
                  name="Liquidez Neta"
                  stroke={COLORS.cyan}
                  fill="url(#gradNet)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="tga"
                  name="TGA"
                  stroke={COLORS.amber}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="rrp"
                  name="RRP"
                  stroke={COLORS.red}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <ChartLegend
            items={[
              { color: COLORS.cyan, label: "Liquidez Neta" },
              { color: COLORS.amber, label: "TGA", dashed: true },
              { color: COLORS.red, label: "RRP", dashed: true },
            ]}
          />
        </ChartSection>
      </div>

      {/* M2 Velocity */}
      <div className="mt-6">
        <ChartSection
          title="Velocidad del Dinero — Imprimen más, circula menos"
          subtitle="M2 Velocity (GDP / M2) — proxy EE.UU. vía FRED. Cada dólar nuevo se queda atrapado en el sistema financiero en vez de llegar a la economía real."
          delay={4}
        >
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData}>
                <defs>
                  <linearGradient id="gradM2V" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.red} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={COLORS.red} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis
                  dataKey="date"
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 10 }}
                  ticks={xTicks}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0.8, 2.4]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="m2v"
                  name="Velocidad M2"
                  stroke={COLORS.red}
                  fill="url(#gradM2V)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartSection>
      </div>

      {/* Assets vs Denominator Index */}
      <div className="mt-6">
        <ChartSection
          title="Activos vs Denominador — Nada le gana a la impresora"
          subtitle="Todos indexados a base 100 en 1913. El S&P 500 subió ~750x, el oro ~138x, pero el denominador ~3.400x. Las acciones capturan mejor la expansión, pero ninguna la alcanza."
          delay={5}
        >
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={filteredData}>
                <defs>
                  <linearGradient id="gradGoldIdx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.amber} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={COLORS.amber} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradDenomIdx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.green} stopOpacity={0.1} />
                    <stop offset="100%" stopColor={COLORS.green} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradSP500Idx" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.blue} stopOpacity={0.15} />
                    <stop offset="100%" stopColor={COLORS.blue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis
                  dataKey="date"
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 10 }}
                  ticks={xTicks}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  scale={logScale ? "log" : "auto"}
                  domain={logScale ? ["auto", "auto"] : [0, "auto"]}
                  allowDataOverflow={logScale}
                  tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${v}`}
                />
                <Tooltip
                  content={({ active, payload, label }: any) => {
                    if (!active || !payload) return null;
                    // Find gold_usd for this year
                    const point = filteredData.find((d: any) => d.date === label);
                    return (
                      <div
                        className="rounded-lg px-4 py-3 text-xs"
                        style={{
                          background: "var(--bg-tooltip)",
                          border: "1px solid var(--border)",
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        <p className="mb-2 font-medium" style={{ color: "var(--text-secondary)" }}>{label}</p>
                        {point && (
                          <>
                            <div className="flex items-center gap-2 py-0.5">
                              <div className="w-2 h-2 rounded-full" style={{ background: COLORS.amber }} />
                              <span style={{ color: "var(--text-muted)" }}>Oro:</span>
                              <span className="font-medium tabular-nums" style={{ color: COLORS.amber }}>
                                ${point.gold_usd.toLocaleString()}/oz
                              </span>
                            </div>
                            <div className="flex items-center gap-2 py-0.5 mb-1">
                              <div className="w-2 h-2 rounded-full" style={{ background: COLORS.blue }} />
                              <span style={{ color: "var(--text-muted)" }}>S&P 500:</span>
                              <span className="font-medium tabular-nums" style={{ color: COLORS.blue }}>
                                {point.sp500.toLocaleString()}
                              </span>
                            </div>
                          </>
                        )}
                        {payload.map((entry: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 py-0.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
                            <span style={{ color: "var(--text-muted)" }}>{entry.name}:</span>
                            <span className="font-medium tabular-nums" style={{ color: entry.color }}>
                              {entry.value >= 1000 ? `${(entry.value / 1000).toFixed(1)}K` : entry.value.toFixed(0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="denominator_index"
                  name="Denominador"
                  stroke={COLORS.green}
                  fill="url(#gradDenomIdx)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="sp500_index"
                  name="S&P 500"
                  stroke={COLORS.blue}
                  fill="url(#gradSP500Idx)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="gold_index"
                  name="Oro"
                  stroke={COLORS.amber}
                  fill="url(#gradGoldIdx)"
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <ChartLegend
            items={[
              { color: COLORS.green, label: "Denominador (base 100)" },
              { color: COLORS.blue, label: "S&P 500 (base 100)" },
              { color: COLORS.amber, label: "Oro (base 100)" },
            ]}
          />
        </ChartSection>
      </div>

      {/* Wealth Market Cap — Absolute */}
      <div className="mt-6">
        <ChartSection
          title="Riqueza Global — Más activos, más unidades, más denominador"
          subtitle="Market cap total por clase de activo en USD nominales. El crecimiento refleja tanto riqueza real (más casas, empresas, deuda) como dilución monetaria. Para ver cuánto es cada cosa, mirá los precios unitarios en Activos vs Denominador."
          delay={5}
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData}>
                <defs>
                  <linearGradient id="gradGoldAbs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.amber} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={COLORS.amber} stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gradEquitiesAbs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.blue} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={COLORS.blue} stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gradREAbs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.purple} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={COLORS.purple} stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gradBondsAbs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.cyan} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={COLORS.cyan} stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gradBTCAbs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.orange} stopOpacity={0.6} />
                    <stop offset="100%" stopColor={COLORS.orange} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis
                  dataKey="date"
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 10 }}
                  ticks={xTicks}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${v}T`}
                />
                <Tooltip
                  content={({ active, payload, label }: any) => {
                    if (!active || !payload) return null;
                    const point = filteredData.find((d: any) => d.date === label);
                    if (!point) return null;
                    const total = point.realestate_mcap + point.bonds_mcap + point.equities_mcap + point.gold_mcap + point.bitcoin_mcap;
                    const items = [
                      { label: "Inmuebles", value: point.realestate_mcap, color: COLORS.purple },
                      { label: "Bonos", value: point.bonds_mcap, color: COLORS.cyan },
                      { label: "Acciones", value: point.equities_mcap, color: COLORS.blue },
                      { label: "Oro", value: point.gold_mcap, color: COLORS.amber },
                      ...(point.bitcoin_mcap > 0.001 ? [{ label: "Bitcoin", value: point.bitcoin_mcap, color: COLORS.orange }] : []),
                    ];
                    return (
                      <div
                        className="rounded-lg px-4 py-3 text-xs"
                        style={{
                          background: "var(--bg-tooltip)",
                          border: "1px solid var(--border)",
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        <p className="mb-2 font-medium" style={{ color: "var(--text-secondary)" }}>{label}</p>
                        {items.map((item) => (
                          <div key={item.label} className="flex items-center gap-2 py-0.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                            <span style={{ color: "var(--text-muted)" }}>{item.label}:</span>
                            <span className="font-medium tabular-nums" style={{ color: item.color }}>
                              ${item.value.toFixed(1)}T
                            </span>
                          </div>
                        ))}
                        <div className="mt-1 pt-1" style={{ borderTop: "1px solid var(--border)" }}>
                          <div className="flex items-center gap-2 py-0.5">
                            <span style={{ color: "var(--text-muted)" }}>Total:</span>
                            <span className="font-medium tabular-nums" style={{ color: "var(--text-primary)" }}>
                              ${total.toFixed(1)}T
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="realestate_mcap"
                  name="Inmuebles"
                  stackId="1"
                  stroke={COLORS.purple}
                  fill="url(#gradREAbs)"
                  strokeWidth={1.5}
                />
                <Area
                  type="monotone"
                  dataKey="bonds_mcap"
                  name="Bonos"
                  stackId="1"
                  stroke={COLORS.cyan}
                  fill="url(#gradBondsAbs)"
                  strokeWidth={1.5}
                />
                <Area
                  type="monotone"
                  dataKey="equities_mcap"
                  name="Acciones"
                  stackId="1"
                  stroke={COLORS.blue}
                  fill="url(#gradEquitiesAbs)"
                  strokeWidth={1.5}
                />
                <Area
                  type="monotone"
                  dataKey="gold_mcap"
                  name="Oro"
                  stackId="1"
                  stroke={COLORS.amber}
                  fill="url(#gradGoldAbs)"
                  strokeWidth={1.5}
                />
                <Area
                  type="monotone"
                  dataKey="bitcoin_mcap"
                  name="Bitcoin"
                  stackId="1"
                  stroke={COLORS.orange}
                  fill="url(#gradBTCAbs)"
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <ChartLegend
            items={[
              { color: COLORS.purple, label: "Inmuebles" },
              { color: COLORS.cyan, label: "Bonos" },
              { color: COLORS.blue, label: "Acciones" },
              { color: COLORS.amber, label: "Oro" },
              { color: COLORS.orange, label: "Bitcoin" },
            ]}
          />
        </ChartSection>
      </div>

      {/* Wealth Distribution — Percentage */}
      <div className="mt-6">
        <ChartSection
          title="Distribución de Riqueza — El denominador se expande, ¿quién absorbe más?"
          subtitle="Distribución del market cap global por clase de activo. Cada dólar nuevo tiene que ir a algún lado."
          delay={5}
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} stackOffset="expand">
                <defs>
                  <linearGradient id="gradGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.amber} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={COLORS.amber} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="gradEquities" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.blue} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={COLORS.blue} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="gradRE" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.purple} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={COLORS.purple} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="gradBonds" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.cyan} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={COLORS.cyan} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="gradBTC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.orange} stopOpacity={0.6} />
                    <stop offset="100%" stopColor={COLORS.orange} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis
                  dataKey="date"
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 10 }}
                  ticks={xTicks}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                />
                <Tooltip
                  content={({ active, payload, label }: any) => {
                    if (!active || !payload) return null;
                    const point = filteredData.find((d: any) => d.date === label);
                    if (!point) return null;
                    const items = [
                      { label: "Inmuebles", value: point.realestate_wealth_pct, color: COLORS.purple },
                      { label: "Bonos", value: point.bonds_wealth_pct, color: COLORS.cyan },
                      { label: "Acciones", value: point.equities_wealth_pct, color: COLORS.blue },
                      { label: "Oro", value: point.gold_wealth_pct, color: COLORS.amber },
                      ...(point.bitcoin_wealth_pct > 0.01 ? [{ label: "Bitcoin", value: point.bitcoin_wealth_pct, color: COLORS.orange }] : []),
                    ];
                    return (
                      <div
                        className="rounded-lg px-4 py-3 text-xs"
                        style={{
                          background: "var(--bg-tooltip)",
                          border: "1px solid var(--border)",
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        <p className="mb-2 font-medium" style={{ color: "var(--text-secondary)" }}>{label}</p>
                        {items.map((item) => (
                          <div key={item.label} className="flex items-center gap-2 py-0.5">
                            <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                            <span style={{ color: "var(--text-muted)" }}>{item.label}:</span>
                            <span className="font-medium tabular-nums" style={{ color: item.color }}>
                              {item.value.toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="realestate_wealth_pct"
                  name="Inmuebles"
                  stackId="1"
                  stroke={COLORS.purple}
                  fill="url(#gradRE)"
                  strokeWidth={1.5}
                />
                <Area
                  type="monotone"
                  dataKey="bonds_wealth_pct"
                  name="Bonos"
                  stackId="1"
                  stroke={COLORS.cyan}
                  fill="url(#gradBonds)"
                  strokeWidth={1.5}
                />
                <Area
                  type="monotone"
                  dataKey="equities_wealth_pct"
                  name="Acciones"
                  stackId="1"
                  stroke={COLORS.blue}
                  fill="url(#gradEquities)"
                  strokeWidth={1.5}
                />
                <Area
                  type="monotone"
                  dataKey="gold_wealth_pct"
                  name="Oro"
                  stackId="1"
                  stroke={COLORS.amber}
                  fill="url(#gradGold)"
                  strokeWidth={1.5}
                />
                <Area
                  type="monotone"
                  dataKey="bitcoin_wealth_pct"
                  name="Bitcoin"
                  stackId="1"
                  stroke={COLORS.orange}
                  fill="url(#gradBTC)"
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <ChartLegend
            items={[
              { color: COLORS.purple, label: "Inmuebles" },
              { color: COLORS.cyan, label: "Bonos" },
              { color: COLORS.blue, label: "Acciones" },
              { color: COLORS.amber, label: "Oro" },
              { color: COLORS.orange, label: "Bitcoin" },
            ]}
          />
        </ChartSection>
      </div>

      {/* M2 Global Aggregate */}
      <div className="mt-6">
        <ChartSection
          title="M2 Global — El denominador en una sola línea"
          subtitle="Suma total de oferta monetaria M2 de las principales economías (trillones USD)"
          delay={5}
        >
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData}>
                <defs>
                  <linearGradient id="gradM2Global" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.green} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={COLORS.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis
                  dataKey="date"
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 10 }}
                  ticks={xTicks}
  
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  scale={logScale ? "log" : "auto"}
                  domain={logScale ? ["auto", "auto"] : [0, "auto"]}
                  allowDataOverflow={logScale}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="m2_global"
                  name="M2 Global"
                  stroke={COLORS.green}
                  fill="url(#gradM2Global)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartSection>

        {/* Closing message */}
        <div className="mt-16 mb-16 fade-in-up text-center">
          <div className="divider-gradient mb-8" />
          <p
            className="font-serif text-3xl md:text-4xl leading-tight tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            ¿Quién dijo que el dinero era{" "}
            <span className="glow-green" style={{ color: "var(--accent-green)" }}>
              escaso
            </span>
            ?
          </p>
          <div className="divider-gradient mt-8" />
        </div>

        {/* Sources */}
        <div className="mt-16 fade-in-up">
          <div className="divider-gradient mb-8" />
          <h3
            className="font-serif text-lg tracking-wide mb-6"
            style={{ color: "var(--text-secondary)" }}
          >
            Fuentes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            <div>
              <p className="uppercase tracking-widest mb-2" style={{ color: "var(--text-secondary)", fontSize: "10px" }}>
                Masa Monetaria (M2)
              </p>
              <ul className="space-y-1">
                <li>
                  <a href="https://fred.stlouisfed.org/series/M2SL" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--accent-green)" }}>FRED</a> — M2 Estados Unidos, Balance de la Fed, TGA, Reverse Repo
                </li>
                <li>
                  <a href="https://www.ecb.europa.eu/stats/money_credit_banking/monetary_aggregates/html/index.en.html" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--accent-green)" }}>BCE</a> — M2 Eurozona, Balance del BCE
                </li>
                <li>
                  <a href="https://www.boj.or.jp/en/statistics/money/ms/index.htm" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--accent-green)" }}>BoJ</a> — M2 Japón, Balance del BoJ
                </li>
                <li>
                  <a href="http://www.pbc.gov.cn/en/3688006/3688007/3688015/index.html" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--accent-green)" }}>PBoC</a> — M2 China, Balance del PBoC
                </li>
              </ul>

              <p className="uppercase tracking-widest mb-2 mt-6" style={{ color: "var(--text-secondary)", fontSize: "10px" }}>
                Oro
              </p>
              <ul className="space-y-1">
                <li>
                  <a href="https://www.gold.org/goldhub/data/gold-prices" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--accent-green)" }}>World Gold Council</a> — Precio del oro, oferta total sobre tierra
                </li>
              </ul>

              <p className="uppercase tracking-widest mb-2 mt-6" style={{ color: "var(--text-secondary)", fontSize: "10px" }}>
                Bitcoin
              </p>
              <ul className="space-y-1">
                <li>
                  <a href="https://coinmarketcap.com/currencies/bitcoin/" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--accent-green)" }}>CoinMarketCap</a> — Capitalización de mercado de Bitcoin
                </li>
              </ul>
            </div>

            <div>
              <p className="uppercase tracking-widest mb-2" style={{ color: "var(--text-secondary)", fontSize: "10px" }}>
                Acciones
              </p>
              <ul className="space-y-1">
                <li>
                  <a href="https://data.worldbank.org/indicator/CM.MKT.LCAP.CD" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--accent-green)" }}>World Bank</a> — Capitalización bursátil global
                </li>
                <li>
                  <a href="https://siblisresearch.com/data/us-stock-market-value/" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--accent-green)" }}>Siblis Research</a> — Series históricas de mercados de valores
                </li>
              </ul>

              <p className="uppercase tracking-widest mb-2 mt-6" style={{ color: "var(--text-secondary)", fontSize: "10px" }}>
                Inmuebles
              </p>
              <ul className="space-y-1">
                <li>
                  <a href="https://www.savills.com/impacts/market-trends/the-total-value-of-global-real-estate.html" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--accent-green)" }}>Savills</a> — Valor total del mercado inmobiliario global
                </li>
              </ul>

              <p className="uppercase tracking-widest mb-2 mt-6" style={{ color: "var(--text-secondary)", fontSize: "10px" }}>
                Bonos
              </p>
              <ul className="space-y-1">
                <li>
                  <a href="https://www.bis.org/statistics/secstats.htm" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--accent-green)" }}>BIS</a> — Estadísticas de valores de deuda internacional
                </li>
                <li>
                  <a href="https://www.sifma.org/resources/research/fact-book/" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--accent-green)" }}>SIFMA</a> — Mercados globales de renta fija
                </li>
              </ul>

              <p className="uppercase tracking-widest mb-2 mt-6" style={{ color: "var(--text-secondary)", fontSize: "10px" }}>
                Metodología
              </p>
              <p>
                Datos históricos pre-1970 interpolados con crecimiento exponencial entre
                puntos ancla verificados. Índice denominador: 60&nbsp;% M2 Global + 40&nbsp;%
                Balances de Bancos Centrales, base 100&nbsp;=&nbsp;1913. Todos los valores
                en trillones USD.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Small legend component */
function ChartLegend({
  items,
}: {
  items: { color: string; label: string; dashed?: boolean }[];
}) {
  return (
    <div className="flex flex-wrap gap-4 mt-4 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          {item.dashed ? (
            <div
              className="w-4 h-0"
              style={{
                borderTop: `2px dashed ${item.color}`,
              }}
            />
          ) : (
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: item.color }}
            />
          )}
          <span className="text-[10px] tracking-wider" style={{ color: "var(--text-muted)" }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
