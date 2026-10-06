// Formato de meses, números y unidades. Funciones puras: sirven en el servidor
// y en los componentes cliente. Los números se agrupan como en losratios.com
// (coma de miles, punto decimal) para que el ecosistema lea igual.

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "2026-08" → "ago 2026" */
export function etiquetaMes(mes: string): string {
  const [anio, m] = mes.split("-");
  const indice = Number(m) - 1;
  return `${MESES[indice] ?? m} ${anio}`;
}

/** "2026-08" → 2026 */
export function anioDe(mes: string): number {
  return Number(mes.slice(0, 4));
}

/** "2026-08" menos 12 meses → "2025-08" */
export function mesMenos(mes: string, meses: number): string {
  const [anio, m] = mes.split("-").map(Number);
  const total = anio * 12 + (m - 1) - meses;
  const nuevoAnio = Math.floor(total / 12);
  const nuevoMes = (total % 12) + 1;
  return `${nuevoAnio}-${String(nuevoMes).padStart(2, "0")}`;
}

export function formatearNumero(valor: number, decimales = 1): string {
  return valor.toLocaleString("en-US", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
}

/** Para los ejes: 23284 → "23k", 12963895 → "13M". */
export function formatearCompacto(valor: number): string {
  const abs = Math.abs(valor);
  if (abs >= 1e9) return `${formatearNumero(valor / 1e9, abs >= 1e10 ? 0 : 1)}G`;
  if (abs >= 1e6) return `${formatearNumero(valor / 1e6, abs >= 1e7 ? 0 : 1)}M`;
  if (abs >= 1e3) return `${formatearNumero(valor / 1e3, abs >= 1e4 ? 0 : 1)}k`;
  if (abs >= 100) return formatearNumero(valor, 0);
  if (abs >= 10) return formatearNumero(valor, 1);
  return formatearNumero(valor, 2);
}

/** +3.2 % / −1.4 %, con el espacio antes del signo de porcentaje. */
export function formatearPct(valor: number, decimales = 1): string {
  const signo = valor > 0 ? "+" : valor < 0 ? "−" : "";
  return `${signo}${formatearNumero(Math.abs(valor), decimales)} %`;
}

/** Decimales razonables para un valor en su unidad nativa. */
export function decimalesPara(valor: number): number {
  const abs = Math.abs(valor);
  if (abs >= 1e5) return 0;
  if (abs >= 1e3) return 1;
  if (abs >= 10) return 2;
  return 4;
}

export interface Conversion {
  valor: number;
  unidad: string;
}

/**
 * Lleva un valor en su unidad nativa a billones (10¹²) de la misma moneda,
 * para leerlo de un vistazo. Es una conversión de unidad, no un cambio del
 * valor publicado; la unidad nativa sigue siendo la que manda.
 */
export function aBillones(valor: number, unidad: string): Conversion | null {
  const tabla: Record<string, { divisor: number; moneda: string }> = {
    "miles de millones de USD": { divisor: 1e3, moneda: "USD" },
    "millones de USD": { divisor: 1e6, moneda: "USD" },
    "millones de EUR": { divisor: 1e6, moneda: "EUR" },
    "100 millones de JPY": { divisor: 1e4, moneda: "JPY" },
    "millones de CNY": { divisor: 1e6, moneda: "CNY" },
    "miles de millones de CNY": { divisor: 1e3, moneda: "CNY" },
  };
  const entrada = tabla[unidad];
  if (!entrada) return null;
  return { valor: valor / entrada.divisor, unidad: `billones (10¹²) de ${entrada.moneda}` };
}

/** "23,284.3 miles de millones de USD" */
export function valorConUnidad(valor: number, unidad: string): string {
  return `${formatearNumero(valor, decimalesPara(valor))} ${unidad}`;
}
