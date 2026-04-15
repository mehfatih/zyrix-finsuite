"use client";
import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://zyrix-backend-production.up.railway.app";
const font = "'DM Sans','Outfit',system-ui,sans-serif";
const C = {
  primary: "#D4820A", bg: "#FDF3E3", bgAlt: "#FFF8F0", bgCard: "#fff",
  border: "#F5D5A0", text: "#1A0E00", textMid: "#4A3010", textLight: "#7A5828",
  success: "#059669", successBg: "#ECFDF5",
  danger: "#DC2626", dangerBg: "#FEF2F2",
  warning: "#D97706", blue: "#2563EB", purple: "#6D28D9",
  ai: "#7C3AED", aiBg: "#F3EEFF",
};

interface Message {
  id: string; role: "user"|"ai"; text: string; time: string;
  chart?: { type: string; data: number[]; labels: string[] };
}

const SUGGESTIONS = [
  "ما هو توقع التدفق النقدي للربع القادم؟",
  "What is my VAT liability for this month?",
  "Gelecek ay nakit akışım nasıl görünüyor?",
  "أين أكبر مصادر الإنفاق هذا الشهر؟",
  "Which invoices are at risk of being late?",
  "Show me revenue breakdown by country",
];

const DEMO_MESSAGES: Message[] = [
  {
    id:"1", role:"ai",
    text:"مرحباً! أنا مستشارك المالي الذكي. يمكنني تحليل بياناتك المالية، توقع التدفق النقدي، حساب الضرائب، ومساعدتك في اتخاذ قرارات مدعومة بالبيانات. كيف يمكنني مساعدتك اليوم؟",
    time:"09:00",
  },
];

const KPI_DATA = [
  { label:"Revenue MTD", value:"﷼284,600", delta:"+18%", up:true, color:C.success, icon:"📈" },
  { label:"Expenses MTD", value:"﷼94,200", delta:"+5%", up:false, color:C.danger, icon:"📉" },
  { label:"Net Profit", value:"﷼190,400", delta:"+28%", up:true, color:C.primary, icon:"💰" },
  { label:"Cash Runway", value:"14 months", delta:"Stable", up:true, color:C.blue, icon:"⏳" },
  { label:"VAT Due", value:"﷼18,400", delta:"Apr 30", up:false, color:C.warning, icon:"🧾" },
  { label:"Outstanding", value:"﷼42,800", delta:"6 invoices", up:false, color:C.purple, icon:"📄" },
];

const INSIGHTS = [
  { icon:"⚠️", color:C.danger, bg:C.dangerBg, title:"VAT Filing Overdue", desc:"Turkey KDV declaration for March 2026 is 20 days overdue. Potential penalty: ₺4,280.", action:"File Now" },
  { icon:"📈", color:C.success, bg:C.successBg, title:"Revenue Trending Up", desc:"Revenue grew 23% YoY. April on track to be the best month of 2026 if current pace holds.", action:"View Report" },
  { icon:"💡", color:C.primary, bg:"#FFF7E6", title:"Cash Flow Opportunity", desc:"3 large invoices totaling SAR 84,000 are due next week. Follow up to accelerate collection.", action:"View Invoices" },
  { icon:"🔮", color:C.blue, bg:"#EFF6FF", title:"Q2 Forecast", desc:"Based on current trends, Q2 revenue is projected at SAR 920,000 — up 31% from Q1.", action:"Full Forecast" },
];

