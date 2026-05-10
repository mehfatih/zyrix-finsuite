// ================================================================
// Sprint D-8 — Message thread.
//
// Renders user + assistant messages in chronological order, with
// auto-scroll to bottom on new content. Auto-scroll yields control
// to the user when they manually scroll up (so they can read older
// messages without being yanked to the bottom mid-read).
// ================================================================
import React, { useEffect, useRef } from 'react';
import UserMessage from './UserMessage.jsx';
import AssistantMessage from './AssistantMessage.jsx';
import TypingIndicator from './TypingIndicator.jsx';

const NEAR_BOTTOM_PX = 120;

export default function MessageThread({ messages, streaming, onAction }) {
  const scrollerRef = useRef(null);
  const stickToBottomRef = useRef(true);

  // Track whether the user is near the bottom; only auto-scroll when so.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return undefined;
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      stickToBottomRef.current = distance < NEAR_BOTTOM_PX;
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Scroll on every message change (or streaming token arrival).
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (stickToBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, streaming]);

  return (
    <div
      ref={scrollerRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 18px',
        scrollBehavior: 'smooth'
      }}
    >
      {(!messages || messages.length === 0) && !streaming && (
        <div style={{
          textAlign: 'center',
          color: '#94A3B8',
          fontSize: 13,
          marginTop: 64
        }}>
          Bir şey sor — Zyrix AI Co-Pilot işletmeni biliyor.
          <div style={{ marginTop: 6, fontSize: 11, fontFamily: 'monospace' }}>
            Cmd+J / Ctrl+J · Esc to close
          </div>
        </div>
      )}

      {messages?.map((m) => {
        if (m.role === 'user') {
          return <UserMessage key={m.id} content={m.content} />;
        }
        if (m.role === 'assistant') {
          return <AssistantMessage key={m.id} message={m} onAction={onAction} />;
        }
        // 'tool' rows aren't user-visible.
        return null;
      })}

      {streaming && <TypingIndicator />}
    </div>
  );
}
