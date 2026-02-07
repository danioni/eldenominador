import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "El Denominador — Observatorio de Liquidez Global",
  description:
    "Tracking de liquidez global en tiempo real. M2, bancos centrales, liquidez neta. Los precios no suben — la unidad se achica.",
  keywords: [
    "liquidez global",
    "M2",
    "bancos centrales",
    "Fed",
    "BCE",
    "BoJ",
    "PBoC",
    "denominador",
    "macro",
    "liquidez neta",
  ],
  openGraph: {
    title: "El Denominador",
    description:
      "Cada precio es una fracción. Esto trackea el de abajo.",
    url: "https://eldenominador.com",
    siteName: "El Denominador",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "El Denominador",
    description:
      "Cada precio es una fracción. Esto trackea el de abajo.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="noise-overlay">{children}</body>
    </html>
  );
}
