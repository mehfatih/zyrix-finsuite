// ================================================================
// ★ Multi-Channel Customer Inbox — unified conversations view
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getCustomerPalette,
  getAIPalette,
  getAlertPalette,
  getReportsPalette,
  getMoneyPalette,
  getBrandPalette,
  getPaletteById,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import ChannelInbox from "../../../components/dashboard/autopilots/ChannelInbox";
import ConversationBubble, { CHANNEL_PALETTE, CHANNEL_ICON } from "../../../components/dashboard/autopilots/ConversationBubble";
import SuggestionChip from "../../../components/dashboard/autopilots/SuggestionChip";
import { localStore, KEYS, ensureInboxSeed } from "./autopilotsApi";

const FILTERS = ["all", "unread", "urgent", "escalated"];

function suggestReplies(message, lang = "TR") {
  const text = (message?.lastMessage || "").toLowerCase();
  const tr = lang === "TR";
  if (text.includes("fatura") || text.includes("invoice")) {
    return [
      { variant: "quick", icon: "⚡", label: tr ? "Hemen gönderiyorum!" : "Sending now!" },
      { variant: "detailed", icon: "📨", label: tr ? "Faturanız bugün e-posta ile gönderildi. Mailinizi kontrol edebilirsiniz." : "Your invoice was sent today. Please check your inbox." },
      { variant: "empathetic", icon: "💬", label: tr ? "Bekleterek üzgünüm — şimdi hazırlıyorum." : "Sorry for the wait — preparing now." },
    ];
  }
  if (text.includes("şikayet") || text.includes("iptal") || text.includes("complaint") || text.includes("refund")) {
    return [
      { variant: "empathetic", icon: "💛", label: tr ? "Yaşadığınız sorun için üzgünüm. Hemen çözüyoruz." : "I'm sorry for the trouble. Resolving now." },
      { variant: "detailed", icon: "📞", label: tr ? "Konuyu yöneticime ilettim, 15 dakika içinde dönüş yapacağız." : "Escalated to my manager — we'll reply within 15 min." },
    ];
  }
  if (text.includes("teşekkür") || text.includes("harika") || text.includes("thanks")) {
    return [
      { variant: "quick", icon: "🙏", label: tr ? "Çok teşekkürler!" : "Thank you so much!" },
      { variant: "empathetic", icon: "💛", label: tr ? "Sizin gibi müşterilerimizle çalışmak gurur veriyor." : "Customers like you are why we do this." },
    ];
  }
  return [
    { variant: "quick", icon: "👍", label: tr ? "Anlaşıldı!" : "Got it!" },
    { variant: "detailed", icon: "📝", label: tr ? "Detaylı cevap için kontrol edip dönüyorum." : "Let me check and reply with details." },
  ];
}

