	// ================================================================
// Zyrix FinSuite — Landing Page V2
// Turkish red/wine theme · Trilingual TR/AR/EN · matches design ref
// ================================================================

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useI18n, SUPPORTED_LANGS } from "../i18n/i18n";
import BosphorusBridge from "../components/landing-v2/BosphorusBridge";
import TurkishFlag from "../components/landing-v2/TurkishFlag";
import GalataTower from "../components/landing-v2/GalataTower";
import TabletMockup from "../components/landing-v2/TabletMockup";
import KingdomTower from "../components/landing-v2/KingdomTower";
import SaudiFlag from "../components/landing-v2/SaudiFlag";
import RiyadhSkyline from "../components/landing-v2/RiyadhSkyline";
import BurjMamlakaWatermark from "../components/landing-v2/BurjMamlakaWatermark";

import NavV2 from "../components/NavV2.jsx";
import FooterV2 from "../components/FooterV2.jsx";
import { WhyUsSection, SectorsSection, IntegrationsSection, FAQSection, WhatsAppWidget } from "../components/landing-v2/NewSections";

import { useCountry } from "../hooks/useCountry.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";
import { useIsMobile } from "../hooks/useIsMobile";

// ── Color palette ────────────────────────────────────────────
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

// Saudi palette (used when lang === "AR")
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

// Theme resolver: returns Saudi or Turkish palette based on lang
const getTheme = (lang) => (lang === "AR" ? SA : C);
const getLogo = (lang, dark) => {
  return dark ? "/images/zyrix-logo-horizontal-dark.png" : "/images/zyrix-logo-horizontal.png";
};

