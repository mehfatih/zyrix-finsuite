"use client";
import { useLocale } from "next-intl";
import Link from "next/link";

const GOLD = "#B8892A";

const L = {
  tr: { badge:"Blog", title:"KOBİ'ler İçin Bilgi Merkezi", sub:"e-Fatura, KDV, dijital dönüşüm ve işletme büyütme hakkında uzman içerikler.", search:"Ara...", cats:["Tümü","e-Fatura","KDV","CRM","AI","Büyüme","İpuçları"], readMore:"Devamını Oku", minRead:"dk okuma" },
  en: { badge:"Blog", title:"Knowledge Center for SMEs", sub:"Expert content on e-Invoice, VAT, digital transformation and business growth.", search:"Search...", cats:["All","e-Invoice","VAT","CRM","AI","Growth","Tips"], readMore:"Read More", minRead:"min read" },
  ar: { badge:"المدونة", title:"مركز المعرفة للشركات الصغيرة", sub:"محتوى متخصص حول e-Fatura وKDV والتحول الرقمي ونمو الأعمال.", search:"بحث...", cats:["الكل","e-Fatura","KDV","CRM","AI","نمو","نصائح"], readMore:"اقرأ المزيد", minRead:"دقيقة" },
};

const POSTS = [
  { cat:"e-fatura", img:"🧾", readTime:5, date:"12 Nis 2026",
    tr:{ title:"e-Fatura Zorunluluğu: 2026 Güncel Rehber", excerpt:"GİB'in e-Fatura zorunluluğu her geçen yıl daha fazla işletmeyi kapsıyor. 2026 için kim, nasıl ve ne zaman hazırlanmalı?" },
    en:{ title:"e-Invoice Obligation: 2026 Updated Guide", excerpt:"GİB's e-Invoice obligation covers more businesses every year. Who, how and when should prepare for 2026?" },
    ar:{ title:"إلزام e-Fatura: دليل 2026 المحدث", excerpt:"التزام GİB بـ e-Fatura يشمل المزيد من الشركات كل عام. من يجب عليه الاستعداد ولماذا؟" },
  },
  { cat:"kdv", img:"🧮", readTime:4, date:"10 Nis 2026",
    tr:{ title:"KDV Oranları Değişti mi? İşletmenizi Nasıl Etkiler?", excerpt:"Türkiye'de KDV oranları ve son değişiklikler. Muhasebe yazılımınızın otomatik güncellemesi neden önemli?" },
    en:{ title:"Did VAT Rates Change? How Does It Affect Your Business?", excerpt:"VAT rates and recent changes in Turkey. Why does auto-update of your accounting software matter?" },
    ar:{ title:"هل تغيرت معدلات KDV؟ كيف يؤثر على عملك؟", excerpt:"معدلات KDV والتغييرات الأخيرة في تركيا. لماذا يهم التحديث التلقائي لبرنامج المحاسبة؟" },
  },
  { cat:"ai", img:"🤖", readTime:6, date:"08 Nis 2026",
    tr:{ title:"Yapay Zeka CFO ile Finansal Kararlarınızı Nasıl Güçlendirirsiniz?", excerpt:"AI destekli finans araçları artık küçük işletmelerin de erişebileceği bir seviyeye geldi. İşte başlamanız için her şey." },
    en:{ title:"How to Strengthen Financial Decisions with AI CFO?", excerpt:"AI-powered finance tools are now accessible to small businesses too. Here's everything to get started." },
    ar:{ title:"كيف تقوي قراراتك المالية مع AI CFO؟", excerpt:"أدوات التمويل بالذكاء الاصطناعي أصبحت في متناول الشركات الصغيرة أيضاً." },
  },
  { cat:"crm", img:"👥", readTime:5, date:"05 Nis 2026",
    tr:{ title:"Satış Pipeline Nedir ve KOBİ'niz İçin Neden Şart?", excerpt:"Satış sürecinizi görselleştirmek, tahmin yapabilmek ve kaçırılan fırsatları azaltmak için pipeline yönetimi." },
    en:{ title:"What is a Sales Pipeline and Why is it Essential for SMEs?", excerpt:"Pipeline management to visualize your sales process, forecast and reduce missed opportunities." },
    ar:{ title:"ما هو خط المبيعات ولماذا هو ضروري للشركات الصغيرة؟", excerpt:"إدارة خط الأنابيب لتصوير عملية المبيعات والتنبؤ وتقليل الفرص الضائعة." },
  },
  { cat:"büyüme", img:"📈", readTime:7, date:"03 Nis 2026",
    tr:{ title:"Excel'den ERP'ye Geçiş: Adım Adım Pratik Rehber", excerpt:"Binlerce KOBİ hâlâ Excel kullanıyor. Dijital dönüşüme nasıl başlanır, ne dikkat edilmeli?" },
    en:{ title:"Transitioning from Excel to ERP: A Practical Step-by-Step Guide", excerpt:"Thousands of SMEs still use Excel. How to start digital transformation and what to watch out for." },
    ar:{ title:"الانتقال من Excel إلى ERP: دليل عملي خطوة بخطوة", excerpt:"آلاف الشركات الصغيرة لا تزال تستخدم Excel. كيف تبدأ التحول الرقمي؟" },
  },
  { cat:"ipuçları", img:"💡", readTime:3, date:"01 Nis 2026",
    tr:{ title:"Nakit Akışı Yönetiminde 7 Altın Kural", excerpt:"KOBİ'lerin en sık yapığı nakit akışı hataları ve bunlardan nasıl kaçınırsınız. AI tahmininin rolü." },
    en:{ title:"7 Golden Rules for Cash Flow Management", excerpt:"Most common cash flow mistakes SMEs make and how to avoid them. The role of AI forecasting." },
    ar:{ title:"7 قواعد ذهبية لإدارة التدفق النقدي", excerpt:"أكثر أخطاء التدفق النقدي شيوعاً التي ترتكبها الشركات الصغيرة وكيف تتجنبها." },
  },
];

