// ================================================================
// Dashboard Home — hero greeting + AI briefing + KPI grid + charts
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import { useAuth } from "../../context/AuthContext";
import {
  getCardPalette,
  getMoneyPalette,
  getCustomerPalette,
  getAIPalette,
  getReportsPalette,
  getSuccessPalette,
  getWarningPalette,
  getBrandPalette,
} from "../../utils/dashboardPalette";
import PageHeader from "../../components/dashboard/PageHeader";
import KpiCard from "../../components/dashboard/KpiCard";
import Card from "../../components/dashboard/Card";
import EmptyState from "../../components/dashboard/EmptyState";
import {
  AreaChart,
  BarChart,
  ConfidenceBand,
  CalendarHeatmap,
  PulseRings,
} from "../../components/dashboard/charts";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("zyrix_token");
  try {
    const res = await fetch(`${API}${path}`, {
      ...opts,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts.headers || {}),
      },
    });
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}

function pickGreetingKey() {
  const h = new Date().getHours();
  if (h < 12) return "greeting.morning";
  if (h < 18) return "greeting.afternoon";
  return "greeting.evening";
}

// ---- Typing animation ------------------------------
function TypingText({ text, speed = 18, palette }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return (
    <span style={{ color: palette?.dark || "#1F2937", lineHeight: 1.55 }}>
      {shown}
      {shown.length < (text || "").length && (
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: 14,
            background: palette?.base || "#6C3AFF",
            verticalAlign: "middle",
            marginLeft: 2,
            animation: "tcurs 1s steps(2) infinite",
          }}
        />
      )}
      <style>{`@keyframes tcurs{50%{opacity:0}}`}</style>
    </span>
  );
}

