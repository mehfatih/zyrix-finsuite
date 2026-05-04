import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop
 *
 * Listens to route changes (pathname) and scrolls window to top
 * on every navigation. Mount this once inside <BrowserRouter>
 * (above your <Routes>) so it covers every page transition.
 *
 * Renders nothing.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Use 'instant' so users don't see a smooth scroll animation
    // when navigating between unrelated pages.
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname]);

  return null;
}
