import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageview } from "../utils/analytics";

/**
 * ScrollToTop + analytics page-view tracker.
 * Runs on every route change so SPA navigations are reported to Plausible.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    trackPageview(`${pathname}${search}`);
  }, [pathname, search]);

  return null;
}
