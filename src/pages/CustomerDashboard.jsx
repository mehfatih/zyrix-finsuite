// ================================================================
// Zyrix FinSuite — Customer Dashboard v2.0
// جديد: E-Fatura | AI Asistan | Factoring | AI Müşteri Skor
// ================================================================

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

// Sprint 1 features (lazy-loaded)
const EIrsaliyePage   = React.lazy(() => import("./dashboard/EIrsaliyePage"));
const ReceiptScanPage = React.lazy(() => import("./dashboard/ReceiptScanPage"));
const WhatsAppPage    = React.lazy(() => import("./dashboard/WhatsAppPage"));
const BanksPage       = React.lazy(() => import("./dashboard/BanksPage"));

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
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${color}, ${color}60)`, borderRadius: "18px 18px 0 0" }} />
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
    <div style={{ background: P.card, borderRadius: 18, overflow: "hidden", border: `1.5px solid ${color}20`, boxShadow: `0 4px 24px ${color}08, 0 1px 4px rgba(0,0,0,0.04)` }}>
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
            <th style={{ padding: "8px 12px", textAlign: "left", color: P.sub, borderBottom: `1px solid ${P.border}` }}>{rk}</th>
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
      <div style={{ fontSize: 22, flexShrink: 0 }}>🤖</div>
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
  if (k.revenueGrowth > 0) return `Revenue grew ${k.revenueGrowth}% this month — great momentum!`;
  if (k.pendingTasks > 5) return `${k.pendingTasks} pending tasks detected — tackle high-value deals first.`;
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
        {loading ? <div style={{ textAlign:"center", padding:40, color:P.muted }}>Yükleniyor...</div>
        : notifs.length === 0 ? <div style={{ textAlign:"center", padding:40 }}><div style={{ fontSize:40, marginBottom:12 }}>🎉</div><div style={{ color:P.sub, fontSize:14 }}>Yeni bildirim yok</div></div>
        : notifs.map(n => (
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

// ================================================================
// YENİ: AI Asistan Panel ─────────────────────────────────────────
// ================================================================
function AIAssistantPanel({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [histLoading, setHistLoading] = useState(true);
  const bottomRef = useRef();

  useEffect(() => {
    apiFetch("/api/ai-assistant/history")
      .then(r => setMessages(r?.data?.chats || []))
      .catch(() => {})
      .finally(() => setHistLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const QUICK = [
    "KDV nasıl hesaplanır?",
    "E-fatura zorunluluğu ne zaman başladı?",
    "Bu gideri vergi indirimine yazabilir miyim?",
    "SGK primini nasıl hesaplarım?",
    "Vergi beyanname tarihleri neler?",
  ];

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    const userMsg = { id: Date.now(), role: "user", content: msg, createdAt: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await apiFetch("/api/ai-assistant/chat", { method: "POST", body: JSON.stringify({ message: msg }) });
      if (res?.data) setMessages(prev => [...prev, res.data]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now(), role: "assistant", content: "Üzgünüm, şu an yanıt veremiyorum. Lütfen tekrar deneyin.", createdAt: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    await apiFetch("/api/ai-assistant/history", { method: "DELETE" });
    setMessages([]);
  };

  return (
    <div style={{ position:"fixed", top:0, right:0, bottom:0, width:420, background:P.card, borderLeft:`1.5px solid ${P.border}`, zIndex:300, display:"flex", flexDirection:"column", boxShadow:"-8px 0 40px rgba(108,58,255,0.15)" }}>
      {/* Header */}
      <div style={{ padding:"18px 20px", borderBottom:`1.5px solid ${P.border}`, background:`linear-gradient(135deg,${P.purple}08,${P.pink}05)` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:40, height:40, borderRadius:14, background:`linear-gradient(135deg,${P.purple},${P.pink})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, boxShadow:`0 4px 16px ${P.purple}30` }}>🤖</div>
            <div>
              <div style={{ color:P.text, fontSize:15, fontWeight:800 }}>Zyrix AI Asistan</div>
              <div style={{ color:P.emerald, fontSize:11, fontWeight:600 }}>● Türk Vergi & İş Hukuku Uzmanı</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={clearHistory} title="Geçmişi Temizle" style={{ background:`${P.rose}12`, border:`1px solid ${P.rose}25`, color:P.rose, borderRadius:8, padding:"5px 10px", cursor:"pointer", fontSize:11, fontWeight:700 }}>Temizle</button>
            <button onClick={onClose} style={{ background:P.light, border:`1px solid ${P.border}`, color:P.sub, borderRadius:8, padding:"5px 10px", cursor:"pointer", fontSize:14 }}>✕</button>
          </div>
        </div>
        <div style={{ marginTop:10, color:P.sub, fontSize:12, lineHeight:1.5 }}>
          KDV, SGK, E-Fatura, gider indirimleri ve vergi takvimi hakkında sorularınızı yanıtlarım.
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflow:"auto", padding:"16px 16px 8px" }}>
        {histLoading ? (
          <div style={{ textAlign:"center", padding:40, color:P.muted }}>Yükleniyor...</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign:"center", padding:"30px 20px" }}>
            <div style={{ fontSize:50, marginBottom:12 }}>💼</div>
            <div style={{ color:P.text, fontSize:14, fontWeight:700, marginBottom:6 }}>Merhaba! Size nasıl yardımcı olabilirim?</div>
            <div style={{ color:P.sub, fontSize:12, marginBottom:20 }}>Hızlı sorular için aşağıdaki seçenekleri kullanın:</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {QUICK.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} style={{ background:`${P.purple}08`, border:`1px solid ${P.purple}20`, color:P.purple, borderRadius:10, padding:"9px 14px", cursor:"pointer", fontSize:12, fontWeight:500, textAlign:"left", transition:"all 0.15s" }}
                  onMouseEnter={e=>{e.currentTarget.style.background=`${P.purple}15`;}}
                  onMouseLeave={e=>{e.currentTarget.style.background=`${P.purple}08`;}}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div key={msg.id} style={{ marginBottom:16, display:"flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                {msg.role === "assistant" && (
                  <div style={{ width:32, height:32, borderRadius:10, background:`linear-gradient(135deg,${P.purple},${P.pink})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0, marginRight:8, alignSelf:"flex-end" }}>🤖</div>
                )}
                <div style={{
                  maxWidth:"78%",
                  background: msg.role === "user" ? `linear-gradient(135deg,${P.purple},${P.violet})` : P.light,
                  color: msg.role === "user" ? "#fff" : P.text,
                  borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  padding:"12px 16px", fontSize:13, lineHeight:1.6,
                  border: msg.role === "assistant" ? `1px solid ${P.border}` : "none",
                  boxShadow: msg.role === "user" ? `0 4px 16px ${P.purple}30` : "none",
                }}>
                  {msg.content}
                  <div style={{ fontSize:10, marginTop:4, opacity:0.6, textAlign:"right" }}>
                    {new Date(msg.createdAt).toLocaleTimeString("tr-TR", { hour:"2-digit", minute:"2-digit" })}
                  </div>
                </div>
                {msg.role === "user" && (
                  <div style={{ width:32, height:32, borderRadius:10, background:`${P.purple}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0, marginLeft:8, alignSelf:"flex-end" }}>👤</div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
                <div style={{ width:32, height:32, borderRadius:10, background:`linear-gradient(135deg,${P.purple},${P.pink})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🤖</div>
                <div style={{ background:P.light, border:`1px solid ${P.border}`, borderRadius:"18px 18px 18px 4px", padding:"12px 16px" }}>
                  <div style={{ display:"flex", gap:4 }}>
                    {[0,1,2].map(i => <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:P.purple, opacity:0.6, animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite` }} />)}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div style={{ padding:"12px 16px 16px", borderTop:`1.5px solid ${P.border}` }}>
        {messages.length > 0 && (
          <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
            {QUICK.slice(0,3).map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)} style={{ background:`${P.purple}08`, border:`1px solid ${P.purple}20`, color:P.purple, borderRadius:20, padding:"4px 10px", cursor:"pointer", fontSize:10, fontWeight:500 }}>{q.slice(0,25)}…</button>
            ))}
          </div>
        )}
        <div style={{ display:"flex", gap:10, alignItems:"flex-end" }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Sorunuzu yazın... (Enter = gönder)"
            disabled={loading}
            rows={2}
            style={{ flex:1, background:P.light, border:`1.5px solid ${P.border}`, borderRadius:14, padding:"10px 14px", fontSize:13, color:P.text, resize:"none", fontFamily:"inherit", outline:"none", lineHeight:1.5 }}
          />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{ background: loading || !input.trim() ? P.border : `linear-gradient(135deg,${P.purple},${P.pink})`, border:"none", borderRadius:12, padding:"10px 16px", cursor: loading || !input.trim() ? "not-allowed" : "pointer", color:"#fff", fontSize:18, flexShrink:0, height:44, display:"flex", alignItems:"center", justifyContent:"center", transition:"opacity 0.2s", boxShadow: loading || !input.trim() ? "none" : `0 4px 16px ${P.purple}30` }}>
            {loading ? "⏳" : "➤"}
          </button>
        </div>
        <div style={{ color:P.muted, fontSize:10, textAlign:"center", marginTop:8 }}>
          Yanıtlar yönlendirme amaçlıdır. Hukuki kesinlik için mali müşavirinize danışın.
        </div>
      </div>
    </div>
  );
}

