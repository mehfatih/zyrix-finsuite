// ================================================================
// ★ AR Storefront Analyzer — camera + AI overlay zones
// ================================================================
import React, { useEffect, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getAIPalette,
  getSuccessPalette,
  getAlertPalette,
  getCustomerPalette,
  getBrandPalette,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import ARCameraPreview from "../../../components/dashboard/cognitive/ARCameraPreview";
import AROverlay from "../../../components/dashboard/cognitive/AROverlay";
import { fakeStorefrontAnalysis, localStore, KEYS } from "./cognitiveApi";

export default function ARStorefrontPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("cognitive");
  const ai = getAIPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const customer = getCustomerPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [active, setActive] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => setHistory(localStore.list(KEYS.arCaptures)), []);

  const onCapture = (capture) => {
    const result = fakeStorefrontAnalysis();
    setAnalysis(result);
    localStore.add(KEYS.arCaptures, { kind: "storefront", capturedAt: capture.capturedAt, result });
    setHistory(localStore.list(KEYS.arCaptures));
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("ar.store.title")} subtitle={t("ar.store.subtitle")} icon="📷" palette={ai} />

      <Card palette={ai} icon="📷" style={{ marginBottom: 18, padding: 0, overflow: "hidden" }}>
        <div style={{ position: "relative" }}>
          <ARCameraPreview
            active={active}
            onStart={() => setActive(true)}
            onStop={() => setActive(false)}
            onCapture={onCapture}
            t={t}
            height={420}
          />
          {active && analysis && <AROverlay zones={analysis.zones} t={t} />}
        </div>
        <div style={{ padding: 14, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", background: "#fff" }}>
          {!active ? (
            <button
              type="button"
              onClick={() => setActive(true)}
              style={{
                background: `linear-gradient(135deg, ${ai.base}, ${ai.dark})`,
                color: "#fff",
                border: "none",
                padding: "12px 22px",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: `0 6px 18px ${ai.base}40`,
              }}
            >
              📷 {t("ar.store.start")}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => { setActive(false); setAnalysis(null); }}
                style={{
                  background: alert.bg,
                  color: alert.dark,
                  border: `1px solid ${alert.base}40`,
                  padding: "12px 18px",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ✗ {t("ar.store.stop")}
              </button>
            </>
          )}
        </div>
      </Card>

      {analysis ? (
        <Card palette={success} title={t("ar.store.recommendations")} icon="💡">
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {analysis.recommendations.map((key, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  padding: "10px 12px",
                  borderBottom: "1px dashed #E2E8F0",
                  fontSize: 13,
                  color: "#0F172A",
                }}
              >
                <span style={{ color: success.base, flexShrink: 0, marginTop: 2 }}>✓</span>
                <span>{t(`ar.store.${key}`)}</span>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, color: customer.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              {t("ar.store.detected")}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {analysis.zones.map((z) => {
                const palette =
                  z.severity === "alert"   ? alert :
                  z.severity === "warning" ? customer : success;
                return (
                  <span
                    key={z.id}
                    style={{
                      background: palette.bg,
                      color: palette.dark,
                      border: `1px solid ${palette.base}40`,
                      padding: "5px 12px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {t(`ar.store.zone.${z.label}`) || z.label}
                  </span>
                );
              })}
            </div>
          </div>
        </Card>
      ) : (
        <EmptyState
          title={active ? "Tap capture to analyze" : t("ar.store.permission")}
          icon="📷"
          palette={ai}
        />
      )}
    </div>
  );
}