// ---- Activity feed item ----------------------------
function FeedItem({ item, palette }) {
  return (
    <li
      style={{
        display: "flex",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid #F1F5F9",
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: palette.bg,
          color: palette.base,
          display: "grid",
          placeItems: "center",
          fontSize: 14,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {item.icon || "•"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{item.title}</div>
        {item.detail && <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{item.detail}</div>}
      </div>
      {item.time && <div style={{ fontSize: 11, color: "#94A3B8", flexShrink: 0 }}>{item.time}</div>}
    </li>
  );
}

// ---- Page -----------------------------------------
export default function DashboardHome() {
  const { lang } = useI18n();
  const dt = useDashboardI18n("home");
  const { user } = useAuth();
  const locale = lang.toLowerCase();
  const brand = getBrandPalette(locale);

  const [summary, setSummary] = useState(null);
  const [aiText, setAiText] = useState("");

  useEffect(() => {
    let alive = true;
    apiFetch("/api/dashboard").then((res) => {
      if (alive && res) setSummary(res?.data ?? res);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    apiFetch("/api/ai/insight", {
      method: "POST",
      body: JSON.stringify({ context: "dashboard home", prompt: "Give one sentence morning brief based on cash flow and outstanding invoices.", data: summary }),
    }).then((res) => {
      const txt = res?.data?.insight || res?.insight;
      if (alive) setAiText(txt || dt("ai.fallback"));
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary, lang]);

  // Demo-friendly fallback data when API is unavailable
  const data = useMemo(() => {
    const months12 = Array.from({ length: 12 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (11 - i));
      return d.toLocaleDateString(locale === "ar" ? "ar" : "en", { month: "short" });
    });
    const revenueSeries = months12.map((m, i) => ({
      label: m,
      value: 18000 + i * 1400 + Math.round(Math.sin(i) * 2200) + Math.round(Math.random() * 1500),
    }));
    const topCustomers = [
      { label: "Atlas Tekstil",  value: 58400 },
      { label: "Sahra Trade",    value: 42100 },
      { label: "Nile Holdings",  value: 36800 },
      { label: "Marmara Lojistik", value: 29500 },
      { label: "Levant Foods",   value: 21200 },
    ];
    const cashflow = Array.from({ length: 13 }, (_, i) => {
      const week = i === 0 ? "now" : `+${i}w`;
      const base = 24000 + i * 1300 + Math.sin(i * 0.7) * 2200;
      return {
        label: week,
        value: Math.round(base),
        low:   Math.round(base - 3500 - i * 250),
        high:  Math.round(base + 3500 + i * 250),
      };
    });
    const today = new Date();
    const tax = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      return {
        date: d.toISOString().slice(0, 10),
        value: [3, 8, 15, 20, 26].includes(i) ? Math.round(Math.random() * 3) + 1 : 0,
      };
    });
    const heat = Array.from({ length: 365 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (364 - i));
      const v = Math.random() < 0.55 ? Math.round(Math.random() * 6) : 0;
      return { date: d.toISOString().slice(0, 10), value: v };
    });
    return {
      revenue: summary?.revenueSeries || revenueSeries,
      revenueTotal: summary?.monthlyRevenue ?? revenueSeries[revenueSeries.length - 1].value,
      activeCustomers: summary?.activeCustomers ?? 248,
      invoicesThisMonth: summary?.invoicesThisMonth ?? 36,
      activeSessions: summary?.activeSessions ?? 4,
      topCustomers: summary?.topCustomers || topCustomers,
      cashflow: summary?.cashflow || cashflow,
      tax,
      heat,
      feed: summary?.feed || [
        { icon: "💰", title: "Atlas Tekstil paid invoice INV-2451", detail: "₺ 12,400 received via Garanti", time: "2h" },
        { icon: "📤", title: "AI suggested follow-up to Levant Foods", detail: "Predicted close +14%", time: "5h" },
        { icon: "📈", title: "Revenue forecast updated", detail: "Q3 +6.4% vs prior model", time: "1d" },
        { icon: "🧾", title: "E-Fatura batch sent", detail: "12 invoices to GIB", time: "1d" },
      ],
    };
  }, [summary, locale]);

  const greetingName = user?.name || user?.fullName || user?.email?.split("@")[0] || "";
  const greeting = `${dt(pickGreetingKey())}${greetingName ? ", " + greetingName : ""}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title={greeting}
        subtitle={dt("greeting.subtitle")}
        palette={brand}
        icon={lang === "AR" ? "☀️" : "👋"}
      />

      {/* AI Briefing card — full width */}
      <Card palette={getAIPalette()} icon="🤖" title={dt("ai.title")} subtitle={new Date().toLocaleDateString(locale === "ar" ? "ar" : "en", { weekday: "long", month: "long", day: "numeric" })}>
        <div style={{ minHeight: 44, fontSize: 14 }}>
          {aiText
            ? <TypingText text={aiText} palette={getAIPalette()} />
            : <span style={{ color: "#94A3B8" }}>{dt("ai.fallback")}</span>}
        </div>
      </Card>

      {/* KPI hero row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        <KpiCard
          label={dt("kpi.revenue")}
          value={data.revenueTotal}
          prefix={lang === "AR" ? "" : "₺"}
          suffix={lang === "AR" ? " ﷼" : ""}
          trend="+12.5%"
          trendLabel={dt("trend.vsLastMonth")}
          spark={data.revenue.map((d) => d.value)}
          icon="💵"
          palette={getMoneyPalette()}
        />
        <KpiCard
          label={dt("kpi.customers")}
          value={data.activeCustomers}
          trend="+4.1%"
          trendLabel={dt("trend.vsLastMonth")}
          spark={[210, 215, 219, 226, 230, 238, 242, 248]}
          icon="👥"
          palette={getCustomerPalette()}
        />
        <KpiCard
          label={dt("kpi.invoices")}
          value={data.invoicesThisMonth}
          trend="-2.0%"
          trendLabel={dt("trend.vsLastMonth")}
          spark={[28, 31, 34, 32, 30, 35, 37, 36]}
          icon="🧾"
          palette={getReportsPalette()}
        />
        <KpiCard
          label={dt("kpi.live")}
          value={data.activeSessions}
          icon="📡"
          palette={getSuccessPalette()}
          pulse
        />
      </div>

      {/* Row 2: Revenue + Top customers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        <Card palette={getCardPalette(1)} icon="📈" title={dt("card.revenue.title")} subtitle={dt("card.revenue.subtitle")}>
          <AreaChart data={data.revenue} palette={getCardPalette(1)} height={220} />
        </Card>
        <Card palette={getCustomerPalette()} icon="🏆" title={dt("card.topcustomers.title")} subtitle={dt("card.topcustomers.subtitle")}>
          <BarChart data={data.topCustomers} palette={getCustomerPalette()} horizontal height={260} />
        </Card>
      </div>

      {/* Row 3: Cashflow + Tax calendar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        <Card palette={getAIPalette()} icon="🌊" title={dt("card.cashflow.title")} subtitle={dt("card.cashflow.subtitle")}>
          <ConfidenceBand data={data.cashflow} palette={getAIPalette()} height={220} />
        </Card>
        <Card palette={getWarningPalette()} icon="📅" title={dt("card.taxcalendar.title")} subtitle={dt("card.taxcalendar.subtitle")}>
          <CalendarHeatmap data={data.tax} palette={getWarningPalette()} mode="month" />
        </Card>
      </div>

      {/* Row 4: Activity heatmap (year) + Recent feed */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        <Card palette={getCardPalette(8)} icon="🔥" title={dt("card.activity.title")} subtitle={dt("card.activity.subtitle")}>
          <CalendarHeatmap data={data.heat} palette={getCardPalette(8)} weeks={53} />
        </Card>
        <Card palette={getCardPalette(5)} icon="📜" title={dt("card.feed.title")}>
          {data.feed.length === 0 ? (
            <EmptyState title={dt("card.feed.empty")} palette={getCardPalette(5)} size="compact" />
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {data.feed.map((it, i) => (
                <FeedItem key={i} item={it} palette={getCardPalette(5)} />
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
