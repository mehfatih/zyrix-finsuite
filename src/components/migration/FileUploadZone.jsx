// ================================================================
// FileUploadZone — drag-drop with parse + preview
// ================================================================
import React, { useRef, useState } from "react";
import { getBrandPalette, getSuccessPalette, getAlertPalette } from "../../utils/dashboardPalette";
import { parseFile } from "../../utils/migration/parsers";

export default function FileUploadZone({ system, onParsed, lang = "tr", t = (s) => s }) {
  const brand = getBrandPalette(String(lang).toLowerCase());
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const fileRef = useRef(null);

  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);

  const handle = async (file) => {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      const out = await parseFile(file, system);
      if (!out.headers?.length) {
        setError(t("upload.error"));
        setBusy(false);
        return;
      }
      const fileMeta = { name: file.name, size: file.size };
      setParsed({ ...out, file: fileMeta });
      onParsed?.({ ...out, file: fileMeta });
    } catch {
      setError(t("upload.error"));
    }
    setBusy(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handle(e.dataTransfer.files?.[0]);
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${dragOver ? brand.base : "#CBD5E1"}`,
          borderRadius: 16,
          padding: "44px 24px",
          textAlign: "center",
          background: dragOver ? brand.bg : "#F8FAFC",
          transition: "all .2s",
        }}
      >
        <div style={{ fontSize: 44, marginBottom: 12 }}>📁</div>
        <div style={{ fontSize: 14, fontWeight: 800, color: brand.dark, marginBottom: 14 }}>
          {t("upload.drop")}
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          style={{ background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`, color: "#fff", border: "none", padding: "10px 20px", borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: busy ? "not-allowed" : "pointer", boxShadow: `0 6px 16px ${brand.base}40`, opacity: busy ? 0.6 : 1 }}
        >
          📂 {busy ? "…" : t("upload.browse")}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.xls,.tsv,text/csv"
          onChange={(e) => handle(e.target.files?.[0])}
          style={{ display: "none" }}
        />
      </div>

      {error && (
        <div role="alert" style={{ marginTop: 12, padding: 12, background: alert.bg, color: alert.dark, borderRadius: 10, fontSize: 12, fontWeight: 700, border: `1px solid ${alert.base}40` }}>
          ⚠ {error}
        </div>
      )}

      {parsed && (
        <div style={{ marginTop: 14, padding: 14, background: success.bg, border: `1.5px solid ${success.base}40`, borderRadius: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: success.dark, marginBottom: 4 }}>
            ✓ {parsed.file.name}
          </div>
          <div style={{ fontSize: 11, color: "#475569" }}>
            {t("upload.parsed", { n: parsed.rows.length })} · {t("upload.headers", { n: parsed.headers.length, sample: parsed.headers.slice(0, 4).join(", ") })}
          </div>
        </div>
      )}
    </div>
  );
}
