"use client";

import { useLocale } from "next-intl";
import Link from "next/link";
import { useState } from "react";

const GOLD = "#B8892A";

/* ── Labels ── */
const L = {
  tr: {
    badge:    "Canlı Demo — Kayıt Gerekmez",
    title:    "Zyrix FinSuite'i Keşfedin",
    sub:      "Gerçek verilerle çalışan demo — hiçbir şey kaydetmez",
    cta:      "14 Gün Ücretsiz Başla",
    tabs:     ["💰 Finansal", "👥 CRM", "🤖 AI CFO", "📊 Raporlar"],
    note:     "Demo verileri — gerçek değil",
  },
  en: {
    badge:    "Live Demo — No Registration",
    title:    "Explore Zyrix FinSuite",
    sub:      "Demo running on real-looking data — nothing is saved",
    cta:      "Start Free 14 Days",
    tabs:     ["💰 Finance", "👥 CRM", "🤖 AI CFO", "📊 Reports"],
    note:     "Demo data — not real",
  },
  ar: {
    badge:    "ديمو مباشر — لا تسجيل",
    title:    "اكتشف Zyrix FinSuite",
    sub:      "ديمو ببيانات واقعية — لا شيء يُحفظ",
    cta:      "ابدأ مجاناً 14 يوم",
    tabs:     ["💰 المالية", "👥 CRM", "🤖 AI CFO", "📊 التقارير"],
    note:     "بيانات تجريبية — ليست حقيقية",
  },
};

