// ================================================================
// DangerActionDialog — confirms destructive operations.
// Multi-step confirmation chain for severity="critical".
// ================================================================
import React, { useState } from "react";
import { CRITICAL_RED } from "../../utils/admin/adminPalette";

export default function DangerActionDialog({
  open,
  title,
  message,
  confirmWord,
  severity = "warning",
  steps = 1,
  onConfirm,
  onCancel,
}) {
  const [step, setStep] = useState(1);
  const [typed, setTyped] = useState("");

  if (!open) return null;
  const crit = CRITICAL_RED;

  const onNext = () => {
    if (step < steps) {
      setStep(step + 1);
      setTyped("");
    } else {
      onConfirm?.();
      setStep(1);
      setTyped("");
    }
  };

  const reset = () => {
    setStep(1);
    setTyped("");
    onCancel?.();
  };

  const canConfirm = !confirmWord || typed.trim().toUpperCase() === confirmWord.toUpperCase();

  return (
    <div role="dialog" aria-modal="true" style={{
      position: "fixed", inset: 0, zIndex: 10000,
      background: "rgba(15,23,42,0.7)",
      display: "grid", placeItems: "center",
      padding: 20,
      animation: "dadFade .15s ease",
    }}>
      <div style={{
        width: "100%", maxWidth: 480,
        background: "#fff",
        borderRadius: 18,
        padding: 24,
        boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
        border: `2px solid ${crit.base}`,
      }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: crit.bg, color: crit.dark, display: "grid", placeItems: "center", fontSize: 28, margin: "0 auto 12px" }}>
            ⚠
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: crit.dark, margin: "0 0 6px" }}>{title}</h2>
          <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.5 }}>{message}</p>
        </div>

        {steps > 1 && (
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16 }}>
            {Array.from({ length: steps }).map((_, i) => (
              <div key={i} style={{ width: 30, height: 5, borderRadius: 999, background: i < step ? crit.base : "#E2E8F0" }} />
            ))}
            <span style={{ fontSize: 10, color: crit.dark, fontWeight: 800, marginInlineStart: 8 }}>Step {step}/{steps}</span>
          </div>
        )}

        {confirmWord && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 800, color: crit.dark, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
              Type <code style={{ background: crit.bg, padding: "2px 8px", borderRadius: 4, color: crit.dark }}>{confirmWord}</code> to confirm
            </label>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoFocus
              style={{
                width: "100%",
                padding: "12px 14px",
                border: `1.5px solid ${canConfirm && typed ? crit.base : "#E2E8F0"}`,
                borderRadius: 10, fontSize: 14, fontFamily: "ui-monospace, monospace",
                fontWeight: 800, letterSpacing: "0.04em",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button type="button" onClick={reset} style={{ background: "#F1F5F9", color: "#0F172A", border: "1px solid #E2E8F0", padding: "10px 18px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canConfirm}
            style={{
              background: canConfirm ? `linear-gradient(135deg, ${crit.base}, ${crit.dark})` : "#CBD5E1",
              color: "#fff", border: "none",
              padding: "10px 22px", borderRadius: 10, fontSize: 12, fontWeight: 800,
              cursor: canConfirm ? "pointer" : "not-allowed",
              boxShadow: canConfirm ? `0 6px 16px ${crit.base}40` : "none",
            }}
          >
            {step < steps ? `Continue (${step}/${steps})` : `⚠ ${title}`}
          </button>
        </div>

        <style>{`@keyframes dadFade { from { opacity: 0; } to { opacity: 1; } }`}</style>
      </div>
    </div>
  );
}
