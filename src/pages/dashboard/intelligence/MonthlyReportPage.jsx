// ================================================================
// Monthly Report Generator — 12-page PDF + recipients + scheduling
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getReportsPalette,
  getMoneyPalette,
  getSuccessPalette,
  getBrandPalette,
  getCustomerPalette,
  getAIPalette,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import { localStore, KEYS, fmtCurrency, fmtDate } from "./intelligenceApi";

const TEMPLATES = [
  { id: "professional", icon: "📊", color: "#1E3A8A" },
  { id: "minimal",      icon: "◻",  color: "#0F172A" },
  { id: "colorful",     icon: "🎨", color: "#6C3AFF" },
];

const CONTENTS = Array.from({ length: 12 }, (_, i) => i + 1);

export default function MonthlyReportPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("intelligence");
  const reports = getReportsPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const customer = getCustomerPalette();
  const brand = getBrandPalette(lang.toLowerCase());
  const ai = getAIPalette();

  const [period, setPeriod] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 7);
  });
  const [recipients, setRecipients] = useState(() => localStore.list(KEYS.monthlyRecip));
  const [template, setTemplate] = useState("professional");
  const [history, setHistory] = useState([]);
  const [scheduled, setScheduled] = useState(false);
  const [toast, setToast] = useState(null);
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    const h = localStore.list(KEYS.monthlyHistory);
    setHistory(h);
    if (recipients.length === 0) {
      const seeds = [
        { name: "Mali Müşavir",   email: "mali@accountant.com", role: "accountant", checked: true },
        { name: "Yourself",        email: "you@zyrix.co",        role: "owner",      checked: true },
        { name: "Bank Manager",    email: "bank@manager.com",    role: "bank",       checked: false },
      ];
      seeds.forEach((s) => localStore.add(KEYS.monthlyRecip, s));
      setRecipients(localStore.list(KEYS.monthlyRecip));
    }
  }, []);

  const periodDate = new Date(period + "-01");
  const periodLabel = periodDate.toLocaleString(lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR", { month: "long", year: "numeric" });

  const stats = useMemo(() => ({
    generated: history.length,
    sent: history.filter((h) => h.sent).length,
    recipients: recipients.filter((r) => r.checked).length,
    nextRun: scheduled ? "Last day of month" : "Manual",
  }), [history, recipients, scheduled]);

  const generate = () => {
    const created = localStore.add(KEYS.monthlyHistory, {
      period,
      template,
      generatedAt: new Date().toISOString(),
      sent: false,
      recipients: recipients.filter((r) => r.checked).map((r) => r.email),
    });
    setHistory(localStore.list(KEYS.monthlyHistory));
    setToast({ kind: "success", msg: t("monthly.toast.generated") });
    setTimeout(() => setToast(null), 2500);

    // Build a tiny "PDF" placeholder file (text) for download
    const checked = recipients.filter((r) => r.checked);
    const txt = `MONTHLY REPORT
Period: ${periodLabel}
Template: ${template}
Recipients: ${checked.map((r) => `${r.name} <${r.email}>`).join(", ")}

Highlights
- Revenue: ₺128,500 (+18% YoY)
- Net Profit: ₺34,200
- Top customer: Ahmed Yıldız (₺22,000)
- VAT due: ₺18,300 (deadline: Feb 26)

Contents
${CONTENTS.map((n) => `${n}. ${t(`monthly.contents.${n}`)}`).join("\n")}
`;
    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monthly-report-${period}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const send = () => {
    const checked = recipients.filter((r) => r.checked);
    if (checked.length === 0) return;
    history.forEach((h) => localStore.update(KEYS.monthlyHistory, h.id, { sent: true, sentAt: new Date().toISOString() }));
    setHistory(localStore.list(KEYS.monthlyHistory));
    setToast({ kind: "success", msg: t("monthly.toast.sent").replace("{n}", checked.length) });
    setTimeout(() => setToast(null), 2800);
  };

  const toggleRecipient = (id) => {
    const all = localStore.list(KEYS.monthlyRecip);
    const found = all.find((r) => r.id === id);
    if (found) localStore.update(KEYS.monthlyRecip, id, { checked: !found.checked });
    setRecipients(localStore.list(KEYS.monthlyRecip));
  };

  const addRecipient = () => {
    if (!newEmail.includes("@")) return;
    localStore.add(KEYS.monthlyRecip, { name: newEmail.split("@")[0], email: newEmail, role: "other", checked: true });
    setRecipients(localStore.list(KEYS.monthlyRecip));
    setNewEmail("");
  };

  const removeRecipient = (id) => {
    localStore.remove(KEYS.monthlyRecip, id);
    setRecipients(localStore.list(KEYS.monthlyRecip));
  };

  const tpl = TEMPLATES.find((x) => x.id === template) || TEMPLATES[0];

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("monthly.title")} subtitle={t("monthly.subtitle")} icon="📄" palette={reports} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="intel-kpi-grid"
      >
        <KpiCard label="Generated" value={stats.generated} palette={reports} icon="📄" />
        <KpiCard label="Sent" value={stats.sent} palette={success} icon="✉️" />
        <KpiCard label="Recipients" value={stats.recipients} palette={customer} icon="👥" />
        <KpiCard label="Schedule" value={scheduled ? "Auto" : "Manual"} palette={ai} icon="⏰" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)", gap: 18, marginBottom: 18 }} className="intel-detail-grid">
        {/* Configuration */}
        <Card palette={reports} title="Configuration" icon="⚙️">
          <Section label={t("monthly.period")}>
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={input(reports)}
            />
          </Section>

          <Section label={t("monthly.recipients")}>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {recipients.map((r) => (
                <li
                  key={r.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 10px",
                    background: r.checked ? `${reports.base}10` : "#F8FAFC",
                    border: `1px solid ${r.checked ? reports.base : "#E2E8F0"}40`,
                    borderRadius: 10,
                    marginBottom: 6,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={r.checked}
                    onChange={() => toggleRecipient(r.id)}
                    style={{ width: 16, height: 16, accentColor: reports.base, cursor: "pointer" }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>{r.email}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRecipient(r.id)}
                    style={{
                      background: "transparent",
                      color: "#94A3B8",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 16,
                    }}
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="email@example.com"
                style={{ ...input(reports), flex: 1 }}
              />
              <button type="button" onClick={addRecipient} style={btn(reports, "secondary")}>
                {t("monthly.recipients.add")}
              </button>
            </div>
          </Section>

          <Section label={t("monthly.template")}>
            <div style={{ display: "flex", gap: 8 }}>
              {TEMPLATES.map((tplOpt) => {
                const active = template === tplOpt.id;
                return (
                  <button
                    key={tplOpt.id}
                    type="button"
                    onClick={() => setTemplate(tplOpt.id)}
                    style={{
                      flex: 1,
                      padding: "12px 10px",
                      borderRadius: 12,
                      border: active ? `2px solid ${tplOpt.color}` : `1px solid ${tplOpt.color}30`,
                      background: active ? `${tplOpt.color}15` : "#fff",
                      color: tplOpt.color,
                      fontSize: 12,
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{tplOpt.icon}</span>
                    <span>{t(`monthly.template.${tplOpt.id}`)}</span>
                  </button>
                );
              })}
            </div>
          </Section>

          <Section label={t("monthly.contents.title")}>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {CONTENTS.map((n) => (
                <li
                  key={n}
                  style={{
                    fontSize: 11,
                    color: reports.dark,
                    padding: "5px 8px",
                    background: reports.bg,
                    borderRadius: 8,
                    fontWeight: 600,
                  }}
                >
                  {n}. {t(`monthly.contents.${n}`)}
                </li>
              ))}
            </ul>
          </Section>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap", marginTop: 8 }}>
            <button type="button" onClick={() => setScheduled((s) => !s)} style={btn(scheduled ? success : reports, "secondary")}>
              {scheduled ? "✓ " : "⏰ "} {t("monthly.action.schedule")}
            </button>
            <button type="button" onClick={generate} style={btn(reports, "secondary")}>
              📄 {t("monthly.action.generate")}
            </button>
            <button type="button" onClick={send} style={btn(brand, "primary")}>
              ✉️ {t("monthly.action.send")}
            </button>
          </div>
        </Card>

        {/* PDF preview */}
        <Card palette={customer} title={t("monthly.preview")} icon="👁️">
          <div
            style={{
              background: "#fff",
              border: "1px solid #E2E8F0",
              borderRadius: 14,
              padding: 24,
              minHeight: 460,
              boxShadow: `0 8px 28px ${customer.base}15`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ height: 8, background: tpl.color, borderRadius: 6, marginBottom: 20 }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <div>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 14,
                    background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`,
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 22,
                    fontWeight: 900,
                    marginBottom: 6,
                  }}
                >
                  Z
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>Zyrix FinSuite</div>
              </div>
              <div style={{ textAlign: "end" }}>
                <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{periodLabel}</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: tpl.color, marginTop: 2 }}>
                  {t("monthly.cover.subtitle").replace("{period}", periodLabel)}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                {t("monthly.cover.highlights")}
              </div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                <PreviewRow label={t("monthly.cover.revenue").replace("{amount}", "₺128,500").replace("{delta}", "+18%")} palette={success} />
                <PreviewRow label={t("monthly.cover.profit").replace("{amount}", "₺34,200")} palette={money} />
                <PreviewRow label={t("monthly.cover.topCustomer").replace("{name}", "Ahmed Yıldız").replace("{amount}", "₺22,000")} palette={customer} />
                <PreviewRow label={t("monthly.cover.kdv").replace("{amount}", "₺18,300").replace("{date}", "Feb 26")} palette={brand} />
              </ul>
            </div>

            <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px dashed #E2E8F0", display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94A3B8" }}>
              <span>Page 1 / 12</span>
              <span>Generated by Zyrix AI</span>
            </div>
          </div>

          {history.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, color: "#475569", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Recent
              </div>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {history.slice(0, 5).map((h) => (
                  <li key={h.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderBottom: "1px solid #F1F5F9", fontSize: 12 }}>
                    <span style={{ fontWeight: 700, color: "#0F172A" }}>📄 {h.period}</span>
                    <span style={{ color: h.sent ? success.base : "#94A3B8", fontWeight: 700 }}>
                      {h.sent ? "✓ Sent" : "Generated"} · {fmtDate(h.generatedAt, lang)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            insetInlineEnd: 28,
            background: success.bg,
            color: success.dark,
            border: `2px solid ${success.base}`,
            borderRadius: 12,
            padding: "12px 18px",
            fontSize: 13,
            fontWeight: 800,
            zIndex: 250,
          }}
        >
          {toast.msg}
        </div>
      )}

      <style>{`
        @media (max-width: 720px) {
          .intel-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 880px) {
          .intel-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function PreviewRow({ label, palette }) {
  return (
    <li style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: palette.base, flexShrink: 0 }} />
      <span style={{ fontSize: 12, color: "#0F172A", fontWeight: 600 }}>{label}</span>
    </li>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: "#475569", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

function input(palette) {
  return {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${palette.base}25`,
    background: "#fff",
    fontSize: 13,
    color: "#0F172A",
    outline: "none",
    boxSizing: "border-box",
  };
}

function btn(palette, variant) {
  if (variant === "primary") {
    return {
      background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
      color: "#fff",
      border: "none",
      padding: "10px 18px",
      borderRadius: 12,
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: `0 4px 14px ${palette.base}40`,
    };
  }
  return {
    background: palette.bg,
    color: palette.dark,
    border: `1px solid ${palette.base}40`,
    padding: "10px 16px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  };
}
