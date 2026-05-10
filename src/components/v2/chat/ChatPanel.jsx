// ================================================================
// Sprint D-8 — Chat panel placeholder (B.8 scaffold).
// Real implementation lands in B.12. This shell keeps the bundle
// resolvable so ChatBubble's lazy import works from day one.
// ================================================================
import React from 'react';
import { useChat } from '@/contexts/ChatContext';

export default function ChatPanel() {
  const { open, closeChat } = useChat();
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        bottom: 92,
        insetInlineEnd: 'clamp(16px, 4vw, 24px)',
        width: 'min(480px, calc(100vw - 32px))',
        height: 'min(640px, calc(100vh - 120px))',
        background: '#0A0E27',
        color: '#F8FAFC',
        border: '1px solid rgba(157, 78, 221, 0.35)',
        borderRadius: 16,
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.45)',
        zIndex: 95,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 13,
        textAlign: 'center'
      }}
      onKeyDown={(e) => { if (e.key === 'Escape') closeChat(); }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>
          Zyrix AI Co-Pilot
        </div>
        <div style={{ color: '#CBD5E1', fontSize: 12 }}>
          Chat panel under construction (B.12). Cmd+J still works.
        </div>
      </div>
    </div>
  );
}
