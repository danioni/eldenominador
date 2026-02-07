import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "El Denominador — Observatorio de Liquidez Global";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#06060b",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient glow top */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(0, 255, 136, 0.08) 0%, transparent 70%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "32px",
          }}
        >
          {/* ÷ symbol with glow box */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "120px",
              height: "120px",
              borderRadius: "28px",
              background:
                "linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,255,136,0.03))",
              border: "1px solid rgba(0,255,136,0.25)",
              boxShadow:
                "0 0 60px rgba(0, 255, 136, 0.15), 0 0 120px rgba(0, 255, 136, 0.05)",
              fontSize: "64px",
              color: "#00ff88",
              fontFamily: "monospace",
              fontWeight: 700,
            }}
          >
            ÷
          </div>

          {/* Title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                fontSize: "56px",
                color: "#e8e8ed",
                fontFamily: "serif",
                letterSpacing: "2px",
              }}
            >
              El Denominador
            </div>

            {/* Separator line */}
            <div
              style={{
                width: "300px",
                height: "1px",
                background:
                  "linear-gradient(90deg, transparent, rgba(0,255,136,0.4), transparent)",
              }}
            />

            <div
              style={{
                fontSize: "16px",
                color: "#55556a",
                letterSpacing: "6px",
                textTransform: "uppercase",
                fontFamily: "monospace",
              }}
            >
              Observatorio de Liquidez Global
            </div>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: "20px",
              color: "#8888a0",
              fontFamily: "monospace",
              marginTop: "16px",
            }}
          >
            Cada precio es una fracción. Esto trackea el de abajo.
          </div>
        </div>

        {/* Bottom border accent */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "2px",
            background:
              "linear-gradient(90deg, transparent, #00ff88, transparent)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
