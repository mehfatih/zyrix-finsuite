"use client";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

const GOLD = "#B8892A";

const FEATS = [
  { icon:"📋", bg:"#EFF6FF", border:"#BFDBFE" },
  { icon:"📈", bg:"#F0FDF4", border:"#BBF7D0" },
  { icon:"⭐", bg:"#FFFBEB", border:"#FDE68A" },
  { icon:"🤖", bg:"#F5F3FF", border:"#DDD6FE" },
  { icon:"🧮", bg:"#FFF1F2", border:"#FECDD3" },
  { icon:"💰", bg:"#ECFDF5", border:"#A7F3D0" },
  { icon:"🔔", bg:"#FFF7ED", border:"#FED7AA" },
  { icon:"✅", bg:"#F0FDF4", border:"#BBF7D0" },
  { icon:"💎", bg:"#EFF6FF", border:"#BFDBFE" },
  { icon:"📣", bg:"#FDF4FF", border:"#E9D5FF" },
  { icon:"🎯", bg:"#FFF1F2", border:"#FECDD3" },
  { icon:"🏢", bg:"#F0F9FF", border:"#BAE6FD" },
  { icon:"🌐", bg:"#ECFDF5", border:"#A7F3D0" },
  { icon:"🔗", bg:"#FFFBEB", border:"#FDE68A" },
];

export function FeaturesSection() {
  const t      = useTranslations("features");
  const locale = useLocale();
  const isRTL  = locale === "ar";
  const [tab, setTab] = useState(0);
  const tabs = [t("tab_all"), t("tab_finance"), t("tab_crm"), t("tab_ai")];

  return (
    <section id="features" style={{ padding:"52px 24px", background:"#fff" }}>
      <div style={{ maxWidth:1160, margin:"0 auto", direction:isRTL?"rtl":"ltr" }}>
        <div style={{ marginBottom:28 }}>
          <span style={{ display:"inline-block", background:"#EFF6FF", color:"#1D4ED8", fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:100, marginBottom:10 }}>{t("tag")}</span>
          <h2 style={{ fontSize:"clamp(26px,3vw,34px)", fontWeight:900, color:GOLD, marginBottom:8, lineHeight:1.25 }}>{t("title")}</h2>
          <p style={{ fontSize:16, color:"#1A1A1A", lineHeight:1.65 }}>{t("subtitle")}</p>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:6, marginBottom:24, flexWrap:"wrap", borderBottom:"2px solid #F3F4F6", paddingBottom:0 }}>
          {tabs.map((tb,i)=>(
            <button key={i} onClick={()=>setTab(i)} style={{ padding:"9px 18px", border:"none", background:"transparent", cursor:"pointer", fontSize:14, fontWeight:600, fontFamily:"inherit", color:tab===i?"#2563EB":"#4B5563", borderBottom:tab===i?"3px solid #2563EB":"3px solid transparent", marginBottom:-2, transition:"all .15s" }}>{tb}</button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }} className="feat-grid">
          {FEATS.map((f,i)=>(
            <div key={i} style={{ background:f.bg, border:`1.5px solid ${f.border}`, borderRadius:12, padding:18, transition:"all .15s", cursor:"default" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.08)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
              <div style={{ fontSize:26, marginBottom:10 }}>{f.icon}</div>
              <div style={{ fontSize:14, fontWeight:700, color:"#0A0A0A", marginBottom:5 }}>{t(`f${i+1}_name` as "f1_name")}</div>
              <div style={{ fontSize:12, color:"#1A1A1A", lineHeight:1.55 }}>{t(`f${i+1}_desc` as "f1_desc")}</div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:900px){.feat-grid{grid-template-columns:repeat(2,1fr)!important}}@media(max-width:480px){.feat-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}