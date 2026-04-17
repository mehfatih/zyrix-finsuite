"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

function StatCard({ title, value, sub, color }: any) {
  return (
    <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "12px", padding: "24px", borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: "13px", color: "#64748B", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</div>
      <div style={{ fontSize: "32px", fontWeight: "700", color: "#FFFFFF", marginBottom: "4px" }}>{value}</div>
      {sub && <div style={{ fontSize: "13px", color: "#94A3B8" }}>{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("zyrix_admin_token");
    const adminData = localStorage.getItem("zyrix_admin");
    if (!token) { router.push("/admin/login"); return; }
    if (adminData) setAdmin(JSON.parse(adminData));

    fetch(`${API}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("zyrix_admin_token");
    localStorage.removeItem("zyrix_admin");
    router.push("/admin/login");
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#2563EB", fontSize: "18px" }}>Loading...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0F172A", color: "#FFFFFF" }}>
      {/* Navbar */}
      <div style={{ background: "#1E293B", borderBottom: "1px solid #334155", padding: "0 32px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "20px", fontWeight: "800", color: "#B8892A" }}>ZYRIX</span>
          <span style={{ fontSize: "14px", color: "#64748B" }}>Admin Panel</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "14px", color: "#94A3B8" }}>{admin?.name} — {admin?.role}</span>
          <button onClick={handleLogout} style={{ padding: "8px 16px", background: "#DC2626", color: "#FFFFFF", border: "none", borderRadius: "6px", fontSize: "13px", cursor: "pointer" }}>Logout</button>
        </div>
      </div>

      {/* Sidebar + Content */}
      <div style={{ display: "flex" }}>
        {/* Sidebar */}
        <div style={{ width: "240px", minHeight: "calc(100vh - 64px)", background: "#1E293B", borderRight: "1px solid #334155", padding: "24px 0" }}>
          {[
            { label: "Dashboard", href: "/admin/dashboard", active: true },
            { label: "Merchants", href: "/admin/merchants", active: false },
          ].map(item => (
            <a key={item.href} href={item.href} style={{ display: "block", padding: "12px 24px", fontSize: "14px", fontWeight: item.active ? "600" : "400", color: item.active ? "#FFFFFF" : "#64748B", background: item.active ? "#2563EB20" : "transparent", borderLeft: item.active ? "3px solid #2563EB" : "3px solid transparent", textDecoration: "none" }}>
              {item.label}
            </a>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "32px" }}>
          <div style={{ marginBottom: "32px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#FFFFFF", marginBottom: "4px" }}>Dashboard</h1>
            <p style={{ fontSize: "14px", color: "#64748B" }}>Platform overview — real-time data</p>
          </div>

          {/* KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "32px" }}>
            <StatCard title="Total Merchants" value={stats?.merchants?.total || 0} sub={`+${stats?.merchants?.newThisMonth || 0} this month`} color="#2563EB" />
            <StatCard title="Active" value={stats?.merchants?.active || 0} sub={`${stats?.merchants?.trial || 0} on trial`} color="#047857" />
            <StatCard title="Revenue This Month" value={`$${(stats?.revenue?.thisMonth || 0).toLocaleString()}`} sub={`Last month: $${(stats?.revenue?.lastMonth || 0).toLocaleString()}`} color="#B8892A" />
            <StatCard title="Suspended" value={stats?.merchants?.suspended || 0} sub="Needs attention" color="#DC2626" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "32px" }}>
            <StatCard title="Total Invoices" value={stats?.totals?.invoices || 0} color="#7C3AED" />
            <StatCard title="Total Customers" value={stats?.totals?.customers || 0} color="#0EA5E9" />
            <StatCard title="Total Deals" value={stats?.totals?.deals || 0} color="#D97706" />
          </div>

          {/* Plan Distribution */}
          {stats?.planDistribution && (
            <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#FFFFFF", marginBottom: "20px" }}>Plan Distribution</h2>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                {stats.planDistribution.map((p: any) => (
                  <div key={p.plan} style={{ background: "#0F172A", borderRadius: "8px", padding: "16px 24px", textAlign: "center" }}>
                    <div style={{ fontSize: "24px", fontWeight: "700", color: "#2563EB" }}>{p._count.id}</div>
                    <div style={{ fontSize: "13px", color: "#64748B", marginTop: "4px" }}>{p.plan}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Country Distribution */}
          {stats?.countryDistribution && (
            <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "12px", padding: "24px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#FFFFFF", marginBottom: "20px" }}>Merchants by Country</h2>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {stats.countryDistribution.map((c: any) => (
                  <div key={c.country} style={{ background: "#0F172A", borderRadius: "8px", padding: "12px 20px", display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ fontSize: "16px", fontWeight: "700", color: "#FFFFFF" }}>{c.country}</span>
                    <span style={{ fontSize: "13px", color: "#64748B" }}>{c._count.id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
