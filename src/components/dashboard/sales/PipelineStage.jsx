// ================================================================
// PipelineStage — kanban column with drop zone
// ================================================================
import React, { useState } from "react";
import { resolvePalette } from "../../../utils/dashboardPalette";
import DealCard from "./DealCard";

export default function PipelineStage({
  stageId,
  label,
  palette,
  deals = [],
  onDrop,
  onCardClick,
  onCardDragStart,
  emptyText = "Drop deals here",
}) {
  const p = resolvePalette(palette);
  const [over, setOver] = useState(false);
  const totalValue = deals.reduce((s, d) => s + (Number(d.value) || 0), 0);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (onDrop) onDrop(stageId, e);
      }}
      style={{
        background: over ? p.bg : `${p.base}08`,
        borderRadius: 14,
        padding: 12,
        border: over ? `2px dashed ${p.base}` : `1px solid ${p.base}25`,
        minWidth: 260,
        flex: "1 1 240px",
        display: "flex",
        flexDirection: "column",
        transition: "background .2s, border-color .2s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          padding: "0 4px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: p.base,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 12, fontWeight: 800, color: p.dark, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {label}
          </span>
          <span
            style={{
              background: `${p.base}20`,
              color: p.dark,
              padding: "1px 7px",
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            {deals.length}
          </span>
        </div>
        <span style={{ fontSize: 11, color: p.dark, fontFamily: "monospace", fontWeight: 600 }}>
          ₺{totalValue.toLocaleString()}
        </span>
      </div>

      <div style={{ flex: 1, minHeight: 60 }}>
        {deals.length === 0 ? (
          <div
            style={{
              padding: "24px 12px",
              textAlign: "center",
              color: "#94A3B8",
              fontSize: 12,
              fontStyle: "italic",
            }}
          >
            {emptyText}
          </div>
        ) : (
          deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              palette={p}
              onClick={() => onCardClick && onCardClick(deal)}
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", deal.id);
                if (onCardDragStart) onCardDragStart(deal);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
