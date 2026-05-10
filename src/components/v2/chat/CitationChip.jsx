// ================================================================
// Sprint D-8 — Citation chip placeholder (B.9 stub).
// B.10 replaces with proper deep-link rendering.
// ================================================================
import React from 'react';
import { CINEMATIC } from '@/design-system-v2/cinematic/tokens';

export default function CitationChip({ citation }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px',
      background: 'rgba(0, 217, 255, 0.10)',
      border: '1px solid rgba(0, 217, 255, 0.30)',
      borderRadius: 999,
      color: CINEMATIC.accent.cyanGlow,
      fontSize: 10, fontWeight: 700
    }}>
      {citation?.label || citation?.id || '—'}
    </span>
  );
}
