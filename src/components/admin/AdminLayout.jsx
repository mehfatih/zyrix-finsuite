// ================================================================
// AdminLayout — wraps every /admin/* page with sidebar + topbar.
// Auth guard: bounces to /admin/login if no admin token.
// ================================================================
import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { getAdminToken, getAdminUser, getCurrentAdmin, adminLogout } from "../../utils/admin/adminApi";
import AdminSidebar from "./AdminSidebar";
import AdminTopBar from "./AdminTopBar";
import ImpersonationBanner from "./ImpersonationBanner";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(getAdminUser());
  const [loading, setLoading] = useState(!admin);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!getAdminToken()) {
      setLoading(false);
      return;
    }
    getCurrentAdmin().then((a) => {
      if (a) setAdmin(a);
      setLoading(false);
    });
  }, []);

  if (loading) return null;
  if (!getAdminToken()) return <Navigate to="/admin/login" replace />;

  const onLogout = async () => {
    await adminLogout();
    navigate("/admin/login");
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "system-ui, -apple-system, sans-serif", background: "#F8FAFC" }}>
      <ImpersonationBanner />
      <div className={`admin-sidebar-wrap ${mobileOpen ? "open" : ""}`}>
        <AdminSidebar admin={admin} onLogout={onLogout} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <AdminTopBar admin={admin} onMobileToggle={() => setMobileOpen((v) => !v)} />
        <main style={{ flex: 1, overflowY: "auto", background: "#F8FAFC" }}>
          <Outlet context={{ admin, refreshAdmin: () => getCurrentAdmin().then(setAdmin) }} />
        </main>
      </div>

      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.4)", zIndex: 50 }} className="admin-mobile-overlay" />
      )}

      <style>{`
        @media (max-width: 900px) {
          .admin-sidebar-wrap { position: fixed; inset-inline-start: -280px; transition: inset-inline-start .25s; z-index: 100; height: 100vh; }
          .admin-sidebar-wrap.open { inset-inline-start: 0; }
        }
        @media (min-width: 901px) {
          .admin-mobile-overlay { display: none; }
        }
      `}</style>
    </div>
  );
}
