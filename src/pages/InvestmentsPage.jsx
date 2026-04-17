// ================================================================
// Zyrix FinSuite — Investments Page (Customer)
// Full page: portfolio chart, holdings table, investment detail
// ================================================================

import React, { useState } from "react";
import { useApi } from "../hooks/useApi";
import { customerAPI } from "../services/api";

const C = {
  bg: "#0f1117", card: "#1a1d27", border: "#2a2d3e",
  purple: "#6C5DD3", purpleLight: "#8B7CF8",
  green: "#01B574", red: "#FF4560", yellow: "#FFB547", blue: "#3A86FF",
  text: "#FFFFFF", muted: "#8B8FA8",
};

const fmt = {
  currency: (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0),
  pct: (n) => `${(n ?? 0) >= 0 ? "+" : ""}${(n ?? 0).toFixed(2)}%`,
  short: (n) => n >= 1e6 ? `$${(n/1e6).toFixed(2)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${(n??0).toFixed(0)}`,
};

// ── Mini Sparkline (SVG) ──────────────────────────
function Sparkline({ data = [], color = C.green, width = 80, height = 30 }) {
  if (!data || data.length < 2) return <span style={{ color: C.muted, fontSize: 11 }}>—</span>;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} />
      <polyline fill={`${color}20`} stroke="none"
        points={`0,${height} ${pts} ${width},${height}`} />
    </svg>
  );
}

// ── Donut Chart (SVG) ─────────────────────────────
function DonutChart({ segments, size = 160 }) {
  const r = size * 0.38;
  const cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + (seg.value || 0), 0) || 1;

  let offset = 0;
  const arcs = segments.map((seg) => {
    const pct = seg.value / total;
    const dash = pct * circumference;
    const arc = { ...seg, dash, offset: circumference * offset, pct };
    offset += pct;
    return arc;
  });

  const COLORS = [C.purple, C.green, C.blue, C.yellow, C.red, "#FF6B6B", "#4ECDC4"];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {arcs.map((arc, i) => (
        <circle key={i} cx={cx} cy={cy} r={r}
          fill="none"
          stroke={arc.color || COLORS[i % COLORS.length]}
          strokeWidth={size * 0.12}
          strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
          strokeDashoffset={circumference * 0.25 - arc.offset * circumference / circumference}
          style={{ strokeDashoffset: -(arc.offset - circumference * 0.25) }}
        />
      ))}
      <text x={cx} y={cy - 6} textAnchor="middle" fill={C.text} fontSize={size * 0.1} fontWeight="700">
        {fmt.short(total)}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill={C.muted} fontSize={size * 0.07}>
        Total Value
      </text>
    </svg>
  );
}

