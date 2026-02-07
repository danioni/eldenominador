// Historical global liquidity data (trillions USD)
// 1913-2025: 112 years of monetary history
// Sources: FRED, ECB, BoJ, PBoC, BIS, historical research

export interface LiquidityDataPoint {
  date: string;
  m2_us: number;
  m2_eu: number;
  m2_japan: number;
  m2_china: number;
  m2_global: number;
  fed_bs: number;
  ecb_bs: number;
  boj_bs: number;
  pboc_bs: number;
  cb_total: number;
  tga: number;
  rrp: number;
  net_liquidity: number;
  denominator_index: number;
  gold_usd: number;
  gold_real: number; // gold / denominator_index — poder adquisitivo real del oro
}

// Annual data points for major monetary eras (1913-2014)
// Values are approximate year-end figures in trillions USD (inflation-adjusted to nominal)
// Pre-euro European M2 is estimated from aggregate of major economies
// Pre-modern CB balance sheets estimated from historical records
interface AnnualSnapshot {
  year: number;
  m2_us: number;
  m2_eu: number;
  m2_japan: number;
  m2_china: number;
  fed_bs: number;
  ecb_bs: number; // pre-ECB: aggregate European CBs
  boj_bs: number;
  pboc_bs: number; // pre-PBoC: People's Bank estimates
  tga: number;
  rrp: number;
  gold_usd: number; // USD per troy ounce
}

