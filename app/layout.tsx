import type { Metadata } from "next";
import { Inter, Press_Start_2P, Space_Mono } from "next/font/google";
import "./globals.css";
import LanguageProvider from "../components/LanguageProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const pixel = Press_Start_2P({
  weight: "400",
  variable: "--font-pixel",
  subsets: ["latin"],
});

const mono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-space-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gitvinci — dessine ton graph de contributions GitHub",
  description:
    "Éditeur de pixel art pour le calendrier de contributions GitHub : dessine, écris du texte et personnalise des templates sur les vraies dates de ton année.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${pixel.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><LanguageProvider>{children}</LanguageProvider></body>
    </html>
  );
}
