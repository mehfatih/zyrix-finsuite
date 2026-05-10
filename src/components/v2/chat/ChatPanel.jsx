// ================================================================
// Sprint D-8 — Bottom-right slide-in chat panel.
//
// Lifecycle:
//   - On open, loads (or creates) a conversation
//   - User submits message via ChatInput
//   - postMessage() persists user msg + returns streamToken
//   - useChatStream consumes the SSE stream, accumulating into
//     a partial assistant message
//   - On `done`, the partial is converted to a finalized message
//     and added to the persistent message list
//
// Decision §7.K honored: this component (and everything below)
// is lazy-loaded by ChatBubble.
// ================================================================
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Sidebar, X } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { useChatStream } from '@/hooks/v2/useChatStream';
import { listMessages, postMessage } from '@/api/v2/chat';
import MessageThread from './MessageThread.jsx';
import ChatInput from './ChatInput.jsx';
import SuggestedPrompts from './SuggestedPrompts.jsx';
import ConversationSidebar from './ConversationSidebar.jsx';
import VoiceMicButton from './VoiceMicButton.jsx';

function detectLanguage() {
  try {
    const stored = localStorage.getItem('zyrix_lang') || localStorage.getItem('language');
    if (stored && ['tr', 'en', 'ar'].includes(stored)) return stored;
    const nav = (navigator.language || '').toLowerCase();
    if (nav.startsWith('ar')) return 'ar';
    if (nav.startsWith('en')) return 'en';
  } catch { /* ignore */ }
  return 'tr';
}

export default function ChatPanel() {
  const { open, closeChat, activeConversationId, setActiveConversationId, consumePendingPrompt } = useChat();
  const [language] = useState(detectLanguage);
  const [messages, setMessages] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const stream = useChatStream();
  const partialRef = useRef(null);
  partialRef.current = stream.partial;

  // ── Load history when conversation changes ───────────────
  useEffect(() => {
    if (!open) return undefined;
    if (!activeConversationId) {
      setMessages([]);
      return undefined;
    }
    let cancelled = false;
    setHistoryLoading(true);
    setError(null);
    listMessages(activeConversationId, { limit: 100 })
      .then((data) => !cancelled && setMessages(data?.messages || []))
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setHistoryLoading(false));
    return () => { cancelled = true; };
  }, [open, activeConversationId]);

  // ── Submit handler ───────────────────────────────────────
  const handleSubmit = useCallback(async (message) => {
    if (!message || stream.streaming) return;
    setError(null);

    // Optimistic insert of the user message.
    const optimisticUser = {
      id:        `optimistic-${Date.now()}`,
      role:      'user',
      content:   message,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, optimisticUser]);

    let postResp;
    try {
      postResp = await postMessage({
        conversationId: activeConversationId || undefined,
        message,
        lang: language
      });
    } catch (err) {
      setError(err);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
      return;
    }

    const { conversationId, userMessageId, assistantMessageId, streamToken, locale } = postResp;
    setMessages((prev) => prev.map((m) =>
      m.id === optimisticUser.id ? { ...m, id: userMessageId } : m
    ));
    if (!activeConversationId) {
      setActiveConversationId(conversationId);
      setRefreshKey((k) => k + 1);
    }

    // Add a placeholder assistant row that the stream fills in.
    setMessages((prev) => [...prev, {
      id:        assistantMessageId,
      role:      'assistant',
      content:   '',
      createdAt: new Date().toISOString()
    }]);

    stream.start(
      { streamToken, lang: locale || language, messageId: assistantMessageId, conversationId },
      {
        onDone: ({ tokensUsed, latencyMs }) => {
          // Promote the partial to the persistent message.
          const partial = partialRef.current || {};
          setMessages((prev) => prev.map((m) =>
            m.id === assistantMessageId
              ? {
                  ...m,
                  content:    partial.content,
                  toolCalls:  partial.toolCalls,
                  charts:     partial.charts,
                  citations:  partial.citations,
                  actions:    partial.actions,
                  tokensUsed,
                  latencyMs
                }
              : m
          ));
          setRefreshKey((k) => k + 1);
        }
      }
    );
  }, [activeConversationId, language, stream, setActiveConversationId]);

  // ── Auto-fill from a pending prompt (e.g., suggested prompt clicks) ──
  useEffect(() => {
    if (!open) return;
    const p = consumePendingPrompt();
    if (p) handleSubmit(p);
  }, [open, consumePendingPrompt, handleSubmit]);

  // ── Live merge: update assistant message in place while streaming ──
  useEffect(() => {
    if (!stream.streaming) return;
    const id = stream.partial.id;
    if (!id) return;
    setMessages((prev) => prev.map((m) =>
      m.id === id
        ? {
            ...m,
            content:    stream.partial.content,
            toolCalls:  stream.partial.toolCalls,
            charts:     stream.partial.charts,
            citations:  stream.partial.citations,
            actions:    stream.partial.actions
          }
        : m
    ));
  }, [stream.streaming, stream.partial]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Zyrix AI Co-Pilot"
      style={{
        position: 'fixed',
        bottom: 92,
        insetInlineEnd: 'clamp(16px, 4vw, 24px)',
        width: 'min(540px, calc(100vw - 32px))',
        height: 'min(680px, calc(100vh - 120px))',
        display: 'flex',
        background: '#0A0E27',
        color: '#F8FAFC',
        border: '1px solid rgba(157, 78, 221, 0.35)',
        borderRadius: 16,
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.45)',
        zIndex: 95,
        overflow: 'hidden',
        fontFamily: "'Inter', system-ui, sans-serif"
      }}
    >
      {sidebarOpen && (
        <ConversationSidebar
          activeId={activeConversationId}
          onSelect={(id) => { setActiveConversationId(id); setSidebarOpen(false); }}
          onNew={() => { setActiveConversationId(null); setMessages([]); setSidebarOpen(false); }}
          refreshKey={refreshKey}
          language={language}
        />
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.10)'
        }}>
          <button
            type="button"
            onClick={() => setSidebarOpen((s) => !s)}
            aria-label="Toggle conversation history"
            style={iconBtn}
          >
            <Sidebar size={14} />
          </button>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.04em', color: '#F8FAFC' }}>
            Zyrix <span style={{ color: '#00D9FF' }}>AI Co-Pilot</span>
          </div>
          <button
            type="button"
            onClick={closeChat}
            aria-label="Close chat"
            style={iconBtn}
          >
            <X size={14} />
          </button>
        </div>

        {error && (
          <div style={{
            padding: '6px 14px',
            background: 'rgba(255, 61, 90, 0.10)',
            color: '#FF3D5A',
            fontSize: 11,
            borderBottom: '1px solid rgba(255, 61, 90, 0.30)'
          }}>
            {String(error?.message || error)}
          </div>
        )}

        {historyLoading ? (
          <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: '#94A3B8', fontSize: 12 }}>
            …
          </div>
        ) : (
          <MessageThread messages={messages} streaming={stream.streaming} />
        )}

        <SuggestedPrompts
          language={language}
          onPick={(p) => handleSubmit(p)}
        />

        <ChatInput
          onSubmit={handleSubmit}
          disabled={stream.streaming}
          leftSlot={
            <VoiceMicButton
              lang={language}
              onTranscript={() => undefined /* transcript flows directly to textarea via parent state */}
            />
          }
        />
      </div>
    </div>
  );
}

const iconBtn = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  width: 28, height: 28,
  background: 'transparent',
  color: '#CBD5E1',
  border: '1px solid rgba(255, 255, 255, 0.10)',
  borderRadius: 6,
  cursor: 'pointer'
};
