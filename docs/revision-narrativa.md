# Revisión narrativa

Textos del sitio que afirman algo que no sale de una serie, y qué se hizo con
cada uno. El criterio es el de `docs/revision-narrativa.md` de
`danioni/losratios`: cada texto se clasifica como **dato** (con su fuente) o
como **tesis del autor** (dicha como tal), y donde el sitio describe lo que
mide no va ninguna tesis.

Las cifras que el sitio muestra salen de los CSV de `data/series/`, copiados
de losratios y fijados en `datos.lock`. Al armar esta lista no se encontró
ninguna cifra escrita a mano en el texto visible.

## 1. Resuelto en el PR #4 (rama `claude/d0-sitio`, 2026-10-07)

| Texto | Dónde estaba | Qué se hizo |
| --- | --- | --- |
| "Observatorio de Liquidez Global" | Título de `src/app/layout.tsx`; subtítulo del encabezado (`src/components/Header.tsx`); `alt` y subtítulo de la imagen para redes (`src/app/opengraph-image.tsx`, `src/app/twitter-image.tsx`); palabra clave "liquidez global" en `layout.tsx` | Pasa a "Observatorio de Liquidez". El sitio mide tres economías y tres bancos centrales, no el mundo: "global" era una afirmación sin serie detrás. La palabra clave se quita. |
| "Los precios no suben. El dinero se encoge." (portada); "Los precios no suben: la unidad se achica." (descripción); "Los precios no suben. La unidad se achica." (imagen para redes) | Titular de la portada (`src/components/Dashboard.tsx`); `description` de `src/app/layout.tsx`; línea final de `src/app/opengraph-image.tsx` | En la portada se queda, con la línea "Tesis" encima: es la tesis del autor, dicha como tal. En la descripción y en la imagen para redes se retira, y ahí el sitio dice solo lo que mide: M2, balances de bancos centrales, oro y BTC medidos en M2. |

## 2. Pendiente de clasificar

Textos que siguen en el sitio y que no son una cifra con fuente. No se tocan
hasta decidir si son tesis dicha como tal o si se retiran.

| Dónde | Texto | Qué tiene |
| --- | --- | --- |
| `src/components/Dashboard.tsx`, portada | "Todo precio es una fracción: arriba, lo que se compra; abajo, la moneda con que se mide." | Marco del sitio. Acompaña a la tesis. |
| `src/components/Dashboard.tsx`, "¿Qué es el denominador?" | "Cuando se dice que «el pan subió», se da por fijo el denominador. No lo es: la cantidad de dinero cambia todos los meses, y con ella el tamaño de la unidad con que se mide todo lo demás." | Interpretación. La segunda frase sí tiene serie detrás (el M2 cambia cada mes); "el tamaño de la unidad" es tesis. |
| `src/components/Dashboard.tsx`, cierre | "¿Quién dijo que el dinero era escaso?" | Pregunta retórica con juicio implícito. |
| `src/components/Dashboard.tsx`, cierre | "La fracción tiene dos lados. Esta página es el de abajo." | Marco del ecosistema. |
| `src/app/layout.tsx`, `openGraph` y `twitter` | "Cada precio es una fracción. Esto muestra el de abajo." | Marco del sitio, sin cifra. |
| `src/components/Header.tsx`, `src/components/Footer.tsx` | "Todo precio es una fracción: Numerador ÷ Denominador"; "El dinero que se encoge"; "Los activos de arriba de la fracción"; "Un activo medido en otro" | Marco del ecosistema; "El dinero que se encoge" repite la tesis. |
| `README.md`, cierre | "Los precios no suben. La unidad se achica." | La tesis, fuera del sitio. |

## 3. Resuelto en la pasada editorial (rama `claude/eldenominador-editorial-ux-rlpnpv`, 2026-10-10)

Criterio de esta pasada: ningún titular presenta como demostrado algo que las
series no prueban. En particular, el sitio no afirma que el aumento del M2
equivalga a una pérdida proporcional de poder adquisitivo ni que explique todos
los movimientos de precios.

| Texto | Dónde estaba | Qué se hizo |
| --- | --- | --- |
| "Los precios no suben. El dinero se encoge." | Titular de la portada (`src/components/Dashboard.tsx`) | Pasa a "Cuando cambia el dinero, cambia la medida.", con la bajada "Observa cómo evoluciona la cantidad de dinero y qué cambia al medir los activos contra ella." Sigue rotulado como tesis. |
| "Cuando se dice que «el pan subió», se da por fijo el denominador. No lo es: la cantidad de dinero cambia todos los meses, y con ella el tamaño de la unidad con que se mide todo lo demás." | Bloque "¿Qué es el denominador?" | Se retira. El bloque pasa a la portada como explicación de la fracción: "Un precio es una fracción. Arriba está lo que se compra; abajo, la moneda en que se expresa su precio." Sin afirmar que la unidad se achica. |
| "Entre X y Y, el M2 ... pasó de A a B miles de millones: Z veces." | Bloque "¿Qué es el denominador?" | Pasa al texto "Qué muestra" del gráfico de tres economías, en billones de USD y con la suma a tipo de cambio constante al lado. Es un dato con fuente (cálculo propio, A-D0-10 y A-D0-11). |
| "¿Quién dijo que el dinero era escaso?" | Cierre | Pasa a "Ningún precio viene solo. Siempre trae su medida.": marco del sitio, sin juicio sobre escasez ni sobre precios. |
| "El dinero que se encoge" | `src/components/Footer.tsx`, descripción del sitio en la lista del ecosistema | Pasa a "La moneda en que se expresa el precio". |
| "Cada precio es una fracción. Esto muestra el de abajo." | `src/app/layout.tsx`, `openGraph` y `twitter` | Pasa a "Cuando cambia el dinero, cambia la medida. Cada precio es una fracción; este sitio sigue el lado de abajo: la cantidad de dinero, según la publican sus emisores." |
| "Cuando el denominador crece, el número sube, pero lo que cambió fue el tamaño de la unidad." y "Los precios no suben. La unidad se achica." | `README.md` | Pasan a la misma formulación de la portada. |

Textos que siguen en el sitio y se mantienen como marco, no como tesis sobre
precios: "Todo precio es una fracción" (barra del ecosistema y pie), "La
fracción tiene dos lados. Esta página es el de abajo." (cierre), "Los activos
de arriba de la fracción" y "Un activo medido en otro" (pie).

Nota sobre la bajada: "Observa cómo evoluciona..." lleva un imperativo. La regla
"el sitio describe, no recomienda; no usa verbos de acción" apunta a no
recomendar operaciones; aquí el verbo invita a mirar los datos, no a actuar
sobre ellos. Si se prefiere evitar todo imperativo, la alternativa descriptiva
es "Cómo evoluciona la cantidad de dinero y qué cambia al medir los activos
contra ella."
