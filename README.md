# ÷ El Denominador

**Observatorio del denominador: el dinero con el que se mide todo lo demás.**

> Cada precio es una fracción. El numerador es el activo. El denominador es la
> cantidad de unidades monetarias en circulación. Cuando el denominador crece,
> el número sube, pero lo que cambió fue el tamaño de la unidad.

## Qué muestra

Series publicadas por sus emisores, cada una en su moneda, su unidad y su
convención nativas, desde donde empieza su fuente oficial, sin empalmes y sin
interpolar:

- **Dinero**: M2 de EE.UU. (Junta de la Reserva Federal, H.6), M2 de la Eurozona
  (BCE, conjunto BSI) y M2 de Japón (Banco de Japón). El dinero amplio de China
  figura como NO MEDIDO hasta tener una tercera lectura de validación.
- **Balances de bancos centrales**: Reserva Federal (H.4.1), Eurosistema (BCE,
  conjunto ILM) y Banco de Japón. El del Banco Popular de China figura como NO
  MEDIDO: sin validación externa.
- **M2 de tres economías**: la suma en USD de EE.UU., la Eurozona y Japón, a
  tipo de cambio de cada mes y a tipo de cambio constante. Es un cálculo
  derivado y se rotula así.
- **Activos medidos en M2 de EE.UU.**: Oro / M2 y BTC / M2, tal como los publica
  losratios, con los meses no aptos para métricas marcados.
- **Lo que no se mide todavía**, con su motivo: la oferta monetaria de EE.UU.
  antes de 1959 y la riqueza por clase de activo.
- **La ficha de cada serie**: emisor, fuente, identificador, unidad, convención,
  validación, licencia, atribución, supuestos y quiebres.

El sitio describe, no recomienda. Ningún número sin fuente: lo que no se pudo
medir se dice como tal.

## De dónde salen los datos

Este repositorio no descarga nada de ninguna fuente. Las series son copias de
`senales/data/series/` de [danioni/losratios](https://github.com/danioni/losratios),
la fábrica de series del ecosistema, fijadas a un commit de su rama `main` en
[`datos.lock`](datos.lock). Ahí están los crudos, los gates de validación, los
supuestos numerados (`A-D0-*`) y el changelog.

- `datos.lock` guarda el repositorio, la rama, el commit, la fecha de lectura y
  el SHA-256 de cada archivo copiado a `data/series/`.
- `npm run build` verifica primero que `data/series/` coincida byte a byte con
  el lock; si un archivo no coincide, falta o sobra, el build se detiene.
- Para traer una corrida nueva, desde un clon local de losratios ya actualizado
  (`git fetch`):

  ```bash
  npm run datos:sincronizar -- --clon ..\losratios --commit origin/main
  ```

  El commit tiene que estar en `origin/main` del clon. La copia se hace con git,
  sin red. Después, `npm test` y `npm run build`.

El lector del sitio (`src/lib/series.ts`) valida cada archivo contra la ficha de
`serie_D0.csv` cuando se construye la página: si una serie NO MEDIDO trae filas,
si faltan meses o si una fila no es un número, el build falla. Los valores se
publican sin cambios; las únicas cifras calculadas aquí son las variaciones
interanuales, rotuladas como cálculo propio.

## Stack

- [Next.js](https://nextjs.org/), App Router, páginas estáticas
- [Recharts](https://recharts.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- TypeScript

## Comandos

```bash
npm install
npm run dev            # servidor local
npm test               # tests sin red: lector de CSV, lock e invariantes de los datos
npm run lint
npm run build          # verifica datos.lock y construye
npm run datos:verificar
```

## Despliegue

Optimizado para Vercel. El build de Vercel corre `npm run build`, con la
verificación del lock incluida.

## Licencia

MIT para el código. Cada serie tiene su propia licencia y atribución, en su
ficha y en el pie del sitio.

---

*Los precios no suben. La unidad se achica.*
