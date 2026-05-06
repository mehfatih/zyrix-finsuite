// ================================================================
// RecurringScheduleCard — next-30-days timeline of upcoming auto-bills
// ================================================================
import React, { useMemo } from "react";
import { getMoneyPalette, getCustomerPalette } from "../../../utils/dashboardPalette";

function previewDates(plan, days = 30) {
  const out = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setDate(end.getDate() + days);
  const freq = (plan.frequency || "MONTHLY").toUpperCase();
  let cursor = new Date(plan.nextRunDate || plan.startDate || today);
  cursor.setHours(0, 0, 0, 0);
  let safety = 0;
  while (cursor <= end && safety < 60) {
    if (cursor >= today) out.push(new Date(cursor));
    if (freq === "DAILY") cursor.setDate(cursor.getDate() + 1);
    else if (freq === "WEEKLY") cursor.setDate(cursor.getDate() + 7);
    else if (freq === "MONTHLY") cursor.setMonth(cursor.getMonth() + 1);
    else if (freq === "QUARTERLY") cursor.setMonth(cursor.getMonth() + 3);
    else if (freq === "YEARLY") cursor.setFullYear(cursor.getFullYear() + 1);
    else cursor.setDate(cursor.getDate() + 30);
    safety++;
  }
  return out;
}

export default function RecurringScheduleCard({ plans = [], days = 30, t = (s) => s, lang = "TR" }) {
  const money = getMoneyPalette();
  const customer = getCustomerPalette();

  const events = useMemo(() => {
    const list = [];
    plans
      .filter((p) => p.status !== "PAUSED" && p.status !== "ENDED")
      .forEach((p) => {
        previewDates(p, days).forEach((date) => {
          list.push({ date, plan: p });
        });
      });
    list.sort((a, b) => a.date - b.date);
    return list;
  }, [plans, days]);

  const total = events.reduce((s, e) => s + Number(e.plan.amount || 0), 0);

  // Build a 30-cell strip indexed by day offset from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cells = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const todays = events.filter((e) => e.date.toISOString().slice(0, 10) === key);
    const dayValue = todays.reduce((s, e) => s + Number(e.plan.amount || 0), 0);
    return { date: d, key, count: todays.length, value: dayValue, items: todays };
  });
  const maxValue = Math.max(1, ...cells.map((c) => c.value));

  const fmtDate = (d) => d.toLocaleDateString(lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR", { month: "short", day: "numeric" });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: customer.dark, fontWeight: 700 }}>
          {events.length} runs · {days} days
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: money.base, fontFamily: "monospace" }}>
          ₺{total.toLocaleString()}
        </div>
      </div>

      {events.length === 0 ? (
        <div style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
          —
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${days}, 1fr)`,
              gap: 2,
              marginBottom: 10,
            }}
            aria-label="30-day schedule strip"
          >
            {cells.map((c, i) => {
              const intensity = c.value > 0 ? 0.25 + 0.75 * (c.value / maxValue) : 0;
              const bg = c.count > 0
                ? `${customer.base}${Math.round(intensity * 255).toString(16).padStart(2, "0").toUpperCase()}`
                : `${customer.base}10`;
              return (
                <div
                  key={c.key}
                  title={`${fmtDate(c.date)} — ${c.count} run(s) · ₺${c.value.toLocaleString()}`}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 4,
                    background: bg,
                    cursor: c.count > 0 ? "help" : "default",
                  }}
                />
              );
            })}
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, maxHeight: 220, overflowY: "auto" }}>
            {events.slice(0, 10).map((e, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: customer.bg,
                    color: customer.dark,
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <div style={{ fontSize: 9, fontWeight: 700, lineHeight: 1 }}>
                    {e.date.toLocaleString(lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR", { month: "short" }).toUpperCase()}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 900, lineHeight: 1.2 }}>{e.date.getDate()}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {e.plan.customerName || "—"}
                  </div>
                  <div style={{ fontSize: 11, color: "#64748B" }}>{t(`recurring.freq.${e.plan.frequency || "MONTHLY"}`)}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: money.dark, fontFamily: "monospace" }}>
                  ₺{Number(e.plan.amount || 0).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
