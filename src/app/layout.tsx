import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "El Denominador — Observatorio de Liquidez Global",
  description:
    "El M2 de EE.UU., la Eurozona y Japón, los balances de la Fed, el Eurosistema y el Banco de Japón, y el oro y BTC medidos en M2. Series publicadas por sus emisores, con fuente; lo no medido, dicho como tal. Los precios no suben: la unidad se achica.",
  keywords: [
    "liquidez global",
    "M2",
    "bancos centrales",
    "Fed",
    "BCE",
    "BoJ",
    "denominador",
    "macro",
    "oro",
    "bitcoin",
  ],
  openGraph: {
    title: "El Denominador",
    description:
      "Cada precio es una fracción. Esto muestra el de abajo.",
    url: "https://eldenominador.com",
    siteName: "El Denominador",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary_large_image",
    title: "El Denominador",
    description:
      "Cada precio es una fracción. Esto muestra el de abajo.",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(!t)t=window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark';document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`,
          }}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="noise-overlay">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
