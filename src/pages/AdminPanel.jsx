import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const C = {
  bg: "#0f1117", card: "#1a1d27", border: "#2a2d3e",
  purple: "#6C5DD3", purpleLight: "#8B7CF8",
  green: "#01B574", red: "#FF4560", yellow: "#FFB547", blue: "#3A86FF",
  text: "#FFFFFF", muted: "#8B8FA8", sidebar: "#13151f",
};

// ── Simple fetch wrapper ──────────────────────────
async function adminFetch(path, options = {}) {
  const token = localStorage.getItem("zyrix_token");
  const res = await fetch(`http://localhost:3000${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
  return data;
}

// ── Hooks ─────────────────────────────────────────
function useData(path) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch(path);
      setData(res?.data || res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [path]);

  React.useEffect(() => { load(); }, [load]);
  return { data, loading, error, reload: load };
}

// ── UI Components ─────────────────────────────────
function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${C.border}`, borderTopColor: C.purple, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    </div>
  );
}

function Card({ label, value, icon, color = C.purple }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ color: C.muted, fontSize: 13 }}>{label}</span>
        <span style={{ background: `${color}20`, borderRadius: 8, padding: "4px 8px", fontSize: 16 }}>{icon}</span>
      </div>
      <div style={{ color: C.text, fontSize: 26, fontWeight: 800 }}>{value ?? "—"}</div>
    </div>
  );
}

