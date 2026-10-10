"use client";

import type { ReactNode } from "react";

interface InterpretacionProps {
  /** Descripción factual de la serie o de la comparación. */
  queMuestra: ReactNode;
  /** El límite o la precaución principal para leer el gráfico. */
  comoInterpretarlo: ReactNode;
}

/** Dos textos breves junto a cada gráfico: qué muestra y cómo interpretarlo. */
export default function Interpretacion({ queMuestra, comoInterpretarlo }: InterpretacionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mt-4 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <div>
        <p className="rotulo mb-1.5">Qué muestra</p>
        <p className="texto">{queMuestra}</p>
      </div>
      <div>
        <p className="rotulo mb-1.5">Cómo interpretarlo</p>
        <p className="texto">{comoInterpretarlo}</p>
      </div>
    </div>
  );
}
