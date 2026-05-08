// ================================================================
// /cerez — Çerez Politikası (Cookie Policy).
// Brand-consistent shell via ResourcePage.
// ================================================================
import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/i18n.jsx";
import ResourcePage from "../../components/ResourcePage.jsx";

const LAST_UPDATED = "2026-04-01";

const COPY = {
  TR: {
    eyebrow: "ÇEREZ POLİTİKASI",
    title: "Zyrix'te çerezleri nasıl kullanıyoruz",
    subtitle: "Web sitemizde çerezleri sade ve dürüst bir şekilde — yalnızca işin gerektirdiği kadar — kullanıyoruz. Aşağıda neyin neden olduğunu özetledik.",
    updated: "Son güncelleme",
    sections: [
      {
        h: "1. Çerez nedir?",
        p: "Çerezler, ziyaret ettiğiniz web siteleri tarafından cihazınıza yerleştirilen küçük metin dosyalarıdır. Tarayıcınız bu dosyaları her ziyarette geri gönderir, böylece site sizi tanıyabilir veya tercihlerinizi hatırlayabilir.",
      },
      {
        h: "2. Hangi çerezleri kullanıyoruz?",
        p: "Üç tür çerez kullanıyoruz: (a) Zorunlu çerezler — oturum yönetimi ve güvenlik için, kapatılamaz. (b) Performans çerezleri — sayfaların ne kadar hızlı yüklendiğini ve nerede hata aldığımızı görmek için. (c) Tercih çerezleri — dil seçiminizi (TR/EN/AR) ve ülke profilinizi hatırlamak için.",
      },
      {
        h: "3. Üçüncü taraf çerezleri",
        p: "Reklam ağları kullanmıyoruz. Yalnızca zorunlu altyapı sağlayıcılarımız (örn. analitik) anonimleştirilmiş veri toplar. Hiçbir kişisel veriniz reklamcılarla paylaşılmaz.",
      },
      {
        h: "4. Tercihlerinizi nasıl yönetebilirsiniz?",
        p: "Zorunlu olmayan çerezleri tarayıcınızdan dilediğiniz zaman silebilir veya engelleyebilirsiniz. Bunu yaptığınızda bazı işlevler beklenmedik şekilde davranabilir (örn. dil tercihleri her seferinde sıfırlanır).",
      },
      {
        h: "5. Saklama süresi",
        p: "Oturum çerezleri tarayıcı kapandığında silinir. Tercih çerezleri 12 aya kadar saklanır. Performans çerezleri en fazla 24 ay saklanır.",
      },
    ],
    relatedTitle: "İlgili politikalar",
    privacyCta: "Gizlilik Politikası",
    gdprCta: "GDPR Hakları",
  },
  EN: {
    eyebrow: "COOKIE POLICY",
    title: "How we use cookies at Zyrix",
    subtitle: "We use cookies on our website plainly and honestly — only as much as the product needs. Here's what's set and why.",
    updated: "Last updated",
    sections: [
      {
        h: "1. What is a cookie?",
        p: "Cookies are small text files set by the websites you visit. Your browser sends them back on every request so the site can recognise you or remember your preferences.",
      },
      {
        h: "2. Which cookies do we use?",
        p: "Three types: (a) Strictly necessary cookies — for session management and security; cannot be disabled. (b) Performance cookies — to see how quickly pages load and where we get errors. (c) Preference cookies — to remember your language (TR/EN/AR) and country profile.",
      },
      {
        h: "3. Third-party cookies",
        p: "We do not use ad networks. Only essential infrastructure providers (e.g. analytics) collect anonymised data. No personal data is shared with advertisers.",
      },
      {
        h: "4. How can you manage preferences?",
        p: "You can delete or block non-essential cookies in your browser at any time. Some features may behave unexpectedly when you do (e.g. your language preference resets every visit).",
      },
      {
        h: "5. Retention",
        p: "Session cookies are removed when the browser closes. Preference cookies are kept up to 12 months. Performance cookies are kept up to 24 months.",
      },
    ],
    relatedTitle: "Related policies",
    privacyCta: "Privacy Policy",
    gdprCta: "GDPR Rights",
  },
  AR: {
    eyebrow: "سياسة الكوكيز",
    title: "كيف نستخدم الكوكيز في Zyrix",
    subtitle: "نستخدم الكوكيز على موقعنا بشكل بسيط وصادق — بقدر ما يحتاجه المنتج فقط. إليك ما يتم تعيينه ولماذا.",
    updated: "آخر تحديث",
    sections: [
      {
        h: "1. ما هو الكوكي؟",
        p: "الكوكيز ملفات نصية صغيرة تضعها المواقع التي تزورها. متصفحك يرسلها مع كل طلب حتى يتعرف الموقع عليك أو يتذكر تفضيلاتك.",
      },
      {
        h: "2. ما الكوكيز التي نستخدمها؟",
        p: "ثلاثة أنواع: (أ) كوكيز ضرورية — لإدارة الجلسة والأمان؛ لا يمكن تعطيلها. (ب) كوكيز الأداء — لمعرفة سرعة تحميل الصفحات ومواقع الأخطاء. (ج) كوكيز التفضيلات — لتذكر لغتك (TR/EN/AR) وملف بلدك.",
      },
      {
        h: "3. كوكيز الطرف الثالث",
        p: "لا نستخدم شبكات إعلانية. فقط مزوّدو البنية التحتية الأساسية (مثل التحليلات) يجمعون بيانات مجهولة. لا يتم مشاركة أي بيانات شخصية مع المعلنين.",
      },
      {
        h: "4. كيف تدير التفضيلات؟",
        p: "يمكنك حذف أو حظر الكوكيز غير الضرورية في متصفحك في أي وقت. قد تتصرف بعض الميزات بشكل غير متوقع بعد ذلك (مثل إعادة ضبط اللغة في كل زيارة).",
      },
      {
        h: "5. مدة الاحتفاظ",
        p: "كوكيز الجلسة تُزال عند إغلاق المتصفح. كوكيز التفضيلات تُحفظ حتى 12 شهراً. كوكيز الأداء تُحفظ حتى 24 شهراً.",
      },
    ],
    relatedTitle: "السياسات ذات الصلة",
    privacyCta: "سياسة الخصوصية",
    gdprCta: "حقوق GDPR",
  },
};

