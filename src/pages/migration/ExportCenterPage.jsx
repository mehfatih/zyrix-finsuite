// ================================================================
// /migration/export — Export center: quick + scheduled exports
// ================================================================
import React, { useEffect, useState } from "react";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import { getBrandPalette, getMoneyPalette, getSuccessPalette, getAIPalette, getCustomerPalette } from "../../utils/dashboardPalette";
import { fmtDateTime } from "../../utils/format";
import PageHeader from "../../components/dashboard/PageHeader";
import Card from "../../components/dashboard/Card";
import EmptyState from "../../components/dashboard/EmptyState";
import ExportFormatSelector from "../../components/migration/ExportFormatSelector";
import { requestExport, listExports, scheduleExport } from "./migrationApi";

const TYPES = ["customers", "invoices", "suppliers", "products", "full_backup"];
const FREQS = ["daily", "weekly", "monthly"];
const DESTS = ["email", "gdrive", "dropbox"];

export default function ExportCenterPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("migration");
  const brand = getBrandPalette(String(lang).toLowerCase());
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const ai = getAIPalette();
  const customer = getCustomerPalette();

  const [type, setType] = useState("customers");
  const [format, setFormat] = useState("csv");
  const [freq, setFreq] = useState("weekly");
  const [dest, setDest] = useState("email");
  const [history, setHistory] = useState([]);

  useEffect(() => { listExports().then(setHistory); }, []);

  const run = async () => {
    await requestExport({ type, format });
    listExports().then(setHistory);
  };

  const schedule = async () => {
    await scheduleExport({ type, format, schedule: `${freq}@${dest}` });
    listExports().then(setHistory);
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("export.title")} subtitle={t("export.subtitle")} icon="📤" palette={money} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="ec-grid">
        {/* Quick export */}
        <Card palette={money} title={t("export.quick.title")} icon="⚡">
          <Field label={t("export.title")}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {TYPES.map((ty) => {
                const active = type === ty;
                return (
                  <button key={ty} type="button" onClick={() => setType(ty)} style={{
                    background: active ? `linear-gradient(135deg, ${money.base}, ${money.dark})` : money.bg,
                    color: active ? "#fff" : money.dark,
                    border: `1px solid ${money.base}30`, padding: "6px 12px", borderRadius: 999,
                    fontSize: 11, fontWeight: 800, cursor: "pointer",
                  }}>{t(`export.type.${ty}`)}</button>
                );
              })}
            </div>
          </Field>
          <Field label="Format">
            <ExportFormatSelector value={format} onChange={setFormat} lang={lang} t={t} />
          </Field>
          <button type="button" onClick={run} style={{ marginTop: 10, width: "100%", background: `linear-gradient(135deg, ${success.base}, ${success.dark})`, color: "#fff", border: "none", padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 14px ${success.base}40` }}>
            ⚡ {t("export.run")}
          </button>
        </Card>

        {/* Scheduled */}
        <Card palette={ai} title={t("scheduled.title")} icon="📅">
          <Field label={t("scheduled.frequency")}>
            <div style={{ display: "flex", gap: 6 }}>
              {FREQS.map((f) => (
                <button key={f} type="button" onClick={() => setFreq(f)} style={chip(ai, freq === f)}>{t(`scheduled.${f}`)}</button>
              ))}
            </div>
          </Field>
          <Field label={t("scheduled.destination")}>
            <div style={{ display: "flex", gap: 6 }}>
              {DESTS.map((d) => (
                <button key={d} type="button" onClick={() => setDest(d)} style={chip(customer, dest === d)}>{t(`scheduled.${d}`)}</button>
              ))}
            </div>
          </Field>
          <button type="button" onClick={schedule} style={{ marginTop: 10, width: "100%", background: ai.base, color: "#fff", border: "none", padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
            🕒 {t("scheduled.save")}
          </button>
        </Card>
      </div>

      <div style={{ marginTop: 16 }}>
        <Card palette={brand} title={t("export.recent.title")} icon="📚">
          {history.length === 0 ? (
            <EmptyState icon="📭" title={t("export.recent.empty")} palette={brand} />
          ) : (
            history.slice(0, 12).map((h) => (
              <div key={h.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 10, alignItems: "center", padding: "10px 14px", borderBottom: "1px solid #F1F5F9", fontSize: 12 }} className="ec-row">
                <span style={{ fontWeight: 700, color: "#0F172A" }}>{t(`export.type.${h.type}`)} · <code style={{ background: "#F1F5F9", padding: "1px 6px", borderRadius: 4, fontSize: 10 }}>{(h.format || "csv").toUpperCase()}</code></span>
                <span style={{ color: "#94A3B8", fontSize: 11 }}>{fmtDateTime(h.createdAt, { lang })}</span>
                <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 999, background: h.status === "COMPLETED" ? success.bg : ai.bg, color: h.status === "COMPLETED" ? success.dark : ai.dark, textTransform: "uppercase" }}>{h.status}</span>
                <button type="button" style={{ background: brand.bg, color: brand.dark, border: `1px solid ${brand.base}30`, padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>↓ {t("export.download")}</button>
                <style>{`@media (max-width: 720px) { .ec-row { grid-template-columns: 1fr auto !important; } .ec-row > *:nth-child(2), .ec-row > *:nth-child(3) { display: none; } }`}</style>
              </div>
            ))
          )}
        </Card>
      </div>

      <style>{`@media (max-width: 900px) { .ec-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10, color: "#64748B", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

function chip(p, active) {
  return {
    background: active ? `linear-gradient(135deg, ${p.base}, ${p.dark})` : p.bg,
    color: active ? "#fff" : p.dark,
    border: `1px solid ${p.base}30`,
    padding: "6px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800, cursor: "pointer",
  };
}
