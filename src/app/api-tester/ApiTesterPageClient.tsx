"use client";

import Link from "next/link";
import { useState } from "react";
import ApiTester from "./ApiTester";

export default function ApiTesterPageClient() {
  const [fullScreen, setFullScreen] = useState(false);

  return (
    <div className={`min-h-screen bg-background bg-grid ${fullScreen ? "fixed inset-0 z-[100] flex flex-col" : ""}`}>
      {!fullScreen && (
        <>
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

          <main className="mx-auto max-w-6xl flex-1 px-6 py-6">
            <div className="mb-6">
              <div className="mb-4 flex items-center justify-between">
                <Link
                  href="/#tools"
                  className="text-sm text-muted transition-colors hover:text-(--accent)"
                >
                  ← Back to tools
                </Link>
                <button
                  onClick={() => setFullScreen(true)}
                  className="flex items-center gap-2 rounded-lg border border-(--border) px-3 py-2 text-sm text-muted transition-colors hover:border-(--accent) hover:text-(--accent)"
                  title="Full screen"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  Full screen
                </button>
              </div>
              <h1 className="mb-2 text-3xl font-bold sm:text-4xl">API Tester</h1>
              <p className="text-muted">
                Test REST APIs with zero config. Send requests, inspect responses,
                copy as cURL or fetch. Supports all HTTP methods, auth, and body types.
              </p>
            </div>

            <ApiTester />
          </main>
        </>
      )}

      {fullScreen && (
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background p-4">
          <button
            onClick={() => setFullScreen(false)}
            className="absolute right-4 top-4 z-50 flex items-center gap-2 rounded-lg border border-(--border) bg-(--card) px-3 py-2 text-sm text-muted transition-colors hover:border-(--accent) hover:text-(--accent)"
            title="Exit full screen"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9m-9 9v4.5m0-4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 6v4.5m0-4.5h-4.5m4.5 0L15 15" />
            </svg>
            Exit full screen
          </button>
          <div className="flex min-h-0 flex-1 pt-12">
            <ApiTester fullScreen />
          </div>
        </div>
      )}
    </div>
  );
}
