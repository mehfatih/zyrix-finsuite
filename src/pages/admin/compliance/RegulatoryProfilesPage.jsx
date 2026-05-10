// ================================================================
// /admin/compliance/regulatory-profiles — Sprint D-11.
//
// Admin tax-rate version timeline + create-with-effective-date form.
// Backed by /api/admin/regulatory/tax-rates (B.7). Audit-logged.
//
// Inline styles + ADMIN_BRAND palette (matches /admin/ops/email-engagement).
// ================================================================
import React, { useEffect, useState } from "react";
import { ADMIN_BRAND } from "../../../utils/admin/adminPalette";
import {
  listTaxRates,
  createTaxRate,
  updateTaxRate,
  deleteTaxRate
} from "../../../api/admin/taxRates";

const COUNTRIES = [
  { code: "TR", name: "Turkey",        defaultTaxName: "KDV", defaultRate: 20 },
  { code: "SA", name: "Saudi Arabia",  defaultTaxName: "VAT", defaultRate: 15 }
];

function formatDate(iso) {
  if (!iso) return "—";
  try { return new Date(iso).toISOString().slice(0, 10); }
  catch { return String(iso); }
}

export default function RegulatoryProfilesPage() {
  const brand = ADMIN_BRAND;
  const [rows, setRows]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [acting, setActing]     = useState(null);

  // Create form state
  const [country, setCountry]            = useState("TR");
  const [taxName, setTaxName]            = useState("KDV");
  const [rate, setRate]                  = useState("20");
  const [effectiveFrom, setEffectiveFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [effectiveTo, setEffectiveTo]    = useState("");
  const [notes, setNotes]                = useState("");
  const [creating, setCreating]          = useState(false);

  const reload = () => {
    setLoading(true); setError(null);
    listTaxRates()
      .then((data) => setRows(data?.rows || []))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  const onCountryChange = (next) => {
    setCountry(next);
    const profile = COUNTRIES.find((c) => c.code === next);
    if (profile) {
      setTaxName(profile.defaultTaxName);
      setRate(String(profile.defaultRate));
    }
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const numericRate = parseFloat(rate);
      if (!Number.isFinite(numericRate) || numericRate < 0 || numericRate > 100) {
        throw new Error("Rate must be 0-100");
      }
      await createTaxRate({
        country,
        taxName: taxName.trim(),
        rate:    numericRate,
        effectiveFrom: new Date(effectiveFrom).toISOString(),
        effectiveTo:   effectiveTo ? new Date(effectiveTo).toISOString() : null,
        notes:   notes.trim() || undefined
      });
      setNotes("");
      reload();
    } catch (err) {
      setError(err);
    } finally {
      setCreating(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this tax rate version? Existing invoices keep their stamped rate.")) return;
    setActing(id); setError(null);
    try {
      await deleteTaxRate(id);
      reload();
    } catch (err) {
      setError(err);
    } finally {
      setActing(null);
    }
  };

  const closeRange = async (id) => {
    const today = new Date().toISOString();
    setActing(id); setError(null);
    try {
      await updateTaxRate(id, { effectiveTo: today });
      reload();
    } catch (err) {
      setError(err);
    } finally {
      setActing(null);
    }
  };

  return (
    <div style={{ padding: "32px 28px", maxWidth: 1100, margin: "0 auto" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: `linear-gradient(135deg, ${brand.bg}, ${brand.base}30)`,
          color: brand.dark,
          display: "grid", placeItems: "center",
          fontSize: 26, border: `1px solid ${brand.base}25`
        }}>📜</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", margin: 0, letterSpacing: "-0.01em" }}>
            Regulatory Profiles — Tax Rates
          </h1>
          <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>
            Effective-dated tax rate timeline. Existing invoices keep their stamped rate; future invoices use the active row at issue time.
          </div>
        </div>
      </header>

      {error && (
        <div role="alert" style={{
          padding: "12px 16px",
          background: "#FEF2F2",
          color: "#991B1B",
          border: "1px solid #FECACA",
          borderRadius: 10,
          marginBottom: 20,
          fontSize: 14
        }}>
          {String(error.message || error)}
          {error.conflict && (
            <div style={{ marginTop: 6, fontSize: 12, color: "#7F1D1D" }}>
              Conflict with: {error.conflict.id} · rate {error.conflict.rate} · {formatDate(error.conflict.effectiveFrom)} → {formatDate(error.conflict.effectiveTo) || "open"}
            </div>
          )}
        </div>
      )}

      {/* Create form */}
      <form
        onSubmit={submitCreate}
        style={{
          padding: 20,
          background: "#FFF",
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          marginBottom: 28
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 12 }}>
          Add a new effective-dated rate
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 12
        }}>
          <Field label="Country">
            <select value={country} onChange={(e) => onCountryChange(e.target.value)} style={inputStyle()}>
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
            </select>
          </Field>
          <Field label="Tax name">
            <input type="text" value={taxName} onChange={(e) => setTaxName(e.target.value)} style={inputStyle()} required />
          </Field>
          <Field label="Rate (%)">
            <input type="number" min="0" max="100" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} style={inputStyle()} required />
          </Field>
          <Field label="Effective from">
            <input type="date" value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} style={inputStyle()} required />
          </Field>
          <Field label="Effective to (optional)">
            <input type="date" value={effectiveTo} onChange={(e) => setEffectiveTo(e.target.value)} style={inputStyle()} />
          </Field>
        </div>
        <Field label="Notes (optional)">
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} style={inputStyle()} maxLength={500} placeholder="e.g. KDV reform — rate raised from 18 to 20 effective 2023-07-10" />
        </Field>
        <div style={{ marginTop: 12 }}>
          <button
            type="submit"
            disabled={creating}
            style={{
              padding: "10px 18px",
              background: brand.dark,
              color: "#FFF",
              fontWeight: 700,
              fontSize: 14,
              border: "none",
              borderRadius: 8,
              cursor: creating ? "not-allowed" : "pointer",
              opacity: creating ? 0.6 : 1
            }}
          >
            {creating ? "Creating…" : "Create version"}
          </button>
        </div>
      </form>

      {/* Timeline */}
      <section>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: "0 0 12px" }}>
          Version timeline
        </h2>
        <div style={{
          background: "#FFF",
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          overflow: "hidden"
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={thStyle()}>Country</th>
                <th style={thStyle()}>Tax</th>
                <th style={thStyle({ align: "right" })}>Rate</th>
                <th style={thStyle()}>Effective from</th>
                <th style={thStyle()}>Effective to</th>
                <th style={thStyle()}>Notes</th>
                <th style={thStyle()} aria-label="actions"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} style={emptyRowStyle()}>Loading…</td></tr>
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={7} style={emptyRowStyle()}>No tax rate versions yet — invoices fall back to the static profile defaults (TR/KDV 20%, SA/VAT 15%).</td></tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} style={{ borderTop: "1px solid #E5E7EB" }}>
                  <td style={tdStyle()}><strong>{r.country}</strong></td>
                  <td style={tdStyle()}>{r.taxName}</td>
                  <td style={tdStyle({ align: "right", mono: true, weight: 700 })}>{Number(r.rate).toFixed(2)}%</td>
                  <td style={tdStyle({ mono: true })}>{formatDate(r.effectiveFrom)}</td>
                  <td style={tdStyle({ mono: true })}>{formatDate(r.effectiveTo) === "—" ? <span style={{ color: "#10B981", fontWeight: 600 }}>open</span> : formatDate(r.effectiveTo)}</td>
                  <td style={tdStyle({ subtle: true })}>{r.notes || ""}</td>
                  <td style={tdStyle({ align: "right" })}>
                    {r.effectiveTo === null && (
                      <button
                        type="button"
                        onClick={() => closeRange(r.id)}
                        disabled={acting === r.id}
                        style={smallBtnStyle("warn")}
                        aria-label={`Close range — ${r.country} ${r.taxName}`}
                      >Close</button>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(r.id)}
                      disabled={acting === r.id}
                      style={smallBtnStyle("danger")}
                      aria-label={`Delete version — ${r.country} ${r.taxName} ${r.rate}%`}
                    >Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</span>
      {children}
    </label>
  );
}

