"use client";

export default function Header() {
  return (
    <header className="relative border-b" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold"
            style={{
              background: "linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,255,136,0.05))",
              border: "1px solid rgba(0,255,136,0.25)",
              color: "var(--accent-green)",
            }}
          >
            ÷
          </div>
          <div>
            <h1 className="font-serif text-xl tracking-wide" style={{ color: "var(--text-primary)" }}>
              El Denominador
            </h1>
            <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--text-muted)" }}>
              Observatorio de Liquidez Global
            </p>
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full pulse-dot"
              style={{ background: "var(--accent-green)" }}
            />
            <span className="text-[10px] tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>
              Datos actualizados
            </span>
          </div>
        </div>
      </div>

      {/* Subtle gradient line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,255,136,0.2) 50%, transparent)",
        }}
      />
    </header>
  );
}
