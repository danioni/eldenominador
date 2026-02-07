"use client";

export default function Header() {
  return (
    <header
      className="relative"
      style={{
        background: "linear-gradient(180deg, rgba(0, 255, 136, 0.02) 0%, transparent 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold"
            style={{
              background: "linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,255,136,0.03))",
              border: "1px solid rgba(0,255,136,0.2)",
              color: "var(--accent-green)",
              boxShadow: "0 0 24px rgba(0, 255, 136, 0.08)",
            }}
          >
            ÷
          </div>
          <div>
            <h1 className="font-serif text-xl tracking-wide" style={{ color: "var(--text-primary)" }}>
              El Denominador
            </h1>
            <p className="text-[10px] tracking-[0.2em] uppercase mt-0.5" style={{ color: "var(--text-muted)" }}>
              Observatorio de Liquidez Global
            </p>
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-3">
          <div
            className="label-badge"
          >
            <div
              className="w-1.5 h-1.5 rounded-full pulse-dot"
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
            "linear-gradient(90deg, transparent, rgba(0,255,136,0.25) 50%, transparent)",
        }}
      />
    </header>
  );
}
