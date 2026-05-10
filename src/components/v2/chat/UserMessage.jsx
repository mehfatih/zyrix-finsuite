// ================================================================
// Sprint D-8 — User message bubble (right-aligned, glass tint).
// ================================================================
import React from 'react';

export default function UserMessage({ content }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
      <div
        style={{
          maxWidth: '78%',
          padding: '10px 14px',
          background: 'rgba(157, 78, 221, 0.16)',
          border: '1px solid rgba(157, 78, 221, 0.32)',
          borderRadius: 14,
          borderTopRightRadius: 4,
          color: '#F8FAFC',
          fontSize: 14,
          lineHeight: 1.55,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {content}
      </div>
    </div>
  );
}
