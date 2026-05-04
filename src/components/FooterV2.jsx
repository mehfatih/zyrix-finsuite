import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/i18n.jsx";

// ---------- Palettes (extracted from LandingPageV2Extended) ----------
const C = {
  // Wine
  wine50:  "#FFF5F5",
  wine100: "#FFE8E8",
  wine200: "#FFCFCF",
  wine700: "#5A0A0F",
  wine800: "#3A0509",
  wine900: "#2A0306",
  wine950: "#1A0203",
  // Red
  redSoft:   "#FF8A8A",
  redMid:    "#FF6B6B",
  redBright: "#FF3B30",
  red:       "#E30A17",
  redDeep:   "#B8050F",
  // Surfaces
  bg:        "#FFF8F8",
  bgAlt:     "#FFFFFF",
  bgTinted:  "#FFF1F1",
  // Ink
  ink:       "#14060A",
  inkSoft:   "#3A2A30",
  muted:     "#5C4750",
  hairline:  "#F0DFDF",
  // Semantic
  emerald:      "#10B981",
  emeraldSoft:  "#D1FAE5",
  amber:        "#F59E0B",
};

const SA = {
  green50:  "#E6F7EE",
  green100: "#C8EBD7",
  green700: "#005227",
  green800: "#003D1D",
  green900: "#002914",
  green950: "#00190C",
  greenSoft:   "#5FCB8E",
  greenMid:    "#2BAA6A",
  greenBright: "#0EA571",
  green:       "#006C35",
  greenDeep:   "#00532A",
  bg:          "#F5FBF7",
  bgAlt:       "#FFFFFF",
  bgTinted:    "#E6F7EE",
  ink:         "#06140C",
  inkSoft:     "#1F3A2A",
  muted:       "#4F6B5A",
  hairline:    "#D8EFE0",
  emerald:     "#10B981",
  emeraldSoft: "#D1FAE5",
  amber:       "#F59E0B",
  gold:        "#D4AF37",
};

// ---------- getLogo helper ----------
const getLogo = (lang, dark) => {
  return dark ? "/images/zyrix-logo-horizontal-dark.png" : "/images/zyrix-logo-horizontal.png";
};

