"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminMerchants() {
  const router = useRouter();
  const [merchants, setMerchants] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState("");
  const [page, setPage] = useState(1);

  const fetchMerchants = async () => {
    setLoading(true);
    const token = localStorage.getItem("zyrix_admin_token");
    if (!token) { router.push("/admin/login"); return; }
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.append("search", search);
    if (status) params.append("status", status);
    if (plan) params.append("plan", plan);
    try {
      const res = await fetch(`${API}/api/admin/merchants?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) { setMerchants(data.data.merchants); setTotal(data.data.total); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMerchants(); }, [page, status, plan]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchMerchants(); };

  const updateStatus = async (id: string, newStatus: string) => {
    const token = localStorage.getItem("zyrix_admin_token");
    const res = await fetch(`${API}/api/admin/merchants/${id}/status`, {
      method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    });
    const data = await res.json();
    if (data.success) fetchMerchants();
  };

  const statusColor: any = { ACTIVE: "#047857", TRIAL: "#D97706", SUSPENDED: "#DC2626", EXPIRED: "#64748B" };
  const planColor: any = { STARTER: "#64748B", BUSINESS: "#2563EB", PRO: "#7C3AED", ENTERPRISE: "#B8892A" };

  return (
    <div style={{ minHeight: "100vh", background: "#0F172A", color: "#FFFFFF" }}>
      {/* Navbar */}
      <div style={{ background: "#1E293B", borderBottom: "1px solid #334155", padding: "0 32px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "20px", fontWeight: "800", color: "#B8892A" }}>ZYRIX</span>
          <span style={{ fontSize: "14px", color: "#64748B" }}>Admin Panel</span>
        </div>
        <button onClick={() => { localStorage.removeItem("zyrix_admin_token"); router.push("/admin/login"); }}
          style={{ padding: "8px 16px", background: "#DC2626", color: "#FFFFFF", border: "none", borderRadius: "6px", fontSize: "13px", cursor: "pointer" }}>Logout</button>
      </div>

      <div style={{ display: "flex" }}>
        {/* Sidebar */}
        <div style={{ width: "240px", minHeight: "calc(100vh - 64px)", background: "#1E293B", borderRight: "1px solid #334155", padding: "24px 0" }}>
          {[
            { label: "Dashboard", href: "/admin/dashboard" },
            { label: "Merchants", href: "/admin/merchants", active: true },
          ].map(item => (
            <a key={item.href} href={item.href} style={{ display: "block", padding: "12px 24px", fontSize: "14px", fontWeight: (item as any).active ? "600" : "400", color: (item as any).active ? "#FFFFFF" : "#64748B", background: (item as any).active ? "#2563EB20" : "transparent", borderLeft: (item as any).active ? "3px solid #2563EB" : "3px solid transparent", textDecoration: "none" }}>
              {item.label}
            </a>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "32px" }}>
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "4px" }}>Merchants</h1>
            <p style={{ fontSize: "14px", color: "#64748B" }}>{total} total merchants</p>
          </div>

          {/* Filters */}
          <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "12px", padding: "20px", marginBottom: "24px", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
            <form onSubmit={handleSearch} style={{ display: "flex", gap: "12px", flex: 1, flexWrap: "wrap" }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email..."
                style={{ flex: 1, minWidth: "200px", padding: "10px 14px", background: "#0F172A", border: "1px solid #334155", borderRadius: "8px", color: "#FFFFFF", fontSize: "14px" }} />
              <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
                style={{ padding: "10px 14px", background: "#0F172A", border: "1px solid #334155", borderRadius: "8px", color: "#FFFFFF", fontSize: "14px" }}>
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="TRIAL">Trial</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
              <select value={plan} onChange={e => { setPlan(e.target.value); setPage(1); }}
                style={{ padding: "10px 14px", background: "#0F172A", border: "1px solid #334155", borderRadius: "8px", color: "#FFFFFF", fontSize: "14px" }}>
                <option value="">All Plans</option>
                <option value="STARTER">Starter</option>
                <option value="BUSINESS">Business</option>
                <option value="PRO">Pro</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
              <button type="submit" style={{ padding: "10px 20px", background: "#2563EB", color: "#FFFFFF", border: "none", borderRadius: "8px", fontSize: "14px", cursor: "pointer" }}>Search</button>
            </form>
          </div>

          {/* Table */}
          <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: "12px", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#0F172A", borderBottom: "1px solid #334155" }}>
                  {["Merchant", "Email", "Country", "Plan", "Status", "Customers", "Invoices", "Actions"].map(h => (
                    <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>Loading...</td></tr>
                ) : merchants.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#64748B" }}>No merchants found</td></tr>
                ) : merchants.map((m, i) => (
                  <tr key={m.id} style={{ borderBottom: "1px solid #1E293B", background: i % 2 === 0 ? "transparent" : "#0F172A10" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: "600", fontSize: "14px" }}>{m.name}</div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>{m.businessName || "-"}</div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "#94A3B8" }}>{m.email}</td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "#94A3B8" }}>{m.country}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ background: `${planColor[m.plan]}20`, color: planColor[m.plan], padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>{m.plan}</span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ background: `${statusColor[m.status]}20`, color: statusColor[m.status], padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>{m.status}</span>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "#94A3B8" }}>{m._count?.customers || 0}</td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "#94A3B8" }}>{m._count?.invoices || 0}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {m.status !== "ACTIVE" && (
                          <button onClick={() => updateStatus(m.id, "ACTIVE")}
                            style={{ padding: "5px 10px", background: "#04785720", color: "#047857", border: "1px solid #047857", borderRadius: "5px", fontSize: "11px", cursor: "pointer" }}>Activate</button>
                        )}
                        {m.status !== "SUSPENDED" && (
                          <button onClick={() => updateStatus(m.id, "SUSPENDED")}
                            style={{ padding: "5px 10px", background: "#DC262620", color: "#DC2626", border: "1px solid #DC2626", borderRadius: "5px", fontSize: "11px", cursor: "pointer" }}>Suspend</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {total > 20 && (
              <div style={{ padding: "16px 24px", borderTop: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "13px", color: "#64748B" }}>Showing {((page-1)*20)+1}–{Math.min(page*20, total)} of {total}</span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                    style={{ padding: "6px 14px", background: "#334155", color: "#FFFFFF", border: "none", borderRadius: "6px", fontSize: "13px", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1 }}>Prev</button>
                  <button onClick={() => setPage(p => p+1)} disabled={page*20 >= total}
                    style={{ padding: "6px 14px", background: "#2563EB", color: "#FFFFFF", border: "none", borderRadius: "6px", fontSize: "13px", cursor: page*20 >= total ? "not-allowed" : "pointer", opacity: page*20 >= total ? 0.5 : 1 }}>Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