export default function MultiChannelInboxPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("inbox");
  const customer = getCustomerPalette();
  const ai = getAIPalette();
  const alert = getAlertPalette();
  const reports = getReportsPalette();
  const money = getMoneyPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState(null);
  const [reply, setReply] = useState("");
  const [sendChannel, setSendChannel] = useState(null);

  useEffect(() => {
    ensureInboxSeed();
    const list = localStore.list(KEYS.inboxMessages);
    setConversations(list);
    if (list.length > 0) {
      setActiveId(list[0].id);
      setSendChannel(list[0].channel);
    }
  }, []);

  const active = conversations.find((c) => c.id === activeId);
  useEffect(() => {
    if (active) setSendChannel(active.channel);
  }, [activeId]);

  const filtered = useMemo(() => {
    let arr = conversations;
    if (filter === "unread") arr = arr.filter((c) => c.unread);
    if (filter === "urgent") arr = arr.filter((c) => c.urgency >= 4);
    if (filter === "escalated") arr = arr.filter((c) => c.urgency >= 4 && c.sentiment === "negative");
    if (channelFilter) arr = arr.filter((c) => c.channel === channelFilter);
    return arr;
  }, [conversations, filter, channelFilter]);

  const stats = useMemo(() => ({
    total: conversations.length,
    unread: conversations.filter((c) => c.unread).length,
    urgent: conversations.filter((c) => c.urgency >= 4).length,
    aiHandled: conversations.filter((c) => (c.thread || []).some((m) => m.aiHandled)).length,
  }), [conversations]);

  const channels = useMemo(() => {
    const set = new Set(conversations.map((c) => c.channel));
    return Array.from(set);
  }, [conversations]);

  const sendReply = (text) => {
    const final = (text || reply).trim();
    if (!final || !active) return;
    setConversations((arr) =>
      arr.map((c) =>
        c.id === active.id
          ? {
              ...c,
              lastMessage: final,
              unread: false,
              timestamp: new Date().toISOString(),
              thread: [...(c.thread || []), { from: "agent", text: final, at: new Date().toISOString() }],
            }
          : c
      )
    );
    setReply("");
  };

  const markRead = (id) => {
    setConversations((arr) => arr.map((c) => (c.id === id ? { ...c, unread: false } : c)));
  };

  const replyPalette = active ? getPaletteById(CHANNEL_PALETTE[sendChannel || active.channel] || "indigo") : customer;

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("title")} subtitle={t("subtitle")} icon="📨" palette={customer} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="ap-kpi-grid"
      >
        <KpiCard label={t("kpi.total")} value={stats.total} palette={customer} icon="💬" />
        <KpiCard label={t("kpi.unread")} value={stats.unread} palette={brand} icon="🔴" pulse={stats.unread > 0} />
        <KpiCard label={t("kpi.urgent")} value={stats.urgent} palette={alert} icon="⚡" pulse={stats.urgent > 0} />
        <KpiCard label={t("kpi.aiHandled")} value={stats.aiHandled} palette={ai} icon="🤖" />
      </div>

      {/* Channel filter strip */}
      <div
        style={{
          background: "#fff",
          border: `1px solid ${customer.base}15`,
          borderRadius: 14,
          padding: "10px 12px",
          marginBottom: 12,
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginInlineEnd: 6 }}>
          {t("channels.label")}
        </span>
        <button
          type="button"
          onClick={() => setChannelFilter(null)}
          style={chipStyle(customer, channelFilter === null)}
        >
          {t("filter.all")}
        </button>
        {channels.map((ch) => {
          const palette = getPaletteById(CHANNEL_PALETTE[ch] || "indigo");
          const active = channelFilter === ch;
          return (
            <button key={ch} type="button" onClick={() => setChannelFilter(ch)} style={chipStyle(palette, active)}>
              {CHANNEL_ICON[ch] || "•"} {t(`channel.${ch}`)}
            </button>
          );
        })}
        <div style={{ flex: 1, minWidth: 8 }} />
        {FILTERS.map((f) => {
          const active = filter === f;
          const palette = f === "urgent" ? alert : f === "escalated" ? alert : f === "unread" ? brand : customer;
          return (
            <button key={f} type="button" onClick={() => setFilter(f)} style={chipStyle(palette, active)}>
              {t(`filter.${f}`)}
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 320px) minmax(0, 1fr)", gap: 18 }} className="inbox-grid">
        <Card palette={customer} title={`${filtered.length} / ${conversations.length}`} icon="📋" style={{ padding: 0, overflow: "hidden" }}>
          <ChannelInbox
            conversations={filtered}
            activeId={activeId}
            onSelect={(c) => { setActiveId(c.id); markRead(c.id); }}
            lang={lang}
            t={t}
          />
        </Card>

        <Card palette={replyPalette} title={active?.customerName || "—"} icon={CHANNEL_ICON[active?.channel] || "💬"}>
          {!active ? (
            <EmptyState title={t("list.empty")} icon="💬" palette={customer} />
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  alignItems: "center",
                  marginBottom: 12,
                  padding: "8px 12px",
                  background: replyPalette.bg,
                  borderRadius: 10,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 800, color: replyPalette.dark, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {t(`channel.${active.channel}`)}
                </span>
                {active.tag && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: customer.bg, color: customer.dark }}>
                    {t(`tag.${active.tag}`)}
                  </span>
                )}
                {active.sentiment && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: ai.bg, color: ai.dark }}>
                    {t(`sentiment.${active.sentiment}`)}
                  </span>
                )}
                {active.urgency >= 4 && (
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 999, background: alert.base, color: "#fff" }}>
                    ⚡ {t("urgency.label")} {active.urgency}/5
                  </span>
                )}
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 11, color: ai.dark, fontWeight: 700 }}>
                  🧬 {t("dna.preview")}: Analytical · High LTV
                </span>
              </div>

              <div style={{ maxHeight: 360, overflowY: "auto", marginBottom: 12 }}>
                {(active.thread || []).map((m, i) => (
                  <ConversationBubble key={i} message={m} channel={active.channel} lang={lang} />
                ))}
              </div>

              {/* AI Suggestions */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: ai.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  🤖 {t("ai.suggestions")}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {suggestReplies(active, lang).map((s, i) => (
                    <SuggestionChip
                      key={i}
                      label={s.label}
                      icon={s.icon}
                      variant={s.variant}
                      palette={ai}
                      onClick={() => sendReply(s.label)}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  rows={2}
                  placeholder={t("compose.placeholder")}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: `1px solid ${replyPalette.base}30`,
                    background: "#fff",
                    fontSize: 13,
                    fontFamily: "inherit",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
                <select
                  value={sendChannel || active.channel}
                  onChange={(e) => setSendChannel(e.target.value)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 12,
                    border: `1px solid ${replyPalette.base}30`,
                    background: replyPalette.bg,
                    color: replyPalette.dark,
                    fontSize: 12,
                    fontWeight: 700,
                    outline: "none",
                  }}
                >
                  {Object.keys(CHANNEL_PALETTE).map((c) => (
                    <option key={c} value={c}>
                      {CHANNEL_ICON[c]} {t(`channel.${c}`)}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => sendReply()} disabled={!reply.trim()} style={{ ...btn(brand, "primary"), opacity: reply.trim() ? 1 : 0.5 }}>
                  ➤
                </button>
              </div>
            </>
          )}
        </Card>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .ap-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .inbox-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function chipStyle(palette, active) {
  return {
    padding: "5px 10px",
    borderRadius: 999,
    border: active ? `2px solid ${palette.base}` : `1px solid ${palette.base}30`,
    background: active ? palette.base : `${palette.base}10`,
    color: active ? "#fff" : palette.dark,
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  };
}

function btn(palette, variant) {
  if (variant === "primary") {
    return {
      background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
      color: "#fff",
      border: "none",
      padding: "10px 18px",
      borderRadius: 12,
      fontSize: 14,
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: `0 4px 14px ${palette.base}40`,
    };
  }
  return {
    background: palette.bg,
    color: palette.dark,
    border: `1px solid ${palette.base}40`,
    padding: "10px 18px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  };
}
