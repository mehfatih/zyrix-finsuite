// ================================================================
// CSATSurvey — 5-star rating + comment after ticket resolution
// ================================================================
import React, { useState } from "react";
import { getSuccessPalette, getWarningPalette, getAlertPalette, getBrandPalette } from "../../utils/dashboardPalette";

export default function CSATSurvey({ onSubmit, lang = "tr", t = (s) => s }) {
  const success = getSuccessPalette();
  const warn = getWarningPalette();
  const alert = getAlertPalette();
  const brand = getBrandPalette(String(lang).toLowerCase());
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = () => {
    if (!rating) return;
    onSubmit?.(rating, comment);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div role="status" style={{ background: success.bg, border: `1.5px solid ${success.base}40`, borderRadius: 14, padding: 18, textAlign: "center", color: success.dark, fontWeight: 800 }}>
        ✓ {t("ticket.detail.csat.thanks")}
      </div>
    );
  }

  const palette = rating >= 4 ? success : rating >= 3 ? warn : rating > 0 ? alert : brand;

  return (
    <div style={{ background: "#fff", border: `1.5px solid ${palette.base}40`, borderRadius: 14, padding: 20 }}>
      <h3 style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", margin: "0 0 4px" }}>{t("ticket.detail.csat.title")}</h3>
      <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 14px" }}>{t("ticket.detail.csat.subtitle")}</p>
      <div role="radiogroup" aria-label="rating" style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 14 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            style={{
              background: "transparent", border: "none",
              fontSize: 36, cursor: "pointer",
              color: (hover || rating) >= n ? palette.base : "#E2E8F0",
              transition: "color .15s, transform .15s",
              transform: (hover || rating) >= n ? "scale(1.1)" : "scale(1)",
              padding: 0, lineHeight: 1,
            }}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder={t("ticket.detail.csat.comment.ph")}
        rows={3}
        style={{ width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, fontFamily: "inherit", marginBottom: 12, resize: "vertical", boxSizing: "border-box" }}
      />
      <button
        type="button"
        onClick={submit}
        disabled={!rating}
        style={{
          width: "100%",
          background: rating ? `linear-gradient(135deg, ${palette.base}, ${palette.dark})` : "#CBD5E1",
          color: "#fff", border: "none",
          padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 800,
          cursor: rating ? "pointer" : "not-allowed",
          boxShadow: rating ? `0 6px 14px ${palette.base}40` : "none",
        }}
      >
        {t("ticket.detail.csat.submit")}
      </button>
    </div>
  );
}
