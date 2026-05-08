// ================================================================
// <OperationConsole> — Archetype C (Bible v2 §17.3)
// Step wizard + warning banner + live preview for destructive/bulk ops.
// ================================================================
import { useState } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { ARCHETYPE_PALETTES } from '@/design-system/colors';

export default function OperationConsole({
  title, subtitle, warning,
  steps,
  onExecute,
  executeLabel = 'Execute',
  livePreview
}) {
  const palette = ARCHETYPE_PALETTES.console;
  const [stepIdx, setStepIdx] = useState(0);
  const currentStep = steps[stepIdx];
  const isLast = stepIdx === steps.length - 1;

  return (
    <div style={{ background: palette.bg, minHeight: '100%', padding: '4px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{
          fontSize: '22px', fontWeight: 800,
          color: palette.text, margin: 0,
          letterSpacing: '-0.02em', textShadow: 'none'
        }}>{title}</h1>
        <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0', textShadow: 'none' }}>{subtitle}</p>
      </div>

      {warning && (
        <div style={{
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '10px',
          padding: '12px 14px',
          marginBottom: '16px',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start'
        }}>
          <AlertTriangle size={18} color={palette.danger} style={{ flexShrink: 0, marginTop: '1px' }} />
          <div style={{ fontSize: '13px', color: '#7F1D1D', fontWeight: 500, lineHeight: 1.5 }}>{warning}</div>
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        marginBottom: '20px',
        background: palette.surface,
        border: `1px solid ${palette.border}`,
        borderRadius: '10px',
        padding: '14px'
      }}>
        {steps.map((s, i) => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
            <div style={{
              width: '28px', height: '28px',
              borderRadius: '50%',
              background: i < stepIdx ? palette.safe : i === stepIdx ? palette.accent : 'transparent',
              border: i === stepIdx ? `2px solid ${palette.accent}` : `2px solid ${palette.border}`,
              color: i <= stepIdx ? '#FFFFFF' : '#94A3B8',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 250ms ease'
            }}>
              {i < stepIdx ? <Check size={14} /> : i + 1}
            </div>
            <div style={{ marginLeft: '8px', minWidth: 0 }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: i === stepIdx ? palette.accent : '#64748B',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>{s.label}</div>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1,
                height: '2px',
                background: i < stepIdx ? palette.safe : palette.border,
                marginInline: '8px'
              }} />
            )}
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: livePreview ? '1.2fr 1fr' : '1fr',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: palette.surface,
          border: `1px solid ${palette.border}`,
          borderRadius: '12px',
          padding: '20px'
        }}>{currentStep.content}</div>
        {livePreview && (
          <div style={{
            background: palette.surface,
            border: `1px solid ${palette.border}`,
            borderRadius: '12px',
            padding: '20px',
            position: 'sticky',
            top: '12px',
            alignSelf: 'flex-start'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '12px'
            }}>Live Preview</div>
            {livePreview}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => window.history.back()} style={{
          padding: '10px 16px',
          background: 'transparent',
          border: `1px solid ${palette.border}`,
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          color: palette.text
        }}>Cancel</button>
        <div style={{ display: 'flex', gap: '8px' }}>
          {stepIdx > 0 && (
            <button onClick={() => setStepIdx(stepIdx - 1)} style={{
              padding: '10px 16px',
              background: '#FFFFFF',
              border: `1px solid ${palette.border}`,
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              color: palette.text
            }}>← Back</button>
          )}
          <button onClick={() => isLast ? onExecute?.() : setStepIdx(stepIdx + 1)} style={{
            padding: '10px 22px',
            background: isLast ? palette.danger : palette.accent,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>{isLast ? executeLabel : 'Next →'}</button>
        </div>
      </div>
    </div>
  );
}
