// ================================================================
// Sprint D-8 — Inline chart placeholder (B.9 stub).
// B.10 replaces with proper chart rendering (sparkline,
// cash_forecast, etc.).
// ================================================================
import React from 'react';
import { CINEMATIC, RADIUS } from '@/design-system-v2/cinematic/tokens';

export default function InlineChart({ chart }) {
  return (
    <div style={{
      padding: '10px 12px',
      background: CINEMATIC.glass.tint1,
      border: `1px solid ${CINEMATIC.glass.border}`,
      borderRadius: RADIUS.sm,
      fontSize: 11,
      color: CINEMATIC.text.pearlFaint
    }}>
      [chart: {chart?.type || 'unknown'}]
    </div>
  );
}
