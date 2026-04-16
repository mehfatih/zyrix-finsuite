"use client";
import { useLocale, useTranslations } from "next-intl";

const GOLD = "#B8892A";

const SECTORS = [
  { icon:"🍽️", bg:"#FFF1F2", border:"#FECDD3" },
  { icon:"🛍️", bg:"#EFF6FF", border:"#BFDBFE" },
  { icon:"🔧", bg:"#FFFBEB", border:"#FDE68A" },
  { icon:"🏗️", bg:"#F0FDF4", border:"#BBF7D0" },
  { icon:"🏭", bg:"#F5F3FF", border:"#DDD6FE" },
  { icon:"💼", bg:"#F0F9FF", border:"#BAE6FD" },
];

export function SectorsSection() {
  const t      = useTranslations("sectors");
  const locale = useLocale();
  const isRTL  = locale === "ar";

  return (
    <section style={{ padding:"52px 24px", background:"#fff" }}>
      <div style={{ maxWidth:1160, margin:"0 auto", direction:isRTL?"rtl":"ltr" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <span style={{ display:"inline-block", background:"#EFF6FF", color:"#1D4ED8", fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:100, marginBottom:10 }}>{t("tag")}</span>
          <h2 style={{ fontSize:"clamp(26px,3vw,34px)", fontWeight:900, color:GOLD, lineHeight:1.25 }}>{t("title")}</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:12 }} className="sector-grid">
          {([1,2,3,4,5,6] as const).map((n,i)=>(
            <div key={n} style={{ padding:"22px 10px", textAlign:"center", border:`1.5px solid ${SECTORS[i].border}`, background:SECTORS[i].bg, borderRadius:14, cursor:"pointer", transition:"all .2s" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,.1)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
              <div style={{ fontSize:32, marginBottom:10 }}>{SECTORS[i].icon}</div>
              <div style={{ fontSize:13, fontWeight:700, color:"#0A0A0A" }}>{t(`s${n}` as "s1")}</div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:860px){.sector-grid{grid-template-columns:repeat(3,1fr)!important}}@media(max-width:480px){.sector-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>
    </section>
  );
}