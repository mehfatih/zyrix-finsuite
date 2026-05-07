// ================================================================
// /support/tickets — Customer ticket list
// ================================================================
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import { getBrandPalette } from "../../utils/dashboardPalette";
import { fmtRelativeTime } from "../../utils/format";
import TicketStatusBadge from "../../components/support/TicketStatusBadge";
import { listTickets } from "./supportApi";

export default function MyTicketsPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("support");
  const brand = getBrandPalette(String(lang).toLowerCase());
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listTickets().then((items) => { setTickets(items); setLoading(false); });
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at top, ${brand.bg}, #F8FAFC 60%)`, padding: "40px 24px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", margin: 0 }}>{t("tickets.title")}</h1>
          <Link to="/support/tickets/new" style={{ background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`, color: "#fff", textDecoration: "none", padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 800, boxShadow: `0 6px 16px ${brand.base}40` }}>
            + {t("ticket.new")}
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>{t("common.loading")}</div>
        ) : tickets.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 40, textAlign: "center", color: "#94A3B8" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{t("tickets.empty")}</div>
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 10px rgba(15,23,42,0.04)" }}>
            {tickets.map((tk, i) => (
              <Link key={tk.id} to={`/support/tickets/${tk.id}`} style={{
                display: "grid", gridTemplateColumns: "1fr auto auto", gap: 12, alignItems: "center",
                padding: "14px 18px",
                borderBottom: i < tickets.length - 1 ? "1px solid #F1F5F9" : "none",
                textDecoration: "none", color: "inherit",
              }}
              className="ticket-row"
              onMouseEnter={(e) => e.currentTarget.style.background = "#F8FAFC"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 2 }}>{tk.subject}</div>
                  <div style={{ fontSize: 11, color: "#94A3B8" }}>{t("tickets.lastUpdate")}: {fmtRelativeTime(tk.updatedAt, { lang })}</div>
                </div>
                <TicketStatusBadge status={tk.status} t={t} />
                <span style={{ fontSize: 16, color: "#94A3B8" }}>→</span>
              </Link>
            ))}
            <style>{`@media (max-width: 540px) { .ticket-row { grid-template-columns: 1fr auto !important; } .ticket-row > span:last-child { display: none; } }`}</style>
          </div>
        )}
      </div>
    </div>
  );
}
