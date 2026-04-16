"use client";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

const CARDS = [
  { id:"saving", color:"#059669", bg:"#ECFDF5", border:"#6EE7B7", darkBg:"#064E3B" }, /* Yeşil */
  { id:"roi",    color:"#DC2626", bg:"#FEF2F2", border:"#FCA5A5", darkBg:"#7F1D1D" }, /* Kırmızı */
  { id:"hours",  color:"#D97706", bg:"#FFFBEB", border:"#FCD34D", darkBg:"#78350F" }, /* Turuncu */
  { id:"be",     color:"#7C3AED", bg:"#F5F3FF", border:"#C4B5FD", darkBg:"#4C1D95" }, /* Mor */
];

export function ROICalculator() {
  const t      = useTranslations("roi");
  const locale = useLocale();
  const isRTL  = locale === "ar";

  const [employees, setEmployees] = useState(10);
  const [revenue,   setRevenue]   = useState(20000);
  const [active,    setActive]    = useState(0);

  const saving  = Math.round(employees * 12 + revenue * 0.015);
  const roi     = Math.round((saving / 45) * 100);
  const hours   = Math.round(employees * 2.5);
  const beDays  = Math.max(1, Math.round(45 / (saving / 30)));

  const results = [
    { label: t("monthly_saving"), value: `$${saving.toLocaleString()}`, raw: saving  },
    { label: t("roi_label"),       value: `${roi}%`,                    raw: roi     },
    { label: t("hours"),           value: `${hours}h`,                  raw: hours   },
    { label: t("breakeven"),       value: `${beDays}. ${locale==="tr"?"Gün":locale==="ar"?"يوم":"Day"}`, raw: beDays },
  ];

  const ac = CARDS[active];

  /* ── Mini Dashboard Preview content per card ── */
  const PREVIEWS = [
    /* 0 — saving: before/after invoice comparison */
    <div key="saving">
      <div style={{ fontSize:11, color:"rgba(255,255,255,.5)", marginBottom:10, textTransform:"uppercase", letterSpacing:".5px" }}>
        {locale==="tr"?"Fatura Karşılaştırması":locale==="ar"?"مقارنة التكاليف":"Cost Comparison"}
      </div>
      <div style={{ display:"flex", gap:10, marginBottom:10 }}>
        <div style={{ flex:1, background:"rgba(239,68,68,.15)", border:"1px solid rgba(239,68,68,.3)", borderRadius:10, padding:"12px 14px" }}>
          <div style={{ fontSize:10, color:"rgba(239,68,68,.8)", marginBottom:4, fontWeight:600 }}>
            {locale==="tr"?"Zyrix'siz":locale==="ar"?"بدون Zyrix":"Without Zyrix"}
          </div>
          <div style={{ fontSize:20, fontWeight:800, color:"#F87171" }}>
            ${Math.round(saving * 1.6).toLocaleString()}
          </div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,.4)", marginTop:3 }}>
            {locale==="tr"?"aylık kayıp":locale==="ar"?"خسارة شهرية":"monthly loss"}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", fontSize:16 }}>→</div>
        <div style={{ flex:1, background:`rgba(5,150,105,.15)`, border:`1px solid rgba(5,150,105,.3)`, borderRadius:10, padding:"12px 14px" }}>
          <div style={{ fontSize:10, color:"rgba(74,222,128,.8)", marginBottom:4, fontWeight:600 }}>
            {locale==="tr"?"Zyrix ile":locale==="ar"?"مع Zyrix":"With Zyrix"}
          </div>
          <div style={{ fontSize:20, fontWeight:800, color:"#4ADE80" }}>
            ${Math.round(saving * 0.4).toLocaleString()}
          </div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,.4)", marginTop:3 }}>
            {locale==="tr"?"aylık maliyet":locale==="ar"?"تكلفة شهرية":"monthly cost"}
          </div>
        </div>
      </div>
      <div style={{ background:"rgba(5,150,105,.1)", border:"1px solid rgba(5,150,105,.2)", borderRadius:8, padding:"8px 12px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:12, color:"rgba(255,255,255,.6)" }}>
          {locale==="tr"?"Toplam tasarruf":locale==="ar"?"إجمالي التوفير":"Total saving"}
        </span>
        <span style={{ fontSize:15, fontWeight:800, color:"#4ADE80" }}>${saving.toLocaleString()}/ay</span>
      </div>
    </div>,

    /* 1 — ROI: revenue growth chart */
    <div key="roi">
      <div style={{ fontSize:11, color:"rgba(255,255,255,.5)", marginBottom:10, textTransform:"uppercase", letterSpacing:".5px" }}>
        {locale==="tr"?"Gelir Büyüme Projeksiyonu":locale==="ar"?"مسار نمو الإيراد":"Revenue Growth Projection"}
      </div>
      <div style={{ display:"flex", alignItems:"flex-end", gap:5, height:80, marginBottom:10 }}>
        {[30,45,60,75,88,100].map((h,i)=>(
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <div style={{ width:"100%", background:`rgba(37,99,235,${0.3 + i*0.12})`, borderRadius:"3px 3px 0 0", height:`${h}%`, transition:"height .4s ease" }} />
            <span style={{ fontSize:9, color:"rgba(255,255,255,.4)" }}>
              {locale==="tr"?`A${i+1}`:locale==="ar"?`ش${i+1}`:`M${i+1}`}
            </span>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {[
          { lbl: locale==="tr"?"Mevcut Gelir":locale==="ar"?"الإيراد الحالي":"Current Revenue", val:`$${revenue.toLocaleString()}` },
          { lbl: locale==="tr"?"12 Ay Sonra":locale==="ar"?"بعد 12 شهر":"After 12 Months",   val:`$${Math.round(revenue*1.22).toLocaleString()}` },
        ].map(r=>(
          <div key={r.lbl} style={{ background:"rgba(37,99,235,.12)", border:"1px solid rgba(37,99,235,.2)", borderRadius:8, padding:"9px 11px" }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,.5)", marginBottom:3 }}>{r.lbl}</div>
            <div style={{ fontSize:16, fontWeight:800, color:"#60A5FA" }}>{r.val}</div>
          </div>
        ))}
      </div>
    </div>,

    /* 2 — Hours: weekly time breakdown */
    <div key="hours">
      <div style={{ fontSize:11, color:"rgba(255,255,255,.5)", marginBottom:10, textTransform:"uppercase", letterSpacing:".5px" }}>
        {locale==="tr"?"Haftalık Zaman Analizi":locale==="ar"?"تحليل الوقت الأسبوعي":"Weekly Time Analysis"}
      </div>
      {[
        { task: locale==="tr"?"Manuel raporlama":locale==="ar"?"تقارير يدوية":"Manual reporting",       before:8,  after:0.5, color:"#F59E0B" },
        { task: locale==="tr"?"Fatura düzenleme":locale==="ar"?"إنشاء الفواتير":"Invoice creation",    before:5,  after:0.2, color:"#60A5FA" },
        { task: locale==="tr"?"Müşteri takibi":locale==="ar"?"متابعة العملاء":"Customer follow-up",    before:6,  after:1,   color:"#A78BFA" },
        { task: locale==="tr"?"Vergi hesaplama":locale==="ar"?"حساب الضرائب":"Tax calculations",       before:3,  after:0.1, color:"#34D399" },
      ].map(row=>(
        <div key={row.task} style={{ marginBottom:8 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
            <span style={{ fontSize:11, color:"rgba(255,255,255,.65)" }}>{row.task}</span>
            <span style={{ fontSize:11, color:row.color, fontWeight:700 }}>
              {row.before}h → {row.after}h
            </span>
          </div>
          <div style={{ height:5, background:"rgba(255,255,255,.08)", borderRadius:3, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${(row.after/row.before)*100}%`, background:row.color, borderRadius:3, transition:"width .5s ease" }} />
          </div>
        </div>
      ))}
      <div style={{ marginTop:10, background:"rgba(212,183,62,.1)", border:"1px solid rgba(212,183,62,.2)", borderRadius:8, padding:"8px 12px", textAlign:"center" }}>
        <span style={{ fontSize:13, fontWeight:700, color:"#FCD34D" }}>
          {locale==="tr"?`Ayda ${hours} saat kazanıyorsunuz`:locale==="ar"?`توفير ${hours} ساعة شهرياً`:`Save ${hours} hours/month`}
        </span>
      </div>
    </div>,

    /* 3 — Breakeven: countdown */
    <div key="be">
      <div style={{ fontSize:11, color:"rgba(255,255,255,.5)", marginBottom:14, textTransform:"uppercase", letterSpacing:".5px" }}>
        {locale==="tr"?"Başabaş Noktası":locale==="ar"?"نقطة التعادل":"Break-even Timeline"}
      </div>
      {/* Progress arc visual */}
      <div style={{ textAlign:"center", marginBottom:14 }}>
        <div style={{ fontSize:52, fontWeight:900, color:"#A78BFA", lineHeight:1 }}>{beDays}</div>
        <div style={{ fontSize:14, color:"rgba(255,255,255,.6)", marginTop:4 }}>
          {locale==="tr"?"gün içinde kâra geçersiniz":locale==="ar"?"يوم حتى التعادل":"days to break even"}
        </div>
      </div>
      <div style={{ display:"flex", gap:3, marginBottom:10 }}>
        {Array.from({length:30},(_,i)=>(
          <div key={i} style={{ flex:1, height:8, borderRadius:2, background: i < beDays ? "rgba(167,139,250,.9)" : "rgba(255,255,255,.08)", transition:"background .3s" }} />
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {[
          { lbl:locale==="tr"?"Aylık ücret":locale==="ar"?"الاشتراك":"Monthly fee",          val:"$45" },
          { lbl:locale==="tr"?"Günlük tasarruf":locale==="ar"?"توفير يومي":"Daily saving",     val:`$${Math.round(saving/30)}` },
        ].map(r=>(
          <div key={r.lbl} style={{ background:"rgba(124,58,237,.12)", border:"1px solid rgba(124,58,237,.25)", borderRadius:8, padding:"9px 11px" }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,.5)", marginBottom:3 }}>{r.lbl}</div>
            <div style={{ fontSize:16, fontWeight:800, color:"#C4B5FD" }}>{r.val}</div>
          </div>
        ))}
      </div>
    </div>,
  ];

  /* ── AI CFO Insights per card + sliders ── */
  const INSIGHTS = [
    [
      { icon:"💡", txt: locale==="tr"?`${employees} çalışanınızla aylık $${saving} tasarruf edebilirsiniz — bu yıllık $${saving*12}'ye eşdeğer.`:locale==="ar"?`مع ${employees} موظف يمكنك توفير $${saving} شهرياً — ما يعادل $${saving*12} سنوياً.`:`With ${employees} employees you can save $${saving}/month — $${saving*12}/year.` },
      { icon:"📊", txt: locale==="tr"?"Manuel süreçlerin dijitalleştirilmesi, hata oranını %94 azaltır.":locale==="ar"?"رقمنة العمليات اليدوية تقلل معدل الأخطاء بنسبة 94٪.":"Digitalizing manual processes reduces error rate by 94%." },
      { icon:"🚀", txt: locale==="tr"?`$${revenue.toLocaleString()} geliriyle Zyrix maliyeti gelirinizin yalnızca %${Math.round(45/revenue*100)} 'i.`:locale==="ar"?`بإيراد $${revenue.toLocaleString()}، تكلفة Zyrix فقط ${Math.round(45/revenue*100)}٪ منه.`:`At $${revenue.toLocaleString()} revenue, Zyrix costs only ${Math.round(45/revenue*100)}% of it.` },
    ],
    [
      { icon:"📈", txt: locale==="tr"?`%${roi} yatırım getirisi — sektör ortalamasının 4 katı.`:locale==="ar"?`عائد استثمار ${roi}٪ — 4 أضعاف متوسط القطاع.`:`${roi}% ROI — 4x industry average.` },
      { icon:"🎯", txt: locale==="tr"?"Otomatik faturalandırma, tahsilat süresini %35 kısaltır.":locale==="ar"?"الفوترة التلقائية تقصّر دورة التحصيل بنسبة 35٪.":"Automated invoicing shortens collection cycle by 35%." },
      { icon:"💰", txt: locale==="tr"?`İlk yılda tahmini ek gelir: $${Math.round(revenue*0.15).toLocaleString()}.`:locale==="ar"?`الإيراد الإضافي المتوقع في السنة الأولى: $${Math.round(revenue*0.15).toLocaleString()}.`:`Estimated extra revenue in year 1: $${Math.round(revenue*0.15).toLocaleString()}.` },
    ],
    [
      { icon:"⏰", txt: locale==="tr"?`Haftada ${Math.round(hours/4)} saat tasarruf — bu ayda ${hours} saate denk gelir.`:locale==="ar"?`توفير ${Math.round(hours/4)} ساعة أسبوعياً — ما يعادل ${hours} ساعة شهرياً.`:`${Math.round(hours/4)} hours saved/week — ${hours} hours/month.` },
      { icon:"🤖", txt: locale==="tr"?"AI CFO, raporlama sürenizi %90 azaltır — dakikalar içinde içgörü alırsınız.":locale==="ar"?"AI CFO يقلل وقت إعداد التقارير 90٪ — رؤى في دقائق.":"AI CFO reduces reporting time by 90% — insights in minutes." },
      { icon:"📋", txt: locale==="tr"?`${employees} kişilik ekibiniz için yılda ${hours*12} saat verimlilik artışı.`:locale==="ar"?`لفريق من ${employees} أشخاص: زيادة إنتاجية بـ ${hours*12} ساعة سنوياً.`:`For ${employees}-person team: ${hours*12} productivity hours gained/year.` },
    ],
    [
      { icon:"🏁", txt: locale==="tr"?`Sadece ${beDays} günde yatırımınızı geri alırsınız.`:locale==="ar"?`في ${beDays} أيام فقط تستعيد استثمارك.`:`You recover your investment in just ${beDays} days.` },
      { icon:"📅", txt: locale==="tr"?"İlk müşterinizi sisteme girer girmez tasarruf başlar.":locale==="ar"?"بمجرد إدخال أول عميل، تبدأ التوفيرات فوراً.":"Savings begin the moment you enter your first customer." },
      { icon:"✅", txt: locale==="tr"?"Uzun vadeli taahhüt yok — istediğiniz zaman iptal edebilirsiniz.":locale==="ar"?"لا التزام طويل الأمد — إلغاء في أي وقت.":"No long-term commitment — cancel anytime." },
    ],
  ];

  return (
    <section style={{ padding:"52px 24px", background:"#0F172A", position:"relative", overflow:"hidden" }}>
      <div aria-hidden style={{ position:"absolute", inset:0, pointerEvents:"none", background:"radial-gradient(ellipse 40% 50% at 20% 60%, rgba(37,99,235,.07) 0%, transparent 60%)" }} />

      <div style={{ maxWidth:1160, margin:"0 auto", position:"relative", direction:isRTL?"rtl":"ltr" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <span style={{ display:"inline-block", background:"rgba(37,99,235,.15)", color:"#93C5FD", fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:100, marginBottom:10 }}>
            {t("tag")}
          </span>
          <h2 style={{ fontSize:"clamp(26px,3vw,34px)", fontWeight:900, color:"#C9A84C", marginBottom:10, lineHeight:1.25 }}>
            {t("title")}
          </h2>
          <p style={{ fontSize:16, color:"rgba(255,255,255,.7)", lineHeight:1.65 }}>{t("subtitle")}</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, alignItems:"start" }} className="roi-grid">

          {/* ── Left: sliders + result cards ── */}
          <div style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.09)", borderRadius:16, padding:26 }}>

            {/* Employees slider */}
            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:13, color:"rgba(255,255,255,.65)", display:"block", marginBottom:8 }}>{t("employees")}</label>
              <input type="range" min={1} max={50} step={1} value={employees}
                onChange={e => setEmployees(+e.target.value)}
                style={{ width:"100%", accentColor:"#2563EB", cursor:"pointer" }} />
              <div style={{ fontSize:20, fontWeight:800, color:"#2563EB", marginTop:5, fontFamily:"'Nunito Sans',sans-serif" }}>
                {employees} {locale==="tr"?"çalışan":locale==="ar"?"موظف":"employees"}
              </div>
            </div>

            {/* Revenue slider */}
            <div style={{ marginBottom:24 }}>
              <label style={{ fontSize:13, color:"rgba(255,255,255,.65)", display:"block", marginBottom:8 }}>{t("revenue")}</label>
              <input type="range" min={1000} max={100000} step={1000} value={revenue}
                onChange={e => setRevenue(+e.target.value)}
                style={{ width:"100%", accentColor:"#2563EB", cursor:"pointer" }} />
              <div style={{ fontSize:20, fontWeight:800, color:"#2563EB", marginTop:5, fontFamily:"'Nunito Sans',sans-serif" }}>
                ${revenue.toLocaleString()}
              </div>
            </div>

            {/* 4 result cards */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {results.map((r,i) => {
                const c = CARDS[i];
                const isAct = active === i;
                return (
                  <div key={r.label}
                    onMouseEnter={() => setActive(i)}
                    style={{
                      background: isAct ? c.bg : "rgba(255,255,255,.04)",
                      border: `2px solid ${isAct ? c.color : "rgba(255,255,255,.08)"}`,
                      borderRadius: 12, padding: 14, cursor: "pointer",
                      transition: "all .25s",
                      transform: isAct ? "translateY(-3px) scale(1.02)" : "none",
                      boxShadow: isAct ? `0 8px 24px ${c.color}44` : "none",
                    }}>
                    <div style={{ fontSize:11, color: isAct ? "#4B5563" : "rgba(255,255,255,.4)", marginBottom:5, transition:"color .25s", fontWeight: isAct ? 700 : 500 }}>
                      {r.label}
                    </div>
                    <div style={{ fontSize:22, fontWeight:900, color: isAct ? c.color : "rgba(255,255,255,.55)", fontFamily:"'Nunito Sans',sans-serif", transition:"color .25s" }}>
                      {r.value}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right: Preview + Insights ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

            {/* Mini Dashboard Preview */}
            <div style={{
              background: active===0?"rgba(5,78,59,.45)":active===1?"rgba(127,29,29,.45)":active===2?"rgba(120,53,15,.45)":"rgba(76,29,149,.45)",
              border: `2px solid ${ac.color}55`,
              borderRadius: 14, padding: 20,
              transition: "all .35s ease",
              minHeight: 200,
            }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14, paddingBottom:10, borderBottom:`1px solid rgba(255,255,255,.08)` }}>
                <span style={{ fontSize:12, fontWeight:700, color: ac.color, textTransform:"uppercase", letterSpacing:".5px" }}>
                  {locale==="tr"?"Canlı Önizleme":locale==="ar"?"معاينة حية":"Live Preview"}
                </span>
                <div style={{ display:"flex", gap:5 }}>
                  {[0,1,2,3].map(i=>(
                    <div key={i} onClick={()=>setActive(i)} style={{ width:8, height:8, borderRadius:"50%", background: active===i ? CARDS[i].color : "rgba(255,255,255,.15)", cursor:"pointer", transition:"background .2s" }} />
                  ))}
                </div>
              </div>
              {PREVIEWS[active]}
            </div>

            {/* AI CFO Insights */}
            <div style={{ background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:14, padding:18 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                <div style={{ width:28, height:28, background:"#2563EB", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>🤖</div>
                <span style={{ fontSize:13, fontWeight:700, color:"#60A5FA" }}>
                  AI CFO {locale==="tr"?"İçgörüleri":locale==="ar"?"رؤى":"Insights"}
                </span>
                <span style={{ marginLeft:"auto", fontSize:10, color:"rgba(255,255,255,.35)", fontWeight:600 }}>
                  {locale==="tr"?"şirketinize özel":locale==="ar"?"مخصص لشركتك":"tailored to your data"}
                </span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                {INSIGHTS[active].map((ins,i) => (
                  <div key={i} style={{ display:"flex", gap:10, padding:"10px 12px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.06)", borderRadius:10, alignItems:"flex-start", transition:"all .2s" }}
                    onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,.08)")}
                    onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,.04)")}>
                    <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>{ins.icon}</span>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,.75)", lineHeight:1.6 }}>{ins.txt}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`@media(max-width:860px){.roi-grid{grid-template-columns:1fr!important}}`}</style>
    </section>
  );
}