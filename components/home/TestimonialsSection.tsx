"use client";
import { useLocale, useTranslations } from "next-intl";

const GOLD = "#B8892A";

/* 5 demo companies — replace with real data when ready */
const COMPANIES = [
  {
    avatar: "AY",
    avatarBg: "#DBEAFE",
    avatarColor: "#1D4ED8",
    tr: {
      name: "Ahmet Yılmaz",
      title: "Genel Müdür",
      company: "Yılmaz Tekstil A.Ş.",
      sector: "Üretim • İstanbul",
      text: "Zyrix ile aylık raporlama süremizi 3 günden 2 saate indirdik. Yapay Zeka CFO'su her Pazartesi sabahı bize haftalık finansal özet gönderiyor — artık işimizi değil rakamları takip ediyoruz.",
    },
    en: {
      name: "Ahmet Yılmaz",
      title: "General Manager",
      company: "Yılmaz Tekstil A.Ş.",
      sector: "Manufacturing • Istanbul",
      text: "With Zyrix we reduced our monthly reporting from 3 days to 2 hours. The AI CFO sends us a weekly financial summary every Monday morning — now we track our business, not numbers.",
    },
    ar: {
      name: "أحمد يلماز",
      title: "المدير العام",
      company: "Yılmaz Tekstil A.Ş.",
      sector: "تصنيع • إسطنبول",
      text: "مع Zyrix قللنا وقت التقارير الشهرية من 3 أيام إلى ساعتين. AI CFO يرسل لنا ملخصاً مالياً كل صباح اثنين — الآن نتابع أعمالنا وليس الأرقام.",
    },
    stars: 5,
  },
  {
    avatar: "ZK",
    avatarBg: "#ECFDF5",
    avatarColor: "#065F46",
    tr: {
      name: "Zeynep Kara",
      title: "Kurucu Ortak",
      company: "Kara Gıda Zinciri",
      sector: "Restoran • Ankara",
      text: "5 şubemiz var ve hepsinin muhasebesini ayrı ayrı takip etmek kabusdu. Zyrix'te tüm şubeleri tek ekranda görüyorum, KDV raporları otomatik hazırlanıyor. Muhasebecime ödediğim ücret %60 düştü.",
    },
    en: {
      name: "Zeynep Kara",
      title: "Co-Founder",
      company: "Kara Gıda Zinciri",
      sector: "Restaurant • Ankara",
      text: "We have 5 branches and tracking accounting separately was a nightmare. With Zyrix I see all branches on one screen, VAT reports are auto-generated. My accountant fees dropped 60%.",
    },
    ar: {
      name: "زينب قارا",
      title: "شريك مؤسس",
      company: "Kara Gıda Zinciri",
      sector: "مطاعم • أنقرة",
      text: "لدينا 5 فروع وكان متابعة محاسبة كل فرع كابوساً. مع Zyrix أرى كل الفروع في شاشة واحدة، تقارير KDV تُعد تلقائياً. رسوم المحاسب انخفضت 60٪.",
    },
    stars: 5,
  },
  {
    avatar: "MÖ",
    avatarBg: "#FEF3C7",
    avatarColor: "#92400E",
    tr: {
      name: "Mehmet Öztürk",
      title: "Satış Direktörü",
      company: "Öztürk İnşaat Ltd.",
      sector: "İnşaat • İzmir",
      text: "CRM modülü müşteri takibimizi tamamen değiştirdi. Artık hangi müşterinin hangi aşamada olduğunu biliyorum, otomatik hatırlatmalar sayesinde hiçbir teklif takipsiz kalmıyor. Satışlarımız %34 arttı.",
    },
    en: {
      name: "Mehmet Öztürk",
      title: "Sales Director",
      company: "Öztürk İnşaat Ltd.",
      sector: "Construction • Izmir",
      text: "The CRM module completely changed our customer tracking. Now I know which customer is at which stage, automatic reminders ensure no proposal goes untracked. Our sales increased 34%.",
    },
    ar: {
      name: "محمد أوزتورك",
      title: "مدير المبيعات",
      company: "Öztürk İnşaat Ltd.",
      sector: "إنشاء • إزمير",
      text: "وحدة CRM غيّرت تتبع عملائنا بالكامل. الآن أعرف أي عميل في أي مرحلة، التذكيرات التلقائية تضمن عدم إهمال أي عرض. مبيعاتنا ارتفعت 34٪.",
    },
    stars: 5,
  },
  {
    avatar: "SA",
    avatarBg: "#F5F3FF",
    avatarColor: "#5B21B6",
    tr: {
      name: "Selin Arslan",
      title: "Finans Müdürü",
      company: "Arslan Danışmanlık",
      sector: "Danışmanlık • Bursa",
      text: "e-Fatura entegrasyonu için ayrı bir yazılım kullanıyorduk, ayrıca CRM için başka bir yazılım. Zyrix ikisini birleştirdi ve ayda 3 farklı abonelik ücretinden kurtulduk. Tek platform, her şey.",
    },
    en: {
      name: "Selin Arslan",
      title: "Finance Manager",
      company: "Arslan Danışmanlık",
      sector: "Consulting • Bursa",
      text: "We used separate software for e-Invoice and another for CRM. Zyrix combined both and we saved 3 different subscription fees monthly. One platform, everything.",
    },
    ar: {
      name: "سيلين أرسلان",
      title: "مدير المالية",
      company: "Arslan Danışmanlık",
      sector: "استشارات • بورصة",
      text: "كنا نستخدم برنامجاً منفصلاً لـ e-Fatura وآخر لـ CRM. Zyrix جمعهما معاً ووفرنا 3 اشتراكات شهرية مختلفة. منصة واحدة، كل شيء.",
    },
    stars: 5,
  },
  {
    avatar: "BT",
    avatarBg: "#FFF1F2",
    avatarColor: "#9F1239",
    tr: {
      name: "Burak Tekin",
      title: "CEO",
      company: "Tekin E-Ticaret",
      sector: "E-Ticaret • İstanbul",
      text: "Shopify entegrasyonu mükemmel çalışıyor. Siparişler otomatik faturaya dönüşüyor, ödeme takibi kendiliğinden yapılıyor. Zyrix olmadan bu işleri yapmak için ekstra 1 kişi istihdam etmem gerekiyordu.",
    },
    en: {
      name: "Burak Tekin",
      title: "CEO",
      company: "Tekin E-Ticaret",
      sector: "E-Commerce • Istanbul",
      text: "Shopify integration works perfectly. Orders automatically convert to invoices, payment tracking happens automatically. Without Zyrix I would need to hire 1 extra person to do these tasks.",
    },
    ar: {
      name: "بوراك تيكين",
      title: "الرئيس التنفيذي",
      company: "Tekin E-Ticaret",
      sector: "تجارة إلكترونية • إسطنبول",
      text: "تكامل Shopify يعمل بشكل مثالي. الطلبات تتحول تلقائياً لفواتير، تتبع المدفوعات يتم تلقائياً. بدون Zyrix كنت بحاجة لتوظيف شخص إضافي لهذه المهام.",
    },
    stars: 5,
  },
];

