import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import { ShieldCheck, Lock } from "lucide-react";
import "./globals.css";

// next/font self-hosts every font at build time — no runtime request to Google,
// no third-party origin, consistent with the no-trackers privacy posture and CSP.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pinpoint — Your AI policy, built from how your team actually works.",
  description:
    "Pinpoint is a privacy-first AI policy builder. No accounts, no uploads, no tracking. Your assessment stays in your browser.",
  // No verification/analytics meta tags by design.
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen font-sans">
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md backdrop-saturate-150">
          <div className="container flex h-16 items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              {/* Ink mark with the signal-teal shield — the "secure instrument" logo. */}
              <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-ink text-signal">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="font-display text-[17px] font-semibold tracking-tight">
                Pinpoint
              </span>
            </Link>
            <nav className="flex items-center gap-2 text-sm sm:gap-4">
              {/* Persistent local-only assurance, visible on every page. */}
              <span
                className="hidden items-center gap-1.5 rounded-sm border px-2.5 py-1 font-mono text-[11px] font-medium sm:inline-flex"
                style={{
                  borderColor: "hsl(var(--signal) / 0.35)",
                  color: "hsl(var(--signal) / 0.9)",
                  background: "hsl(var(--signal) / 0.08)",
                }}
                title="Your data stays in this browser. No accounts, no uploads, no tracking."
              >
                <Lock className="h-3 w-3" />
                Local-only
              </span>
              <Link
                href="/#how-it-works"
                className="hidden px-2 text-muted-foreground hover:text-foreground sm:inline"
              >
                How it works
              </Link>
              <Link
                href="/results"
                className="hidden px-2 text-muted-foreground hover:text-foreground sm:inline"
              >
                Sample pack
              </Link>
              <Link
                href="/assessment"
                className="rounded-sm bg-primary px-3.5 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Start assessment
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-20 border-t border-border">
          <div className="container flex flex-col gap-3 py-9 text-sm text-muted-foreground">
            <div className="pp-eyebrow flex flex-wrap gap-x-4 gap-y-1.5">
              <span>No accounts</span>
              <span>No backend database</span>
              <span>No trackers or fingerprinting</span>
              <span>Self-hosted fonts</span>
              <span>connect-src &apos;self&apos;</span>
            </div>
            <p className="font-medium text-foreground">
              Pinpoint runs entirely in your browser.
            </p>
            <p>
              No accounts. No uploads. No analytics or tracking. Your assessment
              stays in this browser&apos;s local storage and is removed when you
              clear it.
            </p>
            <p className="text-xs">
              Pinpoint provides general informational guidance only and is not
              legal advice.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
