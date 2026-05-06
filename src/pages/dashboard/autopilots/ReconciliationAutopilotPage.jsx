// ================================================================
// ★ Reconciliation Autopilot — 95% auto-match in seconds
// ================================================================
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getAIPalette,
  getMoneyPalette,
  getSuccessPalette,
  getCustomerPalette,
  getAlertPalette,
  getReportsPalette,
  getBrandPalette,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import ReconcileMatchCard from "../../../components/dashboard/autopilots/ReconcileMatchCard";
import { api, localStore, KEYS, fmtCurrency, fmtDate } from "./autopilotsApi";

// Mock bank statement rows for demos when none have been uploaded.
function ensureStatementSeed() {
  if (localStore.list("zyrix_bank_statement_v1").length > 0) return;
  const today = Date.now();
  const seeds = [
    { date: new Date(today - 1 * 86400000).toISOString(), description: "ABC Ltd transfer",       amount: 5000  },
    { date: new Date(today - 1 * 86400000).toISOString(), description: "XYZ Co payment",          amount: 2300  },
    { date: new Date(today - 2 * 86400000).toISOString(), description: "Demo Müşteri ödeme",      amount: 12500 },
    { date: new Date(today - 3 * 86400000).toISOString(), description: "Acme Yapı havale",        amount: 4200  },
    { date: new Date(today - 4 * 86400000).toISOString(), description: "Yıldız Lojistik",         amount: 1500  },
    { date: new Date(today - 4 * 86400000).toISOString(), description: "Beta İnşaat ödeme",       amount: 18900 },
    { date: new Date(today - 5 * 86400000).toISOString(), description: "Petrol istasyonu POS",    amount: -890  },
    { date: new Date(today - 5 * 86400000).toISOString(), description: "Acme Ofis Malz fatura",   amount: -1250 },
    { date: new Date(today - 6 * 86400000).toISOString(), description: "TEDAŞ elektrik",          amount: -980  },
    { date: new Date(today - 7 * 86400000).toISOString(), description: "Müşteri X tahsilat",     amount: 3200  },
  ].map((s, i) => ({ ...s, id: `bs-seed-${i}` }));
  localStore.save("zyrix_bank_statement_v1", seeds);
}

function scoreMatch(stmt, invoice) {
  const a = Math.abs((Number(stmt.amount) || 0) - (Number(invoice.total) || 0));
  const amtPct = Math.min(1, a / Math.max(1, Math.abs(Number(invoice.total) || 1)));
  const amtScore = Math.max(0, 1 - amtPct * 4);
  const days = Math.abs(new Date(stmt.date).getTime() - new Date(invoice.dueDate || invoice.createdAt).getTime()) / 86400000;
  const dateScore = Math.max(0, 1 - days / 30);
  const refMatch = (invoice.customerName || "").toLowerCase().split(/\s+/).some((w) => w.length > 3 && (stmt.description || "").toLowerCase().includes(w)) ? 0.15 : 0;
  return Math.round((amtScore * 0.55 + dateScore * 0.3 + refMatch + (Number(stmt.amount) > 0 ? 0.05 : 0)) * 100);
}

