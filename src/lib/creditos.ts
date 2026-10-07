// Créditos con texto fijo que exige una fuente. Van palabra por palabra, en el
// idioma del documento que los exige; la traducción, si hace falta, va aparte.

/**
 * Banco de Japón, "Notice Regarding the Use of the API Service"
 * (https://www.stat-search.boj.or.jp/info/api_notice_en.pdf), sección II
 * "Credit": "In releasing any service which uses the API, please clearly
 * acknowledge the use of the API. Specifically, we kindly request the use of
 * the following credit." Leído el 2026-10-05; copia en losratios,
 * senales/data/privado/d0_paso0/japon/statsearch_api_notice_en.pdf, SHA-256
 * 7773abb22c8a863038a0926001253e4b2cc4cb3a56db234772b64bad8c8b5fd6. La
 * sección I pide además avisar por correo al publicar el servicio (A-D0-8).
 */
export const CREDITO_API_BOJ =
  'This service uses the API provided by the "Bank of Japan Time-Series Data Search." The Bank of Japan does not guarantee the content of the service.';

/** Las series que llegaron por esa API lo declaran así en su atribución (serie_D0.csv). */
export function usaApiBoj(atribucion: string): boolean {
  return atribucion.includes("BOJ Time-Series Data Search");
}
