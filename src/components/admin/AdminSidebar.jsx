// ================================================================
// AdminSidebar — 9-cluster nav. Collapsible groups, permission-gated.
// ================================================================
import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ADMIN_BRAND, ADMIN_INDIGO, TRUST_BLUE, CRITICAL_RED, ROLE_PALETTE } from "../../utils/admin/adminPalette";
import { hasPermission, PERMISSIONS } from "../../utils/admin/permissions";

const GROUPS = [
  {
    id: "core",
    label: "Overview",
    icon: "🏠",
    items: [
      { to: "/admin/dashboard", icon: "📊", label: "Admin Dashboard", perm: null },
    ],
  },
  {
    id: "customers",
    label: "Customers",
    icon: "👥",
    items: [
      { to: "/admin/customers/overview",   icon: "📈", label: "Overview",         perm: PERMISSIONS.CUSTOMER_VIEW },
      { to: "/admin/customers",            icon: "📋", label: "Customers List",   perm: PERMISSIONS.CUSTOMER_VIEW },
      { to: "/admin/customers/archive",    icon: "🗃",  label: "Archive (Soft Delete)", perm: PERMISSIONS.CUSTOMER_ARCHIVE },
      { to: "/admin/customers/impersonate",icon: "🎭", label: "Impersonate",      perm: PERMISSIONS.CUSTOMER_IMPERSONATE },
      { to: "/admin/customers/bulk",       icon: "⚡", label: "Bulk Operations",  perm: PERMISSIONS.CUSTOMER_BULK },
      { to: "/admin/customers/merge",      icon: "🔀", label: "Account Merging",  perm: PERMISSIONS.MERGE_ACCOUNTS },
    ],
  },
  {
    id: "revenue",
    label: "Revenue",
    icon: "💰",
    items: [
      { to: "/admin/revenue/overview",         icon: "📈", label: "Overview",            perm: PERMISSIONS.REVENUE_VIEW },
      { to: "/admin/revenue",                  icon: "📊", label: "Revenue Dashboard",  perm: PERMISSIONS.REVENUE_VIEW },
      { to: "/admin/revenue/subscriptions",    icon: "🔁", label: "Subscriptions",      perm: PERMISSIONS.SUBSCRIPTION_VIEW },
      { to: "/admin/revenue/failed-payments",  icon: "⚠",  label: "Failed Payments",    perm: PERMISSIONS.SUBSCRIPTION_VIEW },
      { to: "/admin/revenue/coupons",          icon: "🎟",  label: "Coupons",            perm: PERMISSIONS.COUPON_VIEW },
      { to: "/admin/revenue/cohorts",          icon: "📐", label: "Cohort Analysis",    perm: PERMISSIONS.REVENUE_VIEW },
      { to: "/admin/revenue/refunds",          icon: "↩",  label: "Refunds",            perm: PERMISSIONS.SUBSCRIPTION_REFUND },
      { to: "/admin/revenue/invoice",          icon: "🧾", label: "Manual Invoice",     perm: PERMISSIONS.INVOICE_CREATE },
      { to: "/admin/revenue/dunning",          icon: "📨", label: "Dunning Rules",      perm: PERMISSIONS.DUNNING_CONFIGURE },
      { to: "/admin/revenue/forecast",         icon: "🔮", label: "Revenue Forecast",   perm: PERMISSIONS.REVENUE_FORECAST },
    ],
  },
  {
    id: "plans",
    label: "Plans",
    icon: "💎",
    items: [
      { to: "/admin/plans/overview",     icon: "📈", label: "Overview",         perm: PERMISSIONS.PLAN_VIEW },
      { to: "/admin/plans",              icon: "💎", label: "Plans Editor",     perm: PERMISSIONS.PLAN_VIEW },
      { to: "/admin/plans/features",     icon: "🎚", label: "Feature Toggles",  perm: PERMISSIONS.PLAN_EDIT },
      { to: "/admin/plans/ab-test",      icon: "🆎", label: "A/B Testing",      perm: PERMISSIONS.PLAN_EDIT },
      { to: "/admin/plans/quotes",       icon: "📝", label: "Custom Quotes",    perm: PERMISSIONS.PLAN_CREATE },
      { to: "/admin/plans/addons",       icon: "➕", label: "Add-ons",          perm: PERMISSIONS.PLAN_EDIT },
      { to: "/admin/plans/history",      icon: "🕘", label: "Pricing History",  perm: PERMISSIONS.PLAN_VIEW },
    ],
  },
  {
    id: "support",
    label: "Support",
    icon: "💬",
    items: [
      { to: "/admin/support/overview",    icon: "📈", label: "Overview",            perm: PERMISSIONS.SUPPORT_VIEW },
      { to: "/admin/ops/tickets",         icon: "🎫", label: "Tickets Queue",       perm: PERMISSIONS.SUPPORT_VIEW },
      { to: "/admin/ops/chat",            icon: "💬", label: "Live Chat Monitor",   perm: PERMISSIONS.SUPPORT_VIEW },
      { to: "/admin/ops/campaigns",       icon: "📣", label: "Email Campaigns",     perm: PERMISSIONS.CAMPAIGN_VIEW },
      { to: "/admin/ops/announcements",   icon: "📢", label: "Announcements",       perm: PERMISSIONS.ANNOUNCEMENT_CREATE },
      { to: "/admin/ops/kb",              icon: "📚", label: "Knowledge Base",      perm: PERMISSIONS.KB_EDIT },
      { to: "/admin/ops/macros",          icon: "📋", label: "Macro Responses",     perm: PERMISSIONS.MACRO_MANAGE },
      { to: "/admin/ops/escalation",      icon: "⤴",  label: "Escalation Rules",    perm: PERMISSIONS.SUPPORT_ESCALATE },
      { to: "/admin/ops/nps",             icon: "⭐", label: "NPS Surveys",         perm: PERMISSIONS.NPS_MANAGE },
      { to: "/admin/ops/webinars",        icon: "📹", label: "Webinar Manager",     perm: PERMISSIONS.WEBINAR_CREATE },
      { to: "/admin/ops/status-page",     icon: "🟢", label: "Status Page",         perm: PERMISSIONS.STATUS_PUBLISH },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "📈",
    items: [
      { to: "/admin/analytics/overview",     icon: "📈", label: "Overview",           perm: PERMISSIONS.ANALYTICS_VIEW },
      { to: "/admin/analytics/product",      icon: "📊", label: "Product Analytics",  perm: PERMISSIONS.ANALYTICS_VIEW },
      { to: "/admin/analytics/adoption",     icon: "🚀", label: "Feature Adoption",   perm: PERMISSIONS.ANALYTICS_VIEW },
      { to: "/admin/analytics/churn",        icon: "📉", label: "Churn Analysis",     perm: PERMISSIONS.ANALYTICS_VIEW },
      { to: "/admin/analytics/power-users",  icon: "💪", label: "Power Users",        perm: PERMISSIONS.ANALYTICS_VIEW },
      { to: "/admin/analytics/funnels",      icon: "🪣", label: "Funnel Analysis",    perm: PERMISSIONS.ANALYTICS_FUNNEL },
      { to: "/admin/analytics/replays",      icon: "🎥", label: "Session Replays",    perm: PERMISSIONS.ANALYTICS_REPLAY },
      { to: "/admin/analytics/heatmaps",     icon: "🔥", label: "Heatmaps",           perm: PERMISSIONS.ANALYTICS_HEATMAP },
      { to: "/admin/analytics/reports",      icon: "📄", label: "Custom Reports",     perm: PERMISSIONS.REPORT_CREATE },
      { to: "/admin/analytics/scheduled",    icon: "⏰", label: "Scheduled Reports",  perm: PERMISSIONS.REPORT_SCHEDULE },
      { to: "/admin/analytics/realtime",     icon: "🟢", label: "Realtime Activity",  perm: PERMISSIONS.ANALYTICS_VIEW },
      { to: "/admin/analytics/export",       icon: "📤", label: "Data Export",        perm: PERMISSIONS.ANALYTICS_EXPORT },
    ],
  },
  {
    id: "compliance",
    label: "Compliance",
    icon: "🛡",
    items: [
      { to: "/admin/compliance/overview",        icon: "📈", label: "Overview",                perm: PERMISSIONS.AUDIT_VIEW },
      { to: "/admin/compliance/kvkk",            icon: "🇹🇷", label: "KVKK Requests",           perm: PERMISSIONS.KVKK_RESPOND },
      { to: "/admin/compliance/gdpr",            icon: "🇪🇺", label: "GDPR Requests",           perm: PERMISSIONS.GDPR_RESPOND },
      { to: "/admin/compliance/audit",           icon: "📜", label: "System Audit Log",       perm: PERMISSIONS.AUDIT_VIEW },
      { to: "/admin/compliance/access",          icon: "🔑", label: "Access Control (RBAC)",  perm: PERMISSIONS.ADMIN_VIEW },
      { to: "/admin/compliance/reports",         icon: "📋", label: "Compliance Reports",      perm: PERMISSIONS.AUDIT_EXPORT },
      { to: "/admin/compliance/retention",       icon: "⏳", label: "Data Retention",         perm: PERMISSIONS.RETENTION_CONFIGURE },
      { to: "/admin/compliance/subprocessors",   icon: "🤝", label: "Subprocessors",          perm: PERMISSIONS.SUBPROCESSOR_MANAGE },
      { to: "/admin/compliance/forgotten",       icon: "🗑",  label: "Right to Be Forgotten",  perm: PERMISSIONS.GDPR_RESPOND },
    ],
  },
  {
    id: "system",
    label: "System",
    icon: "⚙",
    items: [
      { to: "/admin/system/overview",   icon: "📈", label: "Overview",            perm: PERMISSIONS.SYSTEM_VIEW },
      { to: "/admin/system/health",     icon: "❤️", label: "System Health",       perm: PERMISSIONS.SYSTEM_VIEW },
      { to: "/admin/system/errors",     icon: "🚨", label: "Error Monitoring",    perm: PERMISSIONS.ERRORS_VIEW },
      { to: "/admin/system/alerts",     icon: "🔔", label: "Alerts",              perm: PERMISSIONS.ALERTS_MANAGE },
      { to: "/admin/system/backups",    icon: "💾", label: "Backups",             perm: PERMISSIONS.SYSTEM_BACKUP },
      { to: "/admin/system/api",        icon: "🔌", label: "API Usage",           perm: PERMISSIONS.SYSTEM_VIEW },
      { to: "/admin/system/db",         icon: "🗄",  label: "Database Console",    perm: PERMISSIONS.DB_CONSOLE },
      { to: "/admin/system/cache",      icon: "♻",  label: "Cache",               perm: PERMISSIONS.CACHE_MANAGE },
      { to: "/admin/system/jobs",       icon: "⚙",  label: "Job Queue",           perm: PERMISSIONS.JOBS_MANAGE },
      { to: "/admin/system/deploy",     icon: "🚢", label: "Deployments",         perm: PERMISSIONS.SYSTEM_DEPLOY },
      { to: "/admin/system/flags",      icon: "🚩", label: "Feature Flags",       perm: PERMISSIONS.FEATURE_FLAG_MANAGE },
      { to: "/admin/system/maintenance",icon: "🔧", label: "Maintenance Mode",    perm: PERMISSIONS.SYSTEM_MAINTENANCE },
      { to: "/admin/system/security",   icon: "🛡",  label: "Security Scanner",    perm: PERMISSIONS.SECURITY_SCAN },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: "📣",
    items: [
      { to: "/admin/marketing/overview",   icon: "📈", label: "Overview",           perm: PERMISSIONS.MARKETING_VIEW },
      { to: "/admin/marketing/reviews",    icon: "⭐", label: "Reviews",            perm: PERMISSIONS.REVIEW_MODERATE },
      { to: "/admin/marketing/landing",    icon: "🎨", label: "Landing Editor",     perm: PERMISSIONS.MARKETING_EDIT },
      { to: "/admin/marketing/conversion", icon: "📈", label: "Conversion Analytics", perm: PERMISSIONS.MARKETING_VIEW },
      { to: "/admin/marketing/leads",      icon: "🪝", label: "Leads",              perm: PERMISSIONS.LEAD_MANAGE },
      { to: "/admin/marketing/seo",        icon: "🔍", label: "SEO Manager",        perm: PERMISSIONS.SEO_EDIT },
      { to: "/admin/marketing/blog",       icon: "📝", label: "Blog CMS",           perm: PERMISSIONS.BLOG_PUBLISH },
      { to: "/admin/marketing/affiliates", icon: "🤝", label: "Affiliates",         perm: PERMISSIONS.AFFILIATE_MANAGE },
      { to: "/admin/marketing/referrals",  icon: "🔗", label: "Referrals",          perm: PERMISSIONS.MARKETING_VIEW },
      { to: "/admin/marketing/social",     icon: "📱", label: "Social Scheduler",   perm: PERMISSIONS.SOCIAL_SCHEDULE },
      { to: "/admin/marketing/sequences",  icon: "🔄", label: "Email Sequences",    perm: PERMISSIONS.CAMPAIGN_CREATE },
    ],
  },
  {
    id: "musavir",
    label: "Mali Müşavir",
    icon: "🧮",
    items: [
      { to: "/admin/musavir/overview",      icon: "📈", label: "Overview",            perm: PERMISSIONS.MUSAVIR_VIEW },
      { to: "/admin/musavir/partners",      icon: "🤝", label: "Partners Directory", perm: PERMISSIONS.MUSAVIR_VIEW },
      { to: "/admin/musavir/commissions",   icon: "💵", label: "Commissions",        perm: PERMISSIONS.COMMISSION_MANAGE },
      { to: "/admin/musavir/referrals",     icon: "🔗", label: "Accountant Referrals", perm: PERMISSIONS.MUSAVIR_VIEW },
      { to: "/admin/musavir/onboarding",    icon: "🚀", label: "Onboarding Workflow", perm: PERMISSIONS.MUSAVIR_ONBOARD },
      { to: "/admin/musavir/metrics",       icon: "📊", label: "Performance Metrics", perm: PERMISSIONS.MUSAVIR_VIEW },
      { to: "/admin/musavir/training",      icon: "🎓", label: "Training Materials",  perm: PERMISSIONS.TRAINING_PUBLISH },
      { to: "/admin/musavir/broadcast",     icon: "📡", label: "Broadcast",           perm: PERMISSIONS.MUSAVIR_EDIT },
    ],
  },
];

export default function AdminSidebar({ admin, onLogout }) {
  const location = useLocation();
  const brand = ADMIN_BRAND;
  const [openGroups, setOpenGroups] = useState(() => {
    // Auto-open the group that contains the current route
    const open = {};
    for (const g of GROUPS) {
      if (g.items.some((i) => location.pathname.startsWith(i.to))) open[g.id] = true;
    }
    return open;
  });
  const role = ROLE_PALETTE[admin?.role] || ROLE_PALETTE.SUPPORT;

  const toggle = (id) => setOpenGroups((s) => ({ ...s, [id]: !s[id] }));

  return (
    <aside style={{
      width: 280,
      flexShrink: 0,
      background: "#0F172A",
      color: "#E2E8F0",
      height: "100vh",
      overflowY: "auto",
      borderInlineEnd: "1px solid rgba(255,255,255,0.08)",
      display: "flex", flexDirection: "column",
    }}
    className="admin-sidebar">
      {/* Brand */}
      <div style={{ padding: "20px 18px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`, color: "#fff", display: "grid", placeItems: "center", fontSize: 18, fontWeight: 900 }}>Z</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255, 255, 255, 0.7)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Zyrix Admin</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginTop: 2 }}>Operations Center</div>
          </div>
        </div>
      </div>

      {/* Admin info */}
      {admin && (
        <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
          <div style={{ fontSize: 15, color: "#FFFFFF", fontWeight: 700, marginBottom: 4 }}>{admin.fullName || admin.email}</div>
          <div style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.75)", marginBottom: 8 }}>{admin.email}</div>
          <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", background: `linear-gradient(135deg, ${role.base}, ${role.dark})`, padding: "3px 10px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {role.label}
          </span>
        </div>
      )}

      {/* Groups */}
      <nav style={{ flex: 1, padding: "12px 10px" }}>
        {GROUPS.map((g) => {
          const visible = g.items.filter((i) => !i.perm || hasPermission(admin, i.perm));
          if (visible.length === 0) return null;
          const isOpen = !!openGroups[g.id] || g.id === "core";
          return (
            <div key={g.id} style={{ marginBottom: 6 }}>
              {g.id !== "core" && (
                <button
                  type="button"
                  onClick={() => toggle(g.id)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 10px", background: "transparent", border: "none",
                    color: "#FFFFFF", fontSize: 12, fontWeight: 700,
                    textTransform: "uppercase", letterSpacing: "0.05em",
                    cursor: "pointer", textAlign: "start",
                    borderRadius: 8,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <span>{g.icon}</span>
                  <span style={{ flex: 1 }}>{g.label}</span>
                  <span style={{ fontSize: 9, opacity: 0.6 }}>{isOpen ? "▾" : "▸"}</span>
                </button>
              )}
              {isOpen && (
                <div style={{ marginInlineStart: 4 }}>
                  {visible.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end
                      className="admin-nav-link"
                      style={({ isActive }) => ({
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "8px 12px", borderRadius: 8,
                        textDecoration: "none",
                        background: isActive ? "rgba(227, 10, 23, 0.25)" : "transparent",
                        color: "#FFFFFF",
                        fontSize: 14, fontWeight: isActive ? 700 : 500,
                        borderInlineStart: isActive ? "3px solid #E30A17" : "3px solid transparent",
                        marginBottom: 1,
                        transition: "background 150ms ease",
                      })}
                    >
                      <span style={{ fontSize: 13 }}>{item.icon}</span>
                      <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <button
          type="button"
          onClick={onLogout}
          style={{ width: "100%", padding: "10px 14px", background: `${CRITICAL_RED.base}30`, color: "#fff", border: `1px solid ${CRITICAL_RED.base}50`, borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer" }}
        >
          ⏻ Sign out
        </button>
        <div style={{ marginTop: 10, fontSize: 9, color: "rgba(255, 255, 255, 0.4)", textAlign: "center" }}>
          v1.3.0 · Phase 14
        </div>
      </div>

      <style>{`
        /* Hover bg for inactive nav items. NavLink is using an inline-style
           callback so we have to !important past the inline transparent bg
           it sets in its non-active branch. Active items keep their wine
           red tint (we don't override on hover). */
        .admin-nav-link:not(.active):hover {
          background: rgba(255, 255, 255, 0.08) !important;
        }
        @media (max-width: 900px) {
          .admin-sidebar { position: fixed; insetInlineStart: -280px; transition: insetInlineStart .25s; z-index: 100; }
          .admin-sidebar.open { insetInlineStart: 0; }
        }
      `}</style>
    </aside>
  );
}

export { GROUPS as ADMIN_NAV_GROUPS };
