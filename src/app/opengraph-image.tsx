import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "El Denominador — Observatorio de Liquidez Global";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // Tick mark positions: compress from left to right
  const majorTicks = [
    { x: 80, opacity: 0.92, width: 12, height: 90 },
    { x: 200, opacity: 0.72, width: 10, height: 78 },
    { x: 300, opacity: 0.52, width: 8, height: 66 },
    { x: 380, opacity: 0.36, width: 6, height: 54 },
    { x: 440, opacity: 0.24, width: 5, height: 44 },
    { x: 486, opacity: 0.14, width: 4, height: 34 },
  ];

  const minorTicks = [
    { x: 140, opacity: 0.45, width: 5, height: 48 },
    { x: 250, opacity: 0.32, width: 4, height: 40 },
    { x: 340, opacity: 0.22, width: 3, height: 33 },
    { x: 410, opacity: 0.14, width: 3, height: 26 },
    { x: 464, opacity: 0.08, width: 2, height: 20 },
  ];

  // Ruler top edge: slopes from y=0 at x=0 to y=30 at x=520 (within the ruler container)
  const rulerTopAt = (x: number) => (x / 520) * 30;

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
        {/* Ambient glow — red accent */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(255, 68, 51, 0.07) 0%, transparent 70%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "36px",
          }}
        >
          {/* Ruler visualization */}
          <div
            style={{
              display: "flex",
              position: "relative",
              width: "520px",
              height: "140px",
            }}
          >
            {/* Ruler body — red bar with gradient */}
            <svg
              width="520"
              height="140"
              viewBox="0 0 520 140"
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              <path
                d="M0,10 L520,35 L520,105 L0,130 Z"
                fill="#ff4433"
              />
            </svg>

            {/* Major tick marks */}
            {majorTicks.map((tick) => (
              <div
                key={`major-${tick.x}`}
                style={{
                  position: "absolute",
                  left: `${tick.x}px`,
                  top: `${10 + rulerTopAt(tick.x)}px`,
                  width: `${tick.width}px`,
                  height: `${tick.height}px`,
                  borderRadius: `${tick.width}px`,
                  background: `rgba(255, 255, 255, ${tick.opacity})`,
                }}
              />
            ))}

            {/* Minor tick marks */}
            {minorTicks.map((tick) => (
              <div
                key={`minor-${tick.x}`}
                style={{
                  position: "absolute",
                  left: `${tick.x}px`,
                  top: `${10 + rulerTopAt(tick.x)}px`,
                  width: `${tick.width}px`,
                  height: `${tick.height}px`,
                  borderRadius: `${tick.width}px`,
                  background: `rgba(255, 255, 255, ${tick.opacity})`,
                }}
              />
            ))}
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

            {/* Separator line — red accent */}
            <div
              style={{
                width: "300px",
                height: "1px",
                background:
                  "linear-gradient(90deg, transparent, rgba(255, 68, 51, 0.5), transparent)",
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
              fontSize: "22px",
              color: "#8888a0",
              fontFamily: "monospace",
              marginTop: "8px",
            }}
          >
            Los precios no suben. La unidad se achica.
          </div>
        </div>

        {/* Bottom border accent — red */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "2px",
            background:
              "linear-gradient(90deg, transparent, #ff4433, transparent)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
