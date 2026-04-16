import { getLocale } from "next-intl/server";
import Link from "next/link";

const GOLD = "#B8892A";

const L = {
  tr: {
    badge:"Şeffaf Fiyatlandırma", title:"KOBİ'ye Uygun Fiyatlar",
    sub:"Taahhüt yok, istediğiniz zaman iptal. 14 gün ücretsiz deneyin.",
    monthly:"Aylık", yearly:"Yıllık", save:"%20 Tasarruf",
    popular:"En Popüler", cta:"Ücretsiz Başla",
    faqTitle:"Sık Sorulan Sorular", allFeats:"Tüm Özellikleri Gör",
    faqs:[
      { q:"Kredi kartı gerekiyor mu?",         a:"Hayır. 14 günlük deneme için kredi kartı gerekmez." },
      { q:"İstediğim zaman iptal edebilir miyim?", a:"Evet. Verileriniz 30 gün saklanır." },
      { q:"Plan değiştirebilir miyim?",         a:"Evet, istediğiniz zaman plan değiştirebilirsiniz." },
      { q:"e-Fatura hangi planlarda var?",      a:"Business ve Pro planlarında mevcuttur." },
    ],
  },
  en: {
    badge:"Transparent Pricing", title:"SME-Friendly Pricing",
    sub:"No commitment, cancel anytime. Try free for 14 days.",
    monthly:"Monthly", yearly:"Yearly", save:"Save 20%",
    popular:"Most Popular", cta:"Start Free",
    faqTitle:"Frequently Asked Questions", allFeats:"See All Features",
    faqs:[
      { q:"Is a credit card required?",    a:"No. No credit card needed for 14-day trial." },
      { q:"Can I cancel anytime?",         a:"Yes. Data kept for 30 days." },
      { q:"Can I switch plans?",           a:"Yes, switch anytime." },
      { q:"Which plans include e-Invoice?",a:"Business and Pro plans." },
    ],
  },
  ar: {
    badge:"تسعير شفاف", title:"أسعار تناسب الشركات الصغيرة",
    sub:"لا التزام، إلغاء في أي وقت. جرّب مجاناً 14 يوماً.",
    monthly:"شهري", yearly:"سنوي", save:"وفر 20٪",
    popular:"الأكثر شعبية", cta:"ابدأ مجاناً",
    faqTitle:"الأسئلة الشائعة", allFeats:"عرض كل الميزات",
    faqs:[
      { q:"هل تطلب بطاقة ائتمان؟",      a:"لا. لا بطاقة مطلوبة لفترة التجربة." },
      { q:"هل يمكنني الإلغاء؟",         a:"نعم. بياناتك تُحفظ 30 يوماً." },
      { q:"هل يمكنني تغيير الخطة؟",     a:"نعم، في أي وقت." },
      { q:"أي الخطط تشمل e-Fatura؟",    a:"خططا Business وPro." },
    ],
  },
};

const PLANS = [
  { key:"starter",  price:19,  highlight:false,
    tr:{ name:"Starter",  tag:"Yeni başlayanlar için",     feats:["3 kullanıcı","500 fatura/ay","Temel AI CFO","Temel CRM","E-posta destek","PDF fatura"] },
    en:{ name:"Starter",  tag:"For new businesses",        feats:["3 users","500 invoices/mo","Basic AI CFO","Basic CRM","Email support","PDF invoice"] },
    ar:{ name:"Starter",  tag:"للشركات الناشئة",           feats:["3 مستخدمين","500 فاتورة/شهر","AI CFO أساسي","CRM أساسي","دعم بريد","فاتورة PDF"] },
  },
  { key:"business", price:45,  highlight:true,
    tr:{ name:"Business", tag:"Büyüyen işletmeler için",   feats:["10 kullanıcı","Sınırsız fatura","Tam AI CFO","Tam CRM (14 özellik)","e-Fatura + KDV","Müşteri portalı","WhatsApp destek","Ödeme linkleri"] },
    en:{ name:"Business", tag:"For growing businesses",    feats:["10 users","Unlimited invoices","Full AI CFO","Full CRM (14 features)","e-Invoice + VAT","Customer portal","WhatsApp support","Payment links"] },
    ar:{ name:"Business", tag:"للشركات المتنامية",         feats:["10 مستخدمين","فواتير غير محدودة","AI CFO كامل","CRM كامل (14 ميزة)","e-Fatura + KDV","بوابة العملاء","دعم واتساب","روابط الدفع"] },
  },
  { key:"pro",      price:65,  highlight:false,
    tr:{ name:"Pro",      tag:"Ölçeklenmek isteyenler için", feats:["Sınırsız kullanıcı","Çoklu şube","Gelişmiş AI tahminler","API + Webhooks","Zapier / Make","Özel hesap yöneticisi","7/24 öncelikli destek"] },
    en:{ name:"Pro",      tag:"For scaling businesses",     feats:["Unlimited users","Multi-branch","Advanced AI forecasts","API + Webhooks","Zapier / Make","Dedicated manager","24/7 priority support"] },
    ar:{ name:"Pro",      tag:"للتوسع والنمو",              feats:["مستخدمون غير محدودون","متعدد الفروع","توقعات AI متقدمة","API + Webhooks","Zapier / Make","مدير حساب مخصص","دعم أولوية 24/7"] },
  },
];

