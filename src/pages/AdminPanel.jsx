import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

// ── Light Palette (same as CustomerDashboard) ─────
const P = {
  bg:      "#F0F4FF",
  surface: "#FFFFFF",
  card:    "#FFFFFF",
  sidebar: "#FFFFFF",
  border:  "#E2E8F8",
  purple:  "#6C3AFF",
  violet:  "#8B5CF6",
  pink:    "#F43F8E",
  cyan:    "#0EA5E9",
  emerald: "#10B981",
  amber:   "#F59E0B",
  rose:    "#F43F5E",
  indigo:  "#6366F1",
  teal:    "#14B8A6",
  orange:  "#F97316",
  text:    "#1E1B4B",
  sub:     "#64748B",
  muted:   "#94A3B8",
  light:   "#F8FAFF",
};

const COLORS = [P.purple, P.cyan, P.emerald, P.amber, P.pink, P.indigo, P.teal, P.orange];
const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TR_PROVINCES = [
  "Adana","Adıyaman","Afyonkarahisar","Ağrı","Aksaray","Amasya","Ankara","Antalya",
  "Ardahan","Artvin","Aydın","Balıkesir","Bartın","Batman","Bayburt","Bilecik",
  "Bingöl","Bitlis","Bolu","Burdur","Bursa","Çanakkale","Çankırı","Çorum",
  "Denizli","Diyarbakır","Düzce","Edirne","Elazığ","Erzincan","Erzurum","Eskişehir",
  "Gaziantep","Giresun","Gümüşhane","Hakkari","Hatay","Iğdır","Isparta","İstanbul",
  "İzmir","Kahramanmaraş","Karabük","Karaman","Kars","Kastamonu","Kayseri","Kilis",
  "Kırıkkale","Kırklareli","Kırşehir","Kocaeli","Konya","Kütahya","Malatya","Manisa",
  "Mardin","Mersin","Muğla","Muş","Nevşehir","Niğde","Ordu","Osmaniye","Rize",
  "Sakarya","Samsun","Şanlıurfa","Siirt","Sinop","Şırnak","Sivas","Tekirdağ",
  "Tokat","Trabzon","Tunceli","Uşak","Van","Yalova","Yozgat","Zonguldak",
];

async function adminFetch(path, options = {}) {
  const token = localStorage.getItem("zyrix_token");
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
  return data;
}

