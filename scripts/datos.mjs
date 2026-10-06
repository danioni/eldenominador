#!/usr/bin/env node
// scripts/datos.mjs: copia y verifica las series que el sitio lee de danioni/losratios.
//
// El sitio no descarga nada de ninguna fuente. Lee copias de los CSV que publica
// la fábrica de series de losratios (senales/data/series/), fijadas a un commit
// de su rama main en datos.lock. La copia se hace con git desde un clon local;
// este script no hace ningún pedido de red.
//
//   node scripts/datos.mjs sincronizar --clon ..\losratios [--commit origin/main] [--fecha AAAA-MM-DD]
//   node scripts/datos.mjs verificar
//
// `verificar` corre antes de cada build: si un archivo de data/series/ no
// coincide con el SHA-256 del lock, o sobra, o falta, el build se detiene.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const RUTA_LOCK = join(RAIZ, "datos.lock");
export const DESTINO = join(RAIZ, "data", "series");
export const REPOSITORIO = "danioni/losratios";
export const RAMA = "main";
export const ORIGEN = "senales/data/series";

/** Los archivos que el sitio lee, en el orden en que se listan en el lock. */
export const ARCHIVOS = [
  "serie_D0.csv",
  "denominador_dinero.csv",
  "denominador_balances.csv",
  "denominador_tipos_de_cambio.csv",
  "denominador_agregado.csv",
  "denominador_ratios.csv",
  "denominador_pares.csv",
  "denominador_descargas.csv",
  "citas_terceros.csv",
];

/** @param {Buffer | string} contenido */
export function sha256(contenido) {
  return createHash("sha256").update(contenido).digest("hex");
}

/**
 * @param {string} clon ruta del clon local de losratios
 * @param {string[]} args
 */
function git(clon, args) {
  return execFileSync("git", ["-C", clon, ...args], {
    maxBuffer: 256 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function hoy() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/**
 * Copia los archivos de ARCHIVOS desde el commit indicado del clon y reescribe
 * datos.lock. El commit tiene que estar en origin/main del clon: el sitio solo
 * lee lo que losratios ya integró.
 * @param {{ clon?: string, commit?: string, fecha?: string }} opciones
 */
export function sincronizar({ clon, commit = `origin/${RAMA}`, fecha = hoy() }) {
  if (!clon) throw new Error("Falta --clon <ruta del clon local de losratios>");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw new Error(`Fecha inválida: ${fecha} (se espera AAAA-MM-DD)`);

  const hash = git(clon, ["rev-parse", "--verify", `${commit}^{commit}`]).toString("utf8").trim();
  try {
    git(clon, ["merge-base", "--is-ancestor", hash, `origin/${RAMA}`]);
  } catch {
    throw new Error(
      `El commit ${hash} no está en origin/${RAMA} del clon ${clon}. Haz "git fetch" ahí o elige otro commit.`,
    );
  }

  mkdirSync(DESTINO, { recursive: true });
  /** @type {Record<string, { origen: string, bytes: number, sha256: string }>} */
  const archivos = {};
  for (const nombre of ARCHIVOS) {
    const origen = `${ORIGEN}/${nombre}`;
    let contenido;
    try {
      contenido = git(clon, ["show", `${hash}:${origen}`]);
    } catch {
      throw new Error(`${origen} no existe en el commit ${hash}`);
    }
    writeFileSync(join(DESTINO, nombre), contenido);
    archivos[nombre] = { origen, bytes: contenido.length, sha256: sha256(contenido) };
  }

  const lock = {
    repositorio: REPOSITORIO,
    rama: RAMA,
    commit: hash,
    fecha_lectura: fecha,
    destino: "data/series",
    archivos,
  };
  writeFileSync(RUTA_LOCK, JSON.stringify(lock, null, 2) + "\n");
  return lock;
}

/** @param {string} [ruta] */
export function leerLock(ruta = RUTA_LOCK) {
  return JSON.parse(readFileSync(ruta, "utf8"));
}

/**
 * Compara data/series/ con el lock. Devuelve la lista de problemas; vacía si
 * todo coincide.
 * @param {{ lock?: ReturnType<typeof leerLock>, destino?: string }} [opciones]
 * @returns {string[]}
 */
export function verificar({ lock = leerLock(), destino = DESTINO } = {}) {
  const problemas = [];
  for (const [nombre, esperado] of Object.entries(lock.archivos)) {
    const ruta = join(destino, nombre);
    if (!existsSync(ruta)) {
      problemas.push(`falta ${nombre}`);
      continue;
    }
    const contenido = readFileSync(ruta);
    const hash = sha256(contenido);
    if (hash !== esperado.sha256) {
      problemas.push(`${nombre}: SHA-256 ${hash} no coincide con ${esperado.sha256} del lock`);
    } else if (contenido.length !== esperado.bytes) {
      problemas.push(`${nombre}: ${contenido.length} bytes, el lock dice ${esperado.bytes}`);
    }
  }
  if (existsSync(destino)) {
    for (const nombre of readdirSync(destino)) {
      if (!(nombre in lock.archivos)) problemas.push(`${nombre} está en ${lock.destino}/ pero no en datos.lock`);
    }
  }
  return problemas;
}

/** @param {string[]} argv */
function argumentos(argv) {
  /** @type {Record<string, string>} */
  const opciones = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      opciones[a.slice(2)] = argv[i + 1] ?? "";
      i++;
    }
  }
  return opciones;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [orden, ...resto] = process.argv.slice(2);
  const opciones = argumentos(resto);
  try {
    if (orden === "sincronizar") {
      const lock = sincronizar({ clon: opciones.clon, commit: opciones.commit, fecha: opciones.fecha });
      console.log(
        `datos.lock: ${lock.repositorio} @ ${lock.commit.slice(0, 7)} (${lock.fecha_lectura}), ` +
          `${Object.keys(lock.archivos).length} archivos en ${lock.destino}/`,
      );
    } else if (orden === "verificar") {
      const problemas = verificar();
      if (problemas.length) {
        console.error("data/series/ no coincide con datos.lock:");
        for (const p of problemas) console.error(`  - ${p}`);
        process.exit(1);
      }
      const lock = leerLock();
      console.log(
        `data/series/ coincide con datos.lock (${lock.repositorio} @ ${lock.commit.slice(0, 7)}, ${lock.fecha_lectura}).`,
      );
    } else {
      console.error(
        "Uso: node scripts/datos.mjs sincronizar --clon <ruta> [--commit <ref>] [--fecha AAAA-MM-DD] | verificar",
      );
      process.exit(2);
    }
  } catch (e) {
    console.error(e instanceof Error ? e.message : String(e));
    process.exit(1);
  }
}
