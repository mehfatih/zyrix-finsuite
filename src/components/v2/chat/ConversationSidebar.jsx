// ================================================================
// Sprint D-8 — Conversation history sidebar.
//
// Compact list of past conversations (most recent first) + a
// "+ New chat" button that resets the active conversation. Used
// inside ChatPanel (collapsible) and ChatPage (always visible
// on desktop).
// ================================================================
import React, { useEffect, useState } from 'react';
import { Plus, MessageSquare, Pin, Loader2 } from 'lucide-react';
import { listConversations, deleteConversation } from '@/api/v2/chat';

const ITEM_LIMIT = 30;

function fmtRelative(s) {
  if (!s) return '';
  try {
    const d = new Date(s);
    const diffMs = Date.now() - d.getTime();
    const minutes = Math.floor(diffMs / 60_000);
    const hours = Math.floor(diffMs / 3_600_000);
    const days  = Math.floor(diffMs / 86_400_000);
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours   < 24) return `${hours}h`;
    if (days    < 7)  return `${days}d`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch { return ''; }
}

export default function ConversationSidebar({ activeId, onSelect, onNew, refreshKey, language = 'tr' }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listConversations({ limit: ITEM_LIMIT })
      .then((data) => {
        if (cancelled) return;
        setItems(data?.conversations || []);
      })
      .catch(() => !cancelled && setItems([]))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [refreshKey]);

  const newLabel    = language === 'ar' ? 'محادثة جديدة' : language === 'en' ? '+ New chat' : '+ Yeni sohbet';
  const emptyLabel  = language === 'ar' ? 'لا توجد محادثات بعد' : language === 'en' ? 'No conversations yet' : 'Henüz sohbet yok';

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        borderInlineEnd: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(15, 23, 42, 0.45)',
        overflow: 'hidden'
      }}
    >
      <div style={{ padding: 10 }}>
        <button
          type="button"
          onClick={onNew}
          style={{
            width: '100%',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '9px 10px',
            background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.85), rgba(0, 217, 255, 0.55))',
            color: '#FFFFFF',
            border: '1px solid rgba(157, 78, 221, 0.45)',
            borderRadius: 10,
            fontSize: 12, fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit'
          }}
        >
          <Plus size={13} />
          {newLabel}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px 12px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: 16, color: '#94A3B8' }}>
            <Loader2 size={14} style={{ animation: 'cn-aurora-rotate 0.9s linear infinite' }} />
          </div>
        )}
        {!loading && items.length === 0 && (
          <div style={{ textAlign: 'center', padding: 14, color: '#94A3B8', fontSize: 11 }}>
            {emptyLabel}
          </div>
        )}
        {items.map((c) => {
          const active = c.id === activeId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect?.(c.id)}
              style={{
                width: '100%',
                textAlign: 'start',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 10px',
                marginBottom: 4,
                background: active ? 'rgba(157, 78, 221, 0.18)' : 'transparent',
                border: active ? '1px solid rgba(157, 78, 221, 0.45)' : '1px solid transparent',
                borderRadius: 8,
                color: active ? '#F8FAFC' : '#CBD5E1',
                fontSize: 12,
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              {c.pinned ? <Pin size={11} /> : <MessageSquare size={11} />}
              <span style={{
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>{c.title}</span>
              <span style={{ flexShrink: 0, fontSize: 10, color: '#64748B' }}>
                {fmtRelative(c.lastMessageAt)}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
