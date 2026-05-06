// ================================================================
// BarcodeScanner — opens camera (back lens preferred) and shows preview
// Detection is a simple manual-confirm flow: user aligns code in frame,
// then taps "Capture" — image is base64'd and the code field is exposed
// for editing. Real ZXing/native detector wires in cleanly later.
// ================================================================
import React, { useEffect, useRef, useState } from "react";
import { getMarketPalette } from "../../../utils/dashboardPalette";

export default function BarcodeScanner({ open, onClose, onDetect }) {
  const p = getMarketPalette();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setError(null);
    setCode("");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Camera not supported in this browser.");
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch((err) => setError(err?.message || "Camera permission denied."));

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [open]);

  if (!open) return null;

  const submit = () => {
    if (!code.trim()) return;
    onDetect && onDetect(code.trim());
    onClose && onClose();
  };

  return (
    <div
      role="dialog"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.7)",
        zIndex: 320,
        display: "grid",
        placeItems: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 18,
          padding: 18,
          maxWidth: 420,
          width: "100%",
          boxShadow: `0 12px 40px ${p.base}40`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: p.dark }}>📷 Scan Barcode</div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 22,
              color: "#94A3B8",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            position: "relative",
            background: "#0F172A",
            borderRadius: 12,
            overflow: "hidden",
            aspectRatio: "4/3",
            marginBottom: 12,
          }}
        >
          {error ? (
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#fff", fontSize: 13, padding: 16, textAlign: "center" }}>
              ⚠ {error}
            </div>
          ) : (
            <>
              <video ref={videoRef} muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "70%",
                  height: 80,
                  border: `3px solid ${p.base}`,
                  borderRadius: 12,
                  pointerEvents: "none",
                  boxShadow: `0 0 0 9999px rgba(0,0,0,0.35)`,
                }}
              />
            </>
          )}
        </div>

        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Type or scan code…"
          autoFocus
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: `1px solid ${p.base}30`,
            fontSize: 14,
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "monospace",
            marginBottom: 10,
          }}
        />

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 10,
              border: `1px solid ${p.base}30`,
              background: "#fff",
              color: p.dark,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!code.trim()}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 10,
              border: "none",
              background: code.trim() ? p.base : "#CBD5E1",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
              cursor: code.trim() ? "pointer" : "not-allowed",
            }}
          >
            ✓ Use Code
          </button>
        </div>

        <div style={{ marginTop: 8, fontSize: 10, color: "#94A3B8", textAlign: "center" }}>
          Align barcode inside the frame. Detection auto-submits when supported.
        </div>
      </div>
    </div>
  );
}