// ── HERO ─────────────────────────────────────────────────────
function Hero() {
  const { t, lang, isRTL } = useI18n();
  const isSaudi = lang === "AR";
  const isMobile = useIsMobile();

  return (
    <section style={{
      position: "relative",
      background: isSaudi ? SA.green950 : C.wine950,
      color: "white",
      overflow: "hidden",
      padding: isMobile ? "70px 0 40px" : "130px 0 0",
      minHeight: isMobile ? "auto" : "100vh",
    }}>
      {/* Mesh background */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: isSaudi ? `
          radial-gradient(ellipse 900px 700px at 75% 45%, rgba(0, 140, 70, 0.55), transparent 60%),
          radial-gradient(ellipse 700px 500px at 25% 30%, rgba(0, 100, 50, 0.4), transparent 65%),
          radial-gradient(ellipse 600px 400px at 50% 100%, rgba(0, 60, 30, 0.7), transparent 70%),
          linear-gradient(135deg, #003D1D 0%, #00532A 35%, #002914 70%, #00190C 100%)
        ` : `
          radial-gradient(ellipse 900px 700px at 75% 45%, rgba(168, 8, 26, 0.65), transparent 60%),
          radial-gradient(ellipse 700px 500px at 25% 30%, rgba(122, 7, 16, 0.4), transparent 65%),
          radial-gradient(ellipse 600px 400px at 50% 100%, rgba(74, 7, 12, 0.7), transparent 70%),
          linear-gradient(135deg, #2A0306 0%, #4A070C 35%, #1A0205 70%, #0F0103 100%)
        `,
        pointerEvents: "none",
      }} />

      {/* Grid overlay */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
        maskImage: "radial-gradient(ellipse 80% 60% at 60% 50%, black 20%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 60% 50%, black 20%, transparent 80%)",
        pointerEvents: "none",
      }} />

      {/* Watermark layers — Saudi for AR, Turkish otherwise */}
      {isSaudi ? (
        <>
          <RiyadhSkyline />
          <SaudiFlag />
          <KingdomTower />
        </>
      ) : (
        <>
          <BosphorusBridge />
          <TurkishFlag />
          <GalataTower />
        </>
      )}

      {/* Orbs */}
      <div style={{ position: "absolute", borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none", right: "8%", top: "18%", width: 500, height: 500, background: isSaudi ? "rgba(0, 140, 70, 0.45)" : "rgba(227, 10, 23, 0.45)" }} />
      <div style={{ position: "absolute", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none", left: "35%", bottom: "30%", width: 320, height: 320, background: isSaudi ? "rgba(14, 165, 113, 0.12)" : "rgba(255, 61, 48, 0.12)" }} />
      <div style={{ position: "absolute", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none", right: "15%", bottom: "35%", width: 420, height: 420, background: isSaudi ? "rgba(0, 80, 40, 0.22)" : "rgba(184, 5, 15, 0.22)" }} />

      {/* Body */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "0 16px" : "0 32px" }}>
        <div style={{
          position: "relative",
          zIndex: 10,
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1.1fr",
          gap: 56,
          padding: "24px 0 100px",
          alignItems: "start",
        }}>
          {/* LEFT */}
          <div style={{ position: "relative", zIndex: 11 }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(255, 255, 255, 0.07)",
              border: "1px solid rgba(255, 255, 255, 0.14)",
              padding: "9px 16px",
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.92)",
              backdropFilter: "blur(20px)",
              marginBottom: 28,
            }}>
              <span style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: C.emerald,
                boxShadow: `0 0 10px ${C.emerald}, 0 0 0 4px rgba(16, 185, 129, 0.2)`,
              }} />
              <span>{t("lv2.hero.badge")}</span>
            </div>

            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              fontSize: "clamp(40px, 5.5vw, 68px)",
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.035em",
              marginBottom: 24,
            }}>
              <span>{t("lv2.hero.title1")}</span><br />
              <span style={{
                backgroundImage: isSaudi
                  ? `linear-gradient(135deg, ${SA.greenSoft} 0%, ${SA.greenBright} 50%, ${SA.green} 100%)`
                  : `linear-gradient(135deg, ${C.redSoft} 0%, ${C.redBright} 50%, ${C.red} 100%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                position: "relative",
                display: "inline-block",
              }}>{t("lv2.hero.titleAccent")}</span><br />
              <span>{t("lv2.hero.title2")}</span>
            </h1>

            <p style={{
              fontSize: isMobile ? 16 : 19,
              lineHeight: 1.6,
              color: "rgba(255, 245, 245, 0.95)",
              fontWeight: 500,
              maxWidth: 500,
              marginBottom: 36,
            }}>{t("lv2.hero.sub")}</p>

            <div style={{ display: "flex", gap: 14, marginBottom: 40, flexWrap: "wrap" }}>
              <a href="/register" style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: isSaudi
                  ? `linear-gradient(135deg, ${SA.green900} 0%, ${SA.green950} 100%)`
                  : `linear-gradient(135deg, ${C.red} 0%, ${C.redDeep} 100%)`,
                color: "white",
                fontSize: 15,
                fontWeight: 700,
                padding: "16px 28px",
                borderRadius: 14,
                textDecoration: "none",
                boxShadow: isSaudi
                  ? "0 16px 36px rgba(0, 25, 12, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.18)"
                  : "0 16px 36px rgba(227, 10, 23, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.25)",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
              }}>
                <span>{t("lv2.cta.startFree")}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isRTL ? "scaleX(-1)" : "none" }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
              <a href="#cashflow" style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(255, 255, 255, 0.08)",
                color: "white",
                fontSize: 15,
                fontWeight: 600,
                padding: "16px 26px",
                borderRadius: 14,
                border: "1px solid rgba(255, 255, 255, 0.18)",
                backdropFilter: "blur(10px)",
                textDecoration: "none",
                transition: "all 0.3s",
              }}>
                <span style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: isSaudi ? SA.green900 : C.red,
                  display: "grid",
                  placeItems: "center",
                  boxShadow: isSaudi ? "0 4px 12px rgba(0, 25, 12, 0.6)" : "0 4px 12px rgba(227, 10, 23, 0.5)",
                }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
                </span>
                <span>{t("lv2.cta.watchDemo")}</span>
              </a>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ display: "flex" }}>
                {["AY", "MK", "SE", "FB"].map((label, i) => (
                  <span key={i} style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    border: `2.5px solid ${isSaudi ? SA.green950 : C.wine950}`,
                    background: isSaudi ? [
                      `linear-gradient(135deg, ${SA.green}, ${SA.green700})`,
                      `linear-gradient(135deg, ${SA.greenBright}, ${SA.green})`,
                      `linear-gradient(135deg, ${SA.green700}, ${SA.green900})`,
                      `linear-gradient(135deg, ${SA.greenSoft}, ${SA.greenBright})`,
                    ][i] : [
                      `linear-gradient(135deg, ${C.red}, ${C.wine700})`,
                      `linear-gradient(135deg, ${C.redBright}, ${C.red})`,
                      `linear-gradient(135deg, ${C.wine700}, ${C.wine900})`,
                      `linear-gradient(135deg, ${C.redSoft}, ${C.redBright})`,
                    ][i],
                    marginLeft: i === 0 ? 0 : -10,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "white",
                    display: "grid",
                    placeItems: "center",
                  }}>{label}</span>
                ))}
              </div>
              <div style={{
                fontSize: 13,
                color: "rgba(255, 235, 235, 0.7)",
                lineHeight: 1.4,
              }}>
                <strong style={{ display: "block", color: "white", fontSize: 14, fontWeight: 700 }}>
                  <span style={{ color: C.amber, letterSpacing: 1 }}>★★★★★</span> 4.9/5
                </strong>
                <span>{t("lv2.hero.users")}</span>
              </div>
            </div>
          </div>

          {/* RIGHT — TABLET MOCKUP */}
          <div style={{ position: "relative", zIndex: 11 }}>
            <TabletMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── TRUST BAR ─────────────────────────────────────────────────
function TrustBar() {
  const { t, lang } = useI18n();
  const isMobile = useIsMobile();
  const isSaudi = lang === "AR";
  const items = [
    { title: t("lv2.trust.gib.title"),     desc: t("lv2.trust.gib.desc"),     icon: <><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></> },
    { title: t("lv2.trust.kvkk.title"),    desc: t("lv2.trust.kvkk.desc"),    icon: <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></> },
    { title: "%99.9",                       desc: t("lv2.trust.uptime.desc"),  icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/> },
    { title: t("lv2.trust.support.title"), desc: t("lv2.trust.support.desc"), icon: <><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1v-7h3v5zM3 19a2 2 0 002 2h1v-7H3v5z"/></> },
  ];
  return (
    <div style={{ position: "relative", zIndex: 30, marginTop: isMobile ? -20 : -60, padding: isMobile ? "0 16px" : "0 32px" }}>
      <div style={{
        maxWidth: 1180,
        margin: "0 auto",
        background: "white",
        borderRadius: isMobile ? 20 : 36,
        padding: isMobile ? "20px 18px" : "28px 36px",
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
        gap: isMobile ? 16 : 32,
        boxShadow: isMobile
          ? "0 12px 28px rgba(42, 3, 6, 0.10), 0 0 0 1px " + C.hairline
          : "0 28px 60px rgba(42, 3, 6, 0.12), 0 0 0 1px " + C.hairline,
        position: "relative",
      }}>
        <div style={{
          content: "",
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 80,
          height: 4,
          background: isSaudi
            ? `linear-gradient(90deg, transparent, ${SA.green}, transparent)`
            : `linear-gradient(90deg, transparent, ${C.red}, transparent)`,
          borderRadius: 4,
        }} />
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 14 }}>
            <div style={{
              width: isMobile ? 38 : 48,
              height: isMobile ? 38 : 48,
              flexShrink: 0,
              borderRadius: isMobile ? 11 : 14,
              background: isSaudi
                ? `linear-gradient(135deg, ${SA.green50}, ${SA.green100})`
                : `linear-gradient(135deg, ${C.wine50}, ${C.wine100})`,
              display: "grid",
              placeItems: "center",
              color: isSaudi ? SA.greenDeep : C.redDeep,
              border: `1px solid ${isSaudi ? SA.hairline : C.hairline}`,
            }}>
              <svg width={isMobile ? 18 : 22} height={isMobile ? 18 : 22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {item.icon}
              </svg>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                fontSize: isMobile ? 12 : 14,
                fontWeight: 800,
                color: C.ink,
                letterSpacing: "-0.01em",
                marginBottom: 2,
                whiteSpace: isMobile ? "nowrap" : "normal",
                overflow: isMobile ? "hidden" : "visible",
                textOverflow: isMobile ? "ellipsis" : "clip",
              }}>{item.title}</div>
              <div style={{
                fontSize: isMobile ? 10.5 : 12,
                color: C.muted,
                lineHeight: 1.35,
                whiteSpace: isMobile ? "nowrap" : "normal",
                overflow: isMobile ? "hidden" : "visible",
                textOverflow: isMobile ? "ellipsis" : "clip",
              }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PROBLEM / SOLUTION ────────────────────────────────────────
function ProblemSolution() {
  const { t, lang } = useI18n();
  const isMobile = useIsMobile();
  const isSaudi = lang === "AR";
  const problems = [t("lv2.ps.p1"), t("lv2.ps.p2"), t("lv2.ps.p3"), t("lv2.ps.p4")];
  const solutions = [t("lv2.ps.s1"), t("lv2.ps.s2"), t("lv2.ps.s3"), t("lv2.ps.s4")];

  return (
    <section style={{ padding: isMobile ? "64px 16px" : "120px 32px", position: "relative" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: 700, margin: isMobile ? "0 auto 36px" : "0 auto 64px" }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "monospace",
            fontSize: isMobile ? 13 : 18,
            fontWeight: 700,
            letterSpacing: isMobile ? "0.12em" : "0.18em",
            textTransform: "uppercase",
            color: isSaudi ? SA.green : C.red,
          }}>
            <span style={{ width: isMobile ? 18 : 24, height: 1, background: isSaudi ? SA.green : C.red }} />
            {t("lv2.ps.eyebrow")}
          </span>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            fontSize: lang === "AR" ? "clamp(40px, 4.8vw, 60px)" : "clamp(34px, 4vw, 50px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
            margin: "16px 0 18px",
            color: C.ink,
          }}>
            <span>{t("lv2.ps.title1")}</span>{" "}
            <span style={{
              backgroundImage: isSaudi
                ? `linear-gradient(135deg, ${SA.green} 0%, ${SA.greenDeep} 100%)`
                : `linear-gradient(135deg, ${C.red} 0%, ${C.redDeep} 100%)`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>{t("lv2.ps.title2")}</span>
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr auto 1fr",
          gap: isMobile ? 20 : 32,
          alignItems: "center",
          maxWidth: 1100,
          margin: "0 auto",
        }}>
          {/* PROBLEM CARD */}
          <div style={{
            background: "white",
            borderRadius: isMobile ? 20 : 28,
            padding: isMobile ? 22 : 36,
            border: `1px solid ${isSaudi ? SA.hairline : C.hairline}`,
            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "monospace",
              fontSize: isMobile ? 13 : 18,
              fontWeight: 700,
              letterSpacing: "0.12em",
              padding: isMobile ? "5px 11px" : "6px 14px",
              borderRadius: 100,
              marginBottom: isMobile ? 16 : 24,
              background: isSaudi ? SA.bgTinted : C.bgTinted,
              color: isSaudi ? SA.greenDeep : C.redDeep,
            }} dangerouslySetInnerHTML={{ __html: t("lv2.ps.problemTag") }} />
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              fontSize: isMobile ? 19 : 24,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: isMobile ? 16 : 22,
              color: C.ink,
            }} dangerouslySetInnerHTML={{ __html: t("lv2.ps.problemTitle") }} />
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14, padding: 0 }}>
              {problems.map((p, i) => (
                <li key={i} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: C.muted,
                }}>
                  <span style={{
                    flexShrink: 0,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    marginTop: 1,
                    background: isSaudi ? SA.bgTinted : C.bgTinted,
                    color: isSaudi ? SA.greenDeep : C.redDeep,
                  }}>×</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

{/* ARROW Z — replaced with logo */}
          <div style={{ position: "relative", width: isMobile ? 64 : 100, height: isMobile ? 64 : 100, display: "grid", placeItems: "center", margin: isMobile ? "0 auto" : 0 }}>
            <div style={{
              width: isMobile ? 56 : 90,
              height: isMobile ? 56 : 90,
              borderRadius: "50%",
              background: "white",
              display: "grid",
              placeItems: "center",
              padding: isMobile ? 9 : 14,
              boxShadow: isSaudi ? `
                0 0 0 8px rgba(0, 108, 53, 0.1),
                0 0 0 16px rgba(0, 108, 53, 0.05),
                0 16px 40px rgba(0, 108, 53, 0.25),
                inset 0 0 0 2px rgba(0, 108, 53, 0.15)
              ` : `
                0 0 0 8px rgba(227, 10, 23, 0.1),
                0 0 0 16px rgba(227, 10, 23, 0.05),
                0 16px 40px rgba(227, 10, 23, 0.25),
                inset 0 0 0 2px rgba(227, 10, 23, 0.15)
              `,
            }}>
              <img src={getLogo(lang, false)} alt="Zyrix" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            </div>
          </div>

          {/* SOLUTION CARD */}
          <div style={{
            background: isSaudi
              ? `linear-gradient(135deg, ${SA.green900} 0%, ${SA.green950} 100%)`
              : `linear-gradient(135deg, ${C.wine900} 0%, ${C.wine950} 100%)`,
            color: "white",
            borderRadius: isMobile ? 20 : 28,
            padding: isMobile ? 22 : 36,
            border: `1px solid ${isSaudi ? SA.green700 : C.wine700}`,
            boxShadow: isSaudi
              ? "0 24px 60px rgba(0, 25, 12, 0.45)"
              : "0 24px 60px rgba(42, 3, 6, 0.45)",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute",
              top: "-50%",
              right: "-20%",
              width: 300,
              height: 300,
              background: isSaudi
                ? "radial-gradient(circle, rgba(0, 140, 70, 0.4), transparent 70%)"
                : "radial-gradient(circle, rgba(227, 10, 23, 0.4), transparent 70%)",
              pointerEvents: "none",
            }} />
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "monospace",
              fontSize: isMobile ? 13 : 18,
              fontWeight: 700,
              letterSpacing: "0.12em",
              padding: isMobile ? "5px 11px" : "6px 14px",
              borderRadius: 100,
              marginBottom: isMobile ? 16 : 24,
              background: "rgba(16, 185, 129, 0.15)",
              color: C.emerald,
              border: "1px solid rgba(16, 185, 129, 0.3)",
              position: "relative",
            }} dangerouslySetInnerHTML={{ __html: t("lv2.ps.solutionTag") }} />
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              fontSize: isMobile ? 19 : 24,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              marginBottom: isMobile ? 16 : 22,
              color: "white",
              position: "relative",
            }} dangerouslySetInnerHTML={{ __html: t("lv2.ps.solutionTitle") }} />
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14, padding: 0, position: "relative" }}>
              {solutions.map((s, i) => (
                <li key={i} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: "rgba(255, 255, 255, 0.85)",
                }}>
                  <span style={{
                    flexShrink: 0,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    marginTop: 1,
                    background: "rgba(16, 185, 129, 0.2)",
                    color: C.emerald,
                  }}>✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FEATURES (Interactive Tabs) ───────────────────────────────
function Features() {
  const { t, lang, isRTL } = useI18n();
  const isMobile = useIsMobile();
  const isSaudi = lang === "AR";
  const [activeTab, setActiveTab] = useState("invoice");

  const tabs = [
    { key: "invoice",  label: t("lv2.feat.tab1"), icon: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></> },
    { key: "crm",      label: t("lv2.feat.tab2"), icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></> },
    { key: "payment",  label: t("lv2.feat.tab3"), icon: <><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></> },
    { key: "ai",       label: t("lv2.feat.tab4"), icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26"/> },
    { key: "mobile",   label: t("lv2.feat.tab5"), icon: <><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12" y2="18"/></> },
  ];

  const featContent = {
    invoice: {
      TR: { title: "Saniyeler içinde profesyonel e-Fatura", desc: "GİB onaylı altyapı ile e-Fatura ve e-Arşiv süreçlerinizi otomatikleştirin. KDV hesaplamaları otomatik, vergi raporları her zaman hazır.", bullets: ["Tek tıkla e-Fatura gönderimi", "Otomatik KDV ve vergi hesaplama", "PDF, XML ve UBL formatları", "Toplu fatura ve fatura şablonları"] },
      EN: { title: "Professional e-Invoices in seconds", desc: "Automate e-Invoice and e-Archive with GİB-approved infrastructure. VAT calculations are automatic, tax reports always ready.", bullets: ["One-click e-Invoice delivery", "Auto VAT and tax calculation", "PDF, XML and UBL formats", "Bulk invoicing & templates"] },
      AR: { title: "فواتير إلكترونية احترافية في ثوانٍ", desc: "أتمتة الفاتورة والأرشيف الإلكتروني ببنية معتمدة من GİB. حسابات الضريبة تلقائية والتقارير جاهزة دائماً.", bullets: ["إرسال فاتورة بنقرة واحدة", "حساب ضريبة تلقائي", "صيغ PDF و XML و UBL", "فوترة جماعية وقوالب جاهزة"] },
    },
    crm: {
      TR: { title: "CRM gücü ile müşteri ilişkilerinizi büyütün", desc: "Müşteri geçmişi, satış pipeline ve takipler aynı sistemde. Hangi müşteriniz ne aldı, kim takipte — her şey net.", bullets: ["Görsel satış pipeline", "Müşteri segmentasyonu", "Otomatik takip hatırlatmaları", "Teklif → fatura tek akışta"] },
      EN: { title: "Grow customer relationships with CRM power", desc: "Customer history, sales pipeline and follow-ups in one system. Who bought what, who needs a follow-up — all clear.", bullets: ["Visual sales pipeline", "Customer segmentation", "Automated follow-up reminders", "Quote → invoice in one flow"] },
      AR: { title: "نَمِّ علاقات عملائك بقوة CRM", desc: "سجل العميل، خط المبيعات، والمتابعات في نظام واحد. من اشترى ماذا ومن يحتاج متابعة — كل شيء واضح.", bullets: ["خط مبيعات بصري", "تقسيم العملاء", "تذكيرات متابعة تلقائية", "عرض ← فاتورة في تدفق واحد"] },
    },
    payment: {
      TR: { title: "Tahsilatlarınızı otomatik pilota alın", desc: "Vadesi gelen ödemeler için otomatik hatırlatma, tahsilat takibi ve nakit akışı tahmini. Borçlar artık unutulmaz.", bullets: ["Otomatik ödeme hatırlatmaları", "Çoklu para birimi desteği", "Nakit akışı tahmini", "Vade analizi ve raporlama"] },
      EN: { title: "Put collections on autopilot", desc: "Automatic reminders for due payments, collection tracking and cash flow forecasting. No more forgotten debts.", bullets: ["Automated payment reminders", "Multi-currency support", "Cash flow forecasting", "Aging analysis & reporting"] },
      AR: { title: "ضع التحصيل على الطيار الآلي", desc: "تذكيرات تلقائية للمدفوعات المستحقة، متابعة التحصيل، وتوقعات التدفق النقدي. لا مزيد من الديون المنسية.", bullets: ["تذكيرات دفع تلقائية", "دعم متعدد العملات", "توقعات التدفق النقدي", "تحليل أعمار الديون وتقارير"] },
    },
    ai: {
      TR: { title: "AI iş asistanı 24 saat yanınızda", desc: "Gemini destekli AI asistan; gelir, müşteri ve tahsilat verilerinizi analiz eder. Hangi müşteri ödeyecek, hangi fatura gecikecek — önceden bilirsiniz.", bullets: ["AI tahsilat tahmin motoru", "Anormal harcama tespiti", "Müşteri risk skorlama", "Türkçe doğal dil sorgulama"] },
      EN: { title: "AI business assistant — always on", desc: "Gemini-powered AI assistant analyzes your revenue, customers and collections. You'll know which customer will pay and which invoice will be late — in advance.", bullets: ["AI collection forecasting", "Anomaly detection", "Customer risk scoring", "Natural language queries"] },
      AR: { title: "مساعد AI للأعمال — دائماً معك", desc: "مساعد مدعوم بـ Gemini يحلل إيراداتك وعملاءك والتحصيل. ستعرف مسبقاً من سيدفع وأي فاتورة ستتأخر.", bullets: ["محرك توقعات تحصيل بـ AI", "كشف الإنفاق الشاذ", "تقييم مخاطر العملاء", "استفسارات بلغة طبيعية"] },
    },
    mobile: {
      TR: { title: "İşiniz cebinizde — iOS & Android", desc: "Yolda fatura kes, mobilden tahsilat takip et, müşterilere anında ulaş. Web'de yapabildiğiniz her şey cebinizde.", bullets: ["Mobil fatura kesme ve gönderme", "Push bildirimler ile anlık takip", "Offline mod desteği", "Tek hesapta web + mobil senkron"] },
      EN: { title: "Your business in your pocket — iOS & Android", desc: "Issue invoices on the go, track collections from your phone, reach customers instantly. Everything from web, in your pocket.", bullets: ["Mobile invoice creation", "Real-time push notifications", "Offline mode support", "Web + mobile sync, one account"] },
      AR: { title: "عملك في جيبك — iOS و Android", desc: "أصدر فواتير وأنت في الطريق، تابع التحصيل من جوالك، وتواصل مع العملاء فوراً. كل ما في الويب، في جيبك.", bullets: ["إنشاء فواتير من الجوال", "إشعارات فورية مباشرة", "دعم وضع عدم الاتصال", "مزامنة ويب + جوال بحساب واحد"] },
    },
  };

  const data = featContent[activeTab][lang] || featContent[activeTab].TR;

  return (
    <section id="features" style={{
      background: isSaudi
        ? `linear-gradient(180deg, white 0%, ${SA.bgTinted} 100%)`
        : `linear-gradient(180deg, white 0%, ${C.bgTinted} 100%)`,
      padding: isMobile ? "64px 16px" : "120px 32px",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: 700, margin: isMobile ? "0 auto 32px" : "0 auto 48px" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontFamily: "monospace", fontSize: isMobile ? 13 : 18, fontWeight: 700,
            letterSpacing: isMobile ? "0.12em" : "0.18em", textTransform: "uppercase", color: isSaudi ? SA.green : C.red,
          }}>
            <span style={{ width: isMobile ? 18 : 24, height: 1, background: isSaudi ? SA.green : C.red }} />
            {t("lv2.feat.eyebrow")}
          </span>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            fontSize: "clamp(34px, 4vw, 50px)", fontWeight: 800,
            letterSpacing: "-0.03em", lineHeight: 1.1,
            margin: "16px 0 18px", color: C.ink,
          }}>
            <span>{t("lv2.feat.title1")}</span>{" "}
            <span style={{
              backgroundImage: isSaudi
                ? `linear-gradient(135deg, ${SA.green} 0%, ${SA.greenDeep} 100%)`
                : `linear-gradient(135deg, ${C.red} 0%, ${C.redDeep} 100%)`,
              WebkitBackgroundClip: "text", backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>{t("lv2.feat.title2")}</span>
          </h2>
          <p style={{ fontSize: isMobile ? 14 : 17, color: C.muted, lineHeight: 1.6 }}>{t("lv2.feat.sub")}</p>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", justifyContent: "center", flexWrap: "wrap", gap: isMobile ? 6 : 8,
          marginBottom: isMobile ? 28 : 48, background: "white", border: `1px solid ${isSaudi ? SA.hairline : C.hairline}`,
          borderRadius: isMobile ? 24 : 100, padding: isMobile ? 5 : 6, width: isMobile ? "100%" : "fit-content",
          maxWidth: isMobile ? "100%" : "none",
          marginLeft: "auto", marginRight: "auto",
          boxShadow: isSaudi ? "0 1px 2px rgba(0, 25, 12, 0.04)" : "0 1px 2px rgba(42, 3, 6, 0.04)",
        }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: isMobile ? "8px 12px" : "11px 20px", fontSize: isMobile ? 12 : 13, fontWeight: 600,
              color: activeTab === tab.key ? "white" : C.muted,
              borderRadius: 100,
              display: "inline-flex", alignItems: "center", gap: 8,
              transition: "all 0.3s", whiteSpace: "nowrap",
              background: activeTab === tab.key
                ? (isSaudi ? `linear-gradient(135deg, ${SA.green} 0%, ${SA.greenDeep} 100%)` : `linear-gradient(135deg, ${C.red} 0%, ${C.redDeep} 100%)`)
                : "transparent",
              border: "none", cursor: "pointer", fontFamily: "inherit",
              boxShadow: activeTab === tab.key
                ? (isSaudi ? "0 16px 40px rgba(0, 108, 53, 0.25)" : "0 16px 40px rgba(227, 10, 23, 0.25)")
                : "none",
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: isMobile ? 13 : 16, height: isMobile ? 13 : 16 }}>
                {tab.icon}
              </svg>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Panel */}
        <div style={{
          display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.2fr",
          gap: isMobile ? 28 : 64, alignItems: "center",
          maxWidth: 1180, margin: "0 auto", minHeight: isMobile ? "auto" : 440,
        }}>
          {/* Content */}
          <div>
            <div style={{
              fontFamily: "monospace", fontSize: isMobile ? 12 : 18, fontWeight: 700,
              letterSpacing: isMobile ? "0.12em" : "0.18em", textTransform: "uppercase",
              color: isSaudi ? SA.green : C.red, marginBottom: isMobile ? 10 : 16,
            }}>Zyrix FinSuite • {activeTab.toUpperCase()}</div>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              fontSize: isMobile ? 24 : 38, fontWeight: 800, letterSpacing: "-0.025em",
              lineHeight: 1.15, marginBottom: isMobile ? 12 : 18, color: C.ink,
            }}>{data.title}</h3>
            <p style={{ fontSize: isMobile ? 14 : 16, color: C.muted, lineHeight: 1.6, marginBottom: isMobile ? 18 : 28 }}>{data.desc}</p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 14, marginBottom: 32, padding: 0 }}>
              {data.bullets.map((b, i) => (
                <li key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  fontSize: 14, fontWeight: 500, color: C.inkSoft,
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke={C.emerald} strokeWidth="2.5" style={{ flexShrink: 0, width: 22, height: 22, marginTop: 1 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <a href="#" style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 14, fontWeight: 700, color: isSaudi ? SA.green : C.red, textDecoration: "none",
            }}>
              <span>{lang === "AR" ? "اعرف المزيد" : (lang === "EN" ? "Learn more" : "Detayları İncele")}</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16, transform: isRTL ? "scaleX(-1)" : "none" }}>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Visual */}
          <div style={{
            position: "relative", background: "white", borderRadius: isMobile ? 22 : 36,
            padding: isMobile ? 16 : 28, border: `1px solid ${isSaudi ? SA.hairline : C.hairline}`,
            boxShadow: isMobile
              ? (isSaudi ? "0 12px 28px rgba(0, 25, 12, 0.10), 0 0 0 4px " + SA.bgTinted : "0 12px 28px rgba(42, 3, 6, 0.10), 0 0 0 4px " + C.bgTinted)
              : (isSaudi ? "0 28px 60px rgba(0, 25, 12, 0.12), 0 0 0 8px " + SA.bgTinted : "0 28px 60px rgba(42, 3, 6, 0.12), 0 0 0 8px " + C.bgTinted),
          }}>
            <div style={{
              position: "absolute", top: -2, left: -2, right: -2, height: 4,
              background: isSaudi
                ? `linear-gradient(90deg, ${SA.green}, ${SA.greenBright}, ${SA.green})`
                : `linear-gradient(90deg, ${C.red}, ${C.redBright}, ${C.red})`,
              borderRadius: isMobile ? "22px 22px 0 0" : "36px 36px 0 0",
            }} />
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${isSaudi ? SA.hairline : C.hairline}`,
            }}>
              <div style={{
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                fontSize: 16, fontWeight: 800, color: C.ink,
              }}>{data.title.split(" ").slice(0, 4).join(" ")}</div>
              <div style={{
                fontSize: 11, fontWeight: 600, padding: "5px 10px",
                borderRadius: 100, background: C.emeraldSoft, color: C.emerald,
                display: "inline-flex", alignItems: "center", gap: 5,
              }}>● {lang === "AR" ? "نشط" : (lang === "EN" ? "Active" : "Aktif")}</div>
            </div>

            {/* Tab-specific mockups */}
            {activeTab === "invoice" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {[
                    { lbl: lang === "AR" ? "هذا الشهر" : (lang === "EN" ? "This Month" : "Bu Ay"), val: "324", trend: "↑ 18%", clr: C.emerald },
                    { lbl: lang === "AR" ? "معتمدة" : (lang === "EN" ? "Approved" : "Onaylı"), val: "298", trend: "92%", clr: C.emerald },
                    { lbl: lang === "AR" ? "قيد الانتظار" : (lang === "EN" ? "Pending" : "Bekleyen"), val: "26", trend: "8%", clr: C.amber },
                  ].map((s, i) => (
                    <div key={i} style={{ background: C.bgTinted, padding: 14, borderRadius: 12 }}>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{s.lbl}</div>
                      <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 22, fontWeight: 800, color: C.ink }}>{s.val}</div>
                      <div style={{ fontSize: 11, color: s.clr, fontWeight: 600 }}>{s.trend}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: C.bgTinted, padding: 16, borderRadius: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{lang === "AR" ? "INV-2026-0247" : "FT-2026-0247"}</div>
                    <div style={{ background: C.emeraldSoft, color: C.emerald, padding: "3px 10px", borderRadius: 100, fontSize: 10, fontWeight: 700 }}>{lang === "AR" ? "معتمد ZATCA" : (lang === "EN" ? "ZATCA Approved" : "GİB Onaylı")}</div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted, marginBottom: 6 }}><span>{lang === "AR" ? "شركة الأفق المحدودة" : (lang === "EN" ? "ABC Ltd. Co." : "ABC Ltd. Şti.")}</span><span>{lang === "AR" ? "25,000 ر.س" : (lang === "EN" ? "$25,000" : "₺25.000")}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.muted, marginBottom: 6 }}><span>{lang === "AR" ? "ضريبة القيمة المضافة (15%)" : (lang === "EN" ? "VAT (18%)" : "KDV (%18)")}</span><span>{lang === "AR" ? "3,750 ر.س" : (lang === "EN" ? "$4,500" : "₺4.500")}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${C.hairline}`, paddingTop: 8, marginTop: 8, fontWeight: 800 }}><span>{lang === "AR" ? "الإجمالي" : (lang === "EN" ? "Total" : "Toplam")}</span><span style={{ color: C.red }}>{lang === "AR" ? "28,750 ر.س" : (lang === "EN" ? "$29,500" : "₺29.500")}</span></div>
                </div>
              </div>
            )}

            {activeTab === "crm" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(lang === "AR" ? [
                  { stage: "عميل محتمل",  count: 42, val: formatCurrency("850K", profile, lang), clr: "#94a3b8" },
                  { stage: "محادثة",      count: 18, val: formatCurrency("420K", profile, lang), clr: C.amber },
                  { stage: "عرض سعر",     count: 9,  val: formatCurrency("285K", profile, lang), clr: C.redBright },
                  { stage: "فاز بالصفقة", count: 24, val: formatCurrency("680K", profile, lang), clr: C.emerald },
                ] : (lang === "EN" ? [
                  { stage: "Lead",         count: 42, val: formatCurrency("850K", profile, lang), clr: "#94a3b8" },
                  { stage: "Conversation", count: 18, val: formatCurrency("420K", profile, lang), clr: C.amber },
                  { stage: "Proposal",     count: 9,  val: formatCurrency("285K", profile, lang), clr: C.redBright },
                  { stage: "Won",          count: 24, val: formatCurrency("680K", profile, lang), clr: C.emerald },
                ] : [
                  { stage: "Lead",       count: 42, val: formatCurrency("850K", profile, lang), clr: "#94a3b8" },
                  { stage: "Görüşme",    count: 18, val: formatCurrency("420K", profile, lang), clr: C.amber },
                  { stage: "Teklif",     count: 9,  val: formatCurrency("285K", profile, lang), clr: C.redBright },
                  { stage: "Kazanıldı",  count: 24, val: formatCurrency("680K", profile, lang), clr: C.emerald },
                ])).map((s, i) => (
                  <div key={i} style={{ background: C.bgTinted, padding: 14, borderRadius: 12, borderLeft: `3px solid ${s.clr}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{s.stage}</div>
                      <div style={{ background: "white", padding: "2px 8px", borderRadius: 100, fontSize: 10, fontWeight: 700 }}>{s.count}</div>
                    </div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 18, fontWeight: 800, color: C.ink }}>{s.val}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "payment" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ background: C.bgTinted, padding: 16, borderRadius: 12 }}>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 6, fontFamily: "monospace", letterSpacing: "0.1em" }}>{lang === "AR" ? "التدفق النقدي · 30 يوم" : (lang === "EN" ? "CASH FLOW · 30 DAYS" : "NAKIT AKIŞI · 30 GÜN")}</div>
                  <svg viewBox="0 0 280 80" style={{ width: "100%", height: 80 }}>
                    <defs>
                      <linearGradient id="cfFillV2" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#E30A17" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#E30A17" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <path d="M0,60 L40,55 L80,40 L120,45 L160,30 L200,35 L240,18 L280,10 L280,80 L0,80 Z" fill="url(#cfFillV2)"/>
                    <path d="M0,60 L40,55 L80,40 L120,45 L160,30 L200,35 L240,18 L280,10" fill="none" stroke="#E30A17" strokeWidth="2.5"/>
                    <circle cx="280" cy="10" r="4" fill="#E30A17"/>
                  </svg>
                </div>
                {(lang === "AR" ? [
                  { lbl: "مستحق اليوم",      val: formatCurrency("48,500", profile, lang), clr: C.emerald },
                  { lbl: "تأخير 1-7 أيام",   val: formatCurrency("23,200", profile, lang), clr: C.amber },
                  { lbl: "8-30 يوم",          val: formatCurrency("15,800", profile, lang), clr: C.redBright },
                ] : (lang === "EN" ? [
                  { lbl: "Due today",     val: formatCurrency("48,500", profile, lang), clr: C.emerald },
                  { lbl: "1-7 days late", val: formatCurrency("23,200", profile, lang), clr: C.amber },
                  { lbl: "8-30 days",     val: formatCurrency("15,800", profile, lang), clr: C.redBright },
                ] : [
                  { lbl: "Bugün vadesi",     val: formatCurrency("48.500", profile, lang), clr: C.emerald },
                  { lbl: "1-7 gün gecikme",  val: formatCurrency("23.200", profile, lang), clr: C.amber },
                  { lbl: "8-30 gün",         val: formatCurrency("15.800", profile, lang), clr: C.redBright },
                ])).map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: C.bgTinted, borderRadius: 10, borderLeft: `3px solid ${r.clr}` }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{r.lbl}</span>
                    <span style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontWeight: 800 }}>{r.val}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "ai" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ background: `linear-gradient(135deg, ${C.bgTinted}, ${C.wine100})`, padding: 16, borderRadius: 12, border: `1px solid ${C.wine100}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${C.red}, ${C.redDeep})`, display: "grid", placeItems: "center", color: "white" }}>✨</div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{lang === "AR" ? "مساعد AI" : (lang === "EN" ? "AI Assistant" : "AI Asistanı")}</div>
                  </div>
                  <p style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.6, marginBottom: 10 }} dangerouslySetInnerHTML={{ __html: lang === "AR" ? "توقع التحصيل لهذا الأسبوع: <strong>186,500 ر.س</strong>. شركة الأفق ستدفع في الموعد باحتمال 92%." : (lang === "EN" ? "This week collection forecast: <strong>$186,500</strong>. ABC Ltd. will pay on time with 92% probability." : "Bu hafta tahsilat tahmini: <strong>₺186.500</strong>. ABC Ltd. %92 olasilikla zamaninda ödeyecek.") }} />
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ background: "white", padding: "4px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600, color: C.red }}>{lang === "AR" ? "دقة عالية" : (lang === "EN" ? "High accuracy" : "Yüksek doğruluk")}</span>
                    <span style={{ background: "white", padding: "4px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600, color: C.muted }}>Gemini 2.0</span>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ background: C.bgTinted, padding: 14, borderRadius: 12, textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{lang === "AR" ? "دقة التنبؤ" : (lang === "EN" ? "Forecast Accuracy" : "Tahmin Doğruluğu")}</div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 22, fontWeight: 800, color: C.red }}>94.2%</div>
                  </div>
                  <div style={{ background: C.bgTinted, padding: 14, borderRadius: 12, textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{lang === "AR" ? "مستوى المخاطر" : (lang === "EN" ? "Risk Score" : "Risk Skoru")}</div>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', system-ui", fontSize: 22, fontWeight: 800, color: C.emerald }}>{lang === "AR" ? "منخفض" : (lang === "EN" ? "Low" : "Düşük")}</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "mobile" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignItems: "center" }}>
                <div style={{ aspectRatio: "9/16", background: lang === "AR" ? `linear-gradient(180deg, ${SA.green950}, ${SA.green900})` : `linear-gradient(180deg, ${C.wine950}, ${C.wine900})`, borderRadius: 24, padding: 14, border: lang === "AR" ? `8px solid ${SA.green950}` : `8px solid ${C.wine950}`, position: "relative" }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", textAlign: "center", marginBottom: 8 }}>9:41</div>
                  <div style={{ background: lang === "AR" ? "rgba(0,108,53,0.25)" : "rgba(227,10,23,0.2)", padding: 10, borderRadius: 10, color: "white", fontSize: 11, fontWeight: 700, marginBottom: 8 }}>{lang === "AR" ? "مرحباً أحمد 👋" : (lang === "EN" ? "Hello, Ahmed 👋" : "Merhaba, Ahmet 👋")}</div>
                  <div style={{ background: "rgba(255,255,255,0.05)", padding: 10, borderRadius: 10, marginBottom: 6 }}>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>{lang === "AR" ? "الإيرادات" : (lang === "EN" ? "Revenue" : "Ciro")}</div>
                    <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>{formatCurrency(lang === "TR" ? "1.250.000" : "1,250,000", profile, lang)}</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.05)", padding: 10, borderRadius: 10, marginBottom: 8 }}>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>{lang === "AR" ? "معلّق" : (lang === "EN" ? "Pending" : "Bekleyen")}</div>
                    <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>{formatCurrency(lang === "TR" ? "245.000" : "245,000", profile, lang)}</div>
                  </div>
                  <div style={{ background: lang === "AR" ? `linear-gradient(135deg, ${SA.green}, ${SA.greenDeep})` : `linear-gradient(135deg, ${C.red}, ${C.redDeep})`, padding: 8, borderRadius: 8, color: "white", fontSize: 10, fontWeight: 700, textAlign: "center" }}>{lang === "AR" ? "+ فاتورة جديدة" : (lang === "EN" ? "+ New Invoice" : "+ Yeni Fatura")}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ background: lang === "AR" ? SA.bgTinted : C.bgTinted, padding: 14, borderRadius: 12 }}>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{lang === "AR" ? "📲 الإشعارات" : (lang === "EN" ? "📲 Notifications" : "📲 Bildirimler")}</div>
                    <div style={{ fontSize: 12, color: C.ink, fontWeight: 600, lineHeight: 1.5 }}>{lang === "AR" ? "شركة الأفق دفعت فاتورتك: 25,000 ر.س" : (lang === "EN" ? "ABC Ltd. paid your invoice: $25,000" : "ABC Ltd. faturanızı ödedi: ₺25.000")}</div>
                  </div>
                  <div style={{ background: lang === "AR" ? SA.bgTinted : C.bgTinted, padding: 14, borderRadius: 12 }}>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{lang === "AR" ? "⚡ وضع غير متصل" : (lang === "EN" ? "⚡ Offline Mode" : "⚡ Çevrimdışı Mod")}</div>
                    <div style={{ fontSize: 12, color: C.ink, fontWeight: 600, lineHeight: 1.5 }}>{lang === "AR" ? "أصدر فواتير حتى بدون إنترنت، ثم تستلقائياً." : (lang === "EN" ? "Issue invoices even offline, then they sync automatically." : "İnternet yokken bile fatura kes, sonra senkronize olur.")}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <div style={{ flex: 1, background: "#000", color: "white", padding: 8, borderRadius: 8, fontSize: 10, textAlign: "center", fontWeight: 700 }}>App Store</div>
                    <div style={{ flex: 1, background: "#000", color: "white", padding: 8, borderRadius: 8, fontSize: 10, textAlign: "center", fontWeight: 700 }}>Google Play</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── DEMO CTA ──────────────────────────────────────────────────
function CashflowCTA() {
  const { t, lang, isRTL } = useI18n();
  const isMobile = useIsMobile();
  const isSaudi = lang === "AR";
  return (
    <section id="cashflow" style={{ padding: isMobile ? "48px 16px 64px" : "80px 32px 120px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{
          background: isSaudi
            ? `linear-gradient(135deg, ${SA.green700} 0%, ${SA.green900} 50%, ${SA.green950} 100%)`
            : `linear-gradient(135deg, ${C.wine700} 0%, ${C.wine900} 50%, ${C.wine950} 100%)`,
          borderRadius: isMobile ? 22 : 36,
          padding: isMobile ? 28 : 64,
          color: "white",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1.3fr 1fr",
          gap: isMobile ? 28 : 56,
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          boxShadow: isMobile
            ? (isSaudi ? "0 14px 32px rgba(0, 25, 12, 0.40)" : "0 14px 32px rgba(42, 3, 6, 0.40)")
            : (isSaudi ? "0 24px 60px rgba(0, 25, 12, 0.45)" : "0 24px 60px rgba(42, 3, 6, 0.45)"),
        }}>
          <div style={{
            position: "absolute",
            top: isMobile ? -60 : -100,
            right: isMobile ? -60 : -100,
            width: isMobile ? 220 : 400,
            height: isMobile ? 220 : 400,
            background: isSaudi
              ? "radial-gradient(circle, rgba(0, 140, 70, 0.5), transparent 70%)"
              : "radial-gradient(circle, rgba(227, 10, 23, 0.5), transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{
              fontFamily: "monospace", fontSize: isMobile ? 12 : 18, fontWeight: 700,
              letterSpacing: isMobile ? "0.12em" : "0.18em", textTransform: "uppercase",
              color: isSaudi ? SA.greenSoft : C.redSoft, marginBottom: isMobile ? 10 : 16,
            }}>{t("lv2.demo.eyebrow")}</div>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              fontSize: isMobile ? 26 : 42, fontWeight: 800, lineHeight: 1.15,
              letterSpacing: "-0.025em", marginBottom: isMobile ? 14 : 20,
            }} dangerouslySetInnerHTML={{ __html: t("lv2.demo.title") }} />
            <p style={{
              fontSize: isMobile ? 14 : 16, color: "rgba(255, 235, 235, 0.78)",
              lineHeight: 1.6, marginBottom: isMobile ? 20 : 28, maxWidth: 460,
            }}>{t("lv2.demo.desc")}</p>

            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: isMobile ? 10 : 12, marginBottom: isMobile ? 22 : 32, padding: 0 }}>
              {[t("lv2.demo.check1"), t("lv2.demo.check2"), t("lv2.demo.check3")].map((c, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "rgba(255, 255, 255, 0.92)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.emerald} strokeWidth="2.5" style={{ flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{c}</span>
                </li>
              ))}
            </ul>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="/register" style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: isSaudi
                  ? `linear-gradient(135deg, ${SA.green} 0%, ${SA.greenDeep} 100%)`
                  : `linear-gradient(135deg, ${C.red} 0%, ${C.redDeep} 100%)`,
                color: "white", fontSize: isMobile ? 14 : 15, fontWeight: 700,
                padding: isMobile ? "13px 22px" : "16px 28px", borderRadius: 14,
                textDecoration: "none",
                boxShadow: isSaudi
                  ? "0 16px 36px rgba(0, 108, 53, 0.45)"
                  : "0 16px 36px rgba(227, 10, 23, 0.45)",
              }}>
                <span>{t("lv2.demo.cta1")}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isRTL ? "scaleX(-1)" : "none" }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a href="#" style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: "rgba(255, 255, 255, 0.08)", color: "white",
                fontSize: isMobile ? 14 : 15, fontWeight: 600, padding: isMobile ? "13px 20px" : "16px 26px",
                borderRadius: 14, border: "1px solid rgba(255, 255, 255, 0.18)",
                textDecoration: "none",
              }}>{t("lv2.demo.cta2")}</a>
            </div>
          </div>

          <div style={{
            position: "relative", zIndex: 1,
            aspectRatio: "4/3",
            background: "linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.2))",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: isMobile ? 18 : 28, display: "grid", placeItems: "center",
            cursor: "pointer", overflow: "hidden",
          }}>
            <div style={{
              position: "relative", width: isMobile ? 60 : 84, height: isMobile ? 60 : 84, borderRadius: "50%",
              background: "white", display: "grid", placeItems: "center",
              boxShadow: isMobile
                ? "0 10px 24px rgba(0,0,0,0.4), 0 0 0 8px rgba(255, 255, 255, 0.1), 0 0 0 16px rgba(255, 255, 255, 0.05)"
                : "0 16px 40px rgba(0,0,0,0.4), 0 0 0 12px rgba(255, 255, 255, 0.1), 0 0 0 24px rgba(255, 255, 255, 0.05)",
            }}>
              <svg width={isMobile ? 24 : 32} height={isMobile ? 24 : 32} viewBox="0 0 24 24" fill={isSaudi ? SA.green : C.red}>
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── PRICING ───────────────────────────────────────────────────
function Pricing() {
  const { t, lang, isRTL } = useI18n();
  const { profile } = useCountry();
  const isMobile = useIsMobile();
  const isSaudi = lang === "AR";
  // Country-specific pricing (matches /pricing page exactly)
  const COUNTRY_PRICING_LANDING = {
    TR: { starter: 199, growth: 499 },
    SA: { starter: 69,  growth: 179 },
    AE: { starter: 69,  growth: 179 },
    EG: { starter: 299, growth: 799 },
    KW: { starter: 5,   growth: 15  },
    QA: { starter: 69,  growth: 179 },
    BH: { starter: 7,   growth: 18  },
    OM: { starter: 7,   growth: 18  },
    JO: { starter: 13,  growth: 35  },
    US: { starter: 19,  growth: 49  },
  };
  const cp = COUNTRY_PRICING_LANDING[profile?.code] || COUNTRY_PRICING_LANDING.TR;
  const P = {
    starter: formatCurrency(cp.starter, profile, lang),
    growth:  formatCurrency(cp.growth,  profile, lang),
  };
  const plans = [
    {
      name: "Starter", price: P.starter, popular: false, isCustom: false,
      desc: t("lv2.price.starterDesc"),
      features: [t("lv2.price.s1"), t("lv2.price.s2"), t("lv2.price.s3"), t("lv2.price.s4"), t("lv2.price.s5")],
      btn: t("lv2.cta.startFree"),
    },
    {
      name: "Growth", price: P.growth, popular: true, isCustom: false,
      desc: t("lv2.price.businessDesc"),
      features: [t("lv2.price.b1"), t("lv2.price.b2"), t("lv2.price.b3"), t("lv2.price.b4"), t("lv2.price.b5"), t("lv2.price.b6")],
      btn: t("lv2.cta.startFree"),
    },
    {
      name: "Scale", price: "Custom", popular: false, isCustom: true,
      desc: t("lv2.price.proDesc"),
      features: [t("lv2.price.p1"), t("lv2.price.p2"), t("lv2.price.p3"), t("lv2.price.p4"), t("lv2.price.p5"), t("lv2.price.p6")],
      btn: t("lv2.price.contact"),
    },
  ];


  return (
    <section id="pricing" style={{ background: "white", padding: isMobile ? "64px 16px" : "120px 32px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: 700, margin: isMobile ? "0 auto 36px" : "0 auto 64px" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontFamily: "monospace", fontSize: isMobile ? 13 : 18, fontWeight: 700,
            letterSpacing: isMobile ? "0.12em" : "0.18em", textTransform: "uppercase", color: isSaudi ? SA.green : C.red,
          }}>
            <span style={{ width: isMobile ? 18 : 24, height: 1, background: isSaudi ? SA.green : C.red }} />
            {t("lv2.price.eyebrow")}
          </span>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            fontSize: "clamp(34px, 4vw, 50px)", fontWeight: 800,
            letterSpacing: "-0.03em", lineHeight: 1.1,
            margin: "16px 0 18px", color: C.ink,
          }}>
            <span>{t("lv2.price.title1")}</span>{" "}
            <span style={{
              backgroundImage: isSaudi
                ? `linear-gradient(135deg, ${SA.green} 0%, ${SA.greenDeep} 100%)`
                : `linear-gradient(135deg, ${C.red} 0%, ${C.redDeep} 100%)`,
              WebkitBackgroundClip: "text", backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>{t("lv2.price.title2")}</span>
          </h2>
          <p style={{ fontSize: isMobile ? 14 : 17, color: C.muted, lineHeight: 1.6 }}>{t("lv2.price.sub")}</p>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          gap: isMobile ? 16 : 24, maxWidth: 1180, margin: "0 auto", alignItems: "stretch",
        }}>
          {plans.map((plan, i) => (
            <div key={i} style={{
              background: plan.popular
                ? (isSaudi ? `linear-gradient(135deg, ${SA.green900} 0%, ${SA.green950} 100%)` : `linear-gradient(135deg, ${C.wine900} 0%, ${C.wine950} 100%)`)
                : "white",
              color: plan.popular ? "white" : C.ink,
              border: plan.popular ? "none" : `1px solid ${isSaudi ? SA.hairline : C.hairline}`,
              borderRadius: isMobile ? 20 : 28,
              padding: isMobile ? "28px 22px" : "36px 32px",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              transform: plan.popular && !isMobile ? "scale(1.04)" : "none",
              boxShadow: plan.popular
                ? (isMobile
                    ? (isSaudi ? "0 14px 32px rgba(0, 25, 12, 0.40)" : "0 14px 32px rgba(42, 3, 6, 0.40)")
                    : (isSaudi ? "0 24px 60px rgba(0, 25, 12, 0.45)" : "0 24px 60px rgba(42, 3, 6, 0.45)"))
                : "none",
              transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              overflow: "visible",
            }}>
              {plan.popular && (
                <>
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: isMobile ? 20 : 28,
                    overflow: "hidden", pointerEvents: "none",
                  }}>
                    <div style={{
                      position: "absolute", top: isMobile ? -30 : -50, right: isMobile ? -30 : -50,
                      width: isMobile ? 160 : 240, height: isMobile ? 160 : 240,
                      background: isSaudi
                        ? "radial-gradient(circle, rgba(0, 140, 70, 0.45), transparent 70%)"
                        : "radial-gradient(circle, rgba(227, 10, 23, 0.45), transparent 70%)",
                    }} />
                  </div>
                  <div style={{
                    position: "absolute", top: -14, left: "50%",
                    transform: "translateX(-50%)",
                    background: isSaudi
                      ? `linear-gradient(135deg, ${SA.green}, ${SA.greenDeep})`
                      : `linear-gradient(135deg, ${C.red}, ${C.redDeep})`,
                    color: "white", fontSize: 11, fontWeight: 800,
                    padding: "6px 16px", borderRadius: 100,
                    letterSpacing: "0.05em",
                    boxShadow: isSaudi
                      ? "0 16px 40px rgba(0, 108, 53, 0.25)"
                      : "0 16px 40px rgba(227, 10, 23, 0.25)",
                    whiteSpace: "nowrap",
                  }}>{t("lv2.price.popular")}</div>
                </>
              )}

              <div style={{ position: "relative" }}>
                <div style={{
                  fontSize: isMobile ? 16 : 18, fontWeight: 800, letterSpacing: "-0.02em",
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  marginBottom: 6, color: plan.popular ? "white" : C.ink,
                }}>{plan.name}</div>

                <div style={{
                  fontSize: isMobile ? 12.5 : 13, marginBottom: isMobile ? 20 : 28,
                  color: plan.popular ? "rgba(255, 255, 255, 0.65)" : C.muted,
                }}>{plan.desc}</div>

                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: isMobile ? 20 : 28 }}>
                  <strong style={{
                    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                    fontSize: isMobile ? 36 : 48, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1,
                  }}>{plan.price}</strong>
                  {!plan.isCustom && (
                    <span style={{
                      fontSize: isMobile ? 13 : 14, fontWeight: 500,
                      color: plan.popular ? "rgba(255,255,255,0.65)" : C.muted,
                    }}>{t("lv2.price.month")}</span>
                  )}
                </div>

                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: isMobile ? 10 : 12, marginBottom: isMobile ? 22 : 32, padding: 0, flexGrow: 1 }}>
                  {plan.features.map((f, j) => (
                    <li key={j} style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      fontSize: 14, fontWeight: 500,
                      color: plan.popular ? "rgba(255, 255, 255, 0.92)" : C.inkSoft,
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={plan.popular ? C.emeraldSoft : C.emerald} strokeWidth="3" style={{ flexShrink: 0, marginTop: 2 }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <a href="/register" style={{
                  display: "inline-flex", justifyContent: "center", alignItems: "center", gap: 8,
                  width: "100%", padding: isMobile ? "12px 16px" : "14px 20px",
                  fontSize: isMobile ? 13 : 14, fontWeight: 700,
                  borderRadius: 14, textDecoration: "none",
                  background: plan.popular
                    ? (isSaudi ? `linear-gradient(135deg, ${SA.green}, ${SA.greenDeep})` : `linear-gradient(135deg, ${C.red}, ${C.redDeep})`)
                    : (isSaudi ? SA.bgTinted : C.bgTinted),
                  color: plan.popular ? "white" : (isSaudi ? SA.greenDeep : C.redDeep),
                  border: plan.popular ? "none" : `1px solid ${isSaudi ? SA.green100 : C.wine100}`,
                  boxShadow: plan.popular
                    ? (isSaudi ? "0 16px 40px rgba(0, 108, 53, 0.25)" : "0 16px 40px rgba(227, 10, 23, 0.25)")
                    : "none",
                  transition: "all 0.3s",
                }}>
                  <span>{plan.btn}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isRTL ? "scaleX(-1)" : "none" }}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: isMobile ? 32 : 48 }}>
          <a href="/pricing" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: isMobile ? "10px 20px" : "12px 24px",
            fontSize: isMobile ? 13 : 14, fontWeight: 700,
            color: isSaudi ? SA.greenDeep : C.redDeep,
            background: "transparent",
            border: "1.5px solid " + (isSaudi ? SA.green100 : C.wine100),
            borderRadius: 12, textDecoration: "none",
            transition: "all 0.2s",
          }}>
            <span>{lang === "AR" ? "عرض كل التفاصيل والمقارنة" : lang === "TR" ? "Tüm detayları ve karşılaştırmayı gör" : "View full pricing & comparison"}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isRTL ? "scaleX(-1)" : "none" }}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

