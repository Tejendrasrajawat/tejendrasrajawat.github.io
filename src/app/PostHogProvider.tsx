"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

const STORAGE_KEY = "devkit_user_id";

const ADJECTIVES = [
  "swift", "curious", "brave", "gentle", "clever", "bold", "calm", "eager",
  "happy", "keen", "lucky", "nimble", "proud", "quick", "silent", "warm",
];

const ANIMALS = [
  "fox", "otter", "owl", "panda", "raven", "wolf", "bear", "deer",
  "lynx", "hawk", "seal", "cub", "hare", "mink", "elk", "jay",
];

function generateReadableId(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `devkit_${adj}_${animal}_${suffix}`;
}

function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "";
  try {
    let userId = localStorage.getItem(STORAGE_KEY);
    if (!userId) {
      userId = generateReadableId();
      localStorage.setItem(STORAGE_KEY, userId);
    }
    return userId;
  } catch {
    return generateReadableId();
  }
}

if (typeof window !== "undefined") {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
  if (key) {
    posthog.init(key, {
      api_host: host,
      person_profiles: "identified_only",
      capture_pageview: false,
    });
    const userId = getOrCreateUserId();
    if (userId) {
      posthog.identify(userId, { source: "anonymous" });
    }
  }
}

function PostHogPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      posthog.capture("$pageview", { $current_url: window.location.href });
    }
  }, [pathname]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  );
}
