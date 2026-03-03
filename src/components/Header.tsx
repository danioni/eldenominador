"use client";

import { useState, useEffect } from "react";

function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme") as "dark" | "light";
    if (current) setTheme(current);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  return (
    <button
      onClick={toggle}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
      style={{
        background: "var(--accent-bg)",
        border: "1px solid var(--accent-border)",
      }}
      aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {theme === "dark" ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

const ECOSYSTEM_SITES = [
  { label: "El Denominador", href: "https://eldenominador.com", key: "denominador", current: true },
  { label: "El Numerador", href: "https://elnumerador.com", key: "numerador" },
  { label: "Los Ratios", href: "https://losratios.com", key: "ratios" },
];

function EcosystemBar() {
  return (
    <nav
      className="w-full overflow-x-auto"
      style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-subtle)" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-1 sm:gap-2 min-w-0">
        <span className="text-[8px] sm:text-[9px] tracking-wider uppercase shrink-0" style={{ color: "var(--text-muted)" }}>
          Todo precio es una fracción:
        </span>
        {ECOSYSTEM_SITES.map((site, i) => (
          <span key={site.key} className="flex items-center gap-1 sm:gap-2 shrink-0">
            {i > 0 && <span className="text-[9px]" style={{ color: "var(--text-muted)", opacity: 0.4 }}>→</span>}
            <a
              href={site.href}
              target={site.current ? undefined : "_blank"}
              rel={site.current ? undefined : "noopener noreferrer"}
              className="text-[8px] sm:text-[9px] tracking-wider uppercase transition-opacity hover:opacity-80 whitespace-nowrap"
              style={{
                color: site.current ? "var(--accent)" : "var(--text-muted)",
                textDecoration: site.current ? "underline" : "none",
                textUnderlineOffset: "3px",
                fontWeight: site.current ? 600 : 400,
              }}
            >
              {site.label}
            </a>
          </span>
        ))}
      </div>
    </nav>
  );
}

export default function Header() {
  return (
    <header
      className="relative"
      style={{
        background: "linear-gradient(180deg, var(--ambient-glow) 0%, transparent 100%)",
      }}
    >
      <EcosystemBar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <div
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "var(--accent-bg)",
              border: "1px solid var(--accent-border-active)",
              boxShadow: "var(--accent-glow)",
            }}
          >
            <svg viewBox="0 0 64 64" className="w-5 h-5 sm:w-6 sm:h-6">
              {/* Shrinking ruler — tapered body with compressing tick marks */}
              <path d="M7,18 L57,25 L57,39 L7,46 Z" fill="#ff4433"/>
              <line x1="15" y1="19.2" x2="15" y2="34" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.92"/>
              <line x1="27" y1="21" x2="27" y2="33" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.70"/>
              <line x1="37" y1="22.4" x2="37" y2="32.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.48"/>
              <line x1="45" y1="23.5" x2="45" y2="32" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.32"/>
              <line x1="51" y1="24.4" x2="51" y2="31" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity="0.18"/>
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-lg sm:text-xl tracking-wide truncate" style={{ color: "var(--text-primary)" }}>
              El Denominador
            </h1>
            <p className="text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
              Observatorio de Liquidez Global
            </p>
          </div>
        </div>

        {/* Live indicator + theme toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div
            className="label-badge hidden sm:inline-flex"
          >
            <div
              className="w-1.5 h-1.5 rounded-full pulse-dot"
              style={{ background: "var(--accent)" }}
            />
            <span className="text-[10px] tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>
              Datos actualizados
            </span>
          </div>
          <div
            className="label-badge sm:hidden"
          >
            <div
              className="w-1.5 h-1.5 rounded-full pulse-dot"
              style={{ background: "var(--accent)" }}
            />
            <span className="text-[9px] tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>
              Live
            </span>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Subtle gradient line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--accent-border-active) 50%, transparent)",
        }}
      />
    </header>
  );
}
