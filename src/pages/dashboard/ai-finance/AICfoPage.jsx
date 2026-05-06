// ================================================================
// AI CFO Dashboard (POLISH) — voice briefing + KPIs + recommendations
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import { useAuth } from "../../../context/AuthContext";
import {
  getAIPalette,
  getMoneyPalette,
  getSuccessPalette,
  getAlertPalette,
  getReportsPalette,
  getCustomerPalette,
  getBrandPalette,
  getPaletteById,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import { api, localStore, KEYS, fmtCurrencyExact, convertFx } from "../cash/cashApi";

const SEVERITY_PALETTE = { LOW: "cyan", MEDIUM: "amber", CRITICAL: "rose" };

export default function AICfoPage({ onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("ai-finance");
  const { user } = useAuth();
  const ai = getAIPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const reports = getReportsPalette();
  const customer = getCustomerPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [speaking, setSpeaking] = useState(false);
  const [dismissed, setDismissed] = useState(new Set());
  const [accounts, setAccounts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    setAccounts(localStore.list(KEYS.cashAccounts));
    api("/api/invoices?limit=200").then((r) => {
      setInvoices(r?.data?.invoices || r?.data?.items || r?.data || []);
    });
    setPurchases(localStore.list("zyrix_purchase_invoices_v1"));
    setDismissed(new Set(localStore.list(KEYS.cfoDismissed).map((d) => d.id)));
  }, []);

  const cashTry = useMemo(
    () => accounts.reduce((s, a) => s + convertFx(a.balance, a.currency, "TRY"), 0),
    [accounts]
  );
  const monthBurn = useMemo(() => {
    const now = new Date();
    const monthExp = purchases
      .filter((p) => {
        const d = new Date(p.createdAt || 0);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, p) => s + Number(p.total || 0), 0);
    return Math.max(monthExp, 25000);
  }, [purchases]);
  const runwayDays = useMemo(() => Math.round((cashTry / Math.max(1, monthBurn)) * 30), [cashTry, monthBurn]);

  const recommendations = useMemo(() => {
    const overdue = (invoices || []).filter((i) => i.status !== "PAID" && i.dueDate && new Date(i.dueDate) < new Date());
    const items = [];
    if (overdue.length > 0) {
      const top = overdue.sort((a, b) => Number(b.total || 0) - Number(a.total || 0))[0];
      items.push({
        id: "rec-overdue",
        severity: "CRITICAL",
        icon: "📞",
        title: `${top.customerName || "Müşteri"} ödemesini ${Math.abs(Math.round((new Date(top.dueDate) - new Date()) / 86400000))} gündür geciktiriyor`,
        action: "Müşteriyi şimdi ara veya WhatsApp gönder",
        impact: `+${fmtCurrencyExact(top.total, top.currency)}`,
      });
    }
    if (cashTry > 50000) {
      const pct = 0.3;
      const moveAmt = Math.round(cashTry * pct);
      items.push({
        id: "rec-fx-hedge",
        severity: "MEDIUM",
        icon: "💱",
        title: `Nakdin %30'unu USD/EUR olarak tut → ~${fmtCurrencyExact(moveAmt)} hedge`,
        action: "Bir döviz hesabına transfer et",
        impact: `~%${Math.round(0.42 * pct * 100)} enflasyon koruması`,
      });
    }
    if (monthBurn > cashTry * 0.4) {
      items.push({
        id: "rec-trim-burn",
        severity: "MEDIUM",
        icon: "✂️",
        title: "Aylık yakım hızı nakdin %40'ından fazla — gider kategorilerini gözden geçir",
        action: "Gider raporunu aç",
        impact: "+30 gün runway",
      });
    }
    return items;
  }, [invoices, cashTry, monthBurn]);

  const visibleRecs = recommendations.filter((r) => !dismissed.has(r.id));

  const dismiss = (id) => {
    localStore.add(KEYS.cfoDismissed, { id });
    setDismissed((s) => new Set([...s, id]));
  };

  const briefing =
    `${t("cfo.briefing.greeting").replace("{name}", user?.name || "")}` +
    " " +
    t("cfo.briefing.cash")
      .replace("{cash}", fmtCurrencyExact(cashTry, "TRY"))
      .replace("{burn}", fmtCurrencyExact(monthBurn, "TRY"))
      .replace("{days}", runwayDays) +
    " " +
    t("cfo.briefing.action").replace("{count}", visibleRecs.length);

  const speak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(briefing);
    utter.lang = lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR";
    utter.rate = 1.0;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
    setSpeaking(true);
  };

  const runwayPalette = runwayDays < 15 ? alert : runwayDays < 30 ? getPaletteById("amber") : success;

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("cfo.title")} subtitle={t("cfo.subtitle")} icon="🤖" palette={ai} />

      {/* Hero — voice briefing */}
      <div
        style={{
          background: `linear-gradient(135deg, ${ai.bg}, ${customer.bg})`,
          border: `1px solid ${ai.base}25`,
          borderRadius: 18,
          padding: 22,
          marginBottom: 18,
          display: "flex",
          gap: 18,
          alignItems: "center",
          flexWrap: "wrap",
          animation: "heroIn .5s ease",
        }}
      >
        <button
          type="button"
          onClick={speak}
          aria-label={speaking ? t("cfo.voice.stop") : t("cfo.voice.play")}
          style={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${ai.base}, ${brand.base})`,
            color: "#fff",
            border: "none",
            fontSize: 28,
            cursor: "pointer",
            boxShadow: `0 8px 24px ${ai.base}50`,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            position: "relative",
            animation: speaking ? "voicePulse 1.4s ease-in-out infinite" : "none",
          }}
        >
          {speaking ? "⏹" : "🔊"}
        </button>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 11, color: ai.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
            {speaking ? `🎙 ${t("cfo.voice.speaking")}` : "AI Briefing"}
          </div>
          <div style={{ fontSize: 14, color: "#0F172A", lineHeight: 1.6 }}>{briefing}</div>
          {speaking && (
            <div style={{ marginTop: 8, display: "flex", gap: 4, alignItems: "center" }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 4,
                    background: ai.base,
                    borderRadius: 2,
                    animation: `wave 1s ease-in-out ${i * 0.1}s infinite`,
                  }}
                />
              ))}
            </div>
          )}
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
        className="cash-kpi-grid"
      >
        <KpiCard label={t("cfo.kpi.cash")} value={Math.round(cashTry)} prefix="₺" palette={money} icon="💰" />
        <KpiCard label={t("cfo.kpi.burn")} value={Math.round(monthBurn)} prefix="₺" palette={alert} icon="🔥" />
        <KpiCard label={t("cfo.kpi.runway")} value={runwayDays} suffix="d" palette={runwayPalette} icon="🛬" pulse={runwayDays < 30} />
      </div>

      {/* Recommendations */}
      <Card palette={ai} title={t("cfo.recommendations")} icon="💡" style={{ marginBottom: 18 }}>
        {visibleRecs.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", color: success.dark, fontSize: 14, fontWeight: 700 }}>
            {t("cfo.empty")}
          </div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {visibleRecs.map((rec) => {
              const palette = getPaletteById(SEVERITY_PALETTE[rec.severity]);
              return (
                <li
                  key={rec.id}
                  style={{
                    background: "#fff",
                    border: `1.5px solid ${palette.base}30`,
                    borderRadius: 14,
                    padding: 14,
                    marginBottom: 10,
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    boxShadow: `0 2px 8px ${palette.base}10`,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: palette.bg,
                      color: palette.dark,
                      display: "grid",
                      placeItems: "center",
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                  >
                    {rec.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 4 }}>{rec.title}</div>
                    <div style={{ fontSize: 11, color: "#64748B", display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <span>↳ {rec.action}</span>
                      <span style={{ color: palette.dark, fontWeight: 700 }}>{rec.impact}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button type="button" style={btn(palette, "primary")}>
                      ✓ {t("cfo.action.take")}
                    </button>
                    <button type="button" onClick={() => dismiss(rec.id)} style={btn(palette, "secondary")}>
                      ✗
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Forecast preview link */}
      <Card palette={brand} title="🔮 Cashflow Forecast" icon="📈" style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, color: "#475569", marginBottom: 6 }}>
              90 günlük güven aralıklı tahmin · AI destekli
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: brand.base, fontFamily: "monospace" }}>
              {runwayDays}d <span style={{ fontSize: 13, color: "#94A3B8", fontWeight: 600 }}>· {t("forecast.kpi.runway")}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate("af-forecast")}
            style={{
              background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`,
              color: "#fff",
              border: "none",
              padding: "10px 18px",
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: `0 4px 12px ${brand.base}40`,
            }}
          >
            {t("cfo.viewForecast")}
          </button>
        </div>
      </Card>

      <style>{`
        @media (max-width: 720px) { .cash-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @keyframes heroIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes voicePulse { 0%,100% { box-shadow: 0 0 0 0 ${ai.base}80; } 70% { box-shadow: 0 0 0 14px ${ai.base}00; } }
        @keyframes wave {
          0%,100% { height: 6px; }
          50% { height: 18px; }
        }
      `}</style>
    </div>
  );
}

function btn(palette, variant) {
  if (variant === "primary") {
    return {
      background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
      color: "#fff",
      border: "none",
      padding: "8px 14px",
      borderRadius: 10,
      fontSize: 12,
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: `0 4px 12px ${palette.base}30`,
      whiteSpace: "nowrap",
    };
  }
  return {
    background: palette.bg,
    color: palette.dark,
    border: `1px solid ${palette.base}40`,
    padding: "8px 14px",
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  };
}
