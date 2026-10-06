"use client";

import type { Lock } from "@/lib/series";

const ECOSYSTEM_LINKS = [
  { label: "El Denominador", href: "https://eldenominador.com", desc: "El dinero que se encoge", current: true },
  { label: "El Numerador", href: "https://elnumerador.com", desc: "Los activos de arriba de la fracción" },
  { label: "Los Ratios", href: "https://losratios.com", desc: "Un activo medido en otro" },
];

export default function Footer({ lock, atribuciones }: { lock: Lock; atribuciones: string[] }) {
  const urlCommit = `https://github.com/${lock.repositorio}/tree/${lock.commit}/senales/data/series`;
  return (
    <footer className="relative mt-16">
      <div
        className="h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--accent-border) 50%, transparent)",
        }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Origen de los datos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
          <div>
            <p className="uppercase tracking-widest mb-2" style={{ color: "var(--text-secondary)", fontSize: "10px" }}>
              Origen de los datos
            </p>
            <p>
              Todas las series salen de{" "}
              <a href={urlCommit} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--accent)" }}>
                {lock.repositorio}
              </a>
              , carpeta <code>senales/data/series/</code>, rama <code>{lock.rama}</code>, commit{" "}
              <code title={lock.commit}>{lock.commit.slice(0, 7)}</code>, leído el {lock.fecha_lectura}. Son copias fijadas en{" "}
              <code>datos.lock</code> y verificadas por su SHA-256 antes de cada build. Este sitio no descarga nada de ninguna
              fuente: los crudos, los gates de validación, los supuestos numerados (A-D0-*) y el changelog están en ese
              repositorio.
            </p>
            <p className="mt-2">
              Los valores se publican sin cambios. Las únicas cifras calculadas aquí son las variaciones interanuales y las
              veces entre dos meses, rotuladas como cálculo propio. Las conversiones a billones (10¹²) son cambios de unidad.
            </p>
          </div>
          <div>
            <p className="uppercase tracking-widest mb-2" style={{ color: "var(--text-secondary)", fontSize: "10px" }}>
              Atribuciones
            </p>
            <ul className="space-y-1.5">
              {atribuciones.map((a) => (
                <li key={a} className="text-[10px] leading-relaxed">
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Ecosistema */}
        <div className="text-center pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <p className="text-[10px] sm:text-[11px] tracking-[0.15em] uppercase" style={{ color: "var(--text-muted)" }}>
            Todo precio es una fracción: Numerador &divide; Denominador
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 sm:gap-x-8 gap-y-3">
          {ECOSYSTEM_LINKS.map((link) => (
            <div key={link.label} className="flex items-center gap-2">
              <a
                href={link.href}
                target={link.current ? undefined : "_blank"}
                rel={link.current ? undefined : "noopener noreferrer"}
                className="text-[10px] sm:text-[11px] tracking-wider uppercase font-medium transition-opacity hover:opacity-80"
                style={{ color: link.current ? "var(--accent)" : "var(--text-secondary)" }}
              >
                {link.label}
              </a>
              <span className="text-[9px] hidden sm:inline" style={{ color: "var(--text-muted)" }}>
                {link.desc}
              </span>
            </div>
          ))}
        </div>

        {/* Firma */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: "var(--accent-bg)",
                border: "1px solid var(--accent-border)",
              }}
            >
              <svg viewBox="0 0 64 64" className="w-3.5 h-3.5">
                <defs>
                  <filter id="footer-neon">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
                    <feColorMatrix in="blur" type="matrix" values="0 0 0 0 1  0 0 0 0 0.27  0 0 0 0 0.2  0 0 0 1 0" result="red-blur"/>
                    <feMerge>
                      <feMergeNode in="red-blur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <g filter="url(#footer-neon)">
                  <circle cx="32" cy="16" r="6" fill="#ff4433"/>
                  <rect x="11" y="28" width="42" height="8" rx="4" fill="#ff4433"/>
                  <circle cx="32" cy="48" r="6" fill="#ff4433"/>
                </g>
              </svg>
            </div>
            <span className="text-[10px] tracking-wider" style={{ color: "var(--text-muted)" }}>
              Parte del ecosistema eldenominador · elnumerador · losratios
            </span>
          </div>
          <span className="text-[9px] tabular-nums" style={{ color: "var(--text-muted)" }}>
            {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  );
}
