// ================================================================
// /admin/ops/email-engagement — Sprint D-5.
// Live dashboard for the morning-brief send/open/click/bounce
// metrics. Backed by /api/admin/email-engagement endpoints.
// Inline styles + admin palette to match the rest of /admin/*.
// ================================================================
import React, { useEffect, useState } from "react";
import { ADMIN_BRAND } from "../../../utils/admin/adminPalette";
import {
  getEngagementStats,
  getBouncedList,
  reEnableSubscription
} from "../../../api/admin/emailEngagement";

export default function EmailEngagementPage() {
  const brand = ADMIN_BRAND;
  const [stats, setStats]       = useState(null);
  const [bounced, setBounced]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [acting, setActing]     = useState(null);

  const reload = () => {
    setLoading(true); setError(null);
    Promise.all([getEngagementStats(), getBouncedList()])
      .then(([s, b]) => { setStats(s); setBounced(b.items || []); })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  const reEnable = async (merchantId) => {
    setActing(merchantId); setError(null);
    try {
      await reEnableSubscription(merchantId);
      reload();
    } catch (err) {
      setError(err);
    } finally {
      setActing(null);
    }
  };

  return (
    <div style={{ padding: "32px 28px", maxWidth: 1100, margin: "0 auto" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: `linear-gradient(135deg, ${brand.bg}, ${brand.base}30)`,
          color: brand.dark,
          display: "grid", placeItems: "center",
          fontSize: 26, border: `1px solid ${brand.base}25`
        }}>📨</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.01em" }}>
            Morning Brief Engagement
          </h1>
          <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
            {stats ? `Last ${stats.windowDays} days · ${stats.totals.sent.toLocaleString()} sends` : "Loading…"}
          </div>
        </div>
        <button onClick={reload} style={ghostBtn} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {error && (
        <div style={errorBanner}>
          {String(error.message || error)}
        </div>
      )}

      {/* TOTALS GRID */}
      {stats && (
        <section style={{ marginBottom: 28 }}>
          <SectionTitle>Aggregate</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginTop: 10 }}>
            <Tile label="Sent"      value={stats.totals.sent.toLocaleString()} />
            <Tile label="Delivered" value={stats.totals.delivered.toLocaleString()} />
            <Tile label="Open rate" value={`${stats.totals.openRate}%`}     accent="#9D4EDD" />
            <Tile label="Click rate" value={`${stats.totals.clickRate}%`}    accent="#06A87E" />
            <Tile label="Bounce rate" value={`${stats.totals.bounceRate}%`}  accent="#FF3D5A" />
            <Tile label="Unsub rate"  value={`${stats.totals.unsubRate}%`}   accent="#FFB800" />
          </div>
        </section>
      )}

      {/* PER LOCALE */}
      {stats && Object.keys(stats.byLocale || {}).length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <SectionTitle>Per locale</SectionTitle>
          <Card>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <Th>Locale</Th>
                  <Th align="right">Sent</Th>
                  <Th align="right">Opened</Th>
                  <Th align="right">Clicked</Th>
                  <Th align="right">Bounced</Th>
                  <Th align="right">Open %</Th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.byLocale).map(([loc, v]) => (
                  <tr key={loc}>
                    <Td>{loc}</Td>
                    <Td align="right">{v.sent}</Td>
                    <Td align="right">{v.opened}</Td>
                    <Td align="right">{v.clicked}</Td>
                    <Td align="right">{v.bounced}</Td>
                    <Td align="right">{v.sent ? Math.round((v.opened / v.sent) * 100) : 0}%</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>
      )}

      {/* TOP SUBJECTS */}
      {stats && stats.topSubjects && stats.topSubjects.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <SectionTitle>Top subjects (min 5 sends)</SectionTitle>
          <Card>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <Th>Subject</Th>
                  <Th align="right">Sent</Th>
                  <Th align="right">Open %</Th>
                  <Th align="right">Click %</Th>
                </tr>
              </thead>
              <tbody>
                {stats.topSubjects.map((s, i) => (
                  <tr key={i}>
                    <Td><span style={{ fontFamily: "monospace", fontSize: 12 }}>{s.subject}</span></Td>
                    <Td align="right">{s.sent}</Td>
                    <Td align="right">{s.openRate}%</Td>
                    <Td align="right">{s.clickRate}%</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>
      )}

      {/* BOUNCED LIST */}
      <section>
        <SectionTitle>Bounced merchants</SectionTitle>
        <Card>
          {bounced.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "#64748B", fontSize: 13 }}>
              No bounced subscriptions.
            </div>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <Th>Merchant</Th>
                  <Th>Email</Th>
                  <Th align="right">Bounces</Th>
                  <Th align="right">Status</Th>
                  <Th align="right"></Th>
                </tr>
              </thead>
              <tbody>
                {bounced.map((b) => (
                  <tr key={b.merchantId}>
                    <Td><strong>{b.merchantName}</strong></Td>
                    <Td><span style={{ fontFamily: "monospace", fontSize: 12 }}>{b.email}</span></Td>
                    <Td align="right">{b.bounceCount}</Td>
                    <Td align="right">
                      <span style={{
                        fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 999,
                        background: b.autoDisabled ? "#FEE2E2" : "#FEF3C7",
                        color:      b.autoDisabled ? "#991B1B" : "#92400E"
                      }}>
                        {b.autoDisabled ? "AUTO-DISABLED" : "WARNING"}
                      </span>
                    </Td>
                    <Td align="right">
                      <button
                        type="button"
                        onClick={() => reEnable(b.merchantId)}
                        disabled={acting === b.merchantId || !b.autoDisabled}
                        style={{
                          ...ghostBtn,
                          opacity: (acting === b.merchantId || !b.autoDisabled) ? 0.4 : 1,
                          padding: "4px 10px",
                          fontSize: 11
                        }}
                      >
                        {acting === b.merchantId ? "…" : "Re-enable"}
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </section>
    </div>
  );
}

// ─── tiny inline components (kept local so the page stays self-contained) ───

function SectionTitle({ children }) {
  return (
    <h2 style={{
      fontSize: 11, fontWeight: 800, color: "#94A3B8",
      textTransform: "uppercase", letterSpacing: "0.10em",
      margin: 0
    }}>{children}</h2>
  );
}

function Card({ children }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #E2E8F0",
      borderRadius: 14,
      boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
      overflow: "hidden",
      marginTop: 10
    }}>{children}</div>
  );
}