// Key historical snapshots — values in trillions USD
// These anchor points are interpolated between for smooth curves
const historicalAnchors: AnnualSnapshot[] = [
  // 1913: Fed created, gold standard — gold fixed at $20.67/oz
  { year: 1913, m2_us: 0.020, m2_eu: 0.025, m2_japan: 0.003, m2_china: 0.002, fed_bs: 0.001, ecb_bs: 0.002, boj_bs: 0.001, pboc_bs: 0.001, tga: 0.001, rrp: 0, gold_usd: 20.67 },
  // 1918: WWI expansion
  { year: 1918, m2_us: 0.035, m2_eu: 0.045, m2_japan: 0.006, m2_china: 0.003, fed_bs: 0.005, ecb_bs: 0.008, boj_bs: 0.002, pboc_bs: 0.001, tga: 0.002, rrp: 0, gold_usd: 20.67 },
  // 1920: Post-war deflation
  { year: 1920, m2_us: 0.034, m2_eu: 0.050, m2_japan: 0.007, m2_china: 0.003, fed_bs: 0.006, ecb_bs: 0.010, boj_bs: 0.002, pboc_bs: 0.001, tga: 0.001, rrp: 0, gold_usd: 20.67 },
  // 1929: Roaring 20s peak
  { year: 1929, m2_us: 0.046, m2_eu: 0.055, m2_japan: 0.010, m2_china: 0.004, fed_bs: 0.005, ecb_bs: 0.008, boj_bs: 0.003, pboc_bs: 0.001, tga: 0.001, rrp: 0, gold_usd: 20.63 },
  // 1933: Great Depression trough — FDR revalues gold to $35
  { year: 1933, m2_us: 0.032, m2_eu: 0.040, m2_japan: 0.009, m2_china: 0.003, fed_bs: 0.008, ecb_bs: 0.006, boj_bs: 0.003, pboc_bs: 0.001, tga: 0.002, rrp: 0, gold_usd: 26.33 },
  // 1940: Pre-WWII buildup — gold fixed at $35
  { year: 1940, m2_us: 0.055, m2_eu: 0.048, m2_japan: 0.012, m2_china: 0.004, fed_bs: 0.020, ecb_bs: 0.012, boj_bs: 0.005, pboc_bs: 0.002, tga: 0.002, rrp: 0, gold_usd: 33.85 },
  // 1945: WWII peak — Bretton Woods, gold at $35
  { year: 1945, m2_us: 0.127, m2_eu: 0.060, m2_japan: 0.020, m2_china: 0.005, fed_bs: 0.045, ecb_bs: 0.018, boj_bs: 0.008, pboc_bs: 0.002, tga: 0.025, rrp: 0, gold_usd: 34.71 },
  // 1950: Post-war normalization, Bretton Woods
  { year: 1950, m2_us: 0.150, m2_eu: 0.080, m2_japan: 0.015, m2_china: 0.006, fed_bs: 0.040, ecb_bs: 0.020, boj_bs: 0.006, pboc_bs: 0.003, tga: 0.005, rrp: 0, gold_usd: 34.72 },
  // 1960: Post-war boom
  { year: 1960, m2_us: 0.312, m2_eu: 0.180, m2_japan: 0.040, m2_china: 0.012, fed_bs: 0.050, ecb_bs: 0.035, boj_bs: 0.012, pboc_bs: 0.008, tga: 0.005, rrp: 0, gold_usd: 35.27 },
  // 1971: Nixon shock — gold freed from $35 peg
  { year: 1971, m2_us: 0.710, m2_eu: 0.400, m2_japan: 0.120, m2_china: 0.020, fed_bs: 0.075, ecb_bs: 0.060, boj_bs: 0.025, pboc_bs: 0.012, tga: 0.010, rrp: 0, gold_usd: 41.25 },
  // 1975: Stagflation era — gold free market
  { year: 1975, m2_us: 1.020, m2_eu: 0.620, m2_japan: 0.210, m2_china: 0.028, fed_bs: 0.095, ecb_bs: 0.080, boj_bs: 0.038, pboc_bs: 0.015, tga: 0.012, rrp: 0, gold_usd: 161 },
  // 1980: Volcker shock — gold peak at $850 intraday, ~$615 year-end
  { year: 1980, m2_us: 1.600, m2_eu: 0.950, m2_japan: 0.350, m2_china: 0.040, fed_bs: 0.150, ecb_bs: 0.120, boj_bs: 0.055, pboc_bs: 0.020, tga: 0.015, rrp: 0, gold_usd: 615 },
  // 1985: Reagan expansion, Plaza Accord
  { year: 1985, m2_us: 2.500, m2_eu: 1.300, m2_japan: 0.550, m2_china: 0.065, fed_bs: 0.200, ecb_bs: 0.170, boj_bs: 0.085, pboc_bs: 0.030, tga: 0.020, rrp: 0, gold_usd: 317 },
  // 1990: Japan bubble peak, German reunification
  { year: 1990, m2_us: 3.280, m2_eu: 2.100, m2_japan: 1.100, m2_china: 0.150, fed_bs: 0.280, ecb_bs: 0.280, boj_bs: 0.180, pboc_bs: 0.060, tga: 0.030, rrp: 0, gold_usd: 383 },
  // 1995: Japan lost decade, Mexico crisis
  { year: 1995, m2_us: 3.640, m2_eu: 2.800, m2_japan: 1.350, m2_china: 0.700, fed_bs: 0.400, ecb_bs: 0.350, boj_bs: 0.350, pboc_bs: 0.150, tga: 0.030, rrp: 0, gold_usd: 387 },
  // 2000: Dot-com peak — gold at 20-year low
  { year: 2000, m2_us: 4.920, m2_eu: 4.500, m2_japan: 2.100, m2_china: 1.600, fed_bs: 0.620, ecb_bs: 0.750, boj_bs: 0.650, pboc_bs: 0.450, tga: 0.035, rrp: 0, gold_usd: 273 },
  // 2003: Post dot-com, Iraq War
  { year: 2003, m2_us: 6.070, m2_eu: 5.800, m2_japan: 2.500, m2_china: 2.800, fed_bs: 0.720, ecb_bs: 0.900, boj_bs: 1.000, pboc_bs: 0.700, tga: 0.035, rrp: 0, gold_usd: 416 },
  // 2007: Pre-GFC peak
  { year: 2007, m2_us: 7.500, m2_eu: 8.200, m2_japan: 2.800, m2_china: 5.400, fed_bs: 0.870, ecb_bs: 1.500, boj_bs: 1.050, pboc_bs: 1.800, tga: 0.040, rrp: 0, gold_usd: 836 },
  // 2009: GFC response — QE1
  { year: 2009, m2_us: 8.500, m2_eu: 8.800, m2_japan: 3.000, m2_china: 8.500, fed_bs: 2.100, ecb_bs: 2.000, boj_bs: 1.200, pboc_bs: 2.800, tga: 0.100, rrp: 0, gold_usd: 1096 },
  // 2012: QE3 "infinity", ECB "whatever it takes"
  { year: 2012, m2_us: 10.400, m2_eu: 9.600, m2_japan: 3.400, m2_china: 15.500, fed_bs: 2.900, ecb_bs: 3.000, boj_bs: 1.600, pboc_bs: 4.200, tga: 0.080, rrp: 0.10, gold_usd: 1675 },
  // 2014: End of QE3, start of ECB QE, Abenomics
  { year: 2014, m2_us: 11.650, m2_eu: 10.500, m2_japan: 7.800, m2_china: 20.000, fed_bs: 4.500, ecb_bs: 2.000, boj_bs: 2.900, pboc_bs: 5.000, tga: 0.200, rrp: 0.15, gold_usd: 1199 },
  // 2015: ECB QE launch, Fed normalization
  { year: 2015, m2_us: 12.300, m2_eu: 10.800, m2_japan: 8.200, m2_china: 21.500, fed_bs: 4.480, ecb_bs: 2.700, boj_bs: 3.400, pboc_bs: 5.300, tga: 0.300, rrp: 0.20, gold_usd: 1060 },
  // 2016: Brexit, BOJ negative rates, Trump election
  { year: 2016, m2_us: 13.200, m2_eu: 11.400, m2_japan: 8.700, m2_china: 23.000, fed_bs: 4.450, ecb_bs: 3.400, boj_bs: 4.000, pboc_bs: 5.500, tga: 0.350, rrp: 0.15, gold_usd: 1151 },
  // 2017: Synchronized global growth, Fed starts QT
  { year: 2017, m2_us: 13.800, m2_eu: 12.400, m2_japan: 9.100, m2_china: 24.500, fed_bs: 4.400, ecb_bs: 4.400, boj_bs: 4.800, pboc_bs: 5.800, tga: 0.200, rrp: 0.10, gold_usd: 1296 },
  // 2018: Fed hiking + QT, trade war
  { year: 2018, m2_us: 14.350, m2_eu: 12.800, m2_japan: 9.400, m2_china: 25.800, fed_bs: 4.100, ecb_bs: 4.700, boj_bs: 5.200, pboc_bs: 5.600, tga: 0.350, rrp: 0.05, gold_usd: 1282 },
  // 2019: Fed pivot, repo crisis, rate cuts
  { year: 2019, m2_us: 15.300, m2_eu: 13.100, m2_japan: 9.700, m2_china: 27.500, fed_bs: 4.200, ecb_bs: 4.700, boj_bs: 5.500, pboc_bs: 5.800, tga: 0.400, rrp: 0.00, gold_usd: 1517 },
  // 2020: COVID — massive QE, M2 explosion
  { year: 2020, m2_us: 19.100, m2_eu: 14.800, m2_japan: 10.500, m2_china: 32.000, fed_bs: 7.400, ecb_bs: 7.000, boj_bs: 6.700, pboc_bs: 6.200, tga: 1.600, rrp: 0.00, gold_usd: 1898 },
  // 2021: Peak stimulus, RRP surge
  { year: 2021, m2_us: 21.600, m2_eu: 16.000, m2_japan: 11.000, m2_china: 36.000, fed_bs: 8.800, ecb_bs: 8.600, boj_bs: 7.200, pboc_bs: 6.500, tga: 0.450, rrp: 1.90, gold_usd: 1829 },
  // 2022: Tightening begins, inflation fight
  { year: 2022, m2_us: 21.200, m2_eu: 15.200, m2_japan: 10.400, m2_china: 38.000, fed_bs: 8.500, ecb_bs: 8.000, boj_bs: 7.400, pboc_bs: 6.300, tga: 0.500, rrp: 2.20, gold_usd: 1824 },
  // 2023: QT continues, RRP drawdown
  { year: 2023, m2_us: 20.800, m2_eu: 14.500, m2_japan: 10.200, m2_china: 40.500, fed_bs: 7.700, ecb_bs: 7.000, boj_bs: 7.500, pboc_bs: 6.500, tga: 0.750, rrp: 0.70, gold_usd: 2063 },
  // 2024: Pivot whispers, gradual easing
  { year: 2024, m2_us: 21.500, m2_eu: 14.800, m2_japan: 10.000, m2_china: 43.000, fed_bs: 7.100, ecb_bs: 6.500, boj_bs: 7.600, pboc_bs: 7.000, tga: 0.800, rrp: 0.40, gold_usd: 2625 },
  // 2025: Re-expansion cycle
  { year: 2025, m2_us: 22.300, m2_eu: 15.200, m2_japan: 10.200, m2_china: 45.500, fed_bs: 7.000, ecb_bs: 6.300, boj_bs: 7.800, pboc_bs: 7.500, tga: 0.700, rrp: 0.30, gold_usd: 2850 },
];