export function TestimonialsSection() {
  const t      = useTranslations("testimonials");
  const locale = useLocale();
  const isRTL  = locale === "ar";

  function getData(c: typeof COMPANIES[0]) {
    return locale === "tr" ? c.tr : locale === "ar" ? c.ar : c.en;
  }

  return (
    <section style={{ padding:"52px 24px", background:"#FDF6EC" }}>
      <div style={{ maxWidth:1160, margin:"0 auto", direction:isRTL?"rtl":"ltr" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <span style={{ display:"inline-block", background:"#FEF3C7", color:"#92400E", fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:100, marginBottom:10 }}>
            {t("tag")}
          </span>
          <h2 style={{ fontSize:"clamp(26px,3vw,34px)", fontWeight:900, color:GOLD, lineHeight:1.25, marginBottom:8 }}>
            {t("title")}
          </h2>
          <p style={{ fontSize:15, color:"#4B5563" }}>
            {locale==="tr"?"Gerçek müşteriler, gerçek sonuçlar":locale==="ar"?"عملاء حقيقيون، نتائج حقيقية":"Real customers, real results"}
          </p>
        </div>

        {/* Top row — 3 cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:16 }} className="testi-grid">
          {COMPANIES.slice(0,3).map((c,i) => {
            const d = getData(c);
            return (
              <div key={i} style={{ background:"#fff", borderRadius:16, padding:24, border:"1px solid #FDE68A", boxShadow:"0 2px 12px rgba(180,120,30,.07)", display:"flex", flexDirection:"column", gap:16 }}>
                {/* Stars */}
                <div style={{ display:"flex", gap:3 }}>
                  {Array.from({length:c.stars}).map((_,s)=>(
                    <svg key={s} width="20" height="20" viewBox="0 0 24 24" fill="#F59E0B">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                {/* Quote */}
                <p style={{ fontSize:14, color:"#1A1A1A", lineHeight:1.75, fontStyle:"italic", margin:0, flex:1 }}>
                  &ldquo;{d.text}&rdquo;
                </p>
                {/* Author */}
                <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                  <div style={{ width:42, height:42, borderRadius:"50%", background:c.avatarBg, border:"2px solid #FDE68A", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:c.avatarColor, flexShrink:0 }}>
                    {c.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:"#0A0A0A" }}>{d.name}</div>
                    <div style={{ fontSize:12, color:"#6B7280" }}>{d.title} — {d.company}</div>
                    <div style={{ fontSize:11, color:"#9CA3AF", marginTop:1 }}>{d.sector}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom row — 2 cards centered */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16, maxWidth:800, margin:"0 auto" }} className="testi-grid2">
          {COMPANIES.slice(3).map((c,i) => {
            const d = getData(c);
            return (
              <div key={i} style={{ background:"#fff", borderRadius:16, padding:24, border:"1px solid #FDE68A", boxShadow:"0 2px 12px rgba(180,120,30,.07)", display:"flex", flexDirection:"column", gap:16 }}>
                <div style={{ display:"flex", gap:3 }}>
                  {Array.from({length:c.stars}).map((_,s)=>(
                    <svg key={s} width="20" height="20" viewBox="0 0 24 24" fill="#F59E0B">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <p style={{ fontSize:14, color:"#1A1A1A", lineHeight:1.75, fontStyle:"italic", margin:0, flex:1 }}>
                  &ldquo;{d.text}&rdquo;
                </p>
                <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                  <div style={{ width:42, height:42, borderRadius:"50%", background:c.avatarBg, border:"2px solid #FDE68A", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:c.avatarColor, flexShrink:0 }}>
                    {c.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:"#0A0A0A" }}>{d.name}</div>
                    <div style={{ fontSize:12, color:"#6B7280" }}>{d.title} — {d.company}</div>
                    <div style={{ fontSize:11, color:"#9CA3AF", marginTop:1 }}>{d.sector}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
      <style>{`
        @media(max-width:768px){.testi-grid{grid-template-columns:1fr!important}.testi-grid2{grid-template-columns:1fr!important}}
      `}</style>
    </section>
  );
}