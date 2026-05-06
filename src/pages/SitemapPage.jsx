// SitemapPage.jsx — Octopus-style interactive sitemap
// Center hub: 3D red sphere with pulse rings (matches AI Decision Engine style)
// Standalone page — no header/footer

import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/i18n";
import NavV2 from "../components/NavV2.jsx";
import FooterV2 from "../components/FooterV2.jsx";

// ============================================================================
// COLOR SYSTEM
// ============================================================================
const COLORS = {
  bg: "#FAFBFD",
  primary: "#0891B2",
  accent: "#06B6D4",
  red: "#E30A17",
  redDeep: "#A8081A",
  redGlow: "rgba(227,10,23,.18)",
  text: "#0F172A",
  muted: "#64748B",
  cardBorder: "#E2E8F0",
};

// ============================================================================
// TRANSLATIONS
// ============================================================================
const T_TR = {
  badge: "SİTE HARİTASI",
  title: "Zyrix FinSuite Site Haritası",
  subtitle: "Tüm sayfaları ve bölümleri tek bakışta görün. Herhangi bir düğüme tıklayarak gezinin.",
  backHome: "← Ana sayfaya dön",
  centerLabel: "Zyrix",
  centerSub: "FinSuite",
  legendTitle: "Açıklamalar",
  legendCenter: "Ana ürün",
  legendGroup: "Kategori",
  legendChild: "Sayfa",
  groups: {
    product: "Ürün",
    solutions: "Çözümler",
    company: "Şirket",
    legal: "Yasal",
    account: "Hesap",
  },
  pages: {
    howItWorks: "Nasıl Çalışır",
    pricing: "Fiyatlar",
    features: "Özellikler",
    aiAnalysis: "AI Analiz",
    integrations: "Entegrasyonlar",
    sectors: "Sektörler",
    caseStudies: "Başarı Hikayeleri",
    onboarding: "Başlangıç",
    about: "Hakkımızda",
    contact: "İletişim",
    privacy: "Gizlilik",
    terms: "Koşullar",
    security: "Güvenlik",
    login: "Giriş Yap",
    register: "Kayıt Ol",
    blog: "Blog",
  },
};

const T_EN = {
  badge: "SITE MAP",
  title: "Zyrix FinSuite Site Map",
  subtitle: "See all pages and sections at a glance. Click any node to navigate.",
  backHome: "← Back to home",
  centerLabel: "Zyrix",
  centerSub: "FinSuite",
  legendTitle: "Legend",
  legendCenter: "Main product",
  legendGroup: "Category",
  legendChild: "Page",
  groups: {
    product: "Product",
    solutions: "Solutions",
    company: "Company",
    legal: "Legal",
    account: "Account",
  },
  pages: {
    howItWorks: "How It Works",
    pricing: "Pricing",
    features: "Features",
    aiAnalysis: "AI Analysis",
    integrations: "Integrations",
    sectors: "Sectors",
    caseStudies: "Case Studies",
    onboarding: "Get Started",
    about: "About Us",
    contact: "Contact",
    privacy: "Privacy",
    terms: "Terms",
    security: "Security",
    login: "Sign In",
    register: "Sign Up",
    blog: "Blog",
  },
};

const T_AR = {
  badge: "خريطة الموقع",
  title: "خريطة موقع Zyrix FinSuite",
  subtitle: "اطلع على جميع الصفحات والأقسام في لمحة. انقر على أي عقدة للانتقال إليها.",
  backHome: "← الرجوع للرئيسية",
  centerLabel: "Zyrix",
  centerSub: "FinSuite",
  legendTitle: "وسيلة الإيضاح",
  legendCenter: "المنتج الرئيسي",
  legendGroup: "فئة",
  legendChild: "صفحة",
  groups: {
    product: "المنتج",
    solutions: "الحلول",
    company: "الشركة",
    legal: "قانوني",
    account: "الحساب",
  },
  pages: {
    howItWorks: "كيف يعمل",
    pricing: "الأسعار",
    features: "الميزات",
    aiAnalysis: "تحليل الذكاء الاصطناعي",
    integrations: "التكاملات",
    sectors: "القطاعات",
    caseStudies: "قصص النجاح",
    onboarding: "ابدأ الآن",
    about: "من نحن",
    contact: "تواصل معنا",
    privacy: "الخصوصية",
    terms: "الشروط",
    security: "الأمان",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    blog: "المدونة",
  },
};

