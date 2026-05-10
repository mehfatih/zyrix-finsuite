// ================================================================
// RegulatoryProvider — Sprint D-11 frontend regulatory context.
//
// Boot-fetches the merchant's geo-context (B.6 endpoint) and exposes:
//
//   const { profile, geo, language, country, mismatch, ready } = useRegulatory();
//
//   profile   — full COUNTRY_PROFILES[country] entry (frontend-only;
//               static rates from countryProfiles.js)
//   geo       — { ipCountry, registeredCountry, language, mismatch }
//   language  — merchant's stored language (from geo)
//   country   — merchant's registered country (from geo)
//   mismatch  — true when ipCountry !== registeredCountry; drives the
//               GeoMismatchBanner from B.12 (once-per-session)
//   ready     — false during the boot-fetch; true after geo + profile
//               are resolved
//
// Decoupling stays sacred: language and country are independent fields.
// The provider does NOT derive one from the other.
//
// Auth-required: only mounts the fetch when a customer token exists in
// localStorage. Unauthenticated routes (landing, login) skip the fetch
// and serve a default profile.
// ================================================================
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCountryProfile, DEFAULT_COUNTRY } from '../utils/countryProfiles.js';
import { getGeoContext } from '../api/v2/regulatory.js';

const RegulatoryContext = createContext(null);

const FALLBACK_GEO = {
  ipCountry:         null,
  registeredCountry: DEFAULT_COUNTRY,
  language:          'TR',
  mismatch:          false
};

function hasToken() {
  try {
    return Boolean(
      localStorage.getItem('zyrix_token') ||
      localStorage.getItem('customerToken') ||
      localStorage.getItem('token')
    );
  } catch {
    return false;
  }
}

export function RegulatoryProvider({ children }) {
  const [geo, setGeo]     = useState(FALLBACK_GEO);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hasToken()) {
      // Public routes — skip the fetch but keep ready=true so consumers
      // don't block on a request that will never happen.
      setGeo(FALLBACK_GEO);
      setReady(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await getGeoContext();
        if (cancelled) return;
        setGeo({
          ipCountry:         data?.ipCountry || null,
          registeredCountry: (data?.registeredCountry || DEFAULT_COUNTRY).toUpperCase(),
          language:          data?.language || 'TR',
          mismatch:          Boolean(data?.mismatch)
        });
      } catch (err) {
        // 401 / network failure — fall back to defaults so the dashboard
        // still renders. Banner/regulatory copy uses defaults.
        if (!cancelled) {
          setGeo(FALLBACK_GEO);
          setError(err);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const value = useMemo(() => {
    const country = geo.registeredCountry;
    const profile = getCountryProfile(country);
    return {
      profile,
      geo,
      language: geo.language,
      country,
      mismatch: geo.mismatch,
      ready,
      error
    };
  }, [geo, ready, error]);

  return (
    <RegulatoryContext.Provider value={value}>
      {children}
    </RegulatoryContext.Provider>
  );
}

export function useRegulatory() {
  const ctx = useContext(RegulatoryContext);
  if (!ctx) {
    // Defensive default for components rendered outside the provider
    // (e.g. public marketing pages reusing a dashboard primitive).
    return {
      profile:  getCountryProfile(DEFAULT_COUNTRY),
      geo:      FALLBACK_GEO,
      language: 'TR',
      country:  DEFAULT_COUNTRY,
      mismatch: false,
      ready:    true,
      error:    null
    };
  }
  return ctx;
}
