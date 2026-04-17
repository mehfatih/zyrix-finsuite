import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const C = {
  bg: "#0f1117", card: "#1a1d27", border: "#2a2d3e",
  purple: "#6C5DD3", purpleLight: "#8B7CF8",
  green: "#01B574", red: "#FF4560", yellow: "#FFB547", blue: "#3A86FF",
  text: "#FFFFFF", muted: "#8B8FA8", sidebar: "#13151f",
};

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ── Turkey Provinces ──────────────────────────────
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
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const load = React.useCallback(async () => {
    setLoading(true);
    try { setData((await adminFetch(path))?.data || null); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [path]);
  React.useEffect(() => { load(); }, [load]);
  return { data, loading, error, reload: load };
}

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${C.border}`, borderTopColor: C.purple, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, required }) {
  return (
    <div>
      <label style={{ color: C.muted, fontSize: 12, display: "block", marginBottom: 5, fontWeight: 500 }}>
        {label} {required && <span style={{ color: C.red }}>*</span>}
      </label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width: "100%", background: "#0f1117", border: `1px solid ${C.border}`, color: C.text, borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" }}
        onFocus={e => e.target.style.borderColor = C.purple}
        onBlur={e => e.target.style.borderColor = C.border} />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label style={{ color: C.muted, fontSize: 12, display: "block", marginBottom: 5, fontWeight: 500 }}>{label}</label>
      <select value={value} onChange={onChange}
        style={{ width: "100%", background: "#0f1117", border: `1px solid ${C.border}`, color: C.text, borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none" }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, width: "100%", maxWidth: 520, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "#ffffff10", border: "none", color: C.muted, width: 30, height: 30, borderRadius: 8, cursor: "pointer", fontSize: 18 }}>×</button>
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

  const StatCard = ({ label, value, icon, color, sub }) => (
    <div style={{ background: `linear-gradient(135deg,${color}12,${C.card} 70%)`, border: `1px solid ${color}30`, borderRadius: 12, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -12, right: -12, width: 60, height: 60, borderRadius: "50%", background: color, opacity: 0.07 }} />
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ color: C.muted, fontSize: 12, fontWeight: 500 }}>{label}</span>
        <div style={{ background: `${color}20`, borderRadius: 8, padding: "5px 8px", fontSize: 16 }}>{icon}</div>
      </div>
      <div style={{ color: C.text, fontSize: 26, fontWeight: 800 }}>{value ?? "—"}</div>
      {sub && <div style={{ color: color, fontSize: 11, fontWeight: 600, marginTop: 4 }}>{sub}</div>}
    </div>
  );

  return (
    <div>
      <h1 style={{ color: C.text, fontSize: 24, fontWeight: 700, margin: "0 0 6px" }}>Overview</h1>
      <p style={{ color: C.muted, fontSize: 14, margin: "0 0 24px" }}>Platform statistics</p>

      {error && <div style={{ background: `${C.red}15`, border: `1px solid ${C.red}30`, borderRadius: 8, padding: "12px 16px", color: C.red, fontSize: 13, marginBottom: 16 }}>⚠ {error}</div>}

      {loading ? <Spinner /> : !stats ? (
        <div style={{ color: C.muted, textAlign: "center", padding: 40 }}>No stats available</div>
      ) : (
        <>
          {/* Merchants */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ color: C.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Merchants</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
              <StatCard label="Total Merchants"   value={s?.total ?? 0}        icon="🏪" color={C.purple} />
              <StatCard label="Active"            value={s?.active ?? 0}       icon="✅" color={C.green}  sub={s?.total ? `${Math.round((s.active/s.total)*100)}% of total` : null} />
              <StatCard label="Trial"             value={s?.trial ?? 0}        icon="⏳" color={C.yellow} />
              <StatCard label="New This Month"    value={s?.newThisMonth ?? 0} icon="✨" color={C.blue}   />
            </div>
          </div>

          {/* Revenue */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ color: C.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Revenue</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
              <StatCard label="This Month Revenue" value={r?.thisMonth ? `$${Number(r.thisMonth).toLocaleString()}` : "$0"} icon="💰" color={C.green} />
              <StatCard label="Last Month Revenue" value={r?.lastMonth ? `$${Number(r.lastMonth).toLocaleString()}` : "$0"} icon="📅" color={C.blue}  />
            </div>
          </div>

          {/* Platform Totals */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ color: C.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Platform Totals</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              <StatCard label="Total Invoices"  value={t?.invoices ?? 0}  icon="🧾" color={C.purple} />
              <StatCard label="Total Customers" value={t?.customers ?? 0} icon="👥" color={C.blue}   />
              <StatCard label="Total Deals"     value={t?.deals ?? 0}     icon="🤝" color={C.yellow} />
            </div>
          </div>

          {/* Plan Distribution */}
          {stats?.planDistribution?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: C.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Plan Distribution</div>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#ffffff08", borderBottom: `1px solid ${C.border}` }}>
                      <th style={{ padding: "10px 16px", textAlign: "left", color: C.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>Plan</th>
                      <th style={{ padding: "10px 16px", textAlign: "right", color: C.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>Merchants</th>
                      <th style={{ padding: "10px 16px", textAlign: "left", color: C.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.planDistribution.map((p, i) => {
                      const planColors = { FREE: C.muted, STARTER: C.blue, PRO: C.purple, ENTERPRISE: C.yellow };
                      const color = planColors[p.plan] || C.muted;
                      const pct = s?.total ? Math.round((p._count.id / s.total) * 100) : 0;
                      return (
                        <tr key={i} style={{ borderBottom: `1px solid ${C.border}20` }}>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ background: `${color}20`, color, borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{p.plan}</span>
                          </td>
                          <td style={{ padding: "12px 16px", color: C.text, textAlign: "right", fontWeight: 700, fontSize: 15 }}>{p._count.id}</td>
                          <td style={{ padding: "12px 16px", width: 160 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ flex: 1, height: 6, background: `${color}20`, borderRadius: 3, overflow: "hidden" }}>
                                <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 1s ease" }} />
                              </div>
                              <span style={{ color: C.muted, fontSize: 11, minWidth: 28 }}>{pct}%</span>
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

          {/* Country Distribution */}
          {stats?.countryDistribution?.length > 0 && (
            <div>
              <div style={{ color: C.muted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Top Provinces</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {stats.countryDistribution.map((c, i) => (
                  <div key={i} style={{ background: `${C.purple}15`, border: `1px solid ${C.purple}30`, borderRadius: 20, padding: "6px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14 }}>📍</span>
                    <span style={{ color: C.text, fontSize: 13, fontWeight: 500 }}>{c.country}</span>
                    <span style={{ color: C.purple, fontSize: 12, fontWeight: 700, background: `${C.purple}20`, borderRadius: 10, padding: "0 6px" }}>{c._count.id}</span>
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

  const [form, setForm] = useState({
    name: "", email: "", password: "", businessName: "",
    phone: "", province: "İstanbul", plan: "FREE",
  });
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) { setCreateError("Name, email and password are required"); return; }
    setCreating(true); setCreateError("");
    try {
      await adminFetch("/api/admin/merchants", {
        method: "POST",
        body: JSON.stringify({ ...form, country: form.province }),
      });
      setCreateOpen(false);
      setForm({ name: "", email: "", password: "", businessName: "", phone: "", province: "İstanbul", plan: "FREE" });
      setSuccessMsg(`Merchant "${form.name}" created successfully!`);
      setTimeout(() => setSuccessMsg(""), 4000);
      reload();
    } catch (e) { setCreateError(e.message); }
    finally { setCreating(false); }
  };

  const handleStatusChange = async (id, status) => {
    try { await adminFetch(`/api/admin/merchants/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }); reload(); }
    catch (e) { alert(e.message); }
  };

  const handlePlanChange = async (id, plan) => {
    try { await adminFetch(`/api/admin/merchants/${id}/plan`, { method: "PUT", body: JSON.stringify({ plan }) }); reload(); }
    catch (e) { alert(e.message); }
  };

  const filtered = merchants.filter(m => !search || m.name?.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase()));
  const statusColor = { ACTIVE: C.green, SUSPENDED: C.red, TRIAL: C.yellow, INACTIVE: C.muted };
  const planColor   = { FREE: C.muted, STARTER: C.blue, PRO: C.purple, ENTERPRISE: C.yellow };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ color: C.text, fontSize: 24, fontWeight: 700, margin: 0 }}>Merchants</h1>
          <p style={{ color: C.muted, fontSize: 14, margin: "4px 0 0" }}>{merchants.length} total merchants</p>
        </div>
        <button onClick={() => setCreateOpen(true)}
          style={{ background: C.purple, border: "none", color: "#fff", borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
          + New Merchant
        </button>
      </div>

      {successMsg && (
        <div style={{ background: `${C.green}15`, border: `1px solid ${C.green}40`, borderRadius: 8, padding: "12px 16px", color: C.green, fontSize: 13, marginBottom: 16 }}>
          ✅ {successMsg}
        </div>
      )}
      {error && <div style={{ color: C.red, fontSize: 13, marginBottom: 12 }}>⚠ {error}</div>}

      <div style={{ marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
          style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, color: C.text, borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" }}
          onFocus={e => e.target.style.borderColor = C.purple}
          onBlur={e => e.target.style.borderColor = C.border} />
      </div>

      {loading ? <Spinner /> : (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#ffffff08", borderBottom: `1px solid ${C.border}` }}>
                {["Merchant", "Province", "Plan", "Status", "Customers", "Joined", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: C.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: C.muted }}>No merchants yet — create your first one!</td></tr>
              ) : filtered.map((m, i) => (
                <tr key={m.id || i} style={{ borderBottom: `1px solid ${C.border}20`, transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#ffffff05"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${C.purple}30`, display: "flex", alignItems: "center", justifyContent: "center", color: C.purpleLight, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                        {(m.name || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ color: C.text, fontSize: 13, fontWeight: 500 }}>{m.name}</div>
                        <div style={{ color: C.muted, fontSize: 11 }}>{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ fontSize: 12 }}>📍</span>
                      <span style={{ color: C.muted, fontSize: 13 }}>{m.country || "—"}</span>
                    </div>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <select value={m.plan} onChange={e => handlePlanChange(m.id, e.target.value)}
                      style={{ background: `${planColor[m.plan]||C.muted}20`, border: `1px solid ${planColor[m.plan]||C.muted}40`, color: planColor[m.plan]||C.muted, borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 600, cursor: "pointer", outline: "none" }}>
                      {["FREE","STARTER","PRO","ENTERPRISE"].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <select value={m.status} onChange={e => handleStatusChange(m.id, e.target.value)}
                      style={{ background: `${statusColor[m.status]||C.muted}20`, border: `1px solid ${statusColor[m.status]||C.muted}40`, color: statusColor[m.status]||C.muted, borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 600, cursor: "pointer", outline: "none" }}>
                      {["ACTIVE","TRIAL","SUSPENDED","INACTIVE"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: "13px 16px", color: C.muted, fontSize: 13 }}>{m._count?.customers ?? 0}</td>
                  <td style={{ padding: "13px 16px", color: C.muted, fontSize: 12 }}>
                    {m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <button onClick={() => setDetailMerchant(m)}
                      style={{ background: `${C.purple}20`, border: `1px solid ${C.purple}40`, color: C.purpleLight, borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
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
      <Modal open={createOpen} title="Create New Merchant" onClose={() => { setCreateOpen(false); setCreateError(""); }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Full Name"      value={form.name}         onChange={e => set("name", e.target.value)}         placeholder="Ahmed Al-Rashid" required />
            <Input label="Business Name" value={form.businessName} onChange={e => set("businessName", e.target.value)} placeholder="My Company" />
          </div>
          <Input label="Email"    type="email"    value={form.email}    onChange={e => set("email", e.target.value)}    placeholder="merchant@company.com" required />
          <Input label="Password" type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Min 8 characters" required />
          <Input label="Phone"    value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+90 555 123 45 67" />

          {/* Province dropdown */}
          <div>
            <label style={{ color: C.muted, fontSize: 12, display: "block", marginBottom: 5, fontWeight: 500 }}>
              📍 Province (İl)
            </label>
            <select value={form.province} onChange={e => set("province", e.target.value)}
              style={{ width: "100%", background: "#0f1117", border: `1px solid ${C.border}`, color: C.text, borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none" }}>
              {TR_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <Select label="Plan" value={form.plan} onChange={e => set("plan", e.target.value)}
            options={[
              { value: "FREE",       label: "Free" },
              { value: "STARTER",    label: "Starter" },
              { value: "PRO",        label: "Pro" },
              { value: "ENTERPRISE", label: "Enterprise" },
            ]} />

          {createError && (
            <div style={{ background: `${C.red}15`, border: `1px solid ${C.red}30`, borderRadius: 8, padding: "10px 14px", color: C.red, fontSize: 13 }}>⚠ {createError}</div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={handleCreate} disabled={creating}
              style={{ flex: 1, background: creating ? "#4a3f9e" : C.purple, border: "none", color: "#fff", borderRadius: 8, padding: "11px 0", cursor: creating ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600 }}>
              {creating ? "Creating..." : "Create Merchant"}
            </button>
            <button onClick={() => { setCreateOpen(false); setCreateError(""); }}
              style={{ background: C.card, border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "11px 18px", cursor: "pointer", fontSize: 14 }}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!detailMerchant} title="Merchant Details" onClose={() => setDetailMerchant(null)}>
        {detailMerchant && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${C.purple}30`, display: "flex", alignItems: "center", justifyContent: "center", color: C.purpleLight, fontSize: 18, fontWeight: 800 }}>
                {(detailMerchant.name || "?")[0].toUpperCase()}
              </div>
              <div>
                <div style={{ color: C.text, fontSize: 17, fontWeight: 700 }}>{detailMerchant.name}</div>
                <div style={{ color: C.muted, fontSize: 13 }}>{detailMerchant.email}</div>
              </div>
            </div>
            {[
              ["Business Name", detailMerchant.businessName],
              ["Phone", detailMerchant.phone],
              ["Province", detailMerchant.country ? `📍 ${detailMerchant.country}` : "—"],
              ["Plan", detailMerchant.plan],
              ["Status", detailMerchant.status],
              ["Merchant ID", detailMerchant.merchantId],
              ["Customers", detailMerchant._count?.customers ?? 0],
              ["Invoices", detailMerchant._count?.invoices ?? 0],
              ["Deals", detailMerchant._count?.deals ?? 0],
              ["Joined", detailMerchant.createdAt ? new Date(detailMerchant.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ color: C.muted, fontSize: 13 }}>{k}</span>
                <span style={{ color: C.text, fontSize: 13, fontWeight: 500 }}>{v ?? "—"}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

// ── Profile ───────────────────────────────────────
function ProfilePage() {
  const { user, logout } = useAuth();
  return (
    <div>
      <h1 style={{ color: C.text, fontSize: 24, fontWeight: 700, margin: "0 0 20px" }}>Admin Profile</h1>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, maxWidth: 480 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
          <div style={{ background: `linear-gradient(135deg, ${C.purple}, #3A1F9E)`, borderRadius: "50%", width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 800 }}>
            {(user?.name || "A")[0].toUpperCase()}
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
        }}
          onMouseEnter={e => { if (page !== item.id) e.currentTarget.style.background = "#ffffff08"; }}
          onMouseLeave={e => { if (page !== item.id) e.currentTarget.style.background = "transparent"; }}>
          <span>{item.icon}</span>{item.label}
        </button>
      ))}
      <div style={{ marginTop: "auto", paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
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
  const pages = { overview: <OverviewPage />, merchants: <MerchantsPage />, profile: <ProfilePage /> };
  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}*{box-sizing:border-box}body{margin:0}select option{background:#1a1d27;color:#fff}`}</style>
      <div style={{ background: C.bg, minHeight: "100vh", display: "flex", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>
        <Sidebar page={page} setPage={setPage} user={user} logout={logout} />
        <main style={{ flex: 1, padding: "32px 36px", overflow: "auto" }}>{pages[page]}</main>
      </div>
    </>
  );
}