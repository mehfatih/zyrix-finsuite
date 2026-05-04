// ================================================================
// TabletMockup — Landscape tablet showing Zyrix FinSuite dashboard
// ================================================================

import React from "react";
import { useI18n } from "../../i18n/i18n";

const C = {
  white: "#FFFFFF",
  red: "#E30A17",
  redDeep: "#B8050F",
  redSoft: "#FF8A8A",
  redBright: "#FF3B30",
  emerald: "#10B981",
  hairline: "rgba(255,255,255,0.06)",
};

function NavIcon({ d, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...rest}>
      {d}
    </svg>
  );
}

const ICONS = {
  dashboard: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>,
  invoices: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></>,
  customers: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></>,
  payments: <><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></>,
  quotes: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
  reports: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>,
  ai: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26" />,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></>,
  search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
  bell: <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></>,
  plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
};

export default function TabletMockup() {
  const { t } = useI18n();

  const sidebarItems = [
    { key: "dashboard", icon: ICONS.dashboard, label: t("lv2.dash.dashboard"), active: true },
    { key: "invoices",  icon: ICONS.invoices,  label: t("lv2.dash.invoices") },
    { key: "customers", icon: ICONS.customers, label: t("lv2.dash.customers") },
    { key: "payments",  icon: ICONS.payments,  label: t("lv2.dash.payments") },
    { key: "quotes",    icon: ICONS.quotes,    label: t("lv2.dash.quotes") },
    { key: "reports",   icon: ICONS.reports,   label: t("lv2.dash.reports") },
    { key: "ai",        icon: ICONS.ai,        label: t("lv2.dash.ai") },
    { key: "settings",  icon: ICONS.settings,  label: t("lv2.dash.settings") },
  ];

  const kpis = [
    { label: t("lv2.kpi.revenue"),    value: "₺1.250.000", trend: "↑ 11.6%", up: true },
    { label: t("lv2.kpi.pending"),    value: "₺245.000",   trend: "↓ 14.2%", up: false },
    { label: t("lv2.kpi.invoices"),   value: "1.246",      trend: "↑ 12.8%", up: true },
    { label: t("lv2.kpi.conversion"), value: "%24.8",      trend: "↑ 16.5%", up: true },
  ];

  const upcoming = [
    { name: "ABC Ltd. Şti.",     date: "10 May 2024", amount: "₺25.000" },
    { name: "XYZ A.Ş.",          date: "15 May 2024", amount: "₺13.600" },
    { name: "ORT Yazılım",       date: "16 May 2024", amount: "₺8.300" },
    { name: "EGO Danışmanlık",   date: "16 May 2024", amount: "₺7.600" },
  ];

  return (
    <div style={{ position: "relative", zIndex: 11 }}>
      {/* Glow behind tablet */}
      <div style={{
        position: "absolute",
        inset: -40,
        background: "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(227, 10, 23, 0.45), transparent 70%)",
        filter: "blur(70px)",
        zIndex: 0,
      }} />

      {/* Tablet aluminum bezel */}
      <div style={{
        position: "relative",
        zIndex: 1,
        background: "linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #2a2a2a 100%)",
        borderRadius: 24,
        padding: "14px 18px",
        aspectRatio: "16 / 10.5",
        boxShadow: `
          0 30px 60px rgba(0, 0, 0, 0.6),
          0 60px 120px rgba(42, 3, 6, 0.7),
          inset 0 0 0 1px rgba(255, 255, 255, 0.08),
          inset 0 1px 0 rgba(255, 255, 255, 0.15),
          inset 0 -1px 0 rgba(0, 0, 0, 0.5),
          inset 2px 0 4px rgba(255, 255, 255, 0.04),
          inset -2px 0 4px rgba(255, 255, 255, 0.04),
          0 0 0 1px rgba(50, 10, 15, 0.5)
        `,
        transform: "perspective(2400px) rotateY(-3deg) rotateX(1deg) rotate(0.3deg)",
        transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        {/* Front camera dot */}
        <div style={{
          position: "absolute",
          top: 5,
          left: "50%",
          transform: "translateX(-50%)",
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "radial-gradient(circle at 30% 30%, #1a1a1a, #000)",
          boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.15), 0 0 4px rgba(0, 0, 0, 0.8)",
        }} />

        {/* Screen */}
        <div style={{
          position: "relative",
          height: "100%",
          background: `
            linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, transparent 12%),
            radial-gradient(ellipse 100% 80% at 50% 50%, #1f0407 0%, #150305 60%, #0a0203 100%)
          `,
          borderRadius: 6,
          padding: "14px 16px",
          display: "grid",
          gridTemplateColumns: "158px 1fr",
          gap: 12,
          border: "1px solid rgba(0, 0, 0, 0.6)",
          boxShadow: `
            inset 0 0 60px rgba(227, 10, 23, 0.08),
            inset 0 0 0 1px rgba(255, 255, 255, 0.04),
            inset 0 2px 8px rgba(0, 0, 0, 0.6)
          `,
          overflow: "hidden",
        }}>
          {/* Top glare */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 4%, transparent 10%)",
            pointerEvents: "none",
            zIndex: 100,
            borderRadius: 6,
          }} />
          {/* Diagonal sweep glare */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "60%",
            background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.025) 45%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.025) 55%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 99,
            borderRadius: "6px 6px 0 0",
          }} />

          {/* SIDEBAR */}
          <div style={{
            background: "rgba(255, 255, 255, 0.02)",
            border: "1px solid rgba(255, 255, 255, 0.04)",
            borderRadius: 14,
            padding: "12px 8px",
            position: "relative",
            zIndex: 2,
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 8px 14px",
              borderBottom: `1px solid ${C.hairline}`,
              marginBottom: 10,
              fontSize: 11,
              fontWeight: 800,
              color: "white",
            }}>
              <div style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: `linear-gradient(135deg, ${C.red}, ${C.redDeep})`,
                display: "grid",
                placeItems: "center",
                fontSize: 10,
                fontWeight: 900,
                color: "white",
                boxShadow: `0 4px 10px rgba(227, 10, 23, 0.5)`,
              }}>Z</div>
              <span>Zyrix FinSuite</span>
            </div>

            {sidebarItems.map(item => (
              <div key={item.key} style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: item.active ? "7px 8px 7px 10px" : "7px 10px",
                marginBottom: 2,
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 500,
                color: item.active ? "white" : "rgba(255, 255, 255, 0.55)",
                background: item.active ? "linear-gradient(90deg, rgba(227, 10, 23, 0.2), rgba(227, 10, 23, 0.05))" : "transparent",
                borderLeft: item.active ? `2px solid ${C.red}` : "none",
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13, opacity: 0.75 }}>
                  {item.icon}
                </svg>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          {/* MAIN */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            minWidth: 0,
            position: "relative",
            zIndex: 2,
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "white",
                  textShadow: "0 0 3px rgba(255, 255, 255, 0.2)",
                }}>{t("lv2.dash.hello")}</div>
                <div style={{
                  color: "rgba(255,255,255,0.55)",
                  fontWeight: 400,
                  fontSize: 11,
                  marginTop: 2,
                }}>{t("lv2.dash.greeting")}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{
                  width: 28, height: 28,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  display: "grid",
                  placeItems: "center",
                  color: "rgba(255,255,255,0.7)",
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                    {ICONS.search}
                  </svg>
                </div>
                <div style={{
                  width: 28, height: 28,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  display: "grid",
                  placeItems: "center",
                  color: "rgba(255,255,255,0.7)",
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                    {ICONS.bell}
                  </svg>
                </div>
                <button style={{
                  background: `linear-gradient(135deg, ${C.red}, ${C.redDeep})`,
                  color: "white",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "7px 12px",
                  borderRadius: 8,
                  border: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  cursor: "pointer",
                  boxShadow: `0 4px 12px rgba(227, 10, 23, 0.4)`,
                }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" style={{ width: 11, height: 11 }}>
                    {ICONS.plus}
                  </svg>
                  <span>{t("lv2.dash.newInvoice")}</span>
                </button>
              </div>
            </div>

            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {kpis.map(kpi => (
                <div key={kpi.label} style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: 12,
                  padding: "10px 12px",
                }}>
                  <div style={{
                    fontSize: 9,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "rgba(255, 255, 255, 0.5)",
                    marginBottom: 4,
                  }}>{kpi.label}</div>
                  <div style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "white",
                    letterSpacing: "-0.02em",
                    marginBottom: 4,
                    textShadow: "0 0 1px rgba(255, 255, 255, 0.4), 0 0 8px rgba(255, 255, 255, 0.15), 0 0 14px rgba(255, 100, 100, 0.1)",
                  }}>{kpi.value}</div>
                  <div style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: C.redSoft,
                    textShadow: "0 0 6px rgba(255, 107, 107, 0.5)",
                  }}>{kpi.trend}</div>
                </div>
              ))}
            </div>

            {/* Chart + List */}
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 10 }}>
              {/* Chart */}
              <div style={{
                background: "linear-gradient(135deg, rgba(227, 10, 23, 0.10) 0%, rgba(58, 5, 9, 0.35) 60%, rgba(0, 0, 0, 0.5) 100%)",
                border: "1px solid rgba(227, 10, 23, 0.15)",
                borderRadius: 12,
                padding: 14,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{t("lv2.chart.title")}</div>
                  <span style={{
                    fontSize: 10,
                    background: "rgba(255,255,255,0.08)",
                    padding: "4px 9px",
                    borderRadius: 100,
                    color: "rgba(255,255,255,0.75)",
                    fontWeight: 500,
                  }}>{t("lv2.chart.thisYear")}</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 8 }}>
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    fontSize: 8,
                    color: "rgba(255, 255, 255, 0.35)",
                    textAlign: "right",
                    padding: "2px 0",
                    fontFamily: "monospace",
                  }}>
                    <span>1.5M</span>
                    <span>1M</span>
                    <span>500K</span>
                    <span>0</span>
                  </div>
                  <svg viewBox="0 0 280 110" preserveAspectRatio="none" style={{ width: "100%", height: 110 }}>
                    <defs>
                      <linearGradient id="chartFillV2" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#E30A17" stopOpacity="0.55" />
                        <stop offset="100%" stopColor="#E30A17" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="chartLineV2" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor="#FF8A8A" />
                        <stop offset="50%" stopColor="#FF3B30" />
                        <stop offset="100%" stopColor="#E30A17" />
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="27.5" x2="280" y2="27.5" stroke="rgba(255,255,255,0.05)" strokeDasharray="2,3" />
                    <line x1="0" y1="55" x2="280" y2="55" stroke="rgba(255,255,255,0.05)" strokeDasharray="2,3" />
                    <line x1="0" y1="82.5" x2="280" y2="82.5" stroke="rgba(255,255,255,0.05)" strokeDasharray="2,3" />

                    <path d="M0,90 L25,82 L50,68 L75,75 L100,55 L125,62 L150,42 L175,48 L200,30 L225,22 L250,12 L280,8 L280,110 L0,110 Z" fill="url(#chartFillV2)" />
                    <path d="M0,90 L25,82 L50,68 L75,75 L100,55 L125,62 L150,42 L175,48 L200,30 L225,22 L250,12 L280,8" fill="none" stroke="url(#chartLineV2)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

                    <circle cx="280" cy="8" r="9" fill="#FF3B30" opacity="0.25" />
                    <circle cx="280" cy="8" r="5" fill="#FF3B30" opacity="0.4" />
                    <circle cx="280" cy="8" r="3" fill="#FF3B30" />
                  </svg>
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 8,
                  color: "rgba(255, 255, 255, 0.4)",
                  marginTop: 6,
                  marginLeft: 36,
                  fontFamily: "monospace",
                }}>
                  <span>Oca</span><span>Şub</span><span>Mar</span><span>Nis</span><span>May</span><span>Haz</span>
                  <span>Tem</span><span>Ağu</span><span>Eyl</span><span>Eki</span><span>Kas</span><span>Ara</span>
                </div>
              </div>

              {/* List */}
              <div style={{
                background: "rgba(255, 255, 255, 0.025)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                borderRadius: 12,
                padding: 14,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{t("lv2.list.upcoming")}</div>
                  <span style={{ fontSize: 10, color: C.redSoft, fontWeight: 600 }}>{t("lv2.list.all")}</span>
                </div>
                {upcoming.map((row, i) => (
                  <div key={i} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: i < upcoming.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                      <span style={{
                        color: "rgba(255,255,255,0.95)",
                        fontWeight: 600,
                        fontSize: 11,
                        textShadow: "0 0 4px rgba(255, 255, 255, 0.1)",
                      }}>{row.name}</span>
                      <span style={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: 9,
                        fontFamily: "monospace",
                      }}>{row.date}</span>
                    </div>
                    <span style={{
                      color: "white",
                      fontWeight: 700,
                      fontSize: 13.5,
                      textShadow: "0 0 1px rgba(255, 255, 255, 0.3), 0 0 6px rgba(255, 100, 100, 0.15)",
                    }}>{row.amount}</span>
                  </div>
                ))}
                <div style={{
                  textAlign: "center",
                  fontSize: 10,
                  color: C.redSoft,
                  marginTop: 8,
                  fontWeight: 600,
                  paddingTop: 6,
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                }}>{t("lv2.list.more")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tablet hover effect via global animation */}
      <style>{`
        @keyframes flagWaveV2 {
          0%, 100% { transform: scale(1) translateY(0); opacity: 0.18; }
          50% { transform: scale(1.02) translateY(-8px); opacity: 0.22; }
        }
      `}</style>
    </div>
  );
}