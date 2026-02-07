"use client";

export default function Footer() {
  return (
    <footer className="relative mt-16">
      {/* Top gradient line */}
      <div
        className="h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--accent-green-border) 50%, transparent)",
        }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "var(--accent-green-bg)",
              border: "1px solid var(--accent-green-border)",
            }}
          >
            <svg viewBox="0 0 64 64" className="w-4 h-4">
              <defs>
                <filter id="footer-neon">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
                  <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0  0 0 0 0 1  0 0 0 0 0.53  0 0 0 1 0" result="green-blur"/>
                  <feMerge>
                    <feMergeNode in="green-blur"/>
                    <feMergeNode in="green-blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <g filter="url(#footer-neon)">
                <circle cx="32" cy="16" r="6" fill="#00ff88"/>
                <rect x="11" y="28" width="42" height="8" rx="4" fill="#00ff88"/>
                <circle cx="32" cy="48" r="6" fill="#00ff88"/>
              </g>
            </svg>
          </div>
          <span
            className="text-[11px] tracking-wider"
            style={{ color: "var(--text-muted)" }}
          >
            Cada precio es una fracción. Esto trackea el de abajo.
          </span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://elfaro.capital"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] tracking-wider uppercase transition-opacity hover:opacity-80"
            style={{ color: "var(--text-muted)" }}
          >
            El Faro Capital
          </a>
          <span className="text-[10px] tabular-nums" style={{ color: "var(--text-muted)" }}>
            {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  );
}
