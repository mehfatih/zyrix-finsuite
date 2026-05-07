// ================================================================
// CashAdvanceCalculator — interactive invoice → "you get today" calc
// ================================================================
import React, { useMemo, useState } from "react";
import { getMoneyPalette, getSuccessPalette, getCustomerPalette, getAlertPalette } from "../../../utils/dashboardPalette";
import { fmtCurrency, calcCashAdvance } from "../../../pages/dashboard/ecosystem/ecosystemApi";

export default function CashAdvanceCalculator({
  defaultInvoice = 10000,
  defaultFeePct = 2.5,
  t = (s) => s,
}) {
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const customer = getCustomerPalette();
  const alert = getAlertPalette();

  const [invoice, setInvoice] = useState(defaultInvoice);
  const [feePct, setFeePct] = useState(defaultFeePct);

  const result = useMemo(() => calcCashAdvance(invoice, feePct), [invoice, feePct]);

  return (
    <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginBottom: 12 }}>{t("capital.advance.title")}</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }} className="ca-controls">
        <Field label={t("capital.advance.invoice")}>
          <input type="number" value={invoice} onChange={(e) => setInvoice(Number(e.target.value) || 0)} style={inp} />
        </Field>
        <Field label={t("capital.advance.fee")}>
          <input type="number" value={feePct} step="0.1" onChange={(e) => setFeePct(Number(e.target.value) || 0)} style={inp} />
          <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>%</div>
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }} className="ca-results">
        <Tile label={t("capital.advance.fee")}    value={fmtCurrency(result.fee)}     palette={alert} />
        <Tile label={t("capital.advance.youGet")} value={fmtCurrency(result.youGet)}  palette={success} highlight />
        <Tile label={t("capital.advance.dueIn")}  value="30 days"                     palette={customer} />
      </div>

      <style>{`@media (max-width: 540px) {
        .ca-controls { grid-template-columns: 1fr !important; }
        .ca-results { grid-template-columns: 1fr !important; }
      }`}</style>
    </div>
  );
}

const inp = { width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" };

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#64748B", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

function Tile({ label, value, palette, highlight }) {
  return (
    <div style={{ background: highlight ? `linear-gradient(135deg, ${palette.bg}, ${palette.base}30)` : palette.bg, border: `1px solid ${palette.base}${highlight ? "60" : "30"}`, padding: 10, borderRadius: 12, boxShadow: highlight ? `0 4px 12px ${palette.base}30` : "none" }}>
      <div style={{ fontSize: 9, color: palette.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontSize: highlight ? 18 : 14, fontWeight: 900, color: palette.dark, marginTop: 4, fontFamily: "monospace" }}>{value}</div>
    </div>
  );
}
