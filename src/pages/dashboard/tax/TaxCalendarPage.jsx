// ================================================================
// Tax Calendar — month grid with deadlines + list/upcoming view
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getBrandPalette,
  getReportsPalette,
  getAlertPalette,
  getWarningPalette,
  getCustomerPalette,
  getPaletteById,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import TaxCalendarMonth from "../../../components/dashboard/efatura/TaxCalendarMonth";
import { api, fmtDate } from "../efatura/efaturaApi";

function urgencyOf(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / 86400000);
  if (diff < 0) return "OVERDUE";
  if (diff === 0) return "TODAY";
  if (diff <= 3) return "THREE";
  if (diff <= 7) return "WEEK";
  return "FUTURE";
}

const URGENCY_PALETTE = { OVERDUE: "rose", TODAY: "wine", THREE: "amber", WEEK: "cyan", FUTURE: "indigo" };

// Fallback Turkish tax deadlines for the current year
function buildDefaultDeadlines(year) {
  const make = (day, month, code, title) => ({
    id: `${year}-${month}-${day}-${code}`,
    code,
    title,
    dueDate: new Date(year, month - 1, day).toISOString(),
  });
  return [
    make(26, 1, "KDV",     "KDV Beyanı"),
    make(26, 2, "KDV",     "KDV Beyanı"),
    make(26, 3, "KDV",     "KDV Beyanı"),
    make(26, 4, "KDV",     "KDV Beyanı"),
    make(26, 5, "KDV",     "KDV Beyanı"),
    make(26, 6, "KDV",     "KDV Beyanı"),
    make(26, 7, "KDV",     "KDV Beyanı"),
    make(26, 8, "KDV",     "KDV Beyanı"),
    make(26, 9, "KDV",     "KDV Beyanı"),
    make(26, 10, "KDV",    "KDV Beyanı"),
    make(26, 11, "KDV",    "KDV Beyanı"),
    make(26, 12, "KDV",    "KDV Beyanı"),
    make(31, 3, "GELIR",  "Gelir Vergisi (Yıllık)"),
    make(30, 4, "KURUM",  "Kurumlar Vergisi"),
    make(15, 7, "GECICI", "Geçici Vergi (Q2)"),
    make(15, 11, "GECICI","Geçici Vergi (Q3)"),
    make(31, 1, "STOPAJ", "Stopaj (Q4)"),
    make(31, 7, "BSMV",   "BSMV"),
    make(28, 2, "MUHTASAR","Muhtasar"),
    make(28, 5, "MUHTASAR","Muhtasar"),
    make(28, 8, "MUHTASAR","Muhtasar"),
    make(28, 11, "MUHTASAR","Muhtasar"),
  ];
}