export default function AICFOPage() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const dir = locale === "ar" ? "rtl" : "ltr";
  function L(en: string, ar: string, tr: string) { return locale==="ar"?ar:locale==="tr"?tr:en; }

  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"chat"|"insights"|"forecast">("chat");
  const msgEnd = useRef<HTMLDivElement>(null);

  useEffect(() => { msgEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const AI_RESPONSES: Record<string, string> = {
    "cash flow": "Based on your current data: Expected inflows next 30 days: SAR 284,600. Expected outflows: SAR 94,200. Net cash flow: +SAR 190,400. Your runway is approximately 14 months at current burn rate. 3 invoices worth SAR 84,000 are due next week — I recommend following up today.",
    "vat": "Your VAT position this month:\n• Saudi Arabia (15%): SAR 18,400 due April 30\n• Turkey KDV (20%): ₺42,800 — OVERDUE since March 26\n• UAE (5%): AED 3,400 due May 5\n\nImmediate action needed on Turkey KDV to avoid penalties.",
    "revenue": "Revenue breakdown by country this month:\n• 🇸🇦 Saudi Arabia: SAR 128,400 (45%)\n• 🇹🇷 Turkey: TRY 340,000 (28%)\n• 🇦🇪 UAE: AED 62,000 (18%)\n• 🇰🇼 Kuwait + Others: 9%\n\nSaudi Arabia remains your top market with strong growth momentum.",
    "invoice": "You have 6 outstanding invoices totaling SAR 42,800:\n• 2 invoices overdue (SAR 12,400)\n• 3 invoices due this week (SAR 24,800)\n• 1 invoice due next month (SAR 5,600)\n\nRecommendation: Send automated reminders for the 3 upcoming invoices today.",
    "forecast": "Q2 2026 Forecast (AI-Powered):\n• Revenue: SAR 920,000 (+31% vs Q1)\n• Expenses: SAR 310,000 (+8% vs Q1)\n• Net Profit: SAR 610,000 (+48% vs Q1)\n\nKey assumptions: Current client pipeline conversion at 62%, no major market disruptions, VAT compliance maintained.",
    "default": "I've analyzed your financial data. Based on current trends, your business is performing well with 23% YoY revenue growth. Would you like me to deep-dive into a specific area? Try asking about: cash flow forecast, VAT position, revenue breakdown, outstanding invoices, or Q2 forecast.",
  };

  const send = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    const userMsg: Message = { id:Date.now().toString(), role:"user", text:msg, time:new Date().toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"}) };
    setMessages(p=>[...p, userMsg]);
    setLoading(true);
    await new Promise(r=>setTimeout(r, 1200));
    const key = Object.keys(AI_RESPONSES).find(k => msg.toLowerCase().includes(k)) || "default";
    const aiMsg: Message = { id:(Date.now()+1).toString(), role:"ai", text:AI_RESPONSES[key], time:new Date().toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"}) };
    setMessages(p=>[...p, aiMsg]);
    setLoading(false);
  };

  // Simple SVG bar chart
  const MiniChart = ({ data, color }: { data: number[]; color: string }) => {
    const max = Math.max(...data, 1);
    const W = 280, H = 80;
    const bw = Math.floor((W-20)/data.length)-4;
    return (
      <svg viewBox={`0 0 ${W} ${H+16}`} style={{ width:"100%", height:96 }}>
        {data.map((v,i) => {
          const bh = (v/max)*H;
          const x = 10 + i*(bw+4);
          return <rect key={i} x={x} y={H-bh} width={bw} height={bh} rx="3" fill={color} opacity="0.8" />;
        })}
      </svg>
    );
  };

  return (
    <div style={{ fontFamily:font, backgroundColor:C.bg, minHeight:"100vh" }} dir={dir}>
      <header style={{ backgroundColor:C.bgCard, borderBottom:`1.5px solid ${C.border}`, padding:"0 28px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <a href={`/${locale}/dashboard`} style={{ fontSize:13, color:C.primary, fontWeight:700, textDecoration:"none" }}>← {L("Dashboard","اللوحة","Panel")}</a>
          <span style={{ color:C.border }}>/</span>
          <span style={{ fontSize:14, fontWeight:800, color:C.text }}>🤖 {L("AI CFO","المستشار المالي الذكي","Yapay Zeka CFO")}</span>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {(["chat","insights","forecast"] as const).map((t,i) => (
            <button key={i} onClick={()=>setTab(t)} style={{ padding:"7px 16px", borderRadius:9, border:"none", cursor:"pointer", fontFamily:font, fontSize:12, fontWeight:700, backgroundColor:tab===t?C.ai:"transparent", color:tab===t?"#fff":C.textLight }}>
              {t==="chat"?L("AI Chat","محادثة ذكية","AI Sohbet"):t==="insights"?L("Insights","رؤى","Öngörüler"):L("Forecast","توقعات","Tahmin")}
            </button>
          ))}
        </div>
      </header>

      {tab === "chat" && (
        <div style={{ display:"flex", height:"calc(100vh - 60px)" }}>
          {/* KPI sidebar */}
          <div style={{ width:260, backgroundColor:C.bgCard, borderRight:`1.5px solid ${C.border}`, padding:18, overflowY:"auto", flexShrink:0 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.textLight, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:12 }}>{L("Live KPIs","مؤشرات حية","Canlı KPI")}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {KPI_DATA.map((k,i) => (
                <div key={i} style={{ backgroundColor:C.bgAlt, borderRadius:12, padding:"12px 14px", border:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:18, marginBottom:6 }}>{k.icon}</div>
                  <div style={{ fontSize:16, fontWeight:900, color:k.color, fontFamily:"monospace" }}>{k.value}</div>
                  <div style={{ fontSize:10, color:C.textLight, marginTop:2, fontWeight:600 }}>{k.label}</div>
                  <div style={{ fontSize:10, fontWeight:700, color:k.up?C.success:C.danger, marginTop:4 }}>
                    {k.up?"↑":"↓"} {k.delta}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
            {/* Messages */}
            <div style={{ flex:1, overflowY:"auto", padding:"24px 28px", display:"flex", flexDirection:"column", gap:16 }}>
              {messages.map((m,i) => (
                <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", gap:10 }}>
                  {m.role==="ai" && (
                    <div style={{ width:36, height:36, borderRadius:"50%", backgroundColor:C.aiBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0, alignSelf:"flex-end" }}>🤖</div>
                  )}
                  <div style={{ maxWidth:"72%", padding:"14px 18px", borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px", backgroundColor:m.role==="user"?C.primary:C.bgCard, border:`1.5px solid ${m.role==="user"?"transparent":C.border}`, color:m.role==="user"?"#fff":C.text }}>
                    <div style={{ fontSize:13, lineHeight:1.6, whiteSpace:"pre-line" }}>{m.text}</div>
                    <div style={{ fontSize:10, marginTop:6, opacity:0.7, textAlign:"right" }}>{m.time}</div>
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display:"flex", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:"50%", backgroundColor:C.aiBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🤖</div>
                  <div style={{ padding:"14px 18px", borderRadius:"18px 18px 18px 4px", backgroundColor:C.bgCard, border:`1.5px solid ${C.border}` }}>
                    <div style={{ display:"flex", gap:5 }}>
                      {[0,1,2].map(j => <div key={j} style={{ width:8, height:8, borderRadius:"50%", backgroundColor:C.primary, animation:"bounce 1s infinite", animationDelay:`${j*0.2}s` }} />)}
                    </div>
                    <style>{`@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>
                  </div>
                </div>
              )}
              <div ref={msgEnd} />
            </div>

            {/* Suggestions */}
            <div style={{ padding:"12px 28px 0", display:"flex", gap:8, flexWrap:"wrap" }}>
              {SUGGESTIONS.slice(0,3).map((s,i) => (
                <button key={i} onClick={()=>send(s)} style={{ padding:"6px 12px", borderRadius:20, border:`1.5px solid ${C.border}`, backgroundColor:C.bgCard, fontFamily:font, fontSize:11, fontWeight:600, color:C.textMid, cursor:"pointer" }}>
                  {s.length > 40 ? s.slice(0,40)+"…" : s}
                </button>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding:"14px 28px 20px", display:"flex", gap:10, alignItems:"center" }}>
              <input
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
                placeholder={L("Ask your AI CFO anything...","اسأل مستشارك المالي...","Yapay Zeka CFO'nize sorun...")}
                style={{ flex:1, padding:"13px 18px", borderRadius:14, border:`1.5px solid ${C.border}`, fontFamily:font, fontSize:14, color:C.text, outline:"none", backgroundColor:C.bgCard }}
              />
              <button onClick={()=>send()} disabled={loading||!input.trim()} style={{ width:46, height:46, borderRadius:"50%", border:"none", backgroundColor:input.trim()&&!loading?C.primary:"#E2E8F0", color:input.trim()&&!loading?"#fff":"#94A3B8", cursor:"pointer", fontSize:20, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>➤</button>
            </div>
          </div>
        </div>
      )}

      {tab === "insights" && (
        <div style={{ maxWidth:900, margin:"32px auto", padding:"0 20px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(400px,1fr))", gap:16 }}>
            {INSIGHTS.map((ins,i) => (
              <div key={i} style={{ backgroundColor:C.bgCard, border:`1.5px solid ${C.border}`, borderRadius:16, padding:24 }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:14 }}>
                  <div style={{ width:44, height:44, borderRadius:12, backgroundColor:ins.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{ins.icon}</div>
                  <div>
                    <div style={{ fontSize:15, fontWeight:800, color:C.text }}>{ins.title}</div>
                    <div style={{ fontSize:13, color:C.textLight, marginTop:4, lineHeight:1.5 }}>{ins.desc}</div>
                  </div>
                </div>
                <button style={{ padding:"8px 18px", borderRadius:10, border:"none", backgroundColor:ins.color, color:"#fff", fontFamily:font, fontSize:12, fontWeight:700, cursor:"pointer" }}>
                  {ins.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "forecast" && (
        <div style={{ maxWidth:1000, margin:"32px auto", padding:"0 20px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
            {[
              { title:L("Revenue Forecast","توقع الإيرادات","Gelir Tahmini"), data:[180,210,240,195,280,310,290,320,350,340,380,420], color:C.success, label:"Monthly (SAR K)" },
              { title:L("Expense Forecast","توقع المصاريف","Gider Tahmini"), data:[80,90,85,88,95,100,98,105,110,108,112,120], color:C.danger, label:"Monthly (SAR K)" },
            ].map((chart,i) => (
              <div key={i} style={{ backgroundColor:C.bgCard, border:`1.5px solid ${C.border}`, borderRadius:16, padding:24 }}>
                <div style={{ fontWeight:800, fontSize:15, color:C.text, marginBottom:4 }}>{chart.title}</div>
                <div style={{ fontSize:11, color:C.textLight, marginBottom:12 }}>{chart.label}</div>
                <MiniChart data={chart.data} color={chart.color} />
              </div>
            ))}
          </div>
          <div style={{ backgroundColor:C.bgCard, border:`1.5px solid ${C.border}`, borderRadius:16, padding:28 }}>
            <div style={{ fontWeight:800, fontSize:16, color:C.text, marginBottom:20 }}>🔮 {L("Q2 2026 AI Forecast","توقعات الذكاء الاصطناعي Q2 2026","Q2 2026 AI Tahmini")}</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:14 }}>
              {[
                { label:"Q2 Revenue", value:"SAR 920K", delta:"+31%", color:C.success },
                { label:"Q2 Expenses", value:"SAR 310K", delta:"+8%", color:C.danger },
                { label:"Q2 Net Profit", value:"SAR 610K", delta:"+48%", color:C.primary },
                { label:"Confidence", value:"87%", delta:"High", color:C.blue },
              ].map((k,i) => (
                <div key={i} style={{ backgroundColor:C.bgAlt, borderRadius:12, padding:"18px 20px", border:`1px solid ${C.border}`, borderTop:`4px solid ${k.color}` }}>
                  <div style={{ fontSize:22, fontWeight:900, color:k.color, fontFamily:"monospace" }}>{k.value}</div>
                  <div style={{ fontSize:12, color:C.textLight, marginTop:4, fontWeight:600 }}>{k.label}</div>
                  <div style={{ fontSize:11, fontWeight:700, color:k.color, marginTop:6 }}>{k.delta}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}