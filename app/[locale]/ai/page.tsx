"use client";
import { useLocale } from "next-intl";
import Link from "next/link";

const GOLD = "#B8892A";

const L = {
  tr: {
    badge: "Yapay Zeka CFO",
    title: "7/24 Çalışan Akıllı CFO'nuz",
    sub: "Gemini 2.0 Flash ile şirketinizin her finansal verisini analiz edin. Türkçe öneriler, gerçek zamanlı tahminler.",
    cta: "14 Gün Ücretsiz Dene",
    howTitle: "Nasıl Çalışır?",
    featTitle: "AI CFO Özellikleri",
    useCaseTitle: "Kullanım Senaryoları",
    steps: [
      { n:"1", t:"Verilerinizi Bağlayın", d:"Mevcut fatura, müşteri ve ödeme verileriniz otomatik senkronize olur." },
      { n:"2", t:"AI Analiz Eder", d:"Gemini 2.0 Flash tüm verilerinizi günlük olarak analiz eder." },
      { n:"3", t:"Öneriler Alın", d:"Her sabah Türkçe finansal özet ve aksiyon önerileri inbox'ınızda." },
    ],
    feats: [
      { icon:"💬", t:"Türkçe Sohbet Asistanı", d:"Şirketinizle ilgili her soruyu sohbet ederek sorun. Anında yanıt alın." },
      { icon:"💰", t:"Nakit Akışı Tahmini", d:"Önümüzdeki 30 gün için %85+ doğrulukta likidite tahmini." },
      { icon:"🚨", t:"Anomali Tespiti", d:"Olağandışı harcamalar, gecikmiş ödemeler ve nakit riskleri otomatik tespit edilir." },
      { icon:"📱", t:"Haftalık WhatsApp Raporu", d:"Her Pazartesi sabahı şirket sağlık özeti doğrudan WhatsApp'ınıza." },
      { icon:"📈", t:"Gelir Büyüme Analizi", d:"Hangi müşteri, hangi ürün veya hizmet en fazla katkıyı sağlıyor?" },
      { icon:"🎯", t:"Hedef Takibi", d:"Aylık gelir, tahsilat ve gider hedeflerinize ne kadar yakınsınız?" },
    ],
    useCases: [
      { icon:"🏪", sector:"Restoran", q:"Bu ay en karlı masam hangisi?", a:"Masa 7 ortalama ₺850 harcama ile en yüksek kâr marjını sağlıyor. Çarşamba akşamları yoğunluk %40 düşük — kampanya önerim var." },
      { icon:"🛍️", sector:"Perakende", q:"Envanterim ne zaman tükeniyor?", a:"Mevcut satış hızında A ürünü 12 gün, B ürünü 8 gün içinde tükeniyor. Sipariş verme zamanı geldi." },
      { icon:"🔧", sector:"Hizmet", q:"En çok geciken müşterim kim?", a:"Akay Ltd. ortalama 34 gün gecikiyor ve toplam ₺28,400 bekliyor. Otomatik hatırlatma göndereyim mi?" },
    ],
  },
  en: {
    badge: "AI CFO",
    title: "Your 24/7 Smart CFO",
    sub: "Analyze every financial data of your company with Gemini 2.0 Flash. Turkish recommendations, real-time forecasts.",
    cta: "Try Free 14 Days",
    howTitle: "How It Works",
    featTitle: "AI CFO Features",
    useCaseTitle: "Use Cases",
    steps: [
      { n:"1", t:"Connect Your Data", d:"Existing invoices, customer and payment data sync automatically." },
      { n:"2", t:"AI Analyzes", d:"Gemini 2.0 Flash analyzes all your data daily." },
      { n:"3", t:"Get Recommendations", d:"Every morning, Turkish financial summary and action items in your inbox." },
    ],
    feats: [
      { icon:"💬", t:"Turkish Chat Assistant", d:"Ask any question about your company via chat. Get instant answers." },
      { icon:"💰", t:"Cash Flow Forecast", d:"85%+ accuracy liquidity forecast for next 30 days." },
      { icon:"🚨", t:"Anomaly Detection", d:"Unusual expenses, late payments and cash risks detected automatically." },
      { icon:"📱", t:"Weekly WhatsApp Report", d:"Company health summary delivered to your WhatsApp every Monday morning." },
      { icon:"📈", t:"Revenue Growth Analysis", d:"Which customer, product or service contributes most?" },
      { icon:"🎯", t:"Goal Tracking", d:"How close are you to monthly revenue, collection and expense targets?" },
    ],
    useCases: [
      { icon:"🏪", sector:"Restaurant", q:"Which table was most profitable this month?", a:"Table 7 provides highest profit margin with avg ₺850 spend. Wednesday evenings 40% less busy — I have a campaign suggestion." },
      { icon:"🛍️", sector:"Retail", q:"When will my inventory run out?", a:"At current sales speed, product A runs out in 12 days, B in 8 days. Time to reorder." },
      { icon:"🔧", sector:"Services", q:"Who is my most delayed customer?", a:"Akay Ltd. averages 34 days late with ₺28,400 pending. Should I send auto-reminders?" },
    ],
  },
  ar: {
    badge: "AI CFO",
    title: "مستشارك المالي الذكي 24/7",
    sub: "حلل كل بيانات شركتك المالية بـ Gemini 2.0 Flash. توصيات بالتركية والعربية، توقعات فورية.",
    cta: "جرّب مجاناً 14 يوماً",
    howTitle: "كيف يعمل؟",
    featTitle: "ميزات AI CFO",
    useCaseTitle: "حالات الاستخدام",
    steps: [
      { n:"1", t:"اربط بياناتك", d:"الفواتير والعملاء والمدفوعات الموجودة تُزامن تلقائياً." },
      { n:"2", t:"AI يحلل", d:"Gemini 2.0 Flash يحلل كل بياناتك يومياً." },
      { n:"3", t:"احصل على التوصيات", d:"كل صباح، ملخص مالي وتوصيات عمل في صندوقك الوارد." },
    ],
    feats: [
      { icon:"💬", t:"مساعد محادثة", d:"اسأل أي سؤال عن شركتك عبر المحادثة. احصل على إجابات فورية." },
      { icon:"💰", t:"توقع التدفق النقدي", d:"توقع سيولة بدقة 85%+ للـ 30 يوماً القادمة." },
      { icon:"🚨", t:"كشف الشذوذات", d:"المصاريف غير المعتادة والمدفوعات المتأخرة تُكشف تلقائياً." },
      { icon:"📱", t:"تقرير واتساب أسبوعي", d:"ملخص صحة الشركة يصل واتساب كل إثنين صباحاً." },
      { icon:"📈", t:"تحليل نمو الإيرادات", d:"أي عميل أو منتج أو خدمة يساهم أكثر؟" },
      { icon:"🎯", t:"تتبع الأهداف", d:"كم أنت قريب من أهداف الإيراد والتحصيل الشهرية؟" },
    ],
    useCases: [
      { icon:"🏪", sector:"مطعم", q:"أي طاولة كانت الأكثر ربحاً هذا الشهر؟", a:"الطاولة 7 توفر أعلى هامش ربح بمتوسط إنفاق ₺850. أربعاء المساء أقل ازدحاماً بـ 40٪ — لدي اقتراح حملة." },
      { icon:"🛍️", sector:"تجزئة", q:"متى ينفد مخزوني؟", a:"بالسرعة الحالية، المنتج A ينفد خلال 12 يوماً، B خلال 8 أيام. حان وقت إعادة الطلب." },
      { icon:"🔧", sector:"خدمات", q:"من أكثر عملائي تأخراً؟", a:"Akay Ltd. متأخر 34 يوماً بمتوسط و₺28,400 معلقة. هل أرسل تذكيرات تلقائية؟" },
    ],
  },
};

