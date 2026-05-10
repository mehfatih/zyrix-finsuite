// ================================================================
// Sprint D-8 — Floating chat bubble entry point.
//
// Renders only when the user is authenticated (AuthContext check).
// Click → toggles ChatContext.open. Cmd+J / Ctrl+J also toggles
// (handler in ChatContext).
//
// The actual ChatPanel is lazy-loaded on first open (decision §7.K).
// Until then this component is just a 56×56 floating gradient orb.
// ================================================================
import React, { Suspense, useEffect, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';

const ChatPanel = React.lazy(() => import('./ChatPanel.jsx'));

function isAuthenticated() {
  try {
    return !!(localStorage.getItem('zyrix_token') ||
              localStorage.getItem('customerToken') ||
              localStorage.getItem('token'));
  } catch { return false; }
}

export default function ChatBubble() {
  const { open, hasMounted, toggleChat } = useChat();
  const [authed, setAuthed] = useState(isAuthenticated);

  // Re-check auth when localStorage changes (e.g., login flow).
  useEffect(() => {
    const onStorage = () => setAuthed(isAuthenticated());
    window.addEventListener('storage', onStorage);
    // Also re-check on focus (covers same-tab login).
    window.addEventListener('focus', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onStorage);
    };
  }, []);

  if (!authed) return null;

  return (
    <>
      <button
        type="button"
        onClick={toggleChat}
        aria-label={open ? 'Close chat' : 'Open chat (Cmd+J)'}
        title={open ? 'Close chat' : 'Open chat (Cmd+J)'}
        style={{
          position: 'fixed',
          bottom: 'clamp(16px, 4vw, 24px)',
          insetInlineEnd: 'clamp(16px, 4vw, 24px)',
          width: 56, height: 56,
          borderRadius: '50%',
          background: open
            ? 'rgba(15, 23, 42, 0.85)'
            : 'radial-gradient(circle at 30% 30%, rgba(157, 78, 221, 0.95), rgba(0, 217, 255, 0.55) 70%, rgba(10, 14, 39, 0.4) 100%)',
          border: '1px solid rgba(157, 78, 221, 0.45)',
          boxShadow: open
            ? '0 4px 18px rgba(0, 0, 0, 0.35)'
            : '0 8px 24px rgba(157, 78, 221, 0.40), 0 0 0 1px rgba(157, 78, 221, 0.30)',
          color: '#FFFFFF',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 90,
          transition: 'transform 200ms ease, box-shadow 200ms ease, background 200ms ease',
          fontFamily: 'inherit'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
        {/* Subtle pulse dot for "ready" state */}
        {!open && <span style={{
          position: 'absolute', top: 8, insetInlineEnd: 8,
          width: 8, height: 8, borderRadius: '50%',
          background: '#06FFA5',
          boxShadow: '0 0 8px #06FFA5',
          animation: 'cn-aurora-pulse 2.5s ease-in-out infinite'
        }} aria-hidden="true" />}
      </button>

      {/* Lazy-loaded panel — only mounts after first open. */}
      {hasMounted && (
        <Suspense fallback={null}>
          <ChatPanel />
        </Suspense>
      )}
    </>
  );
}
