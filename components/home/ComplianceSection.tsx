"use client";
import { useLocale, useTranslations } from "next-intl";

const GOLD = "#B8892A";

export function ComplianceSection() {
  const t      = useTranslations("compliance");
  const locale = useLocale();
  const isRTL  = locale === "ar";
  const feats  = ["tr_f1","tr_f2","tr_f3","tr_f4","tr_f5"] as const;

  return (
    <section style={{ padding:"52px 24px", background:"#F8FAFC" }}>
      <div style={{ maxWidth:1160, margin:"0 auto", direction:isRTL?"rtl":"ltr" }}>
        <div style={{ marginBottom:32 }}>
          <span style={{ display:"inline-block", background:"#EFF6FF", color:"#1D4ED8", fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:100, marginBottom:10 }}>{t("tag")}</span>
          <h2 style={{ fontSize:"clamp(26px,3vw,34px)", fontWeight:900, color:GOLD, marginBottom:8, lineHeight:1.25 }}>{t("title")}</h2>
          <p style={{ fontSize:16, color:"#1A1A1A", maxWidth:540, lineHeight:1.65 }}>{t("subtitle")}</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }} className="comp-grid">

          {/* Left — e-Fatura card */}
          <div style={{ background:"#fff", borderRadius:16, padding:28, borderLeft:"4px solid #2563EB", boxShadow:"0 2px 20px rgba(0,0,0,.07)" }}>
            {/* Header visual instead of TR text */}
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18, padding:"14px 16px", background:"linear-gradient(135deg,#1E3A8A,#2563EB)", borderRadius:12 }}>
              <div style={{ fontSize:32 }}>🧾</div>
              <div>
                <div style={{ fontSize:15, fontWeight:800, color:"#fff" }}>{t("tr_title")}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,.75)" }}>{t("tr_sub")}</div>
              </div>
              <span style={{ marginLeft:"auto", background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.3)", borderRadius:6, padding:"4px 10px", fontSize:11, fontWeight:700, color:"#fff", whiteSpace:"nowrap" }}>
                ✓ {t("tr_badge")}
              </span>
            </div>

            <ul style={{ listStyle:"none", margin:0, padding:0 }}>
              {feats.map(f=>(
                <li key={f} style={{ fontSize:14, color:"#111827", padding:"8px 0", display:"flex", gap:10, alignItems:"center", borderBottom:"1px solid #F3F4F6" }}>
                  <span style={{ width:22, height:22, background:"#EFF6FF", border:"1px solid #BFDBFE", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", color:"#2563EB", fontSize:11, fontWeight:700, flexShrink:0 }}>✓</span>
                  {t(f)}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — Stats + Process steps */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* Stats row */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[
                { icon:"⚡", val:locale==="tr"?"Anında":"Instant",          lbl:locale==="tr"?"Fatura Oluşturma":locale==="ar"?"إنشاء فوري":"Invoice Creation", bg:"#EFF6FF", border:"#BFDBFE" },
                { icon:"🏛️", val:"GİB",                                     lbl:locale==="tr"?"Onaylı Entegrasyon":locale==="ar"?"تكامل معتمد":"Approved Integration", bg:"#F0FDF4", border:"#BBF7D0" },
                { icon:"📊", val:"%100",                                     lbl:locale==="tr"?"KDV Uyumluluğu":locale==="ar"?"توافق KDV":"VAT Compliance", bg:"#FFFBEB", border:"#FDE68A" },
                { icon:"🔒", val:"UBL-TR",                                   lbl:locale==="tr"?"Standart Format":locale==="ar"?"تنسيق موحد":"Standard Format", bg:"#F5F3FF", border:"#DDD6FE" },
              ].map(s=>(
                <div key={s.val} style={{ background:s.bg, border:`1.5px solid ${s.border}`, borderRadius:12, padding:"16px 14px", textAlign:"center" }}>
                  <div style={{ fontSize:24, marginBottom:6 }}>{s.icon}</div>
                  <div style={{ fontSize:18, fontWeight:900, color:"#0A0A0A", marginBottom:3 }}>{s.val}</div>
                  <div style={{ fontSize:11, color:"#374151", fontWeight:600 }}>{s.lbl}</div>
                </div>
              ))}
            </div>

            {/* Process steps */}
            <div style={{ background:"#fff", borderRadius:14, padding:20, border:"1px solid #E5E7EB" }}>
              <h4 style={{ fontSize:13, fontWeight:700, color:GOLD, marginBottom:14, textTransform:"uppercase", letterSpacing:".5px" }}>
                {locale==="tr"?"Nasıl Çalışır?":locale==="ar"?"كيف يعمل؟":"How It Works"}
              </h4>
              {[
                { step:"1", txt: locale==="tr"?"Fatura oluşturun — Zyrix otomatik formatlar":locale==="ar"?"أنشئ الفاتورة — Zyrix يُنسّق تلقائياً":"Create invoice — Zyrix auto-formats" },
                { step:"2", txt: locale==="tr"?"Özel Entegratör aracılığıyla GİB'e gönderilir":locale==="ar"?"ترسل عبر المُدمج الخاص إلى GİB":"Sent to GİB via Private Integrator" },
                { step:"3", txt: locale==="tr"?"Onay alınır ve e-Arşiv'e kaydedilir":locale==="ar"?"يُعتمد ويُحفظ في e-Arşiv":"Approved & stored in e-Archive" },
              ].map(s=>(
                <div key={s.step} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:10 }}>
                  <div style={{ width:24, height:24, background:"#2563EB", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#fff", flexShrink:0 }}>{s.step}</div>
                  <p style={{ fontSize:13, color:"#374151", margin:0, lineHeight:1.6, paddingTop:3 }}>{s.txt}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`@media(max-width:768px){.comp-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}