export default function TaxCalendarPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("tax");
  const brand = getBrandPalette(lang.toLowerCase());
  const reports = getReportsPalette();
  const alert = getAlertPalette();
  const warn = getWarningPalette();
  const customer = getCustomerPalette();

  const [view, setView] = useState("MONTH");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [deadlines, setDeadlines] = useState([]);

  useEffect(() => {
    api(`/api/tax-calendar?year=${year}`).then((res) => {
      const list = res?.data?.deadlines || res?.data?.items || res?.data || [];
      const arr = Array.isArray(list) && list.length > 0 ? list : buildDefaultDeadlines(year);
      setDeadlines(arr);
    });
  }, [year]);

  const stats = useMemo(() => {
    const today = deadlines.filter((d) => urgencyOf(d.dueDate || d.date) === "TODAY").length;
    const week = deadlines.filter((d) => {
      const u = urgencyOf(d.dueDate || d.date);
      return u === "TODAY" || u === "THREE" || u === "WEEK";
    }).length;
    const overdue = deadlines.filter((d) => urgencyOf(d.dueDate || d.date) === "OVERDUE").length;
    return { today, week, overdue, total: deadlines.length };
  }, [deadlines]);

  const upcoming = useMemo(
    () =>
      deadlines
        .map((d) => ({ ...d, _u: urgencyOf(d.dueDate || d.date) }))
        .filter((d) => d._u !== "FUTURE" || new Date(d.dueDate || d.date) > new Date())
        .sort((a, b) => new Date(a.dueDate || a.date) - new Date(b.dueDate || b.date))
        .slice(0, 20),
    [deadlines]
  );

  const move = (delta) => {
    let m = month + delta;
    let y = year;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setYear(y);
    setMonth(m);
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("calendar.title")}
        subtitle={t("calendar.subtitle")}
        icon="🗓️"
        palette={brand}
        actions={
          <div style={{ display: "flex", gap: 4, padding: 4, background: brand.bg, borderRadius: 10 }}>
            {[
              { id: "MONTH", label: t("calendar.month.view") },
              { id: "LIST",  label: t("calendar.list.view") },
            ].map((v) => {
              const active = view === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setView(v.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: active ? "#fff" : "transparent",
                    color: active ? brand.dark : "#64748B",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: active ? `0 2px 8px ${brand.base}25` : "none",
                  }}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="ef-kpi-grid"
      >
        <KpiCard label={t("calendar.urgency.OVERDUE")} value={stats.overdue} palette={alert} icon="⚡" pulse={stats.overdue > 0} />
        <KpiCard label={t("calendar.urgency.TODAY")} value={stats.today} palette={brand} icon="📅" pulse={stats.today > 0} />
        <KpiCard label={t("calendar.urgency.WEEK")} value={stats.week} palette={warn} icon="⏰" />
        <KpiCard label={t("calendar.upcoming")} value={upcoming.length} palette={customer} icon="🔮" />
      </div>

      {view === "MONTH" ? (
        <Card
          palette={brand}
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                type="button"
                onClick={() => move(-1)}
                style={{ background: "transparent", border: `1px solid ${brand.base}30`, color: brand.dark, borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontWeight: 700 }}
              >
                ‹
              </button>
              <span>{new Date(year, month, 1).toLocaleString(lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR", { month: "long", year: "numeric" })}</span>
              <button
                type="button"
                onClick={() => move(1)}
                style={{ background: "transparent", border: `1px solid ${brand.base}30`, color: brand.dark, borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontWeight: 700 }}
              >
                ›
              </button>
            </div>
          }
          icon="📅"
        >
          <TaxCalendarMonth
            year={year}
            month={month}
            deadlines={deadlines}
            lang={lang}
            t={t}
          />
        </Card>
      ) : (
        <Card palette={reports} title={t("calendar.upcoming")} icon="🔮">
          {upcoming.length === 0 ? (
            <EmptyState title="No upcoming deadlines" icon="🎉" palette={reports} />
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {upcoming.map((d) => {
                const u = d._u;
                const palette = getPaletteById(URGENCY_PALETTE[u]);
                const date = new Date(d.dueDate || d.date);
                const days = Math.round((date - new Date()) / 86400000);
                return (
                  <li
                    key={d.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 14px",
                      borderBottom: "1px solid #F1F5F9",
                    }}
                  >
                    <div
                      style={{
                        width: 56,
                        textAlign: "center",
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ fontSize: 9, color: palette.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {date.toLocaleString(lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR", { month: "short" })}
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: palette.base, lineHeight: 1.1 }}>{date.getDate()}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{d.title || d.label}</div>
                      <div style={{ fontSize: 11, color: "#64748B", fontFamily: "monospace" }}>{d.code || "TAX"}</div>
                    </div>
                    <div style={{ textAlign: "end" }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: 999,
                          background: `${palette.base}15`,
                          color: palette.dark,
                          fontSize: 11,
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {t(`calendar.urgency.${u}`)}
                      </span>
                      <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>
                        {days < 0 ? `${Math.abs(days)}d ago` : days === 0 ? "today" : `${days}d`}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}

      <style>{`@media (max-width: 720px) { .ef-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
    </div>
  );
}
