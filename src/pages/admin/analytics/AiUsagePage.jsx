// ================================================================
// /admin/analytics/ai-usage — Sprint D-10.
// Surfaces ChatMessage token aggregations shipped in D-8.
// Backed by /api/admin/ai-usage/* endpoints (B3).
// Admin palette + inline styles (matches /admin/ops/email-engagement).
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { ADMIN_BRAND } from "../../../utils/admin/adminPalette";
import {
  getAiUsageSummary,
  getAiUsageDaily,
  getAiUsageTopMerchants,
  getAiUsageLatency
} from "../../../api/admin/aiUsage";

const RANGES = [
  { key: 7,  label: "Last 7 days" },
  { key: 14, label: "Last 14 days" },
  { key: 30, label: "Last 30 days" },
  { key: 90, label: "Last 90 days" }
];

function isoDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function fmtUsd(n) {
  if (n === null || n === undefined) return "—";
  return `$${Number(n).toFixed(4)}`;
}

function fmtMs(n) {
  if (n === null || n === undefined) return "—";
  return `${Number(n).toLocaleString()} ms`;
}

function fmtNum(n) {
  if (n === null || n === undefined) return "—";
  return Number(n).toLocaleString();
}

export default function AiUsagePage() {
  const brand = ADMIN_BRAND;
  const [days, setDays]         = useState(14);
  const [summary, setSummary]   = useState(null);
  const [daily, setDaily]       = useState([]);
  const [top, setTop]           = useState([]);
  const [latency, setLatency]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const window = useMemo(() => ({ from: isoDaysAgo(days) }), [days]);

  const reload = () => {
    setLoading(true); setError(null);
    Promise.all([
      getAiUsageSummary(window),
      getAiUsageDaily(window),
      getAiUsageTopMerchants({ ...window, limit: 10 }),
      getAiUsageLatency(window)
    ])
      .then(([s, d, t, l]) => {
        setSummary(s);
        setDaily(d?.rows || []);
        setTop(t?.rows || []);
        setLatency(l || null);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  useEffect(reload, [days]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ padding: "32px 28px", maxWidth: 1200, margin: "0 auto" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: `linear-gradient(135deg, ${brand.bg}, ${brand.base}30)`,
          color: brand.dark,
          display: "grid", placeItems: "center",
          fontSize: 26, border: `1px solid ${brand.base}25`
        }}>🧠</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.01em" }}>
            AI Usage
          </h1>
          <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
            {summary
              ? `${summary.windowDays} days · ${fmtNum(summary.messages)} messages across ${fmtNum(summary.merchants)} merchants`
              : "Loading…"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setDays(r.key)}
              aria-pressed={days === r.key}
              style={{
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 600,
                color: days === r.key ? "#FFF" : brand.dark,
                background: days === r.key ? brand.dark : "#FFF",
                border: `1px solid ${brand.base}40`,
                borderRadius: 8,
                cursor: "pointer"
              }}
            >{r.label}</button>
          ))}
        </div>
      </header>

      {error && (
        <div role="alert" style={{
          padding: "12px 16px",
          background: "#FEF2F2",
          color: "#991B1B",
          border: "1px solid #FECACA",
          borderRadius: 10,
          marginBottom: 20,
          fontSize: 14
        }}>
          {String(error.message || error)}
        </div>
      )}

      {/* Summary KPIs */}
      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 14,
        marginBottom: 28
      }}>
        <KpiTile label="Total messages"  value={fmtNum(summary?.messages)}        loading={loading} />
        <KpiTile label="Merchants"       value={fmtNum(summary?.merchants)}       loading={loading} />
        <KpiTile label="Total tokens"    value={fmtNum(summary?.totalTokens)}     loading={loading} />
        <KpiTile label="Input tokens"    value={fmtNum(summary?.inputTokens)}     loading={loading} />
        <KpiTile label="Output tokens"   value={fmtNum(summary?.outputTokens)}    loading={loading} />
        <KpiTile label="Cost forecast"   value={fmtUsd(summary?.costUsdForecast)} loading={loading} />
        <KpiTile label="Avg latency"     value={fmtMs(summary?.avgLatencyMs)}     loading={loading} />
        <KpiTile label="P95 latency"     value={fmtMs(latency?.p95)}              loading={loading} />
      </section>

      {/* Top merchants */}
      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: "0 0 12px" }}>
          Top merchants by tokens
        </h2>
        <div style={tableWrapStyle()}>
          <table style={tableStyle()}>
            <thead>
              <tr>
                <th style={thStyle()}>Merchant</th>
                <th style={thStyle({ align: "right" })}>Messages</th>
                <th style={thStyle({ align: "right" })}>Total tokens</th>
                <th style={thStyle({ align: "right" })}>Input</th>
                <th style={thStyle({ align: "right" })}>Output</th>
                <th style={thStyle({ align: "right" })}>Cost</th>
              </tr>
            </thead>
            <tbody>
              {top.length === 0 && !loading && (
                <tr><td colSpan={6} style={emptyRowStyle()}>No AI usage in this window.</td></tr>
              )}
              {top.map((r) => (
                <tr key={r.merchantId} style={{ borderTop: "1px solid #E5E7EB" }}>
                  <td style={tdStyle()}>
                    <div style={{ fontWeight: 600 }}>{r.merchantName || r.merchantId}</div>
                    {r.email && <div style={{ fontSize: 12, color: "#64748B" }}>{r.email}</div>}
                  </td>
                  <td style={tdStyle({ align: "right", mono: true })}>{fmtNum(r.messages)}</td>
                  <td style={tdStyle({ align: "right", mono: true, weight: 600 })}>{fmtNum(r.totalTokens)}</td>
                  <td style={tdStyle({ align: "right", mono: true })}>{fmtNum(r.inputTokens)}</td>
                  <td style={tdStyle({ align: "right", mono: true })}>{fmtNum(r.outputTokens)}</td>
                  <td style={tdStyle({ align: "right", mono: true })}>{fmtUsd(r.costUsd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Daily roll-up */}
      <section>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: "0 0 12px" }}>
          Daily activity
        </h2>
        <div style={tableWrapStyle()}>
          <table style={tableStyle()}>
            <thead>
              <tr>
                <th style={thStyle()}>Day</th>
                <th style={thStyle()}>Merchant</th>
                <th style={thStyle({ align: "right" })}>Messages</th>
                <th style={thStyle({ align: "right" })}>Total tokens</th>
                <th style={thStyle({ align: "right" })}>Avg latency</th>
                <th style={thStyle({ align: "right" })}>Cost</th>
              </tr>
            </thead>
            <tbody>
              {daily.length === 0 && !loading && (
                <tr><td colSpan={6} style={emptyRowStyle()}>No daily activity in this window.</td></tr>
              )}
              {daily.slice(0, 50).map((r, i) => (
                <tr key={`${r.day}-${r.merchantId}-${i}`} style={{ borderTop: "1px solid #E5E7EB" }}>
                  <td style={tdStyle({ mono: true })}>{r.day}</td>
                  <td style={tdStyle()}>{r.merchantId.slice(0, 12)}…</td>
                  <td style={tdStyle({ align: "right", mono: true })}>{fmtNum(r.messages)}</td>
                  <td style={tdStyle({ align: "right", mono: true })}>{fmtNum(r.totalTokens)}</td>
                  <td style={tdStyle({ align: "right", mono: true })}>{fmtMs(r.avgLatencyMs)}</td>
                  <td style={tdStyle({ align: "right", mono: true })}>{fmtUsd(r.costUsd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {daily.length > 50 && (
            <div style={{ padding: "12px 16px", fontSize: 12, color: "#64748B", textAlign: "center" }}>
              Showing 50 of {daily.length} rows.
            </div>
          )}
        </div>
      </section>

      <p style={{ marginTop: 28, fontSize: 12, color: "#94A3B8", textAlign: "center" }}>
        Cost forecast at Gemini 2.0 Flash public pricing ($0.075 / 1M input · $0.30 / 1M output).
        Actual billing comes from Google Cloud Console.
      </p>
    </div>
  );
}

function KpiTile({ label, value, loading }) {
  return (
    <div style={{
      padding: 16,
      background: "#FFF",
      border: "1px solid #E5E7EB",
      borderRadius: 12,
      display: "flex",
      flexDirection: "column",
      gap: 6
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </div>
      <div style={{
        fontSize: 22,
        fontWeight: 700,
        color: "#0F172A",
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        opacity: loading ? 0.4 : 1
      }}>
        {loading ? "…" : value}
      </div>
    </div>
  );
}

const tableWrapStyle = () => ({
  background: "#FFF",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  overflow: "hidden"
});

const tableStyle = () => ({
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 13
});

const thStyle = ({ align = "left" } = {}) => ({
  padding: "10px 14px",
  textAlign: align,
  fontSize: 11,
  fontWeight: 700,
  color: "#64748B",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  background: "#F8FAFC",
  borderBottom: "1px solid #E5E7EB"
});

const tdStyle = ({ align = "left", mono = false, weight = 400 } = {}) => ({
  padding: "10px 14px",
  textAlign: align,
  fontSize: 13,
  fontWeight: weight,
  color: "#0F172A",
  fontFamily: mono ? "'JetBrains Mono', ui-monospace, monospace" : "inherit",
  whiteSpace: "nowrap"
});

const emptyRowStyle = () => ({
  padding: "20px 14px",
  textAlign: "center",
  color: "#94A3B8",
  fontSize: 13
});