function inputStyle() {
  return {
    padding: "8px 10px",
    fontSize: 14,
    color: "#0F172A",
    background: "#FFF",
    border: "1px solid #CBD5E1",
    borderRadius: 8,
    fontFamily: "inherit"
  };
}

function thStyle({ align = "left" } = {}) {
  return {
    padding: "10px 14px",
    textAlign: align,
    fontSize: 11,
    fontWeight: 700,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    background: "#F8FAFC",
    borderBottom: "1px solid #E5E7EB"
  };
}

function tdStyle({ align = "left", mono = false, weight = 400, subtle = false } = {}) {
  return {
    padding: "10px 14px",
    textAlign: align,
    fontSize: 13,
    fontWeight: weight,
    color: subtle ? "#64748B" : "#0F172A",
    fontFamily: mono ? "'JetBrains Mono', ui-monospace, monospace" : "inherit"
  };
}

function emptyRowStyle() {
  return {
    padding: "24px 14px",
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 13
  };
}

function smallBtnStyle(variant) {
  const palette = {
    warn:    { bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
    danger:  { bg: "#FEE2E2", color: "#991B1B", border: "#FECACA" }
  }[variant] || { bg: "#F1F5F9", color: "#334155", border: "#CBD5E1" };
  return {
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 700,
    color:   palette.color,
    background: palette.bg,
    border: `1px solid ${palette.border}`,
    borderRadius: 6,
    cursor: "pointer",
    marginInlineStart: 6
  };
}
