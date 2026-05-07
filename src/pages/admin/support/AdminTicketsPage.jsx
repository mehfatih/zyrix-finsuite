// ================================================================
// /admin/support — Staff ticket queue
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getBrandPalette, getAlertPalette, getCustomerPalette, getReportsPalette } from "../../../utils/dashboardPalette";
import { fmtRelativeTime } from "../../../utils/format";
import TicketStatusBadge from "../../../components/support/TicketStatusBadge";
import { listTickets } from "../../support/supportApi";

const FILTERS = ["all", "unassigned", "mine", "urgent"];

export default function AdminTicketsPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("support");
  const brand = getBrandPalette(String(lang).toLowerCase());
  const alert = getAlertPalette();
  const customer = getCustomerPalette();
  const reports = getReportsPalette();

  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => { listTickets().then(setTickets); }, []);

  const filtered = useMemo(() => {
    return tickets.filter((tk) => {
      if (filter === "unassigned") return !tk.assignedTo;
      if (filter === "mine") return tk.assignedTo === "me";
      if (filter === "urgent") return tk.priority === "URGENT" || tk.priority === "HIGH";
      return true;
    });
  }, [tickets, filter]);

  const filterPalette = (f) => f === "urgent" ? alert : f === "unassigned" ? reports : customer;

  return (
    <div style={{ padding: "32px 28px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#0F172A", margin: 0 }}>{t("admin.queue.title")}</h1>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {FILTERS.map((f) => {
            const p = f === "all" ? brand : filterPalette(f);
            const active = filter === f;
            return (
              <button key={f} type="button" onClick={() => setFilter(f)} style={{
                background: active ? `linear-gradient(135deg, ${p.base}, ${p.dark})` : p.bg,
                color: active ? "#fff" : p.dark,
                border: `1px solid ${active ? p.base : p.base + "30"}`,
                padding: "6px 14px", borderRadius: 999, fontSize: 11, fontWeight: 800, cursor: "pointer",
              }}>
                {f === "all" ? "All" : t(`admin.queue.${f}`)}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto auto auto", gap: 12, padding: "10px 18px", background: "#F8FAFC", fontSize: 10, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }} className="atp-head">
          <span>Priority</span>
          <span>Subject</span>
          <span>Status</span>
          <span>Last update</span>
          <span>Assignee</span>
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: 36, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>{t("common.empty")}</div>
        ) : (
          filtered.map((tk, i) => (
            <Link key={tk.id} to={`/admin/support/tickets/${tk.id}`} style={{
              display: "grid", gridTemplateColumns: "auto 1fr auto auto auto", gap: 12, alignItems: "center",
              padding: "12px 18px",
              borderBottom: i < filtered.length - 1 ? "1px solid #F1F5F9" : "none",
              textDecoration: "none", color: "inherit",
            }}
            className="atp-row"
            >
              <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 8px", borderRadius: 999, background: tk.priority === "URGENT" ? alert.bg : tk.priority === "HIGH" ? "#FFF8E5" : "#F1F5F9", color: tk.priority === "URGENT" ? alert.dark : tk.priority === "HIGH" ? "#B45309" : "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {t(`ticket.priority.${tk.priority || "NORMAL"}`)}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tk.subject}</span>
              <TicketStatusBadge status={tk.status} t={t} />
              <span style={{ fontSize: 11, color: "#64748B" }}>{fmtRelativeTime(tk.updatedAt, { lang })}</span>
              <span style={{ fontSize: 11, color: tk.assignedTo ? customer.dark : "#94A3B8", fontWeight: 700 }}>{tk.assignedTo || "—"}</span>
            </Link>
          ))
        )}
      </div>

      <style>{`@media (max-width: 720px) {
        .atp-head, .atp-row { grid-template-columns: 1fr auto !important; }
        .atp-head > *:not(:nth-child(1)):not(:nth-child(2)) { display: none !important; }
        .atp-row > *:not(:nth-child(1)):not(:nth-child(2)):not(:nth-child(3)) { display: none !important; }
      }`}</style>
    </div>
  );
}
