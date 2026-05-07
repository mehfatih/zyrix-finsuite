// ================================================================
// DataTable — reusable admin table with selection + sort + density
// ================================================================
import React, { useMemo, useState } from "react";

export default function DataTable({
  columns = [],          // [{ key, label, render?, align?, width?, sortable? }]
  rows = [],
  rowKey = "id",
  onRowClick,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  density = "comfortable",
  empty = "No data",
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    return [...rows].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av === bv) return 0;
      const cmp = av > bv ? 1 : -1;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir]);

  const onSort = (col) => {
    if (!col.sortable) return;
    if (sortKey === col.key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(col.key); setSortDir("asc"); }
  };

  const allSelected = rows.length > 0 && selectedIds.length === rows.length;
  const toggleAll = () => onSelectionChange?.(allSelected ? [] : rows.map((r) => r[rowKey]));
  const toggle = (id) => {
    const set = new Set(selectedIds);
    set.has(id) ? set.delete(id) : set.add(id);
    onSelectionChange?.([...set]);
  };

  const padY = density === "compact" ? 6 : 12;

  return (
    <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 12 }}>
          <thead>
            <tr style={{ background: "#F8FAFC" }}>
              {selectable && (
                <th style={{ padding: `${padY}px 14px`, textAlign: "start", borderBottom: "1px solid #E2E8F0", width: 40 }}>
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="select all" />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => onSort(col)}
                  style={{
                    padding: `${padY}px 14px`,
                    textAlign: col.align || "start",
                    color: "#64748B",
                    fontWeight: 800,
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    borderBottom: "1px solid #E2E8F0",
                    cursor: col.sortable ? "pointer" : "default",
                    width: col.width,
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    <span style={{ marginInlineStart: 6 }}>{sortDir === "asc" ? "▲" : "▼"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} style={{ padding: 40, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
                  {empty}
                </td>
              </tr>
            ) : (
              sorted.map((row, i) => (
                <tr
                  key={row[rowKey] ?? i}
                  onClick={() => onRowClick?.(row)}
                  style={{
                    background: i % 2 ? "#F8FAFC" : "#fff",
                    cursor: onRowClick ? "pointer" : "default",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#EFF6FF"}
                  onMouseLeave={(e) => e.currentTarget.style.background = i % 2 ? "#F8FAFC" : "#fff"}
                >
                  {selectable && (
                    <td onClick={(e) => e.stopPropagation()} style={{ padding: `${padY}px 14px`, borderBottom: "1px solid #F1F5F9" }}>
                      <input type="checkbox" checked={selectedIds.includes(row[rowKey])} onChange={() => toggle(row[rowKey])} aria-label={`select ${row[rowKey]}`} />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        padding: `${padY}px 14px`,
                        textAlign: col.align || "start",
                        borderBottom: "1px solid #F1F5F9",
                        color: "#0F172A",
                        whiteSpace: col.nowrap ? "nowrap" : "normal",
                        fontFamily: col.mono ? "ui-monospace, monospace" : "inherit",
                      }}
                    >
                      {col.render ? col.render(row) : row[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