export default function BlogPage() {
  const locale = useLocale();
  const l      = L[locale as keyof typeof L] ?? L.tr;
  const isRTL  = locale === "ar";

  function getData(p: typeof POSTS[0]) {
    return locale === "tr" ? p.tr : locale === "ar" ? p.ar : p.en;
  }

  const CAT_COLORS: Record<string, { bg:string; color:string }> = {
    "e-fatura":{ bg:"#EFF6FF", color:"#1D4ED8" },
    "kdv":     { bg:"#F0FDF4", color:"#065F46" },
    "ai":      { bg:"#F5F3FF", color:"#7C3AED" },
    "crm":     { bg:"#FFFBEB", color:"#92400E" },
    "büyüme":  { bg:"#FFF1F2", color:"#9F1239" },
    "ipuçları":{ bg:"#ECFDF5", color:"#065F46" },
  };

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC", direction: isRTL?"rtl":"ltr" }}>

      {/* Hero */}
      <section style={{ background:"linear-gradient(160deg,#0F172A,#1E3A8A)", padding:"56px 24px 48px", textAlign:"center" }}>
        <span style={{ display:"inline-block", background:"rgba(255,255,255,.1)", color:"#93C5FD", fontSize:12, fontWeight:700, padding:"5px 14px", borderRadius:100, marginBottom:14 }}>{l.badge}</span>
        <h1 style={{ fontSize:"clamp(26px,4vw,40px)", fontWeight:900, color:"#fff", marginBottom:12 }}>{l.title}</h1>
        <p style={{ fontSize:16, color:"rgba(255,255,255,.75)", maxWidth:520, margin:"0 auto" }}>{l.sub}</p>
      </section>

      <section style={{ maxWidth:1100, margin:"0 auto", padding:"48px 24px" }}>
        {/* Featured post */}
        <div style={{ background:"#fff", border:"1.5px solid #E5E7EB", borderRadius:20, padding:32, marginBottom:28, display:"grid", gridTemplateColumns:"1fr 1fr", gap:28, alignItems:"center" }} className="blog-feat">
          <div>
            <div style={{ display:"flex", gap:8, marginBottom:14, alignItems:"center" }}>
              <span style={{ background:CAT_COLORS["e-fatura"].bg, color:CAT_COLORS["e-fatura"].color, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:100 }}>e-Fatura</span>
              <span style={{ fontSize:12, color:"#9CA3AF" }}>12 Nis 2026 · 5 {l.minRead}</span>
            </div>
            <h2 style={{ fontSize:"clamp(20px,3vw,28px)", fontWeight:900, color:"#0A0A0A", marginBottom:12, lineHeight:1.3 }}>{getData(POSTS[0]).title}</h2>
            <p style={{ fontSize:14, color:"#374151", lineHeight:1.75, marginBottom:18 }}>{getData(POSTS[0]).excerpt}</p>
            <Link href={`/${locale}/blog/e-fatura-2026`} style={{ display:"inline-flex", alignItems:"center", gap:6, color:"#2563EB", fontWeight:700, fontSize:14, textDecoration:"none" }}>
              {l.readMore} →
            </Link>
          </div>
          <div style={{ background:"#EFF6FF", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", fontSize:72, aspectRatio:"4/3" }}>
            {POSTS[0].img}
          </div>
        </div>

        {/* Posts grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18 }} className="blog-grid">
          {POSTS.slice(1).map((post,i) => {
            const d = getData(post);
            const cc = CAT_COLORS[post.cat] ?? { bg:"#F3F4F6", color:"#374151" };
            return (
              <div key={i} style={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:16, overflow:"hidden", transition:"all .2s" }}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,.08)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
                <div style={{ background:cc.bg, padding:"28px 20px", textAlign:"center", fontSize:44 }}>{post.img}</div>
                <div style={{ padding:"18px 20px" }}>
                  <div style={{ display:"flex", gap:8, marginBottom:10, alignItems:"center" }}>
                    <span style={{ background:cc.bg, color:cc.color, fontSize:10, fontWeight:700, padding:"2px 9px", borderRadius:100, textTransform:"uppercase" }}>{post.cat}</span>
                    <span style={{ fontSize:11, color:"#9CA3AF" }}>{post.readTime} {l.minRead}</span>
                  </div>
                  <h3 style={{ fontSize:15, fontWeight:800, color:"#0A0A0A", marginBottom:8, lineHeight:1.4 }}>{d.title}</h3>
                  <p style={{ fontSize:13, color:"#374151", lineHeight:1.65, marginBottom:14 }}>{d.excerpt}</p>
                  <Link href={`/${locale}/blog/${post.cat}`} style={{ fontSize:13, color:"#2563EB", fontWeight:700, textDecoration:"none" }}>
                    {l.readMore} →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ background:"#0F172A", padding:"48px 24px", textAlign:"center" }}>
        <h2 style={{ fontSize:22, fontWeight:900, color:GOLD, marginBottom:8 }}>
          {locale==="tr"?"Haftalık KOBİ İpuçları Alın":locale==="ar"?"احصل على نصائح أسبوعية":"Get Weekly SME Tips"}
        </h2>
        <p style={{ fontSize:14, color:"rgba(255,255,255,.6)", marginBottom:20 }}>
          {locale==="tr"?"Her hafta e-Fatura, KDV ve büyüme ipuçları":locale==="ar"?"نصائح e-Fatura وKDV والنمو كل أسبوع":"Weekly e-Invoice, VAT and growth tips"}
        </p>
        <div style={{ display:"flex", gap:10, maxWidth:420, margin:"0 auto", justifyContent:"center" }}>
          <input placeholder={locale==="tr"?"E-posta adresiniz":locale==="ar"?"بريدك الإلكتروني":"Your email"} style={{ flex:1, padding:"11px 14px", borderRadius:9, border:"none", fontSize:14, fontFamily:"inherit", outline:"none" }} />
          <button style={{ background:"#2563EB", color:"#fff", border:"none", padding:"11px 20px", borderRadius:9, fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>
            {locale==="tr"?"Abone Ol":locale==="ar"?"اشتراك":"Subscribe"}
          </button>
        </div>
      </section>

      <style>{`@media(max-width:860px){.blog-grid{grid-template-columns:repeat(2,1fr)!important}.blog-feat{grid-template-columns:1fr!important}}@media(max-width:560px){.blog-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}