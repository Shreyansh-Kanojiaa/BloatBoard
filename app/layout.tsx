import type { Metadata } from "next";
import { Archivo_Black, Space_Grotesk } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const display = Archivo_Black({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const body = Space_Grotesk({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "BloatBoard",
  description: "A crowdsourced leaderboard of the most RAM-hungry desktop apps.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">{children}</main>
        <footer className="border-t-3 border-ink bg-ink px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-paper">
          RAM figures are self-reported. Trust nobody. Especially not Electron.
        </footer>
      </body>
    </html>
  );
}
