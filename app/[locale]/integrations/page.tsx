"use client";
import { useLocale } from "next-intl";
import Link from "next/link";

const GOLD = "#B8892A";

const L = {
  tr: { badge:"Entegrasyonlar", title:"Mevcut Araçlarınızla Çalışır", sub:"Zyrix, kullandığınız araçlarla sorunsuz entegre olur. Veri silolarına son.", cta:"14 Gün Ücretsiz Başla", categories:["Tümü","Türkiye","Ödeme","Otomasyon","E-ticaret","İletişim"] },
  en: { badge:"Integrations", title:"Works With Your Existing Tools", sub:"Zyrix integrates seamlessly with tools you use. End data silos.", cta:"Start Free 14 Days", categories:["All","Turkey","Payment","Automation","E-commerce","Communication"] },
  ar: { badge:"التكاملات", title:"يعمل مع أدواتك الحالية", sub:"Zyrix يتكامل بسلاسة مع الأدوات التي تستخدمها. نهاية صوامع البيانات.", cta:"ابدأ مجاناً 14 يوماً", categories:["الكل","تركيا","الدفع","أتمتة","تجارة","تواصل"] },
};

const INTEGRATIONS = [
  { icon:"🇹🇷", name:"e-Fatura", category:"turkey", bg:"#EFF6FF", border:"#BFDBFE", color:"#1D4ED8",
    tr:{ tag:"GİB Onaylı", desc:"Türkiye'nin zorunlu e-Fatura sistemine tam entegrasyon. Özel Entegratör üzerinden otomatik gönderim.", steps:["Tek tıkla fatura oluştur","GİB'e otomatik gönder","Onay bildirimi al","e-Arşiv'e kaydet"] },
    en:{ tag:"GİB Approved", desc:"Full integration with Turkey's mandatory e-Invoice system. Auto-sending via Private Integrator.", steps:["Create invoice one-click","Auto-send to GİB","Receive approval","Save to e-Archive"] },
    ar:{ tag:"معتمد GİB", desc:"تكامل كامل مع نظام e-Fatura الإلزامي في تركيا.", steps:["إنشاء فاتورة بنقرة","إرسال تلقائي لـ GİB","استقبال الموافقة","حفظ في e-Archive"] },
  },
  { icon:"🧮", name:"KDV", category:"turkey", bg:"#F0FDF4", border:"#BBF7D0", color:"#065F46",
    tr:{ tag:"Türk Vergi Sistemi", desc:"%1, %10 ve %20 KDV oranları otomatik hesaplanır. GİB beyanname formatında rapor.", steps:["Oran otomatik seçilir","Faturada gösterilir","Aylık rapor hazırlanır","Beyanname formatında"] },
    en:{ tag:"Turkish Tax System", desc:"1%, 10% and 20% VAT rates calculated automatically. Report in GİB declaration format.", steps:["Rate auto-selected","Shown on invoice","Monthly report prepared","Declaration format"] },
    ar:{ tag:"النظام الضريبي التركي", desc:"معدلات KDV 1٪، 10٪ و20٪ تُحسب تلقائياً.", steps:["اختيار تلقائي للمعدل","ظهور في الفاتورة","تقرير شهري","تنسيق الإقرار"] },
  },
  { icon:"💳", name:"iyzico", category:"payment", bg:"#FFF7ED", border:"#FED7AA", color:"#C2410C",
    tr:{ tag:"Ödeme Altyapısı", desc:"Türkiye'nin lider ödeme altyapısıyla entegrasyon. Kredi kartı, havale ve taksit desteği.", steps:["Ödeme linki oluştur","Müşteriye gönder","Anında bildirim al","Otomatik faturala"] },
    en:{ tag:"Payment Infrastructure", desc:"Integration with Turkey's leading payment provider. Credit card, transfer and installment support.", steps:["Create payment link","Send to customer","Get instant notification","Auto-invoice"] },
    ar:{ tag:"بنية الدفع", desc:"تكامل مع مزود الدفع الرائد في تركيا.", steps:["إنشاء رابط دفع","إرسال للعميل","إشعار فوري","فوترة تلقائية"] },
  },
  { icon:"💳", name:"PayTR", category:"payment", bg:"#EFF6FF", border:"#BFDBFE", color:"#1D4ED8",
    tr:{ tag:"Ödeme", desc:"PayTR ile güvenli online ödeme. Tüm kartlar ve banka transferleri desteklenir.", steps:["Entegrasyon 5 dakika","Tüm banka kartları","3D Secure","Anlık bildirim"] },
    en:{ tag:"Payment", desc:"Secure online payment with PayTR. All cards and bank transfers supported.", steps:["5-min integration","All bank cards","3D Secure","Instant notification"] },
    ar:{ tag:"الدفع", desc:"دفع آمن عبر الإنترنت مع PayTR.", steps:["تكامل 5 دقائق","كل بطاقات البنوك","3D Secure","إشعار فوري"] },
  },
  { icon:"⚡", name:"Zapier", category:"automation", bg:"#FFF1F2", border:"#FECDD3", color:"#BE123C",
    tr:{ tag:"Otomasyon", desc:"5000+ uygulamayı Zapier ile bağlayın. Yeni fatura → CRM güncelleme → bildirim zinciri kurun.", steps:["5000+ uygulama","Tetikleyici & Aksiyon","Kod gerekmez","Sınırsız otomasyon"] },
    en:{ tag:"Automation", desc:"Connect 5000+ apps via Zapier. Build new invoice → CRM update → notification chains.", steps:["5000+ apps","Triggers & Actions","No code needed","Unlimited automation"] },
    ar:{ tag:"أتمتة", desc:"ربط 5000+ تطبيق عبر Zapier.", steps:["5000+ تطبيق","مشغلات وإجراءات","لا كود مطلوب","أتمتة غير محدودة"] },
  },
  { icon:"🔧", name:"Make", category:"automation", bg:"#FFFBEB", border:"#FDE68A", color:"#92400E",
    tr:{ tag:"Otomasyon", desc:"Make (eski Integromat) ile karmaşık iş akışları. Görsel akış tasarımcısıyla kolayca kur.", steps:["Görsel akış tasarımı","Çoklu adım","Koşullu mantık","Gerçek zamanlı"] },
    en:{ tag:"Automation", desc:"Complex workflows with Make (formerly Integromat). Easy setup with visual flow designer.", steps:["Visual flow design","Multi-step","Conditional logic","Real-time"] },
    ar:{ tag:"أتمتة", desc:"سير عمل معقدة مع Make.", steps:["تصميم مرئي","متعدد الخطوات","منطق شرطي","فوري"] },
  },
  { icon:"🛒", name:"Shopify", category:"ecommerce", bg:"#ECFDF5", border:"#A7F3D0", color:"#065F46",
    tr:{ tag:"E-Ticaret", desc:"Shopify siparişleri otomatik faturaya dönüşür. Stok ve ödeme takibi tek ekranda.", steps:["Sipariş → Fatura otomatik","Ödeme senkronizasyonu","Stok takibi","İade yönetimi"] },
    en:{ tag:"E-Commerce", desc:"Shopify orders automatically convert to invoices. Inventory and payment tracking on one screen.", steps:["Order → Auto invoice","Payment sync","Inventory tracking","Return management"] },
    ar:{ tag:"تجارة إلكترونية", desc:"طلبات Shopify تتحول تلقائياً لفواتير.", steps:["طلب → فاتورة تلقائية","مزامنة المدفوعات","تتبع المخزون","إدارة الإرجاع"] },
  },
  { icon:"💬", name:"WhatsApp Business", category:"communication", bg:"#F0FDF4", border:"#BBF7D0", color:"#15803D",
    tr:{ tag:"İletişim", desc:"Fatura, ödeme linki ve hatırlatmaları WhatsApp'tan gönderin. Otomatik müşteri bildirimleri.", steps:["Ödeme linki gönder","Fatura paylaş","Otomatik hatırlatma","AI CFO raporu"] },
    en:{ tag:"Communication", desc:"Send invoices, payment links and reminders via WhatsApp. Auto customer notifications.", steps:["Send payment link","Share invoice","Auto reminder","AI CFO report"] },
    ar:{ tag:"تواصل", desc:"أرسل فواتير وروابط دفع وتذكيرات عبر واتساب.", steps:["إرسال رابط دفع","مشاركة الفاتورة","تذكير تلقائي","تقرير AI CFO"] },
  },
  { icon:"📊", name:"Google Sheets", category:"automation", bg:"#EFF6FF", border:"#BFDBFE", color:"#1D4ED8",
    tr:{ tag:"Tablolar", desc:"Zyrix verilerini Google Sheets'e aktarın. Özel raporlar ve analizler için.", steps:["Otomatik veri aktarımı","Gerçek zamanlı güncelleme","Özel formüller","Takım paylaşımı"] },
    en:{ tag:"Spreadsheets", desc:"Export Zyrix data to Google Sheets. For custom reports and analyses.", steps:["Auto data export","Real-time updates","Custom formulas","Team sharing"] },
    ar:{ tag:"جداول", desc:"صدّر بيانات Zyrix لـ Google Sheets.", steps:["تصدير تلقائي","تحديث فوري","صيغ مخصصة","مشاركة الفريق"] },
  },
  { icon:"💳", name:"Param", category:"payment", bg:"#FDF4FF", border:"#E9D5FF", color:"#7E22CE",
    tr:{ tag:"Ödeme", desc:"Param ile hızlı ve güvenli ödeme. Türkiye'de yaygın kullanılan ödeme altyapısı.", steps:["Hızlı entegrasyon","Güvenli ödeme","Türk lirası","Anlık onay"] },
    en:{ tag:"Payment", desc:"Fast and secure payment with Param. Widely used payment infrastructure in Turkey.", steps:["Fast integration","Secure payment","Turkish lira","Instant approval"] },
    ar:{ tag:"الدفع", desc:"دفع سريع وآمن مع Param.", steps:["تكامل سريع","دفع آمن","ليرة تركية","موافقة فورية"] },
  },
];

