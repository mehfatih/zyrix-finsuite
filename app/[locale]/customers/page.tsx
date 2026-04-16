"use client";
import { useLocale } from "next-intl";
import Link from "next/link";

const GOLD = "#B8892A";

const L = {
  tr: { badge:"Müşteri Hikayeleri", title:"Gerçek Şirketler, Gerçek Sonuçlar", sub:"Zyrix'i kullanan işletmelerin deneyimlerini ve elde ettikleri sonuçları keşfedin.", cta:"Siz de Başlayın", statsTitle:"Ortalama Sonuçlar" },
  en: { badge:"Customer Stories", title:"Real Companies, Real Results", sub:"Discover the experiences and results of businesses using Zyrix.", cta:"Get Started Too", statsTitle:"Average Results" },
  ar: { badge:"قصص العملاء", title:"شركات حقيقية، نتائج حقيقية", sub:"اكتشف تجارب ونتائج الشركات التي تستخدم Zyrix.", cta:"ابدأ أنت أيضاً", statsTitle:"متوسط النتائج" },
};

const AVG_STATS = [
  { val:"80%", tr:"Muhasebe süresinde azalma", en:"Reduction in accounting time", ar:"تقليل في وقت المحاسبة" },
  { val:"34%", tr:"Satışlarda artış (CRM ile)", en:"Sales increase (with CRM)", ar:"زيادة المبيعات (مع CRM)" },
  { val:"₺28K", tr:"Aylık ortalama ek tahsilat", en:"Monthly avg extra collections", ar:"متوسط التحصيلات الإضافية الشهرية" },
  { val:"3 Gün", tr:"Ortalama başabaş noktası", en:"Average break-even point", ar:"متوسط نقطة التعادل" },
];

