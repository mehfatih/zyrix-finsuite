// ================================================================
// Zyrix FinSuite — Customer Dashboard (Final)
// Animated charts, AI insights, dynamic pivots, vivid colors
// ================================================================

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const P = {
  bg: "#070B14", surface: "#0D1220", card: "#111827", border: "#1E2A3A",
  purple: "#7C3AED", violet: "#A855F7", pink: "#EC4899", cyan: "#06B6D4",
  emerald: "#10B981", amber: "#F59E0B", rose: "#F43F5E", sky: "#0EA5E9",
  lime: "#84CC16", orange: "#F97316", text: "#F1F5F9", muted: "#64748B",
};
const COLORS = [P.violet, P.cyan, P.emerald, P.amber, P.pink, P.sky, P.lime, P.orange];

async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("zyrix_token");
  const res = await fetch(`http://localhost:3000${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts.headers },
  });
  if (res.status === 401) { window.location.href = "/login"; return; }
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
  return data;
}

function useApi(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const load = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try { setState({ data: await fn(), loading: false, error: null }); }
    catch (e) { setState({ data: null, loading: false, error: e.message }); }
  }, deps);
  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}

// ── Animated Counter ──────────────────────────────
function Counter({ value, prefix = "", suffix = "" }) {
  const [n, setN] = useState(0);
  const ref = useRef();
  useEffect(() => {
    const end = Number(value) || 0;
    const dur = 1000, start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      setN(Math.round(end * (1 - Math.pow(1 - t, 3))));
      if (t < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);
  return <>{prefix}{n.toLocaleString()}{suffix}</>;
}

// ── Animated Bar Chart ────────────────────────────
function BarChart({ bars, height = 130 }) {
  const [prog, setProg] = useState(0);
  const ref = useRef();
  useEffect(() => {
    setProg(0);
    const s = performance.now();
    const tick = t => { const p = Math.min((t - s) / 900, 1); setProg(1 - Math.pow(1 - p, 3)); if (p < 1) ref.current = requestAnimationFrame(tick); };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [JSON.stringify(bars)]);
  if (!bars?.length) return <div style={{ color: P.muted, textAlign: "center", padding: 20, fontSize: 13 }}>No data</div>;
  const max = Math.max(...bars.map(b => b.value), 1);
  const bw = Math.max(10, 80 / bars.length - 2);
  const gap = (100 - bw * bars.length) / (bars.length + 1);
  return (
    <svg viewBox={`0 0 100 ${height}`} style={{ width: "100%", height }} preserveAspectRatio="none">
      {bars.map((b, i) => {
        const bh = (b.value / max) * (height - 22) * prog;
        const x = gap + i * (bw + gap);
        return (
          <g key={i}>
            <rect x={x} y={height - 18 - bh} width={bw} height={bh} fill={b.color} opacity={0.8} rx={2} />
            <rect x={x} y={height - 18 - bh} width={bw} height={Math.min(3, bh)} fill={b.color} rx={1} />
            <text x={x + bw / 2} y={height - 3} textAnchor="middle" fill={P.muted} fontSize={5.5}>{b.label}</text>
            {bh > 14 && <text x={x + bw / 2} y={height - 22 - bh + 10} textAnchor="middle" fill="#fff" fontSize={5} fontWeight="700">{b.value}</text>}
          </g>
        );
      })}
    </svg>
  );
}

// ── Donut Chart ───────────────────────────────────
function Donut({ segs, size = 130 }) {
  const [prog, setProg] = useState(0);
  const ref = useRef();
  useEffect(() => {
    setProg(0);
    const s = performance.now();
    const tick = t => { const p = Math.min((t - s) / 1000, 1); setProg(1 - Math.pow(1 - p, 3)); if (p < 1) ref.current = requestAnimationFrame(tick); };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [JSON.stringify(segs)]);
  const total = segs.reduce((s, sg) => s + sg.value, 0) || 1;
  const r = size * 0.37, cx = size / 2, cy = size / 2, circ = 2 * Math.PI * r;
  let off = 0;
  return (
    <svg width={size} height={size}>
      {segs.map((sg, i) => {
        const pct = (sg.value / total) * prog;
        const dash = pct * circ;
        const o = -(off * circ - circ * 0.25);
        off += sg.value / total;
        return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={sg.color} strokeWidth={size * 0.13} strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={o} />;
      })}
      <text x={cx} y={cy - 3} textAnchor="middle" fill={P.text} fontSize={size * 0.12} fontWeight="800" fontFamily="monospace">{total}</text>
      <text x={cx} y={cy + size * 0.12} textAnchor="middle" fill={P.muted} fontSize={size * 0.08}>total</text>
    </svg>
  );
}

// ── KPI Card ──────────────────────────────────────
function KPI({ label, value, prefix = "", suffix = "", change, color, icon }) {
  const isUp = (change ?? 0) >= 0;
  return (
    <div style={{ background: `linear-gradient(135deg,${color}12,${P.card} 70%)`, border: `1px solid ${color}30`, borderRadius: 14, padding: "16px 18px", position: "relative", overflow: "hidden", cursor: "default", transition: "transform 0.2s,box-shadow 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${color}22`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
      <div style={{ position: "absolute", top: -16, right: -16, width: 64, height: 64, borderRadius: "50%", background: color, opacity: 0.07, filter: "blur(14px)" }} />
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ background: `${color}20`, borderRadius: 8, padding: "5px 8px", fontSize: 16 }}>{icon}</div>
        {change != null && <div style={{ color: isUp ? P.emerald : P.rose, fontSize: 11, fontWeight: 700, background: isUp ? `${P.emerald}15` : `${P.rose}15`, borderRadius: 20, padding: "2px 7px" }}>{isUp ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%</div>}
      </div>
      <div style={{ color: P.text, fontSize: 24, fontWeight: 800, fontFamily: "monospace", letterSpacing: -0.5, marginBottom: 3 }}>
        <Counter value={value} prefix={prefix} suffix={suffix} />
      </div>
      <div style={{ color: P.muted, fontSize: 12 }}>{label}</div>
    </div>
  );
}

