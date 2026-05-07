// ================================================================
// DataImporter — drag-drop CSV with preview, header detection
// ================================================================
import React, { useRef, useState } from "react";
import { getBrandPalette, getSuccessPalette, getAlertPalette } from "../../utils/dashboardPalette";

const HEADER_HINTS = {
  name:    ["name", "ad", "isim", "الاسم", "ad soyad", "company"],
  email:   ["email", "e-posta", "البريد"],
  phone:   ["phone", "telefon", "tel", "الهاتف"],
  taxId:   ["tax", "vkn", "tckn", "vergi", "الرقم الضريبي"],
  address: ["address", "adres", "العنوان"],
};

function detectColumn(header) {
  const h = String(header).trim().toLowerCase();
  for (const [field, hints] of Object.entries(HEADER_HINTS)) {
    if (hints.some((hint) => h.includes(hint))) return field;
  }
  return null;
}

function parseCsv(text) {
  // Minimal CSV parser — handles quoted commas in fields.
  const rows = [];
  const re = /("([^"]|"")*"|[^,\r\n]*)(,|\r?\n|$)/g;
  let row = [];
  let m;
  while ((m = re.exec(text)) && m[0] !== "") {
    let val = m[1];
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1).replace(/""/g, '"');
    }
    row.push(val);
    if (m[3] !== ",") {
      rows.push(row);
      row = [];
      if (m[3] === "") break;
    }
  }
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ""));
}

export default function DataImporter({ onImport, lang = "tr", t = (s) => s }) {
  const brand = getBrandPalette(String(lang).toLowerCase());
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (file) => {
    setError(null);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || "");
        const rows = parseCsv(text);
        if (rows.length < 2) {
          setError(t("import.error"));
          return;
        }
        const headers = rows[0];
        const map = headers.map(detectColumn);
        const records = rows.slice(1).map((r) => {
          const obj = { _raw: r };
          headers.forEach((h, i) => {
            const field = map[i] || h;
            obj[field] = r[i] || "";
          });
          return obj;
        }).filter((r) => Object.values(r).some((v) => String(v).trim()));
        setParsed({ headers, map, records });
      } catch {
        setError(t("import.error"));
      }
    };
    reader.readAsText(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const onSelect = (e) => handleFile(e.target.files?.[0]);

  const confirm = () => {
    onImport?.(parsed.records);
    setParsed(null);
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
          padding: "40px 24px",
          textAlign: "center",
          background: dragOver ? brand.bg : "#F8FAFC",
          transition: "all .25s",
        }}
      >
        <div style={{ fontSize: 42, marginBottom: 10 }}>📁</div>
        <div style={{ fontSize: 14, fontWeight: 800, color: brand.dark, marginBottom: 12 }}>
          {t("import.drop")}
        </div>
        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 14 }}>
          {t("import.format.title")}: <code style={{ background: "#fff", padding: "2px 8px", borderRadius: 6 }}>{t("import.format.headers")}</code>
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          style={{ background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`, color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 16px ${brand.base}40` }}
        >
          📂 {t("import.drop")}
        </button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={onSelect} style={{ display: "none" }} />
      </div>

      {error && (
        <div style={{ marginTop: 12, padding: 12, background: alert.bg, color: alert.dark, borderRadius: 10, fontSize: 12, fontWeight: 700, border: `1px solid ${alert.base}40` }}>
          ⚠ {error}
        </div>
      )}

      {parsed && (
        <div style={{ marginTop: 16, background: "#fff", border: `1.5px solid ${success.base}40`, borderRadius: 14, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: success.dark, background: success.bg, padding: "4px 10px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {t("import.preview.title")}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>
              {t("import.preview.rows", { n: parsed.records.length })}
            </span>
          </div>
          <div style={{ overflowX: "auto", marginBottom: 12 }}>
            <table style={{ width: "100%", fontSize: 11, borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {parsed.headers.map((h, i) => (
                    <th key={i} style={{ padding: "6px 10px", background: "#F8FAFC", textAlign: "start", color: "#64748B", fontWeight: 800, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #E2E8F0" }}>
                      {h}
                      {parsed.map[i] && <span style={{ marginInlineStart: 4, color: success.dark, fontSize: 9 }}>→ {parsed.map[i]}</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsed.records.slice(0, 5).map((r, i) => (
                  <tr key={i} style={{ background: i % 2 ? "#F8FAFC" : "#fff" }}>
                    {parsed.headers.map((_, j) => (
                      <td key={j} style={{ padding: "6px 10px", color: "#0F172A" }}>
                        {r._raw[j] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={confirm} style={{ width: "100%", background: `linear-gradient(135deg, ${success.base}, ${success.dark})`, color: "#fff", border: "none", padding: "12px 18px", borderRadius: 12, fontSize: 13, fontWeight: 800, cursor: "pointer", boxShadow: `0 6px 14px ${success.base}40` }}>
            ⚡ {t("import.preview.confirm")}
          </button>
        </div>
      )}
    </div>
  );
}
