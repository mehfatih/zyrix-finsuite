// ================================================================
// PortalCustomizer — brand the customer portal (logo, color, message)
// ================================================================
import React, { useRef } from "react";
import { getAlertPalette, resolvePalette } from "../../../utils/dashboardPalette";

const PRESET_COLORS = ["#E30A17", "#006C35", "#6C3AFF", "#0EA5E9", "#10B981", "#F97316", "#F43F5E", "#0F172A"];

export default function PortalCustomizer({
  brand,
  onChange,
  onSave,
  onPreview,
  t = (s) => s,
  features = [],
  enabledFeatures = [],
  onToggleFeature,
}) {
  const fileRef = useRef(null);
  const palette = resolvePalette(brand?.primaryColor ? { id: "custom", base: brand.primaryColor, dark: brand.primaryColor, bg: brand.primaryColor + "15" } : "wine");
  const alert = getAlertPalette();

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => onChange?.({ ...brand, logoDataUrl: String(reader.result || "") });
    reader.readAsDataURL(f);
  };

  return (
    <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 18, padding: 20 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>{t("portals.brand.title")}</div>
        <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{t("portals.brand.subtitle")}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 14, alignItems: "center", marginBottom: 14 }} className="pc-row">
        <div
          style={{
            width: 80, height: 80, borderRadius: 16,
            background: brand?.logoDataUrl ? "#fff" : palette.bg,
            border: `1.5px dashed ${palette.base}50`,
            display: "grid", placeItems: "center",
            overflow: "hidden",
          }}
        >
          {brand?.logoDataUrl ? (
            <img src={brand.logoDataUrl} alt="logo" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
          ) : (
            <div style={{ fontSize: 22 }}>🏢</div>
          )}
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700, marginBottom: 6 }}>{t("portals.brand.logo")}</div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            style={{ background: palette.bg, color: palette.dark, border: `1px solid ${palette.base}40`, padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer" }}
          >
            ⬆ {t("portals.brand.uploadLogo")}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700, marginBottom: 8 }}>{t("portals.brand.primaryColor")}</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {PRESET_COLORS.map((c) => {
            const active = brand?.primaryColor?.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                type="button"
                onClick={() => onChange?.({ ...brand, primaryColor: c })}
                aria-label={c}
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: c,
                  border: active ? `3px solid #fff` : "1px solid rgba(0,0,0,0.1)",
                  boxShadow: active ? `0 0 0 2px ${c}, 0 6px 14px ${c}40` : "0 2px 6px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  transition: "transform .15s",
                }}
              />
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700, marginBottom: 6 }}>{t("portals.brand.welcomeMessage")}</div>
        <input
          type="text"
          value={brand?.welcomeMessage || ""}
          onChange={(e) => onChange?.({ ...brand, welcomeMessage: e.target.value })}
          placeholder={t("portals.brand.welcomePh")}
          style={{ width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }}
        />
      </div>

      {features.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: "#64748B", fontWeight: 700, marginBottom: 8 }}>{t("portals.features.title")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
            {features.map((f) => {
              const on = enabledFeatures.includes(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onToggleFeature?.(f.id)}
                  style={{
                    background: on ? palette.bg : "#fff",
                    color: on ? palette.dark : "#64748B",
                    border: `1px solid ${on ? palette.base + "50" : "#E2E8F0"}`,
                    padding: "8px 12px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                    cursor: "pointer", textAlign: "left",
                  }}
                >
                  {on ? "☑" : "☐"} {t(`portals.features.${f.id}`)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
        {onPreview && (
          <button type="button" onClick={onPreview} style={{ background: "#F1F5F9", color: "#0F172A", border: "1px solid #E2E8F0", padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {t("portals.brand.preview")}
          </button>
        )}
        {onSave && (
          <button type="button" onClick={onSave} style={{ background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`, color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 14px ${palette.base}40` }}>
            ⚡ {t("portals.brand.save")}
          </button>
        )}
      </div>

      <style>{`@media (max-width: 540px) { .pc-row { grid-template-columns: 1fr !important; text-align: center; } }`}</style>
    </div>
  );
}
