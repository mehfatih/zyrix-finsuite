// ============================================================
// Zyrix FinSuite - AI CFO Voice Assistant Page
// Track C - Sprint 2 Feature 1 (Frontend)
//
// Multilingual chat (TR/EN/AR auto-detect).
// Voice input via Web Speech API where supported.
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import { aiCfoAPI } from "../../services/api";

// ----------------------------------------------------------------
// Web Speech API helpers
// ----------------------------------------------------------------

const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

function detectLang(text) {
  if (/[\u0600-\u06FF]/.test(text)) return "ar-SA";
  if (/[\u011F\u011E\u0130\u0131\u015E\u015F\u00C7\u00E7\u00DC\u00FC\u00D6\u00F6]/.test(text)) return "tr-TR";
  return "en-US";
}

function speak(text) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = detectLang(text);
    u.rate = 1.0;
    u.pitch = 1.0;
    window.speechSynthesis.speak(u);
  } catch {}
}

// ----------------------------------------------------------------
// Suggested starter prompts (multilingual)
// ----------------------------------------------------------------

const STARTERS = [
  { tr: "Bu ay nakit akışım nasıl?", en: "How is my cash flow this month?", ar: "كيف هو تدفقي النقدي هذا الشهر؟" },
  { tr: "En çok hangi kategoriye harcama yapıyorum?", en: "What's my biggest expense category?", ar: "ما هي أكبر فئة إنفاق لدي؟" },
  { tr: "Vadesi geçmiş faturalarım toplam ne kadar?", en: "How much is in overdue invoices?", ar: "ما إجمالي الفواتير المتأخرة؟" },
  { tr: "Önümüzdeki vergi tarihleri neler?", en: "What are my upcoming tax deadlines?", ar: "ما هي مواعيد الضرائب القادمة؟" },
];

