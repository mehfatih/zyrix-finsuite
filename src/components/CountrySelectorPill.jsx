import React, { useState, useRef, useEffect } from "react";
import { useI18n } from "../i18n/i18n.jsx";
import { useCountry } from "../hooks/useCountry.jsx";
import { COUNTRY_PROFILES, SUPPORTED_COUNTRIES } from "../utils/countryProfiles.js";

const C = {
  red: "#E30A17",
  redDeep: "#B30810",
  redBright: "#FF1A2A",
  ink: "#1B0F11",
  muted: "#5C4F52",
  hairline: "rgba(0,0,0,.08)",
};

const SA = {
  green: "#006C35",
  greenDeep: "#004D26",
  greenBright: "#00A050",
  ink: "#0B1A12",
  muted: "#4A5C50",
  hairline: "rgba(0,0,0,.08)",
};

/**
 * CountrySelectorPill — premium country/market selector.
 *
 * Props:
 *   mode: 'dark' | 'light' | 'card'  (default: 'light')
 *     - dark: for use over dark backgrounds (NavV2 over hero)
 *     - light: for use over light backgrounds (Footer, Pricing)
 *     - card: compact card style (Onboarding)
 *   compact?: boolean — even more compact (mobile)
 *
 * Uses the existing useCountry hook so it stays consistent with the
 * rest of the country-aware system (Footer, Pricing, etc.).
 */
export default function CountrySelectorPill({ mode = "light", compact = false }) {
  const { lang } = useI18n();
  const { country, setCountry } = useCountry();
  const isArabic = lang === "AR";
  const T = isArabic ? SA : C;

  const themeColor = isArabic ? SA.green : C.red;
  const themeDeep = isArabic ? SA.greenDeep : C.redDeep;

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const profile = COUNTRY_PROFILES[country] || COUNTRY_PROFILES.TR;
  const countryName = (profile.name && profile.name[lang]) || (profile.name && profile.name.EN) || country;

  // Theme variants
  const isDark = mode === "dark";
  const isCard = mode === "card";

  const pillBg = isDark
    ? "rgba(255,255,255,.10)"
    : "rgba(255,255,255,.78)";
  const pillBorder = isDark
    ? "1px solid rgba(255,255,255,.18)"
    : "1px solid " + T.hairline;
  const pillTextColor = isDark ? "rgba(255,255,255,.95)" : T.ink;
  const labelColor = isDark ? "rgba(255,255,255,.55)" : T.muted;

  const dropdownBg = isDark
    ? (isArabic ? "rgba(0,25,12,.96)" : "rgba(26,2,3,.96)")
    : "rgba(255,255,255,.98)";
  const dropdownBorder = isDark
    ? "1px solid rgba(255,255,255,.12)"
    : "1px solid " + T.hairline;
  const dropdownTextColor = isDark ? "rgba(255,255,255,.85)" : T.ink;

  const handlePick = (code, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setCountry(code);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: compact ? 7 : 10,
          padding: compact ? "7px 10px 7px 8px" : "7px 12px 7px 8px",
          borderRadius: 999,
          background: pillBg,
          border: pillBorder,
          color: pillTextColor,
          cursor: "pointer",
          backdropFilter: "blur(14px)",
          fontFamily: "inherit",
          transition: "all .2s",
          boxShadow: isDark ? "none" : "0 8px 22px rgba(58,5,9,.06)",
        }}
      >
        <span
          style={{
            width: compact ? 22 : 26,
            height: compact ? 22 : 26,
            borderRadius: 999,
            display: "grid",
            placeItems: "center",
            color: "#fff",
            fontSize: compact ? 11 : 12,
            fontWeight: 950,
            background: "linear-gradient(135deg, " + themeColor + ", " + themeDeep + ")",
            flexShrink: 0,
          }}
        >
          🌐
        </span>

        {!compact && (
          <div style={{ display: "grid", lineHeight: 1.05, textAlign: isArabic ? "right" : "left" }}>
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 950,
                letterSpacing: "1px",
                color: labelColor,
                textTransform: "uppercase",
              }}
            >
              {lang === "AR" ? "السوق" : lang === "TR" ? "Pazar" : "Market"}
            </span>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 950,
                color: pillTextColor,
                whiteSpace: "nowrap",
              }}
            >
              {countryName}
            </span>
          </div>
        )}

        <span
          style={{
            color: labelColor,
            fontSize: 9,
            marginLeft: 2,
            transition: "transform .2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▼
        </span>
      </button>

      <div
        style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          right: isArabic ? "auto" : 0,
          left: isArabic ? 0 : "auto",
          minWidth: 220,
          background: dropdownBg,
          border: dropdownBorder,
          backdropFilter: "blur(20px)",
          borderRadius: 14,
          padding: 6,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
          transform: open ? "translateY(0)" : "translateY(-6px)",
          transition: "all .25s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: isDark
            ? "0 18px 50px rgba(0,0,0,.5)"
            : "0 24px 64px rgba(58,5,9,.18)",
          zIndex: 110,
          maxHeight: 360,
          overflowY: "auto",
        }}
      >
        {SUPPORTED_COUNTRIES.map((code) => {
          const cp = COUNTRY_PROFILES[code];
          const cName = (cp.name && cp.name[lang]) || (cp.name && cp.name.EN) || code;
          const isActive = code === country;
          return (
            <button
              key={code}
              type="button"
              onClick={(e) => handlePick(code, e)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                padding: "9px 12px",
                background: isActive
                  ? "linear-gradient(135deg, " + themeColor + ", " + themeDeep + ")"
                  : "transparent",
                border: "none",
                color: isActive ? "#fff" : dropdownTextColor,
                fontSize: 12.5,
                fontWeight: 800,
                borderRadius: 9,
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: isArabic ? "right" : "left",
                gap: 10,
                transition: "all .15s",
              }}
            >
              <span style={{ flex: 1 }}>{cName}</span>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 950,
                  opacity: isActive ? 0.9 : 0.55,
                  letterSpacing: ".5px",
                }}
              >
                {cp.currency}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
