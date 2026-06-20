import type { Metadata, Viewport } from "next";
import "./globals.css";

/**
 * Fonts are loaded at runtime via <link> (rather than build-time next/font) so
 * the project builds in fully offline/sandboxed environments. The CSS variables
 * the Tailwind config references (--font-cinzel etc.) are defined in globals.css
 * and resolve to these families once the stylesheet loads; system serif/sans
 * fallbacks keep things legible if the network is unavailable. Chinese uses the
 * platform Songti stack and needs no webfont.
 */

export const metadata: Metadata = {
  title: "微醺时刻 · The Sip & Sigh",
  description:
    "An AI-driven immersive digital mixology experience — pour, mix, and let emotion become a glass.",
};

export const viewport: Viewport = {
  themeColor: "#0E0B08",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="atelier-ambient" aria-hidden />
        {children}
      </body>
    </html>
  );
}
