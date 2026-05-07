// ================================================================
// EmailEditor — subject + body editor with template picker + preview
// ================================================================
import React, { useState } from "react";
import { getReportsPalette, getAIPalette, getSuccessPalette } from "../../../utils/dashboardPalette";
import { EMAIL_TEMPLATES } from "../../../pages/dashboard/voice-cx/voiceCxApi";

export default function EmailEditor({
  draft,
  onChange,
  onSend,
  onSchedule,
  onSaveDraft,
  onTest,
  t = (s) => s,
}) {
  const reports = getReportsPalette();
  const ai = getAIPalette();
  const success = getSuccessPalette();

  const [showPreview, setShowPreview] = useState(false);

  const apply = (patch) => onChange?.({ ...(draft || {}), ...patch });

  const useTemplate = (tpl) => {
    apply({ subject: tpl.subject, body: tpl.body, templateId: tpl.id });
  };

  return (
    <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 18, padding: 20 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>{t("email.builder.title")}</div>
      </div>

      {/* Template strip */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
          {t("email.template.title")}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {EMAIL_TEMPLATES.map((tpl) => {
            const active = draft?.templateId === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => useTemplate(tpl)}
                style={{
                  background: active ? `linear-gradient(135deg, ${reports.base}, ${reports.dark})` : reports.bg,
                  color: active ? "#fff" : reports.dark,
                  border: `1px solid ${active ? reports.base : reports.base + "40"}`,
                  padding: "8px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                {t(`email.template.${tpl.id}`)}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <Field label={t("email.builder.subject")}>
          <input
            type="text"
            value={draft?.subject || ""}
            onChange={(e) => apply({ subject: e.target.value })}
            placeholder={t("email.builder.subjectPh")}
            style={inp}
          />
        </Field>
      </div>

      <div style={{ marginBottom: 12 }}>
        <Field label={t("email.builder.from")}>
          <input
            type="text"
            value={draft?.fromName || ""}
            onChange={(e) => apply({ fromName: e.target.value })}
            placeholder="Levana Pharma"
            style={inp}
          />
        </Field>
      </div>

      <div style={{ marginBottom: 14 }}>
        <Field label={t("email.builder.body")}>
          <textarea
            value={draft?.body || ""}
            onChange={(e) => apply({ body: e.target.value })}
            placeholder={t("email.builder.bodyPh")}
            rows={8}
            style={{ ...inp, fontFamily: "inherit", resize: "vertical", lineHeight: 1.55 }}
          />
        </Field>
        <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", alignSelf: "center", marginInlineEnd: 4 }}>
            {t("email.builder.aiAssist")}:
          </span>
          {["friendly", "formal", "urgent", "exciting"].map((tone) => (
            <button
              key={tone}
              type="button"
              onClick={() => apply({ body: (draft?.body || "") + `\n\n[${tone}]` })}
              style={{
                background: ai.bg, color: ai.dark, border: `1px solid ${ai.base}30`,
                padding: "5px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, cursor: "pointer",
              }}
            >
              ✨ {t(`email.builder.tone.${tone}`)}
            </button>
          ))}
        </div>
      </div>

      {showPreview && (
        <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 14, padding: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, marginBottom: 6 }}>From: {draft?.fromName || "—"}</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginBottom: 10 }}>{draft?.subject || "(no subject)"}</div>
          <div style={{ fontSize: 13, color: "#0F172A", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{draft?.body || "(empty)"}</div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
        <button type="button" onClick={() => setShowPreview((v) => !v)} style={btnGhost}>
          {showPreview ? "Hide" : "👁"} {t("email.builder.preview")}
        </button>
        {onTest    && <button type="button" onClick={onTest}    style={btnGhost}>{t("email.action.test")}</button>}
        {onSaveDraft && <button type="button" onClick={onSaveDraft} style={btnGhost}>{t("email.action.draft")}</button>}
        {onSchedule && <button type="button" onClick={onSchedule} style={btnGhost}>{t("email.action.schedule")}</button>}
        {onSend && (
          <button type="button" onClick={onSend} style={{ background: `linear-gradient(135deg, ${success.base}, ${success.dark})`, color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 14px ${success.base}40` }}>
            ⚡ {t("email.action.send")}
          </button>
        )}
      </div>
    </div>
  );
}

const inp = { width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" };
const btnGhost = { background: "#F1F5F9", color: "#0F172A", border: "1px solid #E2E8F0", padding: "10px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" };

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#64748B", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
        {label}
      </div>
      {children}
    </div>
  );
}
