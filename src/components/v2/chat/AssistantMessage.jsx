// ================================================================
// Sprint D-8 — Assistant message bubble.
//
// Renders:
//   - Markdown body via markdownLite (decision §7.E)
//   - Inline charts (B.10 — placeholder div per chart for now)
//   - Citation chips (B.10 — placeholder pill per citation for now)
//   - Action buttons (B.10 — placeholder button per action for now)
//
// B.10 swaps the inline placeholders for the proper components.
// ================================================================
import React from 'react';
import { renderMarkdownLite } from './markdownLite';
import InlineChart from './InlineChart.jsx';
import CitationChip from './CitationChip.jsx';
import ActionButton from './ActionButton.jsx';

export default function AssistantMessage({ message, onAction }) {
  const html = renderMarkdownLite(message?.content || '');

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
      {/* Avatar */}
      <div
        style={{
          flexShrink: 0,
          width: 32, height: 32,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, rgba(157, 78, 221, 1), rgba(0, 217, 255, 0.6) 70%)',
          boxShadow: '0 0 10px rgba(157, 78, 221, 0.6)',
          marginTop: 2
        }}
        aria-hidden="true"
      />

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {message?.content && (
          <div
            className="md-body"
            style={{
              color: '#F8FAFC',
              fontSize: 14,
              lineHeight: 1.62,
              wordBreak: 'break-word'
            }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}

        {/* Inline charts */}
        {Array.isArray(message?.charts) && message.charts.length > 0 && (
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {message.charts.map((c, i) => <InlineChart key={i} chart={c} />)}
          </div>
        )}

        {/* Action buttons */}
        {Array.isArray(message?.actions) && message.actions.length > 0 && (
          <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {message.actions.map((a, i) => (
              <ActionButton
                key={i}
                action={a}
                onExecute={() => onAction?.(a)}
              />
            ))}
          </div>
        )}

        {/* Citations */}
        {Array.isArray(message?.citations) && message.citations.length > 0 && (
          <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {message.citations.map((c, i) => <CitationChip key={i} citation={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}
