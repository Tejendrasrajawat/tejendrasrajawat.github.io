import type { Metadata } from "next";
import Link from "next/link";
import InvoiceAgingWrapper from "./InvoiceAgingWrapper";

export const metadata: Metadata = {
  title: "Invoice Aging Calculator",
  description:
    "Free invoice aging calculator. Track unpaid invoices, see overdue amounts, and export aging reports. No signup required.",
  keywords: [
    "invoice aging",
    "invoice tracker",
    "overdue invoices",
    "accounts receivable",
    "freelancer tools",
    "invoice calculator",
  ],
  openGraph: {
    title: "Invoice Aging Calculator | DevKit",
    description:
      "Track unpaid invoices and see how overdue each one is — at a glance.",
  },
};

export default function InvoiceAgingPage() {
  return (
    <div className="min-h-screen bg-background bg-grid">
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

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <Link
            href="/#tools"
            className="mb-4 inline-block text-sm text-muted transition-colors hover:text-(--accent)"
          >
            ← Back to tools
          </Link>
          <h1 className="mb-2 text-3xl font-bold sm:text-4xl">
            Invoice Aging Calculator
          </h1>
          <p className="text-muted">
            Track unpaid invoices and see how overdue each one is — at a
            glance, with zero setup.
          </p>
        </div>

        <InvoiceAgingWrapper />
      </main>
    </div>
  );
}
