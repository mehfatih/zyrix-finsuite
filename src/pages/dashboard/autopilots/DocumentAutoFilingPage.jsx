// ================================================================
// Smart Document Auto-Filing — scan/upload + AI category review queue
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getMarketPalette,
  getAIPalette,
  getSuccessPalette,
  getCustomerPalette,
  getReportsPalette,
  getMoneyPalette,
  getAlertPalette,
  getPaletteById,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import DocumentScanner from "../../../components/dashboard/autopilots/DocumentScanner";
import AutoFileBadge from "../../../components/dashboard/autopilots/AutoFileBadge";
import { localStore, KEYS, ensureFilingSeed, fmtCurrency, fmtDate } from "./autopilotsApi";

const TYPE_PALETTE = {
  salesInvoice:    "emerald",
  purchaseInvoice: "orange",
  receipt:         "amber",
  contract:        "indigo",
  permit:          "cyan",
  bank:            "teal",
  tax:             "wine",
  other:           "violet",
};

function classifyDocument() {
  // Mock AI classification — pick a random type with a high-ish confidence
  const types = ["salesInvoice", "purchaseInvoice", "receipt", "contract", "tax"];
  const parties = ["Demo Müşteri", "Demo Tedarik", "TEDAŞ", "Acme Ofis", "Mali Müşavirim"];
  return {
    type: types[Math.floor(Math.random() * types.length)],
    party: parties[Math.floor(Math.random() * parties.length)],
    amount: Math.round(Math.random() * 12000) + 800,
    date: new Date().toISOString(),
    confidence: 70 + Math.round(Math.random() * 28),
  };
}

