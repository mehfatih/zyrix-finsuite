// ================================================================
// /gdpr — GDPR Uyumluluğu (GDPR rights & compliance).
// Brand-consistent shell via ResourcePage.
// ================================================================
import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/i18n.jsx";
import ResourcePage from "../../components/ResourcePage.jsx";

const LAST_UPDATED = "2026-04-01";
const DPO_EMAIL = "dpo@zyrix.co";

const COPY = {
  TR: {
    eyebrow: "GDPR UYUMLULUĞU",
    title: "Verileriniz üzerindeki haklarınız",
    subtitle: "Zyrix, hem AB GDPR hem de Türkiye KVKK düzenlemelerine uyumlu çalışır. Aşağıda haklarınızı, taleplerinizi nasıl yapacağınızı ve sürelerimizi özetledik.",
    updated: "Son güncelleme",
    rightsEyebrow: "VERİ SAHİBİ HAKLARI",
    rightsTitle: "GDPR Madde 15-22 kapsamındaki haklarınız",
    rights: [
      { icon: "👁️", title: "Erişim hakkı",         desc: "Hangi verilerinizi işlediğimizi öğrenmek için talep edebilirsiniz. Cevap süremiz: 30 gün." },
      { icon: "✏️", title: "Düzeltme hakkı",        desc: "Yanlış veya eksik kişisel verilerinizin düzeltilmesini isteyebilirsiniz." },
      { icon: "🗑️", title: "Silme hakkı (Unutulma)", desc: "Belirli koşullar altında verilerinizin silinmesini talep edebilirsiniz." },
      { icon: "⏸️", title: "Kısıtlama hakkı",        desc: "İşlemenin durdurulmasını / sınırlandırılmasını isteyebilirsiniz." },
      { icon: "📦", title: "Taşınabilirlik",         desc: "Verilerinizi yapılandırılmış, makinece okunabilir bir formatta alabilirsiniz." },
      { icon: "🚫", title: "İtiraz hakkı",            desc: "Pazarlama veya meşru menfaate dayalı işlemeye itiraz edebilirsiniz." },
    ],
    requestEyebrow: "TALEP NASIL YAPILIR",
    requestTitle: "Talebinizi yapın",
    requestSteps: [
      "1. Talep türünüzü belirleyin (yukarıdaki haklardan biri).",
      "2. Kimliğinizi doğrulamak için hesabınıza bağlı e-postadan iletişime geçin.",
      "3. Aşağıdaki DPO adresine yazın — talebinizi 30 gün içinde sonuçlandırırız.",
    ],
    dpoLabel: "Veri Koruma Sorumlusu (DPO)",
    legalBasisTitle: "Hukuki dayanak",
    legalBasis: [
      "Sözleşme – hizmeti sunmak için zorunlu olan veriler.",
      "Yasal yükümlülük – e-Fatura, KDV, KVKK, ZATCA, fatura saklama.",
      "Meşru menfaat – ürün güvenliği, dolandırıcılık önleme, ürün geliştirme.",
      "Açık rıza – pazarlama iletişimi ve isteğe bağlı analitik.",
    ],
    relatedTitle: "İlgili politikalar",
    privacyCta: "Gizlilik Politikası",
    cookieCta: "Çerez Politikası",
  },
  EN: {
    eyebrow: "GDPR COMPLIANCE",
    title: "Your rights over your data",
    subtitle: "Zyrix complies with both the EU GDPR and Turkey's KVKK. Below: your rights, how to file a request, and our response timelines.",
    updated: "Last updated",
    rightsEyebrow: "DATA SUBJECT RIGHTS",
    rightsTitle: "Your rights under GDPR Articles 15-22",
    rights: [
      { icon: "👁️", title: "Right to access",        desc: "Request a copy of the personal data we process about you. Response time: 30 days." },
      { icon: "✏️", title: "Right to rectification", desc: "Request correction of inaccurate or incomplete personal data." },
      { icon: "🗑️", title: "Right to erasure",        desc: "Request deletion of your data under certain conditions ('right to be forgotten')." },
      { icon: "⏸️", title: "Right to restriction",    desc: "Request that we stop or limit our processing of your data." },
      { icon: "📦", title: "Data portability",        desc: "Receive your data in a structured, machine-readable format." },
      { icon: "🚫", title: "Right to object",          desc: "Object to processing for marketing or legitimate-interest purposes." },
    ],
    requestEyebrow: "HOW TO REQUEST",
    requestTitle: "File your request",
    requestSteps: [
      "1. Identify the type of request (one of the rights above).",
      "2. Contact us from the email tied to your account so we can verify identity.",
      "3. Write to the DPO below — we resolve requests within 30 days.",
    ],
    dpoLabel: "Data Protection Officer (DPO)",
    legalBasisTitle: "Legal basis",
    legalBasis: [
      "Contract – data needed to deliver the service.",
      "Legal obligation – e-Invoice, VAT, KVKK, ZATCA, invoice retention.",
      "Legitimate interest – product security, fraud prevention, product improvement.",
      "Explicit consent – marketing communications and optional analytics.",
    ],
    relatedTitle: "Related policies",
    privacyCta: "Privacy Policy",
    cookieCta: "Cookie Policy",
  },
  AR: {
    eyebrow: "الامتثال لـ GDPR",
    title: "حقوقك على بياناتك",
    subtitle: "تلتزم Zyrix بكل من GDPR في الاتحاد الأوروبي وKVKK في تركيا. أدناه: حقوقك، كيفية تقديم طلب، ومواعيد الاستجابة.",
    updated: "آخر تحديث",
    rightsEyebrow: "حقوق صاحب البيانات",
    rightsTitle: "حقوقك بموجب المواد 15-22 من GDPR",
    rights: [
      { icon: "👁️", title: "حق الوصول",          desc: "طلب نسخة من بياناتك الشخصية التي نعالجها. مدة الاستجابة: 30 يوماً." },
      { icon: "✏️", title: "حق التصحيح",          desc: "طلب تصحيح بيانات شخصية غير دقيقة أو غير مكتملة." },
      { icon: "🗑️", title: "حق المحو",            desc: "طلب حذف بياناتك في ظل ظروف معينة ('الحق في النسيان')." },
      { icon: "⏸️", title: "حق التقييد",            desc: "طلب إيقاف أو تقييد معالجتنا لبياناتك." },
      { icon: "📦", title: "قابلية النقل",          desc: "استلام بياناتك بصيغة منظَّمة قابلة للقراءة آلياً." },
      { icon: "🚫", title: "حق الاعتراض",            desc: "الاعتراض على المعالجة لأغراض التسويق أو المصلحة المشروعة." },
    ],
    requestEyebrow: "كيفية تقديم الطلب",
    requestTitle: "قدّم طلبك",
    requestSteps: [
      "1. حدّد نوع الطلب (أحد الحقوق أعلاه).",
      "2. تواصل معنا من البريد المرتبط بحسابك للتحقق من الهوية.",
      "3. اكتب إلى DPO أدناه — نحل الطلبات خلال 30 يوماً.",
    ],
    dpoLabel: "مسؤول حماية البيانات (DPO)",
    legalBasisTitle: "الأساس القانوني",
    legalBasis: [
      "العقد — البيانات اللازمة لتقديم الخدمة.",
      "التزام قانوني — الفاتورة الإلكترونية، VAT، KVKK، ZATCA، حفظ الفواتير.",
      "المصلحة المشروعة — أمن المنتج، منع الاحتيال، تحسين المنتج.",
      "موافقة صريحة — مراسلات التسويق والتحليلات الاختيارية.",
    ],
    relatedTitle: "السياسات ذات الصلة",
    privacyCta: "سياسة الخصوصية",
    cookieCta: "سياسة الكوكيز",
  },
};

