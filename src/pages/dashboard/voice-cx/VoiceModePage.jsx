// ================================================================
// ★ Voice-First Operating Mode — configure WhatsApp voice commands
// ================================================================
import React, { useEffect, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getBrandPalette, getAIPalette, getSuccessPalette } from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import VoiceCommandRecorder from "../../../components/dashboard/voice-cx/VoiceCommandRecorder";
import CommandSuggestionCard from "../../../components/dashboard/voice-cx/CommandSuggestionCard";
import { VOICE_COMMANDS, loadVoiceConfig, saveVoiceConfig, localStore, KEYS } from "./voiceCxApi";

export default function VoiceModePage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("voice-cx");
  const brand = getBrandPalette(lang.toLowerCase());
  const ai = getAIPalette();
  const success = getSuccessPalette();

  const [cfg, setCfg] = useState(loadVoiceConfig());

  useEffect(() => { saveVoiceConfig(cfg); }, [cfg]);

  const toggleEnabled = () => setCfg((c) => ({ ...c, enabled: !c.enabled }));
  const toggleCmd = (cmd) => {
    setCfg((c) => {
      const has = c.enabledCommands.includes(cmd.id);
      return { ...c, enabledCommands: has ? c.enabledCommands.filter((x) => x !== cmd.id) : [...c.enabledCommands, cmd.id] };
    });
  };
  const onWa = (e) => setCfg((c) => ({ ...c, whatsappNumber: e.target.value }));

  const onResult = ({ transcript, parsed }) => {
    localStore.add(KEYS.voiceTests, { transcript, parsed, at: new Date().toISOString() });
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("voice.title")} subtitle={t("voice.subtitle")} icon="🎙" palette={brand} />

      {/* Status hero */}
      <Card palette={brand} title={t("voice.status.label")} icon={cfg.enabled ? "🟢" : "⚪"} style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center" }} className="vm-status-grid">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{
                fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 999,
                background: cfg.enabled ? success.bg : "#F1F5F9",
                color: cfg.enabled ? success.dark : "#64748B",
                textTransform: "uppercase", letterSpacing: "0.06em",
              }}>
                {cfg.enabled ? t("voice.status.active") : t("voice.status.inactive")}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "#64748B", marginBottom: 10 }}>{t("voice.intro")}</div>
            <div>
              <label style={{ fontSize: 10, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {t("voice.whatsappLabel")}
              </label>
              <input
                type="tel"
                value={cfg.whatsappNumber}
                onChange={onWa}
                placeholder="+90 555 XXX XXXX"
                style={{ marginTop: 4, width: "100%", maxWidth: 320, padding: "10px 12px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, fontFamily: "inherit", display: "block", boxSizing: "border-box" }}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={toggleEnabled}
            style={{
              background: cfg.enabled ? "#fff" : `linear-gradient(135deg, ${brand.base}, ${brand.dark})`,
              color: cfg.enabled ? brand.dark : "#fff",
              border: cfg.enabled ? `1.5px solid ${brand.base}40` : "none",
              padding: "12px 18px", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer",
              boxShadow: cfg.enabled ? "none" : `0 8px 18px ${brand.base}40`,
              whiteSpace: "nowrap",
            }}
          >
            {cfg.enabled ? t("voice.cta.toggleOff") : `⚡ ${t("voice.cta.toggleOn")}`}
          </button>
        </div>
        <style>{`@media (max-width: 540px) { .vm-status-grid { grid-template-columns: 1fr !important; } }`}</style>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16 }} className="vm-grid">
        <Card palette={ai} title={t("voice.commands.title")} subtitle={t("voice.commands.subtitle")} icon="🧭">
          {VOICE_COMMANDS.map((cmd) => (
            <CommandSuggestionCard
              key={cmd.id}
              command={cmd}
              enabled={cfg.enabledCommands.includes(cmd.id)}
              onToggle={toggleCmd}
              onCustomize={() => { /* future: edit patterns */ }}
              palette={ai}
              t={t}
            />
          ))}
          <button
            type="button"
            style={{
              width: "100%", marginTop: 8,
              background: ai.bg, color: ai.dark, border: `1.5px dashed ${ai.base}`,
              padding: "10px 14px", borderRadius: 12, fontSize: 12, fontWeight: 800, cursor: "pointer",
            }}
          >
            {t("voice.cmd.addCustom")}
          </button>
        </Card>

        <div>
          <VoiceCommandRecorder lang={lang} onResult={onResult} t={t} />
        </div>
      </div>

      <style>{`@media (max-width: 900px) { .vm-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
