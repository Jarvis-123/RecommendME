import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import { TasteProvider } from "@/contexts/TasteContext";
import { CapacitorInit } from "@/components/CapacitorInit";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RecommendME — What Should We Watch?",
  description:
    "Can't decide what movie to watch? Get personalized recommendations via mood quiz, voice, chat, or search. Find where to stream every film.",
  keywords: ["movie recommendations", "what to watch", "streaming", "movie picker"],
  openGraph: {
    title: "RecommendME — What Should We Watch?",
    description: "Your AI-powered movie companion for dinner nights, date nights, and everything in between.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className="font-body">
        <TasteProvider>
          <CapacitorInit />
          {children}
        </TasteProvider>
      </body>
    </html>
  );
}
