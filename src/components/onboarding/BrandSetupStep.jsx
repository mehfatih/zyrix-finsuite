// ================================================================
// BrandSetupStep — form + live invoice preview side-by-side
// ================================================================
import React, { useRef } from "react";
import { getBrandPalette, getMoneyPalette } from "../../utils/dashboardPalette";
import { fmtCurrency } from "../../utils/format";

export default function BrandSetupStep({ brand, onChange, lang = "tr", t = (s) => s }) {
  const brandPalette = getBrandPalette(String(lang).toLowerCase());
  const money = getMoneyPalette();
  const fileRef = useRef(null);

  const apply = (patch) => onChange?.({ ...(brand || {}), ...patch });

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => apply({ logoDataUrl: String(reader.result || "") });
    reader.readAsDataURL(f);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="bss-grid">
      {/* Form */}
      <div>
        <Field label={t("brand.logo")}>
          <button type="button" onClick={() => fileRef.current?.click()} style={{ background: brandPalette.bg, color: brandPalette.dark, border: `1px solid ${brandPalette.base}40`, padding: "10px 14px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
            ⬆ {t("brand.uploadLogo")}
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: "none" }} />
          {brand?.logoDataUrl && (
            <img src={brand.logoDataUrl} alt="Brand logo preview" style={{ marginTop: 8, maxHeight: 50, maxWidth: 140, objectFit: "contain", borderRadius: 6 }} />
          )}
        </Field>
        <Field label={t("brand.tradeName")}>
          <input type="text" value={brand?.tradeName || ""} onChange={(e) => apply({ tradeName: e.target.value })} placeholder="Levana İlaç" style={inp} />
        </Field>
        <Field label={t("brand.taxId")}>
          <input type="text" inputMode="numeric" value={brand?.taxId || ""} onChange={(e) => apply({ taxId: e.target.value.replace(/\D/g, "").slice(0, 11) })} placeholder="1234567890" style={inp} />
        </Field>
        <Field label={t("brand.address")}>
          <input type="text" value={brand?.address || ""} onChange={(e) => apply({ address: e.target.value })} placeholder="Maslak, İstanbul" style={inp} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label={t("brand.phone")}>
            <input type="tel" value={brand?.phone || ""} onChange={(e) => apply({ phone: e.target.value })} placeholder="+90 555 000 0000" style={inp} />
          </Field>
          <Field label={t("brand.email")}>
            <input type="email" value={brand?.email || ""} onChange={(e) => apply({ email: e.target.value })} placeholder="info@" style={inp} />
          </Field>
        </div>
      </div>

      {/* Live invoice preview */}
      <div style={{ background: "#F8FAFC", borderRadius: 14, padding: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
          {t("brand.preview")}
        </div>
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: 18, boxShadow: "0 4px 14px rgba(15,23,42,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div style={{ minWidth: 0 }}>
              {brand?.logoDataUrl ? (
                <img src={brand.logoDataUrl} alt="" style={{ maxHeight: 36, maxWidth: 140, objectFit: "contain" }} />
              ) : (
                <div style={{ width: 50, height: 50, borderRadius: 10, background: brandPalette.bg, color: brandPalette.dark, display: "grid", placeItems: "center", fontSize: 22 }}>🏢</div>
              )}
              <div style={{ marginTop: 6, fontSize: 12, fontWeight: 800, color: "#0F172A" }}>
                {brand?.tradeName || "Trade name"}
              </div>
              <div style={{ fontSize: 9, color: "#64748B", marginTop: 2 }}>
                VKN: {brand?.taxId || "—"}
              </div>
            </div>
            <div style={{ textAlign: "end" }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: brandPalette.dark, letterSpacing: "0.05em" }}>
                {t("brand.preview.invoice")}
              </div>
              <div style={{ fontSize: 9, color: "#94A3B8" }}>#0001</div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: 10, fontSize: 11, color: "#64748B" }}>
            <div>{t("brand.preview.to")}: <strong style={{ color: "#0F172A" }}>Ahmed Yıldız</strong></div>
            <div style={{ marginTop: 2 }}>{brand?.address || "Address"}</div>
            <div style={{ marginTop: 2 }}>{brand?.phone || ""} · {brand?.email || ""}</div>
          </div>
          <div style={{ marginTop: 12, padding: 10, background: brandPalette.bg, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: brandPalette.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {t("brand.preview.amount")}
            </span>
            <span style={{ fontSize: 18, fontWeight: 900, color: money.dark, fontFamily: "monospace" }}>
              {fmtCurrency(5000, { lang })}
            </span>
          </div>
        </div>
      </div>

      <style>{`@media (max-width: 720px) { .bss-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

const inp = { width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" };

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 10, color: "#64748B", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
