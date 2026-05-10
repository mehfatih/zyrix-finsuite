// ================================================================
// Sprint D-8 — Assistant typing indicator.
// Three cyan dots, staggered pulse. Per spec: NOT bouncing dots.
// ================================================================
import React from 'react';

const dotStyle = {
  width: 6, height: 6, borderRadius: '50%',
  background: '#5DFAFF',
  boxShadow: '0 0 6px #00D9FF',
  display: 'inline-block'
};

export default function TypingIndicator() {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '8px 14px',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.10)',
        borderRadius: 14,
        marginBottom: 12
      }}
    >
      <span style={{ ...dotStyle, animation: 'cn-aurora-pulse 1.2s ease-in-out 0s infinite' }} />
      <span style={{ ...dotStyle, animation: 'cn-aurora-pulse 1.2s ease-in-out 0.18s infinite' }} />
      <span style={{ ...dotStyle, animation: 'cn-aurora-pulse 1.2s ease-in-out 0.36s infinite' }} />
    </div>
  );
}
