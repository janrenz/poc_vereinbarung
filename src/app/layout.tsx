import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { HeaderNotifications } from "@/components/HeaderNotifications";
import { autoSeed } from "@/lib/auto-seed";

// Run auto-seed on server startup
if (process.env.NODE_ENV === "production") {
  autoSeed();
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zielvereinbarung Digital",
  description: "Moderne, freundliche digitale Zielvereinbarungen für Schulen & Schulämter",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      {/* Skip to main content link for keyboard/screen reader users */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--md-sys-color-primary)] focus:text-[var(--md-sys-color-on-primary)] focus:rounded-[var(--md-sys-shape-corner-medium)] focus:font-medium focus:shadow-lg"
      >
        Zum Hauptinhalt springen
      </a>
      <div className="min-h-screen bg-[var(--md-sys-color-background)]">
        <header className="bg-white border-b border-[var(--md-sys-color-outline-variant)] shadow-sm sticky top-0 z-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link 
                href="/" 
                className="font-bold text-xl text-[var(--md-sys-color-primary)] hover:text-[var(--md-sys-color-primary)]/80 transition-colors touch-manipulation"
              >
                NRW Zielvereinbarung Digital
              </Link>
              <div className="flex items-center gap-2">
                <nav className="flex gap-1" aria-label="Hauptnavigation">
                  <Link 
                    className="px-4 py-2 text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-variant)] rounded transition-colors touch-manipulation font-medium" 
                    href="/"
                  >
                    Start
                  </Link>
                  <Link 
                    className="px-4 py-2 text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-variant)] rounded transition-colors touch-manipulation font-medium" 
                    href="/login"
                  >
                    Schulamt
                  </Link>
                  <Link 
                    className="px-4 py-2 text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-variant)] rounded transition-colors touch-manipulation font-medium" 
                    href="/formular"
                  >
                    Zugang für Schulen
                  </Link>
                  <Link 
                    className="px-4 py-2 text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-variant)] rounded transition-colors touch-manipulation font-medium" 
                    href="/completed"
                  >
                    Abgeschlossene Formulare
                  </Link>
                </nav>
                <HeaderNotifications />
              </div>
            </div>
          </div>
        </header>
        <main id="main-content" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">{children}</main>
                <footer className="bg-white border-t border-[var(--md-sys-color-outline-variant)] mt-16">
                  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex flex-wrap justify-center gap-4 text-sm">
                        <Link 
                          href="/impressum"
                          className="text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] hover:underline"
                        >
                          Impressum
                        </Link>
                        <span className="text-[var(--md-sys-color-outline)]">|</span>
                        <Link 
                          href="/datenschutz"
                          className="text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] hover:underline"
                        >
                          Datenschutz
                        </Link>
                      </div>
                      <p className="text-center text-sm text-[var(--md-sys-color-on-surface-variant)]">
                        © {new Date().getFullYear()} Ministerium für Schule und Bildung des Landes Nordrhein-Westfalen · Zielvereinbarung Digital
                      </p>
                    </div>
                  </div>
                </footer>
      </div>
      </body>
    </html>
  );
}
