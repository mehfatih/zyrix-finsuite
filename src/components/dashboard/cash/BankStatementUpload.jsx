// ================================================================
// BankStatementUpload — drag-drop CSV parser for bank statements
// Supports common TR bank formats: Date, Description, Amount [, Balance]
// ================================================================
import React, { useRef, useState } from "react";
import { getCustomerPalette, getMoneyPalette } from "../../../utils/dashboardPalette";

function parseCsv(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];
  // Simple sniff: tab or semi or comma
  const delim = lines[0].includes(";") ? ";" : lines[0].includes("\t") ? "\t" : ",";
  const headers = lines[0].split(delim).map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ""));
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(delim).map((c) => c.trim());
    if (cells.length < 2) continue;
    const obj = {};
    headers.forEach((h, j) => (obj[h] = cells[j] || ""));
    const date = obj.tarih || obj.date || obj.islemtarihi || cells[0];
    const desc = obj.aciklama || obj.description || obj.detay || cells[1] || "";
    const amount = parseFloat(String(obj.tutar || obj.amount || obj.miktar || cells[2] || "0").replace(/\./g, "").replace(",", "."));
    if (!date || isNaN(amount)) continue;
    rows.push({
      id: `bs-${Date.now()}-${i}`,
      date: parseDate(date),
      description: desc,
      amount,
      raw: lines[i],
    });
  }
  return rows;
}

function parseDate(s) {
  if (!s) return new Date().toISOString();
  // Try TR format dd.mm.yyyy or dd/mm/yyyy
  const m = String(s).match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
  if (m) {
    const day = parseInt(m[1], 10);
    const month = parseInt(m[2], 10) - 1;
    let year = parseInt(m[3], 10);
    if (year < 100) year += 2000;
    return new Date(year, month, day).toISOString();
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

export default function BankStatementUpload({ onParsed, t = (s) => s }) {
  const customer = getCustomerPalette();
  const money = getMoneyPalette();
  const fileRef = useRef(null);
  const [over, setOver] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || "");
        const rows = parseCsv(text);
        if (rows.length === 0) {
          setError("Could not parse any rows from file.");
          return;
        }
        setStats({ count: rows.length, total: rows.reduce((s, r) => s + Math.abs(r.amount), 0), bank: file.name });
        onParsed && onParsed(rows);
      } catch (e) {
        setError(e?.message || "Parse error");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <label
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        style={{
          display: "block",
          padding: 22,
          borderRadius: 14,
          border: over ? `2.5px dashed ${customer.base}` : `2px dashed ${customer.base}40`,
          background: over ? customer.bg : `${customer.base}05`,
          textAlign: "center",
          cursor: "pointer",
          transition: "all .2s ease",
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.tsv,text/csv"
          onChange={(e) => handleFile(e.target.files?.[0])}
          style={{ display: "none" }}
        />
        <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: customer.dark, marginBottom: 4 }}>
          {t("recon.upload")}
        </div>
        <div style={{ fontSize: 11, color: "#64748B" }}>
          Ziraat · İş Bankası · Garanti BBVA · Akbank · Yapı Kredi
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          style={{
            marginTop: 12,
            padding: "8px 18px",
            background: customer.base,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontWeight: 800,
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          Browse
        </button>
      </label>

      {error && (
        <div style={{ marginTop: 8, padding: "8px 12px", background: "#FFE4E6", color: "#9F1239", border: "1px solid #F43F5E40", borderRadius: 10, fontSize: 12, fontWeight: 700 }}>
          ⚠ {error}
        </div>
      )}

      {stats && !error && (
        <div
          style={{
            marginTop: 8,
            padding: "8px 12px",
            background: money.bg,
            color: money.dark,
            border: `1px solid ${money.base}30`,
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>✓ Parsed {stats.count} rows from {stats.bank}</span>
          <span style={{ fontFamily: "monospace" }}>₺{stats.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
      )}
    </div>
  );
}
