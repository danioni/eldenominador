/**
 * Lee un CSV como el que escribe `csv.writer` de Python (RFC 4180): un campo
 * va entre comillas cuando contiene comas, comillas o saltos de línea, y una
 * comilla dentro de él se escribe doble. Acepta saltos de línea LF o CRLF y un
 * BOM inicial.
 *
 * Devuelve una fila por registro, como objeto {columna: valor}. Los valores
 * quedan como texto: quien lee decide qué columna es un número.
 *
 * @param {string} texto
 * @returns {Record<string, string>[]}
 */
export function leerCsv(texto) {
  const filas = separarFilas(texto.charCodeAt(0) === 0xfeff ? texto.slice(1) : texto);
  if (filas.length === 0) return [];
  const [columnas, ...registros] = filas;
  return registros.map((campos, i) => {
    if (campos.length !== columnas.length) {
      throw new Error(`Fila ${i + 2}: ${campos.length} campos, el encabezado tiene ${columnas.length}`);
    }
    /** @type {Record<string, string>} */
    const fila = {};
    columnas.forEach((c, j) => {
      fila[c] = campos[j];
    });
    return fila;
  });
}

/**
 * @param {string} texto
 * @returns {string[][]}
 */
function separarFilas(texto) {
  /** @type {string[][]} */
  const filas = [];
  /** @type {string[]} */
  let campos = [];
  let campo = "";
  let entreComillas = false;
  let i = 0;
  while (i < texto.length) {
    const c = texto[i];
    if (entreComillas) {
      if (c === '"') {
        if (texto[i + 1] === '"') {
          campo += '"';
          i += 2;
          continue;
        }
        entreComillas = false;
        i++;
        continue;
      }
      campo += c;
      i++;
      continue;
    }
    if (c === '"') {
      entreComillas = true;
    } else if (c === ",") {
      campos.push(campo);
      campo = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && texto[i + 1] === "\n") i++;
      campos.push(campo);
      filas.push(campos);
      campos = [];
      campo = "";
    } else {
      campo += c;
    }
    i++;
  }
  if (entreComillas) throw new Error("El CSV termina dentro de un campo entre comillas");
  if (campo !== "" || campos.length > 0) {
    campos.push(campo);
    filas.push(campos);
  }
  return filas;
}
