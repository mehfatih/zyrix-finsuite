"use client";
import { useLocale, useTranslations } from "next-intl";

const GOLD = "#B8892A";

const ITEMS = [
  { icon:"🇹🇷", name:"e-Fatura",      type:"GİB / Türkiye",   bg:"#EFF6FF", border:"#BFDBFE" },
  { icon:"🧮",  name:"KDV",           type:"%1 / %10 / %20",  bg:"#F0FDF4", border:"#BBF7D0" },
  { icon:"💳",  name:"iyzico",        type:"Ödeme",           bg:"#FFF7ED", border:"#FED7AA" },
  { icon:"💳",  name:"PayTR",         type:"Ödeme",           bg:"#EFF6FF", border:"#BFDBFE" },
  { icon:"💳",  name:"Param",         type:"Ödeme",           bg:"#FDF4FF", border:"#E9D5FF" },
  { icon:"⚡",  name:"Zapier",        type:"Otomasyon",       bg:"#FFF1F2", border:"#FECDD3" },
  { icon:"🔧",  name:"Make",          type:"Otomasyon",       bg:"#FFFBEB", border:"#FDE68A" },
  { icon:"🛒",  name:"Shopify",       type:"E-ticaret",       bg:"#F0FDF4", border:"#BBF7D0" },
  { icon:"💬",  name:"WhatsApp",      type:"İletişim",        bg:"#F0FDF4", border:"#A7F3D0" },
  { icon:"📊",  name:"Google Sheets", type:"Tablolar",        bg:"#EFF6FF", border:"#BFDBFE" },
];

export function IntegrationsSection() {
  const t      = useTranslations("integrations");
  const locale = useLocale();
  const isRTL  = locale === "ar";

  return (
    <section id="integrations" style={{ padding:"52px 24px", background:"#F8FAFC" }}>
      <div style={{ maxWidth:1160, margin:"0 auto", direction:isRTL?"rtl":"ltr" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <span style={{ display:"inline-block", background:"#EFF6FF", color:"#1D4ED8", fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:100, marginBottom:10 }}>{t("tag")}</span>
          <h2 style={{ fontSize:"clamp(26px,3vw,34px)", fontWeight:900, color:GOLD, lineHeight:1.25 }}>{t("title")}</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12 }} className="int-grid">
          {ITEMS.map(item=>(
            <div key={item.name} style={{ background:item.bg, border:`1.5px solid ${item.border}`, borderRadius:12, padding:"18px 14px", textAlign:"center", transition:"all .15s" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,.1)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
              <div style={{ fontSize:26, marginBottom:8 }}>{item.icon}</div>
              <div style={{ fontSize:13, fontWeight:700, color:"#0A0A0A", marginBottom:3 }}>{item.name}</div>
              <div style={{ fontSize:11, color:"#374151" }}>{item.type}</div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:860px){.int-grid{grid-template-columns:repeat(3,1fr)!important}}@media(max-width:480px){.int-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>
    </section>
  );
}