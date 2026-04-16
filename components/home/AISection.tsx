"use client";
import { useLocale, useTranslations } from "next-intl";

const AI_FEATS = [
  { icon:"💬", key:"f1", bg:"#EFF6FF", border:"#BFDBFE", iconBg:"#2563EB" },
  { icon:"📊", key:"f2", bg:"#F0FDF4", border:"#BBF7D0", iconBg:"#059669" },
  { icon:"🚨", key:"f3", bg:"#FFF1F2", border:"#FECDD3", iconBg:"#DC2626" },
  { icon:"📱", key:"f4", bg:"#FFFBEB", border:"#FDE68A", iconBg:"#D97706" },
] as const;

export function AISection() {
  const t      = useTranslations("ai");
  const locale = useLocale();
  const isRTL  = locale === "ar";

  return (
    <section id="ai" style={{ padding:"52px 24px", background:"#0F172A", overflow:"hidden", position:"relative" }}>
      <div aria-hidden style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse 50% 60% at 80% 30%, rgba(37,99,235,.1) 0%, transparent 60%)" }} />
      <div style={{ maxWidth:1160, margin:"0 auto", position:"relative", display:"grid", gridTemplateColumns:"1fr 1fr", gap:44, alignItems:"center", direction:isRTL?"rtl":"ltr" }} className="ai-grid">

        {/* Left */}
        <div>
          <span style={{ display:"inline-block", background:"rgba(37,99,235,.15)", color:"#93C5FD", fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:100, marginBottom:10 }}>{t("tag")}</span>
          <h2 style={{ fontSize:"clamp(26px,3vw,34px)", fontWeight:900, color:"#C9A84C", marginBottom:10, lineHeight:1.25 }}>{t("title")}</h2>
          <p style={{ fontSize:16, color:"rgba(255,255,255,.8)", lineHeight:1.65, marginBottom:24, maxWidth:460 }}>{t("subtitle")}</p>

          {/* Feature cards — light colored on dark bg */}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {AI_FEATS.map(f=>(
              <div key={f.key} style={{ display:"flex", gap:12, padding:"14px 16px", background:f.bg, border:`1.5px solid ${f.border}`, borderRadius:12, alignItems:"flex-start", transition:"all .15s" }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateX(4px)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";}}>
                <div style={{ width:36, height:36, background:f.iconBg, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:"#0A0A0A", marginBottom:3 }}>{t(`${f.key}_title` as "f1_title")}</div>
                  <div style={{ fontSize:13, color:"#374151", lineHeight:1.5 }}>{t(`${f.key}_desc` as "f1_desc")}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Chat mockup with light background */}
        <div style={{ background:"#F8FAFC", borderRadius:16, border:"1px solid #E2E8F0", overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,.3)" }}>
          {/* Chat header */}
          <div style={{ background:"#2563EB", padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, background:"rgba(255,255,255,.2)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>🤖</div>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{t("chat_name")}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,.8)", display:"flex", alignItems:"center", gap:4 }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:"#4ADE80", display:"inline-block" }} />
                {t("chat_status")}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ padding:"16px 14px", display:"flex", flexDirection:"column", gap:10, background:"#F8FAFC" }}>
            {/* User message */}
            <div style={{ alignSelf:isRTL?"flex-end":"flex-start" }}>
              <div style={{ padding:"10px 14px", background:"#2563EB", color:"#fff", borderRadius:"16px 16px 4px 16px", fontSize:13, lineHeight:1.55, maxWidth:"85%", fontWeight:500 }}>
                {t("chat_q1")}
              </div>
            </div>
            {/* AI reply */}
            <div style={{ alignSelf:isRTL?"flex-start":"flex-end" }}>
              <div style={{ padding:"10px 14px", background:"#fff", color:"#1A1A1A", border:"1px solid #E2E8F0", borderRadius:"16px 16px 16px 4px", fontSize:13, lineHeight:1.6, maxWidth:"90%", boxShadow:"0 2px 8px rgba(0,0,0,.06)" }}>
                <strong style={{ color:"#2563EB", fontSize:12, display:"block", marginBottom:3 }}>{t("chat_a1_title")}</strong>
                {t("chat_a1")}
              </div>
            </div>
            {/* User */}
            <div style={{ alignSelf:isRTL?"flex-end":"flex-start" }}>
              <div style={{ padding:"10px 14px", background:"#2563EB", color:"#fff", borderRadius:"16px 16px 4px 16px", fontSize:13, lineHeight:1.55, maxWidth:"85%", fontWeight:500 }}>
                {t("chat_q2")}
              </div>
            </div>
            {/* AI */}
            <div style={{ alignSelf:isRTL?"flex-start":"flex-end" }}>
              <div style={{ padding:"10px 14px", background:"#fff", color:"#1A1A1A", border:"1px solid #E2E8F0", borderRadius:"16px 16px 16px 4px", fontSize:13, lineHeight:1.6, maxWidth:"90%", boxShadow:"0 2px 8px rgba(0,0,0,.06)" }}>
                <strong style={{ color:"#059669", fontSize:12, display:"block", marginBottom:3 }}>{t("chat_a2_title")}</strong>
                {t("chat_a2")}
              </div>
            </div>
            {/* Typing */}
            <div style={{ alignSelf:isRTL?"flex-start":"flex-end" }}>
              <div style={{ display:"flex", gap:4, padding:"10px 14px", background:"#fff", border:"1px solid #E2E8F0", borderRadius:12, width:"fit-content", boxShadow:"0 2px 8px rgba(0,0,0,.06)" }}>
                {[0,150,300].map(d=>(
                  <span key={d} style={{ width:6, height:6, background:"#94A3B8", borderRadius:"50%", display:"block", animation:`bounce .8s ${d}ms infinite` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:.5}40%{transform:translateY(-4px);opacity:1}}
        @media(max-width:860px){.ai-grid{grid-template-columns:1fr!important}}
      `}</style>
    </section>
  );
}