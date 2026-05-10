// ================================================================
// Sprint D-8 — Action button (executes allowlisted server action).
//
// Action shape: { label, type, payload }. Click → calls
// executeAction(type, payload) from chat API client → backend
// /api/customer/chat/actions/:type (B.6, allowlisted: create_reminder,
// dismiss_insight, mark_invoice_paid).
//
// States: idle → loading → done | error. Done state is sticky
// so the user has a permanent receipt of what they triggered.
// onExecute callback is optional — if the parent passes one, it
// fires on idle click instead of the default executeAction path
// (used by AssistantMessage to forward to a higher-level handler).
// ================================================================
import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { executeAction } from '@/api/v2/chat';

export default function ActionButton({ action, onExecute }) {
  const [state, setState] = useState('idle'); // 'idle' | 'loading' | 'done' | 'error'
  const [error, setError] = useState(null);

  const run = async () => {
    if (state !== 'idle') return;
    setState('loading');
    setError(null);
    try {
      if (onExecute) {
        await onExecute(action);
      } else {
        await executeAction(action.type, action.payload);
      }
      setState('done');
    } catch (err) {
      setError(err?.message || String(err));
      setState('error');
    }
  };

  const baseStyle = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '6px 12px',
    borderRadius: 999,
    fontSize: 11, fontWeight: 700,
    fontFamily: 'inherit',
    cursor: state === 'idle' ? 'pointer' : 'default',
    transition: 'background 200ms ease, border-color 200ms ease'
  };

  if (state === 'done') {
    return (
      <span style={{
        ...baseStyle,
        background: 'rgba(6, 168, 126, 0.12)',
        color: '#06A87E',
        border: '1px solid rgba(6, 168, 126, 0.35)',
        cursor: 'default'
      }}>
        <CheckCircle2 size={11} />
        {action?.label || action?.type || 'Done'}
      </span>
    );
  }

  if (state === 'error') {
    return (
      <span
        style={{
          ...baseStyle,
          background: 'rgba(255, 61, 90, 0.12)',
          color: '#FF3D5A',
          border: '1px solid rgba(255, 61, 90, 0.36)'
        }}
        title={error || 'error'}
      >
        <AlertCircle size={11} />
        {action?.label || action?.type || 'Error'}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={state !== 'idle'}
      style={{
        ...baseStyle,
        background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.85), rgba(0, 217, 255, 0.55))',
        color: '#FFFFFF',
        border: '1px solid rgba(157, 78, 221, 0.45)'
      }}
    >
      {state === 'loading'
        ? <Loader2 size={11} style={{ animation: 'cn-aurora-rotate 0.9s linear infinite' }} />
        : null}
      {action?.label || action?.type || 'Run'}
    </button>
  );
}
