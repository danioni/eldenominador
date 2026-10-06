// El Denominador: las series publicadas por senales/ de danioni/losratios.
//
// El sitio lee los CSV de data/series/ cuando se construye: las páginas son
// estáticas, no se ejecuta Python y no se descarga nada. Qué commit de losratios
// es el origen de esas copias lo dice datos.lock. Si un archivo falta, está mal
// formado o contradice a serie_D0.csv, cargarDatos() lanza y el build falla. No
// hay respaldo: un hueco es un hueco.
//
// Solo servidor (usa node:fs): los componentes cliente importan solo los tipos.

import { readFileSync } from "node:fs";
import path from "node:path";
import { leerCsv } from "./csv.mjs";
import { mesMenos } from "./formato";

export const DIR_SERIES = path.join(process.cwd(), "data", "series");
export const RUTA_LOCK = path.join(process.cwd(), "datos.lock");

/** Las series con puntos en el cliente. Las demás publicadas viajan solo con su ficha. */
export const SERIES_GRAFICADAS = [
  "m2_eeuu",
  "m2_eurozona",
  "m2_japon",
  "balance_fed",
  "balance_eurosistema",
  "balance_boj",
] as const;

export type Familia = "dinero" | "balance" | "tipo de cambio" | "riqueza";

/** Una fila de serie_D0.csv. Los textos van tal cual: son los que exigen las licencias. */
export interface Ficha {
  serie: string;
  nombre: string;
  familia: Familia;
  publicada: boolean;
  /** "dato", "estimación" o "NO MEDIDO: <motivo>". */
  estado: string;
  unidad: string;
  convencion: string;
  frecuenciaNativa: string;
  ajusteEstacional: string;
  emisor: string;
  fuente: string;
  identificador: string;
  url: string;
  licencia: string;
  atribucion: string;
  validacion: string;
  supuestos: string[];
  /** "2001-01: ampliación de la zona del euro: Grecia", uno por quiebre. */
  quiebres: string[];
  primerMes: string;
  ultimoMes: string;
  meses: number;
}

export interface Punto {
  mes: string;
  valor: number;
  /** "dato" o "estimación" (A-D0-5). */
  estado: string;
  /** Qué cambió ese mes en la serie, o null. */
  quiebre: string | null;
  /** Balances semanales: la fecha del dato del que sale el mes (A-D0-14). */
  fechaOrigen: string | null;
}

export interface SeriePublicada {
  ficha: Ficha;
  /** Vacío si la serie no está en SERIES_GRAFICADAS. */
  puntos: Punto[];
  ultimo: Punto;
  /** Variación contra el mismo mes del año anterior, en %. Cálculo propio; null si no hay dato 12 meses atrás. */
  interanualPct: number | null;
}

export interface PuntoAgregado {
  mes: string;
  eeuu: number;
  eurozona: number;
  japon: number;
  total: number;
  totalTcConstante: number;
}

export interface Agregado {
  puntos: PuntoAgregado[];
  ultimo: PuntoAgregado;
  interanualPct: number | null;
  primerMes: string;
  ultimoMes: string;
  unidad: string;
}

export interface PuntoRatio {
  mes: string;
  valor: number;
  apto: boolean;
  enDisputa: boolean;
  errorRedondeoPct: number;
}

export interface Ratio {
  par: string;
  nombre: string;
  estado: string;
  primerMes: string;
  ultimoMes: string;
  meses: number;
  aptoDesde: string;
  mesesAptos: number;
  mesesEnDisputa: number;
  puntos: PuntoRatio[];
  ultimo: PuntoRatio;
}

export interface Cita {
  clase: string;
  cifra: number;
  unidad: string;
  fechaDelDato: string;
  estado: string;
  fuente: string;
  url: string;
  seccion: string;
  fechaLectura: string;
  supuesto: string;
}

export interface Lock {
  repositorio: string;
  rama: string;
  commit: string;
  fecha_lectura: string;
  destino: string;
  archivos: Record<string, { origen: string; bytes: number; sha256: string }>;
}

export interface Datos {
  lock: Lock;
  fichas: Ficha[];
  /** Las series publicadas, por identificador. */
  series: Record<string, SeriePublicada>;
  agregado: Agregado;
  ratios: Ratio[];
  citas: Cita[];
  /** El último mes con dato entre las series de dinero y balances. */
  ultimoMes: string;
}

