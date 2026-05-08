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
//   2. Timezone-based detection (Intl.DateTimeFormat) — offline, no 3p call
//   3. Default fallback: TR (or lang-default)
//
// Why timezone, not IP:
//   The previous implementation hit ipwho.is, which now returns 403 from many
//   client networks and dumps a "Failed to load resource" line into every
//   visitor's console. Timezone resolution is built into the browser, runs
//   instantly, and is accurate enough for a soft-launch country chooser.
//
// Provides:
//   { country, profile, setCountry, isLoading, source }
//
// Where:
//   country  : "TR" | "SA" | "AE" | ... (uppercase code)
//   profile  : full country object from countryProfiles.js
//   setCountry(code) : explicit override (saves to localStorage)
//   isLoading: kept for API compat — always false now
//   source   : "user" | "tz" | "fallback"
// ================================================================

const STORAGE_KEY = "zyrix_country";
const SOURCE_KEY  = "zyrix_country_source";

// Map IANA timezone -> ISO country code. Covers the soft-launch markets;
// anything else falls through to the lang-default.
const TZ_TO_COUNTRY = {
  "Europe/Istanbul":         "TR",
  "Turkey":                  "TR",
  "Asia/Riyadh":             "SA",
  "Asia/Dubai":              "AE",
  "Asia/Abu_Dhabi":          "AE",
  "Asia/Qatar":              "QA",
  "Asia/Bahrain":            "BH",
  "Asia/Kuwait":             "KW",
  "Asia/Muscat":             "OM",
  "Asia/Baghdad":            "IQ",
  "Asia/Amman":              "JO",
  "Asia/Beirut":             "LB",
  "Asia/Damascus":           "SY",
  "Africa/Cairo":            "EG",
  "Africa/Casablanca":       "MA",
  "Africa/Algiers":          "DZ",
  "Africa/Tunis":            "TN",
  "Africa/Tripoli":          "LY",
};

function detectFromTimezone() {
  try {
    const tz =
      (typeof Intl !== "undefined" &&
        Intl.DateTimeFormat &&
        Intl.DateTimeFormat().resolvedOptions().timeZone) ||
      "";
    if (!tz) return null;
    return TZ_TO_COUNTRY[tz] || null;
  } catch (e) {
    return null;
  }
}

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

  const [isLoading] = useState(false);

  // Step 2: if no stored country, run synchronous timezone detection (no network).
  useEffect(() => {
    let stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch (e) {}

    // If user already chose a VISIBLE country, never override it.
    if (stored && isCountryVisible(stored)) return;

    const detectedCode = detectFromTimezone();
    if (!detectedCode) return; // unrecognized tz — keep lang-default

    if (isCountryVisible(detectedCode)) {
      setCountryState(detectedCode);
      setSource("tz");
      try {
        localStorage.setItem(STORAGE_KEY, detectedCode);
        localStorage.setItem(SOURCE_KEY, "tz");
      } catch (e) {}
    }
    // If detected but hidden during soft launch, stay on lang-default.
    // Intentionally silent — no console noise for normal visitors.
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
