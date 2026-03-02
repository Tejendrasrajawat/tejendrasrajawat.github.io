import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import posthog from "posthog-js";

/**
 * Fires a PostHog $pageview event on every SPA route change.
 * Place inside <BrowserRouter> so useLocation() works.
 */
function PostHogPageView() {
  const location = useLocation();

  useEffect(() => {
    if (posthog.__loaded) {
      posthog.capture("$pageview", {
        $current_url: window.location.href,
      });
    }
  }, [location.pathname, location.search]);

  return null;
}

export default PostHogPageView;