// Interpolate between anchor points for smooth annual data
function interpolate(a: AnnualSnapshot, b: AnnualSnapshot, year: number): AnnualSnapshot {
  const t = (year - a.year) / (b.year - a.year);
  // Use exponential interpolation for monetary values (compound growth)
  const expInterp = (v1: number, v2: number) => v1 * Math.pow(v2 / v1, t);
  return {
    year,
    m2_us: expInterp(a.m2_us, b.m2_us),
    m2_eu: expInterp(a.m2_eu, b.m2_eu),
    m2_japan: expInterp(a.m2_japan, b.m2_japan),
    m2_china: expInterp(a.m2_china, b.m2_china),
    fed_bs: expInterp(a.fed_bs, b.fed_bs),
    ecb_bs: expInterp(a.ecb_bs, b.ecb_bs),
    boj_bs: expInterp(a.boj_bs, b.boj_bs),
    pboc_bs: expInterp(a.pboc_bs, b.pboc_bs),
    tga: expInterp(Math.max(a.tga, 0.0001), Math.max(b.tga, 0.0001)),
    rrp: 0,
    gold_usd: expInterp(a.gold_usd, b.gold_usd),
  };
}

function generateData(): LiquidityDataPoint[] {
  const data: LiquidityDataPoint[] = [];

  // Base for index: 1913 values
  const base1913 = historicalAnchors[0];
  const baseM2 = base1913.m2_us + base1913.m2_eu + base1913.m2_japan + base1913.m2_china;
  const baseCB = base1913.fed_bs + base1913.ecb_bs + base1913.boj_bs + base1913.pboc_bs;

  const lastYear = historicalAnchors[historicalAnchors.length - 1].year;

  for (let year = 1913; year <= lastYear; year++) {
    // Find surrounding anchors
    let aIdx = 0;
    for (let i = 0; i < historicalAnchors.length - 1; i++) {
      if (year >= historicalAnchors[i].year && year <= historicalAnchors[i + 1].year) {
        aIdx = i;
        break;
      }
    }
    const a = historicalAnchors[aIdx];
    const b = historicalAnchors[aIdx + 1];
    const snap = year === a.year ? a : year === b.year ? b : interpolate(a, b, year);

    const m2_global = snap.m2_us + snap.m2_eu + snap.m2_japan + snap.m2_china;
    const cb_total = snap.fed_bs + snap.ecb_bs + snap.boj_bs + snap.pboc_bs;
    const net_liq = snap.fed_bs - snap.tga - snap.rrp;
    const denominator_index = ((m2_global / baseM2) * 0.6 + (cb_total / baseCB) * 0.4) * 100;

    data.push({
      date: `${year}`,
      m2_us: +snap.m2_us.toFixed(3),
      m2_eu: +snap.m2_eu.toFixed(3),
      m2_japan: +snap.m2_japan.toFixed(3),
      m2_china: +snap.m2_china.toFixed(3),
      m2_global: +m2_global.toFixed(3),
      fed_bs: +snap.fed_bs.toFixed(3),
      ecb_bs: +snap.ecb_bs.toFixed(3),
      boj_bs: +snap.boj_bs.toFixed(3),
      pboc_bs: +snap.pboc_bs.toFixed(3),
      cb_total: +cb_total.toFixed(3),
      tga: +snap.tga.toFixed(3),
      rrp: +snap.rrp.toFixed(3),
      net_liquidity: +net_liq.toFixed(3),
      denominator_index: +denominator_index.toFixed(1),
      gold_usd: +snap.gold_usd.toFixed(0),
      gold_real: +(snap.gold_usd / (denominator_index / 100)).toFixed(2),
    });
  }

  return data;
}

