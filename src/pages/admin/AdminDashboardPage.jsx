// ================================================================
// /admin/dashboard — Main admin home: company-wide pulse
// ================================================================
import React from "react";
import { useOutletContext, Link } from "react-router-dom";
import AdminKpiCard from "../../components/admin/AdminKpiCard";
import { ADMIN_BRAND, TRUST_BLUE, CRITICAL_RED, ADMIN_INDIGO } from "../../utils/admin/adminPalette";

const SHORTCUTS = [
  { to: "/admin/customers",          icon: "👥", label: "Customers",          palette: "indigo" },
  { to: "/admin/revenue",            icon: "💰", label: "Revenue Dashboard",  palette: "money"  },
  { to: "/admin/ops/tickets",        icon: "🎫", label: "Support Queue",      palette: "trust"  },
  { to: "/admin/compliance/audit",   icon: "📜", label: "Audit Log",          palette: "indigo" },
  { to: "/admin/system/health",      icon: "❤️", label: "System Health",      palette: "success" },
  { to: "/admin/system/flags",       icon: "🚩", label: "Feature Flags",      palette: "amber"  },
  { to: "/admin/marketing/leads",    icon: "🪝", label: "Leads",              palette: "rose"   },
  { to: "/admin/musavir/partners",   icon: "🤝", label: "Mali Müşavir",       palette: "purple" },
];

const PALETTES = {
  indigo:  ADMIN_INDIGO,
  trust:   TRUST_BLUE,
  money:   { bg: "#DEFAF6", base: "#14B8A6", dark: "#115E59" },
  success: { bg: "#DCFCE7", base: "#10B981", dark: "#047857" },
  amber:   { bg: "#FFF8E5", base: "#F59E0B", dark: "#B45309" },
  rose:    { bg: "#FFE4E6", base: "#F43F5E", dark: "#9F1239" },
  purple:  { bg: "#F3EFFF", base: "#6C3AFF", dark: "#4C1FA8" },
};

export default function AdminDashboardPage() {
  const { admin } = useOutletContext() || {};
  const brand = ADMIN_BRAND;

  // Fake live metrics — backend will replace with real /api/admin/metrics
  const kpis = [
    { label: "Total customers",  value: "1,247",   delta: 8.4,   icon: "👥", palette: ADMIN_INDIGO },
    { label: "MRR",              value: "₺412K",   delta: 12.1,  icon: "💰", palette: PALETTES.money },
    { label: "Active trials",    value: "84",      delta: 23.0,  icon: "🚀", palette: PALETTES.amber },
    { label: "Open tickets",     value: "32",      delta: -14.3, icon: "🎫", palette: TRUST_BLUE },
    { label: "Churn (30d)",      value: "2.1%",    delta: -0.6,  icon: "📉", palette: CRITICAL_RED },
    { label: "NPS",              value: "67",      delta: 4.0,   icon: "⭐", palette: PALETTES.success },
    { label: "Failed payments",  value: "7",       delta: 16.7,  icon: "⚠",  palette: CRITICAL_RED },
    { label: "System uptime",    value: "99.98%",  delta: 0.02,  icon: "❤️", palette: PALETTES.success },
  ];

  const twoFAOn = !!admin?.twoFactorEnabled;

  return (
    <div style={{ padding: "32px 28px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
          Welcome back{admin?.fullName ? `, ${admin.fullName.split(" ")[0]}` : ""}
        </h1>
        <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
          Operations Center · {new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {!twoFAOn && (
        <div
          role="status"
          style={{
            marginBottom: 22,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "14px 18px",
            background: "linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%)",
            border: "1.5px solid #FCD34D",
            borderRadius: 14,
            boxShadow: "0 2px 8px rgba(245,158,11,0.15)",
            flexWrap: "wrap",
          }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "#FFFFFF", border: "1px solid #FDE68A",
            display: "grid", placeItems: "center", fontSize: 22,
            flexShrink: 0,
          }}>🔐</div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#92400E", marginBottom: 2 }}>
              Recommended: Enable two-factor authentication
            </div>
            <div style={{ fontSize: 12, color: "#78350F", lineHeight: 1.5 }}>
              Adds a 6-digit code at sign-in so a stolen password can't get in. Takes about 2 minutes.
            </div>
          </div>
          <Link
            to="/admin/settings/security"
            style={{
              padding: "10px 16px",
              background: "#0F172A",
              color: "#fff",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.04em",
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(15,23,42,0.25)",
              whiteSpace: "nowrap",
            }}
          >
            Set up now →
          </Link>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 28 }}>
        {kpis.map((k) => <AdminKpiCard key={k.label} {...k} />)}
      </div>

      <h2 style={{ fontSize: 12, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 14px" }}>
        Quick access
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 28 }}>
        {SHORTCUTS.map((s) => {
          const p = PALETTES[s.palette] || PALETTES.indigo;
          return (
            <Link
              key={s.to}
              to={s.to}
              style={{
                background: "#fff",
                border: `1.5px solid ${p.base}30`,
                borderRadius: 14,
                padding: 18,
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 12,
                transition: "all .15s",
                boxShadow: "0 2px 6px rgba(15,23,42,0.04)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 18px ${p.base}25`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 6px rgba(15,23,42,0.04)"; }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 10, background: p.bg, color: p.dark, display: "grid", placeItems: "center", fontSize: 22 }}>
                {s.icon}
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: p.dark }}>{s.label}</div>
            </Link>
          );
        })}
      </div>

      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 24, boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
        <h2 style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", margin: "0 0 14px" }}>Recent admin activity</h2>
        {[
          { time: "2 min ago",  action: "subscription.refund",   admin: "Mehmet Fatih", target: "Customer #1287",  severity: "WARNING" },
          { time: "14 min ago", action: "customer.archive",      admin: "Mehmet Fatih", target: "Customer #1156",  severity: "WARNING" },
          { time: "1 h ago",    action: "feature_flag.toggle",   admin: "Mehmet Fatih", target: "ai_co_founder",   severity: "INFO" },
          { time: "3 h ago",    action: "admin.login.success",   admin: "Mehmet Fatih", target: "—",                severity: "INFO" },
          { time: "5 h ago",    action: "coupon.create",         admin: "Mehmet Fatih", target: "SUMMER25",         severity: "INFO" },
        ].map((row, i) => {
          const sev = row.severity === "WARNING" ? PALETTES.amber : row.severity === "CRITICAL" ? CRITICAL_RED : TRUST_BLUE;
          return (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: i < 4 ? "1px solid #F1F5F9" : "none" }}>
              <span style={{ fontSize: 11, color: "#94A3B8", fontFamily: "ui-monospace, monospace", whiteSpace: "nowrap" }}>{row.time}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis" }}>
                <code style={{ background: "#F1F5F9", padding: "1px 6px", borderRadius: 4, fontSize: 11 }}>{row.action}</code> {row.target}
              </span>
              <span style={{ fontSize: 11, color: "#64748B" }}>{row.admin}</span>
              <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 999, background: sev.bg, color: sev.dark, textTransform: "uppercase", letterSpacing: "0.06em" }}>{row.severity}</span>
            </div>
          );
        })}
        <div style={{ marginTop: 14, textAlign: "center" }}>
          <Link to="/admin/compliance/audit" style={{ fontSize: 12, color: brand.dark, textDecoration: "none", fontWeight: 700, borderBottom: `1px dashed ${brand.dark}50` }}>
            See full audit log →
          </Link>
        </div>
      </div>
    </div>
  );
}
