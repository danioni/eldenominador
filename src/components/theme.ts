"use client";

import { useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

function suscribir(callback: () => void): () => void {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function leerTema(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function temaServidor(): Theme {
  return "dark";
}

/** El tema vigente (atributo data-theme de <html>); en el servidor, oscuro. */
export function useTheme(): Theme {
  return useSyncExternalStore(suscribir, leerTema, temaServidor);
}

export function setTheme(tema: Theme): void {
  document.documentElement.setAttribute("data-theme", tema);
  try {
    localStorage.setItem("theme", tema);
  } catch {
    // Sin almacenamiento local, el tema vale para esta visita.
  }
}

/**
 * Los colores de los gráficos son las variables de globals.css, que cambian
 * solas con el tema. Recharts las pasa tal cual a los atributos SVG.
 */
export const COLORES = {
  blue: "var(--accent-blue)",
  purple: "var(--accent-purple)",
  amber: "var(--accent-amber)",
  green: "var(--accent-green)",
  orange: "var(--accent-orange)",
  red: "var(--accent-red)",
  cyan: "var(--accent-cyan)",
} as const;

export type Colores = typeof COLORES;
