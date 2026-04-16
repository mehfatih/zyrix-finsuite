"use client";
import { useLocale, useTranslations } from "next-intl";

const ICONS = ["📊","🔗","🧾"];
const CARDS = ["card1","card2","card3"] as const;

export function ProblemSection() {
  const t     = useTranslations("problem");
  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <section style={{ padding: "52px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", direction: isRTL ? "rtl" : "ltr" }}>
        <div style={{ marginBottom: 32 }}>
          <span style={{
            display:"inline-block", background:"#EFF6FF", color:"#1D4ED8",
            fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:100, marginBottom:10,
          }}>{t("tag")}</span>
          <h2 style={{ fontSize:"clamp(26px,3vw,34px)", fontWeight:900, color:"#111827", marginBottom:8, lineHeight:1.25 }}>
            {t("title")}
          </h2>
          <p style={{ fontSize:16, color:"#6B7280", maxWidth:540, lineHeight:1.65 }}>{t("subtitle")}</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }} className="grid-responsive">
          {CARDS.map((c,i) => (
            <div key={c} style={{
              padding:22, border:"1px solid #E5E7EB", borderRadius:12, background:"#fff",
              transition:"all .2s", cursor:"default",
            }}
            onMouseEnter={e=>(e.currentTarget.style.cssText+=";border-color:#2563EB;box-shadow:0 4px 16px rgba(37,99,235,.1);transform:translateY(-2px)")}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#E5E7EB";e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none"}}>
              <div style={{ fontSize:28, marginBottom:12 }}>{ICONS[i]}</div>
              <h3 style={{ fontSize:16, fontWeight:700, color:"#111827", marginBottom:8 }}>{t(`${c}_title` as "card1_title")}</h3>
              <p style={{ fontSize:14, color:"#6B7280", lineHeight:1.65, margin:0 }}>{t(`${c}_desc` as "card1_desc")}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:768px){.grid-responsive{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}