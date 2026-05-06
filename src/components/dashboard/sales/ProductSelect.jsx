// ================================================================
// ProductSelect — autocomplete picker that supports free-text entry
// ================================================================
import React, { useState } from "react";
import { getMarketPalette } from "../../../utils/dashboardPalette";

export default function ProductSelect({
  products = [],
  value = "",
  onChange,
  onPriceSuggest,
  placeholder = "Product or service…",
}) {
  const p = getMarketPalette();
  const [open, setOpen] = useState(false);
  const matches = !value
    ? products.slice(0, 6)
    : products
        .filter((pr) => String(pr.name || "").toLowerCase().includes(value.toLowerCase()))
        .slice(0, 6);

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "8px 10px",
          borderRadius: 8,
          border: `1px solid ${p.base}25`,
          background: "#fff",
          fontSize: 13,
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      {open && matches.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 2px)",
            left: 0,
            right: 0,
            background: "#fff",
            borderRadius: 8,
            border: `1px solid ${p.base}25`,
            boxShadow: `0 6px 18px ${p.base}25`,
            zIndex: 30,
            maxHeight: 220,
            overflowY: "auto",
          }}
        >
          {matches.map((pr, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(pr.name);
                if (onPriceSuggest && pr.price) onPriceSuggest(pr.price);
                setOpen(false);
              }}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                padding: "8px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                textAlign: "start",
                fontSize: 12,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = p.bg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ color: "#0F172A", fontWeight: 600 }}>{pr.name}</span>
              {pr.price != null && (
                <span style={{ color: p.dark, fontFamily: "monospace", fontSize: 11 }}>
                  ₺{Number(pr.price).toLocaleString()}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
