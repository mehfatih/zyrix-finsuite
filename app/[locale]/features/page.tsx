"use client";
import { useLocale } from "next-intl";
import Link from "next/link";

const GOLD = "#B8892A";

const L = {
  tr: {
    badge:  "14 Tamamlanmış Özellik",
    title:  "Her İşletme İhtiyacı İçin Bir Özellik",
    sub:    "Backend + Web + Uygulama üzerinde tamamen inşa edildi. Hepsi kullanıma hazır.",
    cta:    "14 Gün Ücretsiz Başla",
    categories: ["Tümü","Finans","CRM","Yapay Zeka","Ödeme"],
  },
  en: {
    badge:  "14 Completed Features",
    title:  "A Feature for Every Business Need",
    sub:    "Fully built on Backend + Web + App. All ready to use.",
    cta:    "Start Free 14 Days",
    categories: ["All","Finance","CRM","AI","Payments"],
  },
  ar: {
    badge:  "14 ميزة مكتملة",
    title:  "ميزة لكل احتياج تجاري",
    sub:    "مبني بالكامل على Backend + Web + App. كل شيء جاهز للاستخدام.",
    cta:    "ابدأ مجاناً 14 يوماً",
    categories: ["الكل","المالية","CRM","الذكاء الاصطناعي","الدفع"],
  },
};

