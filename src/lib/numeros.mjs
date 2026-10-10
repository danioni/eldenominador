// Formato numérico del sitio: español neutro, coma decimal y punto de miles.
// Funciones puras y sin dependencias: sirven en el servidor, en los componentes
// cliente y en los tests sin red. Formatear no cambia ningún valor publicado:
// la unidad nativa de cada serie sigue siendo la que manda.

/**
 * 23342.8 → "23.342,8". Se formatea en en-US, que está en cualquier build de
 * Node e ICU, y se intercambian los separadores: así el resultado no depende de
 * qué locales traiga el navegador o el servidor.
 * @param {number} valor
 * @param {number} [decimales] decimales fijos
 */
export function formatearNumero(valor, decimales = 1) {
  const base = valor.toLocaleString("en-US", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
  return base.replace(/[.,]/g, (s) => (s === "," ? "." : ","));
}

/**
 * Como formatearNumero, pero sin ceros decimales de relleno: 2.5 → "2,5",
 * 10 → "10". Para las marcas de los ejes.
 * @param {number} valor
 * @param {number} maxDecimales
 */
export function formatearNumeroHasta(valor, maxDecimales) {
  const base = valor.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimales,
  });
  return base.replace(/[.,]/g, (s) => (s === "," ? "." : ","));
}

/**
 * Marcas de los ejes: el número completo, con punto de miles y los decimales
 * que pide su tamaño. 23284 → "23.284", 2.5 → "2,5", 0.25 → "0,25".
 * @param {number} valor
 */
export function formatearEje(valor) {
  if (valor === 0) return "0";
  const abs = Math.abs(valor);
  if (abs >= 1e6) return `${formatearNumeroHasta(valor / 1e6, 1)} M`;
  if (abs >= 100) return formatearNumeroHasta(valor, 0);
  if (abs >= 10) return formatearNumeroHasta(valor, 1);
  return formatearNumeroHasta(valor, 2);
}

/**
 * +3,2 % / −1,4 %, con el signo menos tipográfico y el espacio antes del
 * signo de porcentaje.
 * @param {number} valor
 * @param {number} [decimales]
 */
export function formatearPct(valor, decimales = 1) {
  const signo = valor > 0 ? "+" : valor < 0 ? "−" : "";
  return `${signo}${formatearNumero(Math.abs(valor), decimales)} %`;
}

/**
 * Decimales razonables para un valor en su unidad nativa.
 * @param {number} valor
 */
export function decimalesPara(valor) {
  const abs = Math.abs(valor);
  if (abs >= 1e5) return 0;
  if (abs >= 1e3) return 1;
  if (abs >= 10) return 2;
  return 4;
}

/** Unidades nativas que se pueden llevar a billones (10¹²) de la misma moneda. */
const A_BILLONES = {
  "miles de millones de USD": { divisor: 1e3, moneda: "USD" },
  "millones de USD": { divisor: 1e6, moneda: "USD" },
  "millones de EUR": { divisor: 1e6, moneda: "EUR" },
  "100 millones de JPY": { divisor: 1e4, moneda: "JPY" },
  "millones de CNY": { divisor: 1e6, moneda: "CNY" },
  "miles de millones de CNY": { divisor: 1e3, moneda: "CNY" },
};

/**
 * Lleva un valor en su unidad nativa a billones (10¹²) de la misma moneda,
 * para comparar magnitudes sin conversiones mentales. Es un cambio de unidad,
 * no del valor publicado. Devuelve null si la unidad no es un agregado en
 * moneda (por ejemplo, un ratio).
 * @param {number} valor
 * @param {string} unidad la unidad nativa, tal como la escribe serie_D0.csv
 * @returns {{ valor: number, moneda: string, unidad: string, unidadLarga: string } | null}
 */
export function aBillones(valor, unidad) {
  const entrada = A_BILLONES[/** @type {keyof typeof A_BILLONES} */ (unidad)];
  if (!entrada) return null;
  return {
    valor: valor / entrada.divisor,
    moneda: entrada.moneda,
    unidad: `billones de ${entrada.moneda}`,
    unidadLarga: `billones (10¹²) de ${entrada.moneda}`,
  };
}

/**
 * "50,55 billones de USD", o null si la unidad no se convierte.
 * @param {number} valor
 * @param {string} unidad
 * @param {number} [decimales]
 */
export function formatearBillones(valor, unidad, decimales = 2) {
  const c = aBillones(valor, unidad);
  return c ? `${formatearNumero(c.valor, decimales)} ${c.unidad}` : null;
}

/**
 * "23.342,8 miles de millones de USD": el valor en su unidad nativa.
 * @param {number} valor
 * @param {string} unidad
 */
export function valorConUnidad(valor, unidad) {
  return `${formatearNumero(valor, decimalesPara(valor))} ${unidad}`;
}

/**
 * Para los ejes, mientras no pasen a billones: 23284 → "23 k", 12963895 → "13 M".
 * @param {number} valor
 */
export function formatearCompacto(valor) {
  if (valor === 0) return "0";
  const abs = Math.abs(valor);
  if (abs >= 1e9) return `${formatearNumero(valor / 1e9, abs >= 1e10 ? 0 : 1)} G`;
  if (abs >= 1e6) return `${formatearNumero(valor / 1e6, abs >= 1e7 ? 0 : 1)} M`;
  if (abs >= 1e3) return `${formatearNumero(valor / 1e3, abs >= 1e4 ? 0 : 1)} k`;
  if (abs >= 100) return formatearNumero(valor, 0);
  if (abs >= 10) return formatearNumero(valor, 1);
  return formatearNumero(valor, 2);
}
