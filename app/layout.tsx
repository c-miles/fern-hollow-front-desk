import type { Metadata } from "next";
import { Source_Serif_4, Nunito_Sans } from "next/font/google";
import Link from "next/link";
import Grainient from "@/components/grainient";
import "./globals.css";

const serif = Source_Serif_4({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-source-serif" });
const sans = Nunito_Sans({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-nunito-sans" });

export const metadata: Metadata = {
  title: "Fern Hollow Early Learning",
  description: "Ask Wren, the Fern Hollow front desk assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="relative h-dvh flex flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 hidden sm:block">
          <Grainient color1="#35705B" color2="#1F4D3F" color3="#16382E" timeSpeed={0.6} grainAmount={0.08} />
        </div>
        <nav className="relative z-20 flex items-center justify-between px-5 py-3 bg-gradient-to-b from-pine-deep/60 to-transparent">
          <span className="font-display text-lg font-semibold text-cream">Fern Hollow Early Learning</span>
          <div className="flex gap-4 text-sm font-semibold">
            <Link href="/" className="text-cream/70 hover:text-cream focus-visible:outline-2 focus-visible:outline-cream">Parent</Link>
            <Link href="/staff" className="text-cream/70 hover:text-cream focus-visible:outline-2 focus-visible:outline-cream">Staff</Link>
          </div>
        </nav>
        <div className="relative z-10 flex-1 min-h-0 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
