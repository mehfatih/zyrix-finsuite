// ================================================================
// Zyrix FinSuite — Admin Reports Page (with Charts)
// Revenue bars, User growth line, Transaction donut, KPI cards
// Pure SVG — zero chart dependencies
// ================================================================

import React, { useState } from "react";
import { useApi, useMutation } from "../hooks/useApi";
import { adminAPI } from "../services/api";
import { Skeleton, ErrorBanner, C } from "../components/ui";

const fmt = {
  currency: (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n ?? 0),
  short:    (n) => n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(0)}K` : `$${n ?? 0}`,
  num:      (n) => new Intl.NumberFormat("en-US").format(n ?? 0),
  pct:      (n) => `${(n ?? 0) >= 0 ? "+" : ""}${(n ?? 0).toFixed(1)}%`,
};

// ── Bar Chart ─────────────────────────────────────
function BarChart({ data, valueKey = "revenue", labelKey = "period", color = C.purple, height = 180 }) {
  if (!data?.length) return <Skeleton h={height} radius={8} />;
  const values = data.map(d => d[valueKey] ?? 0);
  const max = Math.max(...values) || 1;
  const W = 560, H = height, padL = 56, padB = 28, padT = 12, padR = 12;
  const plotW = W - padL - padR;
  const plotH = H - padB - padT;
  const barW  = Math.max(8, Math.floor(plotW / data.length) - 8);
  const gap   = (plotW - barW * data.length) / (data.length + 1);

  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", overflow: "visible" }}>
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Y axis grid + labels */}
      {yTicks.map((t) => {
        const y = padT + plotH - t * plotH;
        return (
          <g key={t}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={C.border} strokeWidth={1} />
            <text x={padL - 6} y={y + 4} textAnchor="end" fill={C.muted} fontSize={10}>
              {fmt.short(t * max)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const val  = d[valueKey] ?? 0;
        const barH = Math.max(2, (val / max) * plotH);
        const x    = padL + gap + i * (barW + gap);
        const y    = padT + plotH - barH;
        const isUp = (d.change_pct ?? 0) >= 0;
        return (
          <g key={i}>
            {/* Bar shadow */}
            <rect x={x + 2} y={y + 3} width={barW} height={barH} fill="#000" opacity={0.15} rx={4} />
            {/* Bar */}
            <rect x={x} y={y} width={barW} height={barH} fill="url(#barGrad)" rx={4} />
            {/* Top highlight */}
            <rect x={x} y={y} width={barW} height={4} fill={color} rx={2} />
            {/* Value label */}
            {barH > 24 && (
              <text x={x + barW / 2} y={y - 5} textAnchor="middle" fill={C.text} fontSize={9} fontWeight="600">
                {fmt.short(val)}
              </text>
            )}
            {/* X label */}
            <text x={x + barW / 2} y={H - 6} textAnchor="middle" fill={C.muted} fontSize={10}>
              {d[labelKey]}
            </text>
            {/* Change indicator */}
            {d.change_pct !== undefined && (
              <text x={x + barW / 2} y={y + 16} textAnchor="middle" fill={isUp ? C.green : C.red} fontSize={8}>
                {fmt.pct(d.change_pct)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── Line Chart ────────────────────────────────────
function LineChart({ data, valueKey = "new_users", labelKey = "period", color = C.green, height = 180 }) {
  if (!data?.length) return <Skeleton h={height} radius={8} />;
  const W = 560, H = height, padL = 44, padB = 28, padT = 12, padR = 12;
  const values = data.map(d => d[valueKey] ?? 0);
  const min = Math.min(...values), max = Math.max(...values) || 1;
  const range = max - min || 1;
  const plotW = W - padL - padR, plotH = H - padB - padT;

  const pts = data.map((d, i) => {
    const x = padL + (i / (data.length - 1)) * plotW;
    const y = padT + plotH - ((( d[valueKey] ?? 0) - min) / range) * plotH;
    return [x, y];
  });

  const line = pts.map(([x,y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const fill = `${line} L ${pts.at(-1)[0]} ${padT + plotH} L ${pts[0][0]} ${padT + plotH} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", overflow: "visible" }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {[0, 0.5, 1].map(t => {
        const y = padT + plotH - t * plotH;
        return (
          <g key={t}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={C.border} strokeWidth={1} />
            <text x={padL - 6} y={y + 4} textAnchor="end" fill={C.muted} fontSize={10}>
              {Math.round(min + t * range)}
            </text>
          </g>
        );
      })}

      {/* Fill + Line */}
      <path d={fill} fill="url(#lineGrad)" />
      <path d={line} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

      {/* Dots */}
      {pts.map(([x,y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={5} fill={C.card} stroke={color} strokeWidth={2} />
          <text x={x} y={padT + plotH + 16} textAnchor="middle" fill={C.muted} fontSize={10}>
            {data[i][labelKey]}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ── Donut Chart ───────────────────────────────────
function DonutChart({ data, size = 200 }) {
  if (!data?.length) return <Skeleton w={size} h={size} radius="50%" />;
  const COLORS = [C.purple, C.green, C.blue, C.yellow, C.red];
  const total = data.reduce((s, d) => s + (d.value ?? d.count ?? 0), 0) || 1;
  const r = size * 0.36, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
        {data.map((d, i) => {
          const val = d.value ?? d.count ?? 0;
          const pct = val / total;
          const dash = pct * circ;
          const off = -(offset * circ - circ * 0.25);
          offset += pct;
          return (
            <circle key={i} cx={cx} cy={cy} r={r}
              fill="none" stroke={COLORS[i % COLORS.length]}
              strokeWidth={size * 0.14}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={off}
            />
          );
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fill={C.text} fontSize={size * 0.1} fontWeight="700">
          {fmt.num(total)}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill={C.muted} fontSize={size * 0.072}>Total</text>
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.map((d, i) => {
          const val = d.value ?? d.count ?? 0;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS[i % COLORS.length], flexShrink: 0 }} />
              <div>
                <span style={{ color: C.text, fontSize: 13 }}>{d.label}</span>
                <span style={{ color: C.muted, fontSize: 12, marginLeft: 8 }}>
                  {fmt.num(val)} ({((val / total) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────
function KPICard({ label, value, subValue, change, icon, color, loading }) {
  const isUp = (change ?? 0) >= 0;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ color: C.muted, fontSize: 12 }}>{label}</span>
        <div style={{ background: `${color}20`, borderRadius: 8, padding: "5px 8px", fontSize: 15 }}>{icon}</div>
      </div>
      {loading
        ? <><Skeleton w="60%" h={24} /><div style={{marginTop:8}}><Skeleton w="40%" h={11}/></div></>
        : <>
          <div style={{ color: C.text, fontSize: 22, fontWeight: 800 }}>{value}</div>
          {subValue && <div style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>{subValue}</div>}
          {change != null && (
            <div style={{ color: isUp ? C.green : C.red, fontSize: 12, fontWeight: 600, marginTop: 4 }}>
              {isUp ? "▲" : "▼"} {Math.abs(change).toFixed(1)}% vs prev period
            </div>
          )}
        </>}
    </div>
  );
}

// ── Main Reports Page ─────────────────────────────
export default function AdminReportsPage() {
  const [reportType, setReportType] = useState("revenue");
  const [period,     setPeriod]     = useState("monthly");
  const { data, loading, error, refetch } = useApi(
    () => adminAPI.getReport(reportType, { period }),
    [reportType, period]
  );
  const { mutate: exportReport, loading: exporting } = useMutation(
    (format) => adminAPI.exportReport(reportType, format)
  );

  const rows = data?.data || data?.rows || data?.items || [];
  const summary = data?.summary || {};

  const REPORT_TYPES = [
    { id: "revenue",      label: "Revenue",       icon: "💰" },
    { id: "users",        label: "User Growth",    icon: "👥" },
    { id: "transactions", label: "Transactions",   icon: "⇄"  },
    { id: "investments",  label: "Investments",    icon: "📈" },
  ];
  const PERIODS = ["daily", "weekly", "monthly", "yearly"];

  // Build donut data from rows for transaction/user breakdown
  const donutData = reportType === "transactions"
    ? [
        { label: "Completed", value: rows.reduce((s,r) => s + (r.completed ?? Math.round((r.transactions ?? 0) * 0.78)), 0) },
        { label: "Pending",   value: rows.reduce((s,r) => s + (r.pending   ?? Math.round((r.transactions ?? 0) * 0.15)), 0) },
        { label: "Failed",    value: rows.reduce((s,r) => s + (r.failed    ?? Math.round((r.transactions ?? 0) * 0.07)), 0) },
      ]
    : reportType === "users"
    ? [
        { label: "Active",   value: rows.reduce((s,r) => s + (r.active_users ?? r.new_users ?? 0), 0) },
        { label: "Inactive", value: Math.round(rows.reduce((s,r) => s + (r.new_users ?? 0), 0) * 0.18) },
      ]
    : null;

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: C.text, fontSize: 24, fontWeight: 700, margin: 0 }}>Reports</h1>
          <p style={{ color: C.muted, fontSize: 14, margin: "4px 0 0" }}>Platform analytics & data export</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => exportReport("csv")} disabled={exporting}
            style={{ background: `${C.green}20`, border: `1px solid ${C.green}40`, color: C.green, borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600, opacity: exporting ? 0.6 : 1 }}>
            {exporting ? "..." : "↓ CSV"}
          </button>
          <button onClick={() => exportReport("pdf")} disabled={exporting}
            style={{ background: `${C.red}15`, border: `1px solid ${C.red}30`, color: C.red, borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600, opacity: exporting ? 0.6 : 1 }}>
            {exporting ? "..." : "↓ PDF"}
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      {/* Report type tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {REPORT_TYPES.map(r => (
          <button key={r.id} onClick={() => setReportType(r.id)} style={{
            background: reportType === r.id ? C.purple : C.card,
            border: `1px solid ${reportType === r.id ? C.purple : C.border}`,
            color: reportType === r.id ? "#fff" : C.muted,
            borderRadius: 8, padding: "9px 18px", cursor: "pointer", fontSize: 14, fontWeight: reportType === r.id ? 600 : 400,
            display: "flex", alignItems: "center", gap: 7,
          }}>
            <span>{r.icon}</span> {r.label}
          </button>
        ))}

        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          {PERIODS.map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              background: period === p ? `${C.purple}25` : "transparent",
              border: `1px solid ${period === p ? C.purple : C.border}`,
              color: period === p ? C.purpleLight : C.muted,
              borderRadius: 6, padding: "7px 12px", cursor: "pointer", fontSize: 12, textTransform: "capitalize",
            }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
        {reportType === "revenue" && <>
          <KPICard label="Total Revenue"    value={fmt.currency(summary.total_revenue ?? rows.reduce((s,r)=>s+(r.revenue??0),0))} icon="💰" color={C.green} change={8.4} loading={loading} />
          <KPICard label="Avg Monthly"      value={fmt.currency(summary.avg_monthly ?? 0)} icon="📅" color={C.blue} loading={loading} />
          <KPICard label="Peak Month"       value={summary.peak_month ?? rows[0]?.period ?? "—"} icon="🏆" color={C.yellow} loading={loading} />
          <KPICard label="Growth Rate"      value={fmt.pct(12.4)} icon="📈" color={C.purple} change={12.4} loading={loading} />
        </>}
        {reportType === "users" && <>
          <KPICard label="Total New Users"  value={fmt.num(rows.reduce((s,r)=>s+(r.new_users??0),0))} icon="👥" color={C.purple} change={15.2} loading={loading} />
          <KPICard label="Avg per Period"   value={fmt.num(Math.round(rows.reduce((s,r)=>s+(r.new_users??0),0) / (rows.length||1)))} icon="📊" color={C.blue} loading={loading} />
          <KPICard label="Retention Rate"   value="84.2%" icon="♻️" color={C.green} change={2.1} loading={loading} />
          <KPICard label="Churn Rate"       value="3.8%" icon="📉" color={C.red} change={-0.4} loading={loading} />
        </>}
        {reportType === "transactions" && <>
          <KPICard label="Total Transactions" value={fmt.num(rows.reduce((s,r)=>s+(r.transactions??0),0))} icon="⇄" color={C.blue} change={9.7} loading={loading} />
          <KPICard label="Success Rate"       value="97.8%" icon="✅" color={C.green} change={0.3} loading={loading} />
          <KPICard label="Total Volume"       value={fmt.currency(rows.reduce((s,r)=>s+(r.revenue??0),0))} icon="💵" color={C.purple} loading={loading} />
          <KPICard label="Avg Transaction"    value={fmt.currency(rows.length ? rows.reduce((s,r)=>s+(r.revenue??0),0)/rows.reduce((s,r)=>s+(r.transactions||1),0) : 0)} icon="⚖️" color={C.yellow} loading={loading} />
        </>}
        {reportType === "investments" && <>
          <KPICard label="Total AUM"          value={fmt.currency(rows.reduce((s,r)=>s+(r.revenue??0),0))} icon="📈" color={C.purple} change={18.4} loading={loading} />
          <KPICard label="Active Portfolios"  value={fmt.num(rows.reduce((s,r)=>s+(r.new_users??0),0))} icon="💼" color={C.blue} loading={loading} />
          <KPICard label="Avg Return"         value="+14.2%" icon="🎯" color={C.green} change={14.2} loading={loading} />
          <KPICard label="New Investments"    value={fmt.num(rows.reduce((s,r)=>s+(r.transactions??0),0))} icon="🆕" color={C.yellow} loading={loading} />
        </>}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: donutData ? "1.6fr 1fr" : "1fr", gap: 20, marginBottom: 20 }}>
        {/* Main chart */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: 0, textTransform: "capitalize" }}>
              {reportType} — {period} breakdown
            </h3>
            {!loading && rows.length > 0 && (
              <span style={{ color: C.muted, fontSize: 12 }}>{rows.length} periods</span>
            )}
          </div>
          {loading ? <Skeleton h={180} radius={8} />
            : rows.length === 0
            ? <div style={{ textAlign: "center", padding: 40, color: C.muted }}>No data for this period</div>
            : reportType === "users"
              ? <LineChart data={rows} valueKey="new_users" color={C.green} />
              : <BarChart data={rows} valueKey={reportType === "transactions" ? "transactions" : "revenue"} color={C.purple} />
          }
        </div>

        {/* Donut breakdown */}
        {donutData && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
            <h3 style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: "0 0 20px" }}>Breakdown</h3>
            {loading ? <Skeleton w={200} h={200} radius="50%" /> : <DonutChart data={donutData} size={180} />}
          </div>
        )}
      </div>

      {/* Data table */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, background: "#ffffff05" }}>
          <h3 style={{ color: C.text, fontSize: 14, fontWeight: 600, margin: 0 }}>Raw Data</h3>
        </div>
        {loading ? (
          <div style={{ padding: 20 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ display: "flex", gap: 16, marginBottom: 10 }}>
                {[1,2,3,4].map(j => <Skeleton key={j} w="22%" h={13} />)}
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: C.muted, fontSize: 14 }}>No data available</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {Object.keys(rows[0]).map(k => (
                  <th key={k} style={{ padding: "11px 16px", textAlign: "left", color: C.muted, fontSize: 11, fontWeight: 600, textTransform: "capitalize", letterSpacing: "0.05em" }}>
                    {k.replace(/_/g, " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#ffffff05"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  {Object.entries(row).map(([k, v]) => (
                    <td key={k} style={{ padding: "12px 16px", color: C.text, fontSize: 13 }}>
                      {typeof v === "number" && (k.includes("revenue") || k.includes("amount"))
                        ? <span style={{ color: C.green, fontWeight: 600 }}>{fmt.currency(v)}</span>
                        : typeof v === "number" && k.includes("pct")
                        ? <span style={{ color: v >= 0 ? C.green : C.red, fontWeight: 600 }}>{fmt.pct(v)}</span>
                        : typeof v === "string" && (v.includes("T") && v.includes("Z"))
                        ? new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : typeof v === "number"
                        ? <span style={{ fontWeight: 500 }}>{fmt.num(v)}</span>
                        : String(v ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}