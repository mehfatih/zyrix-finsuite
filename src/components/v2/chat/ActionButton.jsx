// ================================================================
// Sprint D-8 — Action button placeholder (B.9 stub).
// B.10 replaces with the executing version that calls
// chatApi.executeAction(type, payload).
// ================================================================
import React from 'react';
import { CINEMATIC } from '@/design-system-v2/cinematic/tokens';

export default function ActionButton({ action, onExecute }) {
  return (
    <button
      type="button"
      onClick={onExecute}
      style={{
        padding: '6px 12px',
        background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.85), rgba(0, 217, 255, 0.55))',
        color: '#FFFFFF',
        border: '1px solid rgba(157, 78, 221, 0.45)',
        borderRadius: 999,
        fontSize: 11, fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'inherit'
      }}
    >
      {action?.label || action?.type || 'Run'}
    </button>
  );
}