// ================================================================
// YENİ: E-Fatura Page ────────────────────────────────────────────
// ================================================================
function EFaturaPage({ invoices }) {
  const { data: efData, reload: reloadEF } = useApi(() => apiFetch("/api/efatura").then(r => r?.data));
  const { data: stats } = useApi(() => apiFetch("/api/efatura/stats").then(r => r?.data));
  const [selectedInv, setSelectedInv] = useState("");
  const [buyerVkn, setBuyerVkn] = useState("");
  const [buyerTitle, setBuyerTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [msg, setMsg] = useState(null);

  const eFaturalar = efData?.eFaturalar || [];

  const statusColor = { PENDING: P.amber, SENT: P.cyan, ACCEPTED: P.emerald, REJECTED: P.rose, CANCELLED: P.muted };
  const statusLabel = { PENDING: "Bekliyor", SENT: "Gönderildi", ACCEPTED: "Kabul Edildi", REJECTED: "Reddedildi", CANCELLED: "İptal" };

  const handleCreate = async () => {
    if (!selectedInv) { setMsg({ type:"error", text:"Fatura seçin" }); return; }
    setCreating(true); setMsg(null);
    try {
      const res = await apiFetch("/api/efatura", { method:"POST", body: JSON.stringify({ invoiceId: selectedInv, buyerVkn, buyerTitle }) });
      setMsg({ type:"success", text: res?.message || "E-Fatura oluşturuldu" });
      setShowForm(false); setSelectedInv(""); setBuyerVkn(""); setBuyerTitle("");
      reloadEF();
    } catch (e) {
      setMsg({ type:"error", text: e.message });
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("E-Faturayı iptal etmek istediğinize emin misiniz?")) return;
    try {
      await apiFetch(`/api/efatura/${id}/cancel`, { method:"POST" });
      reloadEF();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h1 style={{ color:P.text, fontSize:24, fontWeight:800, margin:"0 0 4px" }}>E-Fatura & E-Arşiv</h1>
          <div style={{ color:P.sub, fontSize:13 }}>GİB entegrasyonu — resmi elektronik fatura sistemi</div>
        </div>
        <button onClick={() => setShowForm(v=>!v)} style={{ background:`linear-gradient(135deg,${P.purple},${P.pink})`, border:"none", borderRadius:12, color:"#fff", padding:"10px 20px", cursor:"pointer", fontSize:13, fontWeight:700, boxShadow:`0 4px 16px ${P.purple}30` }}>
          + Yeni E-Fatura
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12, marginBottom:24 }}>
          {[
            { label:"Toplam", value:stats.total, color:P.purple },
            { label:"Gönderildi", value:stats.sent, color:P.cyan },
            { label:"Kabul Edildi", value:stats.accepted, color:P.emerald },
            { label:"Reddedildi", value:stats.rejected, color:P.rose },
            { label:"Bekliyor", value:stats.pending, color:P.amber },
          ].map((s, i) => (
            <div key={i} style={{ background:P.card, borderRadius:14, padding:"14px 16px", border:`1.5px solid ${s.color}20` }}>
              <div style={{ color:s.color, fontSize:22, fontWeight:800 }}>{s.value}</div>
              <div style={{ color:P.sub, fontSize:12 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* GİB sandbox uyarısı */}
      <div style={{ background:`${P.amber}10`, border:`1.5px solid ${P.amber}30`, borderRadius:14, padding:"14px 18px", marginBottom:20, display:"flex", gap:12, alignItems:"flex-start" }}>
        <span style={{ fontSize:20 }}>⚠️</span>
        <div>
          <div style={{ color:P.amber, fontWeight:700, fontSize:13, marginBottom:4 }}>Sandbox Modu Aktif</div>
          <div style={{ color:P.sub, fontSize:12, lineHeight:1.6 }}>
            GİB credentials (GIB_API_URL + GIB_USERNAME + GIB_PASSWORD) Railway'e eklenince gerçek gönderim başlar.
            Şu an tüm işlemler simüle edilmektedir.
          </div>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div style={{ background:P.card, borderRadius:18, padding:24, border:`1.5px solid ${P.purple}20`, marginBottom:20, boxShadow:`0 4px 24px ${P.purple}08` }}>
          <div style={{ color:P.text, fontSize:15, fontWeight:700, marginBottom:16 }}>📄 Yeni E-Fatura Oluştur</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div>
              <label style={{ color:P.sub, fontSize:11, fontWeight:700, display:"block", marginBottom:6 }}>Fatura Seçin *</label>
              <select value={selectedInv} onChange={e=>setSelectedInv(e.target.value)} style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:P.text, outline:"none" }}>
                <option value="">-- Fatura seçin --</option>
                {invoices.filter(inv => inv.status !== "PAID" && inv.status !== "CANCELLED").map(inv => (
                  <option key={inv.id} value={inv.id}>{inv.invoiceNumber} — {inv.customerName} (₺{Number(inv.total).toLocaleString()})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ color:P.sub, fontSize:11, fontWeight:700, display:"block", marginBottom:6 }}>Alıcı VKN/TCKN</label>
              <input value={buyerVkn} onChange={e=>setBuyerVkn(e.target.value)} placeholder="1234567890" style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:P.text, outline:"none", boxSizing:"border-box" }} />
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={{ color:P.sub, fontSize:11, fontWeight:700, display:"block", marginBottom:6 }}>Alıcı Unvanı</label>
              <input value={buyerTitle} onChange={e=>setBuyerTitle(e.target.value)} placeholder="Şirket Adı veya Ad Soyad" style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:P.text, outline:"none", boxSizing:"border-box" }} />
            </div>
          </div>
          {msg && <div style={{ marginTop:12, padding:"10px 14px", borderRadius:10, background: msg.type==="success" ? `${P.emerald}10` : `${P.rose}10`, color: msg.type==="success" ? P.emerald : P.rose, fontSize:13, border:`1px solid ${msg.type==="success"?P.emerald:P.rose}25` }}>{msg.text}</div>}
          <div style={{ display:"flex", gap:10, marginTop:16 }}>
            <button onClick={handleCreate} disabled={creating} style={{ background:`linear-gradient(135deg,${P.purple},${P.pink})`, border:"none", borderRadius:10, color:"#fff", padding:"10px 24px", cursor:creating?"not-allowed":"pointer", fontSize:13, fontWeight:700, opacity:creating?0.7:1 }}>
              {creating ? "Oluşturuluyor..." : "E-Fatura Oluştur ve Gönder"}
            </button>
            <button onClick={() => setShowForm(false)} style={{ background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, color:P.sub, padding:"10px 20px", cursor:"pointer", fontSize:13 }}>İptal</button>
          </div>
        </div>
      )}

      {/* List */}
      <Table color={P.cyan} rows={eFaturalar} emptyMsg="Henüz e-fatura yok — yukarıdan oluşturun"
        cols={[
          { key:"faturaNo", label:"Fatura No", render:e=><span style={{ color:P.cyan, fontFamily:"monospace", fontWeight:700, fontSize:13 }}>{e.faturaNo}</span> },
          { key:"customerName", label:"Müşteri", render:e=><span style={{ color:P.text, fontSize:13 }}>{e.invoice?.customerName || "—"}</span> },
          { key:"total", label:"Tutar", render:e=><span style={{ color:P.emerald, fontWeight:700, fontSize:13, fontFamily:"monospace" }}>₺{Number(e.invoice?.total||0).toLocaleString()}</span> },
          { key:"gibStatus", label:"GİB Durumu", render:e=>{
            const c = statusColor[e.gibStatus] || P.muted;
            return <span style={{ background:`${c}15`, color:c, border:`1px solid ${c}25`, borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700 }}>{statusLabel[e.gibStatus] || e.gibStatus}</span>;
          }},
          { key:"sentAt", label:"Gönderim", render:e=><span style={{ color:P.muted, fontSize:12 }}>{e.sentAt ? new Date(e.sentAt).toLocaleDateString("tr-TR") : "—"}</span> },
          { key:"actions", label:"", render:e=>(
            <div style={{ display:"flex", gap:6 }}>
              {e.xmlContent && (
                <a href={`${API}/api/efatura/${e.id}/xml`} target="_blank" rel="noreferrer" style={{ background:`${P.cyan}12`, border:`1px solid ${P.cyan}25`, color:P.cyan, borderRadius:8, padding:"4px 10px", cursor:"pointer", fontSize:11, fontWeight:700, textDecoration:"none" }}>XML</a>
              )}
              {e.gibStatus !== "CANCELLED" && (
                <button onClick={()=>handleCancel(e.id)} style={{ background:`${P.rose}12`, border:`1px solid ${P.rose}25`, color:P.rose, borderRadius:8, padding:"4px 10px", cursor:"pointer", fontSize:11, fontWeight:700 }}>İptal</button>
              )}
            </div>
          )},
        ]} />
    </div>
  );
}