function useData(path) {
  const [data, setData]       = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState(null);
  const load = React.useCallback(async () => {
    setLoading(true);
    try { setData((await adminFetch(path))?.data || null); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [path]);
  React.useEffect(() => { load(); }, [load]);
  return { data, loading, error, reload: load };
}

// ── Spinner ───────────────────────────────────────
function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${P.border}`, borderTopColor: P.purple, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────
function StatCard({ label, value, icon, color, sub }) {
  return (
    <div style={{
      background: P.card, borderRadius: 16, padding: "18px 20px",
      border: `1.5px solid ${color}20`,
      boxShadow: `0 4px 20px ${color}10, 0 1px 4px rgba(0,0,0,0.04)`,
      position: "relative", overflow: "hidden",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 10px 32px ${color}18`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 4px 20px ${color}10, 0 1px 4px rgba(0,0,0,0.04)`; }}>
      {/* Top bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg,${color},${color}60)`, borderRadius: "16px 16px 0 0" }} />
      {/* Blob */}
      <div style={{ position: "absolute", bottom: -16, right: -16, width: 70, height: 70, borderRadius: "50%", background: color, opacity: 0.06 }} />
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, marginTop: 4 }}>
        <span style={{ color: P.sub, fontSize: 12, fontWeight: 600 }}>{label}</span>
        <div style={{ background: `${color}15`, borderRadius: 10, padding: "6px 8px", fontSize: 16 }}>{icon}</div>
      </div>
      <div style={{ color: P.text, fontSize: 26, fontWeight: 800 }}>{value ?? "—"}</div>
      {sub && <div style={{ color, fontSize: 11, fontWeight: 600, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── Input ─────────────────────────────────────────
function Input({ label, value, onChange, type = "text", placeholder, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ color: P.sub, fontSize: 12, display: "block", marginBottom: 5, fontWeight: 600 }}>
        {label} {required && <span style={{ color: P.rose }}>*</span>}
      </label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width: "100%", background: P.light, border: `1.5px solid ${focused ? P.purple : P.border}`, color: P.text, borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border-color 0.15s" }} />
    </div>
  );
}

// ── Modal ─────────────────────────────────────────
function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(30,27,75,0.45)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}>
      <div style={{ background: P.card, border: `1.5px solid ${P.border}`, borderRadius: 20, padding: 28, width: "100%", maxWidth: 520, boxShadow: "0 24px 64px rgba(108,58,255,0.15)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ color: P.text, fontSize: 18, fontWeight: 800, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: P.light, border: `1px solid ${P.border}`, color: P.sub, width: 32, height: 32, borderRadius: 10, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Overview Page ─────────────────────────────────
function OverviewPage() {
  const { data: stats, loading, error } = useData("/api/admin/stats");
  const s = stats?.merchants;
  const r = stats?.revenue;
  const t = stats?.totals;

  return (
    <div>
      {/* Header banner */}
      <div style={{ background: `linear-gradient(135deg, ${P.purple} 0%, ${P.pink} 100%)`, borderRadius: 20, padding: "22px 28px", marginBottom: 28, position: "relative", overflow: "hidden", boxShadow: `0 8px 32px ${P.purple}30` }}>
        <div style={{ position: "absolute", top: -20, right: 60, width: 110, height: 110, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
        <div style={{ position: "absolute", bottom: -25, right: 20, width: 75, height: 75, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginBottom: 4 }}>🏢 Admin Dashboard</div>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>Platform Overview</h1>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
        </div>
      </div>

      {error && <div style={{ background: `${P.rose}12`, border: `1.5px solid ${P.rose}30`, borderRadius: 12, padding: "12px 16px", color: P.rose, fontSize: 13, marginBottom: 16 }}>⚠ {error}</div>}

      {loading ? <Spinner /> : !stats ? (
        <div style={{ color: P.muted, textAlign: "center", padding: 40 }}>No stats available</div>
      ) : (
        <>
          {/* Merchants */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 16 }}>🏪</span>
              <span style={{ color: P.text, fontSize: 15, fontWeight: 700 }}>Merchants</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
              <StatCard label="Total"         value={s?.total ?? 0}        icon="🏪" color={P.purple} />
              <StatCard label="Active"        value={s?.active ?? 0}       icon="✅" color={P.emerald} sub={s?.total ? `${Math.round((s.active/s.total)*100)}% of total` : null} />
              <StatCard label="Trial"         value={s?.trial ?? 0}        icon="⏳" color={P.amber} />
              <StatCard label="New This Month" value={s?.newThisMonth ?? 0} icon="✨" color={P.cyan} />
            </div>
          </div>

          {/* Revenue */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 16 }}>💰</span>
              <span style={{ color: P.text, fontSize: 15, fontWeight: 700 }}>Revenue</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
              <StatCard label="This Month" value={r?.thisMonth ? `$${Number(r.thisMonth).toLocaleString()}` : "$0"} icon="📈" color={P.emerald} />
              <StatCard label="Last Month" value={r?.lastMonth ? `$${Number(r.lastMonth).toLocaleString()}` : "$0"} icon="📅" color={P.indigo} />
            </div>
          </div>

          {/* Platform Totals */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 16 }}>📊</span>
              <span style={{ color: P.text, fontSize: 15, fontWeight: 700 }}>Platform Totals</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              <StatCard label="Total Invoices"  value={t?.invoices ?? 0}  icon="🧾" color={P.pink} />
              <StatCard label="Total Customers" value={t?.customers ?? 0} icon="👥" color={P.teal} />
              <StatCard label="Total Deals"     value={t?.deals ?? 0}     icon="🤝" color={P.orange} />
            </div>
          </div>

          {/* Plan Distribution */}
          {stats?.planDistribution?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 16 }}>📋</span>
                <span style={{ color: P.text, fontSize: 15, fontWeight: 700 }}>Plan Distribution</span>
              </div>
              <div style={{ background: P.card, border: `1.5px solid ${P.border}`, borderRadius: 16, overflow: "hidden", boxShadow: `0 2px 16px rgba(108,58,255,0.06)` }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: `${P.purple}08`, borderBottom: `1.5px solid ${P.border}` }}>
                      <th style={{ padding: "11px 16px", textAlign: "left", color: P.sub, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Plan</th>
                      <th style={{ padding: "11px 16px", textAlign: "right", color: P.sub, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Merchants</th>
                      <th style={{ padding: "11px 16px", textAlign: "left", color: P.sub, fontSize: 11, fontWeight: 700, textTransform: "uppercase", minWidth: 120 }}>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.planDistribution.map((p, i) => {
                      const planColors = { FREE: P.muted, STARTER: P.cyan, PRO: P.purple, ENTERPRISE: P.amber };
                      const color = planColors[p.plan] || P.muted;
                      const pct = s?.total ? Math.round((p._count.id / s.total) * 100) : 0;
                      return (
                        <tr key={i} style={{ borderBottom: `1px solid ${P.border}` }}
                          onMouseEnter={e => e.currentTarget.style.background = `${color}06`}
                          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ background: `${color}15`, color, border: `1px solid ${color}25`, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700 }}>{p.plan}</span>
                          </td>
                          <td style={{ padding: "12px 16px", color: P.text, textAlign: "right", fontWeight: 800, fontSize: 15 }}>{p._count.id}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ flex: 1, height: 7, background: `${color}15`, borderRadius: 4, overflow: "hidden" }}>
                                <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg,${color},${color}80)`, borderRadius: 4, transition: "width 1.2s ease" }} />
                              </div>
                              <span style={{ color: P.sub, fontSize: 11, minWidth: 28 }}>{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Province Distribution */}
          {stats?.countryDistribution?.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 16 }}>📍</span>
                <span style={{ color: P.text, fontSize: 15, fontWeight: 700 }}>Top Provinces</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {stats.countryDistribution.map((c, i) => (
                  <div key={i} style={{ background: P.card, border: `1.5px solid ${COLORS[i%COLORS.length]}25`, borderRadius: 20, padding: "7px 16px", display: "flex", alignItems: "center", gap: 8, boxShadow: `0 2px 10px ${COLORS[i%COLORS.length]}10` }}>
                    <span style={{ fontSize: 14 }}>📍</span>
                    <span style={{ color: P.text, fontSize: 13, fontWeight: 600 }}>{c.country}</span>
                    <span style={{ color: "#fff", fontSize: 11, fontWeight: 700, background: COLORS[i%COLORS.length], borderRadius: 20, padding: "1px 8px" }}>{c._count.id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Merchants Page ────────────────────────────────
function MerchantsPage() {
  const { data, loading, error, reload } = useData("/api/admin/merchants");
  const merchants = data?.merchants || [];
  const [createOpen, setCreateOpen] = useState(false);
  const [detailMerchant, setDetailMerchant] = useState(null);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", businessName: "", phone: "", province: "İstanbul", plan: "FREE" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) { setCreateError("Name, email and password are required"); return; }
    setCreating(true); setCreateError("");
    try {
      await adminFetch("/api/admin/merchants", { method: "POST", body: JSON.stringify({ ...form, country: form.province }) });
      setCreateOpen(false);
      setForm({ name: "", email: "", password: "", businessName: "", phone: "", province: "İstanbul", plan: "FREE" });
      setSuccessMsg(`✅ Merchant "${form.name}" created successfully!`);
      setTimeout(() => setSuccessMsg(""), 4000);
      reload();
    } catch (e) { setCreateError(e.message); }
    finally { setCreating(false); }
  };

  const filtered = merchants.filter(m => !search || m.name?.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase()));

  const statusColors = { ACTIVE: P.emerald, SUSPENDED: P.rose, TRIAL: P.amber, INACTIVE: P.muted };
  const planColors   = { FREE: P.muted, STARTER: P.cyan, PRO: P.purple, ENTERPRISE: P.amber };

  const badge = (val, color) => (
    <span style={{ background: `${color}15`, color, border: `1px solid ${color}25`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{val}</span>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ color: P.text, fontSize: 24, fontWeight: 800, margin: 0 }}>Merchants</h1>
          <p style={{ color: P.sub, fontSize: 14, margin: "4px 0 0" }}>{merchants.length} registered merchants</p>
        </div>
        <button onClick={() => setCreateOpen(true)} style={{ background: `linear-gradient(135deg,${P.purple},${P.pink})`, border: "none", color: "#fff", borderRadius: 12, padding: "11px 22px", cursor: "pointer", fontSize: 14, fontWeight: 700, boxShadow: `0 4px 16px ${P.purple}35` }}>
          + New Merchant
        </button>
      </div>

      {successMsg && (
        <div style={{ background: `${P.emerald}12`, border: `1.5px solid ${P.emerald}30`, borderRadius: 12, padding: "12px 16px", color: P.emerald, fontSize: 13, marginBottom: 16, fontWeight: 600 }}>
          {successMsg}
        </div>
      )}
      {error && <div style={{ color: P.rose, fontSize: 13, marginBottom: 12 }}>⚠ {error}</div>}

      <div style={{ marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search by name or email..."
          style={{ width: "100%", background: P.card, border: `1.5px solid ${P.border}`, color: P.text, borderRadius: 12, padding: "11px 16px", fontSize: 14, outline: "none", boxSizing: "border-box", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          onFocus={e => e.target.style.borderColor = P.purple}
          onBlur={e => e.target.style.borderColor = P.border} />
      </div>

      {loading ? <Spinner /> : (
        <div style={{ background: P.card, border: `1.5px solid ${P.border}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 16px rgba(108,58,255,0.06)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: `${P.purple}08`, borderBottom: `1.5px solid ${P.border}` }}>
                {["Merchant", "Province", "Plan", "Status", "Customers", "Joined", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: P.sub, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 48, textAlign: "center", color: P.muted }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>🏪</div>
                  No merchants yet — create your first one!
                </td></tr>
              ) : filtered.map((m, i) => (
                <tr key={m.id || i} style={{ borderBottom: `1px solid ${P.border}`, transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = `${P.purple}04`}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,${COLORS[i%COLORS.length]}30,${COLORS[i%COLORS.length]}15)`, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS[i%COLORS.length], fontSize: 13, fontWeight: 800, flexShrink: 0 }}>
                        {(m.name || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ color: P.text, fontSize: 13, fontWeight: 700 }}>{m.name}</div>
                        <div style={{ color: P.muted, fontSize: 11 }}>{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span>📍</span>
                      <span style={{ color: P.sub, fontSize: 13 }}>{m.country || "—"}</span>
                    </div>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <select value={m.plan} onChange={e => adminFetch(`/api/admin/merchants/${m.id}/plan`,{method:"PUT",body:JSON.stringify({plan:e.target.value})}).then(()=>reload())}
                      style={{ background: `${planColors[m.plan]||P.muted}15`, border: `1px solid ${planColors[m.plan]||P.muted}30`, color: planColors[m.plan]||P.muted, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", outline: "none" }}>
                      {["FREE","STARTER","PRO","ENTERPRISE"].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <select value={m.status} onChange={e => adminFetch(`/api/admin/merchants/${m.id}/status`,{method:"PUT",body:JSON.stringify({status:e.target.value})}).then(()=>reload())}
                      style={{ background: `${statusColors[m.status]||P.muted}15`, border: `1px solid ${statusColors[m.status]||P.muted}30`, color: statusColors[m.status]||P.muted, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", outline: "none" }}>
                      {["ACTIVE","TRIAL","SUSPENDED","INACTIVE"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "13px 16px", color: P.text, fontSize: 14, fontWeight: 700 }}>{m._count?.customers ?? 0}</td>
                  <td style={{ padding: "13px 16px", color: P.muted, fontSize: 12 }}>
                    {m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—"}
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <button onClick={() => setDetailMerchant(m)}
                      style={{ background: `${P.purple}12`, border: `1px solid ${P.purple}25`, color: P.purple, borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal open={createOpen} title="✨ Create New Merchant" onClose={() => { setCreateOpen(false); setCreateError(""); }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Full Name"      value={form.name}         onChange={e => set("name",e.target.value)}         placeholder="Ahmed Yılmaz" required />
            <Input label="Business Name" value={form.businessName} onChange={e => set("businessName",e.target.value)} placeholder="My Company" />
          </div>
          <Input label="Email"    type="email"    value={form.email}    onChange={e => set("email",e.target.value)}    placeholder="merchant@company.com" required />
          <Input label="Password" type="password" value={form.password} onChange={e => set("password",e.target.value)} placeholder="Min 8 characters" required />
          <Input label="Phone"    value={form.phone} onChange={e => set("phone",e.target.value)} placeholder="+90 555 123 45 67" />

          <div>
            <label style={{ color: P.sub, fontSize: 12, display: "block", marginBottom: 5, fontWeight: 600 }}>📍 Province (İl)</label>
            <select value={form.province} onChange={e => set("province",e.target.value)}
              style={{ width: "100%", background: P.light, border: `1.5px solid ${P.border}`, color: P.text, borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none" }}>
              {TR_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div>
            <label style={{ color: P.sub, fontSize: 12, display: "block", marginBottom: 5, fontWeight: 600 }}>Plan</label>
            <select value={form.plan} onChange={e => set("plan",e.target.value)}
              style={{ width: "100%", background: P.light, border: `1.5px solid ${P.border}`, color: P.text, borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none" }}>
              {[["FREE","Free"],["STARTER","Starter"],["PRO","Pro"],["ENTERPRISE","Enterprise"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          {createError && (
            <div style={{ background: `${P.rose}12`, border: `1.5px solid ${P.rose}25`, borderRadius: 10, padding: "10px 14px", color: P.rose, fontSize: 13 }}>⚠ {createError}</div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={handleCreate} disabled={creating} style={{ flex: 1, background: creating ? P.muted : `linear-gradient(135deg,${P.purple},${P.pink})`, border: "none", color: "#fff", borderRadius: 10, padding: "12px 0", cursor: creating ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 700 }}>
              {creating ? "Creating..." : "Create Merchant"}
            </button>
            <button onClick={() => { setCreateOpen(false); setCreateError(""); }} style={{ background: P.light, border: `1.5px solid ${P.border}`, color: P.sub, borderRadius: 10, padding: "12px 18px", cursor: "pointer", fontSize: 14 }}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!detailMerchant} title="Merchant Details" onClose={() => setDetailMerchant(null)}>
        {detailMerchant && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, background: P.light, borderRadius: 14, padding: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg,${P.purple},${P.pink})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 800 }}>
                {(detailMerchant.name || "?")[0].toUpperCase()}
              </div>
              <div>
                <div style={{ color: P.text, fontSize: 17, fontWeight: 800 }}>{detailMerchant.name}</div>
                <div style={{ color: P.sub, fontSize: 13 }}>{detailMerchant.email}</div>
              </div>
            </div>
            {[
              ["Business", detailMerchant.businessName],
              ["Phone", detailMerchant.phone],
              ["Province", detailMerchant.country ? `📍 ${detailMerchant.country}` : "—"],
              ["Plan", detailMerchant.plan],
              ["Status", detailMerchant.status],
              ["Customers", detailMerchant._count?.customers ?? 0],
              ["Invoices",  detailMerchant._count?.invoices ?? 0],
              ["Deals",     detailMerchant._count?.deals ?? 0],
              ["Joined", detailMerchant.createdAt ? new Date(detailMerchant.createdAt).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}) : "—"],
            ].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"11px 0", borderBottom:`1px solid ${P.border}` }}>
                <span style={{ color:P.sub, fontSize:13 }}>{k}</span>
                <span style={{ color:P.text, fontSize:13, fontWeight:600 }}>{v ?? "—"}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

// ── Profile Page ──────────────────────────────────
function ProfilePage() {
  const { user, logout } = useAuth();
  return (
    <div>
      <h1 style={{ color: P.text, fontSize: 24, fontWeight: 800, margin: "0 0 20px" }}>Admin Profile</h1>
      <div style={{ background: P.card, border: `1.5px solid ${P.border}`, borderRadius: 18, padding: 24, maxWidth: 480, boxShadow: "0 2px 16px rgba(108,58,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, background: P.light, borderRadius: 14, padding: 16 }}>
          <div style={{ background: `linear-gradient(135deg,${P.purple},${P.pink})`, borderRadius: "50%", width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, fontWeight: 800, boxShadow: `0 4px 16px ${P.purple}35` }}>
            {(user?.name || "A")[0].toUpperCase()}
          </div>
          <div>
            <div style={{ color: P.text, fontSize: 18, fontWeight: 800 }}>{user?.name || "Admin"}</div>
            <div style={{ color: P.sub, fontSize: 13 }}>{user?.email}</div>
          </div>
        </div>
        {[["Name", user?.name], ["Email", user?.email], ["Role", user?.role]].map(([k,v]) => (
          <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:`1px solid ${P.border}` }}>
            <span style={{ color:P.sub, fontSize:13 }}>{k}</span>
            <span style={{ color:P.text, fontSize:13, fontWeight:600 }}>{v || "—"}</span>
          </div>
        ))}
        <button onClick={logout} style={{ marginTop: 20, width:"100%", background:`${P.rose}12`, border:`1.5px solid ${P.rose}25`, color:P.rose, borderRadius:10, padding:11, cursor:"pointer", fontWeight:700, fontSize:14 }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────
function Sidebar({ page, setPage, user, logout }) {
  const NAV = [
    { id:"overview",  label:"Overview",  icon:"⊞" },
    { id:"merchants", label:"Merchants", icon:"🏪" },
    { id:"profile",   label:"Profile",   icon:"👤" },
  ];
  return (
    <aside style={{ width:230, background:P.sidebar, borderRight:`1.5px solid ${P.border}`, display:"flex", flexDirection:"column", padding:"20px 12px", gap:3, position:"sticky", top:0, height:"100vh", boxShadow:"4px 0 24px rgba(108,58,255,0.06)" }}>
      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28, padding:"0 8px" }}>
        <div style={{ width:38, height:38, borderRadius:12, background:`linear-gradient(135deg,${P.purple},${P.pink})`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 16px ${P.purple}35` }}>
          <span style={{ color:"#fff", fontWeight:900, fontSize:17 }}>Z</span>
        </div>
        <div>
          <div style={{ color:P.text, fontWeight:800, fontSize:16, lineHeight:1 }}>Zyrix</div>
          <div style={{ color:P.rose, fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", background:`${P.rose}12`, borderRadius:4, padding:"1px 5px", display:"inline-block", marginTop:2 }}>ADMIN</div>
        </div>
      </div>

      {NAV.map(item => {
        const active = page === item.id;
        return (
          <button key={item.id} onClick={() => setPage(item.id)} style={{
            background: active ? `linear-gradient(90deg,${P.purple}15,${P.purple}06)` : "transparent",
            border: `1.5px solid ${active ? P.purple+"30" : "transparent"}`,
            borderRadius: 12, color: active ? P.purple : P.sub,
            padding: "10px 14px", cursor: "pointer", textAlign: "left",
            display: "flex", alignItems: "center", gap: 10,
            fontSize: 14, fontWeight: active ? 700 : 500, transition: "all 0.15s",
          }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background=`${P.purple}08`; e.currentTarget.style.color=P.purple; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background="transparent"; e.currentTarget.style.color=P.sub; } }}>
            <span style={{ fontSize:17 }}>{item.icon}</span>{item.label}
          </button>
        );
      })}

      {/* User */}
      <div style={{ marginTop:"auto", paddingTop:16, borderTop:`1.5px solid ${P.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10, background:P.light, borderRadius:12, padding:"8px 10px" }}>
          <div style={{ width:34, height:34, borderRadius:"50%", background:`linear-gradient(135deg,${P.rose},${P.orange})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:700, flexShrink:0 }}>
            {(user?.name||"A")[0].toUpperCase()}
          </div>
          <div style={{ overflow:"hidden", flex:1 }}>
            <div style={{ color:P.text, fontSize:12, fontWeight:700, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user?.name||"Admin"}</div>
            <div style={{ color:P.muted, fontSize:10, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={logout} style={{ width:"100%", background:`${P.rose}12`, border:`1.5px solid ${P.rose}25`, color:P.rose, borderRadius:10, padding:"9px 0", cursor:"pointer", fontSize:13, fontWeight:700 }}>
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
  const pages = { overview:<OverviewPage/>, merchants:<MerchantsPage/>, profile:<ProfilePage/> };
  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}*{box-sizing:border-box}body{margin:0;background:${P.bg}}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:${P.bg}}::-webkit-scrollbar-thumb{background:${P.border};border-radius:3px}::-webkit-scrollbar-thumb:hover{background:${P.purple}}select option{background:#fff;color:${P.text}}input::placeholder{color:${P.muted}}`}</style>
      <div style={{ background:P.bg, minHeight:"100vh", display:"flex", fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif" }}>
        <Sidebar page={page} setPage={setPage} user={user} logout={logout} />
        <main style={{ flex:1, padding:"28px 32px", overflow:"auto" }}>{pages[page]}</main>
      </div>
    </>
  );
}