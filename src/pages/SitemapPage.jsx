// ============================================================
// Zyrix FinSuite - Sitemap Page
// Octopus-style interactive site map
// ============================================================

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/i18n";

const COLORS = {
  primary:    "#0891B2",
  accent:     "#06B6D4",
  light:      "#67E8F9",
  bg:         "#F8FAFC",
  text:       "#0F172A",
  muted:      "#64748B",
  border:     "#E2E8F8",
  card:       "#FFFFFF",
  glow:       "rgba(8, 145, 178, 0.4)",
};

const TXT = {
  TR: {
    badge: "SİTE HARİTASI",
    title: "Zyrix FinSuite Site Haritası",
    subtitle: "Tüm sayfaları ve bölümleri tek bakışta görün. Herhangi bir bölüme tıklayarak gidin.",
    backHome: "← Ana sayfaya dön",
    centerLabel: "Zyrix FinSuite",
    legendTitle: "Lejant",
    legendCenter: "Ana Merkez",
    legendCategory: "Kategori",
    legendPage: "Sayfa",
    groups: {
      product: "Ürün",
      solutions: "Çözümler",
      company: "Şirket",
      legal: "Hukuki",
      account: "Hesap",
    },
    pages: {
      features: "Özellikler",
      howItWorks: "Nasıl Çalışır",
      pricing: "Fiyatlandırma",
      aiAnalysis: "AI Analizi",
      integrations: "Entegrasyonlar",
      sectors: "Sektörler",
      caseStudies: "Vaka Çalışmaları",
      onboarding: "Başlangıç",
      about: "Hakkımızda",
      contact: "İletişim",
      blog: "Blog",
      privacy: "Gizlilik",
      terms: "Koşullar",
      security: "Güvenlik",
      login: "Giriş Yap",
      register: "Kayıt Ol",
    },
  },
  EN: {
    badge: "SITE MAP",
    title: "Zyrix FinSuite Site Map",
    subtitle: "See all pages and sections at a glance. Click any node to navigate.",
    backHome: "← Back to home",
    centerLabel: "Zyrix FinSuite",
    legendTitle: "Legend",
    legendCenter: "Hub",
    legendCategory: "Category",
    legendPage: "Page",
    groups: {
      product: "Product",
      solutions: "Solutions",
      company: "Company",
      legal: "Legal",
      account: "Account",
    },
    pages: {
      features: "Features",
      howItWorks: "How It Works",
      pricing: "Pricing",
      aiAnalysis: "AI Analysis",
      integrations: "Integrations",
      sectors: "Sectors",
      caseStudies: "Case Studies",
      onboarding: "Onboarding",
      about: "About Us",
      contact: "Contact",
      blog: "Blog",
      privacy: "Privacy",
      terms: "Terms",
      security: "Security",
      login: "Sign In",
      register: "Sign Up",
    },
  },
  AR: {
    badge: "خريطة الموقع",
    title: "خريطة موقع Zyrix FinSuite",
    subtitle: "شاهد جميع الصفحات والأقسام بنظرة واحدة. انقر على أي عقدة للانتقال.",
    backHome: "← العودة للصفحة الرئيسية",
    centerLabel: "Zyrix FinSuite",
    legendTitle: "وسيلة الإيضاح",
    legendCenter: "المركز",
    legendCategory: "الفئة",
    legendPage: "الصفحة",
    groups: {
      product: "المنتج",
      solutions: "الحلول",
      company: "الشركة",
      legal: "القانوني",
      account: "الحساب",
    },
    pages: {
      features: "المميزات",
      howItWorks: "كيف يعمل",
      pricing: "الأسعار",
      aiAnalysis: "تحليل AI",
      integrations: "التكاملات",
      sectors: "القطاعات",
      caseStudies: "قصص النجاح",
      onboarding: "البدء",
      about: "من نحن",
      contact: "اتصل بنا",
      blog: "المدونة",
      privacy: "الخصوصية",
      terms: "الشروط",
      security: "الأمان",
      login: "تسجيل الدخول",
      register: "تسجيل جديد",
    },
  },
};