// ================================================================
// YENİ: Factoring Page ───────────────────────────────────────────
// ================================================================
function FactoringPage() {
  const { data: factoringData, reload } = useApi(() => apiFetch("/api/factoring").then(r => r?.data));
  const { data: eligibleData } = useApi(() => apiFetch("/api/factoring/eligible").then(r => r?.data));
  const [applying, setApplying] = useState(null);
  const [calcResult, setCalcResult] = useState(null);
  const [msg, setMsg] = useState(null);

  const requests = factoringData?.requests || [];
  const eligible = eligibleData?.invoices || [];

  const statusColor = { PENDING:P.amber, APPROVED:P.cyan, FUNDED:P.emerald, REPAID:P.lime, REJECTED:P.rose };
  const statusLabel = { PENDING:"Bekliyor", APPROVED:"Onaylandı", FUNDED:"Finanse Edildi", REPAID:"Geri Ödendi", REJECTED:"Reddedildi" };

  const handleCalc = async (inv) => {
    setCalcResult(null);
    try {
      const res = await apiFetch("/api/factoring/calculate", { method:"POST", body: JSON.stringify({ invoiceId: inv.id }) });
      setCalcResult(res?.data);
    } catch(e) { alert(e.message); }
  };

  const handleApply = async (invoiceId) => {
    setApplying(invoiceId); setMsg(null);
    try {
      const res = await apiFetch("/api/factoring/apply", { method:"POST", body: JSON.stringify({ invoiceId }) });
      setMsg({ type:"success", text: res?.message });
      setCalcResult(null);
      reload();
    } catch(e) {
      setMsg({ type:"error", text: e.message });
    } finally {
      setApplying(null);
    }
  };

  return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ color:P.text, fontSize:24, fontWeight:800, margin:"0 0 4px" }}>Fatura Finansmanı</h1>
        <div style={{ color:P.sub, fontSize:13 }}>Bekleyen faturalarınız için erken ödeme alın — %80 avans, %2.5 komisyon</div>
      </div>

      {/* Info Card */}
      <div style={{ background:`linear-gradient(135deg,${P.emerald}10,${P.cyan}05)`, border:`1.5px solid ${P.emerald}25`, borderRadius:18, padding:24, marginBottom:24 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:16 }}>
          {[
            { icon:"💰", label:"Avans Oranı", value:"%80" },
            { icon:"💳", label:"Komisyon", value:"%2.5" },
            { icon:"⚡", label:"İşlem Süresi", value:"24-48 saat" },
            { icon:"🏦", label:"Partner", value:"Zyrix Finance" },
          ].map((item, i) => (
            <div key={i} style={{ textAlign:"center" }}>
              <div style={{ fontSize:28, marginBottom:6 }}>{item.icon}</div>
              <div style={{ color:P.text, fontSize:18, fontWeight:800 }}>{item.value}</div>
              <div style={{ color:P.sub, fontSize:12 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {msg && <div style={{ marginBottom:16, padding:"12px 16px", borderRadius:12, background: msg.type==="success" ? `${P.emerald}10` : `${P.rose}10`, color: msg.type==="success" ? P.emerald : P.rose, fontSize:13, border:`1px solid ${msg.type==="success"?P.emerald:P.rose}25` }}>{msg.text}</div>}

      {/* Eligible Invoices */}
      {eligible.length > 0 && (
        <div style={{ marginBottom:24 }}>
          <div style={{ color:P.text, fontSize:15, fontWeight:700, marginBottom:14 }}>📋 Finansmana Uygun Faturalar</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:14 }}>
            {eligible.map(inv => (
              <div key={inv.id} style={{ background:P.card, borderRadius:16, padding:20, border:`1.5px solid ${P.emerald}20`, boxShadow:`0 4px 16px ${P.emerald}06` }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                  <div style={{ color:P.cyan, fontFamily:"monospace", fontWeight:700, fontSize:13 }}>{inv.invoiceNumber}</div>
                  <div style={{ color:P.sub, fontSize:12 }}>{new Date(inv.dueDate).toLocaleDateString("tr-TR")}</div>
                </div>
                <div style={{ color:P.text, fontWeight:600, marginBottom:4 }}>{inv.customerName}</div>
                <div style={{ color:P.emerald, fontSize:20, fontWeight:800, marginBottom:12 }}>₺{Number(inv.total).toLocaleString()}</div>
                {inv.factoringEstimate && (
                  <div style={{ background:`${P.emerald}08`, borderRadius:10, padding:"10px 12px", marginBottom:12 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:P.sub, marginBottom:4 }}>
                      <span>Alacağınız (~net):</span>
                      <span style={{ color:P.emerald, fontWeight:700 }}>₺{Number(inv.factoringEstimate.netAmount).toLocaleString("tr-TR",{minimumFractionDigits:0,maximumFractionDigits:0})}</span>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:P.sub }}>
                      <span>Komisyon:</span>
                      <span style={{ color:P.rose }}>-₺{Number(inv.factoringEstimate.feeAmount).toLocaleString("tr-TR",{minimumFractionDigits:0,maximumFractionDigits:0})}</span>
                    </div>
                  </div>
                )}
                <button onClick={() => handleApply(inv.id)} disabled={applying === inv.id} style={{ width:"100%", background:`linear-gradient(135deg,${P.emerald},${P.teal})`, border:"none", borderRadius:10, color:"#fff", padding:"10px", cursor:applying===inv.id?"not-allowed":"pointer", fontSize:13, fontWeight:700, opacity:applying===inv.id?0.7:1 }}>
                  {applying === inv.id ? "Talep Oluşturuluyor..." : "Finansman Talep Et"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing Requests */}
      <div style={{ color:P.text, fontSize:15, fontWeight:700, marginBottom:14 }}>📊 Mevcut Talepler</div>
      <Table color={P.emerald} rows={requests} emptyMsg="Henüz finansman talebi yok"
        cols={[
          { key:"invoiceNumber", label:"Fatura", render:r=><span style={{ color:P.cyan, fontFamily:"monospace", fontWeight:700, fontSize:13 }}>{r.invoice?.invoiceNumber}</span> },
          { key:"customerName", label:"Müşteri", render:r=><span style={{ color:P.text, fontSize:13 }}>{r.invoice?.customerName}</span> },
          { key:"netAmount", label:"Net Tutar", render:r=><span style={{ color:P.emerald, fontWeight:700 }}>₺{Number(r.netAmount).toLocaleString()}</span> },
          { key:"status", label:"Durum", render:r=>{
            const c = statusColor[r.status] || P.muted;
            return <span style={{ background:`${c}15`, color:c, border:`1px solid ${c}25`, borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700 }}>{statusLabel[r.status] || r.status}</span>;
          }},
          { key:"createdAt", label:"Tarih", render:r=><span style={{ color:P.muted, fontSize:12 }}>{new Date(r.createdAt).toLocaleDateString("tr-TR")}</span> },
        ]} />
    </div>
  );
}

// ================================================================
// YENİ: AI Müşteri Skor Bileşeni (Customers sayfasına eklenir) ───
// ================================================================
function CustomerScoreCard({ customer, onRefresh }) {
  const [scoring, setScoring] = useState(false);

  const riskColor = { LOW: P.emerald, MEDIUM: P.amber, HIGH: P.rose };
  const riskLabel = { LOW: "Düşük Risk", MEDIUM: "Orta Risk", HIGH: "Yüksek Risk" };

  const handleScore = async () => {
    setScoring(true);
    try {
      await apiFetch(`/api/customer-score/${customer.id}`, { method:"POST" });
      onRefresh?.();
    } catch(e) {
      alert("Skor hesaplanamadı: " + e.message);
    } finally {
      setScoring(false);
    }
  };

  const hasScore = customer.aiPaymentScore != null;
  const riskC = riskColor[customer.aiRiskLevel] || P.muted;
  const payScore = customer.aiPaymentScore || 0;
  const retScore = customer.aiRetentionScore || 0;

  return (
    <div style={{ background:P.light, borderRadius:14, padding:"14px 16px", border:`1.5px solid ${riskC}20`, marginTop:8 }}>
      {hasScore ? (
        <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ color:P.text, fontSize:12, fontWeight:700 }}>🤖 AI Müşteri Skoru</div>
            <span style={{ background:`${riskC}15`, color:riskC, border:`1px solid ${riskC}25`, borderRadius:20, padding:"2px 8px", fontSize:10, fontWeight:700 }}>{riskLabel[customer.aiRiskLevel]}</span>
          </div>
          <div style={{ display:"flex", gap:12, marginBottom:10 }}>
            <div style={{ flex:1 }}>
              <div style={{ color:P.sub, fontSize:10, marginBottom:4 }}>Ödeme Skoru</div>
              <div style={{ height:6, background:`${P.border}`, borderRadius:3, overflow:"hidden", marginBottom:3 }}>
                <div style={{ width:`${payScore}%`, height:"100%", background: payScore >= 70 ? P.emerald : payScore >= 40 ? P.amber : P.rose, borderRadius:3, transition:"width 1s ease" }} />
              </div>
              <div style={{ color:P.text, fontSize:13, fontWeight:700 }}>{payScore}/100</div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ color:P.sub, fontSize:10, marginBottom:4 }}>Sadakat Skoru</div>
              <div style={{ height:6, background:`${P.border}`, borderRadius:3, overflow:"hidden", marginBottom:3 }}>
                <div style={{ width:`${retScore}%`, height:"100%", background: retScore >= 70 ? P.cyan : retScore >= 40 ? P.violet : P.muted, borderRadius:3, transition:"width 1s ease" }} />
              </div>
              <div style={{ color:P.text, fontSize:13, fontWeight:700 }}>{retScore}/100</div>
            </div>
          </div>
          {customer.aiScoreNotes && <div style={{ color:P.sub, fontSize:11, lineHeight:1.5, marginBottom:8 }}>{customer.aiScoreNotes}</div>}
          <button onClick={handleScore} disabled={scoring} style={{ background:`${P.purple}10`, border:`1px solid ${P.purple}20`, color:P.purple, borderRadius:8, padding:"5px 12px", cursor:"pointer", fontSize:11, fontWeight:600 }}>
            {scoring ? "Güncelleniyor..." : "↻ Güncelle"}
          </button>
        </>
      ) : (
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ color:P.sub, fontSize:12 }}>AI skoru henüz hesaplanmadı</div>
          <button onClick={handleScore} disabled={scoring} style={{ background:`linear-gradient(135deg,${P.purple},${P.pink})`, border:"none", borderRadius:8, color:"#fff", padding:"6px 14px", cursor:"pointer", fontSize:11, fontWeight:700 }}>
            {scoring ? "Hesaplanıyor..." : "Skoru Hesapla"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────

// ================================================================
// v3 PAGE COMPONENTS
// ================================================================

// ── StockPage ────────────────────────────────────────────────
function StockPage() {
  const { data, reload } = useApi(() => apiFetch("/api/stock").then(r => r?.data));
  const { data: sum }    = useApi(() => apiFetch("/api/stock/summary").then(r => r?.data));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:"", sku:"", category:"", unit:"adet", quantity:0, minQuantity:0, costPrice:"", salePrice:"", vatRate:20 });
  const [saving, setSaving] = useState(false);
  const [movModal, setMovModal] = useState(null);
  const [movForm, setMovForm] = useState({ type:"IN", quantity:1, notes:"" });
  const items = data?.items || [];

  const save = async () => {
    if (!form.name) return;
    setSaving(true);
    try { await apiFetch("/api/stock", { method:"POST", body: JSON.stringify(form) }); reload(); setShowForm(false); setForm({ name:"", sku:"", category:"", unit:"adet", quantity:0, minQuantity:0, costPrice:"", salePrice:"", vatRate:20 }); }
    catch(e) { alert(e.message); } finally { setSaving(false); }
  };

  const addMovement = async () => {
    try { await apiFetch(`/api/stock/${movModal.id}/movement`, { method:"POST", body: JSON.stringify(movForm) }); reload(); setMovModal(null); setMovForm({ type:"IN", quantity:1, notes:"" }); }
    catch(e) { alert(e.message); }
  };

  return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div><h1 style={{ color:P.text, fontSize:24, fontWeight:800, margin:"0 0 4px" }}>Stok Yönetimi</h1><div style={{ color:P.sub, fontSize:13 }}>Ürün takibi, giriş/çıkış ve düşük stok uyarıları</div></div>
        <button onClick={() => setShowForm(v=>!v)} style={{ background:`linear-gradient(135deg,${P.teal},${P.emerald})`, border:"none", borderRadius:12, color:"#fff", padding:"10px 20px", cursor:"pointer", fontSize:13, fontWeight:700 }}>+ Ürün Ekle</button>
      </div>
      {sum && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12, marginBottom:20 }}>
          {[
            { label:"Toplam Ürün", value: sum.totalItems, color:P.teal },
            { label:"Stok Değeri", value:`₺${Number(sum.totalValue).toLocaleString("tr-TR",{maximumFractionDigits:0})}`, color:P.emerald, raw:true },
            { label:"Düşük Stok", value: sum.lowStockCount, color:P.rose },
            { label:"Kategori", value: sum.categories?.length || 0, color:P.amber },
          ].map((s,i) => (
            <div key={i} style={{ background:P.card, borderRadius:14, padding:"14px 16px", border:`1.5px solid ${s.color}20` }}>
              <div style={{ color:s.color, fontSize:s.raw?16:22, fontWeight:800 }}>{s.value}</div>
              <div style={{ color:P.sub, fontSize:12 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <div style={{ background:P.card, borderRadius:18, padding:24, border:`1.5px solid ${P.teal}20`, marginBottom:20 }}>
          <div style={{ color:P.text, fontWeight:700, fontSize:15, marginBottom:16 }}>Yeni Ürün</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
            {[["Ürün Adı *","name","text"],["SKU","sku","text"],["Kategori","category","text"],["Birim","unit","text"],["Başlangıç Stok","quantity","number"],["Min Stok (Uyarı)","minQuantity","number"],["Maliyet Fiyatı","costPrice","number"],["Satış Fiyatı","salePrice","number"],["KDV %","vatRate","number"]].map(([lbl,key,type]) => (
              <div key={key}>
                <label style={{ color:P.sub, fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>{lbl}</label>
                <input type={type} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:type==="number"?Number(e.target.value):e.target.value}))} style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:P.text, outline:"none", boxSizing:"border-box" }} />
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:10, marginTop:16 }}>
            <button onClick={save} disabled={saving} style={{ background:`linear-gradient(135deg,${P.teal},${P.emerald})`, border:"none", borderRadius:10, color:"#fff", padding:"10px 24px", cursor:"pointer", fontSize:13, fontWeight:700 }}>{saving?"Kaydediliyor...":"Kaydet"}</button>
            <button onClick={()=>setShowForm(false)} style={{ background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, color:P.sub, padding:"10px 20px", cursor:"pointer", fontSize:13 }}>İptal</button>
          </div>
        </div>
      )}
      {movModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:400, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:P.card, borderRadius:20, padding:28, width:360, boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ color:P.text, fontWeight:700, fontSize:15, marginBottom:16 }}>Stok Hareketi — {movModal.name}</div>
            <div style={{ display:"grid", gap:12 }}>
              <div><label style={{ color:P.sub, fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>İşlem Tipi</label>
                <select value={movForm.type} onChange={e=>setMovForm(f=>({...f,type:e.target.value}))} style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:P.text, outline:"none" }}>
                  <option value="IN">Giriş (Stok Ekle)</option><option value="OUT">Çıkış (Stok Düş)</option><option value="ADJUSTMENT">Düzeltme</option><option value="RETURN">İade</option>
                </select>
              </div>
              <div><label style={{ color:P.sub, fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>Miktar</label><input type="number" min="0.001" step="0.001" value={movForm.quantity} onChange={e=>setMovForm(f=>({...f,quantity:Number(e.target.value)}))} style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:P.text, outline:"none", boxSizing:"border-box" }} /></div>
              <div><label style={{ color:P.sub, fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>Not</label><input value={movForm.notes} onChange={e=>setMovForm(f=>({...f,notes:e.target.value}))} style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:P.text, outline:"none", boxSizing:"border-box" }} /></div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:18 }}>
              <button onClick={addMovement} style={{ flex:1, background:`linear-gradient(135deg,${P.teal},${P.emerald})`, border:"none", borderRadius:10, color:"#fff", padding:"10px", cursor:"pointer", fontSize:13, fontWeight:700 }}>Kaydet</button>
              <button onClick={()=>setMovModal(null)} style={{ flex:1, background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, color:P.sub, padding:"10px", cursor:"pointer", fontSize:13 }}>İptal</button>
            </div>
          </div>
        </div>
      )}
      <Table color={P.teal} rows={items} emptyMsg="Henüz ürün yok — yukarıdan ekleyin"
        cols={[
          { key:"name", label:"Ürün", render:i=><div><div style={{ color:P.text, fontSize:13, fontWeight:600 }}>{i.name}</div>{i.sku&&<div style={{ color:P.muted, fontSize:11 }}>SKU: {i.sku}</div>}</div> },
          { key:"category", label:"Kategori", render:i=><span style={{ color:P.sub, fontSize:12 }}>{i.category||"—"}</span> },
          { key:"quantity", label:"Stok", render:i=>{const low=Number(i.quantity)<=Number(i.minQuantity)&&Number(i.minQuantity)>0;return <span style={{ color:low?P.rose:P.emerald, fontWeight:700, fontSize:13 }}>{Number(i.quantity).toLocaleString()} {i.unit}{low?" ⚠️":""}</span>;} },
          { key:"salePrice", label:"Satış Fiyatı", render:i=><span style={{ color:P.text, fontFamily:"monospace", fontSize:13 }}>{i.salePrice?`₺${Number(i.salePrice).toLocaleString()}`:"—"}</span> },
          { key:"actions", label:"", render:i=><button onClick={()=>setMovModal(i)} style={{ background:`${P.teal}12`, border:`1px solid ${P.teal}25`, color:P.teal, borderRadius:8, padding:"4px 12px", cursor:"pointer", fontSize:11, fontWeight:700 }}>Hareket</button> },
        ]} />
    </div>
  );
}

