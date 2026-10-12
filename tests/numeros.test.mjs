// El formato numérico del sitio: español neutro, coma decimal y punto de miles,
// igual en tarjetas, ejes, tooltips y tablas. Sin red.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  aBillones,
  decimalesPara,
  formatearBillones,
  formatearEje,
  formatearNumero,
  formatearNumeroHasta,
  formatearPct,
  valorConUnidad,
} from "../src/lib/numeros.mjs";

test("coma decimal y punto de miles, con decimales fijos", () => {
  assert.equal(formatearNumero(23342.8, 1), "23.342,8");
  assert.equal(formatearNumero(50545.025768, 0), "50.545");
  assert.equal(formatearNumero(1234567.891, 2), "1.234.567,89");
  assert.equal(formatearNumero(0.5, 2), "0,50");
  assert.equal(formatearNumero(-1234.5, 1), "-1.234,5");
  assert.equal(formatearNumero(999, 0), "999");
});

test("sin ceros de relleno cuando se pide un máximo de decimales", () => {
  assert.equal(formatearNumeroHasta(2.5, 2), "2,5");
  assert.equal(formatearNumeroHasta(10, 2), "10");
  assert.equal(formatearNumeroHasta(1296.389, 1), "1.296,4");
});

test("las marcas de los ejes llevan el número completo", () => {
  assert.equal(formatearEje(0), "0");
  assert.equal(formatearEje(23284), "23.284");
  assert.equal(formatearEje(1000), "1.000");
  assert.equal(formatearEje(250), "250");
  assert.equal(formatearEje(12.5), "12,5");
  assert.equal(formatearEje(2.5), "2,5");
  assert.equal(formatearEje(0.25), "0,25");
  assert.equal(formatearEje(12_500_000), "12,5 M");
});

test("porcentajes con signo tipográfico y espacio antes del %", () => {
  assert.equal(formatearPct(3.25), "+3,3 %");
  assert.equal(formatearPct(-1.4), "−1,4 %");
  assert.equal(formatearPct(0), "0,0 %");
  assert.equal(formatearPct(12.345, 2), "+12,35 %");
});

test("los decimales dependen del tamaño del valor", () => {
  assert.equal(decimalesPara(123456), 0);
  assert.equal(decimalesPara(23342.8), 1);
  assert.equal(decimalesPara(188.97), 2);
  assert.equal(decimalesPara(1.1591), 4);
});

test("la conversión a billones es un cambio de unidad en la misma moneda", () => {
  assert.deepEqual(aBillones(23342.8, "miles de millones de USD"), {
    valor: 23.3428,
    moneda: "USD",
    unidad: "billones de USD",
    unidadLarga: "billones (10¹²) de USD",
  });
  assert.equal(aBillones(6743031, "millones de USD")?.valor, 6.743031);
  assert.equal(aBillones(16447405, "millones de EUR")?.valor, 16.447405);
  assert.equal(aBillones(12963895, "100 millones de JPY")?.valor, 1296.3895);
  assert.equal(aBillones(12963895, "100 millones de JPY")?.moneda, "JPY");
  assert.equal(aBillones(188.97, "USD por onza troy, por billón de USD de M2"), null);
});

test("billones y unidad nativa, formateados", () => {
  assert.equal(formatearBillones(50545.025768, "miles de millones de USD"), "50,55 billones de USD");
  assert.equal(formatearBillones(23342.8, "miles de millones de USD"), "23,34 billones de USD");
  assert.equal(formatearBillones(6743031, "millones de USD"), "6,74 billones de USD");
  assert.equal(formatearBillones(188.97, "USD por onza troy"), null);
  assert.equal(valorConUnidad(23342.8, "miles de millones de USD"), "23.342,8 miles de millones de USD");
  assert.equal(valorConUnidad(6743031, "millones de USD"), "6.743.031 millones de USD");
});
