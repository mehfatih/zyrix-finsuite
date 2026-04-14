"use client";

import { useLocale } from "next-intl";
import Link from "next/link";

const ACCENT  = "#D4820A";
const ACCENT2 = "#F5A623";
const BG      = "linear-gradient(160deg,#7A3A00 0%,#A85200 40%,#D4820A 100%)";
const DARK    = "#3D1800";
const NAV_BG  = "#2A1200";

const FEATURES = [
  {
    icon: "🧾",
    en: { title: "Invoice Generator",    desc: "Create professional PDF invoices in Arabic, Turkish & English in seconds with automatic numbering." },
    ar: { title: "مولّد الفواتير",        desc: "أنشئ فواتير PDF احترافية بالعربية والتركية والإنجليزية في ثوانٍ مع ترقيم تلقائي." },
    tr: { title: "Fatura Oluşturucu",    desc: "Otomatik numaralandırma ile saniyeler içinde Arapça, Türkçe ve İngilizce profesyonel PDF faturaları oluşturun." },
  },
  {
    icon: "📋",
    en: { title: "Interactive Quotes",   desc: "Send quotes clients can accept or reject online — auto-converts to invoice on acceptance." },
    ar: { title: "عروض أسعار تفاعلية",   desc: "أرسل عروض أسعار يقبلها العملاء أونلاين — تتحول تلقائياً إلى فاتورة عند القبول." },
    tr: { title: "İnteraktif Teklifler", desc: "Müşterilerin çevrimiçi kabul edebileceği teklifler gönderin — kabul üzerine otomatik faturaya dönüşür." },
  },
  {
    icon: "🏛️",
    en: { title: "VAT & KDV Compliance", desc: "Full compliance with Saudi VAT (15%), UAE VAT (5%), and Turkish KDV — auto-calculated on every invoice." },
    ar: { title: "توافق VAT وKDV",        desc: "توافق كامل مع ضريبة القيمة المضافة السعودية (15%) والإماراتية (5%) والتركية — محسوبة تلقائياً في كل فاتورة." },
    tr: { title: "VAT ve KDV Uyumluluğu", desc: "Suudi VAT (%15), BAE VAT (%5) ve Türk KDV ile tam uyumluluk — her faturada otomatik hesaplanır." },
  },
  {
    icon: "💰",
    en: { title: "Expense Tracking",     desc: "Categorize and track business expenses, attach receipts, and generate expense reports instantly." },
    ar: { title: "تتبع المصروفات",       desc: "صنّف وتتبع مصروفات العمل، أرفق الإيصالات، وأنشئ تقارير المصروفات فورياً." },
    tr: { title: "Gider Takibi",         desc: "İş giderlerini kategorize edin, makbuz ekleyin ve anında gider raporları oluşturun." },
  },
  {
    icon: "🔄",
    en: { title: "Recurring Billing",    desc: "Automate subscription billing with smart retry and dunning management for failed payments." },
    ar: { title: "الفوترة المتكررة",     desc: "أتمتة فوترة الاشتراكات مع إعادة محاولة ذكية وإدارة المدفوعات الفاشلة." },
    tr: { title: "Yinelenen Faturalama", desc: "Başarısız ödemeler için akıllı yeniden deneme ve yönetimi ile abonelik faturalamasını otomatikleştirin." },
  },
  {
    icon: "📊",
    en: { title: "Revenue Goals",        desc: "Set monthly and yearly revenue targets, track progress, and get alerts when you're falling behind." },
    ar: { title: "أهداف الإيرادات",      desc: "حدد أهداف الإيرادات الشهرية والسنوية، تتبع التقدم، واحصل على تنبيهات عند التأخر." },
    tr: { title: "Gelir Hedefleri",      desc: "Aylık ve yıllık gelir hedefleri belirleyin, ilerlemeyi takip edin ve geride kaldığınızda uyarı alın." },
  },
];

