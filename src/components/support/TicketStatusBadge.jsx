// ================================================================
// TicketStatusBadge — color-coded status pill
// ================================================================
import React from "react";
import { getSuccessPalette, getWarningPalette, getAlertPalette, getCustomerPalette, getReportsPalette } from "../../utils/dashboardPalette";

const PALETTES = (success, warn, alert, customer, reports) => ({
  OPEN:        alert,
  PENDING:     warn,
  IN_PROGRESS: reports,
  RESOLVED:    success,
  CLOSED:      customer,
});

export default function TicketStatusBadge({ status, t = (s) => s }) {
  const success = getSuccessPalette();
  const warn = getWarningPalette();
  const alert = getAlertPalette();
  const customer = getCustomerPalette();
  const reports = getReportsPalette();
  const map = PALETTES(success, warn, alert, customer, reports);
  const p = map[status] || customer;
  return (
    <span style={{ fontSize: 10, fontWeight: 800, background: p.bg, color: p.dark, padding: "3px 10px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
      {t(`ticket.status.${status}`)}
    </span>
  );
}
