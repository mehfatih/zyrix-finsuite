import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useI18n, SUPPORTED_LANGS } from "../i18n/i18n.jsx";
import CountrySelectorPill from "./CountrySelectorPill.jsx";
import { useIsMobile } from "../hooks/useIsMobile";

const C = {
  wine50: "#FFF5F5", wine100: "#FFE8E8", wine200: "#FFCFCF",
  wine700: "#5A0A0F", wine800: "#3A0509", wine900: "#2A0306", wine950: "#1A0203",
  redSoft: "#FF8A8A", redMid: "#FF6B6B", redBright: "#FF3B30",
  red: "#E30A17", redDeep: "#B8050F",
  bg: "#FFF8F8", bgAlt: "#FFFFFF", bgTinted: "#FFF1F1",
  ink: "#14060A", inkSoft: "#3A2A30", muted: "#5C4750", hairline: "#F0DFDF",
  emerald: "#10B981", emeraldSoft: "#D1FAE5", amber: "#F59E0B",
};

const SA = {
  green50: "#E6F7EE", green100: "#C8EBD7",
  green700: "#005227", green800: "#003D1D", green900: "#002914", green950: "#00190C",
  greenSoft: "#5FCB8E", greenMid: "#2BAA6A", greenBright: "#0EA571",
  green: "#006C35", greenDeep: "#00532A",
  bg: "#F5FBF7", bgAlt: "#FFFFFF", bgTinted: "#E6F7EE",
  ink: "#06140C", inkSoft: "#1F3A2A", muted: "#4F6B5A", hairline: "#D8EFE0",
  emerald: "#10B981", emeraldSoft: "#D1FAE5", amber: "#F59E0B", gold: "#D4AF37",
};

const getLogo = (lang, dark) => dark
  ? "/images/zyrix-logo-horizontal-dark.png"
  : "/images/zyrix-logo-horizontal.png";