export default function CerezPage() {
  const { lang } = useI18n();
  const t = COPY[lang] || COPY.TR;
  return (
    <ResourcePage eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle}>
      <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#5C4F52", marginBottom: 24 }}>
        {t.updated}: {LAST_UPDATED}
      </div>

      <div style={{
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 20,
        padding: "36px 32px",
        boxShadow: "0 14px 36px rgba(58,5,9,0.06)",
        marginBottom: 32,
      }}>
        {t.sections.map((s, i) => (
          <section key={i} style={{ marginBottom: i === t.sections.length - 1 ? 0 : 28 }}>
            <h2 style={{ margin: "0 0 10px", fontSize: 19, fontWeight: 900, color: "#1B0F11", letterSpacing: "-0.01em" }}>{s.h}</h2>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.7, color: "#3A2A30", fontWeight: 500 }}>{s.p}</p>
          </section>
        ))}
      </div>

      <div style={{
        padding: "20px 24px",
        borderRadius: 16,
        background: "#FFF8F8",
        border: "1px solid rgba(227,10,23,0.10)",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#5C4F52", marginBottom: 12 }}>{t.relatedTitle}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <Link to="/gizlilik" style={{ padding: "10px 18px", background: "#fff", color: "#991B1B", border: "1px solid rgba(227,10,23,0.30)", borderRadius: 10, fontSize: 13, fontWeight: 800, textDecoration: "none" }}>{t.privacyCta}</Link>
          <Link to="/gdpr" style={{ padding: "10px 18px", background: "#fff", color: "#991B1B", border: "1px solid rgba(227,10,23,0.30)", borderRadius: 10, fontSize: 13, fontWeight: 800, textDecoration: "none" }}>{t.gdprCta}</Link>
        </div>
      </div>
    </ResourcePage>
  );
}
