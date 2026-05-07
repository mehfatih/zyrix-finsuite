// ================================================================
// /support/tickets/:id — Threaded conversation + reply + CSAT
// ================================================================
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import { getBrandPalette, getAIPalette } from "../../utils/dashboardPalette";
import { fmtDateTime } from "../../utils/format";
import TicketStatusBadge from "../../components/support/TicketStatusBadge";
import CSATSurvey from "../../components/support/CSATSurvey";
import { getTicket, addMessage, submitCsat } from "./supportApi";

export default function TicketDetailPage() {
  const { id } = useParams();
  const { lang } = useI18n();
  const t = useDashboardI18n("support");
  const brand = getBrandPalette(String(lang).toLowerCase());
  const ai = getAIPalette();

  const [ticket, setTicket] = useState(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const load = () => getTicket(id).then(setTicket);
  useEffect(() => { load(); }, [id]);

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    await addMessage(id, reply.trim());
    setReply("");
    setSending(false);
    load();
  };

  const onCsat = async (rating, comment) => {
    await submitCsat(id, rating, comment);
    load();
  };

  if (!ticket) return <div style={{ padding: 60, textAlign: "center", color: "#94A3B8" }}>{t("common.loading")}</div>;

  const messages = ticket.messages || [];
  const showCsat = ticket.status === "RESOLVED" && !ticket.csatRating;

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at top, ${brand.bg}, #F8FAFC 60%)`, padding: "40px 24px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <Link to="/support/tickets" style={{ fontSize: 12, color: brand.dark, textDecoration: "none", fontWeight: 700, display: "inline-block", marginBottom: 16 }}>
          ← {t("tickets.title")}
        </Link>

        <header style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", padding: 18, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
              {t("ticket.detail.title", { id: String(ticket.id).slice(0, 8) })}
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: 0 }}>{ticket.subject}</h1>
          </div>
          <TicketStatusBadge status={ticket.status} t={t} />
        </header>

        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", padding: 18, marginBottom: 14 }}>
          {messages.map((m, i) => {
            const isCustomer = m.authorType === "CUSTOMER";
            const isBot = m.authorType === "AI_BOT";
            const palette = isCustomer ? brand : isBot ? ai : { bg: "#F1F5F9", base: "#64748B", dark: "#334155" };
            return (
              <div key={m.id || i} style={{ display: "flex", justifyContent: isCustomer ? "flex-end" : "flex-start", marginBottom: 12 }}>
                <div style={{
                  maxWidth: "82%",
                  background: isCustomer ? `linear-gradient(135deg, ${palette.base}, ${palette.dark})` : "#fff",
                  color: isCustomer ? "#fff" : "#0F172A",
                  border: isCustomer ? "none" : `1px solid ${palette.base}30`,
                  padding: "10px 14px",
                  borderRadius: isCustomer ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  fontSize: 13, lineHeight: 1.55,
                  boxShadow: isCustomer ? `0 4px 12px ${palette.base}40` : "0 2px 6px rgba(15,23,42,0.04)",
                  whiteSpace: "pre-wrap",
                }}>
                  {m.content}
                  <div style={{ fontSize: 9, opacity: 0.7, marginTop: 6 }}>{fmtDateTime(m.createdAt, { lang })}</div>
                </div>
              </div>
            );
          })}
        </div>

        {showCsat && (
          <div style={{ marginBottom: 14 }}>
            <CSATSurvey onSubmit={onCsat} lang={lang} t={t} />
          </div>
        )}

        {ticket.status !== "CLOSED" && (
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", padding: 14 }}>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={t("ticket.detail.reply")}
              rows={3}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box", resize: "vertical", marginBottom: 10 }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="button" disabled={sending || !reply.trim()} onClick={sendReply} style={{
                background: reply.trim() ? `linear-gradient(135deg, ${brand.base}, ${brand.dark})` : "#CBD5E1",
                color: "#fff", border: "none",
                padding: "10px 20px", borderRadius: 10, fontSize: 12, fontWeight: 800,
                cursor: reply.trim() ? "pointer" : "not-allowed",
                boxShadow: reply.trim() ? `0 4px 12px ${brand.base}40` : "none",
              }}>
                {sending ? t("common.loading") : t("ticket.detail.send")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