type Fila = Record<string, string>;

function leerArchivo(dir: string, nombre: string, columnas: string[]): Fila[] {
  let filas: Fila[];
  try {
    filas = leerCsv(readFileSync(path.join(dir, nombre), "utf8"));
  } catch (error) {
    throw new Error(`No se pudo leer ${nombre}: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (filas.length === 0) throw new Error(`${nombre} no tiene filas`);
  for (const c of columnas) {
    if (!(c in filas[0])) throw new Error(`${nombre} no tiene la columna ${c}`);
  }
  return filas;
}

function numero(texto: string, contexto: string): number {
  const v = Number(texto);
  if (texto.trim() === "" || !Number.isFinite(v)) throw new Error(`${contexto}: "${texto}" no es un número`);
  return v;
}

function entero(texto: string, contexto: string): number {
  const v = numero(texto, contexto);
  if (!Number.isInteger(v)) throw new Error(`${contexto}: "${texto}" no es un entero`);
  return v;
}

function siNo(texto: string, contexto: string): boolean {
  if (texto === "sí") return true;
  if (texto === "no") return false;
  throw new Error(`${contexto}: "${texto}" no es sí ni no`);
}

function lista(texto: string, separador: RegExp): string[] {
  return texto
    .split(separador)
    .map((s) => s.trim())
    .filter(Boolean);
}

function familia(texto: string, contexto: string): Familia {
  if (texto === "dinero" || texto === "balance" || texto === "tipo de cambio" || texto === "riqueza") return texto;
  throw new Error(`${contexto}: familia desconocida "${texto}"`);
}

function leerFichas(dir: string): Ficha[] {
  const filas = leerArchivo(dir, "serie_D0.csv", [
    "serie", "nombre", "familia", "publicada", "estado", "unidad", "convencion", "frecuencia_nativa",
    "ajuste_estacional", "emisor", "fuente", "identificador", "url", "licencia", "atribucion", "validacion",
    "supuestos", "quiebres", "primer_mes", "ultimo_mes", "meses",
  ]);
  const vistas = new Set<string>();
  return filas.map((f) => {
    const contexto = `serie_D0.csv, ${f.serie}`;
    if (vistas.has(f.serie)) throw new Error(`${contexto}: repetida`);
    vistas.add(f.serie);
    const publicada = siNo(f.publicada, `${contexto}, publicada`);
    if (publicada && f.estado !== "dato" && f.estado !== "estimación") {
      throw new Error(`${contexto}: publicada con estado "${f.estado}"`);
    }
    if (!publicada && !f.estado.startsWith("NO MEDIDO")) {
      throw new Error(`${contexto}: no publicada pero su estado no dice NO MEDIDO`);
    }
    return {
      serie: f.serie,
      nombre: f.nombre,
      familia: familia(f.familia, contexto),
      publicada,
      estado: f.estado,
      unidad: f.unidad,
      convencion: f.convencion,
      frecuenciaNativa: f.frecuencia_nativa,
      ajusteEstacional: f.ajuste_estacional,
      emisor: f.emisor,
      fuente: f.fuente,
      identificador: f.identificador,
      url: f.url,
      licencia: f.licencia,
      atribucion: f.atribucion,
      validacion: f.validacion,
      supuestos: lista(f.supuestos, /\s+/),
      quiebres: lista(f.quiebres, /;\s*/),
      primerMes: f.primer_mes,
      ultimoMes: f.ultimo_mes,
      meses: publicada ? entero(f.meses, `${contexto}, meses`) : 0,
    };
  });
}

function validarPuntos(ficha: Ficha, puntos: { mes: string }[]): void {
  const contexto = `${ficha.serie}`;
  if (puntos.length !== ficha.meses) {
    throw new Error(`${contexto}: ${puntos.length} meses publicados, la ficha dice ${ficha.meses}`);
  }
  if (puntos[0].mes !== ficha.primerMes || puntos[puntos.length - 1].mes !== ficha.ultimoMes) {
    throw new Error(`${contexto}: va de ${puntos[0].mes} a ${puntos[puntos.length - 1].mes}, la ficha dice ${ficha.primerMes} a ${ficha.ultimoMes}`);
  }
  for (let i = 1; i < puntos.length; i++) {
    if (!(puntos[i - 1].mes < puntos[i].mes)) throw new Error(`${contexto}: ${puntos[i - 1].mes} y ${puntos[i].mes} fuera de orden o repetidos`);
  }
}

/** Cálculo propio: valor del último mes contra el del mismo mes del año anterior. */
function interanual(puntos: { mes: string; valor: number }[]): number | null {
  if (puntos.length < 13) return null;
  const ultimo = puntos[puntos.length - 1];
  const buscado = mesMenos(ultimo.mes, 12);
  const anterior = puntos.find((p) => p.mes === buscado);
  if (!anterior || anterior.valor === 0) return null;
  return (ultimo.valor / anterior.valor - 1) * 100;
}

export function cargarDatos(dir: string = DIR_SERIES, rutaLock: string = RUTA_LOCK): Datos {
  const lock = JSON.parse(readFileSync(rutaLock, "utf8")) as Lock;
  if (!/^[0-9a-f]{40}$/.test(lock.commit)) throw new Error("datos.lock: el commit no es un hash completo");

  const fichas = leerFichas(dir);

  const porSerie = new Map<string, Punto[]>();
  const agregar = (serie: string, punto: Punto) => {
    const lista = porSerie.get(serie) ?? [];
    lista.push(punto);
    porSerie.set(serie, lista);
  };
  for (const f of leerArchivo(dir, "denominador_dinero.csv", ["mes", "serie", "valor", "estado", "quiebre"])) {
    agregar(f.serie, {
      mes: f.mes,
      valor: numero(f.valor, `denominador_dinero.csv, ${f.serie} ${f.mes}`),
      estado: f.estado,
      quiebre: f.quiebre || null,
      fechaOrigen: null,
    });
  }
  for (const f of leerArchivo(dir, "denominador_balances.csv", ["mes", "serie", "valor", "fecha_origen", "estado", "quiebre"])) {
    agregar(f.serie, {
      mes: f.mes,
      valor: numero(f.valor, `denominador_balances.csv, ${f.serie} ${f.mes}`),
      estado: f.estado,
      quiebre: f.quiebre || null,
      fechaOrigen: f.fecha_origen || null,
    });
  }
  for (const f of leerArchivo(dir, "denominador_tipos_de_cambio.csv", ["mes", "par", "promedio_mensual", "fin_de_mes", "fecha_fin_de_mes", "contraste"])) {
    agregar(f.par, {
      mes: f.mes,
      valor: numero(f.promedio_mensual, `denominador_tipos_de_cambio.csv, ${f.par} ${f.mes}`),
      estado: f.contraste === "valor en disputa" ? "valor en disputa" : "dato",
      quiebre: null,
      fechaOrigen: f.fecha_fin_de_mes || null,
    });
  }

  const series: Record<string, SeriePublicada> = {};
  const graficadas = new Set<string>(SERIES_GRAFICADAS);
  for (const ficha of fichas) {
    const puntos = porSerie.get(ficha.serie) ?? [];
    if (!ficha.publicada) {
      if (puntos.length) throw new Error(`${ficha.serie} está NO MEDIDO en serie_D0.csv pero tiene ${puntos.length} filas publicadas`);
      continue;
    }
    if (ficha.familia === "riqueza") throw new Error(`${ficha.serie}: la familia riqueza no tiene archivo de datos en este sitio`);
    validarPuntos(ficha, puntos);
    series[ficha.serie] = {
      ficha,
      puntos: graficadas.has(ficha.serie) ? puntos : [],
      ultimo: puntos[puntos.length - 1],
      interanualPct: interanual(puntos),
    };
  }
  for (const serie of SERIES_GRAFICADAS) {
    if (!series[serie]) throw new Error(`${serie} no está publicada y el sitio la grafica`);
  }
  for (const serie of porSerie.keys()) {
    if (!fichas.some((f) => f.serie === serie)) throw new Error(`${serie} tiene filas publicadas pero no tiene ficha en serie_D0.csv`);
  }

  const filasAgregado = leerArchivo(dir, "denominador_agregado.csv", [
    "mes", "m2_eeuu_usd", "m2_eurozona_usd", "m2_japon_usd", "agregado_usd", "agregado_usd_tc_constante", "estado",
  ]);
  const puntosAgregado: PuntoAgregado[] = filasAgregado.map((f) => {
    const c = `denominador_agregado.csv, ${f.mes}`;
    if (f.estado !== "dato") throw new Error(`${c}: estado "${f.estado}"`);
    return {
      mes: f.mes,
      eeuu: numero(f.m2_eeuu_usd, c),
      eurozona: numero(f.m2_eurozona_usd, c),
      japon: numero(f.m2_japon_usd, c),
      total: numero(f.agregado_usd, c),
      totalTcConstante: numero(f.agregado_usd_tc_constante, c),
    };
  });
  for (let i = 1; i < puntosAgregado.length; i++) {
    if (puntosAgregado[i].mes !== mesMenos(puntosAgregado[i - 1].mes, -1)) {
      throw new Error(`denominador_agregado.csv: hueco entre ${puntosAgregado[i - 1].mes} y ${puntosAgregado[i].mes}`);
    }
  }
  const agregado: Agregado = {
    puntos: puntosAgregado,
    ultimo: puntosAgregado[puntosAgregado.length - 1],
    interanualPct: interanual(puntosAgregado.map((p) => ({ mes: p.mes, valor: p.total }))),
    primerMes: puntosAgregado[0].mes,
    ultimoMes: puntosAgregado[puntosAgregado.length - 1].mes,
    unidad: "miles de millones de USD",
  };

  const filasRatios = leerArchivo(dir, "denominador_ratios.csv", [
    "mes", "par", "valor", "error_redondeo_pct", "valor_en_disputa", "apto_metricas", "estado",
  ]);
  const ratios: Ratio[] = leerArchivo(dir, "denominador_pares.csv", [
    "par", "nombre", "publicado", "estado", "primer_mes", "ultimo_mes", "meses", "apto_desde", "meses_aptos", "meses_en_disputa",
  ])
    .filter((p) => siNo(p.publicado, `denominador_pares.csv, ${p.par}`))
    .map((p) => {
      const c = `denominador_pares.csv, ${p.par}`;
      const puntos: PuntoRatio[] = filasRatios
        .filter((r) => r.par === p.par)
        .map((r) => ({
          mes: r.mes,
          valor: numero(r.valor, `denominador_ratios.csv, ${r.par} ${r.mes}`),
          apto: siNo(r.apto_metricas, `denominador_ratios.csv, ${r.par} ${r.mes}, apto_metricas`),
          enDisputa: r.valor_en_disputa !== "",
          errorRedondeoPct: numero(r.error_redondeo_pct, `denominador_ratios.csv, ${r.par} ${r.mes}, error`),
        }));
      const meses = entero(p.meses, c);
      if (puntos.length !== meses) throw new Error(`${c}: ${puntos.length} filas en denominador_ratios.csv, pares dice ${meses}`);
      if (puntos[0].mes !== p.primer_mes || puntos[puntos.length - 1].mes !== p.ultimo_mes) {
        throw new Error(`${c}: el rango de denominador_ratios.csv no coincide con el de pares`);
      }
      return {
        par: p.par,
        nombre: p.nombre,
        estado: p.estado,
        primerMes: p.primer_mes,
        ultimoMes: p.ultimo_mes,
        meses,
        aptoDesde: p.apto_desde,
        mesesAptos: entero(p.meses_aptos, c),
        mesesEnDisputa: entero(p.meses_en_disputa, c),
        puntos,
        ultimo: puntos[puntos.length - 1],
      };
    });

  const citas: Cita[] = leerArchivo(dir, "citas_terceros.csv", [
    "clase", "cifra", "unidad", "fecha_del_dato", "estado", "fuente", "url", "seccion", "fecha_lectura", "supuesto",
  ]).map((f) => ({
    clase: f.clase,
    cifra: numero(f.cifra, `citas_terceros.csv, ${f.clase}`),
    unidad: f.unidad,
    fechaDelDato: f.fecha_del_dato,
    estado: f.estado,
    fuente: f.fuente,
    url: f.url,
    seccion: f.seccion,
    fechaLectura: f.fecha_lectura,
    supuesto: f.supuesto,
  }));

  const ultimoMes = Object.values(series)
    .filter((s) => s.ficha.familia === "dinero" || s.ficha.familia === "balance")
    .map((s) => s.ficha.ultimoMes)
    .sort()
    .at(-1);
  if (!ultimoMes) throw new Error("No hay series de dinero ni de balances publicadas");

  return { lock, fichas, series, agregado, ratios, citas, ultimoMes };
}
