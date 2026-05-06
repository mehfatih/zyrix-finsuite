import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getCountryProfile,
  SUPPORTED_COUNTRIES,
  VISIBLE_COUNTRIES,
  DEFAULT_COUNTRY,
  DEFAULT_BY_LANG,
  isCountryVisible,
  getDefaultForLang,
} from "../utils/countryProfiles.js";

// ================================================================
// useCountry — Country detection + override system
//
// Detection priority (Hybrid: auto + manual override):
//   1. localStorage "zyrix_country" — explicit user choice
//   2. IP geolocation via ipapi.co (free, 1000 req/day)
//   3. Default fallback: TR
//
// Provides:
//   { country, profile, setCountry, isLoading, source }
//
// Where:
//   country  : "TR" | "SA" | "AE" | ... (uppercase code)
//   profile  : full country object from countryProfiles.js
//   setCountry(code) : explicit override (saves to localStorage)
//   isLoading: true while IP geolocation is in flight
//   source   : "user" | "ip" | "fallback"
//
// Usage:
//   const { country, profile, setCountry } = useCountry();
//   const taxRate = profile.tax.rate; // e.g. 20 for TR, 15 for SA
//   const phonePh = profile.phonePlaceholder;
//   const regions = profile.regions;
// ================================================================

const STORAGE_KEY = "zyrix_country";
const SOURCE_KEY  = "zyrix_country_source";

// Free IP geolocation. ~1000 requests per day per IP, no API key needed.
const IP_API_URL = "https://ipwho.is/";

const CountryContext = createContext({
  country: DEFAULT_COUNTRY,
  profile: getCountryProfile(DEFAULT_COUNTRY),
  setCountry: () => {},
  isLoading: false,
  source: "fallback",
});

export function CountryProvider({ children }) {
  // Step 1: synchronous initial state from localStorage (no flash)
  // Soft launch: only restore if the stored country is currently visible.
  // If user previously chose a now-hidden country, fall back to lang-default.
  const [country, setCountryState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && isCountryVisible(stored)) {
        return stored.toUpperCase();
      }
      // Hidden or invalid -> use lang-aware default
      const lang =
        (typeof document !== "undefined" && document.documentElement.lang) ||
        localStorage.getItem("zyrix_lang") ||
        "TR";
      return getDefaultForLang(lang.toUpperCase());
    } catch (e) {}
    return DEFAULT_COUNTRY;
  });

  const [source, setSource] = useState(() => {
    try {
      const storedCountry = localStorage.getItem(STORAGE_KEY);
      const storedSource = localStorage.getItem(SOURCE_KEY);
      if (storedCountry && storedSource) return storedSource;
    } catch (e) {}
    return "fallback";
  });

  const [isLoading, setIsLoading] = useState(false);

  // Step 2: if no stored country, do async IP detection
  useEffect(() => {
    let stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch (e) {}

    // If user already chose a VISIBLE country, never override it.
    if (stored && isCountryVisible(stored)) {
      return;
    }

    // Otherwise, attempt IP detection
    let cancelled = false;
    setIsLoading(true);

    fetch(IP_API_URL, { method: "GET", cache: "no-store" })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (cancelled || !data) {
          setIsLoading(false);
          return;
        }
        const detectedCode = (data.country_code || data.country || "").toUpperCase();
        if (detectedCode && isCountryVisible(detectedCode)) {
          // Detected country IS in our soft-launch visible list -> use it
          setCountryState(detectedCode);
          setSource("ip");
          try {
            localStorage.setItem(STORAGE_KEY, detectedCode);
            localStorage.setItem(SOURCE_KEY, "ip");
          } catch (e) {}
        } else if (detectedCode && SUPPORTED_COUNTRIES.indexOf(detectedCode) !== -1) {
          // Detected country has a profile but is hidden during soft launch
          // -> stay on lang-default (already set in initial state). Don't persist.
          console.info("[useCountry] detected hidden country:", detectedCode, "- keeping lang-default");
        } else if (detectedCode) {
          // No profile for this country at all
          console.info("[useCountry] detected unsupported country:", detectedCode);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        // Network/CORS/etc error. Stay on default. Don't persist.
        if (!cancelled) {
          console.warn("[useCountry] IP detection failed:", err && err.message);
          setIsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []); // run once

  // Manual override
  const setCountry = (code) => {
    if (!code) return;
    const upper = String(code).toUpperCase();
    if (SUPPORTED_COUNTRIES.indexOf(upper) === -1) {
      console.warn("[useCountry] unsupported country code:", code);
      return;
    }
    setCountryState(upper);
    setSource("user");
    try {
      localStorage.setItem(STORAGE_KEY, upper);
      localStorage.setItem(SOURCE_KEY, "user");
    } catch (e) {}
  };

  const profile = getCountryProfile(country);

  const value = {
    country,
    profile,
    setCountry,
    isLoading,
    source,
  };

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  return useContext(CountryContext);
}

export default useCountry;
