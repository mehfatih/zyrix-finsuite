// ================================================================
// /support/tickets/new — Submit ticket form
// ================================================================
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import { getBrandPalette, getSuccessPalette } from "../../utils/dashboardPalette";
import { createTicket, SUPPORT_CATEGORIES } from "./supportApi";

const PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"];

export default function TicketSubmitPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("support");
  const navigate = useNavigate();
  const brand = getBrandPalette(String(lang).toLowerCase());
  const success = getSuccessPalette();

  const [form, setForm] = useState({ subject: "", description: "", category: "gettingStarted", priority: "NORMAL" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) return;
    setSubmitting(true);
    const ticket = await createTicket(form);
    setSubmitting(false);
    setDone(ticket);
    setTimeout(() => navigate(`/support/tickets/${ticket.id}`), 1200);
  };

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at top, ${brand.bg}, #F8FAFC 60%)`, padding: "40px 24px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <Link to="/support" style={{ fontSize: 12, color: brand.dark, textDecoration: "none", fontWeight: 700, display: "inline-block", marginBottom: 16 }}>
          ← {t("title")}
        </Link>

        <form onSubmit={onSubmit} style={{ background: "#fff", borderRadius: 18, border: "1px solid #E2E8F0", padding: "28px 32px", boxShadow: "0 4px 16px rgba(15,23,42,0.06)" }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", margin: "0 0 18px" }}>{t("ticket.new")}</h1>

          {done && (
            <div role="status" style={{ background: success.bg, border: `1.5px solid ${success.base}40`, borderRadius: 10, padding: 12, marginBottom: 16, color: success.dark, fontSize: 12, fontWeight: 700, textAlign: "center" }}>
              ✓ {t("ticket.success")}
            </div>
          )}

          <Field label={t("ticket.subject")}>
            <input type="text" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder={t("ticket.subject.ph")} style={inp} />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }} className="tsp-row">
            <Field label={t("ticket.category")}>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inp}>
                {SUPPORT_CATEGORIES.map((c) => <option key={c} value={c}>{t(`cat.${c}`)}</option>)}
              </select>
            </Field>
            <Field label={t("ticket.priority")}>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} style={inp}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{t(`ticket.priority.${p}`)}</option>)}
              </select>
            </Field>
          </div>

          <Field label={t("ticket.description")}>
            <textarea required rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={t("ticket.description.ph")} style={{ ...inp, resize: "vertical", fontFamily: "inherit" }} />
          </Field>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              background: submitting ? "#CBD5E1" : `linear-gradient(135deg, ${brand.base}, ${brand.dark})`,
              color: "#fff",
              border: "none",
              padding: "14px 18px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 800,
              cursor: submitting ? "not-allowed" : "pointer",
              boxShadow: submitting ? "none" : `0 8px 22px ${brand.base}40`,
              marginTop: 8,
            }}
          >
            {submitting ? t("common.loading") : `⚡ ${t("ticket.submit")}`}
          </button>

          <style>{`@media (max-width: 540px) { .tsp-row { grid-template-columns: 1fr !important; } }`}</style>
        </form>
      </div>
    </div>
  );
}

const inp = { width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" };

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 10, color: "#64748B", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