export default function AIPage() {
  const locale = useLocale();
  const l      = L[locale as keyof typeof L] ?? L.tr;
  const isRTL  = locale === "ar";

  return (
    <div style={{ minHeight:"100vh", background:"#fff", direction: isRTL?"rtl":"ltr" }}>

      {/* Hero */}
      <section style={{ background:"linear-gradient(160deg,#0F172A,#1E1B4B)", padding:"72px 24px 64px" }}>
        <div style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"center" }} className="ai-hero">
          <div>
            <span style={{ display:"inline-block", background:"rgba(124,58,237,.2)", color:"#C4B5FD", fontSize:12, fontWeight:700, padding:"5px 14px", borderRadius:100, marginBottom:16 }}>{l.badge}</span>
            <h1 style={{ fontSize:"clamp(28px,4vw,46px)", fontWeight:900, color:"#fff", marginBottom:14, lineHeight:1.2 }}>{l.title}</h1>
            <p style={{ fontSize:16, color:"rgba(255,255,255,.75)", lineHeight:1.75, marginBottom:28 }}>{l.sub}</p>
            <Link href={`/${locale}/signup`} style={{ background:"#7C3AED", color:"#fff", padding:"14px 28px", borderRadius:10, fontSize:15, fontWeight:800, textDecoration:"none", display:"inline-block" }}>{l.cta}</Link>
          </div>

          {/* Chat mockup */}
          <div style={{ background:"#F8FAFC", borderRadius:16, border:"1px solid #E2E8F0", overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,.3)" }}>
            <div style={{ background:"#7C3AED", padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:32, height:32, background:"rgba(255,255,255,.2)", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>🤖</div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:"#fff" }}>AI CFO — Zyrix</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,.7)", display:"flex", alignItems:"center", gap:4 }}>
                  <span style={{ width:6, height:6, borderRadius:"50%", background:"#4ADE80", display:"inline-block" }} />
                  {locale==="tr"?"Şimdi çevrimiçi":locale==="ar"?"متصل الآن":"Online now"}
                </div>
              </div>
            </div>
            <div style={{ padding:"16px 14px", display:"flex", flexDirection:"column", gap:10 }}>
              {l.useCases.slice(0,1).map((uc,i)=>(
                <div key={i}>
                  <div style={{ alignSelf:"flex-start", marginBottom:8 }}>
                    <div style={{ padding:"10px 14px", background:"#7C3AED", color:"#fff", borderRadius:"16px 16px 4px 16px", fontSize:13, lineHeight:1.55, maxWidth:"85%", fontWeight:500 }}>
                      {uc.q}
                    </div>
                  </div>
                  <div style={{ alignSelf:"flex-end" }}>
                    <div style={{ padding:"10px 14px", background:"#fff", color:"#1A1A1A", border:"1px solid #E2E8F0", borderRadius:"16px 16px 16px 4px", fontSize:13, lineHeight:1.65, boxShadow:"0 2px 8px rgba(0,0,0,.06)" }}>
                      <strong style={{ color:"#7C3AED", fontSize:12, display:"block", marginBottom:3 }}>AI CFO:</strong>
                      {uc.a}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background:"#F8FAFC", padding:"64px 24px" }}>
        <div style={{ maxWidth:900, margin:"0 auto", textAlign:"center" }}>
          <h2 style={{ fontSize:"clamp(22px,3vw,32px)", fontWeight:900, color:GOLD, marginBottom:36 }}>{l.howTitle}</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }} className="how-grid">
            {l.steps.map((s,i)=>(
              <div key={i} style={{ textAlign:"center" }}>
                <div style={{ width:48, height:48, borderRadius:"50%", background:"#7C3AED", color:"#fff", fontSize:20, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>{s.n}</div>
                <h3 style={{ fontSize:16, fontWeight:800, color:"#0A0A0A", marginBottom:8 }}>{s.t}</h3>
                <p style={{ fontSize:13, color:"#374151", lineHeight:1.7, margin:0 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth:1100, margin:"0 auto", padding:"64px 24px" }}>
        <h2 style={{ fontSize:"clamp(22px,3vw,32px)", fontWeight:900, color:GOLD, marginBottom:32, textAlign:"center" }}>{l.featTitle}</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }} className="ai-feat-grid">
          {l.feats.map((f,i)=>(
            <div key={i} style={{ background:"#F5F3FF", border:"1.5px solid #DDD6FE", borderRadius:14, padding:22, transition:"all .2s" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(124,58,237,.12)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
              <div style={{ fontSize:28, marginBottom:12 }}>{f.icon}</div>
              <h3 style={{ fontSize:15, fontWeight:800, color:"#0A0A0A", marginBottom:7 }}>{f.t}</h3>
              <p style={{ fontSize:13, color:"#374151", lineHeight:1.65, margin:0 }}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section style={{ background:"#0F172A", padding:"64px 24px" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <h2 style={{ fontSize:"clamp(22px,3vw,30px)", fontWeight:900, color:GOLD, textAlign:"center", marginBottom:32 }}>{l.useCaseTitle}</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {l.useCases.map((uc,i)=>(
              <div key={i} style={{ background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:14, padding:20 }}>
                <div style={{ display:"flex", gap:10, marginBottom:12, alignItems:"center" }}>
                  <span style={{ fontSize:22 }}>{uc.icon}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:"#C4B5FD", textTransform:"uppercase", letterSpacing:".5px" }}>{uc.sector}</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }} className="uc-grid">
                  <div style={{ background:"rgba(124,58,237,.15)", border:"1px solid rgba(124,58,237,.3)", borderRadius:10, padding:"12px 14px" }}>
                    <div style={{ fontSize:10, color:"#C4B5FD", fontWeight:700, marginBottom:5 }}>
                      {locale==="tr"?"Kullanıcı":locale==="ar"?"المستخدم":"User"}
                    </div>
                    <div style={{ fontSize:13, color:"#fff" }}>{uc.q}</div>
                  </div>
                  <div style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:10, padding:"12px 14px" }}>
                    <div style={{ fontSize:10, color:"#4ADE80", fontWeight:700, marginBottom:5 }}>AI CFO</div>
                    <div style={{ fontSize:13, color:"rgba(255,255,255,.8)", lineHeight:1.6 }}>{uc.a}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign:"center", marginTop:32 }}>
            <Link href={`/${locale}/signup`} style={{ background:"#7C3AED", color:"#fff", padding:"14px 32px", borderRadius:10, fontSize:15, fontWeight:800, textDecoration:"none", display:"inline-block" }}>{l.cta}</Link>
          </div>
        </div>
      </section>

      <style>{`
        @media(max-width:860px){.ai-hero{grid-template-columns:1fr!important}.how-grid{grid-template-columns:1fr!important}.ai-feat-grid{grid-template-columns:repeat(2,1fr)!important}.uc-grid{grid-template-columns:1fr!important}}
        @media(max-width:560px){.ai-feat-grid{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  );
}