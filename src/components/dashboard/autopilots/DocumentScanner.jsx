// ================================================================
// DocumentScanner — camera capture or upload, returns base64 image
// ================================================================
import React, { useEffect, useRef, useState } from "react";
import { getAIPalette, getMarketPalette } from "../../../utils/dashboardPalette";

export default function DocumentScanner({
  onCapture,
  t = (s) => s,
  label = "Scan / Upload",
  fullScreen = false,
}) {
  const ai = getAIPalette();
  const market = getMarketPalette();
  const [cameraOn, setCameraOn] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks?.().forEach((tr) => tr.stop());
    };
  }, []);

  const startCamera = async () => {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Camera not supported");
      return;
    }
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
      }
      setCameraOn(true);
    } catch (e) {
      setError(e?.message || "Permission denied");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks?.().forEach((tr) => tr.stop());
    streamRef.current = null;
    setCameraOn(false);
  };

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth || 1080;
    c.height = v.videoHeight || 720;
    c.getContext("2d").drawImage(v, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL("image/jpeg", 0.85);
    onCapture && onCapture({ dataUrl, source: "camera", capturedAt: new Date().toISOString() });
    stopCamera();
  };

  const onUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onCapture && onCapture({ dataUrl: String(reader.result || ""), source: "upload", filename: file.name, capturedAt: new Date().toISOString() });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      style={{
        background: "#fff",
        border: `2px dashed ${market.base}40`,
        borderRadius: 16,
        padding: fullScreen ? 32 : 22,
        textAlign: "center",
      }}
    >
      {!cameraOn ? (
        <>
          <div style={{ fontSize: 42, marginBottom: 10 }}>📷</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: market.dark, marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: 11, color: "#64748B", marginBottom: 16 }}>
            {t("filing.subtitle")}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={startCamera}
              style={{
                background: `linear-gradient(135deg, ${market.base}, ${market.dark})`,
                color: "#fff",
                border: "none",
                padding: "10px 18px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: `0 6px 18px ${market.base}40`,
              }}
            >
              📷 Camera
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{
                background: ai.bg,
                color: ai.dark,
                border: `1px solid ${ai.base}40`,
                padding: "10px 18px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              ⬆ Upload
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={onUpload}
              style={{ display: "none" }}
            />
          </div>
          {error && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#9F1239", fontWeight: 700 }}>
              ⚠ {error}
            </div>
          )}
        </>
      ) : (
        <div>
          <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", background: "#0F172A", aspectRatio: "4/3", marginBottom: 14 }}>
            <video ref={videoRef} muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div
              style={{
                position: "absolute",
                inset: "10%",
                border: `3px solid ${market.base}`,
                borderRadius: 12,
                pointerEvents: "none",
                boxShadow: `0 0 0 9999px rgba(0,0,0,0.4)`,
              }}
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button type="button" onClick={stopCamera} style={btn(ai, "secondary")}>
              ✗ Cancel
            </button>
            <button type="button" onClick={capture} style={btn(market, "primary")}>
              📸 Capture
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function btn(palette, variant) {
  if (variant === "primary") {
    return {
      background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
      color: "#fff",
      border: "none",
      padding: "10px 22px",
      borderRadius: 12,
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: `0 6px 18px ${palette.base}40`,
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
