// ================================================================
// /help/whats-new — Phase changelog timeline (Phases 1 → 12)
// ================================================================
import React from "react";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import { getBrandPalette, getSuccessPalette, getAIPalette, getReportsPalette } from "../../utils/dashboardPalette";
import { fmtDate } from "../../utils/format";

const RELEASES = [
  { version: "v1.0.0", date: "2026-05-07", phase: "Phase 12 — Polish & Launch",         tag: "new",      summary: { TR: "Performans optimize edildi (initial bundle 967KB→85KB), erişilebilirlik (WCAG AA), 5 adımlı onboarding, bilgi merkezi, in-app sohbet, analytics + Sentry + Web Vitals. v1.0 hazır.", EN: "Bundle reduced 967KB→85KB initial load, WCAG AA accessibility pass, 5-step onboarding wizard, knowledge base, in-app chat, analytics + Sentry + Web Vitals. v1.0 production-ready.", AR: "تخفيض الحزمة من 967KB إلى 85KB، توافق WCAG AA، معالج إعداد 5 خطوات، قاعدة معرفة، دردشة دعم، تحليلات. v1.0 جاهز للإنتاج." } },
  { version: "v0.11.0", date: "2026-05-07", phase: "Phase 11 — Ecosystem Plays",        tag: "new",      summary: { TR: "AI Co-Founder, Zyrix Twin (dijital ikiz), B2B Pazaryeri, Capital, Insurance, University, Network Intelligence, Supplier Health, Open Banking AI, Influencer ROI — 10 yeni ekosistem sayfası.", EN: "AI Co-Founder, Zyrix Twin (digital twin), B2B Marketplace, Capital, Insurance, University, Network Intelligence, Supplier Health, Open Banking AI, Influencer ROI — 10 new ecosystem pages.", AR: "AI Co-Founder، Zyrix Twin، سوق B2B، Capital، Insurance، University، Network Intelligence، Supplier Health، Open Banking AI، Influencer ROI — 10 صفحات جديدة." } },
  { version: "v0.10.0", date: "2026-05-06", phase: "Phase 10 — Voice & CX",             tag: "new",      summary: { TR: "Sesli mod (WhatsApp), müşteri portalları (-60% destek talebi), Payment Nudge AI, Loyalty AI, Doğum günü pazarlaması, Review Optimizer, e-posta ve kampanya yöneticisi.", EN: "Voice Mode (WhatsApp), Customer Portals (-60% support tickets), Payment Nudge AI, Loyalty AI, Birthday Marketing, Review Optimizer, Email + Campaigns Manager.", AR: "الوضع الصوتي عبر واتساب، بوابات العملاء، Payment Nudge AI، Loyalty AI، تسويق المناسبات، مُحسِّن المراجعات." } },
  { version: "v0.9.0",  date: "2026-05-06", phase: "Phase 9 — Cognitive Companion",     tag: "new",      summary: { TR: "Negotiation Coach, Decision Manager, Wellness Index, Future Self, AI Calendar, AR Storefront/Receipt, Fraud Detection.", EN: "Negotiation Coach, Decision Manager, Wellness Index, Future Self, AI Calendar, AR Storefront/Receipt, Fraud Detection.", AR: "مدرّب التفاوض، مدير القرارات، مؤشر الرفاهية، Future Self، تقويم AI، AR Storefront/Receipt، كشف الاحتيال." } },
  { version: "v0.8.0",  date: "2026-05-06", phase: "Phase 8 — Predictive Intelligence", tag: "new",      summary: { TR: "Business Death Predictor (HERO), Customer DNA, Customer Score, Churn Prediction, Time-Loop Simulator, Inventory Forecast, Cashflow Stress Test.", EN: "Business Death Predictor (HERO), Customer DNA, Customer Score, Churn Prediction, Time-Loop Simulator, Inventory Forecast, Cashflow Stress Test.", AR: "Business Death Predictor، Customer DNA، Customer Score، Churn، Time-Loop، توقع المخزون، اختبار الضغط." } },
  { version: "v0.7.0",  date: "2026-05-06", phase: "Phase 7 — Hidden Money AI",         tag: "new",      summary: { TR: "Hidden Cash HERO, Daily Briefing, Monthly Report PDF, Hidden Revenue, Smart Pricing, Discount Optimizer.", EN: "Hidden Cash HERO, Daily Briefing, Monthly Report PDF, Hidden Revenue, Smart Pricing, Discount Optimizer.", AR: "Hidden Cash، الموجز اليومي، التقرير الشهري، الإيرادات الخفية، التسعير الذكي، مُحسّن الخصومات." } },
  { version: "v0.6.0",  date: "2026-05-06", phase: "Phase 6 — AI Autopilots",           tag: "new",      summary: { TR: "Invoice Autopilot HERO, Reconciliation 95%, WhatsApp Agent, Multi-Channel Inbox, Document Vault, Auto-Filing, Recurring Setup.", EN: "Invoice Autopilot HERO, Reconciliation 95%, WhatsApp Agent, Multi-Channel Inbox, Document Vault, Auto-Filing, Recurring Setup.", AR: "Autopilot الفواتير، تسوية 95%، WhatsApp Agent، صندوق متعدد القنوات، Document Vault، Auto-Filing." } },
];

export default function WhatsNewPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("help");
  const brand = getBrandPalette(String(lang).toLowerCase());
  const success = getSuccessPalette();
  const ai = getAIPalette();
  const reports = getReportsPalette();

  const tagPalette = (tag) => tag === "new" ? success : tag === "improved" ? ai : reports;

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(circle at 0% 0%, ${brand.bg}, #F8FAFC 60%)`, padding: 24 }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <header style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>{t("whatsnew.title")}</h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>{t("whatsnew.subtitle")}</p>
        </header>

        <div style={{ position: "relative", paddingInlineStart: 26 }}>
          <div style={{ position: "absolute", insetInlineStart: 12, top: 8, bottom: 8, width: 2, background: `linear-gradient(180deg, ${brand.base}, ${ai.base}, ${success.base})`, borderRadius: 2, opacity: 0.4 }} />
          {RELEASES.map((r, i) => {
            const tp = tagPalette(r.tag);
            return (
              <article key={r.version} style={{ position: "relative", marginBottom: 22 }}>
                <div style={{ position: "absolute", insetInlineStart: -20, top: 18, width: 16, height: 16, borderRadius: "50%", background: `linear-gradient(135deg, ${tp.base}, ${tp.dark})`, boxShadow: `0 0 0 4px #F8FAFC, 0 0 0 5px ${tp.base}40` }} />
                <div style={{ background: "#fff", border: `1px solid ${tp.base}30`, borderRadius: 14, padding: 18, boxShadow: "0 4px 14px rgba(15,23,42,0.04)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: brand.dark, fontFamily: "ui-monospace, monospace" }}>{r.version}</span>
                    <span style={{ fontSize: 9, fontWeight: 800, color: tp.dark, background: tp.bg, padding: "3px 10px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {t(`whatsnew.tag.${r.tag}`)}
                    </span>
                    <span style={{ marginInlineStart: "auto", fontSize: 11, color: "#94A3B8", fontWeight: 700 }}>{fmtDate(r.date, { lang })}</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>{r.phase}</div>
                  <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.6, margin: 0 }}>
                    {r.summary[lang] || r.summary.EN}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