// ============================================================================
// SITE STRUCTURE
// ============================================================================
function buildGroups(t) {
  return [
    {
      id: "product",
      label: t.groups.product,
      icon: "📦",
      angle: -90,
      children: [
        { id: "howItWorks", label: t.pages.howItWorks, route: "/how-it-works" },
        { id: "pricing", label: t.pages.pricing, route: "/pricing" },
        { id: "features", label: t.pages.features, route: "/features" },
        { id: "aiAnalysis", label: t.pages.aiAnalysis, route: "/ai-analysis" },
      ],
    },
    {
      id: "solutions",
      label: t.groups.solutions,
      icon: "🎯",
      angle: -18,
      children: [
        { id: "integrations", label: t.pages.integrations, route: "/integrations" },
        { id: "sectors", label: t.pages.sectors, route: "/sectors" },
        { id: "caseStudies", label: t.pages.caseStudies, route: "/case-studies" },
        { id: "onboarding", label: t.pages.onboarding, route: "/onboarding" },
      ],
    },
    {
      id: "company",
      label: t.groups.company,
      icon: "🏢",
      angle: 54,
      children: [
        { id: "about", label: t.pages.about, route: "/about" },
        { id: "contact", label: t.pages.contact, route: "/contact" },
        { id: "blog", label: t.pages.blog, route: "/blog" },
      ],
    },
    {
      id: "legal",
      label: t.groups.legal,
      icon: "⚖️",
      angle: 126,
      children: [
        { id: "privacy", label: t.pages.privacy, route: "/privacy" },
        { id: "terms", label: t.pages.terms, route: "/terms" },
      ],
    },
    {
      id: "account",
      label: t.groups.account,
      icon: "🔑",
      angle: -162,
      children: [
        { id: "security", label: t.pages.security, route: "/security" },
        { id: "login", label: t.pages.login, route: "/login" },
        { id: "register", label: t.pages.register, route: "/register" },
      ],
    },
  ];
}