// ── Bar Chart (SVG) ───────────────────────────────
function BarChart({ data = [], width = 400, height = 120 }) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.value)) || 1;
  const barW = Math.floor((width - 20) / data.length) - 4;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      {data.map((d, i) => {
        const barH = Math.max(2, (d.value / max) * (height - 24));
        const x = 10 + i * ((width - 20) / data.length);
        const isUp = d.change >= 0;
        return (
          <g key={i}>
            <rect x={x} y={height - 16 - barH} width={barW} height={barH}
              fill={isUp ? `${C.green}80` : `${C.red}80`} rx={3} />
            <rect x={x} y={height - 16 - barH} width={barW} height={3}
              fill={isUp ? C.green : C.red} rx={2} />
            <text x={x + barW / 2} y={height - 2} textAnchor="middle"
              fill={C.muted} fontSize={9}>{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Skeleton loader ───────────────────────────────
function Skeleton({ w = "100%", h = 16, radius = 6 }) {
  return (
    <div style={{ width: w, height: h, borderRadius: radius, background: `linear-gradient(90deg, ${C.border} 25%, #2e3245 50%, ${C.border} 75%)`, backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
  );
}

// ── Investment Row ────────────────────────────────
function InvestmentRow({ inv, onClick }) {
  const isUp = (inv.change_pct ?? inv.change ?? 0) >= 0;
  const sparkData = inv.price_history || inv.history || [];

  return (
    <tr onClick={() => onClick(inv)} style={{ cursor: "pointer", borderBottom: `1px solid ${C.border}` }}
      onMouseEnter={(e) => e.currentTarget.style.background = "#ffffff06"}
      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
      {/* Asset */}
      <td style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: `${C.purple}30`, borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: C.purpleLight, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
            {(inv.symbol || inv.name || "?").slice(0, 3).toUpperCase()}
          </div>
          <div>
            <div style={{ color: C.text, fontSize: 14, fontWeight: 500 }}>{inv.name || inv.symbol}</div>
            <div style={{ color: C.muted, fontSize: 11 }}>{inv.category || inv.type || inv.symbol}</div>
          </div>
        </div>
      </td>
      {/* Sparkline */}
      <td style={{ padding: "14px 16px" }}>
        <Sparkline data={sparkData} color={isUp ? C.green : C.red} />
      </td>
      {/* Price */}
      <td style={{ padding: "14px 16px" }}>
        <div style={{ color: C.text, fontSize: 14, fontWeight: 500 }}>{fmt.currency(inv.current_price ?? inv.price)}</div>
      </td>
      {/* Change */}
      <td style={{ padding: "14px 16px" }}>
        <span style={{ color: isUp ? C.green : C.red, fontSize: 13, fontWeight: 600 }}>
          {isUp ? "▲" : "▼"} {fmt.pct(inv.change_pct ?? inv.change)}
        </span>
      </td>
      {/* Value */}
      <td style={{ padding: "14px 16px" }}>
        <div style={{ color: C.text, fontSize: 14, fontWeight: 600 }}>{fmt.currency(inv.value ?? inv.current_value)}</div>
        <div style={{ color: C.muted, fontSize: 11 }}>{inv.quantity || inv.units} units</div>
      </td>
      {/* Allocation */}
      <td style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, background: C.border, borderRadius: 4, height: 6, overflow: "hidden" }}>
            <div style={{ width: `${Math.min(100, inv.allocation ?? 0)}%`, height: "100%", background: C.purple, borderRadius: 4 }} />
          </div>
          <span style={{ color: C.muted, fontSize: 12, minWidth: 32 }}>{(inv.allocation ?? 0).toFixed(1)}%</span>
        </div>
      </td>
    </tr>
  );
}

// ── Investment Detail Modal ───────────────────────
function InvestmentModal({ inv, onClose }) {
  if (!inv) return null;
  const isUp = (inv.change_pct ?? inv.change ?? 0) >= 0;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000b", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, width: "90%", maxWidth: 480 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ background: `${C.purple}30`, borderRadius: 10, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", color: C.purpleLight, fontWeight: 700 }}>
              {(inv.symbol || "?").slice(0, 3)}
            </div>
            <div>
              <div style={{ color: C.text, fontSize: 18, fontWeight: 700 }}>{inv.name}</div>
              <div style={{ color: C.muted, fontSize: 13 }}>{inv.symbol} · {inv.category}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: 22, cursor: "pointer" }}>×</button>
        </div>

        {/* Price hero */}
        <div style={{ background: "#ffffff06", borderRadius: 12, padding: 20, marginBottom: 16, textAlign: "center" }}>
          <div style={{ color: C.text, fontSize: 32, fontWeight: 800 }}>{fmt.currency(inv.current_price ?? inv.price)}</div>
          <div style={{ color: isUp ? C.green : C.red, fontSize: 15, fontWeight: 600, marginTop: 4 }}>
            {isUp ? "▲" : "▼"} {fmt.pct(inv.change_pct ?? inv.change)} today
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            ["Portfolio Value", fmt.currency(inv.value ?? inv.current_value)],
            ["Quantity", `${inv.quantity ?? inv.units ?? "—"} units`],
            ["Avg Buy Price", fmt.currency(inv.avg_buy_price ?? inv.cost_basis)],
            ["Total Return", fmt.currency((inv.value ?? 0) - (inv.cost ?? 0))],
            ["Allocation", `${(inv.allocation ?? 0).toFixed(1)}%`],
            ["Asset Type", inv.category ?? inv.type ?? "—"],
          ].map(([label, val]) => (
            <div key={label} style={{ background: "#ffffff05", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ color: C.muted, fontSize: 11, marginBottom: 4 }}>{label}</div>
              <div style={{ color: C.text, fontSize: 14, fontWeight: 600 }}>{val}</div>
            </div>
          ))}
        </div>

        {inv.price_history?.length > 1 && (
          <div>
            <div style={{ color: C.muted, fontSize: 12, marginBottom: 8 }}>Price History</div>
            <Sparkline data={inv.price_history} color={isUp ? C.green : C.red} width={420} height={60} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────
function EmptyInvestments() {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📈</div>
      <div style={{ color: C.text, fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No Investments Yet</div>
      <div style={{ color: C.muted, fontSize: 14, maxWidth: 300, margin: "0 auto" }}>
        Your investment portfolio will appear here once you start investing.
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────
export default function InvestmentsPage() {
  const { data: raw, loading, error, refetch } = useApi(() => customerAPI.getInvestments());
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("value");

  const investments = (raw?.data || raw?.items || raw || []).map((inv, i) => {
    // Inject fake allocation % if backend doesn't provide it
    if (!inv.allocation && raw) {
      const total = (raw?.data || raw?.items || raw || []).reduce((s, x) => s + (x.value ?? x.current_value ?? 0), 0) || 1;
      inv = { ...inv, allocation: ((inv.value ?? inv.current_value ?? 0) / total) * 100 };
    }
    return inv;
  });

  const categories = ["all", ...new Set(investments.map(i => i.category || i.type).filter(Boolean))];

  const filtered = investments
    .filter(inv => filter === "all" || (inv.category || inv.type) === filter)
    .sort((a, b) => {
      if (sortBy === "value") return (b.value ?? 0) - (a.value ?? 0);
      if (sortBy === "change") return ((b.change_pct ?? 0) - (a.change_pct ?? 0));
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      return 0;
    });

  const totalValue = investments.reduce((s, i) => s + (i.value ?? i.current_value ?? 0), 0);
  const totalReturn = investments.reduce((s, i) => s + ((i.value ?? 0) - (i.cost ?? i.cost_basis ?? 0)), 0);
  const topPerformer = [...investments].sort((a, b) => (b.change_pct ?? 0) - (a.change_pct ?? 0))[0];

  // Donut segments
  const donutSegments = investments.slice(0, 6).map(inv => ({
    label: inv.name || inv.symbol,
    value: inv.value ?? inv.current_value ?? 0,
  }));

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: C.text, fontSize: 24, fontWeight: 700, margin: 0 }}>Investments</h1>
          <p style={{ color: C.muted, fontSize: 14, margin: "4px 0 0" }}>Your portfolio at a glance</p>
        </div>
        <button onClick={refetch} style={{ background: `${C.purple}20`, border: `1px solid ${C.purple}`, color: C.purpleLight, borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div style={{ background: `${C.red}15`, border: `1px solid ${C.red}30`, borderRadius: 8, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: C.red, fontSize: 13 }}>⚠ {error}</span>
          <button onClick={refetch} style={{ color: C.purple, background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>Retry</button>
        </div>
      )}

      {/* Summary Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 200px", gap: 16, marginBottom: 24 }}>
        {loading ? (
          [1,2,3].map(i => (
            <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
              <Skeleton w="60%" h={12} />
              <div style={{ marginTop: 12 }}><Skeleton w="80%" h={24} /></div>
            </div>
          ))
        ) : (
          <>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ color: C.muted, fontSize: 12, marginBottom: 8 }}>Total Portfolio Value</div>
              <div style={{ color: C.text, fontSize: 26, fontWeight: 800 }}>{fmt.currency(totalValue)}</div>
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ color: C.muted, fontSize: 12, marginBottom: 8 }}>Total Return</div>
              <div style={{ color: totalReturn >= 0 ? C.green : C.red, fontSize: 26, fontWeight: 800 }}>
                {totalReturn >= 0 ? "+" : ""}{fmt.currency(totalReturn)}
              </div>
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ color: C.muted, fontSize: 12, marginBottom: 8 }}>Top Performer</div>
              {topPerformer ? (
                <>
                  <div style={{ color: C.text, fontSize: 15, fontWeight: 700 }}>{topPerformer.name || topPerformer.symbol}</div>
                  <div style={{ color: C.green, fontSize: 14, fontWeight: 600, marginTop: 2 }}>{fmt.pct(topPerformer.change_pct)}</div>
                </>
              ) : <div style={{ color: C.muted, fontSize: 14 }}>—</div>}
            </div>
            {/* Donut */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {donutSegments.length ? <DonutChart segments={donutSegments} size={140} /> : <span style={{ color: C.muted, fontSize: 13 }}>No data</span>}
            </div>
          </>
        )}
      </div>

      {/* Filters + Sort */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            style={{ background: filter === cat ? C.purple : C.card, border: `1px solid ${filter === cat ? C.purple : C.border}`, color: filter === cat ? "#fff" : C.muted, borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 13, textTransform: "capitalize" }}>
            {cat}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ color: C.muted, fontSize: 12 }}>Sort:</span>
          {["value", "change", "name"].map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              style={{ background: sortBy === s ? `${C.purple}20` : "transparent", border: `1px solid ${sortBy === s ? C.purple : C.border}`, color: sortBy === s ? C.purpleLight : C.muted, borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 12, textTransform: "capitalize" }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 24 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ display: "flex", gap: 16, marginBottom: 16, alignItems: "center" }}>
                <Skeleton w={36} h={36} radius={8} />
                <Skeleton w="20%" h={14} />
                <Skeleton w="12%" h={14} />
                <Skeleton w="10%" h={14} />
                <Skeleton w="15%" h={14} />
                <Skeleton w="18%" h={8} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyInvestments />
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}`, background: "#ffffff06" }}>
                {["Asset", "7D Chart", "Price", "Change", "Value", "Allocation"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: C.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv, i) => (
                <InvestmentRow key={inv.id || i} inv={inv} onClick={setSelected} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Legend for donut */}
      {!loading && donutSegments.length > 0 && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
          {donutSegments.map((s, i) => {
            const COLORS = [C.purple, C.green, C.blue, C.yellow, C.red, "#FF6B6B"];
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS[i % COLORS.length] }} />
                <span style={{ color: C.muted, fontSize: 12 }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      )}

      <InvestmentModal inv={selected} onClose={() => setSelected(null)} />

      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}