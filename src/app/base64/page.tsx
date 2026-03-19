import type { Metadata } from "next";
import Link from "next/link";
import Base64Tool from "./Base64Tool";

export const metadata: Metadata = {
  title: "Base64 Encode/Decode",
  description:
    "Encode and decode Base64, URL-safe Base64, and hex. Free online tool. No signup required.",
  keywords: [
    "Base64 encode",
    "Base64 decode",
    "Base64",
    "URL-safe Base64",
    "hex encode",
  ],
  openGraph: {
    title: "Base64 Encode/Decode | DevKit",
    description:
      "Encode and decode Base64, URL-safe Base64, and hex strings.",
  },
};

export default function Base64Page() {
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
            Base64 Encode / Decode
          </h1>
          <p className="text-muted">
            Encode text to Base64 or decode Base64 to text. Supports standard,
            URL-safe, and hex formats.
          </p>
        </div>

        <Base64Tool />
      </main>
    </div>
  );
}
