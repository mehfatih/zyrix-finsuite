// ================================================================
// VoiceRecorder — push-to-talk WebRTC recorder + Web Speech API STT
// Falls back to MediaRecorder when SpeechRecognition is unavailable.
// ================================================================
import React, { useEffect, useRef, useState } from "react";
import { getAIPalette, getBrandPalette } from "../../../utils/dashboardPalette";

export default function VoiceRecorder({
  lang = "TR",
  onTranscript,
  onError,
  size = "hero",
  t = (s) => s,
}) {
  const ai = getAIPalette();
  const brand = getBrandPalette(lang.toLowerCase());
  const [recording, setRecording] = useState(false);
  const [interim, setInterim] = useState("");
  const recRef = useRef(null);
  const streamRef = useRef(null);
  const supportsSpeech = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    return () => {
      // cleanup on unmount
      try { recRef.current?.abort?.(); recRef.current?.stop?.(); } catch { /* ignore */ }
      streamRef.current?.getTracks?.().forEach((tr) => tr.stop());
    };
  }, []);

  const langCode = lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR";

  const start = async () => {
    if (recording) return;
    setInterim("");
    try {
      // Request mic permission early so MediaRecorder fallback works too
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      onError && onError(t("invoice.permission.error"));
      return;
    }
    if (!supportsSpeech) {
      onError && onError(t("invoice.unsupported"));
      streamRef.current?.getTracks?.().forEach((tr) => tr.stop());
      return;
    }
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new Rec();
    rec.lang = langCode;
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    let finalText = "";
    rec.onresult = (event) => {
      let current = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += transcript;
        else current += transcript;
      }
      setInterim(finalText + current);
    };
    rec.onerror = (e) => {
      onError && onError(e?.error || "speech-error");
      stop();
    };
    rec.onend = () => {
      setRecording(false);
      streamRef.current?.getTracks?.().forEach((tr) => tr.stop());
      streamRef.current = null;
      const final = (finalText || interim || "").trim();
      if (final) onTranscript && onTranscript(final);
    };
    recRef.current = rec;
    rec.start();
    setRecording(true);
  };

  const stop = () => {
    try { recRef.current?.stop?.(); } catch { /* ignore */ }
    setRecording(false);
  };

  const dim = size === "hero" ? 130 : 70;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <button
        type="button"
        onClick={recording ? stop : start}
        onTouchStart={(e) => { e.preventDefault(); if (!recording) start(); }}
        onTouchEnd={(e) => { e.preventDefault(); if (recording) stop(); }}
        aria-label={recording ? "Stop" : t("invoice.hero.cta")}
        style={{
          width: dim,
          height: dim,
          borderRadius: "50%",
          background: recording
            ? `linear-gradient(135deg, ${brand.base}, ${ai.base})`
            : `linear-gradient(135deg, ${ai.base}, ${ai.dark})`,
          color: "#fff",
          border: "none",
          fontSize: dim * 0.4,
          cursor: "pointer",
          boxShadow: `0 12px 40px ${ai.base}50`,
          display: "grid",
          placeItems: "center",
          position: "relative",
          transition: "transform .15s, box-shadow .25s",
          animation: recording ? "vrPulse 1.2s ease-in-out infinite" : "none",
        }}
      >
        {recording ? "⏹" : "🎤"}
      </button>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: ai.dark }}>
          {recording ? t("invoice.processing.transcribing") : t("invoice.hero.holdToSpeak")}
        </div>
        {!recording && (
          <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4, fontStyle: "italic", maxWidth: 320 }}>
            {t("invoice.hero.tip")}
          </div>
        )}
        {recording && interim && (
          <div style={{ marginTop: 10, padding: "8px 14px", background: ai.bg, borderRadius: 12, color: ai.dark, fontSize: 13, maxWidth: 360, fontStyle: "italic" }}>
            "{interim}"
          </div>
        )}
        {recording && (
          <div style={{ marginTop: 10, display: "flex", gap: 4, justifyContent: "center" }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                style={{
                  width: 4,
                  background: ai.base,
                  borderRadius: 2,
                  animation: `vrWave 1s ease-in-out ${i * 0.1}s infinite`,
                }}
              />
            ))}
          </div>
        )}
      </div>
      <style>{`
        @keyframes vrPulse {
          0%, 100% { box-shadow: 0 0 0 0 ${ai.base}80, 0 12px 40px ${ai.base}50; transform: scale(1); }
          50% { box-shadow: 0 0 0 24px ${ai.base}00, 0 16px 48px ${ai.base}60; transform: scale(1.06); }
        }
        @keyframes vrWave {
          0%, 100% { height: 8px; }
          50% { height: 24px; }
        }
      `}</style>
    </div>
  );
}
