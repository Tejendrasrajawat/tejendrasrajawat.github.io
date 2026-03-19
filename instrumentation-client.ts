import posthog from "posthog-js";

// Use || so CI empty secrets ("") still fall back; PostHog keys are always phc_…
const key =
  process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() ||
  "phc_AzfY6u0HSlNg9bIX3fNMP9QRtX0a2nRSfML10GhUqTM";
const host =
  process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com";
const debug = typeof window !== "undefined" && window.location?.search?.includes("__posthog_debug=true");
if (key) {
  posthog.init(key, {
    api_host: host,
    person_profiles: "identified_only",
    capture_pageview: false,
    debug,
  });
}