const STATS = [
  { val: "3",      en: "Languages",       ar: "لغات مدعومة",      tr: "Dil Desteği" },
  { val: "VAT+KDV",en: "Tax Compliant",   ar: "متوافق مع الضرائب", tr: "Vergi Uyumlu" },
  { val: "PDF",    en: "Instant Export",  ar: "تصدير فوري",       tr: "Anında Dışa Aktarma" },
  { val: "∞",      en: "Invoices",        ar: "فواتير غير محدودة", tr: "Sınırsız Fatura" },
];

const PRICING = [
  {
    en: { name: "Free",       sub: "Forever free",     cta: "Get Started" },
    ar: { name: "مجاني",      sub: "مجاناً للأبد",      cta: "ابدأ الآن" },
    tr: { name: "Ücretsiz",   sub: "Sonsuza ücretsiz", cta: "Başla" },
    price: "$0", highlight: false,
    features: { en: ["10 invoices/mo","PDF export","Arabic & English","Email support"], ar: ["10 فواتير/شهر","تصدير PDF","العربية والإنجليزية","دعم بريد إلكتروني"], tr: ["Aylık 10 fatura","PDF dışa aktarma","Arapça ve İngilizce","E-posta Desteği"] },
  },
  {
    en: { name: "Professional", sub: "Per month",    cta: "Start Professional" },
    ar: { name: "الاحترافي",    sub: "شهرياً",         cta: "ابدأ الاحترافي" },
    tr: { name: "Profesyonel",  sub: "Aylık",         cta: "Profesyoneli Başlat" },
    price: "$29", highlight: true,
    features: { en: ["Unlimited invoices","3 Languages","VAT/KDV auto-calc","Interactive quotes","Expense tracking","Priority support"], ar: ["فواتير غير محدودة","3 لغات","حساب VAT/KDV تلقائي","عروض أسعار تفاعلية","تتبع المصروفات","دعم أولوية"], tr: ["Sınırsız fatura","3 Dil","Otomatik VAT/KDV","İnteraktif teklifler","Gider takibi","Öncelikli destek"] },
  },
  {
    en: { name: "Enterprise",  sub: "Custom pricing", cta: "Contact Sales" },
    ar: { name: "المؤسسي",     sub: "أسعار مخصصة",    cta: "تواصل مع المبيعات" },
    tr: { name: "Kurumsal",    sub: "Özel fiyat",     cta: "Satışla İletişim" },
    price: "—", highlight: false,
    features: { en: ["White-Label","API access","Custom integrations","Dedicated manager","SLA guarantee"], ar: ["وايت لايبل","وصول API","تكاملات مخصصة","مدير مخصص","ضمان SLA"], tr: ["Beyaz Etiket","API erişimi","Özel entegrasyonlar","Özel yönetici","SLA garantisi"] },
  },
];

