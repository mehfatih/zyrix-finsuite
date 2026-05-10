// ================================================================
// /chat — Sprint D-8 full-page chat route.
//
// Same lifecycle as ChatPanel but with a permanent sidebar layout:
//   - Sidebar (260px on desktop, full-width drawer on mobile)
//   - Main column: header + messages + suggested prompts + input
//
// Reuses all of B.9..B.12 components. Lazy-loaded by App.jsx.
// ================================================================
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Sidebar as SidebarIcon } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { useChatStream } from '@/hooks/v2/useChatStream';
import { listMessages, postMessage } from '@/api/v2/chat';
import MessageThread from '@/components/v2/chat/MessageThread.jsx';
import ChatInput from '@/components/v2/chat/ChatInput.jsx';
import SuggestedPrompts from '@/components/v2/chat/SuggestedPrompts.jsx';
import ConversationSidebar from '@/components/v2/chat/ConversationSidebar.jsx';
import VoiceMicButton from '@/components/v2/chat/VoiceMicButton.jsx';

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

function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 720;
}

export default function ChatPage() {
  const { activeConversationId, setActiveConversationId } = useChat();
  const [language] = useState(detectLanguage);
  const [messages, setMessages] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobile, setMobile] = useState(isMobile);

  const stream = useChatStream();
  const partialRef = useRef(null);
  partialRef.current = stream.partial;

  useEffect(() => {
    const onResize = () => setMobile(isMobile());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Load history when conversation changes.
  useEffect(() => {
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
  }, [activeConversationId]);

  const handleSubmit = useCallback(async (message) => {
    if (!message || stream.streaming) return;
    setError(null);

    const optimisticUser = {
      id: `optimistic-${Date.now()}`,
      role: 'user', content: message,
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
    setMessages((prev) => [...prev, {
      id: assistantMessageId, role: 'assistant', content: '',
      createdAt: new Date().toISOString()
    }]);

    stream.start(
      { streamToken, lang: locale || language, messageId: assistantMessageId, conversationId },
      {
        onDone: ({ tokensUsed, latencyMs }) => {
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

  // Live merge of streaming partial.
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

  const sidebarVisible = !mobile || drawerOpen;

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        height: '100vh',
        display: 'flex',
        background: '#0A0E27',
        color: '#F8FAFC',
        fontFamily: "'Inter', system-ui, sans-serif",
        overflow: 'hidden'
      }}
    >
      {sidebarVisible && (
        <div style={{
          position: mobile ? 'fixed' : 'static',
          inset: mobile ? 0 : 'auto',
          zIndex: mobile ? 60 : 'auto',
          background: mobile ? 'rgba(10, 14, 39, 0.94)' : 'transparent',
          width: mobile ? '100%' : 280,
          maxWidth: mobile ? 320 : 280,
          flexShrink: 0,
          display: 'flex'
        }}>
          <div style={{ width: mobile ? 280 : 280, height: '100%' }}>
            <ConversationSidebar
              activeId={activeConversationId}
              onSelect={(id) => { setActiveConversationId(id); if (mobile) setDrawerOpen(false); }}
              onNew={() => { setActiveConversationId(null); setMessages([]); if (mobile) setDrawerOpen(false); }}
              refreshKey={refreshKey}
              language={language}
            />
          </div>
          {mobile && (
            <div style={{ flex: 1 }} onClick={() => setDrawerOpen(false)} />
          )}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {mobile && (
            <button type="button" onClick={() => setDrawerOpen(true)} aria-label="Open history" style={iconBtn}>
              <SidebarIcon size={14} />
            </button>
          )}
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.04em' }}>
            Zyrix <span style={{ color: '#00D9FF' }}>AI Co-Pilot</span>
          </div>
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

        <SuggestedPrompts language={language} onPick={(p) => handleSubmit(p)} />

        <ChatInput
          onSubmit={handleSubmit}
          disabled={stream.streaming}
          leftSlot={<VoiceMicButton lang={language} onTranscript={() => undefined} />}
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