const STORIES = [
  { avatar:"AY", bg:"#DBEAFE", color:"#1D4ED8", sector:"🍽️", sectorKey:"Restoran",
    tr:{ name:"Ahmet Yılmaz", title:"Genel Müdür — Yılmaz Restoran Grubu", location:"İstanbul • 5 Şube", challenge:"5 şubenin muhasebesini ayrı ayrı tutmak hem zaman alıyor hem hata yapılıyordu.", solution:"Zyrix ile tüm şubeleri tek ekrandan yönetiyoruz. KDV raporları otomatik, e-Fatura sistem entegreli.", result:"Aylık muhasebe süresi 3 günden 4 saate düştü. Muhasebecimize ödediğimiz ücret %60 azaldı.", metrics:[{v:"80%",l:"Zaman tasarrufu"},{v:"₺18K",l:"Aylık tasarruf"},{v:"5",l:"Şube"},{v:"60%",l:"Muhasebe maliyeti"}] },
    en:{ name:"Ahmet Yılmaz", title:"General Manager — Yılmaz Restaurant Group", location:"Istanbul • 5 Branches", challenge:"Managing accounting for 5 branches separately was time-consuming and error-prone.", solution:"We manage all branches from one screen with Zyrix. VAT reports automatic, e-Invoice integrated.", result:"Monthly accounting time dropped from 3 days to 4 hours. Accountant fees reduced 60%.", metrics:[{v:"80%",l:"Time saved"},{v:"₺18K",l:"Monthly savings"},{v:"5",l:"Branches"},{v:"60%",l:"Accounting cost"}] },
    ar:{ name:"أحمد يلماز", title:"المدير العام — مجموعة مطاعم يلماز", location:"إسطنبول • 5 فروع", challenge:"إدارة محاسبة 5 فروع منفصلة كانت مستهلكة للوقت وعرضة للأخطاء.", solution:"نحن الآن ندير كل الفروع من شاشة واحدة مع Zyrix. تقارير KDV تلقائية.", result:"وقت المحاسبة الشهري انخفض من 3 أيام إلى 4 ساعات. رسوم المحاسب انخفضت 60٪.", metrics:[{v:"80%",l:"توفير الوقت"},{v:"₺18K",l:"وفر شهري"},{v:"5",l:"فروع"},{v:"60%",l:"تكلفة المحاسبة"}] },
  },
  { avatar:"ZK", bg:"#ECFDF5", color:"#065F46", sector:"🛍️", sectorKey:"E-Ticaret",
    tr:{ name:"Zeynep Kara", title:"CEO — Kara E-Ticaret", location:"Ankara", challenge:"Shopify siparişlerini manuel faturaya dönüştürmek için günde 2 saat harcıyorduk.", solution:"Zapier + Shopify + Zyrix entegrasyonuyla sipariş gelir gelmez otomatik fatura oluşuyor.", result:"Günlük 2 saat kurtarıldı. Fatura hataları sıfıra indi. 3 kişilik ekip 1 kişiyle yönetilebilir hale geldi.", metrics:[{v:"100%",l:"Otomasyon"},{v:"2 Sa/Gün",l:"Kurtarılan süre"},{v:"0",l:"Fatura hatası"},{v:"₺12K",l:"Aylık tasarruf"}] },
    en:{ name:"Zeynep Kara", title:"CEO — Kara E-Commerce", location:"Ankara", challenge:"We spent 2 hours daily manually converting Shopify orders to invoices.", solution:"With Zapier + Shopify + Zyrix integration, invoice is created automatically when order arrives.", result:"2 hours saved daily. Invoice errors dropped to zero. 3-person team now manageable with 1.", metrics:[{v:"100%",l:"Automation"},{v:"2h/Day",l:"Time saved"},{v:"0",l:"Invoice errors"},{v:"₺12K",l:"Monthly savings"}] },
    ar:{ name:"زينب قارا", title:"الرئيس التنفيذي — Kara E-Commerce", location:"أنقرة", challenge:"كنا نقضي ساعتين يومياً لتحويل طلبات Shopify يدوياً لفواتير.", solution:"مع تكامل Zapier + Shopify + Zyrix، تُنشأ الفاتورة تلقائياً عند وصول الطلب.", result:"توفير ساعتين يومياً. أخطاء الفواتير انخفضت للصفر.", metrics:[{v:"100%",l:"أتمتة"},{v:"2 ساعة",l:"توفير يومي"},{v:"0",l:"أخطاء فواتير"},{v:"₺12K",l:"وفر شهري"}] },
  },
  { avatar:"MÖ", bg:"#FEF3C7", color:"#92400E", sector:"🔧", sectorKey:"Hizmet",
    tr:{ name:"Mehmet Öztürk", title:"Satış Direktörü — Öztürk Servis", location:"İzmir", challenge:"CRM yoktu, müşteri takibi Excel'de yapılıyordu. Teklifler takipsiz kalıyordu.", solution:"Zyrix CRM ile 120 müşteriyi yönetiyoruz. Satış pipeline görünür, otomatik hatırlatmalar çalışıyor.", result:"Satışlar 6 ayda %34 arttı. Kaçırılan teklif sayısı 0'a indi. NPS puanı 72'den 91'e çıktı.", metrics:[{v:"34%",l:"Satış artışı"},{v:"0",l:"Kaçırılan teklif"},{v:"120",l:"Aktif müşteri"},{v:"91",l:"NPS Puanı"}] },
    en:{ name:"Mehmet Öztürk", title:"Sales Director — Öztürk Service", location:"Izmir", challenge:"No CRM, customer tracking was in Excel. Proposals were untracked.", solution:"Managing 120 customers with Zyrix CRM. Sales pipeline visible, auto-reminders working.", result:"Sales grew 34% in 6 months. Missed proposals dropped to 0. NPS score went from 72 to 91.", metrics:[{v:"34%",l:"Sales growth"},{v:"0",l:"Missed proposals"},{v:"120",l:"Active customers"},{v:"91",l:"NPS Score"}] },
    ar:{ name:"محمد أوزتورك", title:"مدير المبيعات — Öztürk Service", location:"إزمير", challenge:"لا CRM، تتبع العملاء كان في Excel. العروض تبقى دون متابعة.", solution:"نحن الآن ندير 120 عميلاً مع CRM Zyrix. خط المبيعات مرئي.", result:"المبيعات نمت 34٪ في 6 أشهر. العروض الضائعة انخفضت للصفر.", metrics:[{v:"34%",l:"نمو المبيعات"},{v:"0",l:"عروض ضائعة"},{v:"120",l:"عملاء نشطون"},{v:"91",l:"NPS"} ] },
  },
];

