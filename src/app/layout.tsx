import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import { PostHogProvider } from "./PostHogProvider";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tejendrasrajawat.github.io"),
  title: {
    default: "DevKit — Developer Tools That Just Work",
    template: "%s | DevKit",
  },
  description:
    "The all-in-one toolkit for developers. API testing, JSON formatting, regex builders, base64 encoding, and 20+ essential dev tools. Free, fast, and built for the terminal generation.",
  keywords: [
    "developer tools",
    "API testing",
    "JSON formatter",
    "regex builder",
    "base64 encoder",
    "dev utilities",
    "developer productivity",
    "code tools",
  ],
  authors: [{ name: "DevKit" }],
  creator: "DevKit",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "DevKit — Developer Tools That Just Work",
    description:
      "The all-in-one toolkit for developers. API testing, JSON formatting, regex builders, and 20+ essential dev tools.",
    siteName: "DevKit",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevKit — Developer Tools That Just Work",
    description:
      "The all-in-one toolkit for developers. API testing, JSON formatting, regex builders, and 20+ essential dev tools.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "/",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "DevKit",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description:
      "The all-in-one toolkit for developers. API testing, JSON formatting, regex builders, base64 encoding, and 20+ essential dev tools.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <html
      lang="en"
      className={`${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
