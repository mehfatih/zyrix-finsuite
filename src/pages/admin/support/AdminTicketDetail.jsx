// ================================================================
// /admin/support/tickets/:id — Staff reply view with internal notes
// ================================================================
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { getBrandPalette, getReportsPalette, getWarningPalette, getSuccessPalette, getCustomerPalette } from "../../../utils/dashboardPalette";
import { fmtDateTime } from "../../../utils/format";
import TicketStatusBadge from "../../../components/support/TicketStatusBadge";
import { getTicket, addMessage } from "../../support/supportApi";

const QUICK_REPLIES = {
  TR: [
    "Geri bildiriminiz için teşekkürler — inceleyip dönüyorum.",
    "Bu sorunu Lütfen yeniden deneyin ve hâlâ devam ediyorsa bana bildirin.",
    "Mühendislik ekibine ilettim — 24 saat içinde yanıt vereceğiz.",
  ],
  EN: [
    "Thanks for the feedback — I'll look into it and reply shortly.",
    "Could you try again and let me know if the issue persists?",
    "Forwarded to engineering — I'll have an answer within 24h.",
  ],
  AR: [
    "شكراً على الملاحظة — سأراجعها وأرد قريباً.",
    "هل يمكنك المحاولة مجدداً وإعلامي إذا استمرت المشكلة؟",
    "أحلتها لفريق الهندسة — ستصلك إجابة خلال 24 ساعة.",
  ],
};

export default function AdminTicketDetail() {
  const { id } = useParams();
  const { lang } = useI18n();
  const t = useDashboardI18n("support");
  const brand = getBrandPalette(String(lang).toLowerCase());
  const reports = getReportsPalette();
  const warn = getWarningPalette();
  const success = getSuccessPalette();
  const customer = getCustomerPalette();

  const [ticket, setTicket] = useState(null);
  const [reply, setReply] = useState("");
  const [internal, setInternal] = useState(false);

  const load = () => getTicket(id).then(setTicket);
  useEffect(() => { load(); }, [id]);

  const send = async () => {
    if (!reply.trim()) return;
    await addMessage(id, reply.trim());
    setReply("");
    load();
  };

  if (!ticket) return <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>{t("common.loading")}</div>;

  const replies = QUICK_REPLIES[lang] || QUICK_REPLIES.EN;

  return (
    <div style={{ padding: "28px 24px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }} className="atd-grid">
      <div>
        <Link to="/admin/support" style={{ fontSize: 12, color: brand.dark, textDecoration: "none", fontWeight: 700, display: "inline-block", marginBottom: 12 }}>
          ← {t("admin.queue.title")}
        </Link>

        <header style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", padding: 18, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", margin: 0 }}>{ticket.subject}</h1>
          <TicketStatusBadge status={ticket.status} t={t} />
        </header>

        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", padding: 18, marginBottom: 14 }}>
          {(ticket.messages || []).map((m, i) => {
            const isStaff = m.authorType === "STAFF";
            const isInternal = m.internal;
            return (
              <div key={m.id || i} style={{ display: "flex", justifyContent: isStaff ? "flex-end" : "flex-start", marginBottom: 10 }}>
                <div style={{
                  maxWidth: "82%",
                  background: isInternal ? "#FFF8E5" : isStaff ? `linear-gradient(135deg, ${brand.base}, ${brand.dark})` : "#fff",
                  color: isStaff && !isInternal ? "#fff" : "#0F172A",
                  border: isInternal ? `1px solid ${warn.base}40` : isStaff ? "none" : "1px solid #E2E8F0",
                  padding: "10px 14px",
                  borderRadius: 12,
                  fontSize: 13, lineHeight: 1.55,
                  whiteSpace: "pre-wrap",
                }}>
                  {isInternal && <div style={{ fontSize: 9, fontWeight: 800, color: "#B45309", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Internal note</div>}
                  {m.content}
                  <div style={{ fontSize: 9, opacity: 0.7, marginTop: 6 }}>{fmtDateTime(m.createdAt, { lang })}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick replies */}
        <div style={{ background: "#F8FAFC", borderRadius: 12, padding: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Quick replies</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {replies.map((r, i) => (
              <button key={i} type="button" onClick={() => setReply(r)} style={{ background: "#fff", color: brand.dark, border: `1px solid ${brand.base}30`, padding: "6px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: "pointer", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", padding: 14 }}>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder={t("ticket.detail.reply")}
            rows={4}
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box", resize: "vertical", marginBottom: 10 }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <label style={{ fontSize: 12, color: "#64748B", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} /> Internal note (not visible to customer)
            </label>
            <button type="button" disabled={!reply.trim()} onClick={send} style={{
              background: reply.trim() ? `linear-gradient(135deg, ${brand.base}, ${brand.dark})` : "#CBD5E1",
              color: "#fff", border: "none", padding: "10px 20px", borderRadius: 10, fontSize: 12, fontWeight: 800,
              cursor: reply.trim() ? "pointer" : "not-allowed",
            }}>
              {t("ticket.detail.send")}
            </button>
          </div>
        </div>
      </div>

      {/* Customer context sidebar */}
      <aside style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 16, height: "fit-content" }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Customer Context</div>
        <Row label="Customer ID" value={String(ticket.userId).slice(0, 8)} />
        <Row label="Tier" value="Pro" palette={reports} />
        <Row label="Created" value={fmtDateTime(ticket.createdAt, { lang })} />
        <Row label="Priority" value={t(`ticket.priority.${ticket.priority || "NORMAL"}`)} palette={ticket.priority === "URGENT" ? { bg: "#FFE4E6", dark: "#9F1239" } : customer} />
        <Row label="Category" value={ticket.category ? t(`cat.${ticket.category}`) : "—"} />
      </aside>

      <style>{`@media (max-width: 900px) { .atd-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function Row({ label, value, palette }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px dashed #F1F5F9", fontSize: 12 }}>
      <span style={{ color: "#64748B", fontWeight: 700 }}>{label}</span>
      {palette ? (
        <span style={{ background: palette.bg, color: palette.dark, padding: "2px 8px", borderRadius: 999, fontWeight: 800, fontSize: 11 }}>{value}</span>
      ) : (
        <span style={{ color: "#0F172A", fontWeight: 700 }}>{value}</span>
      )}
    </div>
  );
}