function Navbar({ locale, isRTL }: { locale: string; isRTL: boolean }) {
  const signUp  = locale === "ar" ? "إنشاء حساب"   : locale === "tr" ? "Üye Ol"    : "Sign Up";
  const signIn  = locale === "ar" ? "تسجيل الدخول" : locale === "tr" ? "Giriş Yap" : "Sign In";
  const pricing = locale === "ar" ? "الأسعار"      : locale === "tr" ? "Fiyatlar"  : "Pricing";
  const about   = locale === "ar" ? "من نحن"       : locale === "tr" ? "Hakkımızda": "About";

  return (
    <nav style={{ background: NAV_BG, borderBottom: `1px solid rgba(212,130,10,0.25)`, height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", position: "sticky", top: 0, zIndex: 100 }} dir={isRTL ? "rtl" : "ltr"}>
      <a href={`/${locale}`} style={{ textDecoration: "none" }}>
        <span style={{ fontFamily: "'Georgia',serif", fontSize: 22, fontWeight: 900, color: "#fff", direction: "ltr", unicodeBidi: "embed" }}>
          <span style={{ color: "#2563EB" }}>Z</span>yrix<span style={{ color: "#2563EB", fontSize: 26 }}>.</span>
          <span style={{ color: ACCENT2, fontSize: 14, fontFamily: "Cairo,sans-serif", fontWeight: 700, marginLeft: 6 }}>FinSuite</span>
        </span>
      </a>
      <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
        {[{ label: pricing, href: `/${locale}#pricing` }, { label: about, href: "https://zyrix.co" }].map(item => (
          <a key={item.label} href={item.href} style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#fff"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)"}>
            {item.label}
          </a>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <a href={`/${locale}/signin`} style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.75)", padding: "8px 14px", textDecoration: "none" }}>{signIn}</a>
        <a href={`/${locale}/signup`} style={{ fontSize: 13, fontWeight: 700, background: ACCENT, color: "#fff", padding: "9px 20px", borderRadius: 9, textDecoration: "none" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = ACCENT2}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ACCENT}>
          {signUp}
        </a>
      </div>
    </nav>
  );
}

export default function FinSuitePage() {
  const locale = useLocale();
  const isRTL  = locale === "ar";
  function tx(obj: { en: string; ar: string; tr: string }) { return obj[locale as "en"|"ar"|"tr"] ?? obj.en; }

  const heroTitle = {
    en: <><span style={{ color: "#fff" }}>Professional</span><br /><span style={{ color: ACCENT2 }}>Finance & Invoicing</span><br /><span style={{ color: "rgba(255,255,255,0.85)" }}>Suite for MENA & Turkey</span></>,
    ar: <><span style={{ color: "#fff" }}>منظومة الفوترة</span><br /><span style={{ color: ACCENT2 }}>والمالية الاحترافية</span><br /><span style={{ color: "rgba(255,255,255,0.85)" }}>لـ MENA وتركيا</span></>,
    tr: <><span style={{ color: "#fff" }}>MENA ve Türkiye için</span><br /><span style={{ color: ACCENT2 }}>Profesyonel Finans</span><br /><span style={{ color: "rgba(255,255,255,0.85)" }}>ve Faturalama Paketi</span></>,
  };
  const heroSub = {
    en: "VAT/KDV-compliant invoicing, interactive quotes, expense tracking, and recurring billing — in Arabic, Turkish & English.",
    ar: "فوترة متوافقة مع VAT/KDV، عروض أسعار تفاعلية، تتبع المصروفات، وفوترة متكررة — بالعربية والتركية والإنجليزية.",
    tr: "VAT/KDV uyumlu faturalama, interaktif teklifler, gider takibi ve yinelenen faturalama — Arapça, Türkçe ve İngilizce.",
  };

  const ctaFree = locale === "ar" ? "ابدأ مجاناً" : locale === "tr" ? "Ücretsiz Başla" : "Start Free";
  const popular = locale === "ar" ? "الأكثر شيوعاً" : locale === "tr" ? "En Popüler" : "Most Popular";
  const ctaTitle = locale === "ar" ? "ابدأ الفوترة الاحترافية اليوم" : locale === "tr" ? "Bugün Profesyonel Faturalamaya Başlayın" : "Start Professional Invoicing Today";

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#fff", fontFamily: "Cairo, sans-serif" }} dir={isRTL ? "rtl" : "ltr"}>
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)", backgroundSize: "48px 48px" }} />

      <Navbar locale={locale} isRTL={isRTL} />

      {/* HERO */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 40px 60px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div style={{ textAlign: isRTL ? "right" : "left" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(212,130,10,0.18)", border: "1.5px solid rgba(212,130,10,0.4)", borderRadius: 100, padding: "6px 16px", fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: ACCENT2, marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT2, display: "inline-block" }} />
              {locale === "ar" ? "منظومة المالية والفوترة" : locale === "tr" ? "Finans ve Faturalama Paketi" : "Finance & Invoicing Suite"}
            </div>
            <h1 style={{ fontFamily: "'Georgia',serif", fontSize: "clamp(36px,4vw,56px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 20 }}>
              {heroTitle[locale as keyof typeof heroTitle] ?? heroTitle.en}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.82)", fontSize: 16, fontWeight: 600, lineHeight: 1.8, marginBottom: 32, maxWidth: 460 }}>{tx(heroSub)}</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: isRTL ? "flex-end" : "flex-start" }}>
              <Link href={`/${locale}/signup`} style={{ background: "#fff", color: DARK, fontWeight: 700, padding: "14px 28px", borderRadius: 10, fontSize: 14, textDecoration: "none" }}>{ctaFree}</Link>
              <Link href={`/${locale}/demo`} style={{ border: "2px solid rgba(255,255,255,0.5)", color: "#fff", fontWeight: 700, padding: "14px 28px", borderRadius: 10, fontSize: 14, textDecoration: "none" }}>
                {locale === "ar" ? "شاهد العرض" : locale === "tr" ? "Demo İzle" : "Watch Demo"}
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 36, maxWidth: 320 }}>
              {STATS.map(s => (
                <div key={s.val} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 12, padding: "12px 14px" }}>
                  <div style={{ fontFamily: "'Georgia',serif", fontSize: 18, fontWeight: 900, color: ACCENT2 }}>{s.val}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{tx(s)}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Visual */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(212,130,10,0.3)", borderRadius: 24, padding: 28, width: "100%", maxWidth: 380 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT2, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 16 }}>
                {locale === "ar" ? "فاتورة — معاينة" : locale === "tr" ? "Fatura — Önizleme" : "Invoice — Preview"}
              </div>
              {[
                { label: locale === "ar" ? "رقم الفاتورة" : locale === "tr" ? "Fatura No" : "Invoice No",    val: "#INV-2026-0042" },
                { label: locale === "ar" ? "العميل" : locale === "tr" ? "Müşteri" : "Client",               val: locale === "ar" ? "شركة النور للتجارة" : "Al-Nour Trading Co." },
                { label: locale === "ar" ? "المبلغ قبل الضريبة" : locale === "tr" ? "Vergi Öncesi" : "Subtotal", val: "SAR 10,000" },
                { label: locale === "ar" ? "ضريبة القيمة المضافة 15%" : locale === "tr" ? "KDV %18" : "VAT 15%", val: "SAR 1,500" },
                { label: locale === "ar" ? "الإجمالي" : locale === "tr" ? "Toplam" : "Total",               val: "SAR 11,500" },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: 9, marginBottom: 5, background: row.label.includes("جمالي") || row.label === "Total" || row.label === "Toplam" ? "rgba(212,130,10,0.18)" : "rgba(255,255,255,0.05)", border: `1px solid ${row.label.includes("جمالي") || row.label === "Total" || row.label === "Toplam" ? "rgba(212,130,10,0.35)" : "rgba(255,255,255,0.07)"}` }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{row.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 40px", position: "relative", zIndex: 1 }}>
        <h2 style={{ fontFamily: "'Georgia',serif", fontSize: "clamp(26px,3vw,38px)", fontWeight: 900, textAlign: "center", marginBottom: 40, letterSpacing: "-1px" }}>
          {locale === "ar" ? "الميزات الرئيسية" : locale === "tr" ? "Temel Özellikler" : "Key Features"}
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
          {FEATURES.map((f) => {
            const data = f[locale as keyof typeof f] as { title: string; desc: string } ?? f.en;
            return (
              <div key={f.icon} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 18, padding: 24 }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,130,10,0.45)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)"}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 8 }}>{data.title}</h3>
                <p style={{ fontSize: 13.5, fontWeight: 500, color: "rgba(255,255,255,0.75)", lineHeight: 1.75 }}>{data.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 40px", position: "relative", zIndex: 1 }}>
        <h2 style={{ fontFamily: "'Georgia',serif", fontSize: "clamp(26px,3vw,38px)", fontWeight: 900, textAlign: "center", marginBottom: 40, letterSpacing: "-1px" }}>
          {locale === "ar" ? "الأسعار" : locale === "tr" ? "Fiyatlar" : "Pricing"}
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
          {PRICING.map((p) => {
            const data  = p[locale as keyof typeof p] as { name: string; sub: string; cta: string } ?? p.en;
            const feats = (p.features as Record<string, string[]>)[locale] ?? p.features.en;
            return (
              <div key={p.price} style={{ background: p.highlight ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0.08)", border: p.highlight ? `3px solid ${ACCENT}` : "1.5px solid rgba(255,255,255,0.15)", borderRadius: 20, padding: 28, position: "relative" }}>
                {p.highlight && (
                  <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: ACCENT, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 16px", borderRadius: 100, whiteSpace: "nowrap" }}>{popular}</div>
                )}
                <h3 style={{ fontWeight: 800, fontSize: 18, color: p.highlight ? DARK : "#fff", marginBottom: 4 }}>{data.name}</h3>
                <div style={{ fontFamily: "'Georgia',serif", fontSize: 38, fontWeight: 900, color: p.highlight ? ACCENT : ACCENT2, marginBottom: 2 }}>{p.price}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: p.highlight ? "#4A6C8C" : "rgba(255,255,255,0.6)", marginBottom: 20 }}>{data.sub}</div>
                <ul style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 24 }}>
                  {feats.map((f: string) => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: p.highlight ? "#1A3A55" : "rgba(255,255,255,0.82)", fontWeight: 600 }}>
                      <span style={{ color: ACCENT, fontWeight: 900 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link href={`/${locale}/signup`} style={{ display: "block", textAlign: "center", fontWeight: 700, fontSize: 14, padding: "12px 0", borderRadius: 12, textDecoration: "none", background: p.highlight ? ACCENT : "transparent", color: p.highlight ? "#fff" : ACCENT2, border: p.highlight ? "none" : `2px solid ${ACCENT2}` }}>
                  {data.cta}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 800, margin: "0 auto", padding: "40px 40px 80px", position: "relative", zIndex: 1, textAlign: "center" }}>
        <div style={{ background: "rgba(0,0,0,0.25)", border: "1.5px solid rgba(212,130,10,0.35)", borderRadius: 28, padding: "52px 44px" }}>
          <h2 style={{ fontFamily: "'Georgia',serif", fontSize: "clamp(24px,3vw,36px)", fontWeight: 900, color: "#fff", letterSpacing: "-1px", marginBottom: 12 }}>{ctaTitle}</h2>
          <p style={{ color: "rgba(255,255,255,0.80)", fontSize: 15, fontWeight: 600, marginBottom: 28 }}>
            {locale === "ar" ? "فواتير احترافية، توافق ضريبي، وعروض أسعار تفاعلية في مكان واحد" : locale === "tr" ? "Profesyonel faturalar, vergi uyumluluğu ve interaktif teklifler tek yerde" : "Professional invoices, tax compliance, and interactive quotes in one place"}
          </p>
          <Link href={`/${locale}/signup`} style={{ display: "inline-block", background: "#fff", color: DARK, fontWeight: 700, padding: "14px 36px", borderRadius: 12, fontSize: 15, textDecoration: "none" }}>{ctaFree}</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: NAV_BG, borderTop: `2px solid rgba(212,130,10,0.2)`, padding: "24px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }} dir={isRTL ? "rtl" : "ltr"}>
        <a href="https://zyrix.co" style={{ textDecoration: "none" }}>
          <span style={{ fontFamily: "'Georgia',serif", fontSize: 20, fontWeight: 900, color: "#fff", direction: "ltr", unicodeBidi: "embed" }}>
            <span style={{ color: "#2563EB" }}>Z</span>yrix<span style={{ color: "#2563EB", fontSize: 24 }}>.</span>
          </span>
        </a>
        <div style={{ display: "flex", gap: 20 }}>
          {[{ en: "Privacy", ar: "الخصوصية", tr: "Gizlilik", href: `/${locale}/privacy` }, { en: "Terms", ar: "الشروط", tr: "Koşullar", href: `/${locale}/terms` }, { en: "Contact", ar: "تواصل", tr: "İletişim", href: `/${locale}/contact` }].map(item => (
            <a key={item.en} href={item.href} style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>{tx(item)}</a>
          ))}
        </div>
        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 600, direction: "ltr" }}>© 2026 Zyrix FinSuite</div>
      </footer>
    </div>
  );
}