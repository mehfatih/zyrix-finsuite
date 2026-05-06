// ================================================================
// DealCard — pipeline kanban card with value, days-in-stage, owner
// ================================================================
import React from "react";
import { resolvePalette } from "../../../utils/dashboardPalette";

export default function DealCard({ deal, palette, onClick, draggable = true, onDragStart }) {
  const p = resolvePalette(palette);
  const days = deal.daysInStage || daysSince(deal.updatedAt || deal.createdAt);
  const warn = days > 14;

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: "12px 14px",
        marginBottom: 10,
        border: `1px solid ${p.base}25`,
        boxShadow: "0 1px 4px rgba(0,0,0,.04)",
        cursor: draggable ? "grab" : "pointer",
        transition: "transform .15s, box-shadow .15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 20px ${p.base}25`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.04)";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: `${p.base}25`,
            color: p.dark,
            display: "grid",
            placeItems: "center",
            fontSize: 12,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {(deal.customerName || deal.title || "?")[0].toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#0F172A",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {deal.title || deal.customerName || "Untitled"}
          </div>
          {deal.customerName && deal.title && (
            <div style={{ fontSize: 11, color: "#64748B" }}>{deal.customerName}</div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span
          style={{
            color: p.dark,
            fontWeight: 800,
            fontSize: 15,
            fontFamily: "monospace",
          }}
        >
          ₺{Number(deal.value || 0).toLocaleString()}
        </span>
        {deal.probability != null && (
          <span style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>
            {deal.probability}%
          </span>
        )}
      </div>

      {deal.probability != null && (
        <div style={{ height: 4, background: `${p.base}15`, borderRadius: 2, marginBottom: 8, overflow: "hidden" }}>
          <div
            style={{
              width: `${Math.min(100, Math.max(0, deal.probability))}%`,
              height: "100%",
              background: p.base,
            }}
          />
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 11,
          color: warn ? "#9F1239" : "#94A3B8",
          fontWeight: warn ? 700 : 500,
        }}
      >
        <span>{warn ? "⚠ " : ""}{days}d in stage</span>
        {deal.nextAction && (
          <span style={{ color: p.dark, fontStyle: "italic" }}>
            → {deal.nextAction}
          </span>
        )}
      </div>
    </div>
  );
}

function daysSince(d) {
  if (!d) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(d).getTime()) / 86400000));
}
