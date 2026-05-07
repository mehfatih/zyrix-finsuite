// ================================================================
// VoiceCommandRecorder — push-to-talk with live transcript + parse
// ================================================================
import React, { useEffect, useRef, useState } from "react";
import { getAIPalette, getBrandPalette, getAlertPalette } from "../../../utils/dashboardPalette";
import { parseVoiceIntent } from "../../../pages/dashboard/voice-cx/voiceCxApi";

export default function VoiceCommandRecorder({
  lang = "TR",
  onResult,
  t = (s) => s,
}) {
  const ai = getAIPalette();
  const brand = getBrandPalette(lang.toLowerCase());
  const alert = getAlertPalette();
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState(null);
  const recogRef = useRef(null);

  const Supported = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => () => recogRef.current?.stop?.(), []);

  const start = () => {
    setError(null);
    if (!Supported) {
      setError(t("voice.test.unsupported"));
      return;
    }
    setTranscript("");
    setParsed(null);
    const Recog = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recog = new Recog();
    recog.lang = lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR";
    recog.interimResults = true;
    recog.continuous = true;
    recog.onresult = (ev) => {
      let txt = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        txt += ev.results[i][0].transcript;
      }
      setTranscript((prev) => (prev + " " + txt).trim());
    };
    recog.onend = () => setRecording(false);
    recog.onerror = (e) => { setError(e?.error || "Recording error"); setRecording(false); };
    recog.start();
    recogRef.current = recog;
    setRecording(true);
  };

  const stop = () => {
    recogRef.current?.stop?.();
    setRecording(false);
    setTimeout(() => {
      const intent = parseVoiceIntent(transcript);
      setParsed(intent);
    }, 200);
  };

  const confirm = () => {
    onResult?.({ transcript, parsed });
    setTranscript("");
    setParsed(null);
  };

  const cancel = () => {
    setTranscript("");
    setParsed(null);
  };

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${ai.bg}, #fff)`,
        border: `1.5px solid ${ai.base}30`,
        borderRadius: 18,
        padding: 22,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#0F172A" }}>{t("voice.test.title")}</div>
      </div>

      <div style={{ display: "grid", placeItems: "center", padding: "16px 0 22px" }}>
        <button
          type="button"
          onMouseDown={start}
          onMouseUp={stop}
          onTouchStart={(e) => { e.preventDefault(); start(); }}
          onTouchEnd={stop}
          disabled={!Supported}
          style={{
            width: 120, height: 120, borderRadius: "50%",
            background: recording ? `linear-gradient(135deg, ${alert.base}, ${alert.dark})` : `linear-gradient(135deg, ${brand.base}, ${brand.dark})`,
            color: "#fff",
            border: "none",
            fontSize: 42,
            cursor: Supported ? "pointer" : "not-allowed",
            opacity: Supported ? 1 : 0.5,
            boxShadow: recording ? `0 0 0 8px ${alert.base}30, 0 12px 30px ${alert.base}40` : `0 12px 30px ${brand.base}40`,
            transition: "all .25s",
            animation: recording ? "vcMicPulse 1.2s infinite" : "none",
            position: "relative",
          }}
          aria-label={t("voice.test.holdToRecord")}
        >
          {recording ? "⏺" : "🎙"}
        </button>
        <div style={{ marginTop: 12, fontSize: 12, color: ai.dark, fontWeight: 700 }}>
          {recording ? t("voice.test.recording") : t("voice.test.holdToRecord")}
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          border: `1px dashed ${ai.base}40`,
          borderRadius: 14,
          padding: 14,
          minHeight: 70,
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
          {t("voice.test.transcript")}
        </div>
        <div style={{ fontSize: 14, color: "#0F172A", fontWeight: 600, lineHeight: 1.5, fontStyle: transcript ? "normal" : "italic", opacity: transcript ? 1 : 0.5 }}>
          {transcript || "—"}
        </div>
      </div>

      {parsed && (
        <div style={{ background: ai.bg, border: `1px solid ${ai.base}40`, borderRadius: 14, padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: ai.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            {t("voice.test.parsed")}
          </div>
          {parsed.intent ? (
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>
                {t(`voice.cmd.${parsed.intent}.title`)}
              </div>
              <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                {parsed.matched && <code style={{ background: "#fff", padding: "2px 6px", borderRadius: 6, marginInlineEnd: 6 }}>{parsed.matched}</code>}
                {parsed.amount && <span style={{ marginInlineEnd: 6 }}>· ₺{parsed.amount.toLocaleString()}</span>}
                {parsed.customer && <span>· {parsed.customer}</span>}
              </div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 6 }}>
                {Math.round(parsed.confidence * 100)}% confidence
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "#9F1239", fontWeight: 700 }}>
              No matching command. Try: "fatura kes", "create invoice", or "اعمل فاتورة".
            </div>
          )}
        </div>
      )}

      {error && <div style={{ color: alert.dark, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>⚠ {error}</div>}

      {parsed && parsed.intent && (
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button type="button" onClick={cancel} style={{ background: "transparent", color: "#64748B", border: "1px solid #E2E8F0", padding: "10px 16px", borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {t("voice.test.cancel")}
          </button>
          <button type="button" onClick={confirm} style={{ background: `linear-gradient(135deg, ${ai.base}, ${ai.dark})`, color: "#fff", border: "none", padding: "10px 18px", borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 16px ${ai.base}40` }}>
            ⚡ {t("voice.test.confirm")}
          </button>
        </div>
      )}

      <style>{`@keyframes vcMicPulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.06);} }`}</style>
    </div>
  );
}
