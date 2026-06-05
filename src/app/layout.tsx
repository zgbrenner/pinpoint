import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import "./globals.css";

// next/font self-hosts the font at build time — no runtime request to Google,
// no third-party origin, consistent with the no-trackers privacy posture.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans">
        <header className="border-b border-border bg-background/80 backdrop-blur">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>Pinpoint</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/#how-it-works" className="hover:text-foreground">
                How it works
              </Link>
              <Link href="/#privacy" className="hover:text-foreground">
                Privacy
              </Link>
              <Link
                href="/assessment"
                className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground hover:bg-primary/90"
              >
                Start assessment
              </Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-20 border-t border-border">
          <div className="container flex flex-col gap-2 py-8 text-sm text-muted-foreground">
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
