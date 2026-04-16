"use client";
import { useLocale, useTranslations } from "next-intl";
const ICONS = ["🇹🇷","🤖","💰","🔌","📋"];
export function WhyUsSection() {
  const t = useTranslations("why");
  const locale = useLocale();
  const isRTL = locale === "ar";
  return (
    <section style={{ padding:"52px 24px", background:"#fff" }}>
      <div style={{ maxWidth:1160, margin:"0 auto", direction: isRTL?"rtl":"ltr" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <span style={{ display:"inline-block", background:"#EFF6FF", color:"#1D4ED8", fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:100, marginBottom:10 }}>{t("tag")}</span>
          <h2 style={{ fontSize:"clamp(26px,3vw,34px)", fontWeight:900, color:"#111827", lineHeight:1.25 }}>{t("title")}</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:14 }} className="why-grid">
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{
              textAlign:"center", padding:"22px 14px", border:"1.5px solid #E5E7EB",
              borderRadius:12, background:"#fff", transition:"all .2s",
            }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#2563EB";e.currentTarget.style.background="#EFF6FF"}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#E5E7EB";e.currentTarget.style.background="#fff"}}>
              <div style={{ fontSize:32, marginBottom:10 }}>{ICONS[i-1]}</div>
              <div style={{ fontSize:14, fontWeight:700, color:"#111827", marginBottom:6 }}>{t(`i${i}_title` as "i1_title")}</div>
              <div style={{ fontSize:12, color:"#6B7280", lineHeight:1.55 }}>{t(`i${i}_desc` as "i1_desc")}</div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:900px){.why-grid{grid-template-columns:repeat(2,1fr)!important}}@media(max-width:480px){.why-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}