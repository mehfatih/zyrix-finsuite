// ================================================================
// ★ Future Self Conversation — talk to your 5/10-year-future self
// ================================================================
import React, { useEffect, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { useAuth } from "../../../context/AuthContext";
import {
  getAIPalette,
  getCustomerPalette,
  getMoneyPalette,
  getSuccessPalette,
  getReportsPalette,
  getBrandPalette,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import FutureSelfAvatar from "../../../components/dashboard/cognitive/FutureSelfAvatar";
import FutureSelfChat from "../../../components/dashboard/cognitive/FutureSelfChat";
import { generateFutureResponse, localStore, KEYS } from "./cognitiveApi";

const TOPICS = [
  { id: "business", labelKey: "future.topic.business", palette: "indigo" },
  { id: "customer", labelKey: "future.topic.customer", palette: "emerald" },
  { id: "wealth",   labelKey: "future.topic.wealth",   palette: "gold" },
  { id: "growth",   labelKey: "future.topic.growth",   palette: "purple" },
  { id: "balance",  labelKey: "future.topic.balance",  palette: "rose" },
];

export default function FutureSelfPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("cognitive");
  const { user } = useAuth();
  const ai = getAIPalette();
  const customer = getCustomerPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const reports = getReportsPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [years, setYears] = useState(5);
  const [topic, setTopic] = useState("business");
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [savedToast, setSavedToast] = useState(null);

  const name = user?.name || "Mehmet";
  const futureYear = new Date().getFullYear() + years;

  useEffect(() => {
    const saved = localStore.list(KEYS.futureChat);
    if (saved.length > 0 && saved[0].messages) {
      // do nothing — start fresh each session for clarity
    }
  }, []);

  const begin = () => {
    setStarted(true);
    setMessages([
      {
        from: "future",
        text: t("future.greeting").replace("{name}", name).replace("{years}", years),
        at: new Date().toISOString(),
      },
    ]);
  };

  const send = async (text) => {
    const final = (text || input).trim();
    if (!final) return;
    setInput("");
    const userMsg = { from: "you", text: final, at: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setThinking(true);
    await new Promise((r) => setTimeout(r, 900));
    const reply = generateFutureResponse(final);
    const futureMsg = { from: "future", text: reply, at: new Date().toISOString() };
    setMessages((prev) => [...prev, futureMsg]);
    setThinking(false);
  };

  const playVoice = (text) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR";
    window.speechSynthesis.speak(utter);
  };

  const saveConversation = () => {
    localStore.add(KEYS.futureNotes, {
      years,
      topic,
      messages,
      savedAt: new Date().toISOString(),
    });
    setSavedToast(t("future.action.save"));
    setTimeout(() => setSavedToast(null), 2400);
  };

  const reset = () => {
    setMessages([]);
    setStarted(false);
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("future.title")} subtitle={t("future.subtitle")} icon="🔮" palette={ai} />

      {!started ? (
        <Card palette={ai} style={{ marginBottom: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 22, alignItems: "center", marginBottom: 22 }} className="future-setup-grid">
            <FutureSelfAvatar name={name} years={years} size={130} />
            <div>
              <div style={{ fontSize: 11, color: ai.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                {t("future.setup.talkTo")}
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                {[5, 10].map((y) => {
                  const active = years === y;
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setYears(y)}
                      style={{
                        flex: 1,
                        padding: "12px 16px",
                        borderRadius: 12,
                        border: active ? `2px solid ${ai.base}` : `1px solid ${ai.base}30`,
                        background: active ? `linear-gradient(135deg, ${ai.bg}, ${ai.base}25)` : "#fff",
                        color: ai.dark,
                        fontSize: 13,
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      {y === 5 ? t("future.setup.5yr") : t("future.setup.10yr")}
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.6, marginBottom: 6 }}>
                {t("future.setup.intro").replace("{name}", name).replace("{year}", futureYear)}
              </div>
              <ul style={{ paddingInlineStart: 18, margin: 0, color: "#64748B", fontSize: 12, lineHeight: 1.6 }}>
                <li>{t("future.setup.factor1")}</li>
                <li>{t("future.setup.factor2")}</li>
                <li>{t("future.setup.factor3")}</li>
              </ul>
            </div>
          </div>

          <div style={{ fontSize: 11, color: ai.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
            {t("future.setup.chooseTopic")}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8, marginBottom: 18 }}>
            {TOPICS.map((tp) => {
              const active = topic === tp.id;
              return (
                <button
                  key={tp.id}
                  type="button"
                  onClick={() => setTopic(tp.id)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: active ? `2px solid ${ai.base}` : `1px solid ${ai.base}25`,
                    background: active ? `${ai.base}10` : "#fff",
                    color: ai.dark,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "start",
                  }}
                >
                  {t(tp.labelKey)}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={begin}
              style={{
                background: `linear-gradient(135deg, ${ai.base}, ${ai.dark})`,
                color: "#fff",
                border: "none",
                padding: "12px 24px",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: `0 6px 18px ${ai.base}40`,
              }}
            >
              ✨ {t("future.action.begin")}
            </button>
          </div>
        </Card>
      ) : (
        <>
          {/* Avatar + reset */}
          <div
            style={{
              background: `linear-gradient(135deg, #0F172A 0%, ${ai.dark} 100%)`,
              borderRadius: 22,
              padding: 22,
              marginBottom: 18,
              color: "#fff",
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              gap: 18,
              alignItems: "center",
              boxShadow: `0 16px 48px ${ai.base}50`,
            }}
            className="future-hero-grid"
          >
            <FutureSelfAvatar name={name} years={years} size={90} />
            <div>
              <div style={{ fontSize: 11, color: ai.chart, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 4 }}>
                Future {name} ({futureYear})
              </div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{t(`future.topic.${topic}`)}</div>
            </div>
            <button
              type="button"
              onClick={reset}
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                border: `1px solid rgba(255,255,255,0.25)`,
                borderRadius: 10,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ⟳ {t("future.action.reset")}
            </button>
          </div>

          {/* Chat */}
          <Card palette={ai} icon="💬" style={{ marginBottom: 14 }}>
            <FutureSelfChat messages={messages} lang={lang} />
            {thinking && (
              <div style={{ display: "flex", gap: 4, alignItems: "center", paddingInlineStart: 8, marginTop: 8 }}>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: ai.base,
                      animation: `fsThink 1.2s ease-in-out ${i * 0.15}s infinite`,
                    }}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* Input */}
          <Card palette={ai}>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                rows={2}
                placeholder={t("future.placeholder")}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: `1px solid ${ai.base}25`,
                  background: "#fff",
                  fontSize: 13,
                  fontFamily: "inherit",
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => send()}
                disabled={!input.trim()}
                style={{
                  background: !input.trim() ? "#CBD5E1" : `linear-gradient(135deg, ${ai.base}, ${ai.dark})`,
                  color: "#fff",
                  border: "none",
                  padding: "10px 18px",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: !input.trim() ? "not-allowed" : "pointer",
                  boxShadow: !input.trim() ? "none" : `0 4px 14px ${ai.base}40`,
                }}
              >
                ➤
              </button>
            </div>
            <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, marginBottom: 8 }}>
              {t("future.examples")}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => send(t(`future.example.${n}`))}
                  style={{
                    background: ai.bg,
                    color: ai.dark,
                    border: `1px solid ${ai.base}30`,
                    borderRadius: 999,
                    padding: "5px 12px",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontStyle: "italic",
                  }}
                >
                  "{t(`future.example.${n}`)}"
                </button>
              ))}
            </div>
            {messages.length > 1 && (
              <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
                <button type="button" onClick={() => playVoice(messages[messages.length - 1].text)} style={btn(reports, "secondary")}>🔊 {t("future.action.voice")}</button>
                <button type="button" onClick={saveConversation} style={btn(brand, "primary")}>💾 {t("future.action.save")}</button>
              </div>
            )}
          </Card>
        </>
      )}

      {savedToast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            insetInlineEnd: 28,
            background: success.bg,
            color: success.dark,
            border: `2px solid ${success.base}`,
            borderRadius: 12,
            padding: "12px 18px",
            fontSize: 13,
            fontWeight: 800,
            zIndex: 250,
          }}
        >
          ✓ {savedToast}
        </div>
      )}

      <style>{`
        @media (max-width: 720px) {
          .future-setup-grid, .future-hero-grid { grid-template-columns: 1fr !important; text-align: center; }
        }
        @keyframes fsThink {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50%      { transform: scale(1.3); opacity: 1; }
        }
      `}</style>
    </div>
  );
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
