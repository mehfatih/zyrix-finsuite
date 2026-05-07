// ================================================================
// CampaignBuilder — multi-step campaign editor with channel + delay
// ================================================================
import React, { useState } from "react";
import { getMarketPalette, getAIPalette, getSuccessPalette, getReportsPalette, getCustomerPalette } from "../../../utils/dashboardPalette";

const TRIGGERS = ["purchase", "abandon", "birthday", "signup", "dormant", "manual"];
const CHANNELS = ["whatsapp", "email", "sms"];

const channelPalette = (ch, market, reports, customer) => ({
  whatsapp: { base: "#25D366", dark: "#0D9669", bg: "#DCFCE7" },
  email:    reports,
  sms:      customer,
}[ch] || market);

export default function CampaignBuilder({
  campaign,
  onChange,
  onSave,
  onCancel,
  t = (s) => s,
}) {
  const market = getMarketPalette();
  const ai = getAIPalette();
  const success = getSuccessPalette();
  const reports = getReportsPalette();
  const customer = getCustomerPalette();

  const camp = campaign || { name: "", trigger: "purchase", status: "draft", steps: [] };
  const apply = (patch) => onChange?.({ ...camp, ...patch });
  const updateStep = (idx, patch) => {
    const next = camp.steps.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    apply({ steps: next });
  };
  const addStep = () => {
    apply({ steps: [...(camp.steps || []), { id: `s${Date.now()}`, channel: "whatsapp", waitDays: 1, body: "" }] });
  };
  const removeStep = (idx) => {
    apply({ steps: camp.steps.filter((_, i) => i !== idx) });
  };
  const moveStep = (idx, dir) => {
    const next = [...camp.steps];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    apply({ steps: next });
  };

  return (
    <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 18, padding: 20 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>{t("campaigns.builder.title")}</div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <Field label={t("campaigns.builder.name")}>
          <input
            type="text"
            value={camp.name || ""}
            onChange={(e) => apply({ name: e.target.value })}
            placeholder={t("campaigns.builder.namePh")}
            style={inp}
          />
        </Field>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Field label={t("campaigns.builder.trigger")}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {TRIGGERS.map((tr) => {
              const active = camp.trigger === tr;
              return (
                <button
                  key={tr}
                  type="button"
                  onClick={() => apply({ trigger: tr })}
                  style={{
                    background: active ? `linear-gradient(135deg, ${ai.base}, ${ai.dark})` : ai.bg,
                    color: active ? "#fff" : ai.dark,
                    border: `1px solid ${active ? ai.base : ai.base + "30"}`,
                    padding: "6px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {t(`campaigns.trigger.${tr}`)}
                </button>
              );
            })}
          </div>
        </Field>
      </div>

      <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
        {t("campaigns.builder.steps")}
      </div>

      <div style={{ position: "relative", paddingInlineStart: 22, marginBottom: 12 }}>
        <div style={{ position: "absolute", insetInlineStart: 10, top: 4, bottom: 4, width: 2, background: market.base + "30", borderRadius: 2 }} />
        {(camp.steps || []).length === 0 && (
          <div style={{ padding: 16, color: "#94A3B8", fontSize: 13, textAlign: "center", border: "1.5px dashed #E2E8F0", borderRadius: 12 }}>
            No steps yet. Add the first one below.
          </div>
        )}
        {(camp.steps || []).map((step, idx) => {
          const cp = channelPalette(step.channel, market, reports, customer);
          return (
            <div key={step.id} style={{ position: "relative", marginBottom: 12 }}>
              <div
                style={{
                  position: "absolute", insetInlineStart: -16, top: 14,
                  width: 14, height: 14, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${cp.base}, ${cp.dark})`,
                  boxShadow: `0 0 0 4px #fff, 0 0 0 5px ${cp.base}40`,
                }}
              />
              <div style={{ background: "#F8FAFC", border: `1.5px solid ${cp.base}30`, borderRadius: 14, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: cp.dark, background: cp.bg, padding: "4px 10px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Step {idx + 1}
                  </span>
                  <select
                    value={step.channel}
                    onChange={(e) => updateStep(idx, { channel: e.target.value })}
                    style={{ padding: "4px 8px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 11, fontWeight: 700, fontFamily: "inherit" }}
                  >
                    {CHANNELS.map((ch) => <option key={ch} value={ch}>{t(`campaigns.channel.${ch}`)}</option>)}
                  </select>
                  <input
                    type="number"
                    min={0}
                    value={step.waitDays}
                    onChange={(e) => updateStep(idx, { waitDays: Number(e.target.value) || 0 })}
                    style={{ width: 60, padding: "4px 8px", borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 11, fontFamily: "inherit" }}
                  />
                  <span style={{ fontSize: 10, color: "#64748B" }}>{t("campaigns.builder.delay.days", { n: "" }).trim()}</span>
                  <div style={{ marginInlineStart: "auto", display: "flex", gap: 4 }}>
                    <button type="button" onClick={() => moveStep(idx, -1)} disabled={idx === 0} style={iconBtn}>↑</button>
                    <button type="button" onClick={() => moveStep(idx,  1)} disabled={idx === camp.steps.length - 1} style={iconBtn}>↓</button>
                    <button type="button" onClick={() => removeStep(idx)} style={{ ...iconBtn, color: "#9F1239" }}>✗</button>
                  </div>
                </div>
                <textarea
                  value={step.body || ""}
                  onChange={(e) => updateStep(idx, { body: e.target.value })}
                  rows={2}
                  placeholder="Message body…"
                  style={{ ...inp, background: "#fff", fontFamily: "inherit", resize: "vertical" }}
                />
              </div>
            </div>
          );
        })}
        <button
          type="button"
          onClick={addStep}
          style={{
            width: "100%",
            background: market.bg, color: market.dark, border: `1.5px dashed ${market.base}`,
            padding: "10px 14px", borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer",
          }}
        >
          + {t("campaigns.builder.addStep")}
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
        {onCancel && <button type="button" onClick={onCancel} style={btnGhost}>{t("common.cancel")}</button>}
        {onSave && (
          <button type="button" onClick={onSave} style={{ background: `linear-gradient(135deg, ${success.base}, ${success.dark})`, color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 14px ${success.base}40` }}>
            ⚡ {t("campaigns.action.save")}
          </button>
        )}
      </div>
    </div>
  );
}

const inp = { width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" };
const btnGhost = { background: "#F1F5F9", color: "#0F172A", border: "1px solid #E2E8F0", padding: "10px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" };
const iconBtn = { background: "#fff", border: "1px solid #E2E8F0", color: "#64748B", padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800, cursor: "pointer" };

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
