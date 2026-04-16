"use client";

import { useLocale } from "next-intl";
import Link from "next/link";
import { useState } from "react";

const GOLD = "#B8892A";

const L = {
  tr: {
    greeting:   "Günaydın",
    greetSub:   "İşte bugünkü şirket özeti",
    nav: {
      dashboard:    "Panel",
      invoices:     "Faturalar",
      customers:    "Müşteriler",
      crm:          "CRM",
      ai:           "AI CFO",
      reports:      "Raporlar",
      payments:     "Ödemeler",
      settings:     "Ayarlar",
      logout:       "Çıkış",
    },
    kpis: ["Aylık Gelir","Tahsilatlar","Giderler","Net Kâr"],
    aiTitle:    "AI CFO Günlük Özeti",
    actTitle:   "Son Aktiviteler",
    taskTitle:  "Bekleyen Görevler",
    quickTitle: "Hızlı İşlemler",
    quick: ["Yeni Fatura","Müşteri Ekle","Ödeme Linki","Rapor Al"],
  },
  en: {
    greeting:   "Good morning",
    greetSub:   "Here's your company summary for today",
    nav: {
      dashboard:    "Dashboard",
      invoices:     "Invoices",
      customers:    "Customers",
      crm:          "CRM",
      ai:           "AI CFO",
      reports:      "Reports",
      payments:     "Payments",
      settings:     "Settings",
      logout:       "Logout",
    },
    kpis: ["Monthly Revenue","Collections","Expenses","Net Profit"],
    aiTitle:    "AI CFO Daily Summary",
    actTitle:   "Recent Activity",
    taskTitle:  "Pending Tasks",
    quickTitle: "Quick Actions",
    quick: ["New Invoice","Add Customer","Payment Link","Get Report"],
  },
  ar: {
    greeting:   "صباح الخير",
    greetSub:   "إليك ملخص شركتك لليوم",
    nav: {
      dashboard:    "لوحة التحكم",
      invoices:     "الفواتير",
      customers:    "العملاء",
      crm:          "CRM",
      ai:           "AI CFO",
      reports:      "التقارير",
      payments:     "المدفوعات",
      settings:     "الإعدادات",
      logout:       "تسجيل الخروج",
    },
    kpis: ["الإيراد الشهري","المحصّلات","المصروفات","صافي الربح"],
    aiTitle:    "ملخص AI CFO اليومي",
    actTitle:   "آخر الأنشطة",
    taskTitle:  "المهام المعلقة",
    quickTitle: "إجراءات سريعة",
    quick: ["فاتورة جديدة","إضافة عميل","رابط دفع","تقرير"],
  },
};

const NAV_ICONS: Record<string, string> = {
  dashboard:"📊", invoices:"🧾", customers:"👥", crm:"📈",
  ai:"🤖", reports:"📋", payments:"💳", settings:"⚙️", logout:"🚪",
};

const KPI_DATA = [
  { val:"₺284,500", change:"+18.4%", up:true,  color:"#2563EB", bg:"#EFF6FF", border:"#BFDBFE" },
  { val:"₺198,200", change:"+7.2%",  up:true,  color:"#059669", bg:"#ECFDF5", border:"#A7F3D0" },
  { val:"₺92,400",  change:"+4.1%",  up:false, color:"#DC2626", bg:"#FEF2F2", border:"#FECACA" },
  { val:"₺105,800", change:"+22.6%", up:true,  color:"#7C3AED", bg:"#F5F3FF", border:"#DDD6FE" },
];

const ACTIVITIES = [
  { icon:"🧾", text:"Fatura #INV-042 oluşturuldu",      time:"5 dk önce",  color:"#2563EB" },
  { icon:"💰", text:"Akay Ltd. ₺12,500 ödedi",          time:"1 sa önce",  color:"#059669" },
  { icon:"👤", text:"Yeni müşteri: Demir A.Ş.",           time:"2 sa önce",  color:"#7C3AED" },
  { icon:"⚠️", text:"Fatura #INV-039 gecikmiş",          time:"1 gün önce", color:"#DC2626" },
  { icon:"🤖", text:"AI CFO haftalık rapor hazırladı",   time:"2 gün önce", color:"#D97706" },
];

const TASKS = [
  { text:"Güneş İnşaat faturasını takip et",   due:"Bugün",     priority:"high"   },
  { text:"KDV beyannamesi hazırla",            due:"3 gün",     priority:"medium" },
  { text:"5 müşteri teklifini güncelle",       due:"Bu hafta",  priority:"low"    },
  { text:"Aylık raporu yöneticiye gönder",     due:"Cuma",      priority:"medium" },
];

