import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "El Denominador — Observatorio de Liquidez Global";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export { default } from "./opengraph-image";