const FEATURES = [
  {
    icon:"📋", category:"crm", color:"#EFF6FF", border:"#BFDBFE",
    tr:{ name:"Fiyat Teklifleri", desc:"Saniyeler içinde profesyonel teklifler oluşturun ve gönderin. Müşteri online kabul edince otomatik faturaya dönüşür.", detail:["PDF/HTML formatında","Online kabul sistemi","Otomatik faturaya dönüşüm","Teklif şablonları"] },
    en:{ name:"Price Quotes", desc:"Create and send professional quotes in seconds. Automatically converts to invoice when customer accepts online.", detail:["PDF/HTML format","Online acceptance","Auto invoice conversion","Quote templates"] },
    ar:{ name:"عروض الأسعار", desc:"أنشئ وأرسل عروضاً احترافية في ثوانٍ. تتحول تلقائياً لفاتورة عند قبول العميل.", detail:["تنسيق PDF/HTML","قبول إلكتروني","تحويل تلقائي لفاتورة","قوالب العروض"] },
  },
  {
    icon:"📈", category:"crm", color:"#ECFDF5", border:"#A7F3D0",
    tr:{ name:"Satış Pipeline", desc:"Fırsatlardan kapanışa kadar tüm satış sürecini görselleştirin. Hangi anlaşmanın nerede olduğunu her zaman bilin.", detail:["Kanban görünümü","Özel aşamalar","Değer ve olasılık takibi","Satış tahmini"] },
    en:{ name:"Sales Pipeline", desc:"Visualize your entire sales process from opportunities to close. Always know where each deal stands.", detail:["Kanban view","Custom stages","Value & probability tracking","Sales forecasting"] },
    ar:{ name:"خط المبيعات", desc:"تصوير كامل لعملية المبيعات من الفرص حتى الإغلاق.", detail:["عرض Kanban","مراحل مخصصة","تتبع القيمة والاحتمالية","توقع المبيعات"] },
  },
  {
    icon:"⭐", category:"crm", color:"#FFFBEB", border:"#FDE68A",
    tr:{ name:"Müşteri Sadakati", desc:"Puanlarla müşterilerinizi ödüllendirin. Sadakat katmanları oluşturun ve geri dönüş indirimleri sunun.", detail:["Puan sistemi","Sadakat katmanları","Geri dönüş indirimleri","Müşteri portalı"] },
    en:{ name:"Customer Loyalty", desc:"Reward customers with points. Create loyalty tiers and offer return discounts.", detail:["Points system","Loyalty tiers","Return discounts","Customer portal"] },
    ar:{ name:"ولاء العملاء", desc:"كافئ عملاءك بالنقاط. أنشئ مستويات الولاء وقدّم خصومات العودة.", detail:["نظام النقاط","مستويات الولاء","خصومات العودة","بوابة العملاء"] },
  },
  {
    icon:"🤖", category:"ai", color:"#F5F3FF", border:"#DDD6FE",
    tr:{ name:"AI CFO Paneli", desc:"Gemini 2.0 Flash ile şirket verilerinizi analiz edin. Günlük finansal öneriler, nakit akışı tahmini ve anomali tespiti.", detail:["Gemini 2.0 Flash","Nakit akışı tahmini","Anomali tespiti","Haftalık WhatsApp raporu"] },
    en:{ name:"AI CFO Dashboard", desc:"Analyze company data with Gemini 2.0 Flash. Daily financial recommendations, cash flow forecasting, anomaly detection.", detail:["Gemini 2.0 Flash","Cash flow forecasting","Anomaly detection","Weekly WhatsApp report"] },
    ar:{ name:"لوحة AI CFO", desc:"حلل بيانات شركتك بـ Gemini 2.0 Flash. توصيات مالية يومية، توقع التدفق النقدي.", detail:["Gemini 2.0 Flash","توقع التدفق النقدي","كشف الشذوذات","تقرير واتساب أسبوعي"] },
  },
  {
    icon:"🧮", category:"finance", color:"#FFF1F2", border:"#FECDD3",
    tr:{ name:"KDV Motoru", desc:"Türk KDV oranlarını (%1, %10, %20) otomatik hesapla. Tüm faturalarda doğru vergi uygulaması garantili.", detail:["%1/%10/%20 KDV","Otomatik hesaplama","GİB uyumlu","Vergi raporu"] },
    en:{ name:"VAT Engine", desc:"Auto-calculate Turkish VAT rates (1%, 10%, 20%). Guaranteed correct tax on all invoices.", detail:["1%/10%/20% VAT","Auto calculation","GİB compliant","Tax reporting"] },
    ar:{ name:"محرك KDV", desc:"احسب معدلات KDV التركية (1٪، 10٪، 20٪) تلقائياً.", detail:["KDV 1%/10%/20%","حساب تلقائي","متوافق GİB","تقرير ضريبي"] },
  },
  {
    icon:"💰", category:"finance", color:"#ECFDF5", border:"#A7F3D0",
    tr:{ name:"Nakit Akışı Tahmini", desc:"AI destekli 30 günlük likidite tahmini. Potansiyel nakit sıkışıklıklarını önceden öğrenin.", detail:["30 günlük tahmin","AI destekli","Senaryo analizi","Uyarı sistemi"] },
    en:{ name:"Cash Flow Forecast", desc:"AI-powered 30-day liquidity forecast. Learn potential cash crunches in advance.", detail:["30-day forecast","AI powered","Scenario analysis","Alert system"] },
    ar:{ name:"توقع التدفق النقدي", desc:"توقع سيولة 30 يوماً بالذكاء الاصطناعي. تعلم ضغوط النقد المحتملة مسبقاً.", detail:["توقع 30 يوماً","مدعوم بالذكاء الاصطناعي","تحليل السيناريوهات","نظام التنبيه"] },
  },
  {
    icon:"🔔", category:"crm", color:"#EFF6FF", border:"#BFDBFE",
    tr:{ name:"Akıllı Takip", desc:"Geciken müşteriler için otomatik e-posta ve WhatsApp hatırlatmaları. Hiçbir tahsilat fırsatını kaçırmayın.", detail:["E-posta + WhatsApp","Otomatik zamanlama","Kişiselleştirilmiş mesajlar","Takip raporları"] },
    en:{ name:"Smart Follow-up", desc:"Automatic email and WhatsApp reminders for overdue customers. Never miss a collection opportunity.", detail:["Email + WhatsApp","Auto scheduling","Personalized messages","Follow-up reports"] },
    ar:{ name:"المتابعة الذكية", desc:"تذكيرات تلقائية بالبريد والواتساب للعملاء المتأخرين.", detail:["بريد + واتساب","جدولة تلقائية","رسائل مخصصة","تقارير المتابعة"] },
  },
  {
    icon:"✅", category:"crm", color:"#F0FDF4", border:"#BBF7D0",
    tr:{ name:"Görev Yönetimi", desc:"Ekip görevlerini oluşturun, atayın ve takip edin. Müşteri ve faturalarla entegre görev yönetimi.", detail:["Görev atama","Son tarih takibi","Müşteri entegrasyonu","Ekip görünümü"] },
    en:{ name:"Task Management", desc:"Create, assign and track team tasks. Task management integrated with customers and invoices.", detail:["Task assignment","Deadline tracking","Customer integration","Team view"] },
    ar:{ name:"إدارة المهام", desc:"أنشئ وعيّن وتتبع مهام الفريق. إدارة مهام متكاملة مع العملاء والفواتير.", detail:["تعيين المهام","تتبع المواعيد","تكامل العملاء","عرض الفريق"] },
  },
  {
    icon:"💎", category:"crm", color:"#FDF4FF", border:"#E9D5FF",
    tr:{ name:"Komisyon Motoru", desc:"Satış ekibinizin komisyonlarını otomatik hesaplayın. Karmaşık komisyon yapılarını kolayca yönetin.", detail:["Özel kurallar","Satış bazlı hesaplama","Aylık rapor","Çalışan portalı"] },
    en:{ name:"Commission Engine", desc:"Automatically calculate sales team commissions. Easily manage complex commission structures.", detail:["Custom rules","Sales-based calculation","Monthly report","Employee portal"] },
    ar:{ name:"محرك العمولات", desc:"احسب عمولات فريق المبيعات تلقائياً. إدارة هياكل العمولة المعقدة بسهولة.", detail:["قواعد مخصصة","حساب قائم على المبيعات","تقرير شهري","بوابة الموظف"] },
  },
  {
    icon:"📣", category:"crm", color:"#FFFBEB", border:"#FDE68A",
    tr:{ name:"Pazarlama Otomasyonu", desc:"E-posta ve WhatsApp kampanyaları oluşturun. Müşteri segmentlerine göre kişiselleştirilmiş mesajlar gönderin.", detail:["E-posta + WhatsApp","Müşteri segmentasyonu","A/B testi","Analitik raporlar"] },
    en:{ name:"Marketing Automation", desc:"Create email and WhatsApp campaigns. Send personalized messages by customer segment.", detail:["Email + WhatsApp","Customer segmentation","A/B testing","Analytics reports"] },
    ar:{ name:"أتمتة التسويق", desc:"أنشئ حملات بريد وواتساب. أرسل رسائل مخصصة حسب شريحة العملاء.", detail:["بريد + واتساب","تقسيم العملاء","اختبار A/B","تقارير تحليلية"] },
  },
  {
    icon:"🎯", category:"crm", color:"#FFF1F2", border:"#FECDD3",
    tr:{ name:"Kampanya Yönetimi", desc:"Pazarlama kampanyalarınızı oluşturun, yönetin ve performanslarını ölçün.", detail:["Çok kanallı","ROI takibi","Hedef belirleme","Otomatik raporlama"] },
    en:{ name:"Campaign Management", desc:"Create, manage and measure your marketing campaign performance.", detail:["Multi-channel","ROI tracking","Goal setting","Auto reporting"] },
    ar:{ name:"إدارة الحملات", desc:"أنشئ وأدر وقس أداء حملاتك التسويقية.", detail:["متعدد القنوات","تتبع ROI","تحديد الأهداف","تقارير تلقائية"] },
  },
  {
    icon:"🏢", category:"crm", color:"#F0F9FF", border:"#BAE6FD",
    tr:{ name:"Rol Tabanlı Panel", desc:"Her kullanıcı rolüne özel dashboard. Yönetici, satış temsilcisi ve muhasebeci farklı görünümler.", detail:["Özel roller","Yetki yönetimi","Çok kullanıcı","Denetim günlüğü"] },
    en:{ name:"Role-based Dashboard", desc:"Custom dashboard for each user role. Manager, sales rep and accountant see different views.", detail:["Custom roles","Permission management","Multi-user","Audit log"] },
    ar:{ name:"لوحة الصلاحيات", desc:"لوحة مخصصة لكل دور مستخدم. المدير والمبيعات والمحاسب يرون مختلف.", detail:["أدوار مخصصة","إدارة الصلاحيات","متعدد المستخدمين","سجل تدقيق"] },
  },
  {
    icon:"🌐", category:"crm", color:"#ECFDF5", border:"#A7F3D0",
    tr:{ name:"Müşteri Portalı", desc:"Müşterileriniz kendi faturalarını, tekliflerini ve sadakat puanlarını görüntüleyebilir.", detail:["Self-servis portal","Fatura görüntüleme","Ödeme geçmişi","Sadakat puanları"] },
    en:{ name:"Customer Portal", desc:"Customers can view their own invoices, quotes and loyalty points.", detail:["Self-service portal","Invoice viewing","Payment history","Loyalty points"] },
    ar:{ name:"بوابة العملاء", desc:"العملاء يعرضون فواتيرهم وعروضهم ونقاط الولاء بأنفسهم.", detail:["بوابة ذاتية الخدمة","عرض الفواتير","سجل المدفوعات","نقاط الولاء"] },
  },
  {
    icon:"🔗", category:"payments", color:"#EFF6FF", border:"#BFDBFE",
    tr:{ name:"Ödeme Linkleri", desc:"Saniyeler içinde ödeme linki oluşturun ve gönderin. Müşteri linke tıklayarak anında ödeme yapar.", detail:["Anında oluşturma","Güvenli ödeme","Çoklu para birimi","Ödeme bildirimleri"] },
    en:{ name:"Payment Links", desc:"Create and send payment links in seconds. Customer pays instantly by clicking the link.", detail:["Instant creation","Secure payment","Multi-currency","Payment notifications"] },
    ar:{ name:"روابط الدفع", desc:"أنشئ وأرسل روابط دفع في ثوانٍ. العميل يدفع فوراً بالنقر على الرابط.", detail:["إنشاء فوري","دفع آمن","متعدد العملات","إشعارات الدفع"] },
  },
];