// ---------- FooterV2 component ----------
export default function FooterV2() {
  const { t, lang } = useI18n();
  const isSaudi = lang === "AR";

  const productLinks = lang === "AR" ? [
    "الفاتورة الإلكترونية", "إدارة CRM", "التحصيل الذكي", "مساعد AI",
    "تطبيق الجوال", "الأرشيف الإلكتروني", "تقارير ضريبة القيمة المضافة", "API و Webhooks",
  ] : lang === "EN" ? [
    "E-Invoice", "CRM Management", "Smart Collections", "AI Assistant",
    "Mobile App", "e-Archive Invoice", "VAT Reports", "API & Webhooks",
  ] : [
    "E-Fatura", "CRM Yönetimi", "Akıllı Tahsilat", "AI Asistan",
    "Mobil Uygulama", "e-Arşiv Fatura", "KDV Raporları", "API & Webhooks",
  ];

  const resourceLinks = lang === "AR" ? [
    "المدونة", "دليل المستخدم", "أكاديمية زيركس", "مركز المساعدة",
    "الندوات الإلكترونية", "حالات نجاح",
  ] : lang === "EN" ? [
    "Blog", "User Guide", "Zyrix Academy", "Help Center",
    "Webinars", "Success Stories",
  ] : [
    "Blog", "Kullanım Kılavuzu", "Zyrix Akademi", "Yardım Merkezi",
    "Webinarlar", "Başarı Hikayeleri",
  ];

  const companyLinks = lang === "AR" ? [
    { label: "من نحن", href: "/about", route: true },
    { label: "الوظائف", href: "#", route: false },
    { label: "الشركاء", href: "#", route: false },
    { label: "اتصل بنا", href: "/contact", route: true },
    { label: "الصحافة", href: "#", route: false },
  ] : lang === "EN" ? [
    { label: "About Us", href: "/about", route: true },
    { label: "Careers", href: "#", route: false },
    { label: "Partners", href: "#", route: false },
    { label: "Contact", href: "/contact", route: true },
    { label: "Press", href: "#", route: false },
  ] : [
    { label: "Hakkımızda", href: "/about", route: true },
    { label: "Kariyer", href: "#", route: false },
    { label: "İş Ortakları", href: "#", route: false },
    { label: "İletişim", href: "/contact", route: true },
    { label: "Basın", href: "#", route: false },
  ];

  const legalLinks = lang === "AR" ? [
    { label: "شروط الاستخدام", href: "/terms", route: true },
    { label: "سياسة الخصوصية", href: "/privacy", route: true },
    { label: "الأمان", href: "/security", route: true },
    { label: "سياسة الكوكيز", href: "#", route: false },
    { label: "GDPR", href: "#", route: false },
  ] : lang === "EN" ? [
    { label: "Terms of Use", href: "/terms", route: true },
    { label: "Privacy Policy", href: "/privacy", route: true },
    { label: "Security", href: "/security", route: true },
    { label: "Cookie Policy", href: "#", route: false },
    { label: "GDPR", href: "#", route: false },
  ] : [
    { label: "Kullanım Şartları", href: "/terms", route: true },
    { label: "Gizlilik Politikası", href: "/privacy", route: true },
    { label: "Güvenlik", href: "/security", route: true },
    { label: "Çerez Politikası", href: "#", route: false },
    { label: "GDPR", href: "#", route: false },
  ];

  const socialLinks = [
    { name: "LinkedIn", url: "https://www.linkedin.com/company/zyrixpaymentgateway/", icon: <><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></> },
    { name: "YouTube", url: "https://www.youtube.com/channel/UCVyXMyeREfajczEsDTzjWjg", icon: <><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></> },
    { name: "Instagram", url: "https://www.instagram.com/zyrixglobaltechnology/", icon: <><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></> },
    { name: "Facebook", url: "https://www.facebook.com/profile.php?id=61577528348196", icon: <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/> },
    { name: "X", url: "https://x.com/Zyrixglobal", icon: <><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></> },
  ];

  return (
    <footer style={{ background: isSaudi ? SA.green950 : C.wine950, color: "rgba(255, 255, 255, 0.7)", padding: "80px 32px 32px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr",
          gap: 48, paddingBottom: 56,
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}>
          <div>
            <img src={getLogo(lang, true)} alt="Zyrix FinSuite"
              style={{ height: 44, width: "auto", marginBottom: 18 }} />
            <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 24, maxWidth: 320 }}>
              {t("lv2.footer.tagline")}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24, fontSize: 13 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: isSaudi ? SA.greenSoft : C.redSoft }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span>İstanbul, Türkiye</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: isSaudi ? SA.greenSoft : C.redSoft }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
                <a href="mailto:hello@zyrix.co" style={{ color: "inherit", textDecoration: "none" }}>hello@zyrix.co</a>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              {socialLinks.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.name} style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  display: "grid", placeItems: "center",
                  color: "rgba(255, 255, 255, 0.7)",
                  textDecoration: "none", transition: "all 0.25s",
                }}
                  onMouseEnter={(e) => { const c = isSaudi ? SA.green : C.red; e.currentTarget.style.background = c; e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = c; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)"; e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)"; e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"; }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {s.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700, letterSpacing: "0.18em", color: "white", marginBottom: 18, marginTop: 0 }}>{t("lv2.footer.product")}</h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {productLinks.map((l, i) => (
                <li key={i}><a href="#" style={{ color: "rgba(255, 255, 255, 0.6)", textDecoration: "none", fontSize: 13, transition: "color 0.2s" }} onMouseEnter={(e) => e.target.style.color = "white"} onMouseLeave={(e) => e.target.style.color = "rgba(255, 255, 255, 0.6)"}>{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700, letterSpacing: "0.18em", color: "white", marginBottom: 18, marginTop: 0 }}>{t("lv2.footer.resources")}</h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {resourceLinks.map((l, i) => (
                <li key={i}><a href="#" style={{ color: "rgba(255, 255, 255, 0.6)", textDecoration: "none", fontSize: 13, transition: "color 0.2s" }} onMouseEnter={(e) => e.target.style.color = "white"} onMouseLeave={(e) => e.target.style.color = "rgba(255, 255, 255, 0.6)"}>{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700, letterSpacing: "0.18em", color: "white", marginBottom: 18, marginTop: 0 }}>{t("lv2.footer.company")}</h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {companyLinks.map((l, i) => (
                <li key={i}>
                  {l.route ? (
                    <Link to={l.href} style={{ color: "rgba(255, 255, 255, 0.6)", textDecoration: "none", fontSize: 13, transition: "color 0.2s" }} onMouseEnter={(e) => e.target.style.color = "white"} onMouseLeave={(e) => e.target.style.color = "rgba(255, 255, 255, 0.6)"}>{l.label}</Link>
                  ) : (
                    <a href={l.href} style={{ color: "rgba(255, 255, 255, 0.6)", textDecoration: "none", fontSize: 13, transition: "color 0.2s" }} onMouseEnter={(e) => e.target.style.color = "white"} onMouseLeave={(e) => e.target.style.color = "rgba(255, 255, 255, 0.6)"}>{l.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700, letterSpacing: "0.18em", color: "white", marginBottom: 18, marginTop: 0 }}>{t("lv2.footer.legal")}</h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {legalLinks.map((l, i) => (
                <li key={i}>
                  {l.route ? (
                    <Link to={l.href} style={{ color: "rgba(255, 255, 255, 0.6)", textDecoration: "none", fontSize: 13, transition: "color 0.2s" }} onMouseEnter={(e) => e.target.style.color = "white"} onMouseLeave={(e) => e.target.style.color = "rgba(255, 255, 255, 0.6)"}>{l.label}</Link>
                  ) : (
                    <a href={l.href} style={{ color: "rgba(255, 255, 255, 0.6)", textDecoration: "none", fontSize: 13, transition: "color 0.2s" }} onMouseEnter={(e) => e.target.style.color = "white"} onMouseLeave={(e) => e.target.style.color = "rgba(255, 255, 255, 0.6)"}>{l.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "32px 0", borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          flexWrap: "wrap", gap: 16,
        }}>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center", fontSize: 12, color: "rgba(255, 255, 255, 0.55)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.emerald} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {lang === "AR" ? "معتمد ZATCA" : (lang === "EN" ? "ZATCA Approved" : "GİB Onaylı")}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.emerald} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {lang === "AR" ? "متوافق PDPL" : (lang === "EN" ? "PDPL Compliant" : "KVKK Uyumlu")}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.emerald} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              ISO 27001
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.emerald} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              SSL Encrypted
            </span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)", marginRight: 4 }}>📲</span>
            <a href="#" style={{ background: "#000", color: "white", padding: "8px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,0.15)" }}>App Store</a>
            <a href="#" style={{ background: "#000", color: "white", padding: "8px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700, textDecoration: "none", border: "1px solid rgba(255,255,255,0.15)" }}>Google Play</a>
          </div>
        </div>

        <div style={{
          paddingTop: 24,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 16,
          fontSize: 12, color: "rgba(255, 255, 255, 0.5)",
        }}>
          <div>© 2026 Zyrix Global Technology. {t("lv2.footer.rights")}</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span>{t("lv2.footer.madeIn")}</span>
            <span style={{ color: isSaudi ? SA.green : C.red }}>♥</span>
            <span>{t("lv2.footer.with")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
