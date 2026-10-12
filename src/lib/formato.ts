// Formato de meses, números y unidades. Funciones puras: sirven en el servidor
// y en los componentes cliente. Los números van en español neutro (coma
// decimal, punto de miles); el formato vive en numeros.mjs para que los tests
// sin red lo cubran sin compilar TypeScript.

export {
  aBillones,
  decimalesPara,
  formatearBillones,
  formatearEje,
  formatearNumero,
  formatearNumeroHasta,
  formatearPct,
  valorConUnidad,
} from "./numeros.mjs";

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