export default function FeaturesPage() {
  const locale = useLocale();
  const l      = L[locale as keyof typeof L] ?? L.tr;
  const isRTL  = locale === "ar";

  function getData(f: typeof FEATURES[0]) {
    return locale === "tr" ? f.tr : locale === "ar" ? f.ar : f.en;
  }

  return (
    <div style={{ minHeight:"100vh", background:"#fff", direction: isRTL?"rtl":"ltr" }}>

      {/* Hero */}
      <section style={{ background:"linear-gradient(160deg,#0F172A,#1E3A8A)", padding:"72px 24px 64px", textAlign:"center" }}>
        <div style={{ maxWidth:760, margin:"0 auto" }}>
          <span style={{ display:"inline-block", background:"rgba(255,255,255,.1)", color:"#93C5FD", fontSize:12, fontWeight:700, padding:"5px 14px", borderRadius:100, marginBottom:16 }}>
            {l.badge}
          </span>
          <h1 style={{ fontSize:"clamp(28px,4vw,48px)", fontWeight:900, color:"#fff", marginBottom:12, lineHeight:1.2 }}>
            {l.title}
          </h1>
          <p style={{ fontSize:17, color:"rgba(255,255,255,.75)", marginBottom:28, lineHeight:1.7 }}>{l.sub}</p>
          <Link href={`/${locale}/signup`} style={{ background:"#2563EB", color:"#fff", padding:"14px 32px", borderRadius:10, fontSize:15, fontWeight:800, textDecoration:"none", display:"inline-block" }}>
            {l.cta}
          </Link>
        </div>
      </section>

      {/* Features grid */}
      <section style={{ maxWidth:1200, margin:"0 auto", padding:"64px 24px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }} className="feat-pg-grid">
          {FEATURES.map((f,i) => {
            const d = getData(f);
            return (
              <div key={i} style={{ background:f.color, border:`1.5px solid ${f.border}`, borderRadius:16, padding:24, transition:"all .2s" }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 12px 32px rgba(0,0,0,.09)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
                <div style={{ fontSize:32, marginBottom:14 }}>{f.icon}</div>
                <h3 style={{ fontSize:17, fontWeight:800, color:"#0A0A0A", marginBottom:8 }}>{d.name}</h3>
                <p style={{ fontSize:13, color:"#374151", lineHeight:1.7, marginBottom:16 }}>{d.desc}</p>
                <ul style={{ listStyle:"none", margin:0, padding:0, display:"flex", flexDirection:"column", gap:5 }}>
                  {d.detail.map((item,j) => (
                    <li key={j} style={{ fontSize:12, color:"#374151", display:"flex", gap:6, alignItems:"center" }}>
                      <span style={{ color:"#059669", fontWeight:700 }}>✓</span> {item}
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
        <h2 style={{ fontSize:"clamp(22px,3vw,32px)", fontWeight:900, color:GOLD, marginBottom:10 }}>
          {locale==="tr"?"Tüm özellikler sizin için hazır":locale==="ar"?"كل الميزات جاهزة لك":"All features ready for you"}
        </h2>
        <p style={{ fontSize:15, color:"rgba(255,255,255,.7)", marginBottom:24 }}>
          {locale==="tr"?"14 gün ücretsiz — kredi kartı gerekmez":locale==="ar"?"14 يوماً مجاناً — لا بطاقة ائتمان":"14 days free — no credit card"}
        </p>
        <Link href={`/${locale}/signup`} style={{ background:"#2563EB", color:"#fff", padding:"14px 32px", borderRadius:10, fontSize:15, fontWeight:800, textDecoration:"none", display:"inline-block" }}>
          {l.cta}
        </Link>
      </section>

      <style>{`@media(max-width:900px){.feat-pg-grid{grid-template-columns:repeat(2,1fr)!important}}@media(max-width:560px){.feat-pg-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}