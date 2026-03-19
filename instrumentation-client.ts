import posthog from "posthog-js";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "hc_AzfY6u0HSlNg9bIX3fNMP9QRtX0a2nRSfML10GhUqTM";
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
const debug = typeof window !== "undefined" && window.location?.search?.includes("__posthog_debug=true");
if (key) {
  posthog.init(key, {
    api_host: host,
    person_profiles: "identified_only",
    capture_pageview: false,
    debug,
  });
}