export default function NavV2() {
  const { t, lang, setLang } = useI18n();
  const isSaudi = lang === "AR";
  const [scrolled, setScrolled] = useState(false);
  const isHome = useLocation().pathname === "/";
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const langRef = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const NAV_LINKS = [
    { href: "/how-it-works", label: t("lv2.nav.howItWorks") },
    { href: "/pricing", label: t("lv2.nav.pricingPage") },
    { href: "/features", label: t("lv2.nav.featuresPage") },
    { href: "/case-studies", label: t("lv2.nav.caseStudies") },
    { href: "/integrations", label: t("lv2.nav.integrations") },
    { href: "/sectors", label: t("lv2.nav.sectors") },
    { href: "/contact", label: t("lv2.nav.contact") },
  ];

  const accent = isSaudi ? SA.green : C.red;
  const accentDeep = isSaudi ? SA.greenDeep : C.redDeep;

  return (
    <>
      <nav style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 100,
        padding: (scrolled || !isHome) ? "12px 0" : "18px 0",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        background: (scrolled || !isHome) ? (isSaudi ? "rgba(0, 25, 12, 0.85)" : "rgba(26, 2, 3, 0.85)") : "transparent",
        backdropFilter: (scrolled || !isHome) ? "blur(20px) saturate(180%)" : "none",
        WebkitBackdropFilter: (scrolled || !isHome) ? "blur(20px) saturate(180%)" : "none",
        borderBottom: (scrolled || !isHome) ? "1px solid rgba(255, 255, 255, 0.06)" : "none",
        boxShadow: (scrolled || !isHome) ? (isSaudi ? "0 8px 32px rgba(0, 25, 12, 0.4)" : "0 8px 32px rgba(26, 2, 3, 0.4)") : "none",
      }}>
        <div style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: isMobile ? "0 16px" : "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: isMobile ? 12 : 32,
        }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", flexShrink: 0 }}>
            <img
              src={getLogo(lang, true)}
              alt="Zyrix FinSuite"
              style={{
                height: isMobile ? 36 : 50,
                width: "auto",
                display: "block",
                filter: "drop-shadow(0 4px 16px rgba(255, 255, 255, 0.4))",
                transition: "filter 0.3s, transform 0.3s",
              }}
            />
          </a>

          {!isMobile && (
            <div style={{
              display: "flex",
              gap: 32,
              fontSize: 14,
              fontWeight: 500,
              color: "rgba(255, 255, 255, 0.78)",
            }}>
              {NAV_LINKS.map((link, i) => (
                <Link key={i} to={link.href} style={{
                  color: "inherit",
                  textDecoration: "none",
                  transition: "color 0.2s",
                  whiteSpace: "nowrap",
                }}
                  onMouseEnter={(e) => (e.target.style.color = "white")}
                  onMouseLeave={(e) => (e.target.style.color = "rgba(255, 255, 255, 0.78)")}>
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ display: "inline-flex", marginRight: 4 }}>
                {false && <CountrySelectorPill mode="dark" compact={false} />}
              </div>

              <div ref={langRef} style={{ position: "relative" }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setLangOpen((v) => !v); }}
                  style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1.5px solid rgba(255, 255, 255, 0.18)",
                    backdropFilter: "blur(10px)", color: "white",
                    fontSize: 12, fontWeight: 700, letterSpacing: "0.05em",
                    cursor: "pointer",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 1,
                    transition: "all 0.25s ease", position: "relative", zIndex: 2,
                  }}
                >
                  <span>{lang}</span>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6, transform: langOpen ? "rotate(180deg)" : "none", transition: "transform 0.3s" }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div style={{
                  position: "absolute", top: 48, left: "50%",
                  transform: langOpen ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(-10px)",
                  background: isSaudi ? "rgba(0, 25, 12, 0.95)" : "rgba(26, 2, 3, 0.95)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  backdropFilter: "blur(20px)", borderRadius: 14, padding: 6,
                  display: "flex", flexDirection: "column", gap: 2, minWidth: 56,
                  opacity: langOpen ? 1 : 0, visibility: langOpen ? "visible" : "hidden",
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)", zIndex: 100,
                }}>
                  {SUPPORTED_LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={(e) => { e.stopPropagation(); setLang(l.code); setLangOpen(false); }}
                      style={{
                        width: "100%", padding: "8px 12px",
                        background: l.code === lang ? accent : "transparent",
                        border: "none",
                        color: l.code === lang ? "white" : "rgba(255, 255, 255, 0.75)",
                        fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
                        borderRadius: 9, cursor: "pointer",
                        boxShadow: l.code === lang ? (isSaudi ? "0 2px 8px rgba(0, 108, 53, 0.4)" : "0 2px 8px rgba(227, 10, 23, 0.4)") : "none",
                        transition: "all 0.2s",
                      }}
                    >{l.code}</button>
                  ))}
                </div>
              </div>
              <a href="/login" style={{
                fontSize: 14, fontWeight: 600,
                color: "rgba(255, 255, 255, 0.85)",
                padding: "10px 16px", textDecoration: "none",
                transition: "color 0.2s", whiteSpace: "nowrap",
              }}>{t("lv2.nav.signin")}</a>
              <a href="/register" style={{
                display: "inline-flex", alignItems: "center",
                whiteSpace: "nowrap", gap: 8,
                background: `linear-gradient(135deg, ${accent} 0%, ${accentDeep} 100%)`,
                color: "white", fontSize: 14, fontWeight: 700,
                padding: "11px 20px", borderRadius: 12, textDecoration: "none",
                boxShadow: isSaudi ? "0 8px 20px rgba(0, 108, 53, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)" : "0 8px 20px rgba(227, 10, 23, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              }}>
                <span>{t("lv2.cta.start")}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
          )}

          {isMobile && (
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1.5px solid rgba(255, 255, 255, 0.2)",
                color: "white",
                borderRadius: 10,
                padding: "8px 12px",
                fontSize: 22,
                lineHeight: 1,
                cursor: "pointer",
                backdropFilter: "blur(10px)",
              }}
            >
              ☰
            </button>
          )}
        </div>
      </nav>
{isMobile && (
        <>
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.6)",
              zIndex: 998,
              opacity: mobileOpen ? 1 : 0,
              pointerEvents: mobileOpen ? "auto" : "none",
              transition: "opacity 0.3s ease",
            }}
          />
          <aside
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "min(85vw, 320px)",
              background: isSaudi ? "rgba(0, 25, 12, 0.98)" : "rgba(26, 2, 3, 0.98)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              zIndex: 999,
              transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
              transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              display: "flex",
              flexDirection: "column",
              padding: "20px 20px 24px",
              boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.4)",
              overflowY: "auto",
            }}
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
            }}>
              <img
                src={getLogo(lang, true)}
                alt="Zyrix FinSuite"
                style={{ height: 32, width: "auto" }}
              />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1.5px solid rgba(255, 255, 255, 0.15)",
                  color: "white",
                  borderRadius: 8,
                  width: 36,
                  height: 36,
                  fontSize: 20,
                  lineHeight: 1,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 24 }}>
              {NAV_LINKS.map((link, i) => (
                <Link
                  key={i}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    color: "rgba(255, 255, 255, 0.9)",
                    textDecoration: "none",
                    fontSize: 15,
                    fontWeight: 600,
                    padding: "12px 14px",
                    borderRadius: 10,
                    transition: "background 0.2s",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div style={{ height: 1, background: "rgba(255, 255, 255, 0.1)", marginBottom: 20 }} />

            <div style={{ marginBottom: 16 }}>
              {false && <CountrySelectorPill mode="dark" compact={false} />}
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                color: "rgba(255, 255, 255, 0.5)", marginBottom: 8, textTransform: "uppercase",
              }}>Language</div>
              <div style={{ display: "flex", gap: 6 }}>
                {SUPPORTED_LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    style={{
                      flex: 1, padding: "10px 0",
                      background: l.code === lang ? accent : "rgba(255, 255, 255, 0.06)",
                      border: l.code === lang ? "none" : "1px solid rgba(255, 255, 255, 0.12)",
                      color: l.code === lang ? "white" : "rgba(255, 255, 255, 0.7)",
                      fontSize: 13, fontWeight: 700, letterSpacing: "0.05em",
                      borderRadius: 10, cursor: "pointer",
                    }}
                  >{l.code}</button>
                ))}
              </div>
            </div>

            <div style={{ flex: 1 }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              
                <a
              
                href="/login"
                onClick={() => setMobileOpen(false)}
                style={{
                  textAlign: "center",
                  padding: "12px 16px",
                  fontSize: 14, fontWeight: 600,
                  color: "rgba(255, 255, 255, 0.9)",
                  background: "rgba(255, 255, 255, 0.06)",
                  border: "1.5px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: 12, textDecoration: "none",
                }}
              >
                {t("lv2.nav.signin")}
              </a>
              <a
              
                href="/register"
                onClick={() => setMobileOpen(false)}
                style={{
                  textAlign: "center",
                  padding: "13px 16px",
                  fontSize: 14, fontWeight: 700,
                  background: `linear-gradient(135deg, ${accent} 0%, ${accentDeep} 100%)`,
                  color: "white",
                  borderRadius: 12, textDecoration: "none",
                  boxShadow: isSaudi ? "0 8px 20px rgba(0, 108, 53, 0.4)" : "0 8px 20px rgba(227, 10, 23, 0.4)",
                }}
              >
                {t("lv2.cta.start")}
              </a>
            </div>
          </aside>
        </>
      )}
    </>
  );
}