/* ── Finance Tab ── */
function FinanceTab({ locale }: { locale: string }) {
  const isTR = locale === "tr";
  const isAR = locale === "ar";
  const months = isTR
    ? ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"]
    : isAR
    ? ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"]
    : ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const data = [42,55,38,72,65,80,91,74,88,95,78,100];

  const INVOICES = [
    { no:"#INV-2026-0042", client: isTR?"Akay Ltd.":isAR?"شركة أكاي":"Akay Ltd.",     amount:"₺12,500", status:"paid",    date:"12 Nis" },
    { no:"#INV-2026-0041", client: isTR?"Demir A.Ş.":isAR?"شركة ديمير":"Demir A.Ş.", amount:"₺8,200",  status:"pending", date:"10 Nis" },
    { no:"#INV-2026-0040", client: isTR?"Yıldız Co.":isAR?"يلدز كو":"Yıldız Co.",    amount:"₺22,800", status:"paid",    date:"08 Nis" },
    { no:"#INV-2026-0039", client: isTR?"Güneş Ltd.":isAR?"شركة غونيش":"Güneş Ltd.", amount:"₺5,600",  status:"overdue", date:"01 Nis" },
  ];

  const statusLabel = (s: string) =>
    s==="paid"    ? (isTR?"Ödendi":isAR?"مدفوع":"Paid")
    : s==="pending" ? (isTR?"Bekliyor":isAR?"معلق":"Pending")
    : (isTR?"Gecikmiş":isAR?"متأخر":"Overdue");
  const statusColor = (s: string) =>
    s==="paid" ? "#059669" : s==="pending" ? "#D97706" : "#DC2626";

  return (
    <div>
      {/* KPI cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }} className="kpi-grid">
        {[
          { label: isTR?"Aylık Gelir":isAR?"الإيراد الشهري":"Monthly Revenue",  val:"₺284,500", change:"+18.4%", up:true  },
          { label: isTR?"Tahsilatlar":isAR?"المحصّلات":"Collections",           val:"₺198,200", change:"+7.2%",  up:true  },
          { label: isTR?"Giderler":isAR?"المصروفات":"Expenses",                 val:"₺92,400",  change:"+4.1%",  up:false },
          { label: isTR?"Net Kâr":isAR?"صافي الربح":"Net Profit",               val:"₺105,800", change:"+22.6%", up:true  },
        ].map(k=>(
          <div key={k.label} style={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:12, padding:"14px 16px" }}>
            <div style={{ fontSize:11, color:"#6B7280", marginBottom:6, fontWeight:600 }}>{k.label}</div>
            <div style={{ fontSize:22, fontWeight:900, color:"#0A0A0A", marginBottom:4, fontFamily:"'Nunito Sans',sans-serif" }}>{k.val}</div>
            <div style={{ fontSize:12, color: k.up?"#059669":"#DC2626", fontWeight:700 }}>
              {k.up?"▲":"▼"} {k.change}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:12, padding:"18px 20px", marginBottom:20 }}>
        <div style={{ fontSize:14, fontWeight:700, color:"#0A0A0A", marginBottom:14 }}>
          {isTR?"Aylık Gelir (2026)":isAR?"الإيراد الشهري (2026)":"Monthly Revenue (2026)"}
        </div>
        <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:100 }}>
          {data.map((h,i)=>(
            <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{ width:"100%", background:`rgba(37,99,235,${0.3+h/200})`, borderRadius:"3px 3px 0 0", height:`${h}%`, minHeight:4, transition:"height .3s" }} />
              <span style={{ fontSize:8, color:"#9CA3AF" }}>{months[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent invoices */}
      <div style={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:12, overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid #F3F4F6", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:14, fontWeight:700, color:"#0A0A0A" }}>
            {isTR?"Son Faturalar":isAR?"آخر الفواتير":"Recent Invoices"}
          </span>
          <span style={{ fontSize:12, color:"#2563EB", fontWeight:600, cursor:"pointer" }}>
            {isTR?"Tümünü Gör":isAR?"عرض الكل":"See All"} →
          </span>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#F9FAFB" }}>
              {[isTR?"No":isAR?"رقم":"No", isTR?"Müşteri":isAR?"العميل":"Client", isTR?"Tutar":isAR?"المبلغ":"Amount", isTR?"Durum":isAR?"الحالة":"Status", isTR?"Tarih":isAR?"التاريخ":"Date"].map(h=>(
                <th key={h} style={{ padding:"10px 16px", fontSize:11, fontWeight:700, color:"#6B7280", textAlign:"left", textTransform:"uppercase", letterSpacing:".4px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {INVOICES.map((inv,i)=>(
              <tr key={i} style={{ borderTop:"1px solid #F3F4F6" }}>
                <td style={{ padding:"11px 16px", fontSize:13, color:"#2563EB", fontWeight:600 }}>{inv.no}</td>
                <td style={{ padding:"11px 16px", fontSize:13, color:"#0A0A0A", fontWeight:500 }}>{inv.client}</td>
                <td style={{ padding:"11px 16px", fontSize:13, fontWeight:700, color:"#0A0A0A" }}>{inv.amount}</td>
                <td style={{ padding:"11px 16px" }}>
                  <span style={{ background:`${statusColor(inv.status)}18`, color:statusColor(inv.status), fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:100 }}>
                    {statusLabel(inv.status)}
                  </span>
                </td>
                <td style={{ padding:"11px 16px", fontSize:12, color:"#6B7280" }}>{inv.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── CRM Tab ── */
function CRMTab({ locale }: { locale: string }) {
  const isTR = locale === "tr";
  const isAR = locale === "ar";

  const PIPELINE = [
    { stage: isTR?"Potansiyel":isAR?"محتمل":"Potential",     count:12, val:"₺48,000",  color:"#93C5FD" },
    { stage: isTR?"Müzakere":isAR?"تفاوض":"Negotiation",     count:5,  val:"₺92,500",  color:"#86EFAC" },
    { stage: isTR?"Teklif":isAR?"عرض":"Proposal",            count:3,  val:"₺67,200",  color:"#FDE68A" },
    { stage: isTR?"Kapandı":isAR?"مُغلق":"Closed",           count:8,  val:"₺156,000", color:"#6EE7B7" },
  ];

  const CUSTOMERS = [
    { name:"Akay Holding",   sector: isTR?"Sanayi":isAR?"صناعة":"Industry",      score:94, status:"active" },
    { name:"Demir Tekstil",  sector: isTR?"Tekstil":isAR?"نسيج":"Textile",       score:87, status:"active" },
    { name:"Yıldız Gıda",    sector: isTR?"Gıda":isAR?"غذاء":"Food",             score:71, status:"follow" },
    { name:"Güneş İnşaat",   sector: isTR?"İnşaat":isAR?"إنشاء":"Construction",  score:65, status:"risk"   },
  ];

  return (
    <div>
      {/* Pipeline */}
      <div style={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:12, padding:"18px 20px", marginBottom:20 }}>
        <div style={{ fontSize:14, fontWeight:700, color:"#0A0A0A", marginBottom:14 }}>
          {isTR?"Satış Pipeline'ı":isAR?"خط المبيعات":"Sales Pipeline"}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }} className="pipe-grid">
          {PIPELINE.map(p=>(
            <div key={p.stage} style={{ background:"#F9FAFB", border:"1px solid #E5E7EB", borderRadius:10, padding:14 }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:p.color, marginBottom:8 }} />
              <div style={{ fontSize:12, fontWeight:700, color:"#374151", marginBottom:4 }}>{p.stage}</div>
              <div style={{ fontSize:22, fontWeight:900, color:"#0A0A0A", fontFamily:"'Nunito Sans',sans-serif" }}>{p.count}</div>
              <div style={{ fontSize:12, color:"#059669", fontWeight:600, marginTop:2 }}>{p.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer list */}
      <div style={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:12, overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid #F3F4F6" }}>
          <span style={{ fontSize:14, fontWeight:700, color:"#0A0A0A" }}>
            {isTR?"Müşteri Listesi":isAR?"قائمة العملاء":"Customer List"}
          </span>
        </div>
        {CUSTOMERS.map((c,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", padding:"12px 18px", borderTop: i>0?"1px solid #F3F4F6":"none", gap:12 }}>
            <div style={{ width:36, height:36, borderRadius:"50%", background:"#EFF6FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#1D4ED8", flexShrink:0 }}>
              {c.name.charAt(0)}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#0A0A0A" }}>{c.name}</div>
              <div style={{ fontSize:12, color:"#6B7280" }}>{c.sector}</div>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:11, color:"#6B7280", marginBottom:2 }}>
                {isTR?"Skor":isAR?"تقييم":"Score"}
              </div>
              <div style={{ fontSize:16, fontWeight:900, color: c.score>=80?"#059669":c.score>=70?"#D97706":"#DC2626", fontFamily:"'Nunito Sans',sans-serif" }}>
                {c.score}
              </div>
            </div>
            <span style={{
              fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:100,
              background: c.status==="active"?"#ECFDF5":c.status==="follow"?"#FFFBEB":"#FEF2F2",
              color:      c.status==="active"?"#059669":c.status==="follow"?"#D97706":"#DC2626",
            }}>
              {c.status==="active"?(isTR?"Aktif":isAR?"نشط":"Active")
               :c.status==="follow"?(isTR?"Takip":isAR?"متابعة":"Follow")
               :(isTR?"Risk":isAR?"خطر":"Risk")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── AI CFO Tab ── */
function AICFOTab({ locale }: { locale: string }) {
  const isTR = locale === "tr";
  const isAR = locale === "ar";

  const INSIGHTS = [
    {
      type:"warning",
      icon:"⚠️",
      title: isTR?"Nakit Akışı Uyarısı":isAR?"تحذير التدفق النقدي":"Cash Flow Warning",
      text:  isTR?"15 Mayıs civarında likidite baskısı bekleniyor. Tedarikçi ödemelerinizi 1 hafta erteleyebilirsiniz.":isAR?"من المتوقع ضغط سيولة حول 15 مايو. يمكنك تأجيل مدفوعات الموردين أسبوعاً.":"Liquidity pressure expected around May 15. You can delay supplier payments by 1 week.",
    },
    {
      type:"success",
      icon:"✅",
      title: isTR?"Güçlü Performans":isAR?"أداء قوي":"Strong Performance",
      text:  isTR?"Bu ay gelirleriniz geçen yıla göre %22 arttı. Büyüme trendini sürdürmek için pazarlama bütçesini %15 artırmanızı öneririm.":isAR?"ارتفعت إيراداتك هذا الشهر 22٪ مقارنة بالعام الماضي. أنصح بزيادة ميزانية التسويق 15٪.":"Revenue up 22% vs last year. Recommend increasing marketing budget by 15% to sustain growth.",
    },
    {
      type:"info",
      icon:"💡",
      title: isTR?"Optimizasyon Fırsatı":isAR?"فرصة تحسين":"Optimization Opportunity",
      text:  isTR?"4 müşterinizin faturası 30+ gün gecikmiş. Otomatik hatırlatma gönderilsin mi? Tahmini tahsilat: ₺28,400.":isAR?"4 عملاء لديهم فواتير متأخرة 30+ يوم. هل تريد إرسال تذكيرات تلقائية؟ التحصيل المتوقع: ₺28,400.":"4 clients have invoices 30+ days overdue. Send automatic reminders? Estimated collection: ₺28,400.",
    },
  ];

  const colors = { warning:"#D97706", success:"#059669", info:"#2563EB" };
  const bgs    = { warning:"#FFFBEB", success:"#ECFDF5", info:"#EFF6FF" };

  return (
    <div>
      {/* Health score */}
      <div style={{ background:"linear-gradient(135deg,#0F172A,#1E293B)", borderRadius:14, padding:"22px 24px", marginBottom:20, display:"flex", alignItems:"center", gap:24 }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:52, fontWeight:900, color:"#4ADE80", fontFamily:"'Nunito Sans',sans-serif", lineHeight:1 }}>94</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,.6)", marginTop:4 }}>
            {isTR?"Mali Sağlık":isAR?"الصحة المالية":"Financial Health"}
          </div>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:16, fontWeight:700, color:"#fff", marginBottom:8 }}>
            {isTR?"🤖 AI CFO Günlük Özeti":isAR?"🤖 ملخص AI CFO اليومي":"🤖 AI CFO Daily Summary"}
          </div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,.75)", lineHeight:1.65 }}>
            {isTR?"Şirketiniz bu ay mükemmel performans gösteriyor. Gelirler hedefin %108'inde, giderler kontrol altında. 3 önemli aksiyon noktası tespit edildi.":isAR?"شركتك تحقق أداءً ممتازاً هذا الشهر. الإيرادات عند 108٪ من الهدف، المصاريف تحت السيطرة. تم تحديد 3 نقاط عمل مهمة.":"Your company is performing excellently this month. Revenue at 108% of target, expenses under control. 3 important action points identified."}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {INSIGHTS.map((ins,i)=>(
          <div key={i} style={{ background:bgs[ins.type as keyof typeof bgs], border:`1px solid ${colors[ins.type as keyof typeof colors]}30`, borderRadius:12, padding:"14px 16px", display:"flex", gap:12 }}>
            <span style={{ fontSize:20, flexShrink:0 }}>{ins.icon}</span>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:colors[ins.type as keyof typeof colors], marginBottom:4 }}>{ins.title}</div>
              <div style={{ fontSize:13, color:"#374151", lineHeight:1.65 }}>{ins.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Reports Tab ── */
function ReportsTab({ locale }: { locale: string }) {
  const isTR = locale === "tr";
  const isAR = locale === "ar";

  const REPORTS = [
    { icon:"📊", name: isTR?"Gelir & Gider Raporu":isAR?"تقرير الإيرادات والمصروفات":"Revenue & Expense Report", date:"Nisan 2026", size:"2.4 MB", type:"PDF" },
    { icon:"🧾", name: isTR?"KDV Beyannamesi":isAR?"إقرار KDV":"VAT Declaration",                               date:"Mart 2026",  size:"1.1 MB", type:"PDF" },
    { icon:"👥", name: isTR?"Müşteri Analiz Raporu":isAR?"تقرير تحليل العملاء":"Customer Analysis Report",      date:"Q1 2026",    size:"3.8 MB", type:"XLSX" },
    { icon:"💰", name: isTR?"Nakit Akışı Tahmini":isAR?"توقع التدفق النقدي":"Cash Flow Forecast",              date:"Mayıs 2026", size:"0.9 MB", type:"PDF" },
  ];

  return (
    <div>
      <div style={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:12, overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid #F3F4F6" }}>
          <span style={{ fontSize:14, fontWeight:700, color:"#0A0A0A" }}>
            {isTR?"Hazır Raporlar":isAR?"التقارير الجاهزة":"Ready Reports"}
          </span>
        </div>
        {REPORTS.map((r,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", padding:"13px 18px", borderTop: i>0?"1px solid #F3F4F6":"none", gap:12 }}>
            <span style={{ fontSize:22 }}>{r.icon}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#0A0A0A" }}>{r.name}</div>
              <div style={{ fontSize:12, color:"#6B7280" }}>{r.date} · {r.size}</div>
            </div>
            <span style={{ background: r.type==="PDF"?"#FEF2F2":"#ECFDF5", color: r.type==="PDF"?"#DC2626":"#059669", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:100 }}>
              {r.type}
            </span>
            <button style={{ padding:"6px 14px", background:"#EFF6FF", color:"#2563EB", border:"none", borderRadius:7, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
              ⬇ {isTR?"İndir":isAR?"تنزيل":"Download"}
            </button>
          </div>
        ))}
      </div>

      {/* Quick stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginTop:16 }} className="rep-grid">
        {[
          { label: isTR?"Bu Ay Fatura":isAR?"فواتير هذا الشهر":"This Month Invoices",   val:"47",       bg:"#EFF6FF", color:"#1D4ED8" },
          { label: isTR?"Ortalama Tahsilat":isAR?"متوسط التحصيل":"Avg Collection",      val:"12 Gün",   bg:"#ECFDF5", color:"#065F46" },
          { label: isTR?"KDV Borcu":isAR?"ديون KDV":"VAT Due",                          val:"₺14,200",  bg:"#FFFBEB", color:"#92400E" },
        ].map(s=>(
          <div key={s.label} style={{ background:s.bg, border:`1px solid ${s.color}20`, borderRadius:12, padding:"16px 18px", textAlign:"center" }}>
            <div style={{ fontSize:22, fontWeight:900, color:s.color, fontFamily:"'Nunito Sans',sans-serif" }}>{s.val}</div>
            <div style={{ fontSize:12, color:"#374151", marginTop:4, fontWeight:600 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main Demo Page ── */
export default function DemoPage() {
  const locale = useLocale();
  const l      = L[locale as keyof typeof L] ?? L.tr;
  const isRTL  = locale === "ar";
  const [tab, setTab] = useState(0);

  const TABS = [FinanceTab, CRMTab, AICFOTab, ReportsTab];
  const ActiveTab = TABS[tab];

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC", direction: isRTL?"rtl":"ltr" }}>

      {/* Top bar */}
      <div style={{ background:"#0F172A", padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:12, color:"rgba(255,255,255,.5)", fontWeight:600 }}>
          🔒 {l.note}
        </span>
        <Link href={`/${locale}/signup`} style={{ background:"#2563EB", color:"#fff", padding:"8px 18px", borderRadius:7, fontSize:13, fontWeight:700, textDecoration:"none" }}>
          {l.cta} →
        </Link>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 24px" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <span style={{ display:"inline-block", background:"#DBEAFE", color:"#1D4ED8", fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:100, marginBottom:10 }}>
            {l.badge}
          </span>
          <h1 style={{ fontSize:"clamp(24px,3vw,36px)", fontWeight:900, color:GOLD, marginBottom:8, lineHeight:1.25 }}>
            {l.title}
          </h1>
          <p style={{ fontSize:15, color:"#4B5563" }}>{l.sub}</p>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:6, marginBottom:20, borderBottom:"2px solid #E5E7EB", flexWrap:"wrap" }}>
          {l.tabs.map((tb,i)=>(
            <button key={i} onClick={()=>setTab(i)} style={{
              padding:"10px 20px", border:"none", background:"transparent",
              cursor:"pointer", fontFamily:"inherit",
              fontSize:14, fontWeight:700,
              color: tab===i?"#2563EB":"#4B5563",
              borderBottom: tab===i?"3px solid #2563EB":"3px solid transparent",
              marginBottom:-2, transition:"all .15s",
            }}>{tb}</button>
          ))}
        </div>

        {/* Active tab content */}
        <ActiveTab locale={locale} />

        {/* Bottom CTA */}
        <div style={{ marginTop:32, background:"linear-gradient(135deg,#2563EB,#7C3AED)", borderRadius:16, padding:"28px 32px", textAlign:"center" }}>
          <h3 style={{ fontSize:22, fontWeight:900, color:"#fff", marginBottom:8 }}>
            {locale==="tr"?"Bu özelliklerin hepsi sizin de olabilir":locale==="ar"?"كل هذه الميزات يمكن أن تكون لك":"All these features can be yours"}
          </h3>
          <p style={{ fontSize:14, color:"rgba(255,255,255,.8)", marginBottom:20 }}>
            {locale==="tr"?"14 gün ücretsiz — kredi kartı gerekmez — 10 dakikada kurulum":locale==="ar"?"14 يوماً مجاناً — لا بطاقة ائتمان — إعداد في 10 دقائق":"14 days free — no credit card — 10-minute setup"}
          </p>
          <Link href={`/${locale}/signup`} style={{ background:"#fff", color:"#2563EB", padding:"13px 32px", borderRadius:9, fontSize:15, fontWeight:800, textDecoration:"none", display:"inline-block" }}>
            {l.cta}
          </Link>
        </div>
      </div>

      <style>{`
        @media(max-width:768px){.kpi-grid{grid-template-columns:repeat(2,1fr)!important}.pipe-grid{grid-template-columns:repeat(2,1fr)!important}.rep-grid{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  );
}