export default function DocumentAutoFilingPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("autopilots");
  const market = getMarketPalette();
  const ai = getAIPalette();
  const success = getSuccessPalette();
  const customer = getCustomerPalette();
  const reports = getReportsPalette();
  const money = getMoneyPalette();
  const alert = getAlertPalette();

  const [items, setItems] = useState([]);

  const reload = () => setItems(localStore.list(KEYS.filingQueue));
  useEffect(() => {
    ensureFilingSeed();
    reload();
  }, []);

  const queue = useMemo(() => items.filter((x) => x.status === "PENDING_REVIEW"), [items]);
  const recent = useMemo(() => items.filter((x) => x.status === "AUTO_FILED" || x.status === "APPROVED"), [items]);

  const stats = useMemo(() => ({
    processed: items.length,
    classified: items.filter((x) => x.confidence >= 70).length,
    accuracy: items.length > 0 ? Math.round((items.filter((x) => x.confidence >= 80).length / items.length) * 100) : 0,
    queued: queue.length,
  }), [items, queue]);

  const onCapture = (capture) => {
    const cls = classifyDocument();
    const created = localStore.add(KEYS.filingQueue, {
      ...cls,
      preview: capture?.dataUrl,
      source: capture?.source || "upload",
      status: cls.confidence >= 90 ? "AUTO_FILED" : "PENDING_REVIEW",
      createdAt: new Date().toISOString(),
    });
    reload();
  };

  const approve = (id) => {
    localStore.update(KEYS.filingQueue, id, { status: "APPROVED" });
    reload();
  };
  const reject = (id) => {
    localStore.remove(KEYS.filingQueue, id);
    reload();
  };
  const editType = (id, type) => {
    localStore.update(KEYS.filingQueue, id, { type, status: "APPROVED" });
    reload();
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("filing.title")} subtitle={t("filing.subtitle")} icon="📁" palette={market} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="ap-kpi-grid"
      >
        <KpiCard label={t("filing.kpi.processed")} value={stats.processed} palette={market} icon="📥" />
        <KpiCard label={t("filing.kpi.classified")} value={stats.classified} palette={ai} icon="🤖" />
        <KpiCard label={t("filing.kpi.accuracy")} value={stats.accuracy} suffix="%" palette={success} icon="🎯" />
        <KpiCard label={t("filing.kpi.queue")} value={stats.queued} palette={alert} icon="⏳" pulse={stats.queued > 0} />
      </div>

      <Card palette={market} title={t("filing.scan")} icon="📷" style={{ marginBottom: 18 }}>
        <DocumentScanner onCapture={onCapture} t={t} label={t("filing.scan")} />
      </Card>

      {/* Pending review queue */}
      <Card palette={alert} title={t("filing.untagged")} icon="⏳" style={{ marginBottom: 18 }}>
        {queue.length === 0 ? (
          <EmptyState title={t("filing.empty.untagged")} icon="🎉" palette={success} />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            {queue.map((doc) => {
              const palette = getPaletteById(TYPE_PALETTE[doc.type] || "indigo");
              return (
                <div
                  key={doc.id}
                  style={{
                    background: "#fff",
                    border: `1.5px solid ${palette.base}30`,
                    borderRadius: 14,
                    padding: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: doc.preview ? `url(${doc.preview}) center/cover` : `linear-gradient(135deg, ${palette.bg}, ${palette.base}30)`,
                        color: palette.dark,
                        display: "grid",
                        placeItems: "center",
                        fontSize: 18,
                        flexShrink: 0,
                      }}
                    >
                      {!doc.preview && "📄"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <select
                        value={doc.type}
                        onChange={(e) => editType(doc.id, e.target.value)}
                        style={{
                          background: palette.bg,
                          color: palette.dark,
                          border: `1px solid ${palette.base}30`,
                          borderRadius: 8,
                          padding: "4px 8px",
                          fontSize: 11,
                          fontWeight: 700,
                          outline: "none",
                          width: "100%",
                        }}
                      >
                        {Object.keys(TYPE_PALETTE).map((tp) => (
                          <option key={tp} value={tp}>{t(`filing.cat.${tp}`)}</option>
                        ))}
                      </select>
                    </div>
                    <AutoFileBadge confidence={doc.confidence} label="AI" size="compact" />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 6, fontSize: 12, color: "#475569", marginBottom: 10 }}>
                    <span>👤 {doc.party}</span>
                    <span style={{ fontFamily: "monospace", color: money.dark, fontWeight: 700 }}>{fmtCurrency(doc.amount)}</span>
                    <span style={{ color: "#94A3B8", fontSize: 11 }}>{fmtDate(doc.date, lang)}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    <button type="button" onClick={() => reject(doc.id)} style={btnSm(alert)}>
                      ✗
                    </button>
                    <button type="button" onClick={() => approve(doc.id)} style={btnSm(success, true)}>
                      ✓ {t("filing.action.approve")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Recent auto-filed */}
      <Card palette={success} title={t("filing.recent")} icon="✨">
        {recent.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: "#94A3B8" }}>—</div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {recent.slice(0, 8).map((doc) => {
              const palette = getPaletteById(TYPE_PALETTE[doc.type] || "indigo");
              return (
                <li
                  key={doc.id}
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
                      borderRadius: 8,
                      background: palette.bg,
                      color: palette.dark,
                      display: "grid",
                      placeItems: "center",
                      fontSize: 14,
                    }}
                  >
                    📄
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>
                      {t(`filing.cat.${doc.type}`)} · {doc.party}
                    </div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>{fmtDate(doc.date, lang)}</div>
                  </div>
                  <span style={{ fontFamily: "monospace", fontWeight: 700, color: money.dark, fontSize: 12 }}>
                    {fmtCurrency(doc.amount)}
                  </span>
                  <AutoFileBadge confidence={doc.confidence} label="Filed" size="compact" />
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <style>{`@media (max-width: 720px) { .ap-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
    </div>
  );
}

function btnSm(palette, primary) {
  if (primary) {
    return {
      background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
      color: "#fff",
      border: "none",
      borderRadius: 8,
      padding: "5px 12px",
      fontSize: 11,
      fontWeight: 800,
      cursor: "pointer",
    };
  }
  return {
    background: palette.bg,
    color: palette.dark,
    border: `1px solid ${palette.base}40`,
    borderRadius: 8,
    padding: "5px 10px",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  };
}
