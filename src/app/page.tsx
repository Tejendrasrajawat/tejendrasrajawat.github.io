import Link from "next/link";

export default function Home() {
  const tools = [
    {
      icon: "⚡",
      name: "API Tester",
      description: "Test REST, GraphQL, and webhook endpoints with zero config.",
      href: "/api-tester/",
    },
    {
      icon: "{}",
      name: "JSON Formatter",
      description: "Beautify, minify, and validate JSON in milliseconds.",
      href: "/json-formatter/",
    },
    {
      icon: ".*",
      name: "Regex Builder",
      description: "Visual regex constructor with live matching preview.",
      href: null,
    },
    {
      icon: "64",
      name: "Base64 Encode",
      description: "Encode and decode Base64, URL-safe, and hex strings.",
      href: null,
    },
    {
      icon: "🔐",
      name: "JWT Debugger",
      description: "Decode and verify JWTs with header and payload inspection.",
      href: null,
    },
    {
      icon: "📋",
      name: "Diff Checker",
      description: "Side-by-side text and code comparison with syntax highlight.",
      href: "/diff-checker/",
    },
    {
      icon: "📦",
      name: "Cron Parser",
      description: "Validate cron expressions and see next run times.",
      href: null,
    },
    {
      icon: "🔗",
      name: "URL Parser",
      description: "Parse, encode, and decode URLs with query string support.",
      href: null,
    },
  ];

  const features = [
    {
      title: "No signup required",
      description: "Start using tools instantly. No account, no friction.",
    },
    {
      title: "Runs in your browser",
      description: "Your data never leaves your machine. Privacy-first by design.",
    },
    {
      title: "Keyboard-first",
      description: "Built for power users. Shortcuts for everything.",
    },
  ];

  return (
    <div className="min-h-screen bg-background bg-grid">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-(--border) bg-background/80 backdrop-blur-xl">
        <nav
          className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"
          aria-label="Main navigation"
        >
          <a
            href="#"
            className="font-mono text-xl font-semibold text-foreground transition-colors hover:text-(--accent)"
          >
            DevKit
          </a>
          <div className="flex items-center gap-6">
            <a
              href="#tools"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              Tools
            </a>
            <a
              href="#features"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#get-started"
              className="rounded-lg bg-(--accent) px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-(--accent-hover)"
            >
              Get Started
            </a>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section
          className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:py-40"
          aria-labelledby="hero-heading"
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 font-mono text-sm text-(--accent)">
              Built for developers, by developers
            </p>
            <h1
              id="hero-heading"
              className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl"
            >
              Developer tools that{" "}
              <span className="text-(--accent)">just work</span>
            </h1>
            <p className="mb-10 text-lg text-muted sm:text-xl">
              API testing, JSON formatting, regex builders, and 20+ essential
              utilities. Free, fast, and designed for the terminal generation.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#get-started"
                className="glow-accent w-full rounded-xl bg-(--accent) px-8 py-4 text-center font-semibold text-background transition-all hover:bg-(--accent-hover) sm:w-auto"
              >
                Start building →
              </a>
              <a
                href="#tools"
                className="w-full rounded-xl border border-(--border) px-8 py-4 text-center font-medium transition-colors hover:border-(--accent) hover:bg-(--accent-muted) sm:w-auto"
              >
                Browse tools
              </a>
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <section
          id="tools"
          className="mx-auto max-w-6xl px-6 py-20"
          aria-labelledby="tools-heading"
        >
          <div className="mb-16 text-center">
            <h2
              id="tools-heading"
              className="mb-4 text-3xl font-bold sm:text-4xl"
            >
              Everything you need, nothing you don&apos;t
            </h2>
            <p className="mx-auto max-w-2xl text-muted">
              Essential dev utilities at your fingertips. No bloat, no
              distractions.
            </p>
          </div>
          <ul
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            role="list"
          >
            {tools.map((tool) => {
              const cardContent = (
                <article
                  className="group rounded-xl border border-(--border) bg-(--card) p-6 transition-all hover:border-(--accent)/50 hover:bg-(--card-hover)"
                  aria-labelledby={`tool-${tool.name.replace(/\s/g, "-")}`}
                >
                  <span
                    className="mb-3 block font-mono text-2xl text-(--accent)"
                    aria-hidden
                  >
                    {tool.icon}
                  </span>
                  <h3
                    id={`tool-${tool.name.replace(/\s/g, "-")}`}
                    className="mb-2 font-semibold"
                  >
                    {tool.name}
                  </h3>
                  <p className="text-sm text-muted">{tool.description}</p>
                </article>
              );
              return (
                <li key={tool.name}>
                  {tool.href ? (
                    <Link href={tool.href} className="block">
                      {cardContent}
                    </Link>
                  ) : (
                    cardContent
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Features */}
        <section
          id="features"
          className="border-t border-(--border) bg-(--card) py-20"
          aria-labelledby="features-heading"
        >
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-16 text-center">
              <h2
                id="features-heading"
                className="mb-4 text-3xl font-bold sm:text-4xl"
              >
                Built for how you work
              </h2>
              <p className="mx-auto max-w-2xl text-muted">
                No account walls. No data collection. Just tools that respect
                your workflow.
              </p>
            </div>
            <ul
              className="grid gap-8 md:grid-cols-3"
              role="list"
            >
              {features.map((feature) => (
                <li key={feature.title} className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-(--accent-muted) text-(--accent)">
                    <span className="text-xl">✓</span>
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-muted">{feature.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Social Proof */}
        <section
          className="py-20"
          aria-labelledby="trust-heading"
        >
          <div className="mx-auto max-w-6xl px-6">
            <div className="rounded-2xl border border-(--border) bg-(--card) p-8 sm:p-12">
              <h2
                id="trust-heading"
                className="sr-only"
              >
                Trusted by developers
              </h2>
              <blockquote className="text-center">
                <p className="mb-6 text-xl font-medium sm:text-2xl">
                  &ldquo;Finally, a dev tools site that doesn&apos;t feel like
                  it was designed in 2010. Fast, clean, and actually useful.&rdquo;
                </p>
                <footer>
                  <cite className="not-italic text-muted">
                    — Developers who ship
                  </cite>
                </footer>
              </blockquote>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-muted">
                <span className="font-mono text-sm">20+ tools</span>
                <span className="font-mono text-sm">0 signups</span>
                <span className="font-mono text-sm">100% free</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section
          id="get-started"
          className="border-t border-(--border) py-24"
          aria-labelledby="cta-heading"
        >
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2
              id="cta-heading"
              className="mb-4 text-3xl font-bold sm:text-4xl"
            >
              Ready to ship faster?
            </h2>
            <p className="mb-8 text-lg text-muted">
              No signup. No credit card. Just open the tools and start building.
            </p>
            <a
              href="#"
              className="glow-accent inline-block rounded-xl bg-(--accent) px-10 py-4 font-semibold text-background transition-all hover:bg-(--accent-hover)"
            >
              Launch DevKit →
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-(--border) py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <p className="font-mono text-sm text-muted">DevKit © 2025</p>
          <div className="flex gap-6">
            <a
              href="#tools"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              Tools
            </a>
            <a
              href="#features"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              Features
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
