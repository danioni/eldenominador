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
