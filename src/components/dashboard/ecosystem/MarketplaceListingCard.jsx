// ================================================================
// MarketplaceListingCard — B2B listing tile (item, units, price)
// ================================================================
import React from "react";
import { getMarketPalette, paletteSequence } from "../../../utils/dashboardPalette";
import { fmtCurrency, fmtDate } from "../../../pages/dashboard/ecosystem/ecosystemApi";

export default function MarketplaceListingCard({ listing, idx = 0, onEdit, onRemove, t = (s) => s }) {
  const market = getMarketPalette();
  const palettes = paletteSequence(8, { exclude: ["wine"], startIdx: 4 });
  const p = palettes[idx % palettes.length] || market;
  return (
    <div
      style={{
        background: "#fff", border: `1.5px solid ${p.base}30`,
        borderRadius: 14, padding: 14, marginBottom: 10,
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginBottom: 8 }} className="mlc-row">
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{listing.item}</div>
          <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
            {t("b2b.listing.units", { n: listing.units })} · {listing.location} · {fmtDate(listing.postedAt)}
          </div>
        </div>
        {listing.priceTRY > 0 && (
          <div style={{ fontSize: 16, fontWeight: 900, color: p.dark, fontFamily: "monospace", textAlign: "end" }}>
            {fmtCurrency(listing.priceTRY)}
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
        {onEdit && <button type="button" onClick={() => onEdit(listing)} style={smBtn(p)}>Edit</button>}
        {onRemove && <button type="button" onClick={() => onRemove(listing)} style={smBtn({ bg: "#FFE4E6", base: "#F43F5E", dark: "#9F1239" }, "ghost")}>✗</button>}
      </div>
      <style>{`@media (max-width: 540px) { .mlc-row { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function smBtn(p, variant = "secondary") {
  if (variant === "ghost") {
    return { background: "transparent", color: p.dark, border: `1px solid ${p.base}30`, padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer" };
  }
  return { background: p.bg, color: p.dark, border: `1px solid ${p.base}40`, padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer" };
}