function Tile({ label, value, accent }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #E2E8F0",
      borderRadius: 12,
      padding: "12px 14px",
      boxShadow: "0 2px 8px rgba(15,23,42,0.04)"
    }}>
      <div style={{
        fontSize: 10, fontWeight: 800, color: accent || "#64748B",
        textTransform: "uppercase", letterSpacing: "0.08em"
      }}>{label}</div>
      <div style={{
        marginTop: 6,
        fontSize: 22, fontWeight: 900, color: "#0F172A",
        letterSpacing: "-0.01em"
      }}>{value}</div>
    </div>
  );
}

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 13
};

function Th({ children, align = "left" }) {
  return (
    <th style={{
      padding: "10px 14px",
      textAlign: align,
      fontSize: 10, fontWeight: 800,
      color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em",
      borderBottom: "1px solid #F1F5F9"
    }}>{children}</th>
  );
}

function Td({ children, align = "left" }) {
  return (
    <td style={{
      padding: "10px 14px",
      textAlign: align,
      color: "#0F172A",
      borderBottom: "1px solid #F1F5F9"
    }}>{children}</td>
  );
}

const ghostBtn = {
  padding: "6px 12px",
  background: "#fff",
  color: "#0F172A",
  border: "1px solid #CBD5E1",
  borderRadius: 8,
  fontSize: 12, fontWeight: 700, letterSpacing: "0.02em",
  cursor: "pointer",
  fontFamily: "inherit"
};

const errorBanner = {
  marginBottom: 16,
  padding: "10px 14px",
  background: "#FEE2E2",
  color: "#991B1B",
  border: "1px solid #FCA5A5",
  borderRadius: 10,
  fontSize: 13
};
