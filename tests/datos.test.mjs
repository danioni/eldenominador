// Lo que data/series/ tiene que cumplir para que el sitio lo lea. Sin red: solo
// los archivos del repositorio.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ARCHIVOS, DESTINO, leerLock, verificar } from "../scripts/datos.mjs";
import { leerCsv } from "../src/lib/csv.mjs";

const lock = leerLock();
const csv = (nombre) => leerCsv(readFileSync(join(DESTINO, nombre), "utf8"));

test("data/series/ coincide byte a byte con datos.lock", () => {
  assert.deepEqual(verificar(), []);
});

test("datos.lock apunta a un commit de main de danioni/losratios y lista los archivos esperados", () => {
  assert.equal(lock.repositorio, "danioni/losratios");
  assert.equal(lock.rama, "main");
  assert.match(lock.commit, /^[0-9a-f]{40}$/);
  assert.match(lock.fecha_lectura, /^\d{4}-\d{2}-\d{2}$/);
  assert.deepEqual(Object.keys(lock.archivos), ARCHIVOS);
  for (const [nombre, a] of Object.entries(lock.archivos)) {
    assert.equal(a.origen, `senales/data/series/${nombre}`);
    assert.match(a.sha256, /^[0-9a-f]{64}$/);
    assert.ok(a.bytes > 0);
  }
});

const fichas = csv("serie_D0.csv");
const dinero = csv("denominador_dinero.csv");
const balances = csv("denominador_balances.csv");
const tiposDeCambio = csv("denominador_tipos_de_cambio.csv");

function filasDe(ficha) {
  if (ficha.familia === "dinero") return dinero.filter((f) => f.serie === ficha.serie);
  if (ficha.familia === "balance") return balances.filter((f) => f.serie === ficha.serie);
  if (ficha.familia === "tipo de cambio") return tiposDeCambio.filter((f) => f.par === ficha.serie);
  return [];
}

test("serie_D0.csv: publicada es sí o no, y el estado acompaña", () => {
  for (const f of fichas) {
    assert.ok(f.publicada === "sí" || f.publicada === "no", `${f.serie}: publicada="${f.publicada}"`);
    if (f.publicada === "sí") {
      assert.ok(f.estado === "dato" || f.estado === "estimación", `${f.serie}: estado "${f.estado}"`);
    } else {
      assert.match(f.estado, /^NO MEDIDO/, `${f.serie}: una serie no publicada dice NO MEDIDO y por qué`);
      assert.equal(filasDe(f).length, 0, `${f.serie} está NO MEDIDO pero tiene filas publicadas`);
    }
  }
});

test("cada serie publicada tiene exactamente los meses que declara su ficha, ordenados y sin repetir", () => {
  for (const f of fichas.filter((x) => x.publicada === "sí")) {
    const filas = filasDe(f);
    assert.equal(filas.length, Number(f.meses), `${f.serie}: ${filas.length} filas, la ficha dice ${f.meses}`);
    assert.equal(filas[0].mes, f.primer_mes, `${f.serie}: primer mes`);
    assert.equal(filas[filas.length - 1].mes, f.ultimo_mes, `${f.serie}: último mes`);
    for (let i = 1; i < filas.length; i++) {
      assert.ok(filas[i - 1].mes < filas[i].mes, `${f.serie}: ${filas[i - 1].mes} antes de ${filas[i].mes}`);
    }
  }
});

test("los valores publicados son números", () => {
  for (const f of dinero) assert.ok(Number.isFinite(Number(f.valor)) && f.valor !== "", `dinero ${f.serie} ${f.mes}`);
  for (const f of balances) assert.ok(Number.isFinite(Number(f.valor)) && f.valor !== "", `balance ${f.serie} ${f.mes}`);
  for (const f of tiposDeCambio) {
    assert.ok(Number.isFinite(Number(f.promedio_mensual)) && f.promedio_mensual !== "", `tc ${f.par} ${f.mes}`);
  }
});

test("las series que el sitio no muestra como dato están NO MEDIDO en esta entrega", () => {
  const estados = Object.fromEntries(fichas.map((f) => [f.serie, f.publicada]));
  for (const serie of [
    "dinero_amplio_china",
    "balance_pboc",
    "dinero_eeuu_1892_1946",
    "dinero_eeuu_1947_1958",
    "riqueza_total",
    "riqueza_bonos",
    "riqueza_acciones",
    "riqueza_btc",
    "riqueza_inmuebles",
    "riqueza_oro_cantidad",
  ]) {
    assert.equal(estados[serie], "no", `${serie} debería figurar en serie_D0.csv como no publicada`);
  }
});

test("el agregado en USD es la suma de sus tres componentes y no tiene huecos", () => {
  const agregado = csv("denominador_agregado.csv");
  assert.ok(agregado.length > 0);
  for (const f of agregado) {
    const suma = Number(f.m2_eeuu_usd) + Number(f.m2_eurozona_usd) + Number(f.m2_japon_usd);
    assert.ok(Math.abs(suma - Number(f.agregado_usd)) < 1e-4, `${f.mes}: ${suma} ≠ ${f.agregado_usd}`);
    assert.ok(Number.isFinite(Number(f.agregado_usd_tc_constante)), `${f.mes}: tc constante`);
    assert.equal(f.estado, "dato");
  }
  for (let i = 1; i < agregado.length; i++) {
    const [a, m] = agregado[i - 1].mes.split("-").map(Number);
    const siguiente = m === 12 ? `${a + 1}-01` : `${a}-${String(m + 1).padStart(2, "0")}`;
    assert.equal(agregado[i].mes, siguiente, `hueco entre ${agregado[i - 1].mes} y ${agregado[i].mes}`);
  }
});

test("denominador_pares.csv y denominador_ratios.csv cuentan lo mismo", () => {
  const pares = csv("denominador_pares.csv");
  const ratios = csv("denominador_ratios.csv");
  assert.ok(pares.length > 0);
  for (const p of pares) {
    const filas = ratios.filter((r) => r.par === p.par);
    if (p.publicado !== "sí") {
      assert.equal(filas.length, 0, `${p.par} no publicado con filas`);
      continue;
    }
    assert.equal(filas.length, Number(p.meses), `${p.par}: meses`);
    assert.equal(filas.filter((r) => r.apto_metricas === "sí").length, Number(p.meses_aptos), `${p.par}: aptos`);
    assert.equal(filas.filter((r) => r.valor_en_disputa !== "").length, Number(p.meses_en_disputa), `${p.par}: disputa`);
    assert.equal(filas[0].mes, p.primer_mes);
    assert.equal(filas[filas.length - 1].mes, p.ultimo_mes);
  }
});

test("las citas de terceros traen cifra, fecha, fuente, URL y el supuesto que las rige", () => {
  for (const c of csv("citas_terceros.csv")) {
    assert.ok(Number.isFinite(Number(c.cifra)) && c.cifra !== "", c.clase);
    assert.match(c.fecha_del_dato, /^\d{4}-\d{2}$/);
    assert.equal(c.estado, "estimación de terceros");
    assert.ok(c.fuente && c.url.startsWith("https://"), c.clase);
    assert.match(c.supuesto, /^A-/);
  }
});
