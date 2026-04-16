"use client";
import { useLocale, useTranslations } from "next-intl";

const GOLD = "#B8892A";

const SOLS = [
  { key:"card1", icon:"💼", bg:"#EFF6FF", border:"#BFDBFE", iconBg:"#DBEAFE" },
  { key:"card2", icon:"👥", bg:"#F0FDF4", border:"#BBF7D0", iconBg:"#DCFCE7" },
  { key:"card3", icon:"🤖", bg:"#FFFBEB", border:"#FDE68A", iconBg:"#FEF3C7" },
] as const;

export function SolutionSection() {
  const t      = useTranslations("solution");
  const locale = useLocale();
  const isRTL  = locale === "ar";

  return (
    <section style={{ padding:"52px 24px", background:"#F8FAFC" }}>
      <div style={{ maxWidth:1160, margin:"0 auto", direction:isRTL?"rtl":"ltr" }}>
        <div style={{ marginBottom:32 }}>
          <span style={{ display:"inline-block", background:"#EFF6FF", color:"#1D4ED8", fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:100, marginBottom:10 }}>{t("tag")}</span>
          <h2 style={{ fontSize:"clamp(26px,3vw,34px)", fontWeight:900, color:GOLD, marginBottom:8, lineHeight:1.25 }}>{t("title")}</h2>
          <p style={{ fontSize:16, color:"#1A1A1A", maxWidth:540, lineHeight:1.65 }}>{t("subtitle")}</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18 }} className="sol-grid">
          {SOLS.map(s => (
            <div key={s.key} style={{ background:s.bg, borderRadius:14, padding:26, border:`1.5px solid ${s.border}`, transition:"all .2s" }}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 28px rgba(0,0,0,.09)";e.currentTarget.style.transform="translateY(-3px)";}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none";}}>
              <div style={{ width:46, height:46, borderRadius:12, background:s.iconBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:14 }}>{s.icon}</div>
              <h3 style={{ fontSize:18, fontWeight:800, color:"#0A0A0A", marginBottom:8 }}>{t(`${s.key}_title` as "card1_title")}</h3>
              <p style={{ fontSize:14, color:"#1A1A1A", lineHeight:1.65, marginBottom:14 }}>{t(`${s.key}_desc` as "card1_desc")}</p>
              <ul style={{ listStyle:"none", margin:0, padding:0 }}>
                {([1,2,3,4] as const).map(i=>(
                  <li key={i} style={{ fontSize:13, color:"#111827", padding:"4px 0", display:"flex", alignItems:"center", gap:7 }}>
                    <span style={{ color:"#059669", fontWeight:700 }}>✓</span>
                    {t(`${s.key}_f${i}` as "card1_f1")}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:768px){.sol-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}