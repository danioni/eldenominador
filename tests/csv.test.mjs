import { test } from "node:test";
import assert from "node:assert/strict";
import { leerCsv } from "../src/lib/csv.mjs";

test("campos entre comillas con comas y comillas dobles", () => {
  const filas = leerCsv('a,b,c\n1,"x, y","dice ""hola"""\n');
  assert.deepEqual(filas, [{ a: "1", b: "x, y", c: 'dice "hola"' }]);
});

test("acepta CRLF, BOM y archivo sin salto final", () => {
  const filas = leerCsv("﻿mes,valor\r\n2026-08,1.5\r\n2026-09,2");
  assert.deepEqual(filas, [
    { mes: "2026-08", valor: "1.5" },
    { mes: "2026-09", valor: "2" },
  ]);
});

test("conserva los campos vacíos y el texto UTF-8", () => {
  const filas = leerCsv("serie,publicada,quiebre\nm2,sí,\n");
  assert.deepEqual(filas, [{ serie: "m2", publicada: "sí", quiebre: "" }]);
});

test("un salto de línea dentro de comillas es parte del campo", () => {
  const filas = leerCsv('a,b\n"línea 1\nlínea 2",z\n');
  assert.deepEqual(filas, [{ a: "línea 1\nlínea 2", b: "z" }]);
});

test("una fila con otro número de campos detiene la lectura", () => {
  assert.throws(() => leerCsv("a,b\n1,2,3\n"), /Fila 2: 3 campos, el encabezado tiene 2/);
});

test("un campo entre comillas sin cerrar detiene la lectura", () => {
  assert.throws(() => leerCsv('a,b\n"abierto,2\n'), /termina dentro de un campo/);
});

test("sin filas devuelve una lista vacía", () => {
  assert.deepEqual(leerCsv(""), []);
  assert.deepEqual(leerCsv("a,b\n"), []);
});
