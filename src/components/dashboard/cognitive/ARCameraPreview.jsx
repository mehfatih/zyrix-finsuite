// ================================================================
// ARCameraPreview — live camera feed + capture overlay
// ================================================================
import React, { useEffect, useRef, useState } from "react";
import { getAIPalette, getAlertPalette } from "../../../utils/dashboardPalette";

export default function ARCameraPreview({
  active = false,
  onStart,
  onStop,
  onCapture,
  framePosition = "rect", // 'rect' | 'oval'
  height = 360,
  t = (s) => s,
}) {
  const ai = getAIPalette();
  const alert = getAlertPalette();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (active) {
      start();
    } else {
      stop();
    }
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const start = async () => {
    setError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError("Camera not supported");
      return;
    }
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
      onStart && onStart();
    } catch (e) {
      setError(e?.message || "Permission denied");
    }
  };

  const stop = () => {
    streamRef.current?.getTracks?.().forEach((tr) => tr.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    onStop && onStop();
  };

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth || 1080;
    c.height = v.videoHeight || 720;
    c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL("image/jpeg", 0.85);
    onCapture && onCapture({ dataUrl, capturedAt: new Date().toISOString() });
  };

  return (
    <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", background: "#0F172A", height }}>
      <video ref={videoRef} muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: active ? "block" : "none" }} />
      {!active && (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#fff", textAlign: "center", padding: 20 }}>
          <div>
            <div style={{ fontSize: 56, marginBottom: 12 }}>📷</div>
            <div style={{ fontSize: 13, fontWeight: 700, opacity: 0.9 }}>{t("ar.store.permission")}</div>
          </div>
        </div>
      )}
      {/* AR frame overlay */}
      {active && framePosition === "rect" && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "10%",
            border: `3px solid ${ai.base}`,
            borderRadius: 14,
            boxShadow: `0 0 0 9999px rgba(0,0,0,0.35), 0 0 30px ${ai.base}80`,
            pointerEvents: "none",
            animation: "arcFrame 2s ease-in-out infinite",
          }}
        />
      )}
      {/* Capture button */}
      {active && onCapture && (
        <button
          type="button"
          onClick={capture}
          aria-label="Capture"
          style={{
            position: "absolute",
            insetInlineStart: "50%",
            transform: "translateX(-50%)",
            bottom: 18,
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#fff",
            color: ai.dark,
            border: `4px solid ${ai.base}`,
            cursor: "pointer",
            fontSize: 28,
            boxShadow: `0 8px 24px ${ai.base}50`,
          }}
        >
          ⚪
        </button>
      )}
      {error && (
        <div style={{ position: "absolute", top: 12, insetInlineStart: 12, background: alert.base, color: "#fff", padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800 }}>
          ⚠ {error}
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <style>{`
        @keyframes arcFrame {
          0%, 100% { box-shadow: 0 0 0 9999px rgba(0,0,0,0.35), 0 0 12px ${ai.base}50; }
          50%      { box-shadow: 0 0 0 9999px rgba(0,0,0,0.35), 0 0 36px ${ai.base}99; }
        }
      `}</style>
    </div>
  );
}
