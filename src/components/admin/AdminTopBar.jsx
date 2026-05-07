// ================================================================
// AdminTopBar — search, notifications, environment indicator
// ================================================================
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROLE_PALETTE, ADMIN_BRAND, CRITICAL_RED } from "../../utils/admin/adminPalette";

export default function AdminTopBar({ admin, onMobileToggle }) {
  const navigate = useNavigate();
  const role = ROLE_PALETTE[admin?.role] || ROLE_PALETTE.SUPPORT;
  const brand = ADMIN_BRAND;
  const [search, setSearch] = useState("");
  const isProd = (import.meta.env.MODE === "production") || /finsuite\.zyrix/.test(typeof window !== "undefined" ? window.location.host : "");

  const onSearch = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    // Quick global search — for now route to customer list
    navigate(`/admin/customers?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header style={{
      height: 60, padding: "0 20px",
      background: "#fff",
      borderBottom: "1px solid #E2E8F0",
      display: "grid", gridTemplateColumns: "auto 1fr auto auto auto",
      alignItems: "center", gap: 14,
      flexShrink: 0,
      boxShadow: "0 1px 4px rgba(15,23,42,0.04)",
    }} className="admin-topbar">
      <button
        type="button"
        onClick={onMobileToggle}
        aria-label="menu"
        style={{ background: "transparent", border: "none", fontSize: 22, cursor: "pointer", display: "none" }}
        className="admin-mobile-toggle"
      >
        ☰
      </button>

      <form onSubmit={onSearch} style={{ position: "relative", maxWidth: 480 }} className="admin-search">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers, invoices, tickets…"
          style={{ width: "100%", padding: "9px 14px 9px 40px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, fontFamily: "inherit", background: "#F8FAFC", boxSizing: "border-box" }}
        />
        <span style={{ position: "absolute", insetInlineStart: 14, top: 9, fontSize: 14, opacity: 0.5 }}>🔍</span>
      </form>

      {/* Environment badge */}
      <span style={{ fontSize: 9, fontWeight: 800, padding: "4px 10px", borderRadius: 999, background: isProd ? CRITICAL_RED.bg : "#FEF3C7", color: isProd ? CRITICAL_RED.dark : "#B45309", textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
        {isProd ? "🔴 Production" : "🟡 Dev"}
      </span>

      {/* Notifications */}
      <button type="button" aria-label="notifications" style={{ background: "transparent", border: "none", fontSize: 18, cursor: "pointer", padding: "6px 8px", borderRadius: 8, position: "relative" }}>
        🔔
        <span style={{ position: "absolute", top: 2, right: 4, width: 8, height: 8, borderRadius: "50%", background: brand.base }} />
      </button>

      {/* Admin avatar + role */}
      {admin && (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg, ${role.base}, ${role.dark})`, color: "#fff", display: "grid", placeItems: "center", fontSize: 13, fontWeight: 900 }}>
            {(admin.fullName || admin.email || "?").slice(0, 2).toUpperCase()}
          </div>
          <div style={{ display: "none" }} className="admin-name-block">
            <div style={{ fontSize: 12, fontWeight: 800, color: "#0F172A", lineHeight: 1.2 }}>{admin.fullName || admin.email}</div>
            <div style={{ fontSize: 9, color: role.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>{role.label}</div>
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 720px) { .admin-name-block { display: block !important; } }
        @media (max-width: 900px) {
          .admin-mobile-toggle { display: block !important; }
          .admin-topbar { grid-template-columns: auto 1fr auto auto !important; }
          .admin-topbar > .admin-search { display: none; }
        }
      `}</style>
    </header>
  );
}
