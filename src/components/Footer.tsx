"use client";

export default function Footer() {
  return (
    <footer
      className="border-t mt-16 py-8 px-6"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="text-lg font-bold"
            style={{ color: "var(--accent-green)" }}
          >
            ÷
          </span>
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
            className="text-[10px] tracking-wider uppercase transition-colors hover:opacity-80"
            style={{ color: "var(--text-muted)" }}
          >
            El Faro Capital
          </a>
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  );
}