// Layout: 5 groups arranged in a circle around the center
// Each group has children pages arranged in a fan pattern outward
const GROUPS = [
  {
    id: "product",
    angle: -90,           // top
    icon: "📦",
    children: [
      { id: "features",     route: "/features" },
      { id: "howItWorks",   route: "/how-it-works" },
      { id: "pricing",      route: "/pricing" },
      { id: "aiAnalysis",   route: "/ai-analysis" },
      { id: "integrations", route: "/integrations" },
    ],
  },
  {
    id: "solutions",
    angle: -18,           // top right
    icon: "🎯",
    children: [
      { id: "sectors",     route: "/sectors" },
      { id: "caseStudies", route: "/case-studies" },
      { id: "onboarding",  route: "/onboarding" },
    ],
  },
  {
    id: "company",
    angle: 54,            // bottom right
    icon: "🏢",
    children: [
      { id: "about",   route: "/about" },
      { id: "contact", route: "/contact" },
      { id: "blog",    route: "/blog" },
    ],
  },
  {
    id: "legal",
    angle: 126,           // bottom left
    icon: "⚖️",
    children: [
      { id: "privacy",  route: "/privacy" },
      { id: "terms",    route: "/terms" },
      { id: "security", route: "/security" },
    ],
  },
  {
    id: "account",
    angle: -162,          // top left
    icon: "🔑",
    children: [
      { id: "login",    route: "/login" },
      { id: "register", route: "/register" },
    ],
  },
];

const polar = (cx, cy, r, deg) => ({
  x: cx + r * Math.cos((deg * Math.PI) / 180),
  y: cy + r * Math.sin((deg * Math.PI) / 180),
});