// ── TESTIMONIALS (Static 3x2 grid — no slider) ──
function Testimonials() {
  const { t, lang } = useI18n();
  const isMobile = useIsMobile();
  const isSaudi = lang === "AR";

  const colorPairs = isSaudi ? [
    [SA.green, SA.green700],
    [SA.greenBright, SA.green],
    [SA.green700, SA.green900],
    [SA.greenSoft, SA.greenBright],
    [SA.green, SA.greenDeep],
    [SA.green900, SA.green950],
  ] : [
    [C.red, C.wine700],
    [C.redBright, C.red],
    [C.wine700, C.wine900],
    [C.redSoft, C.redBright],
    [C.red, C.redDeep],
    [C.wine900, C.wine950],
  ];

  const getInitials = (name) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  const items = Array.from({ length: 6 }, (_, i) => {
    const name = t(`lv2.tm.n${i + 1}`);
    return {
      q: t(`lv2.tm.q${i + 1}`),
      n: name,
      r: t(`lv2.tm.r${i + 1}`),
      avatar: getInitials(name),
      clr1: colorPairs[i][0],
      clr2: colorPairs[i][1],
    };
  });

  return (
    <section id="testimonials" style={{ background: isSaudi ? SA.bgTinted : C.bgTinted, padding: isMobile ? "64px 16px" : "120px 32px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: 700, margin: isMobile ? "0 auto 36px" : "0 auto 64px" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontFamily: "monospace", fontSize: isMobile ? 13 : 18, fontWeight: 700,
            letterSpacing: isMobile ? "0.12em" : "0.18em", textTransform: "uppercase", color: isSaudi ? SA.green : C.red,
          }}>
            <span style={{ width: isMobile ? 18 : 24, height: 1, background: isSaudi ? SA.green : C.red }} />
            {t("lv2.tm.eyebrow")}
          </span>
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            fontSize: "clamp(34px, 4vw, 50px)", fontWeight: 800,
            letterSpacing: "-0.03em", lineHeight: 1.1,
            margin: "16px 0 18px", color: C.ink,
          }}>
            <span>{t("lv2.tm.title1")}</span>{" "}
            <span style={{
              backgroundImage: isSaudi
                ? `linear-gradient(135deg, ${SA.green} 0%, ${SA.greenDeep} 100%)`
                : `linear-gradient(135deg, ${C.red} 0%, ${C.redDeep} 100%)`,
              WebkitBackgroundClip: "text", backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>{t("lv2.tm.title2")}</span>
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          gap: isMobile ? 14 : 24,
        }}>
          {items.map((item, i) => (
            <div key={i} style={{
              background: "white", borderRadius: isMobile ? 18 : 24, padding: isMobile ? 22 : 32,
              border: `1px solid ${C.hairline}`,
              boxShadow: isMobile ? "0 4px 14px rgba(42, 3, 6, 0.05)" : "0 8px 24px rgba(42, 3, 6, 0.06)",
              display: "flex", flexDirection: "column",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(42, 3, 6, 0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(42, 3, 6, 0.06)"; }}
            >
              <div style={{ marginBottom: isMobile ? 14 : 20, color: C.amber, fontSize: isMobile ? 15 : 18, letterSpacing: 2 }}>★★★★★</div>
              <p style={{
                fontSize: isMobile ? 13.5 : 15, lineHeight: 1.65, color: C.inkSoft,
                marginBottom: isMobile ? 18 : 24, flexGrow: 1, minHeight: isMobile ? "auto" : 130,
              }}>"{item.q}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 12 }}>
                <div style={{
                  width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, flexShrink: 0, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${item.clr1}, ${item.clr2})`,
                  display: "grid", placeItems: "center",
                  color: "white", fontSize: isMobile ? 13 : 15, fontWeight: 700,
                  boxShadow: `0 4px 12px ${item.clr1}40`,
                }}>{item.avatar}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 700, color: C.ink, marginBottom: 2 }}>{item.n}</div>
                  <div style={{ fontSize: isMobile ? 11.5 : 12, color: C.muted, lineHeight: 1.4 }}>{item.r}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FINAL CTA ────────────────────────────────────────────────
function FinalCTA() {
  const { t, lang, isRTL } = useI18n();
  const isMobile = useIsMobile();
  const isSaudi = lang === "AR";
  return (
    <section style={{
      background: isSaudi
        ? `linear-gradient(135deg, ${SA.green} 0%, ${SA.greenDeep} 50%, ${SA.green900} 100%)`
        : `linear-gradient(135deg, ${C.red} 0%, ${C.redDeep} 50%, ${C.wine900} 100%)`,
      padding: isMobile ? "56px 16px" : "100px 32px", position: "relative", overflow: "hidden",
    }}>
      <svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        opacity: 0.08, pointerEvents: "none",
      }}>
        {isSaudi ? (
          <>
            {/* Saudi flag elements: Shahada strokes + sword */}
            <path d="M 100 180 Q 200 165 300 180 T 500 180" fill="none" stroke="white" strokeWidth="14" strokeLinecap="round" />
            <path d="M 120 155 Q 220 142 320 155 T 480 155" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" />
            {/* Sword below */}
            <path d="M 100 250 L 460 250 L 490 240 L 490 260 Z" fill="white" />
            <rect x="80" y="240" width="22" height="20" rx="2" fill="white" />
            <circle cx="74" cy="250" r="6" fill="white" />
            <rect x="100" y="234" width="4" height="32" fill="white" />
          </>
        ) : (
          <>
            <circle cx="220" cy="200" r="100" fill="white" />
            <circle cx="250" cy="200" r="82" fill={C.red} />
            <polygon points="380 200 350 213 365 175 358 200 380 200 358 200 365 225" fill="white" transform="translate(20 0)" />
          </>
        )}
      </svg>

      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
        <h2 style={{
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          fontSize: isMobile ? 28 : "clamp(36px, 4.5vw, 56px)", fontWeight: 800,
          letterSpacing: "-0.025em", lineHeight: 1.15,
          marginBottom: isMobile ? 14 : 20, color: "white",
        }}>{t("lv2.finalCta.title")}</h2>
        <p style={{
          fontSize: isMobile ? 14 : 18, color: "rgba(255, 255, 255, 0.85)",
          lineHeight: 1.6, marginBottom: isMobile ? 26 : 40,
        }}>{t("lv2.finalCta.sub")}</p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/register" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "white", color: isSaudi ? SA.green : C.red,
            fontSize: isMobile ? 14 : 15, fontWeight: 700,
            padding: isMobile ? "13px 24px" : "16px 32px", borderRadius: 14, textDecoration: "none",
            boxShadow: isMobile ? "0 8px 22px rgba(0, 0, 0, 0.18)" : "0 16px 40px rgba(0, 0, 0, 0.2)",
          }}>
            <span>{t("lv2.cta.startFree")}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isRTL ? "scaleX(-1)" : "none" }}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a href="#" style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "rgba(255, 255, 255, 0.12)",
            color: "white", fontSize: isMobile ? 14 : 15, fontWeight: 600,
            padding: isMobile ? "13px 22px" : "16px 30px", borderRadius: 14,
            border: "1px solid rgba(255, 255, 255, 0.25)",
            textDecoration: "none",
          }}>{t("lv2.cta.watchDemo")}</a>
        </div>
      </div>
    </section>
  );
}

// ── MAIN ─────────────────────────────────────────────────────

// -- Stats Strip (V2-ext) --
function StatsStrip() {
  const { t, lang } = useI18n();
  const { profile } = useCountry();
  const isMobile = useIsMobile();
  const isRTL = lang === "AR";
  const isSaudi = lang === "AR";

  const STATS = [
    { num: "14", key: "features", icon: "\u2726" },
    { num: "5+", key: "clients", icon: "\u25CF" },
    { num: "3", key: "languages", icon: "\u{1F310}" },
    { num: "81/110", key: "score", icon: "\u2197" },
    { num: formatCurrency(lang === "AR" ? "71" : lang === "EN" ? "19" : "499", profile, lang), key: "starting", icon: lang === "AR" ? "ر" : lang === "EN" ? "$" : "\u20BA" },
    { num: "14", key: "trial", icon: "\u2713" },
  ];

  return (
    <section
      style={{
        position: "relative",
        zIndex: 25,
        marginTop: isMobile ? "-28px" : "-52px",
        padding: isMobile ? "0 16px 56px" : "0 32px 84px",
        direction: isRTL ? "rtl" : "ltr",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", position: "relative" }}>
        <div
          style={{
            position: "absolute",
            inset: isMobile ? "-12px 20px auto" : "-24px 60px auto",
            height: isMobile ? 60 : 110,
            background: isSaudi
              ? "radial-gradient(circle at 50% 50%, rgba(0,108,53,.24), transparent 68%)"
              : "radial-gradient(circle at 50% 50%, rgba(227,10,23,.24), transparent 68%)",
            filter: isMobile ? "blur(20px)" : "blur(28px)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(6, minmax(0, 1fr))",
            background: "rgba(255,255,255,.94)",
            border: "1px solid " + (isSaudi ? SA.hairline : C.hairline),
            borderRadius: isMobile ? 18 : 30,
            boxShadow: isMobile
              ? (isSaudi ? "0 14px 40px rgba(0,25,12,.14), 0 4px 14px rgba(0,108,53,.08)" : "0 14px 40px rgba(58,5,9,.14), 0 4px 14px rgba(227,10,23,.08)")
              : (isSaudi ? "0 30px 90px rgba(0,25,12,.18), 0 8px 28px rgba(0,108,53,.10)" : "0 30px 90px rgba(58,5,9,.18), 0 8px 28px rgba(227,10,23,.10)"),
            overflow: "hidden",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.key}
              style={{
                position: "relative",
                padding: isMobile ? "16px 10px" : "24px 16px",
                textAlign: "center",
                minHeight: isMobile ? 92 : 120,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background:
                  i === 0 || i === STATS.length - 1
                    ? isSaudi
                      ? "linear-gradient(180deg,#FFFFFF 0%,#F2FBF6 100%)"
                      : "linear-gradient(180deg,#FFFFFF 0%,#FFF4F4 100%)"
                    : "#FFFFFF",
                borderInlineEnd:
                  isMobile
                    ? (i % 2 === 0 ? "1px solid " + (isSaudi ? SA.hairline : C.hairline) : "none")
                    : (i < STATS.length - 1 ? "1px solid " + (isSaudi ? SA.hairline : C.hairline) : "none"),
                borderBottom:
                  isMobile && i < 4
                    ? "1px solid " + (isSaudi ? SA.hairline : C.hairline)
                    : "none",
              }}
            >
              <div
                style={{
                  width: isMobile ? 30 : 40,
                  height: isMobile ? 30 : 40,
                  borderRadius: isMobile ? 11 : 15,
                  display: "grid",
                  placeItems: "center",
                  marginBottom: isMobile ? 7 : 11,
                  color: isSaudi ? SA.green : C.red,
                  background: isSaudi
                    ? "linear-gradient(135deg, rgba(0,108,53,.12), rgba(14,165,113,.06))"
                    : "linear-gradient(135deg, rgba(227,10,23,.12), rgba(255,59,48,.06))",
                  boxShadow: isSaudi
                    ? "0 10px 26px rgba(0,108,53,.14)"
                    : "0 10px 26px rgba(227,10,23,.14)",
                  fontWeight: 900,
                  fontSize: isMobile ? 12 : 15,
                }}
              >
                {s.icon}
              </div>

              <div
                style={{
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  fontSize: isMobile ? 24 : 34,
                  fontWeight: 900,
                  letterSpacing: "-0.045em",
                  lineHeight: 1,
                }}
              >
                <span
                  style={{
                    backgroundImage: isSaudi
                      ? "linear-gradient(135deg, " + SA.greenBright + ", " + SA.greenDeep + ")"
                      : "linear-gradient(135deg, " + C.redBright + ", " + C.redDeep + ")",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {s.num}
                </span>
              </div>

              <div
                style={{
                  marginTop: isMobile ? 6 : 9,
                  fontSize: isMobile ? 11 : 13,
                  color: isSaudi ? SA.muted : C.muted,
                  fontWeight: 800,
                  lineHeight: 1.3,
                }}
              >
                {t("lv2.strip." + s.key)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



function AIInvoiceDemoSection() {
  const { lang, isRTL } = useI18n();
  const { profile } = useCountry();
  const isArabic = lang === "AR";
  const T = isArabic ? SA : C;
  const [loading, setLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [pulseDashboard, setPulseDashboard] = useState(false);
  const [visibleMsgs, setVisibleMsgs] = useState([false, false, false]);
  const [inputValues, setInputValues] = useState(["", "", "", ""]);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const sectionRef = useRef(null);
  const [inView, setInView] = useState(false);

  const copy = {
    TR: {
      title1: "Faturalarınızı sadece kesmeyin —",
      titleAccent: "AI ile yönetin",
      subtitle: "Zyrix, fatura hareketlerinizi, tahsilat davranışınızı ve ödeme risklerinizi analiz ederek hangi aksiyonu ne zaman almanız gerektiğini gösterir.",
      chat1: "AI: Bu ayki fatura hareketlerinizi inceliyorum...",
      chat2: "AI: Tahsilat riski yükselen kayıtlar bulundu.",
      chat3: "AI: Nakit akışınızı korumak için öneriler hazırladım.",
      input1: "İşletme tipi",
      input2: "Fatura hacmi",
      input3: "Gecikme oranı",
      input4: "İşlem yoğunluğu",
      analyze: "AI ile Analiz Et",
      analyzeSub: "Saniyeler içinde akıllı içgörüler alın",
      analyzing: "Analiz ediliyor...",
      stat1: "Nakit Akışı",
      stat2: "Tahsilat Riski",
      stat3: "Öncelikli Takip",
      stat4: "Fırsat",
      suggestion: ["Öncelikli müşterilere hatırlatma gönderin", "Yüksek riskli faturaları bugün takip edin"],
      outcome1: "Geç tahsilatı azalt",
      outcome2: "Nakit akışını öngör",
      outcome3: "Fatura operasyonunu otomatikleştir",
      cta: "Gerçek Verilerimle Dene",
      orbit: ["Risk", "Cashflow", "Collection", "Action"],
    },
    AR: {
      title1: "لا تكتفِ بإصدار فواتيرك —",
      titleAccent: "بل أدِرها بالذكاء الاصطناعي",
      subtitle: "يحلل Zyrix حركات فواتيرك وسلوك التحصيل ومخاطر الدفع ليعرض لك الإجراء المناسب في الوقت المناسب.",
      chat1: "الذكاء: أحلّل حركات فواتيرك لهذا الشهر...",
      chat2: "الذكاء: تم اكتشاف سجلات بمخاطر تحصيل مرتفعة.",
      chat3: "الذكاء: جهّزت لك مقترحات لحماية تدفقك النقدي.",
      input1: "نوع النشاط",
      input2: "حجم الفواتير",
      input3: "نسبة التأخير",
      input4: "كثافة العمليات",
      analyze: "حلِّل بالذكاء الاصطناعي",
      analyzeSub: "احصل على رؤى ذكية في ثوانٍ",
      analyzing: "جارٍ التحليل...",
      stat1: "التدفق النقدي",
      stat2: "مخاطر التحصيل",
      stat3: "متابعة بالأولوية",
      stat4: "فرصة",
      suggestion: ["أرسل تذكيراً للعملاء ذوي الأولوية", "تابع الفواتير عالية المخاطر اليوم"],
      outcome1: "قلِّل التحصيل المتأخر",
      outcome2: "توقّع تدفقك النقدي",
      outcome3: "أتمتة عمليات الفوترة",
      cta: "جرّبها ببياناتي الحقيقية",
      orbit: ["مخاطر", "تدفق نقدي", "تحصيل", "إجراء"],
    },
    EN: {
      title1: "Don't just issue your invoices —",
      titleAccent: "manage them with AI",
      subtitle: "Zyrix analyzes your invoice activity, collection behavior, and payment risks to show you the right action at the right time.",
      chat1: "AI: Analyzing this month's invoice activity...",
      chat2: "AI: Found records with rising collection risk.",
      chat3: "AI: Prepared recommendations to protect your cashflow.",
      input1: "Business type",
      input2: "Invoice volume",
      input3: "Delay rate",
      input4: "Operation intensity",
      analyze: "Analyze with AI",
      analyzeSub: "Get smart insights in seconds",
      analyzing: "Analyzing...",
      stat1: "Cashflow",
      stat2: "Collection Risk",
      stat3: "Priority Follow-up",
      stat4: "Opportunity",
      suggestion: ["Send reminders to priority customers", "Follow up on high-risk invoices today"],
      outcome1: "Reduce late collection",
      outcome2: "Forecast your cashflow",
      outcome3: "Automate invoice operations",
      cta: "Try with My Real Data",
      orbit: ["Risk", "Cashflow", "Collection", "Action"],
    },
  };
  const c = copy[lang] || copy.TR;

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const t1 = setTimeout(() => setVisibleMsgs([true, false, false]), 200);
    const t2 = setTimeout(() => setVisibleMsgs([true, true, false]), 1100);
    const t3 = setTimeout(() => setVisibleMsgs([true, true, true]), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [inView]);

  useEffect(() => {
    if (!inView) return;
    const targets = [24, 18, 12, 82];
    const duration = 1400;
    const steps = 40;
    const stepTime = duration / steps;
    let current = 0;
    const id = setInterval(() => {
      current++;
      const p = current / steps;
      setCounts(targets.map((tv) => Math.round(tv * p)));
      if (current >= steps) clearInterval(id);
    }, stepTime);
    return () => clearInterval(id);
  }, [inView]);

  const computeTargetsFallback = () => {
    const volumeRaw = parseFloat(inputValues[1]) || 0;
    const delayRaw  = parseFloat(inputValues[2]) || 0;
    const opsRaw    = parseFloat(inputValues[3]) || 0;
    const businessLen = (inputValues[0] || "").trim().length;
    const cashflow = Math.max(-30, Math.min(60, Math.round((volumeRaw / 50) - delayRaw * 0.6 + (opsRaw / 20))));
    const risk = Math.max(0, Math.min(95, Math.round(delayRaw * 1.2 + (volumeRaw < 100 ? 8 : 0))));
    const priority = Math.max(0, Math.min(99, Math.round((volumeRaw / 30) + (delayRaw / 4))));
    const opportunity = Math.max(0, Math.min(999, Math.round((volumeRaw * 0.35) + (opsRaw * 0.5) + businessLen * 2)));
    return [cashflow, risk, priority, opportunity];
  };

  const animateToTargets = (targets) => {
    setPulseDashboard(true);
    const steps = 40;
    let current = 0;
    const id = setInterval(() => {
      current++;
      const p = current / steps;
      setCounts(targets.map((tv) => Math.round(tv * p)));
      if (current >= steps) clearInterval(id);
    }, 35);
    setTimeout(() => setPulseDashboard(false), 2200);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalyzed(false);
    setPulseDashboard(false);
    setAiSuggestion(null);
    setCounts([0, 0, 0, 0]);

    const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

    // Local deterministic analysis (no backend call).
    // Math mirrors AIAnalysisPage.computeFromValues:
    //   cashflow    = volume/50 - delay*0.6 + ops/20  bounded [-30, 60]
    //   risk        = delay*1.2 + (volume<100 ? 8 : 0) bounded [0, 95]
    //   priority    = volume/30 + delay/4              bounded [0, 99]
    //   opportunity = volume*0.35 + ops*0.5 + bizLen*2 bounded [0, 999]
    const _volume = parseFloat(inputValues[1]) || 0;
    const _delay = parseFloat(inputValues[2]) || 0;
    const _ops = parseFloat(inputValues[3]) || 0;
    const _bizLen = (inputValues[0] || "").trim().length;
    const _cashflow = Math.max(-30, Math.min(60, Math.round((_volume/50) - _delay*0.6 + (_ops/20))));
    const _risk = Math.max(0, Math.min(95, Math.round(_delay*1.2 + (_volume < 100 ? 8 : 0))));
    const _priority = Math.max(0, Math.min(99, Math.round((_volume/30) + (_delay/4))));
    const _opportunity = Math.max(0, Math.min(999, Math.round((_volume*0.35) + (_ops*0.5) + _bizLen*2)));
    const targets = [_cashflow, _risk, _priority, _opportunity];
    const suggestion = null;
  };

  const chatMessages = [c.chat1, c.chat2, c.chat3];
  const inputs = [c.input1, c.input2, c.input3, c.input4];

  const stats = [
    { label: c.stat1, value: (counts[0] >= 0 ? "+" : "") + counts[0] + "%", tone: "green" },
    { label: c.stat2, value: counts[1] + "%", tone: "red" },
    { label: c.stat3, value: String(counts[2]), tone: "indigo" },
    { label: c.stat4, value: (isArabic ? "" : "₺") + counts[3] + "K" + (isArabic ? " ر.س" : ""), tone: "amber" },
  ];

  const outcomes = [c.outcome1, c.outcome2, c.outcome3];

  const primaryGradient = isArabic
    ? "linear-gradient(135deg, " + SA.green + ", " + SA.greenDeep + ")"
    : "linear-gradient(135deg, " + C.red + ", " + C.redDeep + ")";

  const primaryGlow = isArabic
    ? "0 18px 40px rgba(0,108,53,.30)"
    : "0 18px 40px rgba(227,10,23,.30)";

  return (
    <section
      ref={sectionRef}
      className="ai-cmd-section"
      style={{
        position: "relative",
        padding: "120px 32px",
        background: isArabic
          ? "linear-gradient(180deg, #FFFFFF 0%, " + SA.bgTinted + " 100%)"
          : "linear-gradient(180deg, #FFFFFF 0%, " + C.bgTinted + " 100%)",
        overflow: "hidden",
        direction: isRTL ? "rtl" : "ltr",
      }}
    >
      <div className="ai-cmd-header" style={{ maxWidth: 1024, margin: "0 auto 64px", textAlign: "center" }}>
        <h2
          className="ai-cmd-h2"
          style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 900,
            lineHeight: 1.2,
            letterSpacing: "-0.04em",
            color: T.ink,
            margin: 0,
          }}
        >
          {c.title1}{" "}
          <span style={{ color: isArabic ? SA.green : C.red }}>
            {c.titleAccent}
          </span>
        </h2>
        <p
          className="ai-cmd-sub"
          style={{
            marginTop: 24,
            fontSize: 18,
            lineHeight: 1.7,
            color: T.muted,
            fontWeight: 600,
          }}
        >
          {c.subtitle}
        </p>
      </div>

      <div
        className="ai-cmd-grid"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 40,
          alignItems: "stretch",
        }}
      >
        {/* LEFT */}
        <div
          style={{
            background: "rgba(255,255,255,.85)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid " + T.hairline,
            borderRadius: 24,
            padding: 24,
            boxShadow: isArabic
              ? "0 18px 50px rgba(0,25,12,.07)"
              : "0 18px 50px rgba(58,5,9,.07)",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            opacity: 0.96,
          }}
          className="ai-cmd-card-left"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 168 }}>
            {chatMessages.map((m, i) => (
              <div
                key={i}
                style={{
                  background: i % 2 === 0 ? T.bgTinted : "#F3F4F6",
                  padding: 12,
                  borderRadius: 14,
                  fontSize: 13,
                  fontWeight: 600,
                  color: T.inkSoft,
                  lineHeight: 1.5,
                  textAlign: isRTL ? "right" : "left",
                  opacity: visibleMsgs[i] ? 1 : 0,
                  transform: visibleMsgs[i] ? "translateY(0)" : "translateY(8px)",
                  transition: "opacity .5s ease, transform .5s ease",
                }}
              >
                {m}
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18, marginBottom: 18 }}>
            {inputs.map((ph, i) => (
              <input
                key={i}
                placeholder={ph}
                value={inputValues[i]}
                onChange={(e) => {
                  const next = [...inputValues];
                  next[i] = e.target.value;
                  setInputValues(next);
                }}
                style={{
                  padding: isRTL ? "10px 14px 10px 10px" : "10px 12px",
                  border: "1px solid " + T.hairline,
                  borderRadius: 10,
                  fontSize: 13,
                  fontFamily: "inherit",
                  color: T.ink,
                  background: "#fff",
                  outline: "none",
                  textAlign: "center",
                  width: "100%",
                  boxSizing: "border-box",
                  direction: isRTL ? "rtl" : "ltr",
                }}
              />
            ))}
          </div>

          <button
            onClick={handleAnalyze}
            style={{
              width: "100%",
              marginTop: "auto",
              padding: "20px 16px",
              background: primaryGradient,
              color: "#fff",
              fontWeight: 800,
              fontSize: 16,
              border: "none",
              borderRadius: 14,
              cursor: "pointer",
              boxShadow: primaryGlow,
              fontFamily: "inherit",
              transition: "transform .2s, box-shadow .2s",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              lineHeight: 1.3,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
              e.currentTarget.style.boxShadow = isArabic
                ? "0 24px 56px rgba(0,108,53,.45)"
                : "0 24px 56px rgba(227,10,23,.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = primaryGlow;
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 900 }}>
              {loading ? c.analyzing : c.analyze}
            </span>
            {!loading && (
              <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.85 }}>
                {c.analyzeSub}
              </span>
            )}
          </button>
        </div>

        {/* CENTER AI CORE */}
        <div
          className="ai-cmd-core-wrap"
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 460,
            flexDirection: "column",
          }}
        >
          {/* Wide radial glow powering the entire section */}
          <div
            className="ai-cmd-glow-wide"
            style={{
              position: "absolute",
              width: 900,
              height: 900,
              borderRadius: "50%",
              background: isArabic
                ? "radial-gradient(circle at center, rgba(0,108,53,.14) 0%, rgba(0,108,53,.05) 35%, transparent 60%)"
                : "radial-gradient(circle at center, rgba(227,10,23,.14) 0%, rgba(227,10,23,.05) 35%, transparent 60%)",
              filter: "blur(30px)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
          {/* Inner concentrated glow */}
          <div
            className="ai-cmd-glow-inner"
            style={{
              position: "absolute",
              width: 460,
              height: 460,
              borderRadius: "50%",
              background: isArabic
                ? "radial-gradient(circle, rgba(0,108,53,.20) 0%, transparent 65%)"
                : "radial-gradient(circle, rgba(227,10,23,.20) 0%, transparent 65%)",
              filter: "blur(24px)",
              pointerEvents: "none",
              zIndex: 0,
              animation: "ai-glow-breathe 5s ease-in-out infinite",
            }}
          />
          {/* Connection lines to orbit labels (4 directions) */}
          <svg
            className="ai-cmd-svg"
            style={{
              position: "absolute",
              width: 460,
              height: 460,
              pointerEvents: "none",
              zIndex: 1,
              opacity: 0.35,
            }}
            viewBox="0 0 460 460"
          >
            <defs>
              <linearGradient id="ai-line-grad" x1="50%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor={isArabic ? SA.green : C.red} stopOpacity="0.6" />
                <stop offset="100%" stopColor={isArabic ? SA.green : C.red} stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* 4 lines radiating from center to N/E/S/W */}
            <line x1="230" y1="230" x2="230" y2="50"  stroke="url(#ai-line-grad)" strokeWidth="1.2" strokeDasharray="2 4" />
            <line x1="230" y1="230" x2="410" y2="230" stroke="url(#ai-line-grad)" strokeWidth="1.2" strokeDasharray="2 4" />
            <line x1="230" y1="230" x2="230" y2="410" stroke="url(#ai-line-grad)" strokeWidth="1.2" strokeDasharray="2 4" />
            <line x1="230" y1="230" x2="50"  y2="230" stroke="url(#ai-line-grad)" strokeWidth="1.2" strokeDasharray="2 4" />
          </svg>
          <div
            className="ai-cmd-ring-1"
            style={{
              position: "absolute",
              width: 280,
              height: 280,
              borderRadius: "50%",
              border: "2px solid " + (isArabic ? "rgba(0,108,53,.30)" : "rgba(227,10,23,.30)"),
              animation: "ai-pulse 2.6s ease-out infinite",
            }}
          />
          <div
            className="ai-cmd-ring-2"
            style={{
              position: "absolute",
              width: 340,
              height: 340,
              borderRadius: "50%",
              border: "2px solid " + (isArabic ? "rgba(0,108,53,.20)" : "rgba(227,10,23,.20)"),
              animation: "ai-pulse 2.6s ease-out .9s infinite",
            }}
          />
          <div
            className="ai-cmd-ring-3"
            style={{
              position: "absolute",
              width: 400,
              height: 400,
              borderRadius: "50%",
              border: "1px solid " + (isArabic ? "rgba(0,108,53,.12)" : "rgba(227,10,23,.12)"),
              animation: "ai-pulse 2.6s ease-out 1.8s infinite",
            }}
          />

          <div
            className="ai-cmd-core"
            style={{
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: primaryGradient,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              letterSpacing: "-0.02em",
              boxShadow: isArabic
                ? "0 0 0 14px rgba(0,108,53,.08), 0 0 70px rgba(0,108,53,.38), 0 45px 130px rgba(0,25,12,.28), inset 0 -14px 32px rgba(0,0,0,.18)"
                : "0 0 0 14px rgba(227,10,23,.08), 0 0 70px rgba(227,10,23,.38), 0 45px 130px rgba(58,5,9,.28), inset 0 -14px 32px rgba(0,0,0,.18)",
              zIndex: 2,
              animation: "ai-core-pulse 4s ease-in-out infinite",
              flexDirection: "column",
              gap: 4,
              textShadow: "0 2px 16px rgba(255,255,255,.28)",
            }}
          >
            <span
              className="ai-cmd-core-zyrix"
              style={{
                fontSize: 36,
                fontWeight: 800,
                letterSpacing: "1.5px",
                opacity: 0.78,
                lineHeight: 1,
              }}
            >
              Zyrix
            </span>
            <span
              className="ai-cmd-core-ai"
              style={{
                fontSize: 48,
                fontWeight: 900,
                letterSpacing: "2px",
                lineHeight: 1,
                color: "#fff",
              }}
            >
              AI
            </span>
          </div>

          <div className="ai-cmd-orbit ai-cmd-orbit-top" style={{ position: "absolute", top: 18, fontSize: 11, fontWeight: 800, color: isArabic ? SA.green : C.red, letterSpacing: "2px", opacity: 0.8, textTransform: "uppercase", textShadow: isArabic ? "0 0 14px rgba(0,108,53,.3)" : "0 0 14px rgba(227,10,23,.3)", whiteSpace: "nowrap" }}>{c.orbit[0]}</div>
          <div className="ai-cmd-orbit ai-cmd-orbit-bottom" style={{ position: "absolute", bottom: 78, fontSize: 11, fontWeight: 800, color: isArabic ? SA.green : C.red, letterSpacing: "2px", opacity: 0.8, textTransform: "uppercase", textShadow: isArabic ? "0 0 14px rgba(0,108,53,.3)" : "0 0 14px rgba(227,10,23,.3)", whiteSpace: "nowrap" }}>{c.orbit[1]}</div>
          <div className="ai-cmd-orbit ai-cmd-orbit-left" style={{ position: "absolute", left: -10, top: "42%", fontSize: 11, fontWeight: 800, color: isArabic ? SA.green : C.red, letterSpacing: "2px", opacity: 0.8, textTransform: "uppercase", textShadow: isArabic ? "0 0 14px rgba(0,108,53,.3)" : "0 0 14px rgba(227,10,23,.3)", whiteSpace: "nowrap" }}>{c.orbit[2]}</div>
          <div className="ai-cmd-orbit ai-cmd-orbit-right" style={{ position: "absolute", right: -10, top: "42%", fontSize: 11, fontWeight: 800, color: isArabic ? SA.green : C.red, letterSpacing: "2px", opacity: 0.8, textTransform: "uppercase", textShadow: isArabic ? "0 0 14px rgba(0,108,53,.3)" : "0 0 14px rgba(227,10,23,.3)", whiteSpace: "nowrap" }}>{c.orbit[3]}</div>
          <div className="ai-cmd-decision" style={{ marginTop: 32, fontSize: 12, fontWeight: 800, letterSpacing: "1.5px", color: T.muted, textTransform: "uppercase", opacity: 0.7 }}>AI Decision Engine</div>
        </div>

        {/* RIGHT DASHBOARD */}
        <div
          className="ai-cmd-card-right"
          style={{
            background: "rgba(255,255,255,.85)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid " + T.hairline,
            borderRadius: 24,
            padding: 24,
            boxShadow: pulseDashboard
              ? (isArabic ? "0 0 0 3px rgba(0,108,53,.4), 0 30px 80px rgba(0,108,53,.25)" : "0 0 0 3px rgba(227,10,23,.4), 0 30px 80px rgba(227,10,23,.25)")
              : (isArabic ? "0 12px 36px rgba(0,25,12,.05)" : "0 12px 36px rgba(58,5,9,.05)"),
            display: "flex",
            flexDirection: "column",
            gap: 20,
            opacity: 0.92,
            transition: "box-shadow .4s ease",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {stats.map((s, i) => {
              const bg =
                s.tone === "green" ? "rgba(16,185,129,.10)"
                : s.tone === "red" ? "rgba(227,10,23,.10)"
                : s.tone === "amber" ? "rgba(245,158,11,.12)"
                : s.tone === "indigo" ? "rgba(99,102,241,.10)"
                : "#F9FAFB";
              const valColor =
                s.tone === "green" ? C.emerald
                : s.tone === "red" ? C.redDeep
                : s.tone === "amber" ? C.amber
                : s.tone === "indigo" ? "#6366F1"
                : T.ink;
              return (
                <div
                  key={i}
                  style={{
                    padding: 14,
                    background: bg,
                    borderRadius: 14,
                    transition: "transform .2s, box-shadow .2s",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 14px 32px rgba(0,0,0,.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ fontSize: 12, color: T.muted, fontWeight: 700, textAlign: "center" }}>{s.label}</div>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      color: valColor,
                      marginTop: 4,
                      fontFamily: "'Inter Tight', 'Plus Jakarta Sans', system-ui, sans-serif",
                      letterSpacing: "-0.03em",
                      fontVariantNumeric: "tabular-nums",
                      textAlign: "center",
                    }}
                  >
                    {s.value}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              padding: 18,
              background: isArabic
                ? "linear-gradient(135deg, rgba(0,108,53,.04), rgba(255,255,255,.6))"
                : "linear-gradient(135deg, rgba(227,10,23,.04), rgba(255,255,255,.6))",
              borderRadius: 16,
              border: "1px solid " + T.hairline,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            {[
              { label: isArabic ? "الصحة" : lang === "EN" ? "Health" : "Sağlık", value: Math.max(0, Math.min(100, ((counts[0] + 40) / 100) * 100)), color: C.emerald, max: 100 },
              { label: isArabic ? "المخاطر" : lang === "EN" ? "Risk" : "Risk", value: Math.max(0, Math.min(100, counts[1])), color: C.red, max: 100 },
              { label: isArabic ? "الجاهزية" : lang === "EN" ? "Ready" : "Hazır", value: Math.max(0, Math.min(100, 100 - counts[1])), color: "#6366F1", max: 100 },
            ].map((g, i) => {
              const radius = 28;
              const circ = 2 * Math.PI * radius;
              const pct = Math.min(g.value / g.max, 1);
              const offset = circ * (1 - pct);
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ position: "relative", width: 72, height: 72 }}>
                    <svg width="72" height="72" style={{ transform: "rotate(-90deg)" }}>
                      <circle
                        cx="36" cy="36" r={radius}
                        fill="none"
                        stroke={T.hairline}
                        strokeWidth="6"
                      />
                      <circle
                        cx="36" cy="36" r={radius}
                        fill="none"
                        stroke={g.color}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                        style={{
                          transition: "stroke-dashoffset 1.2s cubic-bezier(.2,.8,.2,1)",
                          filter: `drop-shadow(0 0 6px ${g.color}66)`,
                        }}
                      />
                    </svg>
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 900,
                      color: g.color,
                      fontFamily: "'Inter Tight', 'Plus Jakarta Sans', sans-serif",
                      letterSpacing: "-0.02em",
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {Math.round(pct * 100)}%
                    </div>
                  </div>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: T.muted,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}>
                    {g.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              padding: 16,
              background: primaryGradient,
              color: "#fff",
              borderRadius: 14,
              fontSize: 13,
              fontWeight: 600,
              lineHeight: 1.7,
              boxShadow: primaryGlow,
              textAlign: "center",
              position: "relative",
            }}
          >
            {analyzed && (
              <div style={{
                position: "absolute",
                top: -10,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#10B981",
                color: "#fff",
                fontSize: 10,
                fontWeight: 900,
                padding: "4px 10px",
                borderRadius: 100,
                letterSpacing: "1px",
                textTransform: "uppercase",
                boxShadow: "0 4px 12px rgba(16,185,129,.4)",
                animation: "fade-in-down .5s ease",
              }}>
                {isArabic ? "✓ تم التحليل" : lang === "EN" ? "✓ ANALYZED" : "✓ ANALİZ TAMAM"}
              </div>
            )}
            <div>{(aiSuggestion && aiSuggestion[0]) || c.suggestion[0]}</div>
            <div style={{ marginTop: 6 }}>{(aiSuggestion && aiSuggestion[1]) || c.suggestion[1]}</div>
          </div>
        </div>
      </div>

      <div
        className="ai-cmd-bottom"
        style={{
          maxWidth: 1080,
          margin: "64px auto 0",
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 24,
        }}
      >
        {outcomes.map((text, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              border: "1px solid " + T.hairline,
              borderRadius: 18,
              padding: 24,
              boxShadow: "0 4px 12px rgba(0,0,0,.04)",
              transition: "transform .25s, box-shadow .25s",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = isArabic
                ? "0 18px 40px rgba(0,108,53,.14)"
                : "0 18px 40px rgba(227,10,23,.14)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.04)";
            }}
          >
            <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: T.ink, textAlign: "center" }}>{text}</p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: 48 }}>
        <button
          className="ai-cmd-cta"
          style={{
            padding: "18px 36px",
            background: primaryGradient,
            color: "#fff",
            fontWeight: 900,
            fontSize: 17,
            border: "none",
            borderRadius: 16,
            cursor: "pointer",
            boxShadow: primaryGlow,
            fontFamily: "inherit",
            transition: "transform .2s, box-shadow .2s",
            animation: "cta-glow 2.4s ease-in-out infinite",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.06)";
            e.currentTarget.style.boxShadow = isArabic
              ? "0 30px 70px rgba(0,108,53,.55)"
              : "0 30px 70px rgba(227,10,23,.55)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = primaryGlow;
          }}
        >
          {c.cta}
        </button>
      </div>

      <style>{`
        @keyframes ai-pulse {
          0%   { transform: scale(.85); opacity: .7; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        @keyframes ai-core-breathe {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.06); }
        }
        @keyframes ai-core-pulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.05); }
        }
        @keyframes ai-glow-breathe {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.08); }
        }
        @keyframes fade-in-down {
          from { opacity: 0; transform: translate(-50%, -8px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes cta-glow {
          0%, 100% { box-shadow: ${isArabic ? "0 18px 40px rgba(0,108,53,.30)" : "0 18px 40px rgba(227,10,23,.30)"}; }
          50%      { box-shadow: ${isArabic ? "0 22px 56px rgba(0,108,53,.50)" : "0 22px 56px rgba(227,10,23,.50)"}; }
        }
        @media (max-width: 1024px) {
          .ai-cmd-grid { grid-template-columns: 1fr 1fr !important; }
          .ai-cmd-grid > div:nth-child(2) { grid-column: 1 / -1; }
        }
        @media (max-width: 720px) {
          .ai-cmd-grid   { grid-template-columns: 1fr !important; gap: 20px !important; }
          .ai-cmd-bottom { grid-template-columns: 1fr !important; gap: 12px !important; margin-top: 36px !important; }
          .ai-cmd-section { padding: 64px 16px !important; }
          .ai-cmd-header { margin: 0 auto 36px !important; }
          .ai-cmd-h2 { font-size: 28px !important; }
          .ai-cmd-sub { font-size: 14px !important; margin-top: 12px !important; }
          .ai-cmd-card-left, .ai-cmd-card-right { padding: 18px !important; border-radius: 18px !important; }
          .ai-cmd-core-wrap { min-height: 300px !important; }
          .ai-cmd-glow-wide { width: 400px !important; height: 400px !important; }
          .ai-cmd-glow-inner { width: 280px !important; height: 280px !important; }
          .ai-cmd-svg { width: 280px !important; height: 280px !important; }
          .ai-cmd-ring-1 { width: 200px !important; height: 200px !important; }
          .ai-cmd-ring-2 { width: 240px !important; height: 240px !important; }
          .ai-cmd-ring-3 { width: 280px !important; height: 280px !important; }
          .ai-cmd-core { width: 140px !important; height: 140px !important; }
          .ai-cmd-core-zyrix { font-size: 22px !important; }
          .ai-cmd-core-ai { font-size: 30px !important; }
          .ai-cmd-orbit { font-size: 9px !important; letter-spacing: 1px !important; }
          .ai-cmd-orbit-top { top: 4px !important; }
          .ai-cmd-orbit-bottom { bottom: 36px !important; }
          .ai-cmd-orbit-left { left: 0 !important; }
          .ai-cmd-orbit-right { right: 0 !important; }
          .ai-cmd-decision { font-size: 10px !important; margin-top: 18px !important; }
          .ai-cmd-cta { padding: 14px 28px !important; font-size: 15px !important; }
        }
      `}</style>
    </section>
  );
}

export default function LandingPageV2Extended() {
  const { lang } = useI18n();
  React.useEffect(() => {
    document.body.classList.add("landing-page");
    return () => document.body.classList.remove("landing-page");
  }, []);
  const arFont = "'IBM Plex Sans Arabic', 'Manrope', system-ui, sans-serif";
  const ltrFont = "'Manrope', system-ui, -apple-system, sans-serif";
  return (
    <>
      <style>{`
        body { margin: 0; background: ${C.bg}; }
        [lang="ar"], [dir="rtl"] { font-family: ${arFont}; }
        @keyframes flagWaveV2 {
          0%, 100% { transform: scale(1) translateY(0); opacity: 0.18; }
          50% { transform: scale(1.02) translateY(-8px); opacity: 0.22; }
        }
      `}</style>
      <div style={{ fontFamily: lang === "AR" ? arFont : ltrFont }}>
        <NavV2 />
        <Hero />
        <TrustBar />
        <StatsStrip />
        <AIInvoiceDemoSection />
        <ProblemSolution />
        <WhyUsSection lang={lang} />
        <Features />
        <SectorsSection lang={lang} />
        <IntegrationsSection lang={lang} />
        <CashflowCTA />
        <Pricing />
        <Testimonials />
        <FAQSection lang={lang} />
        <FinalCTA />
        <FooterV2 />
        <WhatsAppWidget lang={lang} />
      </div>

    </>
  );
}