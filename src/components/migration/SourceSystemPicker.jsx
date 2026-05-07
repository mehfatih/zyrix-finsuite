// ================================================================
// SourceSystemPicker — grid of source-system cards
// ================================================================
import React from "react";
import { getBrandPalette, getMarketPalette, getCustomerPalette, getAIPalette } from "../../utils/dashboardPalette";
import { SOURCE_SYSTEMS } from "../../utils/migration/parsers";

const BADGE_PALETTE = (brand, success, warn) => ({
  popular:     brand,
  recommended: success,
  beta:        warn,
});

export default function SourceSystemPicker({ selected, onSelect, lang = "tr", t = (s) => s }) {
  const brand = getBrandPalette(String(lang).toLowerCase());
  const market = getMarketPalette();
  const customer = getCustomerPalette();
  const ai = getAIPalette();
  const success = { bg: "#DCFCE7", base: "#10B981", dark: "#047857" };
  const warn = { bg: "#FFF8E5", base: "#F59E0B", dark: "#B45309" };
  const badges = BADGE_PALETTE(brand, success, warn);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
      {SOURCE_SYSTEMS.map((sys) => {
        const active = selected === sys.id;
        const badge = sys.badge ? badges[sys.badge] : null;
        return (
          <button
            key={sys.id}
            type="button"
            onClick={() => onSelect?.(sys.id)}
            aria-pressed={active}
            style={{
              background: active ? `linear-gradient(135deg, ${brand.bg}, #fff)` : "#fff",
              border: `1.5px solid ${active ? brand.base : "#E2E8F0"}`,
              borderRadius: 14,
              padding: 16,
              cursor: "pointer",
              textAlign: "start",
              transition: "all .15s",
              boxShadow: active ? `0 6px 18px ${brand.base}25` : "0 2px 6px rgba(15,23,42,0.04)",
              position: "relative",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: brand.bg, display: "grid", placeItems: "center", fontSize: 22 }}>
                {sys.logo}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{sys.name}</div>
              </div>
              {badge && (
                <span style={{ fontSize: 9, fontWeight: 800, color: badge.dark, background: badge.bg, padding: "3px 8px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {t(`source.badge.${sys.badge}`)}
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: "#64748B", lineHeight: 1.45 }}>{sys.description}</div>
          </button>
        );
      })}
    </div>
  );
}