// ── AI Insight ────────────────────────────────────
function AIInsight({ kpis, color }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!kpis) return;
    setLoading(true); setText("");
    apiFetch("/api/ai/insight", {
      method: "POST",
      body: JSON.stringify({ context: "merchant dashboard", data: kpis, prompt: "Give one short actionable business insight in max 2 sentences based on these KPIs." }),
    }).then(r => setText(r?.data?.insight || r?.insight || localInsight(kpis)))
      .catch(() => setText(localInsight(kpis)))
      .finally(() => setLoading(false));
  }, [JSON.stringify(kpis)]);

  return (
    <div style={{ background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 12, padding: "14px 18px", display: "flex", gap: 12, marginTop: 16 }}>
      <span style={{ fontSize: 22 }}>🤖</span>
      <div>
        <div style={{ color: color, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>AI Business Insight</div>
        <div style={{ color: loading ? P.muted : P.text, fontSize: 13, lineHeight: 1.6 }}>
          {loading ? "Analyzing your data..." : text || "No data to analyze yet."}
        </div>
      </div>
    </div>
  );
}

function localInsight(k) {
  if (!k) return "Connect your data to get insights.";
  if (k.overdueInvoices > 0) return `You have ${k.overdueInvoices} overdue invoice(s) — follow up today to recover cash flow.`;
  if (k.revenueGrowth > 0) return `Revenue grew ${k.revenueGrowth}% — capitalize on this momentum by upselling your top customers.`;
  if (k.revenueGrowth < 0) return `Revenue is down ${Math.abs(k.revenueGrowth)}% — consider a re-engagement campaign for dormant customers.`;
  if (k.pendingTasks > 5) return `${k.pendingTasks} pending tasks — prioritize high-value deals to improve pipeline conversion.`;
  return "Metrics look stable. Focus on increasing customer lifetime value through personalized follow-ups.";
}

// ── Pivot Table ───────────────────────────────────
function Pivot({ rows, cols, data, rk, ck, vk, color }) {
  const get = (r, c) => (data.find(d => d[rk] === r && d[ck] === c)?.[vk]) || 0;
  const totals = rows.map(r => cols.reduce((s, c) => s + get(r, c), 0));
  const max = Math.max(...totals, 1);
  if (!rows.length) return null;
  return (
    <div style={{ overflowX: "auto", marginTop: 14 }}>
      <div style={{ color: P.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Pivot Analysis</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${P.border}` }}>
            <th style={{ padding: "7px 12px", textAlign: "left", color: P.muted }}>{rk}</th>
            {cols.map(c => <th key={c} style={{ padding: "7px 12px", textAlign: "right", color: P.muted }}>{c}</th>)}
            <th style={{ padding: "7px 12px", textAlign: "right", color }}>Total</th>
            <th style={{ padding: "7px 12px", minWidth: 70 }} />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row} onMouseEnter={e => e.currentTarget.style.background = `${color}08`} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <td style={{ padding: "7px 12px", color: P.text, borderBottom: `1px solid ${P.border}20` }}>{row}</td>
              {cols.map(col => <td key={col} style={{ padding: "7px 12px", color: P.muted, textAlign: "right", borderBottom: `1px solid ${P.border}20`, fontFamily: "monospace" }}>{get(row, col)}</td>)}
              <td style={{ padding: "7px 12px", color, textAlign: "right", fontWeight: 700, borderBottom: `1px solid ${P.border}20`, fontFamily: "monospace" }}>{totals[i].toLocaleString()}</td>
              <td style={{ padding: "7px 12px", borderBottom: `1px solid ${P.border}20` }}>
                <div style={{ height: 6, background: `${color}20`, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${(totals[i] / max) * 100}%`, height: "100%", background: color, borderRadius: 3, transition: "width 1s ease" }} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────
function Section({ title, icon, color, children }) {
  return (
    <div style={{ background: P.card, border: `1px solid ${color}25`, borderRadius: 18, overflow: "hidden", marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "15px 20px", borderBottom: `1px solid ${P.border}`, background: `linear-gradient(90deg,${color}12,transparent)` }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ color: P.text, fontSize: 15, fontWeight: 700 }}>{title}</span>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

// ── Table ─────────────────────────────────────────
function Table({ cols, rows, color, emptyMsg = "No data yet" }) {
  return (
    <div style={{ background: P.card, border: `1px solid ${color}25`, borderRadius: 14, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: `${color}10`, borderBottom: `1px solid ${P.border}` }}>
            {cols.map(c => <th key={c.key} style={{ padding: "11px 16px", textAlign: "left", color: P.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {!rows.length
            ? <tr><td colSpan={cols.length} style={{ padding: 40, textAlign: "center", color: P.muted, fontSize: 14 }}>{emptyMsg}</td></tr>
            : rows.map((row, i) => (
              <tr key={row.id || i} onMouseEnter={e => e.currentTarget.style.background = `${color}08`} onMouseLeave={e => e.currentTarget.style.background = "transparent"} style={{ borderBottom: `1px solid ${P.border}20`, transition: "background 0.1s" }}>
                {cols.map(c => <td key={c.key} style={{ padding: "12px 16px" }}>{c.render ? c.render(row, i) : <span style={{ color: P.text, fontSize: 13 }}>{row[c.key] ?? "—"}</span>}</td>)}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main ──────────────────────────────────────────
export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState("overview");

  const { data: sd } = useApi(() => apiFetch("/api/dashboard/stats").then(r => r?.data));
  const { data: cd } = useApi(() => apiFetch("/api/customers").then(r => r?.data));
  const { data: dd } = useApi(() => apiFetch("/api/deals").then(r => r?.data));
  const { data: id } = useApi(() => apiFetch("/api/invoices").then(r => r?.data));

  const kpis = sd?.kpis;
  const recent = sd?.recent;
  const customers = Array.isArray(cd) ? cd : cd?.customers || cd?.items || [];
  const deals = Array.isArray(dd) ? dd : dd?.deals || dd?.items || [];
  const invoices = Array.isArray(id) ? id : id?.invoices || id?.items || [];

  // Chart data
  const revBars = [{ label: "Last Mo", value: kpis?.revenueLastMonth || 0 }, { label: "This Mo", value: kpis?.revenueThisMonth || 0 }];
  const dealStages = deals.reduce((a, d) => { a[d.stage] = (a[d.stage] || 0) + 1; return a; }, {});
  const dealBars = Object.entries(dealStages).map(([l, v]) => ({ label: l.slice(0, 5), value: v }));
  const invStatus = invoices.reduce((a, inv) => { a[inv.status] = (a[inv.status] || 0) + 1; return a; }, {});
  const invBars = Object.entries(invStatus).map(([l, v]) => ({ label: l.slice(0, 4), value: v }));
  const custMonths = customers.reduce((a, c) => { const m = new Date(c.createdAt).toLocaleString("en-US", { month: "short" }); a[m] = (a[m] || 0) + 1; return a; }, {});
  const custBars = Object.entries(custMonths).map(([l, v]) => ({ label: l, value: v }));

  // Pivot raw data
  const dealPivot = deals.map(d => ({ stage: d.stage || "N/A", month: new Date(d.createdAt).toLocaleString("en-US", { month: "short" }), count: 1 }));
  const invPivot = invoices.map(inv => ({ status: inv.status || "N/A", month: new Date(inv.createdAt).toLocaleString("en-US", { month: "short" }), amount: Number(inv.total) || 0 }));
  const dpRows = [...new Set(dealPivot.map(d => d.stage))];
  const dpCols = [...new Set(dealPivot.map(d => d.month))].slice(0, 5);
  const ipRows = [...new Set(invPivot.map(d => d.status))];
  const ipCols = [...new Set(invPivot.map(d => d.month))].slice(0, 5);

  const NAV = [
    { id: "overview",  icon: "⊞", label: "Overview" },
    { id: "customers", icon: "👥", label: "Customers" },
    { id: "deals",     icon: "🤝", label: "Deals",    badge: kpis?.pendingTasks },
    { id: "invoices",  icon: "📄", label: "Invoices", badge: kpis?.overdueInvoices, badgeColor: P.rose },
    { id: "tasks",     icon: "✅", label: "Tasks" },
  ];

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}body{margin:0;background:${P.bg}}::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:${P.bg}}::-webkit-scrollbar-thumb{background:${P.border};border-radius:2px}::-webkit-scrollbar-thumb:hover{background:${P.violet}}`}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: P.bg, fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif" }}>

        {/* Sidebar */}
        <aside style={{ width: 216, background: P.surface, borderRight: `1px solid ${P.border}`, display: "flex", flexDirection: "column", padding: "18px 10px", gap: 2, position: "sticky", top: 0, height: "100vh" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 26, padding: "0 8px" }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg,${P.violet},${P.pink})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 14px ${P.violet}40` }}>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 15 }}>Z</span>
            </div>
            <div>
              <div style={{ color: P.text, fontWeight: 800, fontSize: 14, lineHeight: 1 }}>Zyrix</div>
              <div style={{ color: P.violet, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em" }}>FINSUITE</div>
            </div>
          </div>

          {NAV.map(item => {
            const active = page === item.id;
            return (
              <button key={item.id} onClick={() => setPage(item.id)} style={{ background: active ? `linear-gradient(90deg,${P.violet}28,${P.violet}10)` : "transparent", border: `1px solid ${active ? P.violet : "transparent"}`, borderRadius: 9, color: active ? P.violet : P.muted, padding: "9px 12px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 9, fontSize: 13, fontWeight: active ? 600 : 400, transition: "all 0.15s" }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#ffffff08"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge > 0 && <span style={{ background: item.badgeColor || P.amber, color: item.badgeColor === P.rose ? "#fff" : "#000", borderRadius: 20, fontSize: 9, fontWeight: 700, padding: "1px 5px" }}>{item.badge}</span>}
              </button>
            );
          })}

          <div style={{ marginTop: "auto", paddingTop: 14, borderTop: `1px solid ${P.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9, padding: "0 4px" }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${P.violet},${P.pink})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {(user?.name || "U")[0].toUpperCase()}
              </div>
              <div style={{ overflow: "hidden" }}>
                <div style={{ color: P.text, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name || "Merchant"}</div>
                <div style={{ color: P.muted, fontSize: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</div>
              </div>
            </div>
            <button onClick={logout} style={{ width: "100%", background: `${P.rose}15`, border: `1px solid ${P.rose}30`, color: P.rose, borderRadius: 8, padding: "8px 0", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Sign Out</button>
          </div>
        </aside>

        {/* Content */}
        <main style={{ flex: 1, padding: "28px 32px", overflow: "auto", animation: "fadeIn 0.35s ease" }}>

          {/* OVERVIEW */}
          {page === "overview" && (
            <div>
              <h1 style={{ color: P.text, fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>Dashboard</h1>
              <p style={{ color: P.muted, fontSize: 13, margin: "0 0 24px" }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>

              {/* Revenue */}
              <Section title="Revenue & Finance" icon="💰" color={P.emerald}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 18 }}>
                  <KPI label="Revenue This Month" value={kpis?.revenueThisMonth || 0} prefix="$" color={P.emerald} icon="💵" change={kpis?.revenueGrowth} />
                  <KPI label="Pipeline Value" value={kpis?.pipelineValue || 0} prefix="$" color={P.cyan} icon="📊" />
                  <KPI label="Overdue Invoices" value={kpis?.overdueInvoices || 0} color={P.rose} icon="⚠️" />
                </div>
                <div style={{ background: P.surface, borderRadius: 12, padding: "14px 16px", border: `1px solid ${P.emerald}20` }}>
                  <div style={{ color: P.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Revenue Chart</div>
                  <BarChart bars={revBars.map((b, i) => ({ ...b, color: COLORS[i] }))} height={110} />
                </div>
                <AIInsight kpis={kpis} color={P.emerald} />
              </Section>

              {/* Customers */}
              <Section title="Customers" icon="👥" color={P.violet}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, marginBottom: 18 }}>
                  <KPI label="Total Customers" value={kpis?.totalCustomers || 0} color={P.violet} icon="👤" />
                  <KPI label="New This Month" value={kpis?.newCustomersThisMonth || 0} color={P.pink} icon="✨" />
                </div>
                {custBars.length > 0 && (
                  <div style={{ background: P.surface, borderRadius: 12, padding: "14px 16px", border: `1px solid ${P.violet}20` }}>
                    <div style={{ color: P.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Monthly Growth</div>
                    <BarChart bars={custBars.map((b, i) => ({ ...b, color: COLORS[i % COLORS.length] }))} height={100} />
                  </div>
                )}
                <AIInsight kpis={{ ...kpis, totalCustomers: customers.length }} color={P.violet} />
              </Section>

              {/* Deals */}
              <Section title="Deals & Pipeline" icon="🤝" color={P.amber}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, marginBottom: 18 }}>
                  <KPI label="Total Deals" value={kpis?.totalDeals || 0} color={P.amber} icon="🎯" />
                  <KPI label="Won This Month" value={kpis?.wonDealsThisMonth || 0} color={P.lime} icon="🏆" />
                </div>
                {dealBars.length > 0 && (
                  <div style={{ background: P.surface, borderRadius: 12, padding: "14px 16px", border: `1px solid ${P.amber}20`, display: "flex", gap: 20, alignItems: "center" }}>
                    <Donut segs={dealBars.map((b, i) => ({ value: b.value, color: COLORS[i % COLORS.length] }))} size={120} />
                    <div style={{ flex: 1 }}>
                      {dealBars.map((b, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i % COLORS.length] }} />
                          <span style={{ color: P.muted, fontSize: 12, flex: 1 }}>{b.label}</span>
                          <span style={{ color: COLORS[i % COLORS.length], fontWeight: 700, fontSize: 12 }}>{b.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {dpRows.length > 0 && <Pivot rows={dpRows} cols={dpCols} data={dealPivot} rk="stage" ck="month" vk="count" color={P.amber} />}
                <AIInsight kpis={{ ...kpis, totalDeals: deals.length }} color={P.amber} />
              </Section>

              {/* Tasks */}
              <Section title="Tasks & Operations" icon="✅" color={P.sky}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 18 }}>
                  <KPI label="Pending Tasks" value={kpis?.pendingTasks || 0} color={P.sky} icon="📋" />
                  <KPI label="Total Invoices" value={kpis?.totalInvoices || 0} color={P.orange} icon="🧾" />
                  <KPI label="Paid This Month" value={kpis?.paidInvoicesThisMonth || 0} color={P.emerald} icon="✅" />
                </div>
                {invBars.length > 0 && (
                  <div style={{ background: P.surface, borderRadius: 12, padding: "14px 16px", border: `1px solid ${P.sky}20` }}>
                    <div style={{ color: P.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Invoice Status</div>
                    <BarChart bars={invBars.map((b, i) => ({ ...b, color: COLORS[i % COLORS.length] }))} height={100} />
                  </div>
                )}
                {ipRows.length > 0 && <Pivot rows={ipRows} cols={ipCols} data={invPivot} rk="status" ck="month" vk="amount" color={P.sky} />}
                <AIInsight kpis={kpis} color={P.sky} />
              </Section>
            </div>
          )}

          {/* CUSTOMERS PAGE */}
          {page === "customers" && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              <h1 style={{ color: P.text, fontSize: 24, fontWeight: 800, margin: "0 0 20px" }}>Customers</h1>
              <Table color={P.violet} rows={customers}
                cols={[
                  { key: "name", label: "Name", render: (c, i) => (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${COLORS[i % COLORS.length]}25`, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS[i % COLORS.length], fontSize: 11, fontWeight: 700 }}>
                        {(c.name || "?")[0].toUpperCase()}
                      </div>
                      <span style={{ color: P.text, fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                    </div>
                  )},
                  { key: "email", label: "Email", render: c => <span style={{ color: P.muted, fontSize: 12 }}>{c.email || "—"}</span> },
                  { key: "phone", label: "Phone", render: c => <span style={{ color: P.muted, fontSize: 12 }}>{c.phone || "—"}</span> },
                  { key: "loyaltyPoints", label: "Loyalty", render: c => <span style={{ color: P.amber, fontWeight: 700, fontSize: 13 }}>{c.loyaltyPoints || 0} pts</span> },
                  { key: "createdAt", label: "Joined", render: c => <span style={{ color: P.muted, fontSize: 12 }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</span> },
                ]} />
              {custBars.length > 0 && (
                <div style={{ marginTop: 20, background: P.card, border: `1px solid ${P.violet}25`, borderRadius: 14, padding: 20 }}>
                  <div style={{ color: P.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Monthly Growth</div>
                  <BarChart bars={custBars.map((b, i) => ({ ...b, color: COLORS[i % COLORS.length] }))} height={100} />
                  <AIInsight kpis={{ ...kpis, totalCustomers: customers.length }} color={P.violet} />
                </div>
              )}
            </div>
          )}

          {/* DEALS PAGE */}
          {page === "deals" && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              <h1 style={{ color: P.text, fontSize: 24, fontWeight: 800, margin: "0 0 20px" }}>Deals Pipeline</h1>
              <Table color={P.amber} rows={deals}
                cols={[
                  { key: "title", label: "Title", render: d => <span style={{ color: P.text, fontSize: 13, fontWeight: 500 }}>{d.title}</span> },
                  { key: "value", label: "Value", render: d => <span style={{ color: P.emerald, fontWeight: 700, fontSize: 13, fontFamily: "monospace" }}>${Number(d.value || 0).toLocaleString()}</span> },
                  { key: "stage", label: "Stage", render: d => {
                    const c = { WON: P.emerald, LOST: P.rose, PROPOSAL: P.amber, NEGOTIATION: P.orange, QUALIFIED: P.cyan }[d.stage] || P.muted;
                    return <span style={{ background: `${c}20`, color: c, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{d.stage}</span>;
                  }},
                  { key: "probability", label: "Probability", render: d => (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 60, height: 5, background: P.border, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${d.probability || 0}%`, height: "100%", background: P.amber, borderRadius: 3 }} />
                      </div>
                      <span style={{ color: P.muted, fontSize: 11 }}>{d.probability || 0}%</span>
                    </div>
                  )},
                  { key: "createdAt", label: "Date", render: d => <span style={{ color: P.muted, fontSize: 12 }}>{d.createdAt ? new Date(d.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}</span> },
                ]} />
              {dealBars.length > 0 && (
                <div style={{ marginTop: 20, background: P.card, border: `1px solid ${P.amber}25`, borderRadius: 14, padding: 20 }}>
                  <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 12 }}>
                    <Donut segs={dealBars.map((b, i) => ({ value: b.value, color: COLORS[i % COLORS.length] }))} size={110} />
                    <div>{dealBars.map((b, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i % COLORS.length] }} />
                        <span style={{ color: P.muted, fontSize: 12, flex: 1 }}>{b.label}</span>
                        <span style={{ color: COLORS[i % COLORS.length], fontWeight: 700, fontSize: 12 }}>{b.value}</span>
                      </div>
                    ))}</div>
                  </div>
                  {dpRows.length > 0 && <Pivot rows={dpRows} cols={dpCols} data={dealPivot} rk="stage" ck="month" vk="count" color={P.amber} />}
                  <AIInsight kpis={{ ...kpis, totalDeals: deals.length }} color={P.amber} />
                </div>
              )}
            </div>
          )}

          {/* INVOICES PAGE */}
          {page === "invoices" && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              <h1 style={{ color: P.text, fontSize: 24, fontWeight: 800, margin: "0 0 20px" }}>Invoices</h1>
              <Table color={P.cyan} rows={invoices}
                cols={[
                  { key: "invoiceNumber", label: "Invoice #", render: inv => <span style={{ color: P.cyan, fontFamily: "monospace", fontWeight: 600, fontSize: 13 }}>{inv.invoiceNumber || inv.id?.slice(0, 8)}</span> },
                  { key: "customerName", label: "Customer", render: inv => <span style={{ color: P.text, fontSize: 13 }}>{inv.customerName || "—"}</span> },
                  { key: "total", label: "Amount", render: inv => <span style={{ color: P.emerald, fontWeight: 700, fontSize: 13, fontFamily: "monospace" }}>${Number(inv.total || 0).toLocaleString()}</span> },
                  { key: "status", label: "Status", render: inv => {
                    const c = { PAID: P.emerald, PENDING: P.amber, OVERDUE: P.rose, DRAFT: P.muted, CANCELLED: P.muted }[inv.status] || P.muted;
                    return <span style={{ background: `${c}20`, color: c, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{inv.status}</span>;
                  }},
                  { key: "createdAt", label: "Date", render: inv => <span style={{ color: P.muted, fontSize: 12 }}>{inv.createdAt ? new Date(inv.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}</span> },
                ]} />
              {invBars.length > 0 && (
                <div style={{ marginTop: 20, background: P.card, border: `1px solid ${P.cyan}25`, borderRadius: 14, padding: 20 }}>
                  <div style={{ color: P.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Status Breakdown</div>
                  <BarChart bars={invBars.map((b, i) => ({ ...b, color: COLORS[i % COLORS.length] }))} height={100} />
                  {ipRows.length > 0 && <Pivot rows={ipRows} cols={ipCols} data={invPivot} rk="status" ck="month" vk="amount" color={P.cyan} />}
                  <AIInsight kpis={{ ...kpis, overdueInvoices: invoices.filter(i => i.status === "OVERDUE").length }} color={P.cyan} />
                </div>
              )}
            </div>
          )}

          {/* TASKS PAGE */}
          {page === "tasks" && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              <h1 style={{ color: P.text, fontSize: 24, fontWeight: 800, margin: "0 0 20px" }}>Tasks</h1>
              <Table color={P.sky} rows={recent?.tasks || []}
                cols={[
                  { key: "title", label: "Task", render: t => <span style={{ color: P.text, fontSize: 13, fontWeight: 500 }}>{t.title}</span> },
                  { key: "priority", label: "Priority", render: t => {
                    const c = { HIGH: P.rose, MEDIUM: P.amber, LOW: P.emerald }[t.priority] || P.muted;
                    return <span style={{ background: `${c}20`, color: c, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{t.priority}</span>;
                  }},
                  { key: "status", label: "Status", render: t => {
                    const c = { IN_PROGRESS: P.sky, TODO: P.muted, DONE: P.emerald }[t.status] || P.muted;
                    return <span style={{ background: `${c}20`, color: c, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{t.status}</span>;
                  }},
                  { key: "dueDate", label: "Due", render: t => {
                    const overdue = t.dueDate && new Date(t.dueDate) < new Date();
                    return <span style={{ color: overdue ? P.rose : P.muted, fontSize: 12, fontWeight: overdue ? 600 : 400 }}>{t.dueDate ? new Date(t.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}</span>;
                  }},
                ]} emptyMsg="No pending tasks 🎉" />
              <div style={{ marginTop: 20, background: P.card, border: `1px solid ${P.sky}25`, borderRadius: 14, padding: 20 }}>
                <AIInsight kpis={kpis} color={P.sky} />
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  );
}