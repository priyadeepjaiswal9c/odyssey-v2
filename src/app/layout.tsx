import type { Metadata, Viewport } from "next";
import { Nunito, Pixelify_Sans } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const pixelify = Pixelify_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kalpana — Priyadeep Jaiswal's Voxel World",
  description:
    "A cozy voxel world you tour: Priyadeep Jaiswal's portfolio as floating islands, profession-villagers, and a hall of glowing trophies. AI engineer, IIT Patna. Led by Kip, a small glowing critter.",
  keywords: [
    "Priyadeep Jaiswal",
    "portfolio",
    "AI engineer",
    "IIT Patna",
    "voxel",
    "three.js",
    "interactive resume",
  ],
  authors: [{ name: "Priyadeep Jaiswal" }],
  openGraph: {
    title: "Kalpana — Priyadeep Jaiswal's Voxel World",
    description:
      "Tour a cozy voxel cosmos of projects, professions, and trophies — led by Kip the glowing critter.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kalpana — Priyadeep Jaiswal's Voxel World",
    description:
      "A cozy voxel portfolio world you tour, led by a glowing critter.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#2b1b3d",
  width: "device-width",
  initialScale: 1,
  // the world is a fixed-viewport experience; text core scrolls inside its panel
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${nunito.variable} ${pixelify.variable}`}>
      <body>{children}</body>
    </html>
  );
}