const CHART_DATA = [42,55,38,72,65,80,91,74,88,95,78,100];
const MONTHS_TR  = ["O","Ş","M","N","M","H","T","A","E","E","K","A"];

export default function DashboardPage() {
  const locale = useLocale();
  const l      = L[locale as keyof typeof L] ?? L.tr;
  const isRTL  = locale === "ar";

  const [activeNav, setActiveNav] = useState("dashboard");
  const [sideOpen,  setSideOpen]  = useState(true);

  const priorityColor = (p: string) =>
    p==="high"?"#DC2626":p==="medium"?"#D97706":"#059669";
  const priorityBg = (p: string) =>
    p==="high"?"#FEF2F2":p==="medium"?"#FFFBEB":"#ECFDF5";

  const AI_INSIGHTS = [
    { icon:"✅", color:"#059669", bg:"#ECFDF5", text: locale==="tr"?"Gelirler bu ay hedefin %108'inde — mükemmel performans.":locale==="ar"?"الإيرادات عند 108٪ من الهدف هذا الشهر — أداء ممتاز.":"Revenue at 108% of target this month — excellent performance." },
    { icon:"⚠️", color:"#D97706", bg:"#FFFBEB", text: locale==="tr"?"15 Mayıs'ta likidite baskısı bekleniyor. Tedarikçi ödemesini 1 hafta erteleyebilirsiniz.":locale==="ar"?"من المتوقع ضغط سيولة في 15 مايو. يمكنك تأجيل دفع المورد أسبوعاً.":"Liquidity pressure expected May 15. Can delay supplier payment 1 week." },
    { icon:"💡", color:"#2563EB", bg:"#EFF6FF", text: locale==="tr"?"4 gecikmiş fatura için otomatik hatırlatma gönderilsin mi? Tahmini tahsilat: ₺28,400.":locale==="ar"?"هل تريد إرسال تذكيرات تلقائية لـ 4 فواتير متأخرة؟ تحصيل متوقع: ₺28,400.":"Send auto-reminders for 4 overdue invoices? Estimated collection: ₺28,400." },
  ];

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#F1F5F9", direction: isRTL?"rtl":"ltr" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: sideOpen ? 240 : 64,
        background:"#0F172A",
        display:"flex", flexDirection:"column",
        transition:"width .25s",
        flexShrink:0, position:"sticky", top:0, height:"100vh", overflowY:"auto",
      }}>
        {/* Logo */}
        <div style={{ padding:"20px 16px", borderBottom:"1px solid rgba(255,255,255,.07)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          {sideOpen && (
            <Link href={`/${locale}`} style={{ textDecoration:"none" }}>
              <span style={{ fontSize:18, fontWeight:900, color:"#fff", direction:"ltr", display:"inline-block" }}>
                <span style={{ color:"#2563EB" }}>Z</span>yrix<span style={{ color:"#2563EB" }}>.</span>
              </span>
            </Link>
          )}
          <button onClick={()=>setSideOpen(!sideOpen)} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,.5)", fontSize:16, padding:4, lineHeight:1, marginLeft: sideOpen?"auto":0 }}>
            {sideOpen?"◀":"▶"}
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ flex:1, padding:"12px 8px", display:"flex", flexDirection:"column", gap:2 }}>
          {(Object.keys(l.nav) as (keyof typeof l.nav)[]).map(key => (
            <button key={key}
              onClick={() => { if(key==="logout") window.location.href=`/${locale}/signin`; else setActiveNav(key); }}
              style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"10px 10px", border:"none", borderRadius:8,
                background: activeNav===key?"rgba(37,99,235,.15)":"transparent",
                color: activeNav===key?"#60A5FA":key==="logout"?"rgba(239,68,68,.7)":"rgba(255,255,255,.65)",
                cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight: activeNav===key?700:500,
                transition:"all .15s", textAlign: isRTL?"right":"left",
                width:"100%",
              }}
              onMouseEnter={e=>{ if(activeNav!==key) e.currentTarget.style.background="rgba(255,255,255,.05)"; }}
              onMouseLeave={e=>{ if(activeNav!==key) e.currentTarget.style.background="transparent"; }}
            >
              <span style={{ fontSize:16, flexShrink:0 }}>{NAV_ICONS[key]}</span>
              {sideOpen && <span>{l.nav[key]}</span>}
            </button>
          ))}
        </nav>

        {/* User info */}
        {sideOpen && (
          <div style={{ padding:"14px 16px", borderTop:"1px solid rgba(255,255,255,.07)", display:"flex", gap:10, alignItems:"center" }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:"#2563EB", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"#fff", flexShrink:0 }}>AY</div>
            <div style={{ overflow:"hidden" }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#fff", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>Ahmet Yılmaz</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,.4)" }}>Business Plan</div>
            </div>
          </div>
        )}
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex:1, overflow:"auto" }}>

        {/* Top bar */}
        <div style={{ background:"#fff", borderBottom:"1px solid #E5E7EB", padding:"0 28px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
          <div>
            <span style={{ fontSize:16, fontWeight:700, color:"#0A0A0A" }}>
              {l.greeting}, Ahmet 👋
            </span>
            <span style={{ fontSize:13, color:"#6B7280", marginLeft:8 }}>{l.greetSub}</span>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            {/* Notification bell */}
            <button style={{ position:"relative", background:"none", border:"none", cursor:"pointer", fontSize:18, padding:6 }}>
              🔔
              <span style={{ position:"absolute", top:4, right:4, width:8, height:8, background:"#DC2626", borderRadius:"50%", display:"block" }} />
            </button>
            <Link href={`/${locale}/signup`} style={{ background:"#2563EB", color:"#fff", padding:"8px 16px", borderRadius:8, fontSize:13, fontWeight:700, textDecoration:"none" }}>
              + {locale==="tr"?"Yeni Fatura":locale==="ar"?"فاتورة جديدة":"New Invoice"}
            </Link>
          </div>
        </div>

        <div style={{ padding:"24px 28px", display:"flex", flexDirection:"column", gap:20 }}>

          {/* KPI cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }} className="kpi-grid">
            {KPI_DATA.map((k,i) => (
              <div key={i} style={{ background:"#fff", border:`1.5px solid ${k.border}`, borderRadius:14, padding:"16px 18px" }}>
                <div style={{ fontSize:12, color:"#6B7280", fontWeight:600, marginBottom:8 }}>{l.kpis[i]}</div>
                <div style={{ fontSize:24, fontWeight:900, color:k.color, fontFamily:"'Nunito Sans',sans-serif", marginBottom:5 }}>{k.val}</div>
                <div style={{ fontSize:12, color: k.up?"#059669":"#DC2626", fontWeight:700, display:"flex", alignItems:"center", gap:4 }}>
                  {k.up?"▲":"▼"} {k.change}
                  <span style={{ color:"#9CA3AF", fontWeight:400, marginLeft:4 }}>
                    {locale==="tr"?"geçen aya göre":locale==="ar"?"مقارنة بالشهر الماضي":"vs last month"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Chart + AI CFO */}
          <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:16 }} className="mid-grid">

            {/* Revenue chart */}
            <div style={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:14, padding:"18px 20px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <span style={{ fontSize:14, fontWeight:700, color:"#0A0A0A" }}>
                  {locale==="tr"?"Aylık Gelir (2026)":locale==="ar"?"الإيراد الشهري (2026)":"Monthly Revenue (2026)"}
                </span>
                <select style={{ fontSize:12, border:"1px solid #E5E7EB", borderRadius:6, padding:"4px 8px", color:"#374151", cursor:"pointer", fontFamily:"inherit" }}>
                  <option>2026</option><option>2025</option>
                </select>
              </div>
              <div style={{ display:"flex", alignItems:"flex-end", gap:5, height:120 }}>
                {CHART_DATA.map((h,i) => (
                  <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                    <div style={{ width:"100%", background:`rgba(37,99,235,${0.25+h/200})`, borderRadius:"3px 3px 0 0", height:`${h}%`, minHeight:4, transition:"height .3s", cursor:"pointer" }}
                      title={`${MONTHS_TR[i]}: ₺${Math.round(h*2845)}`} />
                    <span style={{ fontSize:9, color:"#9CA3AF" }}>{MONTHS_TR[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI CFO */}
            <div style={{ background:"#0F172A", border:"1px solid #1E293B", borderRadius:14, padding:"18px 20px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                <div style={{ width:28, height:28, background:"#2563EB", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>🤖</div>
                <span style={{ fontSize:13, fontWeight:700, color:"#60A5FA" }}>{l.aiTitle}</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {AI_INSIGHTS.map((ins,i) => (
                  <div key={i} style={{ display:"flex", gap:8, padding:"9px 11px", background:ins.bg, borderRadius:9, alignItems:"flex-start" }}>
                    <span style={{ fontSize:14, flexShrink:0 }}>{ins.icon}</span>
                    <span style={{ fontSize:11, color:"#374151", lineHeight:1.55 }}>{ins.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity + Tasks + Quick actions */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }} className="bot-grid">

            {/* Recent activity */}
            <div style={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:14, padding:"16px 18px" }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#0A0A0A", marginBottom:14 }}>{l.actTitle}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                {ACTIVITIES.map((a,i) => (
                  <div key={i} style={{ display:"flex", gap:10, padding:"10px 0", borderBottom: i<ACTIVITIES.length-1?"1px solid #F3F4F6":"none", alignItems:"flex-start" }}>
                    <div style={{ width:30, height:30, borderRadius:"50%", background:`${a.color}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0 }}>{a.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, color:"#0A0A0A", fontWeight:500, lineHeight:1.4 }}>{a.text}</div>
                      <div style={{ fontSize:11, color:"#9CA3AF", marginTop:2 }}>{a.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending tasks */}
            <div style={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:14, padding:"16px 18px" }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#0A0A0A", marginBottom:14 }}>{l.taskTitle}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {TASKS.map((task,i) => (
                  <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"9px 10px", background:"#F9FAFB", borderRadius:8, border:"1px solid #F3F4F6" }}>
                    <input type="checkbox" style={{ marginTop:2, cursor:"pointer", accentColor:"#2563EB", flexShrink:0 }} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, color:"#0A0A0A", fontWeight:500, lineHeight:1.4 }}>{task.text}</div>
                      <div style={{ display:"flex", gap:6, marginTop:4 }}>
                        <span style={{ fontSize:10, color:"#6B7280" }}>{task.due}</span>
                        <span style={{ fontSize:10, background:priorityBg(task.priority), color:priorityColor(task.priority), fontWeight:700, padding:"1px 7px", borderRadius:100 }}>
                          {task.priority==="high"?(locale==="tr"?"Yüksek":locale==="ar"?"عالي":"High"):task.priority==="medium"?(locale==="tr"?"Orta":locale==="ar"?"متوسط":"Medium"):(locale==="tr"?"Düşük":locale==="ar"?"منخفض":"Low")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div style={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:14, padding:"16px 18px" }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#0A0A0A", marginBottom:14 }}>{l.quickTitle}</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {[
                  { icon:"🧾", color:"#EFF6FF", border:"#BFDBFE", text: l.quick[0] },
                  { icon:"👤", color:"#ECFDF5", border:"#A7F3D0", text: l.quick[1] },
                  { icon:"🔗", color:"#FFFBEB", border:"#FDE68A", text: l.quick[2] },
                  { icon:"📊", color:"#F5F3FF", border:"#DDD6FE", text: l.quick[3] },
                ].map((q,i) => (
                  <button key={i} style={{ background:q.color, border:`1.5px solid ${q.border}`, borderRadius:10, padding:"14px 10px", cursor:"pointer", fontFamily:"inherit", textAlign:"center", transition:"all .15s" }}
                    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,.08)";}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
                    <div style={{ fontSize:22, marginBottom:6 }}>{q.icon}</div>
                    <div style={{ fontSize:11, fontWeight:700, color:"#0A0A0A", lineHeight:1.3 }}>{q.text}</div>
                  </button>
                ))}
              </div>

              {/* Health score */}
              <div style={{ marginTop:14, background:"linear-gradient(135deg,#0F172A,#1E293B)", borderRadius:10, padding:"12px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,.5)", marginBottom:2 }}>
                    {locale==="tr"?"Mali Sağlık":locale==="ar"?"الصحة المالية":"Financial Health"}
                  </div>
                  <div style={{ fontSize:20, fontWeight:900, color:"#4ADE80", fontFamily:"'Nunito Sans',sans-serif" }}>94 / 100</div>
                </div>
                <div style={{ fontSize:28 }}>💚</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @media(max-width:1100px){.kpi-grid{grid-template-columns:repeat(2,1fr)!important}.mid-grid{grid-template-columns:1fr!important}.bot-grid{grid-template-columns:1fr!important}}
        @media(max-width:640px){.kpi-grid{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  );
}