export default async function PricingPage() {
  const locale = await getLocale();
  const l      = L[locale as keyof typeof L] ?? L.tr;
  const isRTL  = locale === "ar";
  function pd(p: typeof PLANS[0]) { return locale==="tr"?p.tr:locale==="ar"?p.ar:p.en; }

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC", direction: isRTL?"rtl":"ltr" }}>
      {/* Hero */}
      <section style={{ background:"linear-gradient(160deg,#0F172A,#1E3A8A)", padding:"64px 24px 48px", textAlign:"center" }}>
        <span style={{ display:"inline-block", background:"rgba(255,255,255,.1)", color:"#93C5FD", fontSize:12, fontWeight:700, padding:"5px 14px", borderRadius:100, marginBottom:14 }}>{l.badge}</span>
        <h1 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:900, color:"#fff", marginBottom:10, lineHeight:1.2 }}>{l.title}</h1>
        <p style={{ fontSize:16, color:"rgba(255,255,255,.75)", lineHeight:1.7, maxWidth:540, margin:"0 auto" }}>{l.sub}</p>
      </section>

      {/* Plans */}
      <section style={{ maxWidth:1060, margin:"-28px auto 0", padding:"0 24px 60px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18, alignItems:"start" }} className="price-pg">
          {PLANS.map(plan => {
            const d = pd(plan);
            return (
              <div key={plan.key} style={{ borderRadius:16, padding:26, position:"relative", border:plan.highlight?"2px solid #2563EB":"1.5px solid #E5E7EB", background:plan.highlight?"#0F172A":"#fff", boxShadow:plan.highlight?"0 20px 60px rgba(37,99,235,.2)":"0 2px 12px rgba(0,0,0,.05)", marginTop:plan.highlight?0:16 }}>
                {plan.highlight && <div style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)", background:"#2563EB", color:"#fff", fontSize:11, fontWeight:700, padding:"5px 16px", borderRadius:100, whiteSpace:"nowrap" }}>{l.popular}</div>}
                <div style={{ fontSize:18, fontWeight:800, color:plan.highlight?"#fff":"#0A0A0A", marginBottom:4 }}>{d.name}</div>
                <div style={{ fontSize:13, color:plan.highlight?"#94A3B8":"#6B7280", marginBottom:16 }}>{d.tag}</div>
                <div style={{ marginBottom:18 }}>
                  <span style={{ fontSize:42, fontWeight:900, color:GOLD, fontFamily:"'Nunito Sans',sans-serif", lineHeight:1 }}><sup style={{ fontSize:20, verticalAlign:"super" }}>$</sup>{plan.price}</span>
                  <span style={{ fontSize:14, color:plan.highlight?"#94A3B8":"#6B7280" }}>/ay</span>
                </div>
                <Link href={`/${locale}/signup`} style={{ display:"block", textAlign:"center", padding:"12px", borderRadius:9, fontSize:14, fontWeight:700, textDecoration:"none", marginBottom:18, background:plan.highlight?"#2563EB":plan.key==="pro"?"#2563EB":"#F1F5F9", color:plan.highlight||plan.key==="pro"?"#fff":"#0A0A0A" }}>{l.cta}</Link>
                <ul style={{ listStyle:"none", margin:0, padding:0 }}>
                  {d.feats.map((f,i)=>(
                    <li key={i} style={{ fontSize:13, padding:"7px 0", display:"flex", gap:8, color:plan.highlight?"#CBD5E1":"#374151", borderTop:`1px solid ${plan.highlight?"#1E293B":"#F3F4F6"}` }}>
                      <span style={{ color:"#059669", fontWeight:700, flexShrink:0 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth:720, margin:"0 auto", padding:"0 24px 64px" }}>
        <h2 style={{ fontSize:26, fontWeight:900, color:GOLD, textAlign:"center", marginBottom:24 }}>{l.faqTitle}</h2>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {l.faqs.map((f,i)=>(
            <div key={i} style={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:12, padding:"16px 18px" }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#0A0A0A", marginBottom:6 }}>{f.q}</div>
              <div style={{ fontSize:13, color:"#4B5563", lineHeight:1.65 }}>{f.a}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign:"center", marginTop:24 }}>
          <Link href={`/${locale}/features`} style={{ color:"#2563EB", fontSize:14, fontWeight:700, textDecoration:"none" }}>{l.allFeats} →</Link>
        </div>
      </section>
      <style>{`@media(max-width:768px){.price-pg{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}