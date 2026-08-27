import type { Metadata } from "next";
import { Source_Serif_4, Nunito_Sans } from "next/font/google";
import Link from "next/link";
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
      <body>
        <nav className="flex items-center justify-between px-5 py-3 bg-pine-deep">
          <span className="font-display text-lg font-semibold text-cream">Fern Hollow Early Learning</span>
          <div className="flex gap-4 text-sm font-semibold">
            <Link href="/" className="text-cream/70 hover:text-cream">Parent</Link>
            <Link href="/staff" className="text-cream/70 hover:text-cream">Staff</Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
