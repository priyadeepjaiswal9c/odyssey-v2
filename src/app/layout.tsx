import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Nunito } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

// Monocraft (OFL 1.1) — menu, signs, HUD, headings. Body stays readable sans.
const monocraft = localFont({
  src: [
    { path: "../../public/fonts/Monocraft.ttf", weight: "400" },
    { path: "../../public/fonts/Monocraft-Bold.ttf", weight: "700" },
  ],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://priyadeep-portfolio.vercel.app"),
  title: "Priyadeep Jaiswal — Portfolio",
  description:
    "Priyadeep Jaiswal — AI engineer, ECE @ IIT Patna. A voxel portfolio world at golden hour: projects, experience, achievements. Résumé PDF + classic view included.",
  keywords: [
    "Priyadeep Jaiswal",
    "portfolio",
    "AI engineer",
    "IIT Patna",
    "LLM",
    "voxel",
    "three.js",
    "interactive resume",
  ],
  authors: [{ name: "Priyadeep Jaiswal" }],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Priyadeep Jaiswal — Portfolio",
    description:
      "A voxel portfolio world at golden hour — projects, experience, achievements. In a hurry? /classic has the fast lane.",
    type: "website",
    locale: "en_US",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Priyadeep Jaiswal — Portfolio",
    description:
      "A voxel portfolio world at golden hour. In a hurry? /classic.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#241c12",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${nunito.variable} ${monocraft.variable}`}>
      <body>
        {process.env.NODE_ENV !== "production" && (
          // dev-only: capture every error from t=0 for headless verification
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__errs=[];window.addEventListener('error',function(e){window.__errs.push((e.message||'?')+' @ '+String(e.filename||'').split('/').pop()+':'+e.lineno)},true);window.addEventListener('unhandledrejection',function(e){window.__errs.push('rej: '+String(e.reason&&e.reason.message||e.reason))});`,
            }}
          />
        )}
        {children}
        <Analytics />
      </body>
    </html>
  );
}