export default function SitemapPage() {
  const { lang } = useI18n();
  const t = TXT[lang] || TXT.TR;
  const isRtl = lang === "AR";
  const [hoveredId, setHoveredId] = useState(null);
  const [viewSize, setViewSize] = useState({ w: 1100, h: 800 });

  useEffect(() => {
    const update = () => {
      const w = Math.min(1100, window.innerWidth - 32);
      const h = w < 700 ? 900 : 800;
      setViewSize({ w, h });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const cx = viewSize.w / 2;
  const cy = viewSize.h / 2;

  // Radii for the 3 layers
  const groupR = Math.min(cx, cy) * 0.50;
  const childR = Math.min(cx, cy) * 0.85;

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg }} dir={isRtl ? "rtl" : "ltr"}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "60px 16px 80px" }}>

        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-block", background: `${COLORS.primary}15`, color: COLORS.primary,
            padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700,
            letterSpacing: "0.1em", marginBottom: 16,
          }}>
            {t.badge}
          </div>
          <h1 style={{
            margin: "0 0 12px", fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 800, color: COLORS.text,
          }}>
            {t.title}
          </h1>
          <p style={{
            margin: "0 auto", maxWidth: 600, fontSize: 15,
            color: COLORS.muted, lineHeight: 1.6,
          }}>
            {t.subtitle}
          </p>
        </div>

        {/* OCTOPUS DIAGRAM */}
        <div style={{
          background: `radial-gradient(circle at center, ${COLORS.card} 0%, ${COLORS.bg} 100%)`,
          borderRadius: 24,
          border: `1.5px solid ${COLORS.border}`,
          padding: "16px",
          margin: "0 auto",
          width: viewSize.w,
          maxWidth: "100%",
          position: "relative",
          overflow: "hidden",
        }}>
          <svg
            width="100%" height={viewSize.h}
            viewBox={`0 0 ${viewSize.w} ${viewSize.h}`}
            style={{ display: "block" }}
          >
            {/* Animated pulse rings around center */}
            <defs>
              <radialGradient id="centerGlow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%"   stopColor={COLORS.accent}  stopOpacity="0.5" />
                <stop offset="100%" stopColor={COLORS.primary} stopOpacity="0" />
              </radialGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Pulse ring */}
            <circle cx={cx} cy={cy} r="80" fill="none" stroke={COLORS.primary} strokeWidth="1.5" opacity="0.4">
              <animate attributeName="r" from="60" to="120" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.6" to="0" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx={cx} cy={cy} r="80" fill="none" stroke={COLORS.accent} strokeWidth="1.5" opacity="0.4">
              <animate attributeName="r" from="60" to="120" dur="3s" begin="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.6" to="0" dur="3s" begin="1.5s" repeatCount="indefinite" />
            </circle>

            {/* Connection lines: center -> groups */}
            {GROUPS.map((g) => {
              const p = polar(cx, cy, groupR, g.angle);
              return (
                <line
                  key={`line-c-${g.id}`}
                  x1={cx} y1={cy} x2={p.x} y2={p.y}
                  stroke={COLORS.primary} strokeWidth="2" strokeOpacity="0.3"
                  strokeDasharray="4 4"
                >
                  <animate attributeName="stroke-dashoffset" from="0" to="16" dur="1.5s" repeatCount="indefinite" />
                </line>
              );
            })}

            {/* Connection lines: group -> children */}
            {GROUPS.flatMap((g) => {
              const gp = polar(cx, cy, groupR, g.angle);
              const fanSpread = 40;
              const n = g.children.length;
              return g.children.map((c, idx) => {
                const offset = n === 1 ? 0 : (idx - (n - 1) / 2) * (fanSpread / Math.max(1, n - 1)) * 2;
                const childAngle = g.angle + offset;
                const cp = polar(cx, cy, childR, childAngle);
                return (
                  <line
                    key={`line-${g.id}-${c.id}`}
                    x1={gp.x} y1={gp.y} x2={cp.x} y2={cp.y}
                    stroke={COLORS.primary} strokeWidth="1.5" strokeOpacity="0.2"
                  />
                );
              });
            })}

            {/* Center glow circle */}
            <circle cx={cx} cy={cy} r="60" fill="url(#centerGlow)" />

            {/* CENTER NODE */}
            <Link to="/">
              <g style={{ cursor: "pointer" }}>
                <circle cx={cx} cy={cy} r="48" fill={COLORS.primary} filter="url(#glow)">
                  <animate attributeName="r" values="48;52;48" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx={cx} cy={cy} r="42" fill={COLORS.accent} opacity="0.9" />
                <text x={cx} y={cy + 4} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800">
                  {t.centerLabel}
                </text>
              </g>
            </Link>

            {/* GROUP NODES */}
            {GROUPS.map((g) => {
              const p = polar(cx, cy, groupR, g.angle);
              const groupName = t.groups[g.id];
              const isHovered = hoveredId === `group-${g.id}`;
              return (
                <g
                  key={`group-${g.id}`}
                  onMouseEnter={() => setHoveredId(`group-${g.id}`)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{ cursor: "default" }}
                >
                  {/* Pulsing ring */}
                  <circle cx={p.x} cy={p.y} r="36" fill="none" stroke={COLORS.primary} strokeWidth="1.5" opacity="0.4">
                    <animate attributeName="r" values="32;42;32" dur="2.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.8s" repeatCount="indefinite" />
                  </circle>
                  <circle
                    cx={p.x} cy={p.y} r={isHovered ? 36 : 32}
                    fill={COLORS.card}
                    stroke={COLORS.primary} strokeWidth="2.5"
                    style={{ transition: "r 0.2s" }}
                  />
                  <text x={p.x} y={p.y - 2} textAnchor="middle" fontSize="18">
                    {g.icon}
                  </text>
                  <text x={p.x} y={p.y + 14} textAnchor="middle" fill={COLORS.primary} fontSize="10" fontWeight="800">
                    {groupName}
                  </text>
                </g>
              );
            })}

            {/* CHILD NODES (clickable pages) */}
            {GROUPS.flatMap((g) => {
              const fanSpread = 40;
              const n = g.children.length;
              return g.children.map((c, idx) => {
                const offset = n === 1 ? 0 : (idx - (n - 1) / 2) * (fanSpread / Math.max(1, n - 1)) * 2;
                const childAngle = g.angle + offset;
                const cp = polar(cx, cy, childR, childAngle);
                const pageName = t.pages[c.id];
                const isHovered = hoveredId === `child-${c.id}`;
                return (
                  <Link key={`child-${c.id}`} to={c.route}>
                    <g
                      onMouseEnter={() => setHoveredId(`child-${c.id}`)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{ cursor: "pointer" }}
                    >
                      {/* Pulsing aura */}
                      <circle cx={cp.x} cy={cp.y} r="30" fill={COLORS.accent} opacity={isHovered ? "0.25" : "0.1"}>
                        <animate
                          attributeName="r"
                          values="24;32;24"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle
                        cx={cp.x} cy={cp.y}
                        r={isHovered ? 26 : 22}
                        fill={isHovered ? COLORS.accent : COLORS.card}
                        stroke={COLORS.accent} strokeWidth="2"
                        style={{ transition: "r 0.2s, fill 0.2s" }}
                      />
                      <text
                        x={cp.x} y={cp.y + 3}
                        textAnchor="middle"
                        fill={isHovered ? "#fff" : COLORS.text}
                        fontSize="9.5" fontWeight="700"
                        style={{ pointerEvents: "none" }}
                      >
                        {pageName}
                      </text>
                    </g>
                  </Link>
                );
              });
            })}
          </svg>

          {/* LEGEND */}
          <div style={{
            position: "absolute",
            bottom: 12,
            [isRtl ? "right" : "left"]: 16,
            background: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 10,
            padding: "8px 14px",
            display: "flex",
            gap: 14,
            fontSize: 11,
            color: COLORS.muted,
            fontWeight: 600,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.primary }} />
              {t.legendCenter}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.card, border: `2px solid ${COLORS.primary}` }} />
              {t.legendCategory}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS.card, border: `2px solid ${COLORS.accent}` }} />
              {t.legendPage}
            </div>
          </div>
        </div>

        {/* BACK TO HOME */}
        <div style={{ textAlign: "center", marginTop: 40 }}>
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
