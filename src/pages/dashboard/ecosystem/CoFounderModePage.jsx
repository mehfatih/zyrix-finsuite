// ================================================================
// ★ AI Co-Founder Mode — HERO. Strategic AI partner.
// ================================================================
import React, { useEffect, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getBrandPalette, getAIPalette, getSuccessPalette } from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import CoFounderAvatar from "../../../components/dashboard/ecosystem/CoFounderAvatar";
import BoardMeetingPrep from "../../../components/dashboard/ecosystem/BoardMeetingPrep";
import StrategyRecommendations from "../../../components/dashboard/ecosystem/StrategyRecommendations";
import { api, localStore, KEYS, buildWeeklyBrief, generateCofounderReply } from "./ecosystemApi";

export default function CoFounderModePage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("ecosystem");
  const brand = getBrandPalette(lang.toLowerCase());
  const ai = getAIPalette();
  const success = getSuccessPalette();

  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [view, setView] = useState("hero"); // hero | brief | chat
  const [chat, setChat] = useState(localStore.list(KEYS.cofounderChat));
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    api("/api/invoices?limit=200").then((r) => setInvoices(r?.data?.invoices || r?.data?.items || r?.data || []));
    api("/api/customers").then((r) => setCustomers(r?.data?.customers || r?.data?.items || r?.data || []));
    setPurchases(localStore.list("zyrix_purchase_invoices_v1"));
  }, []);

  const brief = buildWeeklyBrief({ invoices, customers, purchases });

  const onSend = (text) => {
    const user = { role: "user", text, at: new Date().toISOString() };
    setChat((c) => [...c, user]);
    setThinking(true);
    setTimeout(() => {
      const reply = { role: "ai", text: generateCofounderReply(text, lang), at: new Date().toISOString() };
      setChat((c) => {
        const next = [...c, reply];
        localStore.save(KEYS.cofounderChat, next);
        return next;
      });
      setThinking(false);
    }, 900);
  };

  const onStarter = (s) => onSend(s.label);

  const userName = (() => {
    try {
      const u = JSON.parse(localStorage.getItem("zyrix_user") || "{}");
      return u.firstName || u.fullName?.split?.(" ")?.[0] || u.companyName || "there";
    } catch { return "there"; }
  })();

  const starters = [
    { key: "expansion", label: t("cofounder.starter.expansion") },
    { key: "hire",      label: t("cofounder.starter.hire") },
    { key: "cash",      label: t("cofounder.starter.cash") },
    { key: "pricing",   label: t("cofounder.starter.pricing") },
  ];

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("cofounder.title")} subtitle={t("cofounder.subtitle")} icon="🤖" palette={brand}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, padding: "6px 12px", borderRadius: 999, background: brand.bg, color: brand.dark, border: `1px solid ${brand.base}40` }}>
              {t("cofounder.tier")}
            </span>
          </div>
        }
      />

      {view === "hero" && (
        <Card palette={brand} title="" style={{ marginBottom: 16, position: "relative", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, alignItems: "center", padding: "16px 0" }} className="cf-hero-grid">
            <CoFounderAvatar size={220} thinking={false} lang={lang.toLowerCase()} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", lineHeight: 1.3, marginBottom: 12 }}>
                "{t("cofounder.intro.greeting", { name: userName })}"
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => setView("chat")}
                  style={{ background: `linear-gradient(135deg, ${ai.base}, ${ai.dark})`, color: "#fff", border: "none", padding: "14px 22px", borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: `0 8px 22px ${ai.base}50` }}
                >
                  💬 {t("cofounder.cta.startConvo")}
                </button>
                <button
                  type="button"
                  onClick={() => setView("brief")}
                  style={{ background: "#fff", color: brand.dark, border: `1.5px solid ${brand.base}50`, padding: "14px 22px", borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: "pointer" }}
                >
                  📋 {t("cofounder.cta.viewBrief")}
                </button>
              </div>
              <div style={{ marginTop: 20, display: "flex", gap: 18, flexWrap: "wrap" }}>
                <Tag icon="🟢" color={success.dark} bg={success.bg}>{t("cofounder.tag.active")}</Tag>
                <Tag icon="🌐" color={ai.dark} bg={ai.bg}>{t("cofounder.tag.languages")}</Tag>
                <Tag icon="🎙" color={brand.dark} bg={brand.bg}>{t("cofounder.tag.modes")}</Tag>
              </div>
            </div>
          </div>
          <style>{`@media (max-width: 720px) { .cf-hero-grid { grid-template-columns: 1fr !important; text-align: center; } }`}</style>
        </Card>
      )}

      {view === "brief" && (
        <>
          <div style={{ marginBottom: 14 }}>
            <button type="button" onClick={() => setView("hero")} style={{ background: "transparent", color: brand.dark, border: "1px solid transparent", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              ← Back
            </button>
          </div>
          <Card palette={brand} title={t("cofounder.brief.title")} subtitle={t("cofounder.brief.subtitle")} icon="📋">
            <BoardMeetingPrep brief={brief} onAction={(d, action) => localStore.add(KEYS.cofounderActions, { decisionId: d.id, action, at: new Date().toISOString() })} t={t} />
          </Card>
        </>
      )}

      {view === "chat" && (
        <div>
          <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <button type="button" onClick={() => setView("hero")} style={{ background: "transparent", color: brand.dark, border: "1px solid transparent", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              ← Back
            </button>
            <CoFounderAvatar size={70} thinking={thinking} lang={lang.toLowerCase()} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{t("cofounder.title")}</div>
              <div style={{ fontSize: 11, color: "#64748B" }}>{t("cofounder.tag.active")}</div>
            </div>
          </div>
          <StrategyRecommendations
            messages={chat}
            thinking={thinking}
            onSend={onSend}
            starters={starters}
            onStarter={onStarter}
            lang={lang.toLowerCase()}
            t={t}
          />
        </div>
      )}
    </div>
  );
}

function Tag({ icon, color, bg, children }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 800, padding: "6px 12px", borderRadius: 999, background: bg, color }}>
      {icon} {children}
    </span>
  );
}
