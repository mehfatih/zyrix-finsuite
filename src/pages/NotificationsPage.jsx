// ================================================================
// Zyrix FinSuite — Notifications Page (Customer)
// Real-time feel, read/unread, filter by type, mark all read
// ================================================================

import React, { useState, useCallback } from "react";
import { useApi, useMutation } from "../hooks/useApi";
import { customerAPI } from "../services/api";
import { Skeleton, EmptyState, ErrorBanner, C } from "../components/ui";

// ── Helpers ───────────────────────────────────────
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1)  return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs  < 24) return `${hrs}h ago`;
  if (days < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Type config ───────────────────────────────────
const TYPE_CONFIG = {
  transaction: { icon: "💸", color: C.green,  label: "Transaction" },
  investment:  { icon: "📈", color: C.blue,   label: "Investment"  },
  security:    { icon: "🔐", color: C.red,    label: "Security"    },
  reminder:    { icon: "⏰", color: C.yellow, label: "Reminder"    },
  report:      { icon: "📊", color: C.purple, label: "Report"      },
  alert:       { icon: "⚠️", color: C.yellow, label: "Alert"       },
  default:     { icon: "🔔", color: C.muted,  label: "General"     },
};

function typeOf(n) {
  return TYPE_CONFIG[n.type] || TYPE_CONFIG.default;
}

// ── Single Notification Card ──────────────────────
function NotifCard({ notif, onRead }) {
  const cfg = typeOf(notif);
  const isUnread = !notif.read;

  return (
    <div
      onClick={() => !notif.read && onRead(notif.id)}
      style={{
        display: "flex", gap: 14, padding: "16px 18px",
        background: isUnread ? `${cfg.color}08` : "transparent",
        borderBottom: `1px solid ${C.border}`,
        cursor: isUnread ? "pointer" : "default",
        transition: "background 0.15s",
        position: "relative",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = isUnread ? `${cfg.color}14` : "#ffffff05"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = isUnread ? `${cfg.color}08` : "transparent"; }}
    >
      {/* Unread dot */}
      {isUnread && (
        <div style={{
          position: "absolute", top: 18, right: 18,
          width: 8, height: 8, borderRadius: "50%", background: cfg.color,
          boxShadow: `0 0 6px ${cfg.color}`,
        }} />
      )}

      {/* Icon */}
      <div style={{
        background: `${cfg.color}20`, borderRadius: 12,
        width: 42, height: 42, display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: 18, flexShrink: 0,
      }}>
        {notif.icon || cfg.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <span style={{
            color: isUnread ? C.text : C.muted,
            fontSize: 14, fontWeight: isUnread ? 600 : 400,
          }}>
            {notif.title}
          </span>
          <span style={{
            background: `${cfg.color}20`, color: cfg.color,
            fontSize: 10, fontWeight: 600, borderRadius: 4, padding: "1px 6px",
            textTransform: "uppercase", letterSpacing: "0.05em",
          }}>
            {cfg.label}
          </span>
        </div>
        <p style={{ color: C.muted, fontSize: 13, margin: 0, lineHeight: 1.5 }}>
          {notif.body || notif.message || notif.description}
        </p>
        <div style={{ color: "#ffffff30", fontSize: 11, marginTop: 5 }}>
          {timeAgo(notif.created_at)}
        </div>
      </div>
    </div>
  );
}

// ── Empty States ──────────────────────────────────
function EmptyAll()    { return <EmptyState icon="🔔" title="You're all caught up!" description="No notifications yet. We'll let you know when something important happens." />; }
function EmptyFilter() { return <EmptyState icon="🔍" title="No notifications" description="No notifications match this filter." />; }

// ── Stats Bar ─────────────────────────────────────
function StatsBar({ notifications }) {
  const total  = notifications.length;
  const unread = notifications.filter(n => !n.read).length;
  const byType = Object.entries(
    notifications.reduce((acc, n) => {
      const t = n.type || "default";
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
      {[
        { label: "Total",  value: total,  color: C.muted  },
        { label: "Unread", value: unread, color: unread > 0 ? C.red : C.muted },
        { label: "Read",   value: total - unread, color: C.green },
        ...byType.map(([t, c]) => ({ label: TYPE_CONFIG[t]?.label || t, value: c, color: TYPE_CONFIG[t]?.color || C.muted })),
      ].map(({ label, value, color }) => (
        <div key={label} style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 10, padding: "10px 16px", textAlign: "center", minWidth: 80,
        }}>
          <div style={{ color, fontSize: 20, fontWeight: 800 }}>{value}</div>
          <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────
export default function NotificationsPage() {
  const { data: raw, loading, error, refetch, setData } = useApi(() => customerAPI.getNotifications());
  const { mutate: markRead } = useMutation((id) => customerAPI.markNotificationRead(id));

  const [activeFilter, setActiveFilter] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const notifications = raw?.data || raw?.items || raw || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  const allTypes = ["all", ...new Set(notifications.map(n => n.type).filter(Boolean))];

  const filtered = notifications
    .filter(n => activeFilter === "all" || n.type === activeFilter)
    .filter(n => !showUnreadOnly || !n.read);

  // Optimistic read
  const handleRead = useCallback(async (id) => {
    setData((prev) => {
      const list = prev?.data || prev?.items || prev || [];
      const updated = list.map(n => n.id === id ? { ...n, read: true } : n);
      return Array.isArray(prev) ? updated : { ...prev, data: updated, items: updated };
    });
    try { await markRead(id); } catch { refetch(); }
  }, [markRead, setData, refetch]);

  // Mark all read
  const handleMarkAllRead = useCallback(async () => {
    setData((prev) => {
      const list = prev?.data || prev?.items || prev || [];
      const updated = list.map(n => ({ ...n, read: true }));
      return Array.isArray(prev) ? updated : { ...prev, data: updated, items: updated };
    });
    // Fire mark-read for each unread
    const unread = notifications.filter(n => !n.read);
    await Promise.allSettled(unread.map(n => markRead(n.id)));
  }, [notifications, markRead, setData]);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ color: C.text, fontSize: 24, fontWeight: 700, margin: 0 }}>Notifications</h1>
            {unreadCount > 0 && (
              <div style={{
                background: C.red, color: "#fff", borderRadius: 20,
                fontSize: 11, fontWeight: 700, padding: "2px 8px", minWidth: 22, textAlign: "center",
              }}>
                {unreadCount}
              </div>
            )}
          </div>
          <p style={{ color: C.muted, fontSize: 14, margin: "4px 0 0" }}>
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} style={{
              background: `${C.green}20`, border: `1px solid ${C.green}40`,
              color: C.green, borderRadius: 8, padding: "8px 16px",
              cursor: "pointer", fontSize: 13, fontWeight: 600,
            }}>
              ✓ Mark all read
            </button>
          )}
          <button onClick={refetch} style={{
            background: `${C.purple}20`, border: `1px solid ${C.purple}`,
            color: C.purpleLight, borderRadius: 8, padding: "8px 16px",
            cursor: "pointer", fontSize: 13,
          }}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      {/* Stats */}
      {!loading && notifications.length > 0 && <StatsBar notifications={notifications} />}

      {/* Filter row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        {/* Type filters */}
        {allTypes.map(t => {
          const cfg = TYPE_CONFIG[t] || TYPE_CONFIG.default;
          const isActive = activeFilter === t;
          return (
            <button key={t} onClick={() => setActiveFilter(t)} style={{
              background: isActive ? `${cfg.color}25` : C.card,
              border: `1px solid ${isActive ? cfg.color : C.border}`,
              color: isActive ? cfg.color : C.muted,
              borderRadius: 8, padding: "7px 14px", cursor: "pointer",
              fontSize: 13, textTransform: "capitalize", fontWeight: isActive ? 600 : 400,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {t !== "all" && <span>{cfg.icon}</span>}
              {t === "all" ? "All" : cfg.label}
              <span style={{
                background: isActive ? `${cfg.color}30` : "#ffffff15",
                borderRadius: 10, padding: "0 5px", fontSize: 11,
              }}>
                {t === "all" ? notifications.length : notifications.filter(n => n.type === t).length}
              </span>
            </button>
          );
        })}

        {/* Unread toggle */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: C.muted, fontSize: 13 }}>Unread only</span>
          <button onClick={() => setShowUnreadOnly(v => !v)} style={{
            width: 44, height: 24, borderRadius: 12,
            background: showUnreadOnly ? C.purple : C.border,
            border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s",
          }}>
            <div style={{
              position: "absolute", top: 3,
              left: showUnreadOnly ? 23 : 3,
              width: 18, height: 18, background: "#fff", borderRadius: "50%",
              transition: "left 0.2s",
            }} />
          </button>
        </div>
      </div>

      {/* Notifications list */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden",
      }}>
        {loading ? (
          <div style={{ padding: 20 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ display: "flex", gap: 14, marginBottom: 16, alignItems: "flex-start" }}>
                <Skeleton w={42} h={42} radius={12} />
                <div style={{ flex: 1 }}>
                  <Skeleton w="40%" h={14} />
                  <div style={{ marginTop: 8 }}><Skeleton w="75%" h={12} /></div>
                  <div style={{ marginTop: 6 }}><Skeleton w="20%" h={10} /></div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyAll />
        ) : filtered.length === 0 ? (
          <EmptyFilter />
        ) : (
          <>
            {/* Group: Unread */}
            {filtered.some(n => !n.read) && (
              <>
                <div style={{
                  padding: "10px 18px",
                  background: "#ffffff06",
                  borderBottom: `1px solid ${C.border}`,
                }}>
                  <span style={{ color: C.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Unread · {filtered.filter(n => !n.read).length}
                  </span>
                </div>
                {filtered.filter(n => !n.read).map(n => (
                  <NotifCard key={n.id} notif={n} onRead={handleRead} />
                ))}
              </>
            )}

            {/* Group: Earlier */}
            {filtered.some(n => n.read) && !showUnreadOnly && (
              <>
                <div style={{
                  padding: "10px 18px",
                  background: "#ffffff06",
                  borderBottom: `1px solid ${C.border}`,
                  borderTop: filtered.some(n => !n.read) ? `1px solid ${C.border}` : "none",
                }}>
                  <span style={{ color: C.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Earlier · {filtered.filter(n => n.read).length}
                  </span>
                </div>
                {filtered.filter(n => n.read).map(n => (
                  <NotifCard key={n.id} notif={n} onRead={handleRead} />
                ))}
              </>
            )}
          </>
        )}
      </div>

      {/* Footer count */}
      {!loading && filtered.length > 0 && (
        <p style={{ color: C.muted, fontSize: 12, textAlign: "center", marginTop: 14 }}>
          Showing {filtered.length} of {notifications.length} notifications
        </p>
      )}
    </div>
  );
}