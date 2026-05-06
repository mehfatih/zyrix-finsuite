// ================================================================
// ★ WhatsApp AI Agent — Configuration + Live conversations
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getAIPalette,
  getSuccessPalette,
  getCustomerPalette,
  getAlertPalette,
  getReportsPalette,
  getBrandPalette,
  getMoneyPalette,
  getPaletteById,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import ConversationBubble from "../../../components/dashboard/autopilots/ConversationBubble";
import { localStore, KEYS, ensureWaSeed, fmtTime } from "./autopilotsApi";

const DEFAULT_CONFIG = {
  personality: "friendly",
  languages: ["TR", "EN"],
  topics: { invoice: true, payment: true, order: true, pricing: true, complaints: false, refund: false },
  hours: "24",
  escalation: "medium",
};

const TOPICS = ["invoice", "payment", "order", "pricing", "complaints", "refund"];

export default function WhatsAppAgentPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("autopilots");
  const ai = getAIPalette();
  const success = getSuccessPalette();
  const customer = getCustomerPalette();
  const alert = getAlertPalette();
  const reports = getReportsPalette();
  const money = getMoneyPalette();
  const brand = getBrandPalette(lang.toLowerCase());
  const wa = getPaletteById("emerald");

  const [tab, setTab] = useState("LIVE");
  const [config, setConfig] = useState(() => localStore.getKv(KEYS.waConfig, DEFAULT_CONFIG));
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [reply, setReply] = useState("");
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    ensureWaSeed();
    const list = localStore.list(KEYS.waConversations);
    setConversations(list);
    if (list.length > 0) setActiveId(list[0].id);
  }, []);

  const active = conversations.find((c) => c.id === activeId);

  const stats = useMemo(() => {
    const handled = conversations.filter((c) => c.status === "AI_HANDLED").length;
    const escalated = conversations.filter((c) => c.status === "ESCALATED").length;
    const total = conversations.length;
    return {
      handled,
      escalated,
      avg: total === 0 ? 0 : Math.round(conversations.reduce((s, c) => s + (Math.random() * 6 + 2), 0) / total),
      sat: 92,
    };
  }, [conversations]);

  const saveConfig = () => {
    localStore.saveKv(KEYS.waConfig, config);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2200);
  };

  const intervene = (id) => {
    setConversations((arr) => arr.map((c) => (c.id === id ? { ...c, status: "HUMAN" } : c)));
  };
  const handover = (id) => {
    setConversations((arr) => arr.map((c) => (c.id === id ? { ...c, status: "AI_HANDLED" } : c)));
  };

  const sendReply = () => {
    if (!reply.trim() || !active) return;
    setConversations((arr) =>
      arr.map((c) =>
        c.id === active.id
          ? {
              ...c,
              lastMessage: reply,
              timestamp: new Date().toISOString(),
              thread: [...(c.thread || []), { from: "agent", text: reply, at: new Date().toISOString() }],
            }
          : c
      )
    );
    setReply("");
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("wa.title")}
        subtitle={t("wa.subtitle")}
        icon="🤖"
        palette={ai}
        actions={
          <div style={{ display: "flex", gap: 4, padding: 4, background: ai.bg, borderRadius: 10 }}>
            {[
              { id: "LIVE",   label: t("wa.tab.live") },
              { id: "CONFIG", label: t("wa.tab.config") },
            ].map((tabDef) => {
              const active = tab === tabDef.id;
              return (
                <button
                  key={tabDef.id}
                  type="button"
                  onClick={() => setTab(tabDef.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: active ? "#fff" : "transparent",
                    color: active ? ai.dark : "#64748B",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: active ? `0 2px 8px ${ai.base}25` : "none",
                  }}
                >
                  {tabDef.label}
                </button>
              );
            })}
          </div>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="ap-kpi-grid"
      >
        <KpiCard label={t("wa.kpi.handled")} value={stats.handled} palette={success} icon="🤖" />
        <KpiCard label={t("wa.kpi.escalated")} value={stats.escalated} palette={alert} icon="🚨" pulse={stats.escalated > 0} />
        <KpiCard label={t("wa.kpi.avgTime")} value={stats.avg} palette={ai} icon="⏱" />
        <KpiCard label={t("wa.kpi.satisfaction")} value={stats.sat} suffix="%" palette={money} icon="⭐" />
      </div>

      {tab === "LIVE" ? (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 320px) minmax(0, 1fr)", gap: 18 }} className="wa-live-grid">
          <Card palette={ai} title={t("wa.live.today")} icon="💬">
            {conversations.length === 0 ? (
              <EmptyState title={t("wa.live.empty")} icon="💬" palette={ai} />
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0, maxHeight: 480, overflowY: "auto" }}>
                {conversations.map((c) => {
                  const isActive = activeId === c.id;
                  const stPalette = c.status === "ESCALATED" ? alert : c.status === "HUMAN" ? customer : success;
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setActiveId(c.id)}
                        style={{
                          width: "100%",
                          background: isActive ? `${ai.base}10` : "transparent",
                          borderInlineStart: isActive ? `3px solid ${ai.base}` : "3px solid transparent",
                          border: "none",
                          borderBottom: "1px solid #F1F5F9",
                          padding: "10px 12px",
                          cursor: "pointer",
                          textAlign: "start",
                          display: "flex",
                          gap: 10,
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: wa.base,
                            color: "#fff",
                            display: "grid",
                            placeItems: "center",
                            fontWeight: 800,
                            fontSize: 13,
                            flexShrink: 0,
                          }}
                        >
                          {c.avatar || (c.customerName || "?")[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }}>
                              {c.customerName}
                            </span>
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 800,
                                background: stPalette.bg,
                                color: stPalette.dark,
                                padding: "1px 6px",
                                borderRadius: 999,
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                                flexShrink: 0,
                              }}
                            >
                              {c.status === "AI_HANDLED" ? "AI ✓" : c.status === "ESCALATED" ? "🚨" : "👤"}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {c.lastMessage}
                          </div>
                          <div style={{ fontSize: 10, color: ai.dark, fontWeight: 700, marginTop: 4 }}>
                            {t(`wa.intent.${c.intent || "other"}`)} · {c.confidence}%
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card palette={ai} title={active?.customerName || "—"} icon="💬">
            {!active ? (
              <EmptyState title={t("wa.live.empty")} icon="💬" palette={ai} />
            ) : (
              <>
                <div style={{ marginBottom: 12, padding: "8px 12px", background: ai.bg, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ fontSize: 12, color: ai.dark, fontWeight: 700 }}>
                    {active.phone || ""} · {t(`wa.intent.${active.intent || "other"}`)}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {active.status === "AI_HANDLED" && (
                      <button type="button" onClick={() => intervene(active.id)} style={btn(brand, "primary")}>
                        ✋ {t("wa.live.intervene")}
                      </button>
                    )}
                    {active.status === "HUMAN" && (
                      <button type="button" onClick={() => handover(active.id)} style={btn(ai, "secondary")}>
                        🤖 {t("wa.live.handover")}
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ maxHeight: 360, overflowY: "auto", marginBottom: 12 }}>
                  {(active.thread || []).map((m, i) => (
                    <ConversationBubble key={i} message={m} channel="WHATSAPP" lang={lang} />
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                    rows={2}
                    placeholder="Type a reply…"
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: `1px solid ${ai.base}30`,
                      background: "#fff",
                      fontSize: 13,
                      fontFamily: "inherit",
                      outline: "none",
                      resize: "vertical",
                      boxSizing: "border-box",
                    }}
                  />
                  <button type="button" onClick={sendReply} disabled={!reply.trim()} style={{ ...btn(wa, "primary"), opacity: reply.trim() ? 1 : 0.5 }}>
                    ➤
                  </button>
                </div>
              </>
            )}
          </Card>
        </div>
      ) : (
        <Card palette={ai} title={t("wa.tab.config")} icon="⚙️" style={{ marginBottom: 18 }}>
          {/* Personality */}
          <Section label={t("wa.config.personality")}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["friendly", "professional", "brief"].map((p) => {
                const active = config.personality === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setConfig({ ...config, personality: p })}
                    style={chip(ai, active)}
                  >
                    {t(`wa.config.personality.${p}`)}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Languages */}
          <Section label={t("wa.config.languages")}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["TR", "EN", "AR"].map((l) => {
                const checked = config.languages.includes(l);
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() =>
                      setConfig({
                        ...config,
                        languages: checked ? config.languages.filter((x) => x !== l) : [...config.languages, l],
                      })
                    }
                    style={chip(customer, checked)}
                  >
                    {checked ? "✓ " : ""}{l}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Topics */}
          <Section label={t("wa.config.topics")}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
              {TOPICS.map((tp) => {
                const checked = !!config.topics?.[tp];
                const escalate = tp === "complaints" || tp === "refund";
                return (
                  <label
                    key={tp}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      background: checked ? `${ai.base}10` : "#F8FAFC",
                      border: `1px solid ${checked ? ai.base : "#E2E8F0"}40`,
                      borderRadius: 10,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 700,
                      color: checked ? ai.dark : "#475569",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setConfig({
                          ...config,
                          topics: { ...config.topics, [tp]: !checked },
                        })
                      }
                      style={{ width: 16, height: 16, accentColor: ai.base }}
                    />
                    <span style={{ flex: 1 }}>{t(`wa.config.topic.${tp}`)}</span>
                    {escalate && <span style={{ fontSize: 10, color: alert.dark }}>🚨</span>}
                  </label>
                );
              })}
            </div>
          </Section>

          {/* Hours + escalation */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="wa-cfg-grid">
            <Section label={t("wa.config.hours")}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["24", "business", "custom"].map((h) => {
                  const active = config.hours === h;
                  return (
                    <button key={h} type="button" onClick={() => setConfig({ ...config, hours: h })} style={chip(reports, active)}>
                      {t(`wa.config.hours.${h}`)}
                    </button>
                  );
                })}
              </div>
            </Section>
            <Section label={t("wa.config.escalation")}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["low", "medium", "high"].map((e) => {
                  const active = config.escalation === e;
                  return (
                    <button key={e} type="button" onClick={() => setConfig({ ...config, escalation: e })} style={chip(alert, active)}>
                      {t(`wa.config.escalation.${e}`)}
                    </button>
                  );
                })}
              </div>
            </Section>
          </div>

          <div style={{ marginTop: 18, display: "flex", justifyContent: "flex-end" }}>
            <button type="button" onClick={saveConfig} style={btn(brand, "primary")}>
              ✓ {t("wa.config.save")}
            </button>
          </div>
        </Card>
      )}

      {savedToast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            insetInlineEnd: 28,
            background: "#ECFDF5",
            color: "#047857",
            border: "2px solid #10B981",
            borderRadius: 12,
            padding: "12px 18px",
            fontSize: 13,
            fontWeight: 800,
            zIndex: 250,
          }}
        >
          ✓ Saved
        </div>
      )}

      <style>{`
        @media (max-width: 720px) {
          .ap-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .wa-live-grid { grid-template-columns: 1fr !important; }
          .wa-cfg-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: "#475569", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

function chip(palette, active) {
  return {
    padding: "6px 14px",
    borderRadius: 999,
    border: active ? `2px solid ${palette.base}` : `1px solid ${palette.base}30`,
    background: active ? palette.base : `${palette.base}10`,
    color: active ? "#fff" : palette.dark,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  };
}

function btn(palette, variant) {
  if (variant === "primary") {
    return {
      background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
      color: "#fff",
      border: "none",
      padding: "10px 18px",
      borderRadius: 12,
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: `0 4px 14px ${palette.base}40`,
    };
  }
  return {
    background: palette.bg,
    color: palette.dark,
    border: `1px solid ${palette.base}40`,
    padding: "10px 18px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  };
}
