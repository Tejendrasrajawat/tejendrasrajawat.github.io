import type { Metadata } from "next";
import Link from "next/link";
import JsonFormatter from "./JsonFormatter";

export const metadata: Metadata = {
  title: "JSON Formatter",
  description:
    "Beautify, minify, and validate JSON instantly. Free online JSON formatter with syntax validation. No signup required.",
  keywords: [
    "JSON formatter",
    "JSON beautify",
    "JSON minify",
    "JSON validator",
    "format JSON",
  ],
  openGraph: {
    title: "JSON Formatter | DevKit",
    description:
      "Beautify, minify, and validate JSON instantly. Free online JSON formatter.",
  },
};

export default function JsonFormatterPage() {
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
              href="/#get-started"
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
            JSON Formatter
          </h1>
          <p className="text-muted">
            Beautify, minify, and validate JSON in milliseconds. Paste your JSON
            below to get started.
          </p>
        </div>

        <JsonFormatter />
      </main>
    </div>
  );
}
