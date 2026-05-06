// ================================================================
// CustomerSelect — searchable customer picker with quick-add
// ================================================================
import React, { useMemo, useState } from "react";
import { getCustomerPalette } from "../../../utils/dashboardPalette";

export default function CustomerSelect({
  customers = [],
  value,
  onChange,
  onCreateNew,
  placeholder = "Search customer…",
}) {
  const p = getCustomerPalette();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query) return customers.slice(0, 10);
    const q = query.toLowerCase();
    return customers.filter((c) =>
      String(c.name || "").toLowerCase().includes(q) ||
      String(c.email || "").toLowerCase().includes(q) ||
      String(c.taxId || "").toLowerCase().includes(q)
    ).slice(0, 10);
  }, [customers, query]);

  const selected = customers.find((c) => c.id === value);

  return (
    <div style={{ position: "relative" }}>
      {selected ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 14px",
            background: p.bg,
            border: `1.5px solid ${p.base}30`,
            borderRadius: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: p.base,
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            {(selected.name || "?")[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: p.dark }}>{selected.name}</div>
            <div style={{ fontSize: 12, color: "#64748B", display: "flex", gap: 12, flexWrap: "wrap" }}>
              {selected.email && <span>{selected.email}</span>}
              {selected.taxId && <span>VKN {selected.taxId}</span>}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            style={{
              background: "transparent",
              border: `1px solid ${p.base}30`,
              color: p.dark,
              padding: "4px 10px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            Change
          </button>
        </div>
      ) : (
        <>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: `1.5px solid ${p.base}30`,
              background: "#fff",
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {open && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                right: 0,
                background: "#fff",
                borderRadius: 12,
                border: `1px solid ${p.base}25`,
                boxShadow: `0 8px 24px ${p.base}20`,
                maxHeight: 280,
                overflowY: "auto",
                zIndex: 30,
              }}
            >
              {filtered.length === 0 && (
                <div style={{ padding: "16px", textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
                  No matches
                </div>
              )}
              {filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    onChange(c.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    textAlign: "start",
                    borderBottom: `1px solid ${p.bg}`,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = p.bg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: `${p.base}25`,
                      color: p.dark,
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 800,
                      fontSize: 12,
                      flexShrink: 0,
                    }}
                  >
                    {(c.name || "?")[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>
                      {c.email || c.phone || "—"}
                    </div>
                  </div>
                </button>
              ))}
              {onCreateNew && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onCreateNew(query);
                    setQuery("");
                  }}
                  style={{
                    width: "100%",
                    background: p.bg,
                    border: "none",
                    padding: "10px 14px",
                    color: p.base,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    textAlign: "start",
                  }}
                >
                  + Add new customer{query ? `: "${query}"` : ""}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
