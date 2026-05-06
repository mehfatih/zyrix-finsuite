import React from "react";
import { useI18n } from "../i18n/i18n";
import { Link } from "react-router-dom";

const COLORS = {
  primary: "#0891B2",
  text: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F8",
  card: "#FFFFFF",
  bg: "#F8FAFC",
};

const TXT = {
  TR: {
    badge: "ZYRIX BLOG",
    title: "Yakında: Zyrix Blog",
    subtitle: "MENA ve Türkiye'de KOBİ'ler için finansal yönetim ipuçları, vergi rehberleri, başarı hikayeleri ve ürün güncellemeleri yakında burada.",
    notifyMe: "Yayınlandığında bana bildir",
    backHome: "← Ana sayfaya dön",
    coming: [
      { icon: "📝", title: "Vergi Rehberleri", desc: "KDV, e-Fatura, ZATCA hakkında pratik ipuçları" },
      { icon: "📊", title: "Finansal Stratejiler", desc: "Nakit akışı, tahsilat ve büyüme için pratik tavsiyeler" },
      { icon: "🚀", title: "Başarı Hikayeleri", desc: "Zyrix kullanan KOBİ'lerin gerçek hikayeleri" },
      { icon: "🤖", title: "AI ve Otomasyon", desc: "Yapay zekayı işletmenizde kullanma rehberleri" },
    ],
  },
  EN: {
    badge: "ZYRIX BLOG",
    title: "Coming Soon: Zyrix Blog",
    subtitle: "Financial management tips, tax guides, success stories, and product updates for SMBs in MENA and Turkey — coming soon.",
    notifyMe: "Notify me when live",
    backHome: "← Back to home",
    coming: [
      { icon: "📝", title: "Tax Guides", desc: "Practical tips on VAT, e-Invoice, and ZATCA" },
      { icon: "📊", title: "Financial Strategies", desc: "Practical advice for cash flow, collections, and growth" },
      { icon: "🚀", title: "Success Stories", desc: "Real stories from SMBs using Zyrix" },
      { icon: "🤖", title: "AI & Automation", desc: "Guides for using AI in your business" },
    ],
  },
  AR: {
    badge: "مدونة Zyrix",
    title: "قريباً: مدونة Zyrix",
    subtitle: "نصائح للإدارة المالية وأدلة ضريبية وقصص نجاح وتحديثات المنتج للشركات الصغيرة والمتوسطة في MENA وتركيا — قريباً.",
    notifyMe: "أبلغني عند الإطلاق",
    backHome: "← العودة للصفحة الرئيسية",
    coming: [
      { icon: "📝", title: "الأدلة الضريبية", desc: "نصائح عملية حول VAT والفاتورة الإلكترونية وZATCA" },
      { icon: "📊", title: "الاستراتيجيات المالية", desc: "نصائح عملية للتدفق النقدي والتحصيل والنمو" },
      { icon: "🚀", title: "قصص النجاح", desc: "قصص حقيقية من شركات تستخدم Zyrix" },
      { icon: "🤖", title: "الذكاء الاصطناعي والأتمتة", desc: "أدلة لاستخدام AI في عملك" },
    ],
  },
};

export default function BlogPage() {
  const { lang } = useI18n();
  const t = TXT[lang] || TXT.TR;
  const isRtl = lang === "AR";

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg }} dir={isRtl ? "rtl" : "ltr"}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-block", background: `${COLORS.primary}15`, color: COLORS.primary,
            padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 16 }}>
            {t.badge}
          </div>
          <h1 style={{ margin: "0 0 16px", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 800, color: COLORS.text }}>
            {t.title}
          </h1>
          <p style={{ margin: "0 auto", maxWidth: 600, fontSize: 16, color: COLORS.muted, lineHeight: 1.6 }}>
            {t.subtitle}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 48 }}>
          {t.coming.map((it, i) => (
            <div key={i} style={{
              background: COLORS.card, borderRadius: 14, padding: 24,
              border: `1.5px solid ${COLORS.border}`,
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{it.icon}</div>
              <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: COLORS.text }}>{it.title}</h3>
              <p style={{ margin: 0, fontSize: 13, color: COLORS.muted, lineHeight: 1.5 }}>{it.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <Link to="/" style={{
            display: "inline-block", padding: "12px 28px",
            background: COLORS.primary, color: "#fff",
            borderRadius: 10, textDecoration: "none",
            fontSize: 14, fontWeight: 700,
          }}>
            {t.backHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