export const liquidityData = generateData();

// CAGR: Compound Annual Growth Rate
// (final/initial)^(1/years) - 1
function cagr(initial: number, final: number, years: number): number {
  if (initial <= 0 || final <= 0 || years <= 0) return 0;
  return +((Math.pow(final / initial, 1 / years) - 1) * 100).toFixed(1);
}

// Get latest metrics with CAGR from 1913
export function getLatestMetrics() {
  const latest = liquidityData[liquidityData.length - 1];
  const first = liquidityData[0]; // 1913
  const years = 112; // 1913-2025

  return {
    m2Global: {
      value: latest.m2_global,
      change: cagr(first.m2_global, latest.m2_global, years),
      label: "M2 Global",
      unit: "T",
    },
    cbTotal: {
      value: latest.cb_total,
      change: cagr(first.cb_total, latest.cb_total, years),
      label: "Balance Bancos Centrales",
      unit: "T",
    },
    netLiquidity: {
      value: latest.net_liquidity,
      change: cagr(Math.max(first.net_liquidity, 0.0001), latest.net_liquidity, years),
      label: "Liquidez Neta Fed",
      unit: "T",
    },
    denominatorIndex: {
      value: latest.denominator_index,
      change: cagr(first.denominator_index, latest.denominator_index, years),
      label: "Índice Denominador",
      unit: "",
    },
  };
}

export type MetricData = ReturnType<typeof getLatestMetrics>[keyof ReturnType<typeof getLatestMetrics>];
