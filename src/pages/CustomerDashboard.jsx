// ================================================================
// Zyrix FinSuite — Customer Dashboard (Light + Vivid)
// ================================================================

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

// ── Light Palette ─────────────────────────────────
const P = {
  bg:       "#F0F4FF",
  surface:  "#FFFFFF",
  card:     "#FFFFFF",
  sidebar:  "#FFFFFF",
  border:   "#E2E8F8",
  purple:   "#6C3AFF",
  violet:   "#8B5CF6",
  pink:     "#F43F8E",
  cyan:     "#0EA5E9",
  emerald:  "#10B981",
  amber:    "#F59E0B",
  rose:     "#F43F5E",
  sky:      "#38BDF8",
  lime:     "#84CC16",
  orange:   "#F97316",
  indigo:   "#6366F1",
  teal:     "#14B8A6",
  text:     "#1E1B4B",
  sub:      "#64748B",
  muted:    "#94A3B8",
  light:    "#F8FAFF",
};

const COLORS = [P.purple, P.cyan, P.emerald, P.amber, P.pink, P.indigo, P.teal, P.orange];
const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("zyrix_token");
  const res = await fetch(`${API}${path}`, {
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
    const s = performance.now();
    const tick = t => {
      const p = Math.min((t - s) / 1200, 1);
      setN(Math.round(end * (1 - Math.pow(1 - p, 4))));
      if (p < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);
  return <>{prefix}{n.toLocaleString()}{suffix}</>;
}

// ── Sparkline ─────────────────────────────────────
function Sparkline({ data = [], color, w = 80, h = 30 }) {
  if (data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`sg${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill={`url(#sg${color.replace("#","")})`} stroke="none" points={`0,${h} ${pts} ${w},${h}`} />
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

// ── Bar Chart ─────────────────────────────────────
function BarChart({ bars, height = 120 }) {
  const [prog, setProg] = useState(0);
  const ref = useRef();
  useEffect(() => {
    setProg(0);
    const s = performance.now();
    const tick = t => { const p = Math.min((t - s) / 900, 1); setProg(1 - Math.pow(1 - p, 3)); if (p < 1) ref.current = requestAnimationFrame(tick); };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [JSON.stringify(bars)]);
  if (!bars?.length) return <div style={{ color: P.muted, textAlign: "center", padding: 20, fontSize: 13 }}>No data yet</div>;
  const max = Math.max(...bars.map(b => b.value), 1);
  const bw = Math.max(12, 80 / bars.length - 3);
  const gap = (100 - bw * bars.length) / (bars.length + 1);
  return (
    <svg viewBox={`0 0 100 ${height}`} style={{ width: "100%", height }} preserveAspectRatio="none">
      {bars.map((b, i) => {
        const bh = (b.value / max) * (height - 24) * prog;
        const x = gap + i * (bw + gap);
        return (
          <g key={i}>
            <rect x={x} y={height - 18 - bh} width={bw} height={bh} fill={b.color} opacity={0.15} rx={3} />
            <rect x={x} y={height - 18 - bh} width={bw} height={Math.min(4, bh)} fill={b.color} rx={2} />
            {bh > 16 && <text x={x + bw / 2} y={height - 20 - bh + 12} textAnchor="middle" fill={b.color} fontSize={5} fontWeight="700">{b.value}</text>}
            <text x={x + bw / 2} y={height - 3} textAnchor="middle" fill={P.muted} fontSize={5.5}>{b.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Donut ─────────────────────────────────────────
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
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={P.border} strokeWidth={size * 0.13} />
      {segs.map((sg, i) => {
        const pct = (sg.value / total) * prog;
        const dash = pct * circ;
        const o = -(off * circ - circ * 0.25);
        off += sg.value / total;
        return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={sg.color} strokeWidth={size * 0.13} strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={o} strokeLinecap="round" />;
      })}
      <text x={cx} y={cy - 3} textAnchor="middle" fill={P.text} fontSize={size * 0.13} fontWeight="800">{total}</text>
      <text x={cx} y={cy + size * 0.13} textAnchor="middle" fill={P.muted} fontSize={size * 0.08}>total</text>
    </svg>
  );
}

// ── KPI Card ──────────────────────────────────────
function KPI({ label, value, prefix = "", suffix = "", change, color, icon, sparkData }) {
  const isUp = (change ?? 0) >= 0;
  return (
    <div style={{
      background: P.card, borderRadius: 18, padding: "18px 20px",
      border: `1.5px solid ${color}25`,
      boxShadow: `0 4px 24px ${color}10, 0 1px 4px rgba(0,0,0,0.04)`,
      position: "relative", overflow: "hidden",
      transition: "transform 0.2s, box-shadow 0.2s", cursor: "default",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 12px 36px ${color}20, 0 2px 8px rgba(0,0,0,0.06)`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 4px 24px ${color}10, 0 1px 4px rgba(0,0,0,0.04)`; }}>

      {/* Top accent bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${color}, ${color}60)`, borderRadius: "18px 18px 0 0" }} />

      {/* BG blob */}
      <div style={{ position: "absolute", bottom: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: color, opacity: 0.06 }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, marginTop: 4 }}>
        <div style={{ background: `${color}15`, borderRadius: 12, padding: "8px 10px", fontSize: 20 }}>{icon}</div>
        {change != null && (
          <div style={{ color: isUp ? P.emerald : P.rose, fontSize: 11, fontWeight: 700, background: isUp ? `${P.emerald}12` : `${P.rose}12`, borderRadius: 20, padding: "3px 9px", border: `1px solid ${isUp ? P.emerald : P.rose}20` }}>
            {isUp ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>

      <div style={{ color: P.text, fontSize: 26, fontWeight: 800, letterSpacing: -1, marginBottom: 4 }}>
        <Counter value={value} prefix={prefix} suffix={suffix} />
      </div>
      <div style={{ color: P.sub, fontSize: 12, fontWeight: 500 }}>{label}</div>
      {sparkData?.length > 1 && <div style={{ marginTop: 10 }}><Sparkline data={sparkData} color={color} w={90} h={28} /></div>}
    </div>
  );
}

// ── Chart Card ────────────────────────────────────
function ChartCard({ title, color, icon, children }) {
  return (
    <div style={{
      background: P.card, borderRadius: 18, overflow: "hidden",
      border: `1.5px solid ${color}20`,
      boxShadow: `0 4px 24px ${color}08, 0 1px 4px rgba(0,0,0,0.04)`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 20px", borderBottom: `1px solid ${P.border}`, background: `linear-gradient(90deg,${color}08,transparent)` }}>
        <div style={{ background: `${color}15`, borderRadius: 10, padding: "6px 9px", fontSize: 16 }}>{icon}</div>
        <span style={{ color: P.text, fontSize: 14, fontWeight: 700 }}>{title}</span>
        <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: `0 0 8px ${color}` }} />
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

// ── Pivot Table ───────────────────────────────────
function Pivot({ rows, cols, data, rk, ck, vk, color }) {
  const get = (r, c) => (data.find(d => d[rk] === r && d[ck] === c)?.[vk]) || 0;
  const totals = rows.map(r => cols.reduce((s, c) => s + get(r, c), 0));
  const max = Math.max(...totals, 1);
  if (!rows.length) return null;
  return (
    <div style={{ overflowX: "auto", marginTop: 16 }}>
      <div style={{ color: P.muted, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Pivot Analysis</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: `${color}08` }}>
            <th style={{ padding: "8px 12px", textAlign: "left", color: P.sub, borderBottom: `1px solid ${P.border}`, borderRadius: "8px 0 0 0" }}>{rk}</th>
            {cols.map(c => <th key={c} style={{ padding: "8px 12px", textAlign: "right", color: P.sub, borderBottom: `1px solid ${P.border}` }}>{c}</th>)}
            <th style={{ padding: "8px 12px", textAlign: "right", color, fontWeight: 700, borderBottom: `1px solid ${P.border}` }}>Total</th>
            <th style={{ padding: "8px 12px", minWidth: 80, borderBottom: `1px solid ${P.border}` }} />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row} onMouseEnter={e => e.currentTarget.style.background = `${color}06`} onMouseLeave={e => e.currentTarget.style.background = "transparent"} style={{ transition: "background 0.1s" }}>
              <td style={{ padding: "8px 12px", color: P.text, fontWeight: 500, borderBottom: `1px solid ${P.border}40` }}>{row}</td>
              {cols.map(col => <td key={col} style={{ padding: "8px 12px", color: P.sub, textAlign: "right", borderBottom: `1px solid ${P.border}40`, fontFamily: "monospace" }}>{get(row, col)}</td>)}
              <td style={{ padding: "8px 12px", color, textAlign: "right", fontWeight: 700, borderBottom: `1px solid ${P.border}40`, fontFamily: "monospace" }}>{totals[i].toLocaleString()}</td>
              <td style={{ padding: "8px 12px", borderBottom: `1px solid ${P.border}40` }}>
                <div style={{ height: 6, background: `${color}15`, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${(totals[i] / max) * 100}%`, height: "100%", background: `linear-gradient(90deg,${color},${color}80)`, borderRadius: 3, transition: "width 1s ease" }} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
    apiFetch("/api/ai/insight", { method: "POST", body: JSON.stringify({ context: "merchant dashboard", data: kpis, prompt: "One actionable insight in max 2 sentences." }) })
      .then(r => setText(r?.data?.insight || r?.insight || localInsight(kpis)))
      .catch(() => setText(localInsight(kpis)))
      .finally(() => setLoading(false));
  }, [JSON.stringify(kpis)]);
  return (
    <div style={{ background: `linear-gradient(135deg,${color}10,${color}05)`, border: `1.5px solid ${color}20`, borderRadius: 14, padding: "14px 18px", display: "flex", gap: 12, marginTop: 16 }}>
      <div style={{ fontSize: 22, flexShrink: 0, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}>🤖</div>
      <div>
        <div style={{ color, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 5 }}>AI Business Insight</div>
        <div style={{ color: loading ? P.muted : P.text, fontSize: 13, lineHeight: 1.6 }}>{loading ? "Analyzing your data..." : text || "Add data to get insights."}</div>
      </div>
    </div>
  );
}
function localInsight(k) {
  if (!k) return "Add your data to unlock AI-powered business insights.";
  if (k.overdueInvoices > 0) return `You have ${k.overdueInvoices} overdue invoice(s) — follow up today to improve cash flow.`;
  if (k.revenueGrowth > 0) return `Revenue grew ${k.revenueGrowth}% this month — great momentum! Consider upselling to top customers.`;
  if (k.revenueGrowth < 0) return `Revenue dropped ${Math.abs(k.revenueGrowth)}% — a re-engagement campaign could help recover lost customers.`;
  if (k.pendingTasks > 5) return `${k.pendingTasks} pending tasks detected — tackle high-value deals first to maximize ROI.`;
  return "Business metrics look stable. Focus on customer retention to boost lifetime value.";
}

// ── Table ─────────────────────────────────────────
function Table({ cols, rows, color, emptyMsg = "No data yet" }) {
  return (
    <div style={{ background: P.card, borderRadius: 16, overflow: "hidden", border: `1.5px solid ${color}15`, boxShadow: `0 2px 16px ${color}06` }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: `${color}08`, borderBottom: `1.5px solid ${color}15` }}>
            {cols.map(c => <th key={c.key} style={{ padding: "12px 16px", textAlign: "left", color: P.sub, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {!rows.length
            ? <tr><td colSpan={cols.length} style={{ padding: 48, textAlign: "center", color: P.muted, fontSize: 14 }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>🌱</div>
                {emptyMsg}
              </td></tr>
            : rows.map((row, i) => (
              <tr key={row.id || i} onMouseEnter={e => e.currentTarget.style.background = `${color}06`} onMouseLeave={e => e.currentTarget.style.background = "transparent"} style={{ borderBottom: `1px solid ${P.border}`, transition: "background 0.1s" }}>
                {cols.map(c => <td key={c.key} style={{ padding: "12px 16px" }}>{c.render ? c.render(row, i) : <span style={{ color: P.text, fontSize: 13 }}>{row[c.key] ?? "—"}</span>}</td>)}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────
function Sidebar({ page, setPage, user, logout }) {
  const NAV = [
    { id: "overview",  icon: "⊞", label: "Overview" },
    { id: "customers", icon: "👥", label: "Customers" },
    { id: "deals",     icon: "🤝", label: "Deals" },
    { id: "invoices",  icon: "📄", label: "Invoices" },
    { id: "tasks",     icon: "✅", label: "Tasks" },
  ];
  return (
    <aside style={{
      width: 230, background: P.sidebar, borderRight: `1.5px solid ${P.border}`,
      display: "flex", flexDirection: "column", padding: "20px 12px", gap: 3,
      position: "sticky", top: 0, height: "100vh",
      boxShadow: "4px 0 24px rgba(108,58,255,0.06)",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, padding: "0 8px" }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: `linear-gradient(135deg, ${P.purple}, ${P.pink})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 16px ${P.purple}35` }}>
          <span style={{ color: "#fff", fontWeight: 900, fontSize: 17 }}>Z</span>
        </div>
        <div>
          <div style={{ color: P.text, fontWeight: 800, fontSize: 16, lineHeight: 1 }}>Zyrix</div>
          <div style={{ color: P.purple, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>FinSuite</div>
        </div>
      </div>

      {/* Nav */}
      {NAV.map(item => {
        const active = page === item.id;
        return (
          <button key={item.id} onClick={() => setPage(item.id)} style={{
            background: active ? `linear-gradient(90deg,${P.purple}15,${P.purple}06)` : "transparent",
            border: `1.5px solid ${active ? P.purple + "30" : "transparent"}`,
            borderRadius: 12, color: active ? P.purple : P.sub,
            padding: "10px 14px", cursor: "pointer", textAlign: "left",
            display: "flex", alignItems: "center", gap: 10,
            fontSize: 14, fontWeight: active ? 700 : 500,
            transition: "all 0.15s",
          }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = `${P.purple}08`; e.currentTarget.style.color = P.purple; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = P.sub; } }}>
            <span style={{ fontSize: 17 }}>{item.icon}</span>
            {item.label}
          </button>
        );
      })}

      {/* User */}
      <div style={{ marginTop: "auto", paddingTop: 16, borderTop: `1.5px solid ${P.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "8px 10px", background: P.light, borderRadius: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,${P.purple},${P.pink})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0, boxShadow: `0 2px 10px ${P.purple}30` }}>
            {(user?.name || "U")[0].toUpperCase()}
          </div>
          <div style={{ overflow: "hidden", flex: 1 }}>
            <div style={{ color: P.text, fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name || "Merchant"}</div>
            <div style={{ color: P.muted, fontSize: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={logout} style={{ width: "100%", background: `${P.rose}12`, border: `1.5px solid ${P.rose}25`, color: P.rose, borderRadius: 10, padding: "9px 0", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// ── Greeting banner ───────────────────────────────
function GreetingBanner({ user }) {
  const hr = new Date().getHours();
  const greet = hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
  const emoji = hr < 12 ? "☀️" : hr < 17 ? "🌤️" : "🌙";
  return (
    <div style={{
      background: `linear-gradient(135deg, ${P.purple} 0%, ${P.pink} 100%)`,
      borderRadius: 20, padding: "24px 28px", marginBottom: 24,
      position: "relative", overflow: "hidden",
      boxShadow: `0 8px 32px ${P.purple}30`,
    }}>
      {/* Decorative blobs */}
      <div style={{ position: "absolute", top: -20, right: 60, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.1)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -30, right: 20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.08)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 20, right: 140, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.12)", pointerEvents: "none" }} />

      <div style={{ position: "relative" }}>
        <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, marginBottom: 4 }}>{emoji} {greet}!</div>
        <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 800, margin: "0 0 6px", textShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
          {user?.name || "Welcome back"} 👋
        </h1>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────

// ── Notifications Panel ───────────────────────────
function NotificationsPanel({ onClose }) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    apiFetch("/api/notifications")
      .then(r => setNotifs(r?.data?.notifications || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  const markAllRead = async () => {
    await apiFetch("/api/notifications/read-all", { method:"PATCH" });
    setNotifs(n => n.map(x => ({ ...x, isRead:true })));
  };
  const typeColor = { SUCCESS:P.emerald, WARNING:P.amber, ERROR:P.rose, INFO:P.cyan };
  return (
    <div style={{ position:"fixed", top:0, right:0, bottom:0, width:360, background:P.card, borderLeft:`1.5px solid ${P.border}`, zIndex:300, display:"flex", flexDirection:"column", boxShadow:"-8px 0 32px rgba(108,58,255,0.12)" }}>
      <div style={{ padding:"20px 20px 16px", borderBottom:`1.5px solid ${P.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ color:P.text, fontSize:16, fontWeight:800 }}>🔔 Bildirimler</div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={markAllRead} style={{ background:`${P.purple}12`, border:`1px solid ${P.purple}25`, color:P.purple, borderRadius:8, padding:"5px 10px", cursor:"pointer", fontSize:11, fontWeight:700 }}>Tümünü Oku</button>
          <button onClick={onClose} style={{ background:P.light, border:`1px solid ${P.border}`, color:P.sub, borderRadius:8, padding:"5px 10px", cursor:"pointer", fontSize:14 }}>✕</button>
        </div>
      </div>
      <div style={{ flex:1, overflow:"auto", padding:12 }}>
        {loading ? (
          <div style={{ textAlign:"center", padding:40, color:P.muted }}>Yükleniyor...</div>
        ) : notifs.length === 0 ? (
          <div style={{ textAlign:"center", padding:40 }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🎉</div>
            <div style={{ color:P.sub, fontSize:14 }}>Yeni bildirim yok</div>
          </div>
        ) : notifs.map(n => (
          <div key={n.id} style={{ background:n.isRead?P.light:`${typeColor[n.type]||P.cyan}08`, border:`1px solid ${n.isRead?P.border:typeColor[n.type]||P.cyan}25`, borderRadius:12, padding:"12px 14px", marginBottom:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ color:typeColor[n.type]||P.cyan, fontSize:11, fontWeight:700, textTransform:"uppercase" }}>{n.type}</span>
              <span style={{ color:P.muted, fontSize:11 }}>{new Date(n.createdAt).toLocaleDateString("tr-TR")}</span>
            </div>
            <div style={{ color:P.text, fontSize:13, fontWeight:600, marginBottom:3 }}>{n.title}</div>
            <div style={{ color:P.sub, fontSize:12, lineHeight:1.5 }}>{n.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────
function Sidebar({ page, setPage, user, logout, unreadCount, onNotifClick, onSettingsClick, mobileOpen, onMobileClose }) {
  const NAV = [
    { id:"overview",  icon:"⊞", label:"Overview" },
    { id:"customers", icon:"👥", label:"Customers" },
    { id:"deals",     icon:"🤝", label:"Deals" },
    { id:"invoices",  icon:"📄", label:"Invoices" },
    { id:"tasks",     icon:"✅", label:"Tasks" },
  ];
  return (
    <>
      {mobileOpen && <div onClick={onMobileClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:199 }} />}
      <aside style={{ width:230, background:P.sidebar, borderRight:`1.5px solid ${P.border}`, display:"flex", flexDirection:"column", padding:"20px 12px", gap:3, position:"fixed", top:0, left:0, height:"100vh", zIndex:200, boxShadow:"4px 0 24px rgba(108,58,255,0.06)", transform:mobileOpen===false?"translateX(-100%)":"translateX(0)", transition:"transform 0.3s ease" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28, padding:"0 8px" }}>
          <div style={{ width:38, height:38, borderRadius:12, background:`linear-gradient(135deg,${P.purple},${P.pink})`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 16px ${P.purple}35` }}>
            <span style={{ color:"#fff", fontWeight:900, fontSize:17 }}>Z</span>
          </div>
          <div>
            <div style={{ color:P.text, fontWeight:800, fontSize:16, lineHeight:1 }}>Zyrix</div>
            <div style={{ color:P.purple, fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase" }}>FinSuite</div>
          </div>
        </div>
        {NAV.map(item => {
          const active = page === item.id;
          return (
            <button key={item.id} onClick={() => { setPage(item.id); onMobileClose?.(); }} style={{ background:active?`linear-gradient(90deg,${P.purple}15,${P.purple}06)`:"transparent", border:`1.5px solid ${active?P.purple+"30":"transparent"}`, borderRadius:12, color:active?P.purple:P.sub, padding:"10px 14px", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:10, fontSize:14, fontWeight:active?700:500, transition:"all 0.15s" }}
              onMouseEnter={e=>{ if(!active){e.currentTarget.style.background=`${P.purple}08`;e.currentTarget.style.color=P.purple;}}}
              onMouseLeave={e=>{ if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.color=P.sub;}}}>
              <span style={{ fontSize:17 }}>{item.icon}</span>{item.label}
            </button>
          );
        })}
        <div style={{ marginTop:"auto", display:"flex", flexDirection:"column", gap:4 }}>
          <button onClick={onNotifClick} style={{ background:"transparent", border:"1.5px solid transparent", borderRadius:12, color:P.sub, padding:"10px 14px", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:10, fontSize:14, fontWeight:500 }}
            onMouseEnter={e=>{e.currentTarget.style.background=`${P.purple}08`;e.currentTarget.style.color=P.purple;}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=P.sub;}}>
            <span style={{ fontSize:17 }}>🔔</span>Bildirimler
            {unreadCount>0 && <span style={{ marginLeft:"auto", background:P.rose, color:"#fff", borderRadius:20, fontSize:10, fontWeight:700, padding:"1px 6px" }}>{unreadCount}</span>}
          </button>
          <button onClick={onSettingsClick} style={{ background:"transparent", border:"1.5px solid transparent", borderRadius:12, color:P.sub, padding:"10px 14px", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:10, fontSize:14, fontWeight:500 }}
            onMouseEnter={e=>{e.currentTarget.style.background=`${P.purple}08`;e.currentTarget.style.color=P.purple;}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=P.sub;}}>
            <span style={{ fontSize:17 }}>⚙️</span>Ayarlar
          </button>
        </div>
        <div style={{ paddingTop:16, borderTop:`1.5px solid ${P.border}`, marginTop:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12, padding:"8px 10px", background:P.light, borderRadius:12 }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:`linear-gradient(135deg,${P.purple},${P.pink})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:700, flexShrink:0 }}>
              {(user?.name||"U")[0].toUpperCase()}
            </div>
            <div style={{ overflow:"hidden", flex:1 }}>
              <div style={{ color:P.text, fontSize:13, fontWeight:700, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user?.name||"Merchant"}</div>
              <div style={{ color:P.muted, fontSize:10, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user?.email}</div>
            </div>
          </div>
          <button onClick={logout} style={{ width:"100%", background:`${P.rose}12`, border:`1.5px solid ${P.rose}25`, color:P.rose, borderRadius:10, padding:"9px 0", cursor:"pointer", fontSize:13, fontWeight:700 }}>Sign Out</button>
        </div>
      </aside>
    </>
  );
}

// ── Greeting banner ───────────────────────────────
function GreetingBanner({ user }) {
  const hr = new Date().getHours();
  const greet = hr < 12 ? "Günaydın" : hr < 17 ? "İyi öğleden sonralar" : "İyi akşamlar";
  const emoji = hr < 12 ? "☀️" : hr < 17 ? "🌤️" : "🌙";
  return (
    <div style={{ background:`linear-gradient(135deg,${P.purple} 0%,${P.pink} 100%)`, borderRadius:20, padding:"24px 28px", marginBottom:24, position:"relative", overflow:"hidden", boxShadow:`0 8px 32px ${P.purple}30` }}>
      <div style={{ position:"absolute", top:-20, right:60, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.1)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:-30, right:20, width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,0.08)", pointerEvents:"none" }} />
      <div style={{ position:"relative" }}>
        <div style={{ color:"rgba(255,255,255,0.85)", fontSize:14, marginBottom:4 }}>{emoji} {greet}!</div>
        <h1 style={{ color:"#fff", fontSize:26, fontWeight:800, margin:"0 0 6px", textShadow:"0 2px 8px rgba(0,0,0,0.15)" }}>{user?.name||"Hoş geldiniz"} 👋</h1>
        <div style={{ color:"rgba(255,255,255,0.7)", fontSize:13 }}>{new Date().toLocaleDateString("tr-TR",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}</div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────
export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState("overview");
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    apiFetch("/api/notifications").then(r => setUnreadCount(r?.data?.unreadCount||0)).catch(()=>{});
  }, []);

  const { data: sd } = useApi(() => apiFetch("/api/dashboard/stats").then(r => r?.data));
  const { data: cd } = useApi(() => apiFetch("/api/customers").then(r => r?.data));
  const { data: dd } = useApi(() => apiFetch("/api/deals").then(r => r?.data));
  const { data: id } = useApi(() => apiFetch("/api/invoices").then(r => r?.data));

  const kpis      = sd?.kpis;
  const recent    = sd?.recent;
  const customers = Array.isArray(cd) ? cd : cd?.customers || cd?.items || [];
  const deals     = Array.isArray(dd) ? dd : dd?.deals     || dd?.items || [];
  const invoices  = Array.isArray(id) ? id : id?.invoices  || id?.items || [];

  const revBars   = [{ label:"Last Mo", value:kpis?.revenueLastMonth||0 }, { label:"This Mo", value:kpis?.revenueThisMonth||0 }];
  const dealStages = deals.reduce((a,d)=>{ a[d.stage]=(a[d.stage]||0)+1; return a; }, {});
  const dealBars  = Object.entries(dealStages).map(([l,v])=>({ label:l.slice(0,5), value:v }));
  const invStatus = invoices.reduce((a,inv)=>{ a[inv.status]=(a[inv.status]||0)+1; return a; }, {});
  const invBars   = Object.entries(invStatus).map(([l,v])=>({ label:l.slice(0,4), value:v }));
  const custMonths = customers.reduce((a,c)=>{ const m=new Date(c.createdAt).toLocaleString("en-US",{month:"short"}); a[m]=(a[m]||0)+1; return a; }, {});
  const custBars  = Object.entries(custMonths).map(([l,v])=>({ label:l, value:v }));

  const dealPivot = deals.map(d=>({ stage:d.stage||"N/A", month:new Date(d.createdAt).toLocaleString("en-US",{month:"short"}), count:1 }));
  const invPivot  = invoices.map(inv=>({ status:inv.status||"N/A", month:new Date(inv.createdAt).toLocaleString("en-US",{month:"short"}), amount:Number(inv.total)||0 }));
  const dpRows = [...new Set(dealPivot.map(d=>d.stage))];
  const dpCols = [...new Set(dealPivot.map(d=>d.month))].slice(0,5);
  const ipRows = [...new Set(invPivot.map(d=>d.status))];
  const ipCols = [...new Set(invPivot.map(d=>d.month))].slice(0,5);

  const badge = (val, color) => (
    <span style={{ background:`${color}15`, color, border:`1px solid ${color}25`, borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700 }}>{val}</span>
  );

  if (showSettings) {
    const SettingsPage = React.lazy(() => import("./SettingsPage"));
    return (
      <React.Suspense fallback={<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:P.bg}}><div style={{width:40,height:40,border:`3px solid ${P.border}`,borderTopColor:P.purple,borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/></div>}>
        <SettingsPage onClose={() => setShowSettings(false)} />
      </React.Suspense>
    );
  }

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}body{margin:0;background:${P.bg}}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:${P.bg}}::-webkit-scrollbar-thumb{background:${P.border};border-radius:3px}::-webkit-scrollbar-thumb:hover{background:${P.purple}}input::placeholder{color:${P.muted}}select option{background:#fff;color:${P.text}}@media(max-width:768px){.dash-sidebar{display:none!important}.dash-mobile-btn{display:flex!important}}`}</style>

      {showNotifs && <NotificationsPanel onClose={() => setShowNotifs(false)} />}

      <div style={{ display:"flex", minHeight:"100vh", background:P.bg, fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif" }}>
        <Sidebar page={page} setPage={setPage} user={user} logout={logout}
          unreadCount={unreadCount}
          onNotifClick={() => setShowNotifs(v=>!v)}
          onSettingsClick={() => setShowSettings(true)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)} />

        {/* Spacer for fixed sidebar on desktop */}
        <div style={{ width:230, flexShrink:0 }} className="dash-sidebar" />

        <main style={{ flex:1, padding:"28px 32px", overflow:"auto", animation:"fadeIn 0.35s ease" }}>
          {/* Mobile header */}
          <div className="dash-mobile-btn" style={{ display:"none", alignItems:"center", justifyContent:"space-between", marginBottom:20, background:P.card, borderRadius:14, padding:"12px 16px", border:`1.5px solid ${P.border}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:30, height:30, borderRadius:8, background:`linear-gradient(135deg,${P.purple},${P.pink})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ color:"#fff", fontWeight:900, fontSize:13 }}>Z</span>
              </div>
              <span style={{ color:P.text, fontWeight:800, fontSize:15 }}>Zyrix FinSuite</span>
            </div>
            <button onClick={() => setMobileOpen(true)} style={{ background:P.light, border:`1.5px solid ${P.border}`, borderRadius:8, padding:"7px 12px", cursor:"pointer", color:P.text, fontSize:16 }}>☰</button>
          </div>

          {/* OVERVIEW */}
          {page === "overview" && (
            <div>
              <GreetingBanner user={user} />
              <div style={{ marginBottom:24 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}><span style={{ color:P.emerald, fontSize:18 }}>💰</span><span style={{ color:P.text, fontSize:15, fontWeight:700 }}>Gelir & Finans</span></div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:16 }}>
                  <KPI label="Bu Ay Gelir" value={kpis?.revenueThisMonth||0} prefix="$" color={P.emerald} icon="💵" change={kpis?.revenueGrowth} sparkData={[kpis?.revenueLastMonth||0, kpis?.revenueThisMonth||0]} />
                  <KPI label="Pipeline Değeri" value={kpis?.pipelineValue||0} prefix="$" color={P.cyan} icon="📊" />
                  <KPI label="Vadesi Geçen Fatura" value={kpis?.overdueInvoices||0} color={P.rose} icon="⚠️" />
                </div>
                <ChartCard title="Gelir Trendi" color={P.emerald} icon="📈">
                  <BarChart bars={revBars.map((b,i)=>({...b,color:COLORS[i]}))} height={110} />
                  <AIInsight kpis={kpis} color={P.emerald} />
                </ChartCard>
              </div>
              <div style={{ marginBottom:24 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}><span style={{ fontSize:18 }}>👥</span><span style={{ color:P.text, fontSize:15, fontWeight:700 }}>Müşteriler</span></div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:16 }}>
                  <KPI label="Toplam Müşteri" value={kpis?.totalCustomers||0} color={P.purple} icon="👤" />
                  <KPI label="Bu Ay Yeni" value={kpis?.newCustomersThisMonth||0} color={P.pink} icon="✨" />
                </div>
                {custBars.length > 0 && <ChartCard title="Aylık Büyüme" color={P.purple} icon="🚀"><BarChart bars={custBars.map((b,i)=>({...b,color:COLORS[i%COLORS.length]}))} height={100} /><AIInsight kpis={{...kpis,totalCustomers:customers.length}} color={P.purple} /></ChartCard>}
              </div>
              <div style={{ marginBottom:24 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}><span style={{ fontSize:18 }}>🤝</span><span style={{ color:P.text, fontSize:15, fontWeight:700 }}>Anlaşmalar</span></div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:16 }}>
                  <KPI label="Toplam Anlaşma" value={kpis?.totalDeals||0} color={P.amber} icon="🎯" />
                  <KPI label="Bu Ay Kazanılan" value={kpis?.wonDealsThisMonth||0} color={P.lime} icon="🏆" />
                </div>
                {dealBars.length > 0 && <ChartCard title="Aşama Dağılımı" color={P.amber} icon="🎪">
                  <div style={{ display:"flex", gap:20, alignItems:"center" }}>
                    <Donut segs={dealBars.map((b,i)=>({value:b.value,color:COLORS[i%COLORS.length]}))} size={120} />
                    <div>{dealBars.map((b,i)=>(<div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}><div style={{ width:8, height:8, borderRadius:"50%", background:COLORS[i%COLORS.length] }}/><span style={{ color:P.sub, fontSize:12, flex:1 }}>{b.label}</span><span style={{ color:COLORS[i%COLORS.length], fontWeight:700, fontSize:12 }}>{b.value}</span></div>))}</div>
                  </div>
                  {dpRows.length>0 && <Pivot rows={dpRows} cols={dpCols} data={dealPivot} rk="stage" ck="month" vk="count" color={P.amber} />}
                  <AIInsight kpis={{...kpis,totalDeals:deals.length}} color={P.amber} />
                </ChartCard>}
              </div>
              <div style={{ marginBottom:24 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}><span style={{ fontSize:18 }}>✅</span><span style={{ color:P.text, fontSize:15, fontWeight:700 }}>Görevler</span></div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:16, marginBottom:16 }}>
                  <KPI label="Bekleyen Görev" value={kpis?.pendingTasks||0} color={P.sky} icon="📋" />
                  <KPI label="Toplam Fatura" value={kpis?.totalInvoices||0} color={P.orange} icon="🧾" />
                  <KPI label="Bu Ay Ödenen" value={kpis?.paidInvoicesThisMonth||0} color={P.emerald} icon="✅" />
                </div>
                {invBars.length>0 && <ChartCard title="Fatura Durumu" color={P.sky} icon="📊"><BarChart bars={invBars.map((b,i)=>({...b,color:COLORS[i%COLORS.length]}))} height={100} />{ipRows.length>0 && <Pivot rows={ipRows} cols={ipCols} data={invPivot} rk="status" ck="month" vk="amount" color={P.sky} />}<AIInsight kpis={kpis} color={P.sky} /></ChartCard>}
              </div>
            </div>
          )}

          {page === "customers" && (
            <div style={{ animation:"fadeIn 0.3s ease" }}>
              <h1 style={{ color:P.text, fontSize:24, fontWeight:800, margin:"0 0 20px" }}>Müşteriler</h1>
              <div style={{ overflowX:"auto" }}>
                <Table color={P.purple} rows={customers} emptyMsg="Henüz müşteri yok — ilk müşterinizi ekleyin!"
                  cols={[
                    { key:"name", label:"İsim", render:(c,i)=>(<div style={{ display:"flex", alignItems:"center", gap:10 }}><div style={{ width:32, height:32, borderRadius:"50%", background:`${COLORS[i%COLORS.length]}20`, display:"flex", alignItems:"center", justifyContent:"center", color:COLORS[i%COLORS.length], fontSize:12, fontWeight:700, flexShrink:0 }}>{(c.name||"?")[0].toUpperCase()}</div><span style={{ color:P.text, fontSize:13, fontWeight:600 }}>{c.name}</span></div>) },
                    { key:"email", label:"E-posta", render:c=><span style={{ color:P.sub, fontSize:12 }}>{c.email||"—"}</span> },
                    { key:"phone", label:"Telefon", render:c=><span style={{ color:P.sub, fontSize:12 }}>{c.phone||"—"}</span> },
                    { key:"loyaltyPoints", label:"Sadakat", render:c=><span style={{ color:P.amber, fontWeight:700, fontSize:13 }}>{c.loyaltyPoints||0} pts ⭐</span> },
                    { key:"createdAt", label:"Katılım", render:c=><span style={{ color:P.muted, fontSize:12 }}>{c.createdAt?new Date(c.createdAt).toLocaleDateString("tr-TR"):"—"}</span> },
                  ]} />
              </div>
            </div>
          )}

          {page === "deals" && (
            <div style={{ animation:"fadeIn 0.3s ease" }}>
              <h1 style={{ color:P.text, fontSize:24, fontWeight:800, margin:"0 0 20px" }}>Anlaşmalar</h1>
              <div style={{ overflowX:"auto" }}>
                <Table color={P.amber} rows={deals} emptyMsg="Henüz anlaşma yok!"
                  cols={[
                    { key:"title", label:"Başlık", render:d=><span style={{ color:P.text, fontSize:13, fontWeight:600 }}>{d.title}</span> },
                    { key:"value", label:"Değer", render:d=><span style={{ color:P.emerald, fontWeight:700, fontSize:13, fontFamily:"monospace" }}>₺{Number(d.value||0).toLocaleString()}</span> },
                    { key:"stage", label:"Aşama", render:d=>{ const c={WON:P.emerald,LOST:P.rose,PROPOSAL:P.amber,NEGOTIATION:P.orange,QUALIFIED:P.cyan}[d.stage]||P.muted; return badge(d.stage,c); }},
                    { key:"probability", label:"Olasılık", render:d=>(<div style={{ display:"flex", alignItems:"center", gap:8 }}><div style={{ width:60, height:5, background:P.border, borderRadius:3, overflow:"hidden" }}><div style={{ width:`${d.probability||0}%`, height:"100%", background:P.amber, borderRadius:3 }}/></div><span style={{ color:P.sub, fontSize:11 }}>{d.probability||0}%</span></div>) },
                    { key:"createdAt", label:"Tarih", render:d=><span style={{ color:P.muted, fontSize:12 }}>{d.createdAt?new Date(d.createdAt).toLocaleDateString("tr-TR"):"—"}</span> },
                  ]} />
              </div>
            </div>
          )}

          {page === "invoices" && (
            <div style={{ animation:"fadeIn 0.3s ease" }}>
              <h1 style={{ color:P.text, fontSize:24, fontWeight:800, margin:"0 0 20px" }}>Faturalar</h1>
              <div style={{ overflowX:"auto" }}>
                <Table color={P.cyan} rows={invoices} emptyMsg="Henüz fatura yok!"
                  cols={[
                    { key:"invoiceNumber", label:"Fatura #", render:inv=><span style={{ color:P.cyan, fontFamily:"monospace", fontWeight:700, fontSize:13 }}>{inv.invoiceNumber||inv.id?.slice(0,8)}</span> },
                    { key:"customerName", label:"Müşteri", render:inv=><span style={{ color:P.text, fontSize:13, fontWeight:500 }}>{inv.customerName||"—"}</span> },
                    { key:"total", label:"Tutar", render:inv=><span style={{ color:P.emerald, fontWeight:700, fontSize:13, fontFamily:"monospace" }}>₺{Number(inv.total||0).toLocaleString()}</span> },
                    { key:"status", label:"Durum", render:inv=>{ const c={PAID:P.emerald,PENDING:P.amber,OVERDUE:P.rose,DRAFT:P.muted}[inv.status]||P.muted; return badge(inv.status,c); }},
                    { key:"createdAt", label:"Tarih", render:inv=><span style={{ color:P.muted, fontSize:12 }}>{inv.createdAt?new Date(inv.createdAt).toLocaleDateString("tr-TR"):"—"}</span> },
                  ]} />
              </div>
            </div>
          )}

          {page === "tasks" && (
            <div style={{ animation:"fadeIn 0.3s ease" }}>
              <h1 style={{ color:P.text, fontSize:24, fontWeight:800, margin:"0 0 20px" }}>Görevler</h1>
              <div style={{ overflowX:"auto" }}>
                <Table color={P.sky} rows={recent?.tasks||[]} emptyMsg="🎉 Bekleyen görev yok!"
                  cols={[
                    { key:"title", label:"Görev", render:t=><span style={{ color:P.text, fontSize:13, fontWeight:600 }}>{t.title}</span> },
                    { key:"priority", label:"Öncelik", render:t=>badge(t.priority,{HIGH:P.rose,MEDIUM:P.amber,LOW:P.emerald}[t.priority]||P.muted) },
                    { key:"status", label:"Durum", render:t=>badge(t.status,{IN_PROGRESS:P.sky,TODO:P.muted,DONE:P.emerald}[t.status]||P.muted) },
                    { key:"dueDate", label:"Son Tarih", render:t=>{ const ov=t.dueDate&&new Date(t.dueDate)<new Date(); return <span style={{ color:ov?P.rose:P.muted, fontSize:12, fontWeight:ov?700:400 }}>{t.dueDate?new Date(t.dueDate).toLocaleDateString("tr-TR"):"—"}{ov?" ⚡":""}</span>; }},
                  ]} />
              </div>
              <div style={{ marginTop:20 }}><ChartCard title="AI İş Analizi" color={P.sky} icon="🤖"><AIInsight kpis={kpis} color={P.sky} /></ChartCard></div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}