export default function AICfoPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [error, setError] = useState(null);
  const [context, setContext] = useState(null);
  const [recording, setRecording] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const recognitionRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    aiCfoAPI.context().then((r) => setContext(r?.data)).catch(() => {});
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9e9, behavior: "smooth" });
  }, [messages]);

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q) return;

    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const r = await aiCfoAPI.ask(q, conversationId);
      const reply = r?.data?.reply || "Sorry, no response.";
      const newConvoId = r?.data?.conversationId;
      if (newConvoId && !conversationId) setConversationId(newConvoId);

      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      if (voiceEnabled) speak(reply);

      // Refresh context after the question (numbers may have changed)
      aiCfoAPI.context().then((r) => setContext(r?.data)).catch(() => {});
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const startRecord = () => {
    if (!SpeechRecognition) {
      alert("Sesli giriş bu tarayıcıda desteklenmiyor / Voice not supported / لا يدعم الصوت");
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    // Auto-detect: try Turkish first, browser will adjust
    rec.lang = "tr-TR";
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setTimeout(() => send(transcript), 200);
    };
    rec.onerror = () => setRecording(false);
    rec.onend = () => setRecording(false);
    rec.start();
    recognitionRef.current = rec;
    setRecording(true);
  };

  const stopRecord = () => {
    recognitionRef.current?.stop();
    setRecording(false);
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 60px)", gap: 16 }}>
      {/* Main chat area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#FFFFFF", borderRadius: 16, border: "1.5px solid #E2E8F8", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "16px 24px", borderBottom: "1.5px solid #E2E8F8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#6C3AFF,#F43F8E)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20 }}>🤖</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: "#1E1B4B" }}>AI CFO</div>
              <div style={{ fontSize: 11, color: "#64748B" }}>Mali danışmanınız · TR / EN / AR otomatik algı</div>
            </div>
          </div>
          <button
            onClick={() => setVoiceEnabled((v) => !v)}
            title="Sesli yanıt aç/kapa"
            style={{ background: voiceEnabled ? "#D1FAE5" : "#F1F5F9", border: "1.5px solid " + (voiceEnabled ? "#10B981" : "#E2E8F8"), color: voiceEnabled ? "#065F46" : "#64748B", borderRadius: 10, padding: "6px 12px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
          >
            {voiceEnabled ? "🔊 Sesli Yanıt Açık" : "🔇 Sessiz"}
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {messages.length === 0 && (
            <div style={{ textAlign: "center", padding: "30px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💼</div>
              <div style={{ fontWeight: 700, color: "#1E1B4B", marginBottom: 6 }}>
                Mali danışmanınız hazır
              </div>
              <div style={{ fontSize: 12, color: "#64748B", marginBottom: 24 }}>
                Türkçe, English, العربية — istediğiniz dilde sorun
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 8, maxWidth: 600, margin: "0 auto" }}>
                {STARTERS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s.tr)}
                    style={{ background: "#F8FAFF", border: "1.5px solid #E2E8F8", borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#1E1B4B", textAlign: "left", cursor: "pointer", lineHeight: 1.4 }}
                  >
                    {s.tr}
                    <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 4 }}>{s.en}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 14,
                direction: /[\u0600-\u06FF]/.test(m.content) ? "rtl" : "ltr",
              }}
            >
              <div
                style={{
                  maxWidth: "75%",
                  background: m.role === "user" ? "linear-gradient(135deg,#6C3AFF,#F43F8E)" : "#F8FAFF",
                  color: m.role === "user" ? "#fff" : "#1E1B4B",
                  padding: "12px 16px",
                  borderRadius: 14,
                  fontSize: 13,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  border: m.role === "user" ? "none" : "1.5px solid #E2E8F8",
                }}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 14 }}>
              <div style={{ background: "#F8FAFF", border: "1.5px solid #E2E8F8", padding: "10px 14px", borderRadius: 14, fontSize: 13, color: "#64748B" }}>
                <span style={{ display: "inline-flex", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: "#6C3AFF", animation: "blink 1.4s infinite" }} />
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: "#6C3AFF", animation: "blink 1.4s 0.2s infinite" }} />
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: "#6C3AFF", animation: "blink 1.4s 0.4s infinite" }} />
                </span>
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: 12, background: "#FEE2E2", color: "#991B1B", borderRadius: 10, fontSize: 12 }}>{error}</div>
          )}

          <style>{"@keyframes blink { 0%,80%,100% { opacity: 0.3 } 40% { opacity: 1 } }"}</style>
        </div>

        {/* Input */}
        <div style={{ padding: 16, borderTop: "1.5px solid #E2E8F8" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Sorunuzu yazın... / Ask in any language... / اسأل بأي لغة..."
              rows={2}
              style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #E2E8F8", borderRadius: 12, fontSize: 13, fontFamily: "inherit", resize: "none", outline: "none" }}
            />
            <button
              onClick={recording ? stopRecord : startRecord}
              style={{
                background: recording ? "#EF4444" : "#F8FAFF",
                border: "1.5px solid " + (recording ? "#EF4444" : "#E2E8F8"),
                color: recording ? "#fff" : "#6C3AFF",
                borderRadius: 12,
                padding: "0 14px",
                height: 48,
                fontWeight: 700,
                fontSize: 18,
                cursor: "pointer",
              }}
              title={recording ? "Kaydı durdur" : "Sesli sor"}
            >
              {recording ? "⏹" : "🎤"}
            </button>
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              style={{
                background: "linear-gradient(135deg,#6C3AFF,#F43F8E)",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "0 20px",
                height: 48,
                fontWeight: 700,
                fontSize: 13,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                opacity: loading || !input.trim() ? 0.5 : 1,
              }}
            >
              Gönder
            </button>
          </div>
        </div>
      </div>

      {/* Context sidebar */}
      <div style={{ width: 280, background: "#FFFFFF", borderRadius: 16, border: "1.5px solid #E2E8F8", padding: 18, overflow: "auto" }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#1E1B4B", marginBottom: 14 }}>📊 Mali Durum</div>
        {!context && <div style={{ fontSize: 12, color: "#94A3B8" }}>Yükleniyor...</div>}
        {context && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Stat label="Net Nakit (30g)" value={fmtCurrency(context.netCashFlow30Days, context.currency)} color={context.netCashFlow30Days >= 0 ? "#10B981" : "#EF4444"} />
            <Stat label="Banka Bakiyesi" value={fmtCurrency(context.bankBalance, context.currency)} color="#6366F1" />
            <Stat label="Vadesi Geçen" value={fmtCurrency(context.overdueInvoicesAmount, context.currency)} sub={context.overdueInvoicesCount + " fatura"} color="#F59E0B" />
            <Stat label="Pipeline" value={fmtCurrency(context.pipelineValue, context.currency)} color="#0EA5E9" />
            {context.upcomingTaxEvents?.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginBottom: 6 }}>Yaklaşan Vergi</div>
                {context.upcomingTaxEvents.map((t, i) => (
                  <div key={i} style={{ fontSize: 11, color: "#1E1B4B", padding: "4px 0" }}>
                    <strong>{t.type}</strong> · {t.dueDate}
                    {t.amount !== null && <span style={{ marginLeft: 6, color: "#94A3B8" }}>({fmtCurrency(t.amount, context.currency)})</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, sub, color }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: color || "#1E1B4B", marginTop: 2 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: "#94A3B8" }}>{sub}</div>}
    </div>
  );
}

function fmtCurrency(n, currency) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return Number(n).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " " + (currency || "TRY");
}