// ── Pages ─────────────────────────────────────────
function OverviewPage() {
  const { data: stats, loading, error } = useData("/api/admin/stats");

  return (
    <div>
      <h1 style={{ color: C.text, fontSize: 24, fontWeight: 700, margin: "0 0 6px" }}>Overview</h1>
      <p style={{ color: C.muted, fontSize: 14, margin: "0 0 24px" }}>Platform statistics</p>

      {error && (
        <div style={{ background: `${C.red}15`, border: `1px solid ${C.red}30`, borderRadius: 8, padding: "12px 16px", marginBottom: 16, color: C.red, fontSize: 13 }}>
          ⚠ {error}
        </div>
      )}

      {loading ? <Spinner /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          <Card label="Total Merchants" value={stats?.totalMerchants ?? stats?.total_merchants ?? "—"} icon="🏪" color={C.purple} />
          <Card label="Active Merchants" value={stats?.activeMerchants ?? stats?.active_merchants ?? "—"} icon="✅" color={C.green} />
          <Card label="Total Revenue" value={stats?.totalRevenue ? `$${Number(stats.totalRevenue).toLocaleString()}` : "—"} icon="💰" color={C.blue} />
          <Card label="This Month" value={stats?.monthlyRevenue ? `$${Number(stats.monthlyRevenue).toLocaleString()}` : "—"} icon="📅" color={C.yellow} />
        </div>
      )}

      {/* Raw stats for debugging */}
      {!loading && stats && (
        <div style={{ marginTop: 24, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
          <h3 style={{ color: C.text, fontSize: 15, fontWeight: 600, marginBottom: 12 }}>All Stats</h3>
          <pre style={{ color: C.muted, fontSize: 12, overflow: "auto", margin: 0 }}>
            {JSON.stringify(stats, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function MerchantsPage() {
  const { data, loading, error, reload } = useData("/api/admin/merchants");
  const merchants = Array.isArray(data) ? data : data?.merchants || data?.items || [];

  return (
    <div>
      <h1 style={{ color: C.text, fontSize: 24, fontWeight: 700, margin: "0 0 20px" }}>Merchants</h1>
      {error && <div style={{ color: C.red, fontSize: 13, marginBottom: 12 }}>⚠ {error}</div>}
      {loading ? <Spinner /> : (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#ffffff08", borderBottom: `1px solid ${C.border}` }}>
                {["Name", "Email", "Plan", "Status", "Joined"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: C.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {merchants.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 40, textAlign: "center", color: C.muted }}>No merchants found</td></tr>
              ) : merchants.map((m, i) => (
                <tr key={m.id || i} style={{ borderBottom: `1px solid ${C.border}` }}
                  onMouseEnter={e => e.currentTarget.style.background = "#ffffff05"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "13px 16px", color: C.text, fontSize: 14 }}>{m.name || m.businessName || "—"}</td>
                  <td style={{ padding: "13px 16px", color: C.muted, fontSize: 13 }}>{m.email || m.user?.email || "—"}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ background: `${C.purple}20`, color: C.purpleLight, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
                      {m.plan || m.subscriptionPlan || "FREE"}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ color: m.isActive || m.status === "active" ? C.green : C.red, fontSize: 12, fontWeight: 600 }}>
                      {m.isActive || m.status === "active" ? "● Active" : "● Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px", color: C.muted, fontSize: 12 }}>
                    {m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ProfilePage() {
  const { user, logout } = useAuth();
  return (
    <div>
      <h1 style={{ color: C.text, fontSize: 24, fontWeight: 700, margin: "0 0 20px" }}>Admin Profile</h1>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, maxWidth: 480 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ background: `linear-gradient(135deg, ${C.purple}, #3A1F9E)`, borderRadius: "50%", width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 800 }}>
            {(user?.name || user?.email || "A")[0].toUpperCase()}
          </div>
          <div>
            <div style={{ color: C.text, fontSize: 18, fontWeight: 700 }}>{user?.name || "Admin"}</div>
            <div style={{ color: C.muted, fontSize: 13 }}>{user?.email}</div>
          </div>
        </div>
        {[["Name", user?.name], ["Email", user?.email], ["Role", user?.role]].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ color: C.muted, fontSize: 13 }}>{k}</span>
            <span style={{ color: C.text, fontSize: 13, fontWeight: 500 }}>{v || "—"}</span>
          </div>
        ))}
        <button onClick={logout} style={{ marginTop: 20, width: "100%", background: `${C.red}15`, border: `1px solid ${C.red}30`, color: C.red, borderRadius: 8, padding: 10, cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────
function Sidebar({ page, setPage, user, logout }) {
  const NAV = [
    { id: "overview",  label: "Overview",  icon: "⊞" },
    { id: "merchants", label: "Merchants", icon: "🏪" },
    { id: "profile",   label: "Profile",   icon: "👤" },
  ];

  return (
    <aside style={{ background: C.sidebar, borderRight: `1px solid ${C.border}`, width: 220, minHeight: "100vh", display: "flex", flexDirection: "column", padding: "20px 12px", gap: 2 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, padding: "0 6px" }}>
        <div style={{ background: `linear-gradient(135deg, ${C.purple}, #3A1F9E)`, borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>Z</span>
        </div>
        <div>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>Zyrix</div>
          <div style={{ color: C.red, fontSize: 10, background: `${C.red}20`, borderRadius: 4, padding: "1px 5px", display: "inline-block" }}>ADMIN</div>
        </div>
      </div>

      {NAV.map(item => (
        <button key={item.id} onClick={() => setPage(item.id)} style={{
          background: page === item.id ? `${C.purple}22` : "transparent",
          border: `1px solid ${page === item.id ? C.purple : "transparent"}`,
          borderRadius: 8, color: page === item.id ? C.purpleLight : C.muted,
          padding: "9px 12px", cursor: "pointer", textAlign: "left",
          display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 500,
        }}>
          <span>{item.icon}</span>{item.label}
        </button>
      ))}

      <div style={{ marginTop: "auto", paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ background: C.red, borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>
            {(user?.name || "A")[0].toUpperCase()}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ color: C.text, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 130 }}>{user?.name || "Admin"}</div>
            <div style={{ color: C.muted, fontSize: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 130 }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={logout} style={{ width: "100%", background: `${C.red}15`, border: `1px solid ${C.red}30`, color: C.red, borderRadius: 8, padding: "7px 0", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// ── Main ──────────────────────────────────────────
export default function AdminPanel() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState("overview");

  const pages = {
    overview:  <OverviewPage />,
    merchants: <MerchantsPage />,
    profile:   <ProfilePage />,
  };

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } } * { box-sizing: border-box; } body { margin: 0; }`}</style>
      <div style={{ background: C.bg, minHeight: "100vh", display: "flex", fontFamily: "'Inter', system-ui, sans-serif" }}>
        <Sidebar page={page} setPage={setPage} user={user} logout={logout} />
        <main style={{ flex: 1, padding: "32px 36px", overflow: "auto" }}>
          {pages[page]}
        </main>
      </div>
    </>
  );
}