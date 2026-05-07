// ================================================================
// BankFeeComparator — table of bank fees with savings highlight
// ================================================================
import React from "react";
import { getPaletteById, getSuccessPalette } from "../../../utils/dashboardPalette";
import { fmtCurrency } from "../../../pages/dashboard/ecosystem/ecosystemApi";

export default function BankFeeComparator({ rows = [], t = (s) => s }) {
  const success = getSuccessPalette();
  if (!rows.length) return null;
  const maxSavings = Math.max(...rows.map((r) => r.savings));
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 12, fontFamily: "system-ui, sans-serif", minWidth: 480 }}>
        <thead>
          <tr style={{ background: "#F8FAFC" }}>
            <Th>{t("banking.compare.bank")}</Th>
            <Th align="end">{t("banking.compare.monthlyFees")}</Th>
            <Th align="end">{t("banking.compare.txFee")}</Th>
            <Th align="end">{t("banking.compare.savings")}</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const p = getPaletteById(r.palette || "indigo");
            const isMax = r.savings === maxSavings && r.savings > 0;
            return (
              <tr key={r.bank} style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFC" }}>
                <Td>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 4, background: `linear-gradient(135deg, ${p.base}, ${p.dark})` }} />
                    <strong style={{ color: "#0F172A" }}>{r.bank}</strong>
                  </span>
                </Td>
                <Td align="end" mono>{fmtCurrency(r.monthlyFee)}</Td>
                <Td align="end" mono>{fmtCurrency(r.txFee)}</Td>
                <Td align="end" mono>
                  {r.savings > 0 ? (
                    <span style={{ background: isMax ? `linear-gradient(135deg, ${success.base}, ${success.dark})` : success.bg, color: isMax ? "#fff" : success.dark, padding: "4px 10px", borderRadius: 999, fontWeight: 800, fontSize: 11, boxShadow: isMax ? `0 4px 12px ${success.base}40` : "none" }}>
                      {isMax && "🏆 "}{fmtCurrency(r.savings)}/yr
                    </span>
                  ) : "—"}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, align = "start" }) {
  return <th style={{ padding: "10px 12px", textAlign: align, color: "#64748B", fontWeight: 800, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #E2E8F0" }}>{children}</th>;
}

function Td({ children, align = "start", mono }) {
  return <td style={{ padding: "10px 12px", textAlign: align, color: "#0F172A", fontFamily: mono ? "monospace" : "inherit", fontWeight: mono ? 700 : 600, fontSize: 12 }}>{children}</td>;
}
