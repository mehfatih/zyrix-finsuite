// ================================================================
// ★ AR Receipt Scanner — live camera + real-time OCR overlay
// ================================================================
import React, { useEffect, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getAIPalette,
  getMoneyPalette,
  getSuccessPalette,
  getCustomerPalette,
  getReportsPalette,
  getBrandPalette,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import ARCameraPreview from "../../../components/dashboard/cognitive/ARCameraPreview";
import { fakeReceiptDetect, localStore, KEYS, fmtCurrency, fmtDate } from "./cognitiveApi";

export default function ARReceiptPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("cognitive");
  const ai = getAIPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const customer = getCustomerPalette();
  const reports = getReportsPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [active, setActive] = useState(false);
  const [detected, setDetected] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => setHistory(localStore.list(KEYS.arCaptures).filter((x) => x.kind === "receipt")), []);

  const onCapture = (capture) => {
    const result = fakeReceiptDetect();
    setDetected({ ...result, dataUrl: capture.dataUrl, capturedAt: capture.capturedAt });
  };

  const save = () => {
    if (!detected) return;
    localStore.add(KEYS.arCaptures, { kind: "receipt", capturedAt: detected.capturedAt, result: detected });
    setHistory(localStore.list(KEYS.arCaptures).filter((x) => x.kind === "receipt"));
    setDetected(null);
    setActive(false);
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("ar.receipt.title")} subtitle={t("ar.receipt.subtitle")} icon="📸" palette={ai} />

      <Card palette={ai} icon="📸" style={{ marginBottom: 18, padding: 0, overflow: "hidden" }}>
        <ARCameraPreview
          active={active}
          onStart={() => setActive(true)}
          onStop={() => { setActive(false); setDetected(null); }}
          onCapture={onCapture}
          t={t}
          height={420}
        />
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
              📷 {t("ar.receipt.start")}
            </button>
          ) : (
            <span style={{ fontSize: 12, color: "#475569", fontWeight: 700 }}>📐 {t("ar.receipt.frame")}</span>
          )}
        </div>
      </Card>

      {detected ? (
        <Card palette={success} title="Detected" icon="✓" style={{ marginBottom: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 18 }} className="receipt-result-grid">
            {detected.dataUrl && (
              <img
                src={detected.dataUrl}
                alt="Receipt capture"
                style={{ maxWidth: 240, borderRadius: 12, border: `1px solid ${success.base}30` }}
              />
            )}
            <div style={{ display: "grid", gap: 10 }}>
              <Field label={t("ar.receipt.detected.total")} value={fmtCurrency(detected.total)} palette={money} big />
              <Field label={t("ar.receipt.detected.date")}   value={fmtDate(detected.date, lang)} palette={customer} />
              <Field label={t("ar.receipt.detected.vendor")} value={detected.vendor}             palette={ai} />
              <Field label={t("ar.receipt.detected.items")
                .replace("{n}", detected.items)} value=""                                       palette={reports} />
              <Field label={t("ar.receipt.detected.vat")}    value={fmtCurrency(detected.vat)}   palette={success} />
              <div style={{ marginTop: 4, fontSize: 12, color: customer.dark, fontWeight: 700 }}>
                💡 {t("ar.receipt.cat.suggested")}: <span style={{ color: ai.dark }}>{detected.suggestedCategory}</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              type="button"
              onClick={() => setDetected(null)}
              style={{
                background: "transparent",
                color: "#64748B",
                border: `1px solid #E2E8F0`,
                padding: "10px 18px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={save}
              style={{
                background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`,
                color: "#fff",
                border: "none",
                padding: "10px 22px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: `0 4px 14px ${brand.base}40`,
              }}
            >
              ✓ {t("ar.receipt.capture")}
            </button>
          </div>
          <style>{`@media (max-width: 540px) { .receipt-result-grid { grid-template-columns: 1fr !important; } }`}</style>
        </Card>
      ) : (
        <EmptyState
          title={active ? "Tap capture to scan receipt" : t("ar.store.permission")}
          icon="🧾"
          palette={ai}
        />
      )}

      {history.length > 0 && (
        <Card palette={reports} title="Recent Receipts" icon="📜">
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {history.slice(0, 6).map((h) => (
              <li
                key={h.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderBottom: "1px solid #F1F5F9",
                  fontSize: 12,
                }}
              >
                <span style={{ color: "#0F172A", fontWeight: 700 }}>{h.result?.vendor || "Receipt"} · {fmtDate(h.capturedAt, lang)}</span>
                <span style={{ fontFamily: "monospace", color: money.base, fontWeight: 800 }}>{fmtCurrency(h.result?.total || 0)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function Field({ label, value, palette, big }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: palette.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>{label}</div>
      {value && (
        <div style={{ fontSize: big ? 22 : 15, fontWeight: 800, color: palette.base, fontFamily: "monospace" }}>{value}</div>
      )}
    </div>
  );
}
