// ================================================================
// /migration/wizard — 5-step migration flow
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import { getBrandPalette, getSuccessPalette } from "../../utils/dashboardPalette";
import PageHeader from "../../components/dashboard/PageHeader";
import OnboardingProgressBar from "../../components/onboarding/OnboardingProgressBar";
import SourceSystemPicker from "../../components/migration/SourceSystemPicker";
import FileUploadZone from "../../components/migration/FileUploadZone";
import FieldMappingTable from "../../components/migration/FieldMappingTable";
import ValidationErrorList from "../../components/migration/ValidationErrorList";
import ProgressBar from "../../components/migration/ProgressBar";
import { buildMappings } from "../../utils/migration/fieldMatcher";
import { validate } from "../../utils/migration/validator";
import { startMigrationJob, runMigration } from "./migrationApi";

const STEPS = [
  { key: "source",    labelKey: "wizard.step.source"   },
  { key: "upload",    labelKey: "wizard.step.upload"   },
  { key: "mapping",   labelKey: "wizard.step.mapping"  },
  { key: "validate",  labelKey: "wizard.step.validate" },
  { key: "run",       labelKey: "wizard.step.run"      },
];

export default function MigrationWizard() {
  const { lang } = useI18n();
  const t = useDashboardI18n("migration");
  const navigate = useNavigate();
  const brand = getBrandPalette(String(lang).toLowerCase());
  const success = getSuccessPalette();

  const [step, setStep] = useState(1);
  const [system, setSystem] = useState(null);
  const [parsed, setParsed] = useState(null);
  const [mappings, setMappings] = useState([]);
  const [validation, setValidation] = useState(null);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  // Auto-build mappings when file is parsed
  useEffect(() => {
    if (parsed?.headers?.length) setMappings(buildMappings(parsed.headers));
  }, [parsed]);

  // Auto-validate when entering step 4
  useEffect(() => {
    if (step === 4 && parsed) {
      setValidation(validate({ headers: parsed.headers, rows: parsed.rows, mappings }));
    }
  }, [step, parsed, mappings]);

  const canNext = useMemo(() => {
    if (step === 1) return !!system;
    if (step === 2) return !!parsed;
    if (step === 3) return mappings.some((m) => m.include && m.finsuiteKey);
    if (step === 4) return validation?.canImport;
    return false;
  }, [step, system, parsed, mappings, validation]);

  const next = async () => {
    if (step < 5) {
      setStep((s) => s + 1);
      return;
    }
  };

  const start = async () => {
    setRunning(true);
    const job = await startMigrationJob({
      sourceSystem: system,
      fileName: parsed.file.name,
      fileSize: parsed.file.size,
      fieldMapping: Object.fromEntries(mappings.filter((m) => m.include && m.finsuiteKey).map((m) => [m.sourceHeader, m.finsuiteKey])),
      totalRows: parsed.rows.length,
    });
    await runMigration(job.id, parsed.rows.length, (d) => setProgress({ done: d, total: parsed.rows.length }));
    setDone(true);
    setRunning(false);
  };

  const labels = STEPS.map((s) => t(s.labelKey).split(". ")[1] || s.key);

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("title")} subtitle={t("subtitle")} icon="🚀" palette={brand} />

      <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E2E8F0", padding: "24px 28px", boxShadow: "0 4px 16px rgba(15,23,42,0.06)" }}>
        <OnboardingProgressBar step={step} total={5} lang={lang} t={(k, v) => k === "wizard.step" ? `Step ${v.n}/${v.total}` : k === "wizard.progress" ? "Progress" : k} labels={labels} />

        {step === 1 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>{t("source.title")}</h2>
            <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 18px" }}>{t("source.subtitle")}</p>
            <SourceSystemPicker selected={system} onSelect={setSystem} lang={lang} t={t} />
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>{t("upload.title")}</h2>
            <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 18px" }}>{t("upload.subtitle")}</p>
            <FileUploadZone system={system} onParsed={setParsed} lang={lang} t={t} />
          </>
        )}

        {step === 3 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>{t("mapping.title")}</h2>
            <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 18px" }}>{t("mapping.subtitle")}</p>
            <FieldMappingTable mappings={mappings} onChange={setMappings} t={t} />
          </>
        )}

        {step === 4 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>{t("validate.title")}</h2>
            <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 18px" }}>{t("validate.subtitle")}</p>
            <ValidationErrorList result={validation} lang={lang} t={t} />
          </>
        )}

        {step === 5 && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: "0 0 6px" }}>{t("run.title")}</h2>
            <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 18px" }}>{t("run.subtitle")}</p>
            {!running && !done && (
              <button type="button" onClick={start} style={{ width: "100%", background: `linear-gradient(135deg, ${success.base}, ${success.dark})`, color: "#fff", border: "none", padding: "16px 22px", borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: `0 8px 22px ${success.base}40` }}>
                ▶ {t("wizard.step.run").split(". ")[1] || "Run"}
              </button>
            )}
            {(running || done) && (
              <div style={{ marginBottom: 14 }}>
                <ProgressBar done={progress.done} total={progress.total || parsed.rows.length} lang={lang} t={t} />
              </div>
            )}
            {done && (
              <div role="status" style={{ padding: 16, background: success.bg, color: success.dark, borderRadius: 12, fontSize: 14, fontWeight: 800, textAlign: "center", marginTop: 10 }}>
                {t("run.complete")} — {t("run.complete.summary", { n: parsed.rows.length })}
              </div>
            )}
          </>
        )}

        <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <button type="button" onClick={() => step > 1 ? setStep(step - 1) : navigate("/migration")} style={{ background: "#F1F5F9", color: "#0F172A", border: "1px solid #E2E8F0", padding: "12px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            ← Back
          </button>
          {step < 5 ? (
            <button type="button" onClick={next} disabled={!canNext} style={{ background: canNext ? `linear-gradient(135deg, ${brand.base}, ${brand.dark})` : "#CBD5E1", color: "#fff", border: "none", padding: "12px 22px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: canNext ? "pointer" : "not-allowed", boxShadow: canNext ? `0 6px 16px ${brand.base}40` : "none" }}>
              Next →
            </button>
          ) : done && (
            <button type="button" onClick={() => navigate("/migration/history")} style={{ background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`, color: "#fff", border: "none", padding: "12px 22px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 16px ${brand.base}40` }}>
              {t("run.viewResults")} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
