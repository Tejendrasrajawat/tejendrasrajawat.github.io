import type { Metadata } from "next";
import Link from "next/link";
import UrlParser from "./UrlParser";

export const metadata: Metadata = {
  title: "URL Parser",
  description:
    "Parse, encode, and decode URLs. Inspect components, query parameters, and URL-encode/decode text. No signup required.",
  keywords: [
    "URL parser",
    "URL decoder",
    "URL encoder",
    "query string",
    "parse URL",
  ],
  openGraph: {
    title: "URL Parser | DevKit",
    description:
      "Parse, encode, and decode URLs. Inspect components and query parameters.",
  },
};

export default function UrlParserPage() {
  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-(--border) bg-background/80 backdrop-blur-xl">
        <nav
          className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            className="font-mono text-xl font-semibold text-foreground transition-colors hover:text-(--accent)"
          >
            DevKit
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              All Tools
            </Link>
            <Link
              href="/#tools"
              className="rounded-lg bg-(--accent) px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-(--accent-hover)"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        {/* Page header */}
        <div className="mb-10">
          <Link
            href="/#tools"
            className="mb-4 inline-block text-sm text-muted transition-colors hover:text-(--accent)"
          >
            ← Back to tools
          </Link>
          <h1 className="mb-2 text-3xl font-bold sm:text-4xl">
            URL Parser
          </h1>
          <p className="text-muted">
            Parse URLs to inspect components, query parameters, and hash. Encode
            or decode URL-encoded text.
          </p>
        </div>

        <UrlParser />
      </main>
    </div>
  );
}