const RIGHT_THEMES = [
  { bg: "#FEE2E2", border: "#DC2626", icon: "#DC2626" },
  { bg: "#DBEAFE", border: "#2563EB", icon: "#2563EB" },
  { bg: "#FEF3C7", border: "#D97706", icon: "#D97706" },
  { bg: "#D1FAE5", border: "#10B981", icon: "#10B981" },
  { bg: "#EDE9FE", border: "#7C3AED", icon: "#7C3AED" },
  { bg: "#FED7AA", border: "#EA580C", icon: "#EA580C" },
];

export default function GdprPage() {
  const { lang } = useI18n();
  const t = COPY[lang] || COPY.TR;
  return (
    <ResourcePage eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle}>
      <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#5C4F52", marginBottom: 24 }}>
        {t.updated}: {LAST_UPDATED}
      </div>

      {/* Rights */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#DC2626", marginBottom: 10 }}>{t.rightsEyebrow}</div>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "#1B0F11", letterSpacing: "-0.02em" }}>{t.rightsTitle}</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          {t.rights.map((r, i) => {
            const th = RIGHT_THEMES[i % RIGHT_THEMES.length];
            return (
              <div key={i} style={{
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.08)",
                borderTop: `3px solid ${th.border}`,
                borderRadius: 16,
                padding: 20,
                boxShadow: "0 10px 28px rgba(58,5,9,0.05)",
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: th.bg, color: th.icon, display: "grid", placeItems: "center", fontSize: 20, marginBottom: 12 }}>{r.icon}</div>
                <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 900, color: "#1B0F11" }}>{r.title}</h3>
                <p style={{ margin: 0, fontSize: 12.5, color: "#5C4F52", lineHeight: 1.55, fontWeight: 500 }}>{r.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Request flow */}
      <div style={{
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 20,
        padding: "32px 28px",
        boxShadow: "0 14px 36px rgba(58,5,9,0.06)",
        marginBottom: 32,
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "#DC2626", marginBottom: 8 }}>{t.requestEyebrow}</div>
        <h3 style={{ margin: "0 0 14px", fontSize: 22, fontWeight: 900, color: "#1B0F11", letterSpacing: "-0.02em" }}>{t.requestTitle}</h3>
        <ol style={{ margin: "0 0 18px 18px", padding: 0, fontSize: 14, color: "#3A2A30", lineHeight: 1.75, fontWeight: 500, listStyle: "none" }}>
          {t.requestSteps.map((s, i) => <li key={i} style={{ marginBottom: 6 }}>{s}</li>)}
        </ol>
        <div style={{
          padding: "14px 18px",
          background: "#FFF8F8",
          borderRadius: 12,
          border: "1px solid rgba(227,10,23,0.12)",
          display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.10em", textTransform: "uppercase", color: "#5C4F52" }}>{t.dpoLabel}:</span>
          <a href={`mailto:${DPO_EMAIL}`} style={{ color: "#991B1B", fontWeight: 900, fontSize: 14, textDecoration: "none" }}>{DPO_EMAIL}</a>
        </div>
      </div>

      {/* Legal basis */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 19, fontWeight: 900, color: "#1B0F11", letterSpacing: "-0.01em" }}>{t.legalBasisTitle}</h3>
        <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14, color: "#3A2A30", lineHeight: 1.75, fontWeight: 500 }}>
          {t.legalBasis.map((b, i) => <li key={i} style={{ marginBottom: 6 }}>{b}</li>)}
        </ul>
      </div>

      {/* Related */}
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
          <Link to="/cerez" style={{ padding: "10px 18px", background: "#fff", color: "#991B1B", border: "1px solid rgba(227,10,23,0.30)", borderRadius: 10, fontSize: 13, fontWeight: 800, textDecoration: "none" }}>{t.cookieCta}</Link>
        </div>
      </div>
    </ResourcePage>
  );
}