// ── InstallmentsPage ─────────────────────────────────────────
function InstallmentsPage({ invoices }) {
  const { data, reload } = useApi(() => apiFetch("/api/installments").then(r => r?.data));
  const { data: upcoming } = useApi(() => apiFetch("/api/installments/upcoming").then(r => r?.data));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ invoiceId:"", installmentCount:3, firstDueDate:"" });
  const [saving, setSaving] = useState(false);
  const plans = data?.plans || [];

  const save = async () => {
    if (!form.invoiceId || !form.firstDueDate) return;
    setSaving(true);
    try { await apiFetch("/api/installments", { method:"POST", body: JSON.stringify(form) }); reload(); setShowForm(false); }
    catch(e) { alert(e.message); } finally { setSaving(false); }
  };

  const pay = async (planId, installmentId) => {
    try { await apiFetch(`/api/installments/${installmentId}/pay`, { method:"POST" }); reload(); }
    catch(e) { alert(e.message); }
  };

  return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div><h1 style={{ color:P.text, fontSize:24, fontWeight:800, margin:"0 0 4px" }}>Taksit & Vade Takibi</h1><div style={{ color:P.sub, fontSize:13 }}>Fatura taksitlendirme ve otomatik hatırlatma</div></div>
        <button onClick={()=>setShowForm(v=>!v)} style={{ background:`linear-gradient(135deg,${P.indigo},${P.violet})`, border:"none", borderRadius:12, color:"#fff", padding:"10px 20px", cursor:"pointer", fontSize:13, fontWeight:700 }}>+ Taksit Planı</button>
      </div>
      {upcoming?.count > 0 && (
        <div style={{ background:`${P.amber}10`, border:`1.5px solid ${P.amber}25`, borderRadius:14, padding:"14px 18px", marginBottom:16, display:"flex", gap:12, alignItems:"center" }}>
          <span style={{ fontSize:22 }}>⏰</span>
          <div><div style={{ color:P.amber, fontWeight:700, fontSize:13 }}>Bu Hafta {upcoming.count} Taksit Vadesi</div><div style={{ color:P.sub, fontSize:12 }}>Müşterilerinizi hatırlatın</div></div>
        </div>
      )}
      {showForm && (
        <div style={{ background:P.card, borderRadius:18, padding:24, border:`1.5px solid ${P.indigo}20`, marginBottom:20 }}>
          <div style={{ color:P.text, fontWeight:700, fontSize:15, marginBottom:16 }}>Yeni Taksit Planı</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
            <div><label style={{ color:P.sub, fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>Fatura *</label>
              <select value={form.invoiceId} onChange={e=>setForm(f=>({...f,invoiceId:e.target.value}))} style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:P.text, outline:"none" }}>
                <option value="">Fatura seçin</option>
                {invoices.filter(i=>i.status!=="PAID").map(inv=><option key={inv.id} value={inv.id}>{inv.invoiceNumber} — {inv.customerName} ₺{Number(inv.total).toLocaleString()}</option>)}
              </select>
            </div>
            <div><label style={{ color:P.sub, fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>Taksit Sayısı</label><input type="number" min="2" max="60" value={form.installmentCount} onChange={e=>setForm(f=>({...f,installmentCount:parseInt(e.target.value)}))} style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:P.text, outline:"none", boxSizing:"border-box" }} /></div>
            <div><label style={{ color:P.sub, fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>İlk Vade</label><input type="date" value={form.firstDueDate} onChange={e=>setForm(f=>({...f,firstDueDate:e.target.value}))} style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:P.text, outline:"none", boxSizing:"border-box" }} /></div>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:16 }}>
            <button onClick={save} disabled={saving} style={{ background:`linear-gradient(135deg,${P.indigo},${P.violet})`, border:"none", borderRadius:10, color:"#fff", padding:"10px 24px", cursor:"pointer", fontSize:13, fontWeight:700 }}>{saving?"Oluşturuluyor...":"Plan Oluştur"}</button>
            <button onClick={()=>setShowForm(false)} style={{ background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, color:P.sub, padding:"10px 20px", cursor:"pointer", fontSize:13 }}>İptal</button>
          </div>
        </div>
      )}
      {plans.length === 0 ? (
        <div style={{ textAlign:"center", padding:60, color:P.muted }}><div style={{ fontSize:48, marginBottom:12 }}>📅</div><div>Henüz taksit planı yok</div></div>
      ) : plans.map(plan => (
        <div key={plan.id} style={{ background:P.card, borderRadius:16, padding:20, border:`1.5px solid ${P.indigo}15`, marginBottom:14, boxShadow:`0 2px 12px ${P.indigo}06` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div><div style={{ color:P.text, fontWeight:700 }}>{plan.customerName}</div><div style={{ color:P.sub, fontSize:12 }}>{plan.invoice?.invoiceNumber} — ₺{Number(plan.totalAmount).toLocaleString()} — {plan.installmentCount} taksit</div></div>
            <div style={{ background:`${P.indigo}12`, color:P.indigo, borderRadius:20, padding:"4px 12px", fontSize:12, fontWeight:700 }}>{plan.completionRate}% tamamlandı</div>
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {plan.installments.map(inst => {
              const isOverdue = inst.status === "PENDING" && new Date(inst.dueDate) < new Date();
              const color = inst.status === "PAID" ? P.emerald : isOverdue ? P.rose : P.amber;
              return (
                <div key={inst.id} style={{ background:`${color}10`, border:`1.5px solid ${color}25`, borderRadius:10, padding:"10px 14px", minWidth:100, textAlign:"center" }}>
                  <div style={{ color:P.sub, fontSize:10, marginBottom:3 }}>Taksit {inst.installmentNo}</div>
                  <div style={{ color:P.text, fontWeight:700, fontSize:13 }}>₺{Number(inst.amount).toLocaleString()}</div>
                  <div style={{ color:P.muted, fontSize:10, marginBottom:6 }}>{new Date(inst.dueDate).toLocaleDateString("tr-TR")}</div>
                  {inst.status === "PAID" ? <span style={{ color:P.emerald, fontSize:11, fontWeight:700 }}>✓ Ödendi</span>
                  : <button onClick={()=>pay(plan.id, inst.id)} style={{ background:`linear-gradient(135deg,${color},${color}90)`, border:"none", borderRadius:6, color:"#fff", padding:"4px 10px", cursor:"pointer", fontSize:10, fontWeight:700 }}>Öde</button>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── ChecksPage ───────────────────────────────────────────────
function ChecksPage() {
  const { data, reload } = useApi(() => apiFetch("/api/checks").then(r => r?.data));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ checkType:"RECEIVED", checkNumber:"", bankName:"", accountName:"", amount:"", dueDate:"", notes:"" });
  const [saving, setSaving] = useState(false);
  const checks = data?.checks || [];
  const stats = data?.stats || {};

  const save = async () => {
    if (!form.checkNumber || !form.accountName || !form.amount || !form.dueDate) return;
    setSaving(true);
    try { await apiFetch("/api/checks", { method:"POST", body: JSON.stringify(form) }); reload(); setShowForm(false); setForm({ checkType:"RECEIVED", checkNumber:"", bankName:"", accountName:"", amount:"", dueDate:"", notes:"" }); }
    catch(e) { alert(e.message); } finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    const reason = status === "BOUNCED" ? prompt("İade gerekçesi:") : null;
    try { await apiFetch(`/api/checks/${id}/status`, { method:"PATCH", body: JSON.stringify({ status, bounceReason: reason }) }); reload(); }
    catch(e) { alert(e.message); }
  };

  const statusColor = { PENDING:P.amber, CLEARED:P.emerald, BOUNCED:P.rose, CANCELLED:P.muted };
  const statusLabel = { PENDING:"Bekliyor", CLEARED:"Tahsil Edildi", BOUNCED:"İade", CANCELLED:"İptal" };

  return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div><h1 style={{ color:P.text, fontSize:24, fontWeight:800, margin:"0 0 4px" }}>Çek & Senet Takibi</h1><div style={{ color:P.sub, fontSize:13 }}>Alınan ve verilen çek/senet takibi</div></div>
        <button onClick={()=>setShowForm(v=>!v)} style={{ background:`linear-gradient(135deg,${P.orange},${P.amber})`, border:"none", borderRadius:12, color:"#fff", padding:"10px 20px", cursor:"pointer", fontSize:13, fontWeight:700 }}>+ Çek Ekle</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12, marginBottom:20 }}>
        {[
          { label:"Alacak Çek", value:`₺${Number(stats.received?.amount||0).toLocaleString("tr-TR",{maximumFractionDigits:0})}`, sub:`${stats.received?.count||0} adet`, color:P.emerald },
          { label:"Borç Çek", value:`₺${Number(stats.issued?.amount||0).toLocaleString("tr-TR",{maximumFractionDigits:0})}`, sub:`${stats.issued?.count||0} adet`, color:P.rose },
          { label:"İade Olan", value: stats.bouncedCount||0, sub:"toplam", color:P.orange },
        ].map((s,i) => (
          <div key={i} style={{ background:P.card, borderRadius:14, padding:"14px 16px", border:`1.5px solid ${s.color}20` }}>
            <div style={{ color:s.color, fontSize:18, fontWeight:800 }}>{s.value}</div>
            <div style={{ color:P.sub, fontSize:11 }}>{s.sub}</div>
            <div style={{ color:P.muted, fontSize:11 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {showForm && (
        <div style={{ background:P.card, borderRadius:18, padding:24, border:`1.5px solid ${P.orange}20`, marginBottom:20 }}>
          <div style={{ color:P.text, fontWeight:700, fontSize:15, marginBottom:16 }}>Yeni Çek</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
            <div><label style={{ color:P.sub, fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>Tip</label>
              <select value={form.checkType} onChange={e=>setForm(f=>({...f,checkType:e.target.value}))} style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:P.text, outline:"none" }}>
                <option value="RECEIVED">Alınan Çek</option><option value="ISSUED">Verilen Çek</option>
              </select>
            </div>
            {[["Çek No *","checkNumber"],["Banka","bankName"],["Çek Sahibi/Alıcı *","accountName"],["Tutar (TRY) *","amount"],["Vade Tarihi *","dueDate"],["Not","notes"]].map(([lbl,key]) => (
              <div key={key}><label style={{ color:P.sub, fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>{lbl}</label>
                <input type={key==="dueDate"?"date":key==="amount"?"number":"text"} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:P.text, outline:"none", boxSizing:"border-box" }} />
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:10, marginTop:16 }}>
            <button onClick={save} disabled={saving} style={{ background:`linear-gradient(135deg,${P.orange},${P.amber})`, border:"none", borderRadius:10, color:"#fff", padding:"10px 24px", cursor:"pointer", fontSize:13, fontWeight:700 }}>{saving?"Kaydediliyor...":"Kaydet"}</button>
            <button onClick={()=>setShowForm(false)} style={{ background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, color:P.sub, padding:"10px 20px", cursor:"pointer", fontSize:13 }}>İptal</button>
          </div>
        </div>
      )}
      <Table color={P.orange} rows={checks} emptyMsg="Henüz çek yok"
        cols={[
          { key:"checkType", label:"Tip", render:c=><span style={{ background:c.checkType==="RECEIVED"?`${P.emerald}15`:`${P.rose}15`, color:c.checkType==="RECEIVED"?P.emerald:P.rose, borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700 }}>{c.checkType==="RECEIVED"?"Alacak":"Borç"}</span> },
          { key:"checkNumber", label:"Çek No", render:c=><span style={{ color:P.text, fontFamily:"monospace", fontWeight:700, fontSize:13 }}>{c.checkNumber}</span> },
          { key:"accountName", label:"Kişi/Şirket", render:c=><span style={{ color:P.text, fontSize:13 }}>{c.accountName}</span> },
          { key:"amount", label:"Tutar", render:c=><span style={{ color:P.emerald, fontWeight:700, fontFamily:"monospace" }}>₺{Number(c.amount).toLocaleString()}</span> },
          { key:"dueDate", label:"Vade", render:c=>{const ov=c.isOverdue;return <span style={{ color:ov?P.rose:P.text, fontWeight:ov?700:400, fontSize:12 }}>{new Date(c.dueDate).toLocaleDateString("tr-TR")}{ov?" ⚠️":""}{c.isDueSoon?" 🔔":""}</span>;} },
          { key:"status", label:"Durum", render:c=><span style={{ background:`${statusColor[c.status]||P.muted}15`, color:statusColor[c.status]||P.muted, border:`1px solid ${statusColor[c.status]||P.muted}25`, borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700 }}>{statusLabel[c.status]||c.status}</span> },
          { key:"actions", label:"", render:c=>c.status==="PENDING"&&(
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={()=>updateStatus(c.id,"CLEARED")} style={{ background:`${P.emerald}12`, border:`1px solid ${P.emerald}25`, color:P.emerald, borderRadius:8, padding:"3px 8px", cursor:"pointer", fontSize:10, fontWeight:700 }}>Tahsil</button>
              <button onClick={()=>updateStatus(c.id,"BOUNCED")} style={{ background:`${P.rose}12`, border:`1px solid ${P.rose}25`, color:P.rose, borderRadius:8, padding:"3px 8px", cursor:"pointer", fontSize:10, fontWeight:700 }}>İade</button>
            </div>
          )},
        ]} />
    </div>
  );
}

// ── PersonnelPage ────────────────────────────────────────────
function PersonnelPage() {
  const { data, reload } = useApi(() => apiFetch("/api/personnel").then(r => r?.data));
  const [showForm, setShowForm] = useState(false);
  const [calcMode, setCalcMode] = useState(false);
  const [calcSalary, setCalcSalary] = useState("");
  const [calcResult, setCalcResult] = useState(null);
  const [form, setForm] = useState({ name:"", position:"", department:"", startDate:"", grossSalary:"" });
  const [saving, setSaving] = useState(false);
  const [slipModal, setSlipModal] = useState(null);
  const [slipPeriod, setSlipPeriod] = useState("");
  const personnel = data?.personnel || [];

  const save = async () => {
    if (!form.name || !form.startDate || !form.grossSalary) return;
    setSaving(true);
    try { await apiFetch("/api/personnel", { method:"POST", body: JSON.stringify(form) }); reload(); setShowForm(false); setForm({ name:"", position:"", department:"", startDate:"", grossSalary:"" }); }
    catch(e) { alert(e.message); } finally { setSaving(false); }
  };

  const calculate = async () => {
    if (!calcSalary) return;
    try { const res = await apiFetch("/api/personnel/calculate", { method:"POST", body: JSON.stringify({ grossSalary: Number(calcSalary) }) }); setCalcResult(res?.data); }
    catch(e) { alert(e.message); }
  };

  const generateSlip = async () => {
    if (!slipPeriod) return;
    try { await apiFetch(`/api/personnel/${slipModal.id}/slip`, { method:"POST", body: JSON.stringify({ period: slipPeriod }) }); alert("Bordro oluşturuldu!"); setSlipModal(null); }
    catch(e) { alert(e.message); }
  };

  return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div><h1 style={{ color:P.text, fontSize:24, fontWeight:800, margin:"0 0 4px" }}>Personel & SGK</h1><div style={{ color:P.sub, fontSize:13 }}>Maaş bordrosu, SGK hesaplama — Türkiye 2026</div></div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={()=>setCalcMode(v=>!v)} style={{ background:`${P.sky}15`, border:`1.5px solid ${P.sky}30`, borderRadius:12, color:P.sky, padding:"10px 16px", cursor:"pointer", fontSize:13, fontWeight:700 }}>🧮 Hesapla</button>
          <button onClick={()=>setShowForm(v=>!v)} style={{ background:`linear-gradient(135deg,${P.sky},${P.cyan})`, border:"none", borderRadius:12, color:"#fff", padding:"10px 20px", cursor:"pointer", fontSize:13, fontWeight:700 }}>+ Personel</button>
        </div>
      </div>
      {data?.totalMonthlyCost > 0 && (
        <div style={{ background:`linear-gradient(135deg,${P.sky}10,${P.cyan}05)`, border:`1.5px solid ${P.sky}20`, borderRadius:16, padding:20, marginBottom:20 }}>
          <div style={{ color:P.sub, fontSize:12, marginBottom:4 }}>Aylık Toplam Personel Maliyeti</div>
          <div style={{ color:P.sky, fontSize:28, fontWeight:800 }}>₺{Number(data.totalMonthlyCost).toLocaleString("tr-TR",{maximumFractionDigits:0})}</div>
          <div style={{ color:P.muted, fontSize:12 }}>{personnel.filter(p=>p.status==="ACTIVE").length} aktif personel</div>
        </div>
      )}
      {calcMode && (
        <div style={{ background:P.card, borderRadius:18, padding:24, border:`1.5px solid ${P.sky}20`, marginBottom:20 }}>
          <div style={{ color:P.text, fontWeight:700, fontSize:15, marginBottom:16 }}>🧮 Maaş Hesaplama (Türkiye 2026)</div>
          <div style={{ display:"flex", gap:12, alignItems:"flex-end", marginBottom:16 }}>
            <div style={{ flex:1 }}><label style={{ color:P.sub, fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>Brüt Maaş (TRY)</label><input type="number" value={calcSalary} onChange={e=>setCalcSalary(e.target.value)} placeholder="Örn: 25000" style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, padding:"10px 14px", fontSize:14, color:P.text, outline:"none", boxSizing:"border-box" }} /></div>
            <button onClick={calculate} style={{ background:`linear-gradient(135deg,${P.sky},${P.cyan})`, border:"none", borderRadius:10, color:"#fff", padding:"10px 24px", cursor:"pointer", fontSize:13, fontWeight:700 }}>Hesapla</button>
          </div>
          {calcResult && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10 }}>
              {[
                { label:"Brüt Maaş", value:calcResult.grossSalary, color:P.text },
                { label:"İşçi SGK (%14)", value:`-${calcResult.sgkEmployee}`, color:P.rose },
                { label:"Gelir Vergisi", value:`-${calcResult.incomeTax}`, color:P.rose },
                { label:"Damga Vergisi", value:`-${calcResult.stampTax}`, color:P.rose },
                { label:"Net Maaş", value:calcResult.netSalary, color:P.emerald, bold:true },
                { label:"İşveren SGK (%20.5)", value:`+${calcResult.sgkEmployer}`, color:P.orange },
                { label:"Toplam Maliyet", value:calcResult.totalCost, color:P.sky, bold:true },
              ].map((r,i) => (
                <div key={i} style={{ background:`${r.color}08`, border:`1px solid ${r.color}15`, borderRadius:10, padding:"10px 14px" }}>
                  <div style={{ color:P.sub, fontSize:10, marginBottom:4 }}>{r.label}</div>
                  <div style={{ color:r.color, fontSize:15, fontWeight:r.bold?800:600 }}>₺{Number(String(r.value).replace("-","").replace("+","")).toLocaleString("tr-TR",{maximumFractionDigits:2})}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {showForm && (
        <div style={{ background:P.card, borderRadius:18, padding:24, border:`1.5px solid ${P.sky}20`, marginBottom:20 }}>
          <div style={{ color:P.text, fontWeight:700, fontSize:15, marginBottom:16 }}>Yeni Personel</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
            {[["Ad Soyad *","name","text"],["Pozisyon","position","text"],["Departman","department","text"],["İşe Başlama *","startDate","date"],["Brüt Maaş (TRY) *","grossSalary","number"]].map(([lbl,key,type]) => (
              <div key={key}><label style={{ color:P.sub, fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>{lbl}</label><input type={type} value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:P.text, outline:"none", boxSizing:"border-box" }} /></div>
            ))}
          </div>
          <div style={{ display:"flex", gap:10, marginTop:16 }}>
            <button onClick={save} disabled={saving} style={{ background:`linear-gradient(135deg,${P.sky},${P.cyan})`, border:"none", borderRadius:10, color:"#fff", padding:"10px 24px", cursor:"pointer", fontSize:13, fontWeight:700 }}>{saving?"Kaydediliyor...":"Kaydet"}</button>
            <button onClick={()=>setShowForm(false)} style={{ background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, color:P.sub, padding:"10px 20px", cursor:"pointer", fontSize:13 }}>İptal</button>
          </div>
        </div>
      )}
      {slipModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:400, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:P.card, borderRadius:20, padding:28, width:340 }}>
            <div style={{ color:P.text, fontWeight:700, fontSize:15, marginBottom:16 }}>Bordro Oluştur — {slipModal.name}</div>
            <div><label style={{ color:P.sub, fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>Dönem (YYYY-MM)</label><input value={slipPeriod} onChange={e=>setSlipPeriod(e.target.value)} placeholder="2026-04" style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:P.text, outline:"none", boxSizing:"border-box" }} /></div>
            <div style={{ display:"flex", gap:10, marginTop:18 }}>
              <button onClick={generateSlip} style={{ flex:1, background:`linear-gradient(135deg,${P.sky},${P.cyan})`, border:"none", borderRadius:10, color:"#fff", padding:"10px", cursor:"pointer", fontSize:13, fontWeight:700 }}>Oluştur</button>
              <button onClick={()=>setSlipModal(null)} style={{ flex:1, background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, color:P.sub, padding:"10px", cursor:"pointer", fontSize:13 }}>İptal</button>
            </div>
          </div>
        </div>
      )}
      <Table color={P.sky} rows={personnel} emptyMsg="Henüz personel yok"
        cols={[
          { key:"name", label:"Ad Soyad", render:p=><div><div style={{ color:P.text, fontSize:13, fontWeight:600 }}>{p.name}</div><div style={{ color:P.muted, fontSize:11 }}>{p.position||"—"}</div></div> },
          { key:"department", label:"Departman", render:p=><span style={{ color:P.sub, fontSize:12 }}>{p.department||"—"}</span> },
          { key:"grossSalary", label:"Brüt Maaş", render:p=><span style={{ color:P.text, fontFamily:"monospace", fontWeight:700 }}>₺{Number(p.grossSalary).toLocaleString()}</span> },
          { key:"netSalary", label:"Net (Tahmini)", render:p=>{const net=Number(p.grossSalary)*0.7065;return <span style={{ color:P.emerald, fontFamily:"monospace", fontWeight:700 }}>₺{net.toLocaleString("tr-TR",{maximumFractionDigits:0})}</span>;} },
          { key:"status", label:"Durum", render:p=><span style={{ background:p.status==="ACTIVE"?`${P.emerald}15`:`${P.rose}15`, color:p.status==="ACTIVE"?P.emerald:P.rose, borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700 }}>{p.status==="ACTIVE"?"Aktif":"Pasif"}</span> },
          { key:"actions", label:"", render:p=><button onClick={()=>setSlipModal(p)} style={{ background:`${P.sky}12`, border:`1px solid ${P.sky}25`, color:P.sky, borderRadius:8, padding:"4px 12px", cursor:"pointer", fontSize:11, fontWeight:700 }}>Bordro</button> },
        ]} />
    </div>
  );
}

// ── KartvizitPage ────────────────────────────────────────────
function KartvizitPage({ user }) {
  const { data: profile, reload } = useApi(() => apiFetch("/api/profile-page").then(r => r?.data));
  const { data: qr } = useApi(() => apiFetch("/api/profile-page/qr").then(r => r?.data));
  const [form, setForm] = useState({ displayName:"", tagline:"", description:"", phone:"", email:"", website:"", address:"", isActive:true, theme:"purple" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => { if (profile) setForm(f => ({ ...f, ...profile })); }, [profile]);

  const save = async () => {
    setSaving(true); setMsg(null);
    try { const res = await apiFetch("/api/profile-page", { method:"POST", body: JSON.stringify(form) }); setMsg({ type:"success", text:`Profil kaydedildi! ${res?.profileUrl}` }); reload(); }
    catch(e) { setMsg({ type:"error", text:e.message }); } finally { setSaving(false); }
  };

  return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>
      <div style={{ marginBottom:24 }}><h1 style={{ color:P.text, fontSize:24, fontWeight:800, margin:"0 0 4px" }}>Dijital Kartvizit</h1><div style={{ color:P.sub, fontSize:13 }}>Müşterilere paylaşılabilir public profil sayfası</div></div>
      {qr?.profileUrl && (
        <div style={{ background:`linear-gradient(135deg,${P.violet}10,${P.pink}05)`, border:`1.5px solid ${P.violet}20`, borderRadius:18, padding:24, marginBottom:24, display:"flex", gap:24, alignItems:"center" }}>
          {qr.qrUrl && <img src={qr.qrUrl} alt="QR" style={{ width:100, height:100, borderRadius:12 }} />}
          <div>
            <div style={{ color:P.text, fontWeight:700, fontSize:15, marginBottom:6 }}>Profiliniz Yayında 🎉</div>
            <a href={qr.profileUrl} target="_blank" rel="noreferrer" style={{ color:P.violet, fontSize:13, fontWeight:600 }}>{qr.profileUrl}</a>
            <div style={{ color:P.sub, fontSize:12, marginTop:4 }}>QR kodu indirip müşterilerinizle paylaşın</div>
          </div>
        </div>
      )}
      <div style={{ background:P.card, borderRadius:18, padding:24, border:`1.5px solid ${P.violet}15` }}>
        <div style={{ color:P.text, fontWeight:700, fontSize:15, marginBottom:16 }}>Profil Bilgileri</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
          {[["Görünen Ad *","displayName"],["Slogan","tagline"],["Telefon","phone"],["E-posta","email"],["Website","website"],["Adres","address"]].map(([lbl,key]) => (
            <div key={key}><label style={{ color:P.sub, fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>{lbl}</label><input value={form[key]||""} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:P.text, outline:"none", boxSizing:"border-box" }} /></div>
          ))}
          <div style={{ gridColumn:"1/-1" }}><label style={{ color:P.sub, fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>Açıklama</label><textarea value={form.description||""} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={3} style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:P.text, outline:"none", resize:"none", fontFamily:"inherit", boxSizing:"border-box" }} /></div>
          <div><label style={{ color:P.sub, fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>Tema Rengi</label>
            <select value={form.theme} onChange={e=>setForm(f=>({...f,theme:e.target.value}))} style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:P.text, outline:"none" }}>
              <option value="purple">Mor (Varsayılan)</option><option value="blue">Mavi</option><option value="green">Yeşil</option><option value="orange">Turuncu</option><option value="pink">Pembe</option>
            </select>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}><label style={{ color:P.sub, fontSize:13 }}>Profil Yayında:</label><input type="checkbox" checked={form.isActive} onChange={e=>setForm(f=>({...f,isActive:e.target.checked}))} style={{ width:18, height:18, cursor:"pointer" }} /></div>
        </div>
        {msg && <div style={{ marginTop:12, padding:"10px 14px", borderRadius:10, background:msg.type==="success"?`${P.emerald}10`:`${P.rose}10`, color:msg.type==="success"?P.emerald:P.rose, fontSize:13 }}>{msg.text}</div>}
        <button onClick={save} disabled={saving} style={{ marginTop:16, background:`linear-gradient(135deg,${P.violet},${P.pink})`, border:"none", borderRadius:10, color:"#fff", padding:"10px 28px", cursor:"pointer", fontSize:13, fontWeight:700 }}>{saving?"Kaydediliyor...":"Kaydet & Yayınla"}</button>
      </div>
    </div>
  );
}

// ── RecurringPage ────────────────────────────────────────────
function RecurringPage() {
  const { data, reload } = useApi(() => apiFetch("/api/recurring").then(r => r?.data));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customerName:"", customerEmail:"", customerPhone:"", items:[{name:"",quantity:1,unitPrice:0}], vatRate:20, interval:"MONTHLY", dayOfMonth:1, startDate:"" });
  const [saving, setSaving] = useState(false);
  const recurring = data?.recurring || [];

  const addItem = () => setForm(f => ({ ...f, items:[...f.items,{name:"",quantity:1,unitPrice:0}] }));
  const updateItem = (i,k,v) => setForm(f => { const items=[...f.items]; items[i]={...items[i],[k]:v}; return {...f,items}; });
  const subtotal = form.items.reduce((s,i) => s+Number(i.quantity)*Number(i.unitPrice), 0);

  const save = async () => {
    setSaving(true);
    try { await apiFetch("/api/recurring", { method:"POST", body: JSON.stringify(form) }); reload(); setShowForm(false); }
    catch(e) { alert(e.message); } finally { setSaving(false); }
  };

  const run = async (id) => {
    try { const res = await apiFetch(`/api/recurring/${id}/run`, { method:"POST" }); alert(`✅ ${res?.message}`); reload(); }
    catch(e) { alert(e.message); }
  };

  const toggle = async (id, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try { await apiFetch(`/api/recurring/${id}`, { method:"PATCH", body: JSON.stringify({ status:newStatus }) }); reload(); }
    catch(e) { alert(e.message); }
  };

  const statusColor = { ACTIVE:P.emerald, PAUSED:P.amber, CANCELLED:P.rose, COMPLETED:P.muted };

  return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div><h1 style={{ color:P.text, fontSize:24, fontWeight:800, margin:"0 0 4px" }}>Otomatik Faturalama</h1><div style={{ color:P.sub, fontSize:13 }}>Aylık/yıllık tekrarlayan fatura planları</div></div>
        <button onClick={()=>setShowForm(v=>!v)} style={{ background:`linear-gradient(135deg,${P.lime},${P.teal})`, border:"none", borderRadius:12, color:"#fff", padding:"10px 20px", cursor:"pointer", fontSize:13, fontWeight:700 }}>+ Plan Oluştur</button>
      </div>
      {showForm && (
        <div style={{ background:P.card, borderRadius:18, padding:24, border:`1.5px solid ${P.lime}20`, marginBottom:20 }}>
          <div style={{ color:P.text, fontWeight:700, fontSize:15, marginBottom:16 }}>Yeni Tekrarlayan Fatura</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:16 }}>
            {[["Müşteri Adı *","customerName"],["E-posta","customerEmail"],["Telefon","customerPhone"]].map(([lbl,key]) => (
              <div key={key}><label style={{ color:P.sub, fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>{lbl}</label><input value={form[key]} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:P.text, outline:"none", boxSizing:"border-box" }} /></div>
            ))}
          </div>
          <div style={{ marginBottom:12 }}>
            <div style={{ color:P.sub, fontSize:11, fontWeight:700, marginBottom:8 }}>Ürünler/Hizmetler</div>
            {form.items.map((item,i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:8, marginBottom:8 }}>
                <input placeholder="Ürün/Hizmet adı" value={item.name} onChange={e=>updateItem(i,"name",e.target.value)} style={{ background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:P.text, outline:"none" }} />
                <input type="number" placeholder="Adet" value={item.quantity} onChange={e=>updateItem(i,"quantity",Number(e.target.value))} style={{ background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:P.text, outline:"none" }} />
                <input type="number" placeholder="Birim fiyat" value={item.unitPrice} onChange={e=>updateItem(i,"unitPrice",Number(e.target.value))} style={{ background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:P.text, outline:"none" }} />
              </div>
            ))}
            <button onClick={addItem} style={{ background:`${P.lime}12`, border:`1px solid ${P.lime}25`, color:P.lime, borderRadius:8, padding:"5px 14px", cursor:"pointer", fontSize:12, fontWeight:700 }}>+ Ürün Ekle</button>
            <span style={{ marginLeft:16, color:P.text, fontWeight:700 }}>Ara Toplam: ₺{subtotal.toLocaleString()}</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
            <div><label style={{ color:P.sub, fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>Periyot</label><select value={form.interval} onChange={e=>setForm(f=>({...f,interval:e.target.value}))} style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:P.text, outline:"none" }}><option value="MONTHLY">Aylık</option><option value="YEARLY">Yıllık</option></select></div>
            <div><label style={{ color:P.sub, fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>Ayın Günü</label><input type="number" min="1" max="28" value={form.dayOfMonth} onChange={e=>setForm(f=>({...f,dayOfMonth:parseInt(e.target.value)}))} style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:P.text, outline:"none", boxSizing:"border-box" }} /></div>
            <div><label style={{ color:P.sub, fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>Başlangıç Tarihi</label><input type="date" value={form.startDate} onChange={e=>setForm(f=>({...f,startDate:e.target.value}))} style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:P.text, outline:"none", boxSizing:"border-box" }} /></div>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:16 }}>
            <button onClick={save} disabled={saving} style={{ background:`linear-gradient(135deg,${P.lime},${P.teal})`, border:"none", borderRadius:10, color:"#fff", padding:"10px 24px", cursor:"pointer", fontSize:13, fontWeight:700 }}>{saving?"Oluşturuluyor...":"Plan Oluştur"}</button>
            <button onClick={()=>setShowForm(false)} style={{ background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, color:P.sub, padding:"10px 20px", cursor:"pointer", fontSize:13 }}>İptal</button>
          </div>
        </div>
      )}
      <Table color={P.lime} rows={recurring} emptyMsg="Henüz tekrarlayan fatura yok"
        cols={[
          { key:"customerName", label:"Müşteri", render:r=><span style={{ color:P.text, fontWeight:600, fontSize:13 }}>{r.customerName}</span> },
          { key:"total", label:"Tutar", render:r=><span style={{ color:P.emerald, fontWeight:700, fontFamily:"monospace" }}>₺{Number(r.total).toLocaleString()}</span> },
          { key:"interval", label:"Periyot", render:r=><span style={{ color:P.sub, fontSize:12 }}>{r.interval==="MONTHLY"?"Aylık":"Yıllık"} — Ayın {r.dayOfMonth}.</span> },
          { key:"nextRunDate", label:"Sonraki", render:r=><span style={{ color:P.text, fontSize:12 }}>{new Date(r.nextRunDate).toLocaleDateString("tr-TR")}</span> },
          { key:"runCount", label:"Kesilen", render:r=><span style={{ color:P.muted, fontSize:12 }}>{r.runCount} fatura</span> },
          { key:"status", label:"Durum", render:r=><span style={{ background:`${statusColor[r.status]}15`, color:statusColor[r.status], border:`1px solid ${statusColor[r.status]}25`, borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700 }}>{r.status}</span> },
          { key:"actions", label:"", render:r=>(
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={()=>run(r.id)} style={{ background:`${P.lime}12`, border:`1px solid ${P.lime}25`, color:P.lime, borderRadius:8, padding:"3px 8px", cursor:"pointer", fontSize:10, fontWeight:700 }}>▶ Çalıştır</button>
              <button onClick={()=>toggle(r.id,r.status)} style={{ background:`${P.amber}12`, border:`1px solid ${P.amber}25`, color:P.amber, borderRadius:8, padding:"3px 8px", cursor:"pointer", fontSize:10, fontWeight:700 }}>{r.status==="ACTIVE"?"Durdur":"Başlat"}</button>
            </div>
          )},
        ]} />
    </div>
  );
}

// ── MarketplacePage ──────────────────────────────────────────
function MarketplacePage() {
  const { data, reload } = useApi(() => apiFetch("/api/marketplace/orders").then(r => r?.data));
  const { data: intData, reload:reloadInt } = useApi(() => apiFetch("/api/marketplace/integrations").then(r => r?.data));
  const [syncing, setSyncing] = useState(null);
  const [tab, setTab] = useState("orders");
  const [intForm, setIntForm] = useState({ channel:"TRENDYOL", apiKey:"", apiSecret:"", supplierId:"" });
  const orders = data?.orders || [];
  const stats = data?.stats || [];
  const integrations = Array.isArray(intData) ? intData : [];

  const sync = async (channel) => {
    setSyncing(channel);
    try { const res = await apiFetch(`/api/marketplace/sync/${channel}`, { method:"POST" }); alert(res?.message); reload(); }
    catch(e) { alert(e.message); } finally { setSyncing(null); }
  };

  const saveInt = async () => {
    try { await apiFetch("/api/marketplace/integrations", { method:"POST", body: JSON.stringify(intForm) }); reloadInt(); alert("Entegrasyon kaydedildi"); }
    catch(e) { alert(e.message); }
  };

  const createInvoice = async (orderId) => {
    try { const res = await apiFetch(`/api/marketplace/orders/${orderId}/create-invoice`, { method:"POST" }); alert(`✅ Fatura oluşturuldu: ${res?.data?.invoiceNumber}`); reload(); }
    catch(e) { alert(e.message); }
  };

  const channelColor = { TRENDYOL:P.orange, HEPSIBURADA:"#FF6000", AMAZON_TR:P.amber, N11:P.cyan, GETIR:P.violet };

  return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>
      <div style={{ marginBottom:20 }}><h1 style={{ color:P.text, fontSize:24, fontWeight:800, margin:"0 0 4px" }}>Pazar Yeri Entegrasyonu</h1><div style={{ color:P.sub, fontSize:13 }}>Trendyol, Hepsiburada ve diğer platformlardan sipariş senkronizasyonu</div></div>
      <div style={{ display:"flex", gap:10, marginBottom:20 }}>
        {["orders","integrations"].map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{ background:tab===t?`linear-gradient(135deg,${P.orange},${P.amber})`:`${P.orange}10`, border:`1.5px solid ${P.orange}${tab===t?"":"20"}`, borderRadius:10, color:tab===t?"#fff":P.orange, padding:"8px 20px", cursor:"pointer", fontSize:13, fontWeight:700 }}>
            {t==="orders"?"📦 Siparişler":"🔗 Entegrasyonlar"}
          </button>
        ))}
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          {["TRENDYOL","HEPSIBURADA"].map(ch => (
            <button key={ch} onClick={()=>sync(ch)} disabled={syncing===ch} style={{ background:`${channelColor[ch]}15`, border:`1.5px solid ${channelColor[ch]}30`, borderRadius:10, color:channelColor[ch], padding:"8px 16px", cursor:"pointer", fontSize:12, fontWeight:700 }}>
              {syncing===ch?"Senkronize...":ch==="TRENDYOL"?"🔄 Trendyol":"🔄 Hepsiburada"}
            </button>
          ))}
        </div>
      </div>
      {tab === "orders" && (
        <>
          {stats.length > 0 && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:12, marginBottom:20 }}>
              {stats.map((s,i) => (
                <div key={i} style={{ background:P.card, borderRadius:14, padding:"14px 16px", border:`1.5px solid ${channelColor[s.channel]||P.orange}20` }}>
                  <div style={{ color:channelColor[s.channel]||P.orange, fontSize:11, fontWeight:700, marginBottom:4 }}>{s.channel}</div>
                  <div style={{ color:P.text, fontSize:18, fontWeight:800 }}>{s._count}</div>
                  <div style={{ color:P.emerald, fontSize:12, fontWeight:600 }}>₺{Number(s._sum?.total||0).toLocaleString("tr-TR",{maximumFractionDigits:0})}</div>
                </div>
              ))}
            </div>
          )}
          <Table color={P.orange} rows={orders} emptyMsg="Sipariş yok — Trendyol veya Hepsiburada senkronize edin"
            cols={[
              { key:"channel", label:"Kanal", render:o=><span style={{ background:`${channelColor[o.channel]||P.orange}15`, color:channelColor[o.channel]||P.orange, borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700 }}>{o.channel}</span> },
              { key:"externalOrderId", label:"Sipariş No", render:o=><span style={{ color:P.text, fontFamily:"monospace", fontSize:12 }}>{o.externalOrderId}</span> },
              { key:"customerName", label:"Müşteri", render:o=><span style={{ color:P.text, fontSize:13 }}>{o.customerName}</span> },
              { key:"total", label:"Tutar", render:o=><span style={{ color:P.emerald, fontWeight:700, fontFamily:"monospace" }}>₺{Number(o.total).toLocaleString()}</span> },
              { key:"status", label:"Durum", render:o=><span style={{ background:`${P.amber}15`, color:P.amber, borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700 }}>{o.status}</span> },
              { key:"orderDate", label:"Tarih", render:o=><span style={{ color:P.muted, fontSize:12 }}>{new Date(o.orderDate).toLocaleDateString("tr-TR")}</span> },
              { key:"actions", label:"", render:o=>!o.invoiceId&&<button onClick={()=>createInvoice(o.id)} style={{ background:`${P.cyan}12`, border:`1px solid ${P.cyan}25`, color:P.cyan, borderRadius:8, padding:"3px 8px", cursor:"pointer", fontSize:10, fontWeight:700 }}>Fatura Oluştur</button> },
            ]} />
        </>
      )}
      {tab === "integrations" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
          <div style={{ background:P.card, borderRadius:18, padding:24, border:`1.5px solid ${P.orange}15` }}>
            <div style={{ color:P.text, fontWeight:700, fontSize:15, marginBottom:16 }}>Entegrasyon Ekle</div>
            <div style={{ display:"grid", gap:12 }}>
              <div><label style={{ color:P.sub, fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>Kanal</label><select value={intForm.channel} onChange={e=>setIntForm(f=>({...f,channel:e.target.value}))} style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:P.text, outline:"none" }}><option>TRENDYOL</option><option>HEPSIBURADA</option><option>AMAZON_TR</option><option>N11</option></select></div>
              {[["API Key","apiKey"],["API Secret","apiSecret"],["Supplier ID","supplierId"]].map(([lbl,key]) => (
                <div key={key}><label style={{ color:P.sub, fontSize:11, fontWeight:700, display:"block", marginBottom:5 }}>{lbl}</label><input value={intForm[key]} onChange={e=>setIntForm(f=>({...f,[key]:e.target.value}))} style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, borderRadius:10, padding:"9px 12px", fontSize:13, color:P.text, outline:"none", boxSizing:"border-box" }} /></div>
              ))}
              <button onClick={saveInt} style={{ background:`linear-gradient(135deg,${P.orange},${P.amber})`, border:"none", borderRadius:10, color:"#fff", padding:"10px", cursor:"pointer", fontSize:13, fontWeight:700 }}>Kaydet</button>
            </div>
          </div>
          <div>
            <div style={{ color:P.text, fontWeight:700, fontSize:15, marginBottom:14 }}>Mevcut Entegrasyonlar</div>
            {integrations.length === 0 ? <div style={{ color:P.muted, fontSize:13 }}>Henüz entegrasyon yok</div>
            : integrations.map(int => (
              <div key={int.id} style={{ background:P.card, borderRadius:14, padding:16, border:`1.5px solid ${channelColor[int.channel]||P.orange}20`, marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ color:channelColor[int.channel]||P.orange, fontWeight:700 }}>{int.channel}</span>
                  <span style={{ background:int.isActive?`${P.emerald}15`:`${P.rose}15`, color:int.isActive?P.emerald:P.rose, borderRadius:20, padding:"2px 8px", fontSize:11, fontWeight:700 }}>{int.isActive?"Aktif":"Pasif"}</span>
                </div>
                {int.lastSyncAt && <div style={{ color:P.muted, fontSize:11, marginTop:4 }}>Son sync: {new Date(int.lastSyncAt).toLocaleString("tr-TR")}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── TaxCalendarPage ──────────────────────────────────────────
function TaxCalendarPage() {
  const { data, reload } = useApi(() => apiFetch("/api/tax-calendar?upcoming=true").then(r => r?.data));
  const { data: allData, reload:reloadAll } = useApi(() => apiFetch("/api/tax-calendar").then(r => r?.data));
  const [generating, setGenerating] = useState(false);
  const events = data?.events || [];
  const allEvents = allData?.events || [];

  const generate = async () => {
    setGenerating(true);
    try { const res = await apiFetch("/api/tax-calendar/generate", { method:"POST", body: JSON.stringify({ year: new Date().getFullYear() }) }); alert(res?.message); reload(); reloadAll(); }
    catch(e) { alert(e.message); } finally { setGenerating(false); }
  };

  const updateStatus = async (id, field) => {
    try { await apiFetch(`/api/tax-calendar/${id}`, { method:"PATCH", body: JSON.stringify({ [field]:true }) }); reload(); reloadAll(); }
    catch(e) { alert(e.message); }
  };

  const typeColor = { KDV:P.cyan, MUHTASAR:P.violet, SGK:P.emerald, KURUMLAR:P.rose, GELIR:P.orange, DAMGA:P.amber, OTHER:P.muted };
  const typeLabel = { KDV:"KDV", MUHTASAR:"Muhtasar", SGK:"SGK", KURUMLAR:"Kurumlar Vergisi", GELIR:"Gelir Vergisi", DAMGA:"Damga", OTHER:"Diğer" };

  return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div><h1 style={{ color:P.text, fontSize:24, fontWeight:800, margin:"0 0 4px" }}>Vergi Takvimi</h1><div style={{ color:P.sub, fontSize:13 }}>KDV, Muhtasar, SGK, Kurumlar — tüm beyanname tarihleri</div></div>
        <button onClick={generate} disabled={generating} style={{ background:`linear-gradient(135deg,${P.rose},${P.orange})`, border:"none", borderRadius:12, color:"#fff", padding:"10px 20px", cursor:"pointer", fontSize:13, fontWeight:700 }}>
          {generating?"Oluşturuluyor...":"📅 Bu Yıl Takvimini Oluştur"}
        </button>
      </div>
      {events.length === 0 && allEvents.length === 0 ? (
        <div style={{ textAlign:"center", padding:60 }}>
          <div style={{ fontSize:60, marginBottom:12 }}>📅</div>
          <div style={{ color:P.text, fontWeight:700, fontSize:16, marginBottom:8 }}>Vergi Takvimi Boş</div>
          <div style={{ color:P.sub, fontSize:13, marginBottom:20 }}>Yukarıdaki butona tıklayarak bu yılın tüm vergi etkinliklerini otomatik oluşturun</div>
        </div>
      ) : (
        <>
          {events.length > 0 && (
            <div style={{ marginBottom:24 }}>
              <div style={{ color:P.text, fontWeight:700, fontSize:15, marginBottom:14 }}>⚡ Yaklaşan & Acil Beyannameler</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:12 }}>
                {events.map(ev => {
                  const col = ev.isOverdue ? P.rose : ev.daysUntil <= 3 ? P.orange : P.amber;
                  return (
                    <div key={ev.id} style={{ background:P.card, borderRadius:16, padding:18, border:`1.5px solid ${col}25`, boxShadow:`0 2px 12px ${col}08` }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                        <span style={{ background:`${typeColor[ev.type]||P.muted}15`, color:typeColor[ev.type]||P.muted, borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:700 }}>{typeLabel[ev.type]||ev.type}</span>
                        <span style={{ color:col, fontSize:12, fontWeight:700 }}>{ev.isOverdue?`${Math.abs(ev.daysUntil)} gün gecikti`:ev.daysUntil===0?"Bugün!":ev.daysUntil===1?"Yarın":`${ev.daysUntil} gün kaldı`}</span>
                      </div>
                      <div style={{ color:P.text, fontWeight:700, fontSize:14, marginBottom:4 }}>{ev.title}</div>
                      <div style={{ color:P.muted, fontSize:12, marginBottom:12 }}>{new Date(ev.dueDate).toLocaleDateString("tr-TR",{weekday:"long",day:"numeric",month:"long"})}</div>
                      <div style={{ display:"flex", gap:8 }}>
                        {!ev.isPrepared && <button onClick={()=>updateStatus(ev.id,"isPrepared")} style={{ background:`${P.amber}12`, border:`1px solid ${P.amber}25`, color:P.amber, borderRadius:8, padding:"5px 12px", cursor:"pointer", fontSize:11, fontWeight:700 }}>✓ Hazırlandı</button>}
                        {ev.isPrepared && !ev.isSubmitted && <button onClick={()=>updateStatus(ev.id,"isSubmitted")} style={{ background:`${P.emerald}12`, border:`1px solid ${P.emerald}25`, color:P.emerald, borderRadius:8, padding:"5px 12px", cursor:"pointer", fontSize:11, fontWeight:700 }}>✓ Gönderildi</button>}
                        {ev.isSubmitted && <span style={{ color:P.emerald, fontSize:12, fontWeight:700 }}>✅ Tamamlandı</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div style={{ color:P.text, fontWeight:700, fontSize:15, marginBottom:14 }}>📋 Tüm Etkinlikler</div>
          <Table color={P.rose} rows={allEvents.slice(0,30)} emptyMsg="Etkinlik yok"
            cols={[
              { key:"type", label:"Tip", render:e=><span style={{ background:`${typeColor[e.type]||P.muted}15`, color:typeColor[e.type]||P.muted, borderRadius:20, padding:"2px 8px", fontSize:11, fontWeight:700 }}>{typeLabel[e.type]||e.type}</span> },
              { key:"title", label:"Beyanname", render:e=><span style={{ color:P.text, fontSize:13 }}>{e.title}</span> },
              { key:"dueDate", label:"Son Tarih", render:e=><span style={{ color:e.isOverdue?P.rose:P.text, fontWeight:e.isOverdue?700:400, fontSize:12 }}>{new Date(e.dueDate).toLocaleDateString("tr-TR")}{e.isOverdue?" ⚠️":""}</span> },
              { key:"isPrepared", label:"Durum", render:e=>e.isSubmitted?<span style={{ color:P.emerald, fontSize:12, fontWeight:700 }}>✅ Gönderildi</span>:e.isPrepared?<span style={{ color:P.amber, fontSize:12, fontWeight:700 }}>📋 Hazır</span>:<span style={{ color:P.muted, fontSize:12 }}>⏳ Bekliyor</span> },
            ]} />
        </>
      )}
    </div>
  );
}

// ── BenchmarkPage ────────────────────────────────────────────
function BenchmarkPage() {
  const { data: cmp, reload } = useApi(() => apiFetch("/api/benchmark/compare").then(r => r?.data));
  const { data: hist } = useApi(() => apiFetch("/api/benchmark/history").then(r => r?.data));
  const [snapshotting, setSnapshotting] = useState(false);
  const comparison = cmp?.comparison;
  const insights = cmp?.insights || [];

  const takeSnapshot = async () => {
    setSnapshotting(true);
    try { await apiFetch("/api/benchmark/snapshot", { method:"POST" }); reload(); alert("Snapshot alındı!"); }
    catch(e) { alert(e.message); } finally { setSnapshotting(false); }
  };

  return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div><h1 style={{ color:P.text, fontSize:24, fontWeight:800, margin:"0 0 4px" }}>Sektör Karşılaştırması</h1><div style={{ color:P.sub, fontSize:13 }}>İşletmenizi sektör ortalamasıyla karşılaştırın</div></div>
        <button onClick={takeSnapshot} disabled={snapshotting} style={{ background:`linear-gradient(135deg,${P.indigo},${P.violet})`, border:"none", borderRadius:12, color:"#fff", padding:"10px 20px", cursor:"pointer", fontSize:13, fontWeight:700 }}>{snapshotting?"Alınıyor...":"📸 Snapshot Al"}</button>
      </div>
      {insights.length > 0 && (
        <div style={{ marginBottom:24 }}>
          {insights.map((ins,i) => (
            <div key={i} style={{ background:`linear-gradient(135deg,${P.indigo}10,${P.violet}05)`, border:`1.5px solid ${P.indigo}20`, borderRadius:14, padding:"14px 18px", display:"flex", gap:12, marginBottom:10 }}>
              <span style={{ fontSize:20 }}>💡</span>
              <div style={{ color:P.text, fontSize:13, lineHeight:1.6 }}>{ins}</div>
            </div>
          ))}
        </div>
      )}
      {comparison ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:16, marginBottom:24 }}>
          {[
            { label:"Aylık Gelir", yours:comparison.revenue.yours, avg:comparison.revenue.average, diff:comparison.revenue.diffPct, prefix:"₺", isPercent:false },
            { label:"Ort. Fatura Tutarı", yours:comparison.invoiceValue.yours, avg:comparison.invoiceValue.average, diff:comparison.invoiceValue.diffPct, prefix:"₺", isPercent:false },
            { label:"Tahsilat Oranı", yours:comparison.collectionRate.yours, avg:comparison.collectionRate.average, diff:comparison.collectionRate.diff, prefix:"", suffix:"%", isPercent:true },
            { label:"Ortalama Ödeme Süresi", yours:comparison.daysToPay.yours, avg:comparison.daysToPay.average, diff:comparison.daysToPay.diff, prefix:"", suffix:" gün", isPercent:false, reverseGood:true },
          ].map((m,i) => {
            const isGood = m.reverseGood ? m.diff <= 0 : m.diff >= 0;
            const col = Math.abs(m.diff) < 1 ? P.muted : isGood ? P.emerald : P.rose;
            return (
              <div key={i} style={{ background:P.card, borderRadius:18, padding:20, border:`1.5px solid ${col}20`, boxShadow:`0 4px 16px ${col}06` }}>
                <div style={{ color:P.sub, fontSize:12, marginBottom:8 }}>{m.label}</div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                  <div><div style={{ color:P.muted, fontSize:10 }}>Sizin</div><div style={{ color:P.text, fontSize:20, fontWeight:800 }}>{m.prefix}{m.isPercent?m.yours.toFixed(1):Number(m.yours).toLocaleString("tr-TR",{maximumFractionDigits:0})}{m.suffix||""}</div></div>
                  <div style={{ textAlign:"right" }}><div style={{ color:P.muted, fontSize:10 }}>Sektör Ort.</div><div style={{ color:P.sub, fontSize:18, fontWeight:600 }}>{m.prefix}{m.isPercent?m.avg.toFixed(1):Number(m.avg).toLocaleString("tr-TR",{maximumFractionDigits:0})}{m.suffix||""}</div></div>
                </div>
                <div style={{ height:4, background:`${P.border}`, borderRadius:2, overflow:"hidden", marginBottom:8 }}>
                  <div style={{ width:`${Math.min(100, m.avg > 0 ? (m.yours/m.avg)*100 : 50)}%`, height:"100%", background:col, borderRadius:2 }} />
                </div>
                <div style={{ color:col, fontSize:11, fontWeight:700 }}>{m.diff >= 0 ? "▲" : "▼"} {Math.abs(m.isPercent?m.diff:m.diff).toFixed(1)}{m.isPercent?"%":""} {isGood ? "ortalamanın üstünde" : "ortalamanın altında"}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign:"center", padding:60 }}>
          <div style={{ fontSize:60, marginBottom:12 }}>📊</div>
          <div style={{ color:P.text, fontWeight:700, fontSize:16, marginBottom:8 }}>Karşılaştırma Verisi Yok</div>
          <div style={{ color:P.sub, fontSize:13 }}>Snapshot alın ve yeterli merchant verisi oluştuğunda karşılaştırma aktifleşir</div>
        </div>
      )}
      {hist?.length > 0 && (
        <div>
          <div style={{ color:P.text, fontWeight:700, fontSize:15, marginBottom:14 }}>📈 Geçmiş Performans</div>
          <Table color={P.indigo} rows={hist||[]} emptyMsg="Geçmiş yok"
            cols={[
              { key:"period", label:"Dönem", render:s=><span style={{ color:P.text, fontFamily:"monospace", fontWeight:700 }}>{s.period}</span> },
              { key:"monthlyRevenue", label:"Gelir", render:s=><span style={{ color:P.emerald, fontWeight:700, fontFamily:"monospace" }}>₺{Number(s.monthlyRevenue).toLocaleString("tr-TR",{maximumFractionDigits:0})}</span> },
              { key:"invoiceCount", label:"Fatura", render:s=><span style={{ color:P.text, fontSize:13 }}>{s.invoiceCount}</span> },
              { key:"collectionRate", label:"Tahsilat", render:s=><span style={{ color:Number(s.collectionRate)>=80?P.emerald:P.amber, fontWeight:700 }}>%{Number(s.collectionRate).toFixed(1)}</span> },
              { key:"avgDaysToPay", label:"Ort. Ödeme", render:s=><span style={{ color:P.sub, fontSize:12 }}>{s.avgDaysToPay} gün</span> },
              { key:"activeCustomers", label:"Müşteri", render:s=><span style={{ color:P.text }}>{s.activeCustomers}</span> },
            ]} />
        </div>
      )}
    </div>
  );
}
function Sidebar({ page, setPage, user, logout, unreadCount, onNotifClick, onSettingsClick, onAIClick, mobileOpen, onMobileClose }) {
  const NAV = [
    { id:"overview",   icon:"⊞",  label:"Overview" },
    { id:"customers",  icon:"👥", label:"Customers" },
    { id:"deals",      icon:"🤝", label:"Deals" },
    { id:"invoices",   icon:"📄", label:"Invoices" },
    { id:"tasks",       icon:"✅", label:"Tasks" },
    // v2
    { id:"efatura",     icon:"🧾", label:"E-Fatura" },
    { id:"factoring",   icon:"💰", label:"Finansman" },
    // v3
    { id:"stock",       icon:"📦", label:"Stok" },
    { id:"installments",icon:"📅", label:"Taksit" },
    { id:"checks",      icon:"🏦", label:"Çek & Senet" },
    { id:"personnel",   icon:"👤", label:"Personel & SGK" },
    { id:"kartvizit",   icon:"🪪", label:"Kartvizit" },
    { id:"recurring",   icon:"🔄", label:"Oto. Fatura" },
    { id:"marketplace", icon:"🛒", label:"Pazar Yeri" },
    { id:"taxcalendar", icon:"🗓️", label:"Vergi Takvimi" },
    { id:"benchmark",   icon:"📊", label:"Benchmark" },
    // v4
    { id:"team",        icon:"👥", label:"Ekip Yönetimi" },
    { id:"campaigns",   icon:"📣", label:"Kampanyalar" },
    // v5 - Sprint 1
    { id:"eirsaliye",   icon:"📦", label:"e-Irsaliye" },
    { id:"receipts",    icon:"📷", label:"Fis Okuma" },
    { id:"whatsapp",    icon:"💬", label:"WhatsApp" },
    { id:"banks",       icon:"🏦", label:"Bankalar" },
  ];
  return (
    <>
      {mobileOpen && <div onClick={onMobileClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:199 }} />}
      <aside style={{ width:230, background:P.sidebar, borderRight:`1.5px solid ${P.border}`, display:"flex", flexDirection:"column", padding:"20px 12px", gap:3, position:"fixed", top:0, left:0, height:"100vh", zIndex:200, boxShadow:"4px 0 24px rgba(108,58,255,0.06)", overflowY:"auto", overflowX:"hidden" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28, padding:"0 8px" }}>
          <div style={{ width:38, height:38, borderRadius:12, background:`linear-gradient(135deg,${P.purple},${P.pink})`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 16px ${P.purple}35` }}>
            <span style={{ color:"#fff", fontWeight:900, fontSize:17 }}>Z</span>
          </div>
          <div>
            <div style={{ color:P.text, fontWeight:800, fontSize:16, lineHeight:1 }}>Zyrix</div>
            <div style={{ color:P.purple, fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase" }}>FinSuite v2</div>
          </div>
        </div>

        {NAV.map(item => {
          const active = page === item.id;
          const isNew = ["efatura","factoring","eirsaliye","receipts","whatsapp","banks"].includes(item.id);
          return (
            <button key={item.id} onClick={() => { setPage(item.id); onMobileClose?.(); }} style={{ background:active?`linear-gradient(90deg,${P.purple}15,${P.purple}06)`:"transparent", border:`1.5px solid ${active?P.purple+"30":"transparent"}`, borderRadius:12, color:active?P.purple:P.sub, padding:"10px 14px", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:10, fontSize:14, fontWeight:active?700:500, transition:"all 0.15s", position:"relative" }}
              onMouseEnter={e=>{ if(!active){e.currentTarget.style.background=`${P.purple}08`;e.currentTarget.style.color=P.purple;}}}
              onMouseLeave={e=>{ if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.color=P.sub;}}}>
              <span style={{ fontSize:17 }}>{item.icon}</span>{item.label}
              {isNew && <span style={{ marginLeft:"auto", background:`${P.emerald}15`, color:P.emerald, borderRadius:20, fontSize:8, fontWeight:800, padding:"1px 6px", letterSpacing:"0.06em" }}>YENİ</span>}
            </button>
          );
        })}

        {/* Divider */}
        <div style={{ height:1, background:P.border, margin:"8px 6px" }} />

        <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
          {/* AI Asistan */}
          <button onClick={onAIClick} style={{ background:`linear-gradient(90deg,${P.purple}08,${P.pink}05)`, border:`1.5px solid ${P.purple}20`, borderRadius:12, color:P.purple, padding:"10px 14px", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:10, fontSize:14, fontWeight:600 }}>
            <span style={{ fontSize:17 }}>🤖</span>AI Asistan
            <span style={{ marginLeft:"auto", background:`${P.purple}15`, color:P.purple, borderRadius:20, fontSize:8, fontWeight:800, padding:"1px 6px" }}>YENİ</span>
          </button>
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
  const [showAI, setShowAI] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    apiFetch("/api/notifications").then(r => setUnreadCount(r?.data?.unreadCount||0)).catch(()=>{});
  }, []);

  const { data: sd } = useApi(() => apiFetch("/api/dashboard/stats").then(r => r?.data));
  const { data: cd, reload: reloadCustomers } = useApi(() => apiFetch("/api/customers").then(r => r?.data));
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
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}*{box-sizing:border-box}body{margin:0;background:${P.bg}}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:${P.bg}}::-webkit-scrollbar-thumb{background:${P.border};border-radius:3px}::-webkit-scrollbar-thumb:hover{background:${P.purple}}input::placeholder{color:${P.muted}}textarea::placeholder{color:${P.muted}}select option{background:#fff;color:${P.text}}`}</style>

      {showNotifs && <NotificationsPanel onClose={() => setShowNotifs(false)} />}
      {showAI && <AIAssistantPanel onClose={() => setShowAI(false)} />}

      <div style={{ display:"flex", minHeight:"100vh", background:P.bg, fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif" }}>
        <Sidebar
          page={page} setPage={setPage} user={user} logout={logout}
          unreadCount={unreadCount}
          onNotifClick={() => { setShowAI(false); setShowNotifs(v=>!v); }}
          onSettingsClick={() => setShowSettings(true)}
          onAIClick={() => { setShowNotifs(false); setShowAI(v=>!v); }}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)} />

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

          {/* SPRINT 1 PAGES (lazy) */}
          {page === "eirsaliye" && (
            <React.Suspense fallback={<div style={{padding:40,textAlign:"center",color:P.sub}}>Yukleniyor...</div>}>
              <EIrsaliyePage />
            </React.Suspense>
          )}
          {page === "receipts" && (
            <React.Suspense fallback={<div style={{padding:40,textAlign:"center",color:P.sub}}>Yukleniyor...</div>}>
              <ReceiptScanPage />
            </React.Suspense>
          )}
          {page === "whatsapp" && (
            <React.Suspense fallback={<div style={{padding:40,textAlign:"center",color:P.sub}}>Yukleniyor...</div>}>
              <WhatsAppPage />
            </React.Suspense>
          )}
          {page === "banks" && (
            <React.Suspense fallback={<div style={{padding:40,textAlign:"center",color:P.sub}}>Yukleniyor...</div>}>
              <BanksPage />
            </React.Suspense>
          )}

          {/* OVERVIEW */}
          {page === "overview" && (
            <div>
              <GreetingBanner user={user} />
              <div style={{ marginBottom:24 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}><span style={{ color:P.emerald, fontSize:18 }}>💰</span><span style={{ color:P.text, fontSize:15, fontWeight:700 }}>Gelir & Finans</span></div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:16 }}>
                  <KPI label="Bu Ay Gelir" value={kpis?.revenueThisMonth||0} prefix="₺" color={P.emerald} icon="💵" change={kpis?.revenueGrowth} sparkData={[kpis?.revenueLastMonth||0, kpis?.revenueThisMonth||0]} />
                  <KPI label="Pipeline Değeri" value={kpis?.pipelineValue||0} prefix="₺" color={P.cyan} icon="📊" />
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
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <h1 style={{ color:P.text, fontSize:24, fontWeight:800, margin:0 }}>Müşteriler</h1>
                <button onClick={async () => { await apiFetch("/api/customer-score/batch", { method:"POST" }); reloadCustomers(); }} style={{ background:`linear-gradient(135deg,${P.purple},${P.violet})`, border:"none", borderRadius:10, color:"#fff", padding:"8px 16px", cursor:"pointer", fontSize:12, fontWeight:700 }}>
                  🤖 Tüm Skorları Güncelle
                </button>
              </div>
              <div style={{ overflowX:"auto" }}>
                <Table color={P.purple} rows={customers} emptyMsg="Henüz müşteri yok — ilk müşterinizi ekleyin!"
                  cols={[
                    { key:"name", label:"İsim", render:(c,i)=>(<div style={{ display:"flex", alignItems:"center", gap:10 }}><div style={{ width:32, height:32, borderRadius:"50%", background:`${COLORS[i%COLORS.length]}20`, display:"flex", alignItems:"center", justifyContent:"center", color:COLORS[i%COLORS.length], fontSize:12, fontWeight:700, flexShrink:0 }}>{(c.name||"?")[0].toUpperCase()}</div><div><div style={{ color:P.text, fontSize:13, fontWeight:600 }}>{c.name}</div>{c.aiRiskLevel && <span style={{ fontSize:10, color: c.aiRiskLevel==="HIGH"?P.rose:c.aiRiskLevel==="MEDIUM"?P.amber:P.emerald, fontWeight:700 }}>● {c.aiRiskLevel==="HIGH"?"Yüksek Risk":c.aiRiskLevel==="MEDIUM"?"Orta Risk":"Düşük Risk"}</span>}</div></div>) },
                    { key:"email", label:"E-posta", render:c=><span style={{ color:P.sub, fontSize:12 }}>{c.email||"—"}</span> },
                    { key:"phone", label:"Telefon", render:c=><span style={{ color:P.sub, fontSize:12 }}>{c.phone||"—"}</span> },
                    { key:"aiPaymentScore", label:"Ödeme Skoru", render:c=>{
                      if (c.aiPaymentScore == null) return <span style={{ color:P.muted, fontSize:12 }}>—</span>;
                      const sc = c.aiPaymentScore;
                      const col = sc >= 70 ? P.emerald : sc >= 40 ? P.amber : P.rose;
                      return <div style={{ display:"flex", alignItems:"center", gap:8 }}><div style={{ width:50, height:5, background:P.border, borderRadius:3, overflow:"hidden" }}><div style={{ width:`${sc}%`, height:"100%", background:col, borderRadius:3 }}/></div><span style={{ color:col, fontSize:12, fontWeight:700 }}>{sc}</span></div>;
                    }},
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
                    { key:"pdf", label:"", render:inv=>(
                      <button onClick={async()=>{
                        const token=localStorage.getItem("zyrix_token");
                        const res=await fetch(`${API}/api/invoices/${inv.id}/pdf`,{headers:{Authorization:`Bearer ${token}`}});
                        if(!res.ok){alert("PDF oluşturulamadı");return;}
                        const blob=await res.blob();
                        const url=URL.createObjectURL(blob);
                        const a=document.createElement("a");
                        a.href=url;a.download=`fatura-${inv.invoiceNumber||inv.id}.pdf`;a.click();
                        URL.revokeObjectURL(url);
                      }} style={{background:`${P.cyan}12`,border:`1px solid ${P.cyan}25`,color:P.cyan,borderRadius:8,padding:"3px 10px",cursor:"pointer",fontSize:11,fontWeight:700}}>
                        📄 PDF
                      </button>
                    )},
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

          {/* YENİ SAYFALAR */}
          {page === "efatura" && <EFaturaPage invoices={invoices} />}
          {page === "factoring" && <FactoringPage />}

          {/* ═══ v3 YENİ SAYFALAR ══════════════════════════════ */}
          {page === "stock"       && <StockPage />}
          {page === "installments"&& <InstallmentsPage invoices={invoices} />}
          {page === "checks"      && <ChecksPage />}
          {page === "personnel"   && <PersonnelPage />}
          {page === "kartvizit"   && <KartvizitPage user={user} />}
          {page === "recurring"   && <RecurringPage />}
          {page === "marketplace" && <MarketplacePage />}
          {page === "taxcalendar" && <TaxCalendarPage />}
          {page === "benchmark"   && <BenchmarkPage />}

          {/* ═══ v4 SAYFALAR ══════════════════════════════════ */}
          {page === "team"       && (() => { const TeamPage = React.lazy(() => import("./TeamPage")); return <React.Suspense fallback={<div style={{padding:40,textAlign:"center",color:"#94a3b8"}}>Yükleniyor...</div>}><TeamPage /></React.Suspense>; })()}
          {page === "campaigns"  && (() => { const CampaignsPage = React.lazy(() => import("./CampaignsPage")); return <React.Suspense fallback={<div style={{padding:40,textAlign:"center",color:"#94a3b8"}}>Yükleniyor...</div>}><CampaignsPage /></React.Suspense>; })()}

        </main>
      </div>
    </>
  );
}