export default function CustomersPage() {
  const locale = useLocale();
  const l      = L[locale as keyof typeof L] ?? L.tr;
  const isRTL  = locale === "ar";

  function getData(s: typeof STORIES[0]) {
    return locale === "tr" ? s.tr : locale === "ar" ? s.ar : s.en;
  }

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC", direction: isRTL?"rtl":"ltr" }}>

      {/* Hero */}
      <section style={{ background:"linear-gradient(160deg,#0F172A,#1E3A8A)", padding:"64px 24px 52px", textAlign:"center" }}>
        <span style={{ display:"inline-block", background:"rgba(255,255,255,.1)", color:"#93C5FD", fontSize:12, fontWeight:700, padding:"5px 14px", borderRadius:100, marginBottom:14 }}>{l.badge}</span>
        <h1 style={{ fontSize:"clamp(26px,4vw,42px)", fontWeight:900, color:"#fff", marginBottom:12 }}>{l.title}</h1>
        <p style={{ fontSize:16, color:"rgba(255,255,255,.75)", maxWidth:520, margin:"0 auto" }}>{l.sub}</p>
      </section>

      {/* Avg stats */}
      <section style={{ maxWidth:900, margin:"-24px auto 0", padding:"0 24px 48px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }} className="cust-stats">
          {AVG_STATS.map((s,i)=>(
            <div key={i} style={{ background:"#fff", border:"1.5px solid #E5E7EB", borderRadius:14, padding:"16px 14px", textAlign:"center", boxShadow:"0 2px 8px rgba(0,0,0,.05)" }}>
              <div style={{ fontSize:28, fontWeight:900, color:GOLD, fontFamily:"'Nunito Sans',sans-serif", marginBottom:5 }}>{s.val}</div>
              <div style={{ fontSize:12, color:"#374151", fontWeight:600 }}>{locale==="tr"?s.tr:locale==="ar"?s.ar:s.en}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Stories */}
      <section style={{ maxWidth:1000, margin:"0 auto", padding:"0 24px 64px" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:28 }}>
          {STORIES.map((story,i)=>{
            const d = getData(story);
            return (
              <div key={i} style={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:20, padding:32, boxShadow:"0 2px 12px rgba(0,0,0,.05)" }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:28, alignItems:"start" }} className="story-grid">
                  <div>
                    {/* Author */}
                    <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:18 }}>
                      <div style={{ width:50, height:50, borderRadius:"50%", background:story.bg, color:story.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:800, flexShrink:0 }}>{story.avatar}</div>
                      <div>
                        <div style={{ fontSize:15, fontWeight:800, color:"#0A0A0A" }}>{d.name}</div>
                        <div style={{ fontSize:12, color:"#6B7280" }}>{d.title}</div>
                        <div style={{ fontSize:11, color:"#9CA3AF" }}>{d.location}</div>
                      </div>
                      <span style={{ marginLeft:"auto", fontSize:20 }}>{story.sector}</span>
                    </div>

                    {/* Challenge → Solution → Result */}
                    {[
                      { label: locale==="tr"?"🔴 Sorun":locale==="ar"?"🔴 المشكلة":"🔴 Challenge", text:d.challenge, bg:"#FEF2F2", border:"#FECACA" },
                      { label: locale==="tr"?"🔵 Çözüm":locale==="ar"?"🔵 الحل":"🔵 Solution", text:d.solution, bg:"#EFF6FF", border:"#BFDBFE" },
                      { label: locale==="tr"?"🟢 Sonuç":locale==="ar"?"🟢 النتيجة":"🟢 Result", text:d.result, bg:"#ECFDF5", border:"#A7F3D0" },
                    ].map((item,j)=>(
                      <div key={j} style={{ background:item.bg, border:`1px solid ${item.border}`, borderRadius:10, padding:"10px 13px", marginBottom:9 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:"#374151", marginBottom:4, textTransform:"uppercase", letterSpacing:".3px" }}>{item.label}</div>
                        <div style={{ fontSize:13, color:"#0A0A0A", lineHeight:1.65 }}>{item.text}</div>
                      </div>
                    ))}
                  </div>

                  {/* Metrics */}
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#6B7280", marginBottom:12, textTransform:"uppercase", letterSpacing:".5px" }}>
                      {locale==="tr"?"Ölçülebilir Sonuçlar":locale==="ar"?"نتائج قابلة للقياس":"Measurable Results"}
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      {d.metrics.map((m,j)=>(
                        <div key={j} style={{ background:story.bg, border:`1.5px solid ${story.color}30`, borderRadius:12, padding:"14px 12px", textAlign:"center" }}>
                          <div style={{ fontSize:24, fontWeight:900, color:story.color, fontFamily:"'Nunito Sans',sans-serif", marginBottom:4 }}>{m.v}</div>
                          <div style={{ fontSize:11, color:"#374151", fontWeight:600 }}>{m.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background:"#2563EB", padding:"52px 24px", textAlign:"center" }}>
        <h2 style={{ fontSize:26, fontWeight:900, color:"#fff", marginBottom:10 }}>{l.cta}</h2>
        <p style={{ fontSize:15, color:"rgba(255,255,255,.8)", marginBottom:22 }}>
          {locale==="tr"?"14 gün ücretsiz — kredi kartı gerekmez":locale==="ar"?"14 يوماً مجاناً — لا بطاقة ائتمان":"14 days free — no credit card"}
        </p>
        <Link href={`/${locale}/signup`} style={{ background:"#fff", color:"#2563EB", padding:"13px 32px", borderRadius:10, fontSize:15, fontWeight:800, textDecoration:"none", display:"inline-block" }}>{l.cta}</Link>
      </section>

      <style>{`@media(max-width:860px){.story-grid{grid-template-columns:1fr!important}.cust-stats{grid-template-columns:repeat(2,1fr)!important}}`}</style>
    </div>
  );
}