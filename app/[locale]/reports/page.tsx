"use client";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://zyrix-backend-production.up.railway.app";
const font = "'DM Sans', 'Outfit', system-ui, sans-serif";
const C = {
  primary: "#D4820A", bg: "#FDF3E3", bgAlt: "#FFF8F0", bgCard: "#FFFFFF",
  border: "#F5D5A0", text: "#1A0E00", textMid: "#4A3010", textLight: "#7A5828",
  success: "#059669", successBg: "#ECFDF5",
  blue: "#0891B2", blueBg: "#ECFEFF",
  purple: "#7C3AED", purpleBg: "#F3EEFF",
  danger: "#DC2626",
};

const DEMO_REVENUE = Array.from({ length: 12 }, (_, i) => ({
  label: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  value: 40000 + Math.round(Math.random() * 30000 + i * 2000),
}));

const DEMO_EXPENSES = Array.from({ length: 12 }, (_, i) => ({
  label: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  value: 15000 + Math.round(Math.random() * 10000 + i * 500),
}));

const DEMO_TAX = [
  { country: "🇸🇦 Saudi Arabia", type: "VAT 15%", amount: 18200, currency: "SAR", due: "Jan 31" },
  { country: "🇹🇷 Turkey", type: "KDV 20%", amount: 42800, currency: "TRY", due: "Jan 26" },
  { country: "🇦🇪 UAE", type: "VAT 5%", amount: 3400, currency: "AED", due: "Feb 5" },
];

const DEMO_CASHFLOW = Array.from({ length: 12 }, (_, i) => ({
  label: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  inflow: 50000 + Math.round(Math.random() * 20000 + i * 1500),
  outflow: 20000 + Math.round(Math.random() * 8000 + i * 400),
}));

