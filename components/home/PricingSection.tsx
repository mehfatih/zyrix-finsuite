"use client";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

const GOLD = "#B8892A";
const PLANS = [
  { key:"p1", price:{ m:19, y:15 }, highlight:false, featCount:6 },
  { key:"p2", price:{ m:45, y:36 }, highlight:true,  featCount:7 },
  { key:"p3", price:{ m:65, y:52 }, highlight:false, featCount:7 },
] as const;

export function PricingSection() {
  const t      = useTranslations("pricing");
  const locale = useLocale();
  const isRTL  = locale === "ar";
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" style={{ padding:"52px 24px", background:"#fff" }}>
      <div style={{ maxWidth:1160, margin:"0 auto", direction:isRTL?"rtl":"ltr" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <span style={{ display:"inline-block", background:"#EFF6FF", color:"#1D4ED8", fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:100, marginBottom:10 }}>{t("tag")}</span>
          <h2 style={{ fontSize:"clamp(26px,3vw,34px)", fontWeight:900, color:GOLD, marginBottom:8, lineHeight:1.25 }}>{t("title")}</h2>
          <p style={{ fontSize:16, color:"#1A1A1A", lineHeight:1.65 }}>{t("subtitle")}</p>

          {/* Toggle */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginTop:18, fontSize:14 }}>
            <span style={{ fontWeight:yearly?400:700, color:yearly?"#4B5563":"#0A0A0A" }}>{t("monthly")}</span>
            <button onClick={()=>setYearly(!yearly)} style={{ width:44, height:24, borderRadius:100, cursor:"pointer", background:yearly?"#2563EB":"#D1D5DB", border:"none", position:"relative", transition:"background .2s" }}>
              <span style={{ width:18, height:18, background:"#fff", borderRadius:"50%", position:"absolute", top:3, [isRTL?"right":"left"]:yearly?23:3, transition:"all .2s", boxShadow:"0 1px 3px rgba(0,0,0,.2)" }} />
            </button>
            <span style={{ fontWeight:yearly?700:400, color:yearly?"#0A0A0A":"#4B5563" }}>{t("yearly")}</span>
            <span style={{ background:"#EFF6FF", color:"#1D4ED8", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:100 }}>{t("save")}</span>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, alignItems:"start" }} className="price-grid">
          {PLANS.map(plan=>(
            <div key={plan.key} style={{ borderRadius:14, padding:26, position:"relative", border:plan.highlight?"2px solid #2563EB":"1.5px solid #E5E7EB", background:plan.highlight?"#0F172A":"#fff", transition:"transform .2s" }}
              onMouseEnter={e=>{ if(!plan.highlight) e.currentTarget.style.transform="translateY(-2px)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="none"; }}>

              {plan.highlight && (
                <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:"#2563EB", color:"#fff", fontSize:11, fontWeight:700, padding:"4px 14px", borderRadius:100, whiteSpace:"nowrap" }}>{t("popular")}</div>
              )}

              <div style={{ fontSize:17, fontWeight:800, color:plan.highlight?"#fff":"#0A0A0A", marginBottom:4 }}>{t(`${plan.key}_name` as "p1_name")}</div>
              <div style={{ fontSize:13, color:plan.highlight?"#94A3B8":"#4B5563", marginBottom:16 }}>{t(`${plan.key}_tag` as "p1_tag")}</div>

              <div style={{ fontSize:42, fontWeight:900, lineHeight:1, color:plan.highlight?"#C9A84C":GOLD, marginBottom:16, fontFamily:"'Nunito Sans',sans-serif" }}>
                <sup style={{ fontSize:20, verticalAlign:"top", marginTop:8, display:"inline-block" }}>$</sup>
                {yearly?plan.price.y:plan.price.m}
                <span style={{ fontSize:14, fontWeight:400, color:plan.highlight?"#94A3B8":"#4B5563" }}>{t("per_month")}</span>
              </div>

              <Link href={`/${locale}/signup`} style={{ display:"block", textAlign:"center", padding:"11px", borderRadius:9, fontSize:14, fontWeight:700, textDecoration:"none", marginBottom:18, transition:"all .15s",
                ...(plan.highlight
                  ? { background:"#2563EB", color:"#fff" }
                  : plan.key==="p3"
                  ? { background:"#2563EB", color:"#fff" }
                  : { background:"#F9FAFB", color:"#0A0A0A", border:"1px solid #E5E7EB" }) }}>
                {t("cta_free")}
              </Link>

              <ul style={{ listStyle:"none", margin:0, padding:0 }}>
                {Array.from({length:plan.featCount},(_,i)=>(
                  <li key={i} style={{ fontSize:13, padding:"7px 0", display:"flex", gap:7, alignItems:"center", color:plan.highlight?"#F1F5F9":"#0A0A0A", borderTop:`1px solid ${plan.highlight?"#1E293B":"#F3F4F6"}` }}>
                    <span style={{ color:"#059669", fontWeight:700, flexShrink:0 }}>✓</span>
                    {t(`${plan.key}_f${i+1}` as "p1_f1")}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:768px){.price-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}