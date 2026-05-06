// ================================================================
// NotificationsPage — feed of alerts with category filters
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import {
  getAIPalette,
  getMoneyPalette,
  getCustomerPalette,
  getReportsPalette,
  getAlertPalette,
  getWarningPalette,
  getBrandPalette,
  resolvePalette,
} from "../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../components/dashboard/PageHeader";
import Card from "../../components/dashboard/Card";
import EmptyState from "../../components/dashboard/EmptyState";
import { ToastProvider, useToast } from "../../components/dashboard/ToastSystem";

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

const CATEGORIES = ["all", "unread", "system", "invoice", "payment", "tax", "ai"];

const CATEGORY_PALETTES = {
  all:     null,
  unread:  null,
  system:  getReportsPalette(),
  invoice: getMoneyPalette(),
  payment: getCustomerPalette(),
  tax:     getWarningPalette(),
  ai:      getAIPalette(),
};

const CATEGORY_ICONS = {
  system:  "⚙️",
  invoice: "🧾",
  payment: "💳",
  tax:     "📅",
  ai:      "🤖",
};

function timeAgo(ts, dt) {
  const ms = Date.now() - new Date(ts).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return dt("time.now");
  if (m < 60) return dt("time.minutesAgo", { minutes: m });
  const h = Math.floor(m / 60);
  if (h < 24) return dt("time.hoursAgo", { hours: h });
  return dt("time.daysAgo", { days: Math.floor(h / 24) });
}

function NotificationsInner() {
  const dt = useDashboardI18n("notifications");
  const { lang } = useI18n();
  const brand = getBrandPalette(lang.toLowerCase());
  const alert = getAlertPalette();
  const { toast } = useToast();

  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    apiFetch("/api/notifications").then((res) => {
      const list = res?.data ?? res ?? [];
      if (Array.isArray(list) && list.length) {
        setItems(list);
        return;
      }
      // Demo fallback
      const now = Date.now();
      setItems([
        { id: 1, category: "invoice", title: "Atlas Tekstil paid INV-2451", detail: "₺ 12,400 received", read: false, ts: now - 1000 * 60 * 25 },
        { id: 2, category: "ai",      title: "AI suggestion: follow up Levant Foods", detail: "Predicted close +14%", read: false, ts: now - 1000 * 60 * 60 * 3 },
        { id: 3, category: "tax",     title: "KDV beyannamesi son tarih: 26 Mayıs", detail: "12 fatura onayı bekliyor", read: false, ts: now - 1000 * 60 * 60 * 8 },
        { id: 4, category: "payment", title: "Bank match: Garanti, ₺ 8,200", detail: "Auto-linked to invoice INV-2444", read: true, ts: now - 1000 * 60 * 60 * 26 },
        { id: 5, category: "system",  title: "E-Fatura konektörü güncellendi", detail: "GIB v2.1.4", read: true, ts: now - 1000 * 60 * 60 * 50 },
      ]);
    });
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "unread") return items.filter((it) => !it.read);
    return items.filter((it) => it.category === filter);
  }, [items, filter]);

  const unreadCount = items.filter((it) => !it.read).length;

  const markAllRead = async () => {
    setItems((arr) => arr.map((it) => ({ ...it, read: true })));
    await apiFetch("/api/notifications/read", { method: "POST", body: JSON.stringify({ all: true }) });
    toast.success(dt("action.markAllRead"));
  };

  const markRead = async (id) => {
    setItems((arr) => arr.map((it) => (it.id === id ? { ...it, read: true } : it)));
    await apiFetch("/api/notifications/read", { method: "POST", body: JSON.stringify({ id }) });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title={dt("title")}
        subtitle={dt("subtitle")}
        palette={alert}
        icon={unreadCount > 0 ? "🔔" : "🛎"}
        actions={
          unreadCount > 0 && (
            <PageHeaderButton onClick={markAllRead} palette={alert} variant="secondary">
              {dt("action.markAllRead")}
            </PageHeaderButton>
          )
        }
      />

      {/* Filter chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {CATEGORIES.map((cat) => {
          const p = CATEGORY_PALETTES[cat] || brand;
          const active = filter === cat;
          const count =
            cat === "all"
              ? items.length
              : cat === "unread"
              ? unreadCount
              : items.filter((it) => it.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                border: `1px solid ${active ? p.base : p.base + "30"}`,
                background: active ? p.base : "#fff",
                color: active ? "#fff" : p.dark,
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {dt(`filter.${cat}`)}
              <span
                style={{
                  background: active ? "rgba(255,255,255,.2)" : p.bg,
                  color: active ? "#fff" : p.dark,
                  padding: "1px 8px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feed */}
      <Card palette={brand} noHover>
        {filtered.length === 0 ? (
          <EmptyState
            title={dt("empty.title")}
            description={dt("empty.description")}
            icon="📭"
            palette={brand}
          />
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {filtered.map((it) => {
              const p = resolvePalette(CATEGORY_PALETTES[it.category]) || brand;
              return (
                <li
                  key={it.id}
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                    padding: "14px 4px",
                    borderBottom: "1px solid #F1F5F9",
                    background: !it.read ? `${p.base}08` : "transparent",
                    borderRadius: 8,
                    margin: "0 -4px",
                    paddingLeft: 12,
                    paddingRight: 12,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: p.bg,
                      color: p.base,
                      display: "grid",
                      placeItems: "center",
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    {CATEGORY_ICONS[it.category] || "•"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
                        {it.title}
                      </span>
                      {!it.read && (
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: p.base,
                            flexShrink: 0,
                          }}
                          aria-label="unread"
                        />
                      )}
                    </div>
                    {it.detail && (
                      <div style={{ fontSize: 12, color: "#475569", marginTop: 3 }}>
                        {it.detail}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 5 }}>
                      {timeAgo(it.ts, dt)}
                    </div>
                  </div>
                  {!it.read && (
                    <button
                      type="button"
                      onClick={() => markRead(it.id)}
                      style={{
                        background: "transparent",
                        border: `1px solid ${p.base}30`,
                        color: p.dark,
                        borderRadius: 8,
                        padding: "5px 10px",
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      {dt("action.markRead")}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <ToastProvider>
      <NotificationsInner />
    </ToastProvider>
  );
}
