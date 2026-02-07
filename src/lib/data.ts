// Historical global liquidity data (trillions USD)
// Sources modeled: FRED, ECB, BoJ, PBoC

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
}

// Generate monthly data from 2015 to 2025 (11 years)
function generateData(): LiquidityDataPoint[] {
  const data: LiquidityDataPoint[] = [];
  const months = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];

  // Base values (trillions USD) — roughly accurate starting points for Jan 2015
  let m2_us = 11.7;
  let m2_eu = 10.8;
  let m2_japan = 8.2;
  let m2_china = 20.5;
  let fed_bs = 4.5;
  let ecb_bs = 2.2;
  let boj_bs = 3.1;
  let pboc_bs = 5.2;
  let tga = 0.25;
  let rrp = 0.15;

  // Growth scenarios per phase (per month)
  const phases = [
    // 2015: Post-taper, slow normalization
    { m2_g: 0.004, fed_g: -0.001, ecb_g: 0.025, boj_g: 0.015, pboc_g: 0.005, tga_d: 0.3, rrp_d: 0.2 },
    // 2016: Global uncertainty, Brexit, BOJ negative rates
    { m2_g: 0.005, fed_g: 0.001, ecb_g: 0.02, boj_g: 0.018, pboc_g: 0.004, tga_d: 0.35, rrp_d: 0.15 },
    // 2017: Synchronized global growth, Fed starts QT
    { m2_g: 0.004, fed_g: -0.003, ecb_g: 0.015, boj_g: 0.012, pboc_g: 0.006, tga_d: 0.2, rrp_d: 0.1 },
    // 2018: Fed hiking + QT, trade war starts
    { m2_g: 0.003, fed_g: -0.005, ecb_g: 0.005, boj_g: 0.008, pboc_g: 0.004, tga_d: 0.35, rrp_d: 0.05 },
    // 2019: Fed pivot, repo crisis Sep, rate cuts begin
    { m2_g: 0.005, fed_g: 0.008, ecb_g: 0.003, boj_g: 0.005, pboc_g: 0.005, tga_d: 0.4, rrp_d: 0.0 },
    // 2020: COVID expansion — massive QE
    { m2_g: 0.018, fed_g: 0.06, ecb_g: 0.03, boj_g: 0.015, pboc_g: 0.01, tga_d: 0.8, rrp_d: 0.0 },
    // 2021: Peak stimulus
    { m2_g: 0.012, fed_g: 0.02, ecb_g: 0.02, boj_g: 0.01, pboc_g: 0.008, tga_d: 0.7, rrp_d: 1.5 },
    // 2022: Tightening begins
    { m2_g: -0.002, fed_g: -0.01, ecb_g: 0.005, boj_g: 0.008, pboc_g: 0.006, tga_d: 0.5, rrp_d: 2.2 },
    // 2023: QT continues
    { m2_g: 0.002, fed_g: -0.008, ecb_g: -0.005, boj_g: 0.005, pboc_g: 0.005, tga_d: 0.7, rrp_d: 1.8 },
    // 2024: Pivot whispers
    { m2_g: 0.005, fed_g: -0.003, ecb_g: -0.002, boj_g: 0.003, pboc_g: 0.008, tga_d: 0.8, rrp_d: 0.6 },
    // 2025: Re-expansion
    { m2_g: 0.006, fed_g: 0.005, ecb_g: 0.003, boj_g: 0.004, pboc_g: 0.01, tga_d: 0.7, rrp_d: 0.3 },
  ];

  // Base for index calculation (Jan 2015 values)
  const baseM2 = m2_us + m2_eu + m2_japan + m2_china;
  const baseCB = fed_bs + ecb_bs + boj_bs + pboc_bs;

  for (let year = 0; year < 11; year++) {
    const phase = phases[year];
    for (let month = 0; month < 12; month++) {
      // Add some noise
      const noise = () => (Math.random() - 0.5) * 0.003;

      m2_us *= 1 + phase.m2_g + noise();
      m2_eu *= 1 + phase.m2_g * 0.8 + noise();
      m2_japan *= 1 + phase.m2_g * 0.5 + noise();
      m2_china *= 1 + phase.m2_g * 1.2 + noise();

      fed_bs *= 1 + phase.fed_g + noise();
      ecb_bs *= 1 + phase.ecb_g + noise();
      boj_bs *= 1 + phase.boj_g + noise();
      pboc_bs *= 1 + phase.pboc_g + noise();

      // TGA and RRP fluctuate
      tga = phase.tga_d + (Math.random() - 0.5) * 0.3;
      rrp = Math.max(0, phase.rrp_d + (Math.random() - 0.5) * 0.4);

      const m2_global = m2_us + m2_eu + m2_japan + m2_china;
      const cb_total = fed_bs + ecb_bs + boj_bs + pboc_bs;
      const net_liq = fed_bs - tga - rrp;

      // Denominator index: normalized composite (base 100 = Jan 2015)
      const denominator_index =
        ((m2_global / baseM2) * 0.6 + (cb_total / baseCB) * 0.4) * 100;

      data.push({
        date: `${months[month]} ${2015 + year}`,
        m2_us: +m2_us.toFixed(2),
        m2_eu: +m2_eu.toFixed(2),
        m2_japan: +m2_japan.toFixed(2),
        m2_china: +m2_china.toFixed(2),
        m2_global: +m2_global.toFixed(2),
        fed_bs: +fed_bs.toFixed(2),
        ecb_bs: +ecb_bs.toFixed(2),
        boj_bs: +boj_bs.toFixed(2),
        pboc_bs: +pboc_bs.toFixed(2),
        cb_total: +cb_total.toFixed(2),
        tga: +tga.toFixed(2),
        rrp: +rrp.toFixed(2),
        net_liquidity: +net_liq.toFixed(2),
        denominator_index: +denominator_index.toFixed(1),
      });
    }
  }

  return data;
}

export const liquidityData = generateData();

// Get latest metrics
export function getLatestMetrics() {
  const latest = liquidityData[liquidityData.length - 1];
  const prev = liquidityData[liquidityData.length - 13]; // year ago

  const yoy = (current: number, previous: number) =>
    +(((current - previous) / previous) * 100).toFixed(1);

  return {
    m2Global: {
      value: latest.m2_global,
      change: yoy(latest.m2_global, prev.m2_global),
      label: "M2 Global",
      unit: "T",
    },
    cbTotal: {
      value: latest.cb_total,
      change: yoy(latest.cb_total, prev.cb_total),
      label: "Balance Bancos Centrales",
      unit: "T",
    },
    netLiquidity: {
      value: latest.net_liquidity,
      change: yoy(latest.net_liquidity, prev.net_liquidity),
      label: "Liquidez Neta Fed",
      unit: "T",
    },
    denominatorIndex: {
      value: latest.denominator_index,
      change: +(latest.denominator_index - prev.denominator_index).toFixed(1),
      label: "Índice Denominador",
      unit: "",
    },
  };
}

export type MetricData = ReturnType<typeof getLatestMetrics>[keyof ReturnType<typeof getLatestMetrics>];