export default function ReconciliationAutopilotPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("autopilots");
  const ai = getAIPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const customer = getCustomerPalette();
  const alert = getAlertPalette();
  const reports = getReportsPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [statement, setStatement] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [matches, setMatches] = useState([]);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    ensureStatementSeed();
    setStatement(localStore.list("zyrix_bank_statement_v1"));
    api("/api/invoices?limit=200").then((r) => {
      const list = r?.data?.invoices || r?.data?.items || r?.data || [];
      setInvoices((Array.isArray(list) ? list : []).filter((i) => i.status !== "PAID" && i.status !== "CANCELLED"));
    });
    setMatches(localStore.list(KEYS.reconMatches));
  }, []);

  const runAutoMatch = async () => {
    setRunning(true);
    startRef.current = Date.now();
    setElapsed(0);
    const interval = setInterval(() => setElapsed((Date.now() - startRef.current) / 1000), 100);
    await new Promise((r) => setTimeout(r, 800));
    const out = [];
    const usedInv = new Set();
    statement.forEach((stmt) => {
      let best = null;
      invoices.forEach((inv) => {
        if (usedInv.has(inv.id)) return;
        const sc = scoreMatch(stmt, inv);
        if (!best || sc > best.score) best = { invoice: inv, score: sc };
      });
      if (best && best.score >= 65) {
        usedInv.add(best.invoice.id);
        out.push({
          id: `m-${Date.now()}-${stmt.id}`,
          statement: stmt,
          invoice: best.invoice,
          confidence: best.score,
          status: best.score >= 90 ? "AUTO" : "PENDING",
          reason: best.score >= 90 ? "High-confidence match (amount + date + name)" : "Possible match — review",
          createdAt: new Date().toISOString(),
        });
      }
    });
    await new Promise((r) => setTimeout(r, 1600));
    clearInterval(interval);
    setElapsed((Date.now() - startRef.current) / 1000);
    setMatches(out);
    out.forEach((m) => localStore.add(KEYS.reconMatches, m));
    setRunning(false);
  };

  const stats = useMemo(() => {
    const total = statement.length;
    const matched = matches.length;
    const auto = matches.filter((m) => m.status === "AUTO").length;
    const pending = matches.filter((m) => m.status === "PENDING").length;
    const unmatched = total - matched;
    const pct = total > 0 ? Math.round((matched / total) * 100) : 0;
    return { total, matched, auto, pending, unmatched, pct };
  }, [statement, matches]);

  const unmatchedRows = useMemo(() => {
    const matchedIds = new Set(matches.map((m) => m.statement.id));
    return statement.filter((s) => !matchedIds.has(s.id));
  }, [statement, matches]);

  const confirm = (id) => {
    setMatches((arr) => arr.map((m) => (m.id === id ? { ...m, status: "CONFIRMED" } : m)));
    localStore.update(KEYS.reconMatches, id, { status: "CONFIRMED" });
  };
  const override = (id) => {
    localStore.add(KEYS.reconCorrections, { matchId: id, at: new Date().toISOString() });
    setMatches((arr) => arr.filter((m) => m.id !== id));
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("recon.title")} subtitle={t("recon.subtitle")} icon="🔄" palette={ai} />

      {/* HERO — circular progress */}
      <div
        style={{
          background: `linear-gradient(135deg, ${ai.bg}, ${success.bg})`,
          border: `2px solid ${ai.base}40`,
          borderRadius: 18,
          padding: 26,
          marginBottom: 18,
          display: "flex",
          gap: 26,
          alignItems: "center",
          flexWrap: "wrap",
          boxShadow: `0 12px 36px ${ai.base}20`,
        }}
      >
        <div style={{ position: "relative", width: 160, height: 160, flexShrink: 0 }}>
          <svg viewBox="0 0 160 160" width="160" height="160" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="80" cy="80" r="68" fill="none" stroke={`${ai.base}20`} strokeWidth="12" />
            <circle
              cx="80"
              cy="80"
              r="68"
              fill="none"
              stroke="url(#rec-grad)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${(2 * Math.PI * 68 * stats.pct) / 100} ${2 * Math.PI * 68}`}
              style={{ transition: "stroke-dasharray .8s ease" }}
            />
            <defs>
              <linearGradient id="rec-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={ai.base} />
                <stop offset="100%" stopColor={success.base} />
              </linearGradient>
            </defs>
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 38, fontWeight: 900, color: ai.base, fontFamily: "monospace" }}>
                {stats.pct}%
              </div>
              <div style={{ fontSize: 10, color: ai.dark, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {t("recon.hero.matched")}
              </div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          {matches.length > 0 ? (
            <>
              <div style={{ fontSize: 18, fontWeight: 800, color: success.dark, marginBottom: 4 }}>
                🎉 {t("recon.hero.subtitle").replace("{matched}", stats.matched).replace("{total}", stats.total).replace("{seconds}", elapsed.toFixed(1))}
              </div>
              <div style={{ fontSize: 12, color: "#64748B", marginBottom: 14 }}>
                {stats.auto} auto-matched · {stats.pending} need review · {stats.unmatched} unmatched
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 18, fontWeight: 800, color: ai.dark, marginBottom: 4 }}>
                {statement.length} bank rows · {invoices.length} open invoices
              </div>
              <div style={{ fontSize: 12, color: "#64748B", marginBottom: 14 }}>
                {t("recon.subtitle")}
              </div>
            </>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={runAutoMatch}
              disabled={running || statement.length === 0}
              style={{
                background: running ? "#CBD5E1" : `linear-gradient(135deg, ${ai.base}, ${ai.dark})`,
                color: "#fff",
                border: "none",
                padding: "12px 22px",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 800,
                cursor: running ? "not-allowed" : "pointer",
                boxShadow: running ? "none" : `0 8px 22px ${ai.base}40`,
              }}
            >
              {running ? `🧠 ${t("recon.running")} (${elapsed.toFixed(1)}s)` : `⚡ ${t("recon.run")}`}
            </button>
            {stats.unmatched > 0 && !running && matches.length > 0 && (
              <button
                type="button"
                style={{
                  background: alert.bg,
                  color: alert.dark,
                  border: `1px solid ${alert.base}40`,
                  padding: "12px 18px",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {t("recon.review.unmatched").replace("{n}", stats.unmatched)}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="ap-kpi-grid"
      >
        <KpiCard label={t("recon.hero.matched")} value={stats.matched} palette={success} icon="✅" />
        <KpiCard label="Auto-Matched" value={stats.auto} palette={ai} icon="🤖" />
        <KpiCard label="Pending Review" value={stats.pending} palette={customer} icon="⏳" />
        <KpiCard label="Unmatched" value={stats.unmatched} palette={alert} icon="⚠️" pulse={stats.unmatched > 0} />
      </div>

      {/* Recent matches stream */}
      {matches.length > 0 && (
        <Card palette={ai} title={t("recon.recent.title")} icon="✨" style={{ marginBottom: 18 }}>
          {matches.map((m) => (
            <ReconcileMatchCard
              key={m.id}
              match={m}
              lang={lang}
              t={t}
              onConfirm={m.status === "PENDING" ? () => confirm(m.id) : null}
              onOverride={m.status === "PENDING" ? () => override(m.id) : null}
            />
          ))}
          <div style={{ marginTop: 10, fontSize: 11, color: ai.dark, textAlign: "center", fontStyle: "italic" }}>
            🧠 {t("recon.feedback.note")}
          </div>
        </Card>
      )}

      {/* Unmatched */}
      <Card palette={alert} title={t("recon.unmatched.title")} icon="⚠️">
        {unmatchedRows.length === 0 ? (
          <EmptyState title={t("recon.unmatched.empty")} icon="🎉" palette={success} />
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {unmatchedRows.map((row) => (
              <li
                key={row.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: alert.bg,
                    color: alert.dark,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  ?
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {row.description}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748B" }}>{fmtDate(row.date, lang)}</div>
                </div>
                <span style={{ fontSize: 14, fontWeight: 800, color: row.amount >= 0 ? success.base : alert.base, fontFamily: "monospace" }}>
                  {row.amount >= 0 ? "+" : ""}{fmtCurrency(row.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <style>{`@media (max-width: 720px) { .ap-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
    </div>
  );
}
