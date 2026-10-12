"use client";

import type { ReactNode } from "react";

interface DesplegableProps {
  /** El rótulo del resumen; por defecto, el de la metodología. */
  titulo?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Lo que hace falta para reproducir un número, pero no para leerlo: códigos de
 * supuestos (A-D0-*, A-R0-*), identificadores de series, archivos, scripts,
 * validaciones y el estado del proceso. Cerrado por defecto; nada se pierde.
 */
export default function Desplegable({ titulo = "Metodología y fuentes", children, className = "" }: DesplegableProps) {
  return (
    <details className={`desplegable ${className}`}>
      <summary>{titulo}</summary>
      <div className="desplegable-cuerpo">{children}</div>
    </details>
  );
}