export default function IntegrationsPage() {
  const locale = useLocale();
  const l      = L[locale as keyof typeof L] ?? L.tr;
  const isRTL  = locale === "ar";

  function getData(int: typeof INTEGRATIONS[0]) {
    return locale === "tr" ? int.tr : locale === "ar" ? int.ar : int.en;
  }

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC", direction: isRTL?"rtl":"ltr" }}>

      {/* Hero */}
      <section style={{ background:"linear-gradient(160deg,#0F172A,#1E3A8A)", padding:"64px 24px 52px", textAlign:"center" }}>
        <span style={{ display:"inline-block", background:"rgba(255,255,255,.1)", color:"#93C5FD", fontSize:12, fontWeight:700, padding:"5px 14px", borderRadius:100, marginBottom:14 }}>{l.badge}</span>
        <h1 style={{ fontSize:"clamp(26px,4vw,44px)", fontWeight:900, color:"#fff", marginBottom:12, lineHeight:1.2 }}>{l.title}</h1>
        <p style={{ fontSize:16, color:"rgba(255,255,255,.75)", lineHeight:1.7, maxWidth:560, margin:"0 auto 28px" }}>{l.sub}</p>
        <Link href={`/${locale}/signup`} style={{ background:"#2563EB", color:"#fff", padding:"13px 28px", borderRadius:10, fontSize:14, fontWeight:800, textDecoration:"none", display:"inline-block" }}>{l.cta}</Link>
      </section>

      {/* Integrations grid */}
      <section style={{ maxWidth:1200, margin:"0 auto", padding:"56px 24px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }} className="int-pg-grid">
          {INTEGRATIONS.map((int,i) => {
            const d = getData(int);
            return (
              <div key={i} style={{ background:int.bg, border:`1.5px solid ${int.border}`, borderRadius:16, padding:22, transition:"all .2s" }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,.09)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                  <div style={{ fontSize:28 }}>{int.icon}</div>
                  <div>
                    <div style={{ fontSize:16, fontWeight:800, color:"#0A0A0A" }}>{int.name}</div>
                    <span style={{ fontSize:11, fontWeight:700, color:int.color, background:`${int.color}18`, padding:"2px 8px", borderRadius:100 }}>{d.tag}</span>
                  </div>
                </div>
                <p style={{ fontSize:13, color:"#374151", lineHeight:1.7, marginBottom:14 }}>{d.desc}</p>
                <ul style={{ listStyle:"none", margin:0, padding:0, display:"flex", flexDirection:"column", gap:5 }}>
                  {d.steps.map((s,j) => (
                    <li key={j} style={{ fontSize:12, color:"#374151", display:"flex", gap:7, alignItems:"center" }}>
                      <span style={{ color:"#059669", fontWeight:700 }}>✓</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background:"#0F172A", padding:"52px 24px", textAlign:"center" }}>
        <h2 style={{ fontSize:26, fontWeight:900, color:GOLD, marginBottom:10 }}>
          {locale==="tr"?"API ile kendi entegrasyonunuzu yapın":locale==="ar"?"أنشئ تكاملك الخاص عبر API":"Build your own integration via API"}
        </h2>
        <p style={{ fontSize:15, color:"rgba(255,255,255,.7)", marginBottom:22 }}>
          {locale==="tr"?"Pro plan ile tam API ve Webhook erişimi":locale==="ar"?"خطة Pro توفر وصول API كامل":"Pro plan includes full API and Webhook access"}
        </p>
        <Link href={`/${locale}/signup`} style={{ background:"#2563EB", color:"#fff", padding:"13px 28px", borderRadius:10, fontSize:14, fontWeight:800, textDecoration:"none", display:"inline-block" }}>{l.cta}</Link>
      </section>

      <style>{`@media(max-width:900px){.int-pg-grid{grid-template-columns:repeat(2,1fr)!important}}@media(max-width:560px){.int-pg-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}