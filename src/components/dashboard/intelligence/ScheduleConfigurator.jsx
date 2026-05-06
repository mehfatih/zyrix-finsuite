// ================================================================
// ScheduleConfigurator — time + frequency + channel + topics multi-select
// ================================================================
import React from "react";
import { getAIPalette, getPaletteById } from "../../../utils/dashboardPalette";

const CHANNEL_PALETTE = { WHATSAPP: "emerald", EMAIL: "cyan", SMS: "purple" };

export default function ScheduleConfigurator({
  config,
  onChange,
  channels = ["WHATSAPP", "EMAIL", "SMS"],
  freqOptions = ["daily", "weekdays", "custom"],
  topics = [],
  t = (s) => s,
}) {
  const ai = getAIPalette();

  const toggleChannel = (ch) => {
    const cur = config.channels || [];
    onChange({ ...config, channels: cur.includes(ch) ? cur.filter((x) => x !== ch) : [...cur, ch] });
  };
  const toggleTopic = (id) => {
    onChange({ ...config, topics: { ...(config.topics || {}), [id]: !config.topics?.[id] } });
  };

  return (
    <div>
      <Section label={t("briefing.config.time")}>
        <input
          type="time"
          value={config.time || "08:00"}
          onChange={(e) => onChange({ ...config, time: e.target.value })}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: `1.5px solid ${ai.base}30`,
            background: "#fff",
            fontSize: 14,
            fontWeight: 700,
            color: ai.dark,
            outline: "none",
            fontFamily: "monospace",
          }}
        />
      </Section>

      <Section label={t("briefing.config.channel")}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {channels.map((ch) => {
            const palette = getPaletteById(CHANNEL_PALETTE[ch] || "indigo");
            const checked = (config.channels || []).includes(ch);
            return (
              <button
                key={ch}
                type="button"
                onClick={() => toggleChannel(ch)}
                style={chip(palette, checked)}
              >
                {checked ? "✓ " : ""}{ch === "WHATSAPP" ? "WhatsApp" : ch === "EMAIL" ? "Email" : "SMS"}
              </button>
            );
          })}
        </div>
      </Section>

      <Section label={t("briefing.config.frequency")}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {freqOptions.map((f) => {
            const active = config.frequency === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => onChange({ ...config, frequency: f })}
                style={chip(ai, active)}
              >
                {t(`briefing.config.frequency.${f}`)}
              </button>
            );
          })}
        </div>
      </Section>

      {topics.length > 0 && (
        <Section label={t("briefing.config.include")}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
            {topics.map((topic) => {
              const checked = !!config.topics?.[topic.id];
              return (
                <label
                  key={topic.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    background: checked ? `${ai.base}10` : "#F8FAFC",
                    border: `1px solid ${checked ? ai.base : "#E2E8F0"}40`,
                    borderRadius: 10,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    color: checked ? ai.dark : "#475569",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleTopic(topic.id)}
                    style={{ width: 16, height: 16, accentColor: ai.base }}
                  />
                  <span style={{ flex: 1 }}>{topic.label}</span>
                </label>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: "#475569", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

function chip(palette, active) {
  return {
    padding: "8px 14px",
    borderRadius: 999,
    border: active ? `2px solid ${palette.base}` : `1px solid ${palette.base}30`,
    background: active ? palette.base : `${palette.base}10`,
    color: active ? "#fff" : palette.dark,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  };
}
