// ================================================================
// CallRecorder — push-to-record with timer + animated waveform
// ================================================================
import React, { useEffect, useRef, useState } from "react";
import { getAIPalette, getAlertPalette, getSuccessPalette } from "../../../utils/dashboardPalette";

export default function CallRecorder({ onTranscript, lang = "TR", t = (s) => s }) {
  const ai = getAIPalette();
  const alert = getAlertPalette();
  const success = getSuccessPalette();

  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const startedAtRef = useRef(null);
  const tickRef = useRef(null);
  const recRef = useRef(null);

  useEffect(() => () => {
    if (tickRef.current) clearInterval(tickRef.current);
    try { recRef.current?.stop(); } catch { /* noop */ }
  }, []);

  const langCode = lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR";

  const start = async () => {
    setError(null);
    setTranscript("");
    setElapsed(0);
    startedAtRef.current = Date.now();
    if (typeof window === "undefined") return;
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) {
      setError("Browser does not support speech recognition");
      return;
    }
    try {
      // also request mic so the consent prompt fires
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Microphone permission denied");
      return;
    }
    const rec = new Rec();
    rec.lang = langCode;
    rec.continuous = true;
    rec.interimResults = true;
    let final = "";
    rec.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const txt = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += txt + " ";
        else interim += txt;
      }
      setTranscript((final + interim).trim());
    };
    rec.onerror = (e) => setError(e?.error || "speech-error");
    rec.onend = () => {
      setRecording(false);
      onTranscript && onTranscript({ transcript: final.trim(), durationSec: Math.round((Date.now() - startedAtRef.current) / 1000) });
    };
    recRef.current = rec;
    rec.start();
    setRecording(true);
    tickRef.current = setInterval(() => {
      setElapsed(Math.round((Date.now() - startedAtRef.current) / 1000));
    }, 500);
  };

  const stop = () => {
    if (tickRef.current) clearInterval(tickRef.current);
    try { recRef.current?.stop(); } catch { /* noop */ }
  };

  const mins = Math.floor(elapsed / 60);
  const secs = String(elapsed % 60).padStart(2, "0");
  const palette = recording ? alert : ai;

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${palette.bg}, ${palette.base}25)`,
        border: `2px solid ${palette.base}50`,
        borderRadius: 18,
        padding: 22,
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 18,
        alignItems: "center",
        boxShadow: `0 8px 28px ${palette.base}25`,
      }}
      className="cr-grid"
    >
      <button
        type="button"
        onClick={recording ? stop : start}
        aria-label={recording ? t("coach.action.stop") : t("coach.action.record")}
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
          color: "#fff",
          border: "none",
          fontSize: 28,
          cursor: "pointer",
          boxShadow: `0 8px 24px ${palette.base}50`,
          flexShrink: 0,
          animation: recording ? "crPulse 1.2s ease-in-out infinite" : "none",
        }}
      >
        {recording ? "⏹" : "🎙"}
      </button>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, color: palette.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
          {recording ? t("coach.recording") : t("coach.action.record")}
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: palette.base, fontFamily: "monospace", letterSpacing: "-0.04em", lineHeight: 1 }}>
          {mins}:{secs}
        </div>
        {transcript && (
          <div style={{ marginTop: 8, fontSize: 12, color: "#475569", fontStyle: "italic", maxHeight: 60, overflowY: "auto" }}>
            "{transcript}"
          </div>
        )}
        {error && (
          <div style={{ marginTop: 6, fontSize: 11, color: alert.dark, fontWeight: 700 }}>⚠ {error}</div>
        )}
      </div>
      {recording && (
        <div style={{ display: "flex", gap: 4, alignItems: "center", height: 40 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              style={{
                width: 4,
                background: palette.base,
                borderRadius: 2,
                animation: `crWave 1s ease-in-out ${i * 0.1}s infinite`,
              }}
            />
          ))}
        </div>
      )}
      <style>{`
        @keyframes crPulse {
          0%, 100% { box-shadow: 0 0 0 0 ${palette.base}80, 0 8px 24px ${palette.base}50; }
          50% { box-shadow: 0 0 0 18px ${palette.base}00, 0 12px 32px ${palette.base}60; }
        }
        @keyframes crWave {
          0%, 100% { height: 8px; }
          50% { height: 32px; }
        }
        @media (max-width: 540px) { .cr-grid { grid-template-columns: 1fr !important; text-align: center; } }
      `}</style>
    </div>
  );
}