const polar = (cx, cy, r, deg) => ({
  x: cx + r * Math.cos((deg * Math.PI) / 180),
  y: cy + r * Math.sin((deg * Math.PI) / 180),
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function SitemapPage() {
  const { lang, isRTL } = useI18n();
  const t = lang === "AR" ? T_AR : lang === "TR" ? T_TR : T_EN;
  const groups = buildGroups(t);

  const W = 1280;
  const H = 1000;
  const cx = W / 2;
  const cy = H / 2;
  const groupR = Math.min(cx, cy) * 0.50;
  const childR = Math.min(cx, cy) * 0.85;

  return (
    <>
      <NavV2 />
      <div
        style={{
          minHeight: "100vh",
          background: COLORS.bg,
          direction: isRTL ? "rtl" : "ltr",
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          padding: "48px 24px 96px",
        }}
      >
      <div style={{ maxWidth: 1280, margin: "0 auto 32px", textAlign: "center" }}>
        <div
          style={{
            display: "inline-block",
            padding: "8px 18px",
            borderRadius: 999,
            background: "#E0F2FE",
            color: COLORS.primary,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            marginBottom: 18,
          }}
        >
          {t.badge}
        </div>
        <h1
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: COLORS.text,
            margin: "0 0 14px",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
          }}
        >
          {t.title}
        </h1>
        <p
          style={{
            fontSize: 18,
            color: COLORS.muted,
            margin: "0 0 24px",
            maxWidth: 720,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {t.subtitle}
        </p>
      </div>

      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          background: "#fff",
          borderRadius: 24,
          border: "1px solid " + COLORS.cardBorder,
          padding: 24,
          boxShadow: "0 20px 60px rgba(15,23,42,0.06)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 900,
            height: 900,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at center, rgba(227,10,23,.10) 0%, rgba(227,10,23,.04) 35%, transparent 60%)",
            filter: "blur(30px)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: 460,
            height: 460,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(227,10,23,.18) 0%, transparent 65%)",
            filter: "blur(24px)",
            pointerEvents: "none",
            zIndex: 0,
            animation: "sitemap-glow-breathe 5s ease-in-out infinite",
          }}
        />

        <svg
          viewBox={"0 0 " + W + " " + H}
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "100%", height: "auto", display: "block", position: "relative", zIndex: 1 }}
        >
          <defs>
            <radialGradient id="centerSphere" cx="0.35" cy="0.32" r="0.75">
              <stop offset="0%" stopColor="#FF6B7A" />
              <stop offset="25%" stopColor="#FF3D48" />
              <stop offset="55%" stopColor="#E30A17" />
              <stop offset="85%" stopColor="#A8081A" />
              <stop offset="100%" stopColor="#7A0710" />
            </radialGradient>
            <radialGradient id="centerHalo" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="rgba(227,10,23,0.4)" />
              <stop offset="50%" stopColor="rgba(227,10,23,0.12)" />
              <stop offset="100%" stopColor="rgba(227,10,23,0)" />
            </radialGradient>
            <radialGradient id="sphereHighlight" cx="0.32" cy="0.28" r="0.25">
              <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
              <stop offset="60%" stopColor="rgba(255,255,255,0.15)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle cx={cx} cy={cy} r="180" fill="url(#centerHalo)" />

          <circle
            cx={cx}
            cy={cy}
            r="110"
            fill="none"
            stroke="rgba(227,10,23,0.30)"
            strokeWidth="2"
            style={{
              transformOrigin: cx + "px " + cy + "px",
              animation: "sitemap-pulse 2.6s ease-out infinite",
            }}
          />
          <circle
            cx={cx}
            cy={cy}
            r="135"
            fill="none"
            stroke="rgba(227,10,23,0.20)"
            strokeWidth="2"
            style={{
              transformOrigin: cx + "px " + cy + "px",
              animation: "sitemap-pulse 2.6s ease-out 0.9s infinite",
            }}
          />
          <circle
            cx={cx}
            cy={cy}
            r="160"
            fill="none"
            stroke="rgba(227,10,23,0.12)"
            strokeWidth="1.5"
            style={{
              transformOrigin: cx + "px " + cy + "px",
              animation: "sitemap-pulse 2.6s ease-out 1.8s infinite",
            }}
          />

          {groups.map((g) => {
            const p = polar(cx, cy, groupR, g.angle);
            return (
              <line
                key={"line-c-" + g.id}
                x1={cx}
                y1={cy}
                x2={p.x}
                y2={p.y}
                stroke={COLORS.primary}
                strokeWidth="1.5"
                strokeDasharray="6 6"
                opacity="0.35"
              />
            );
          })}

          {groups.map((g) => {
            const gp = polar(cx, cy, groupR, g.angle);
            return g.children.map((c, i) => {
              const fan = 24;
              const offset = (i - (g.children.length - 1) / 2) * fan;
              const childAngle = g.angle + offset;
              const cp = polar(cx, cy, childR, childAngle);
              return (
                <line
                  key={"line-" + g.id + "-" + c.id}
                  x1={gp.x}
                  y1={gp.y}
                  x2={cp.x}
                  y2={cp.y}
                  stroke={COLORS.accent}
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                  opacity="0.30"
                />
              );
            });
          })}

          <g style={{ transformOrigin: cx + "px " + cy + "px", animation: "sitemap-core-pulse 4s ease-in-out infinite" }}>
            <circle cx={cx} cy={cy} r="105" fill="rgba(227,10,23,0.08)" />
            <ellipse cx={cx} cy={cy + 50} rx="80" ry="14" fill="rgba(58,5,9,0.20)" filter="url(#softGlow)" />
            <circle cx={cx} cy={cy} r="92" fill="url(#centerSphere)" />
            <ellipse cx={cx - 22} cy={cy - 28} rx="40" ry="32" fill="url(#sphereHighlight)" />
            <ellipse cx={cx} cy={cy + 35} rx="60" ry="20" fill="rgba(0,0,0,0.18)" opacity="0.55" />
            <text
              x={cx}
              y={cy - 8}
              textAnchor="middle"
              fill="#fff"
              fontSize="26"
              fontWeight="800"
              style={{ letterSpacing: "1px", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))" }}
            >
              {t.centerLabel}
            </text>
            <text
              x={cx}
              y={cy + 22}
              textAnchor="middle"
              fill="#fff"
              fontSize="18"
              fontWeight="700"
              style={{ letterSpacing: "0.5px", opacity: 0.92, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))" }}
            >
              {t.centerSub}
            </text>
          </g>

          {groups.map((g) => {
            const p = polar(cx, cy, groupR, g.angle);
            return (
              <g key={"group-" + g.id}>
                <circle cx={p.x} cy={p.y} r="48" fill="rgba(8,145,178,0.10)" />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="38"
                  fill="#fff"
                  stroke={COLORS.primary}
                  strokeWidth="2.5"
                  filter="url(#softGlow)"
                />
                <text
                  x={p.x}
                  y={p.y - 4}
                  textAnchor="middle"
                  fontSize="22"
                  style={{ pointerEvents: "none" }}
                >
                  {g.icon}
                </text>
                <text
                  x={p.x}
                  y={p.y + 18}
                  textAnchor="middle"
                  fill={COLORS.primary}
                  fontSize="11"
                  fontWeight="800"
                  style={{ pointerEvents: "none" }}
                >
                  {g.label}
                </text>
              </g>
            );
          })}

          {groups.map((g) => {
            return g.children.map((c, i) => {
              const fan = 24;
              const offset = (i - (g.children.length - 1) / 2) * fan;
              const childAngle = g.angle + offset;
              const cp = polar(cx, cy, childR, childAngle);
              return (
                <g key={"child-" + g.id + "-" + c.id}>
                  <Link to={c.route} style={{ cursor: "pointer" }}>
                    <circle
                      cx={cp.x}
                      cy={cp.y}
                      r="32"
                      fill="rgba(8,145,178,0.08)"
                      style={{
                        transformOrigin: cp.x + "px " + cp.y + "px",
                        animation: "sitemap-child-pulse 2s ease-in-out " + (i * 0.2) + "s infinite",
                      }}
                    />
                    <circle
                      cx={cp.x}
                      cy={cp.y}
                      r="26"
                      fill="#fff"
                      stroke={COLORS.accent}
                      strokeWidth="1.8"
                      style={{ transition: "all 0.2s" }}
                    />
                    <text
                      x={cp.x}
                      y={cp.y + 4}
                      textAnchor="middle"
                      fill={COLORS.text}
                      fontSize="10"
                      fontWeight="700"
                      style={{ pointerEvents: "none" }}
                    >
                      {c.label.length > 12 ? c.label.slice(0, 11) + "…" : c.label}
                    </text>
                  </Link>
                </g>
              );
            });
          })}
        </svg>

        <div
          style={{
            position: "absolute",
            bottom: 24,
            [isRTL ? "right" : "left"]: 24,
            background: "#fff",
            border: "1px solid " + COLORS.cardBorder,
            borderRadius: 12,
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            fontSize: 12,
            zIndex: 2,
            boxShadow: "0 4px 16px rgba(15,23,42,0.06)",
          }}
        >
          <div style={{ fontWeight: 800, color: COLORS.text, fontSize: 11, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>
            {t.legendTitle}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "linear-gradient(135deg, #FF6B7A, #A8081A)" }} />
            <span style={{ color: COLORS.muted }}>{t.legendCenter}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", border: "2px solid " + COLORS.primary }} />
            <span style={{ color: COLORS.muted }}>{t.legendGroup}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", border: "1.5px solid " + COLORS.accent }} />
            <span style={{ color: COLORS.muted }}>{t.legendChild}</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes sitemap-pulse {
          0%   { transform: scale(0.85); opacity: 0.7; }
          100% { transform: scale(1.45); opacity: 0; }
        }
        @keyframes sitemap-core-pulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.04); }
        }
        @keyframes sitemap-glow-breathe {
          0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
          50%      { opacity: 1;   transform: translate(-50%, -50%) scale(1.08); }
        }
        @keyframes sitemap-child-pulse {
          0%, 100% { transform: scale(1);    opacity: 1; }
          50%      { transform: scale(1.18); opacity: 0.5; }
        }
      `}</style>
      </div>
      <FooterV2 />
    </>
  );
}
