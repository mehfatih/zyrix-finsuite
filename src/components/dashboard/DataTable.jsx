// ================================================================
// DataTable — sortable, filterable, paginated. Palette-aware.
// columns: [{ key, label, render?, sortable?, align?, width? }]
// rows:    [{ ...data }] — must contain a unique key (id) field if rowKey not provided
// ================================================================
import React, { useMemo, useState } from "react";
import { resolvePalette } from "../../utils/dashboardPalette";
import EmptyState from "./EmptyState";

export default function DataTable({
  columns = [],
  rows = [],
  rowKey,
  palette,
  paletteIdx = 0,
  searchable = true,
  pageSize = 10,
  onRowClick,
  emptyTitle = "No data",
  emptyDescription = "",
  emptyIcon = "📋",
  initialSort,
  searchPlaceholder = "Search…",
  caption,
}) {
  const p = resolvePalette(palette, paletteIdx);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(initialSort || null); // { key, dir }
  const [page, setPage] = useState(1);

  const getKey = (r, i) => (rowKey ? r[rowKey] : r.id ?? i);

  const filtered = useMemo(() => {
    if (!query) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) =>
      columns.some((c) => {
        const v = r[c.key];
        return v != null && String(v).toLowerCase().includes(q);
      })
    );
  }, [rows, query, columns]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return sort.dir === "asc" ? av - bv : bv - av;
      }
      return sort.dir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return copy;
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (key) => {
    setSort((s) => {
      if (!s || s.key !== key) return { key, dir: "asc" };
      if (s.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        border: `1px solid ${p.base}1A`,
        boxShadow: "0 1px 3px rgba(0,0,0,.04)",
        overflow: "hidden",
      }}
    >
      {(searchable || caption) && (
        <div
          style={{
            padding: "12px 16px",
            borderBottom: `1px solid ${p.base}15`,
            background: p.bg,
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {caption && (
            <div style={{ flex: 1, minWidth: 0, color: p.dark, fontWeight: 700, fontSize: 14 }}>
              {caption}
            </div>
          )}
          {searchable && (
            <input
              type="search"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: `1px solid ${p.base}30`,
                background: "#fff",
                fontSize: 13,
                minWidth: 200,
                outline: "none",
              }}
              aria-label="search"
            />
          )}
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#fff", borderBottom: `1.5px solid ${p.base}15` }}>
              {columns.map((c) => {
                const active = sort?.key === c.key;
                return (
                  <th
                    key={c.key}
                    onClick={c.sortable ? () => toggleSort(c.key) : undefined}
                    style={{
                      textAlign: c.align || "left",
                      padding: "12px 14px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#475569",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      cursor: c.sortable ? "pointer" : "default",
                      userSelect: "none",
                      whiteSpace: "nowrap",
                      width: c.width,
                    }}
                    aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                  >
                    {c.label}
                    {c.sortable && (
                      <span style={{ marginLeft: 6, opacity: active ? 1 : 0.3, color: active ? p.base : "#94A3B8" }}>
                        {active ? (sort.dir === "asc" ? "▲" : "▼") : "↕"}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    icon={emptyIcon}
                    palette={p}
                    size="compact"
                  />
                </td>
              </tr>
            ) : (
              pageRows.map((row, i) => (
                <tr
                  key={getKey(row, i)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  style={{
                    borderBottom: "1px solid #F1F5F9",
                    cursor: onRowClick ? "pointer" : "default",
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = p.bg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      style={{
                        textAlign: c.align || "left",
                        padding: "12px 14px",
                        color: "#0F172A",
                        fontWeight: 500,
                      }}
                    >
                      {c.render ? c.render(row[c.key], row) : row[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sorted.length > pageSize && (
        <div
          style={{
            padding: "10px 16px",
            borderTop: `1px solid ${p.base}10`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#fff",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 12, color: "#64748B" }}>
            {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sorted.length)} / {sorted.length}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <PagerBtn p={p} disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>
              ‹
            </PagerBtn>
            <span
              style={{
                padding: "6px 12px",
                fontSize: 12,
                color: p.dark,
                fontWeight: 700,
                lineHeight: "20px",
              }}
            >
              {safePage} / {totalPages}
            </span>
            <PagerBtn p={p} disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)}>
              ›
            </PagerBtn>
          </div>
        </div>
      )}
    </div>
  );
}

function PagerBtn({ children, onClick, disabled, p }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        border: `1px solid ${p.base}30`,
        background: disabled ? "#F8FAFC" : "#fff",
        color: disabled ? "#CBD5E1" : p.dark,
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: 14,
        fontWeight: 700,
      }}
    >
      {children}
    </button>
  );
}
