// ================================================================
// ArticleSearchBar — debounced search input with hero styling
// ================================================================
import React, { useEffect, useState } from "react";
import { getBrandPalette } from "../../utils/dashboardPalette";

export default function ArticleSearchBar({ onSearch, placeholder = "Search…", lang = "tr" }) {
  const brand = getBrandPalette(String(lang).toLowerCase());
  const [value, setValue] = useState("");

  useEffect(() => {
    const id = setTimeout(() => onSearch?.(value.trim()), 250);
    return () => clearTimeout(id);
  }, [value, onSearch]);

  return (
    <div style={{ position: "relative", maxWidth: 640, margin: "0 auto" }}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        style={{
          width: "100%",
          padding: "18px 20px 18px 56px",
          border: `1.5px solid ${brand.base}30`,
          borderRadius: 16,
          fontSize: 15,
          fontFamily: "inherit",
          background: "#fff",
          boxSizing: "border-box",
          boxShadow: `0 8px 30px ${brand.base}15`,
          transition: "all .2s",
        }}
      />
      <span style={{ position: "absolute", insetInlineStart: 20, top: 18, fontSize: 22, opacity: 0.5 }}>🔍</span>
    </div>
  );
}