export default function ReportsPage() {
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  const dir = locale === "ar" ? "rtl" : "ltr";
  function L(en: string, ar: string, tr: string): string {
    return locale === "ar" ? ar : locale === "tr" ? tr : en;
  }

  const [tab, setTab] = useState("revenue");
  const [period, setPeriod] = useState("30d");
  const [revenueData] = useState(DEMO_REVENUE);
  const [expensesData] = useState(DEMO_EXPENSES);
  const [taxData] = useState(DEMO_TAX);
  const [cashflowData] = useState(DEMO_CASHFLOW);

  const tabs = [
    { key: "revenue", icon: "📈", label: L("Revenue", "الإيرادات", "Gelir") },
    { key: "expenses", icon: "📉", label: L("Expenses", "المصاريف", "Giderler") },
    { key: "tax", icon: "🧾", label: L("Tax", "الضرائب", "Vergi") },
    { key: "cashflow", icon: "💵", label: L("Cash Flow", "التدفق النقدي", "Nakit Akış") },
  ];

  const kpis = {
    revenue: [
      { label: L("Total Revenue", "إجمالي الإيرادات", "Toplam Gelir"), value: "$124,800", delta: "+23%", up: true, color: C.success },
      { label: L("Avg Monthly", "متوسط شهري", "Aylık Ortalama"), value: "$10,400", delta: "+8%", up: true, color: C.primary },
      { label: L("Best Month", "أفضل شهر", "En İyi Ay"), value: "$18,200", delta: "Dec", up: true, color: C.blue },
      { label: L("Growth Rate", "معدل النمو", "Büyüme Oranı"), value: "23%", delta: "YoY", up: true, color: C.purple },
    ],
    expenses: [
      { label: L("Total Expenses", "إجمالي المصاريف", "Toplam Giderler"), value: "$48,200", delta: "+5%", up: false, color: C.danger },
      { label: L("Avg Monthly", "متوسط شهري", "Aylık Ortalama"), value: "$4,017", delta: "-2%", up: true, color: C.primary },
      { label: L("Largest Category", "أكبر فئة", "En Büyük Kategori"), value: "Ops", delta: "38%", up: false, color: C.blue },
      { label: L("Net Profit Margin", "هامش الربح", "Net Kar Marjı"), value: "61%", delta: "+3%", up: true, color: C.success },
    ],
    tax: [
      { label: L("Total VAT Due", "إجمالي VAT المستحق", "Toplam VAT Vadesi"), value: "$12,400", delta: "3 regions", up: false, color: C.danger },
      { label: L("KDV Due", "KDV المستحق", "KDV Vadesi"), value: "₺42,800", delta: "Jan 26", up: false, color: "#D97706" },
      { label: L("ZATCA Status", "حالة ZATCA", "ZATCA Durumu"), value: "✓", delta: "Compliant", up: true, color: C.success },
      { label: L("Next Filing", "الإيداع القادم", "Sonraki Beyan"), value: "Jan 26", delta: "12 days", up: false, color: C.blue },
    ],
    cashflow: [
      { label: L("Net Cash Flow", "صافي التدفق", "Net Nakit Akış"), value: "$76,600", delta: "+18%", up: true, color: C.success },
      { label: L("Total Inflow", "إجمالي الداخل", "Toplam Giriş"), value: "$124,800", delta: "+23%", up: true, color: C.primary },
      { label: L("Total Outflow", "إجمالي الخارج", "Toplam Çıkış"), value: "$48,200", delta: "+5%", up: false, color: C.danger },
      { label: L("Runway", "المدى", "Süre"), value: "14 mo", delta: "stable", up: true, color: C.blue },
    ],
  };

  // SVG bar chart
  const BarChart = ({ data, color, valueKey = "value" }: { data: { label: string; value?: number; inflow?: number; outflow?: number }[]; color: string; valueKey?: string }) => {
    const vals = data.map(d => (d as Record<string, number>)[valueKey] || 0);
    const maxV = Math.max(...vals, 1);
    const W = 700, H = 160, barW = Math.floor((W - 40) / data.length) - 6;
    return (
      <svg viewBox={`0 0 ${W} ${H + 24}`} style={{ width: "100%", height: 180, overflow: "visible" }}>
        {[0.25, 0.5, 0.75, 1].map(f => {
          const y = (1 - f) * H;
          return <line key={f} x1="0" y1={y} x2={W} y2={y} stroke="#F1EEE8" strokeWidth="1" />;
        })}
        {data.map((d, i) => {
          const v = (d as Record<string, number>)[valueKey] || 0;
          const bh = (v / maxV) * H;
          const x = 20 + i * (barW + 6);
          return (
            <g key={i}>
              <rect x={x} y={H - bh} width={barW} height={bh} rx="4" fill={color} opacity="0.85" />
              <text x={x + barW / 2} y={H + 18} fontSize="9" fill={C.textLight} textAnchor="middle" fontFamily={font} fontWeight="600">{d.label}</text>
            </g>
          );
        })}
      </svg>
    );
  };

  // Line chart for cash flow
  const LineChart = ({ data }: { data: { label: string; inflow: number; outflow: number }[] }) => {
    const W = 700, H = 150, pad = 20;
    const allVals = data.flatMap(d => [d.inflow, d.outflow]);
    const maxV = Math.max(...allVals, 1);
    const xs = data.map((_, i) => pad + (i / (data.length - 1)) * (W - pad * 2));
    const inflowYs = data.map(d => H - pad - (d.inflow / maxV) * (H - pad * 2));
    const outflowYs = data.map(d => H - pad - (d.outflow / maxV) * (H - pad * 2));
    const pathD = (ys: number[]) => xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
    const areaD = (ys: number[], path: string) => path + ` L${xs[xs.length - 1].toFixed(1)},${H} L${xs[0].toFixed(1)},${H} Z`;
    const inflowPath = pathD(inflowYs);
    const outflowPath = pathD(outflowYs);
    return (
      <svg viewBox={`0 0 ${W} ${H + 24}`} style={{ width: "100%", height: 175, overflow: "visible" }}>
        <defs>
          <linearGradient id="igr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.success} stopOpacity=".15" /><stop offset="100%" stopColor={C.success} stopOpacity="0" /></linearGradient>
          <linearGradient id="ogr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={C.danger} stopOpacity=".12" /><stop offset="100%" stopColor={C.danger} stopOpacity="0" /></linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map(f => <line key={f} x1="0" y1={(1 - f) * H} x2={W} y2={(1 - f) * H} stroke="#F1EEE8" strokeWidth="1" />)}
        <path fill="url(#igr)" d={areaD(inflowYs, inflowPath)} />
        <path fill="url(#ogr)" d={areaD(outflowYs, outflowPath)} />
        <path fill="none" stroke={C.success} strokeWidth="2" strokeLinecap="round" d={inflowPath} />
        <path fill="none" stroke={C.danger} strokeWidth="2" strokeLinecap="round" d={outflowPath} />
        {data.map((d, i) => (
          <text key={i} x={xs[i]} y={H + 18} fontSize="9" fill={C.textLight} textAnchor="middle" fontFamily={font} fontWeight="600">{d.label}</text>
        ))}
      </svg>
    );
  };

  const currentKpis = kpis[tab as keyof typeof kpis] || kpis.revenue;

  return (
    <div style={{ fontFamily: font, backgroundColor: C.bg, minHeight: "100vh" }} dir={dir}>
      <header style={{ backgroundColor: C.bgCard, borderBottom: `1.5px solid ${C.border}`, padding: "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a href={`/${locale}/dashboard`} style={{ fontSize: 13, color: C.primary, fontWeight: 700, textDecoration: "none" }}>← {L("Dashboard", "اللوحة", "Panel")}</a>
          <span style={{ color: C.border }}>/</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>📊 {L("Reports", "التقارير", "Raporlar")}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ padding: "7px 14px", borderRadius: 9, border: `1.5px solid ${C.border}`, backgroundColor: C.bgCard, fontFamily: font, fontSize: 12, fontWeight: 700, color: C.textMid, cursor: "pointer" }}>
            📥 {L("Export Excel", "تصدير Excel", "Excel Dışa Aktar")}
          </button>
          <button style={{ padding: "7px 14px", borderRadius: 9, border: `1.5px solid ${C.border}`, backgroundColor: C.bgCard, fontFamily: font, fontSize: 12, fontWeight: 700, color: C.textMid, cursor: "pointer" }}>
            📄 PDF
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>
        {/* Tab + Period row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 4, backgroundColor: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4 }}>
            {tabs.map((t, i) => (
              <button key={i} onClick={() => setTab(t.key)} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 16px", borderRadius: 9, border: "none", cursor: "pointer",
                fontFamily: font, fontSize: 13, fontWeight: 700,
                backgroundColor: tab === t.key ? C.primary : "transparent",
                color: tab === t.key ? "#FFFFFF" : C.textLight,
              }}>
                <span style={{ fontSize: 15 }}>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 4, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 10, padding: 3 }}>
            {["7d", "30d", "90d", "custom"].map((p, i) => (
              <button key={i} onClick={() => setPeriod(p)} style={{
                padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer",
                fontFamily: font, fontSize: 11, fontWeight: 700,
                backgroundColor: period === p ? C.primary : "transparent",
                color: period === p ? "#FFFFFF" : C.textLight,
              }}>{p}</button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
          {currentKpis.map((k, i) => (
            <div key={i} style={{ backgroundColor: C.bgCard, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "18px 20px", borderTop: `4px solid ${k.color}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textLight, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{k.label}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: k.color, marginBottom: 6 }}>{k.value}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: k.up ? C.success : C.danger, backgroundColor: k.up ? C.successBg : "#FEF2F2", padding: "2px 8px", borderRadius: 6, display: "inline-block" }}>
                {k.up ? "↑" : "↓"} {k.delta}
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div style={{ backgroundColor: C.bgCard, border: `1.5px solid ${C.border}`, borderRadius: 16, padding: "24px" }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: C.text, marginBottom: 20 }}>
            {tab === "revenue" && L("Monthly Revenue", "الإيرادات الشهرية", "Aylık Gelir")}
            {tab === "expenses" && L("Monthly Expenses", "المصاريف الشهرية", "Aylık Giderler")}
            {tab === "tax" && L("Tax Overview", "نظرة عامة على الضرائب", "Vergi Genel Bakış")}
            {tab === "cashflow" && L("Cash Flow Analysis", "تحليل التدفق النقدي", "Nakit Akış Analizi")}
          </div>

          {tab === "revenue" && <BarChart data={revenueData} color={C.primary} />}
          {tab === "expenses" && <BarChart data={expensesData} color={C.danger} />}
          {tab === "cashflow" && <LineChart data={cashflowData} />}
          {tab === "tax" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {taxData.map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", backgroundColor: C.bgAlt, borderRadius: 12, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 24, minWidth: 40 }}>{t.country.split(" ")[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{t.country.substring(3)}</div>
                    <div style={{ fontSize: 12, color: C.textLight }}>{t.type}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 900, fontSize: 18, color: C.primary }}>{t.amount.toLocaleString()} {t.currency}</div>
                    <div style={{ fontSize: 11, color: C.warning, fontWeight: 700 }}>{L("Due", "يستحق", "Vade")}: {t.due}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "cashflow" && (
            <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 3, backgroundColor: C.success, borderRadius: 2 }} />
                <span style={{ fontSize: 12, color: C.textLight, fontWeight: 600 }}>{L("Inflow", "داخل", "Giriş")}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 3, backgroundColor: C.danger, borderRadius: 2 }} />
                <span style={{ fontSize: 12, color: C.textLight, fontWeight: 600 }}>{L("Outflow", "خارج", "Çıkış")}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}