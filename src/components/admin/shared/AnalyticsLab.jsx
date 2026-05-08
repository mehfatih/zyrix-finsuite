// ================================================================
// <AnalyticsLab> — Archetype E (Bible v2 §17.5)
// Dark immersive single-chart shell with controls + insights.
// ================================================================
import { ARCHETYPE_PALETTES } from '@/design-system/colors';

export default function AnalyticsLab({
  title, subtitle,
  controls,
  mainChart,
  insights,
  drillDown
}) {
  const palette = ARCHETYPE_PALETTES.lab;

  return (
    <div style={{
      background: palette.bg,
      minHeight: '100%',
      padding: '20px',
      borderRadius: '14px',
      color: palette.text
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 800,
            color: palette.text,
            margin: 0,
            letterSpacing: '-0.02em',
            textShadow: 'none'
          }}>{title}</h1>
          <p style={{
            fontSize: '13px',
            color: palette.textMuted,
            margin: '4px 0 0',
            textShadow: 'none'
          }}>{subtitle}</p>
        </div>
        {controls && <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{controls}</div>}
      </div>

      <div style={{
        background: palette.surface,
        border: `1px solid ${palette.border}`,
        borderRadius: '14px',
        padding: '24px',
        minHeight: '400px',
        marginBottom: '20px'
      }}>
        {mainChart}
      </div>

      {insights && insights.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`,
          gap: '12px',
          marginBottom: drillDown ? '20px' : 0
        }}>
          {insights.map((ins, i) => (
            <div key={i} style={{
              background: palette.accentSoft,
              border: `1px solid ${palette.border}`,
              borderRadius: '10px',
              padding: '14px'
            }}>
              <div style={{ fontSize: '20px', marginBottom: '6px' }}>{ins.icon}</div>
              <div style={{
                fontSize: '11px',
                color: palette.textMuted,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>{ins.label}</div>
              <div style={{
                fontSize: '20px',
                fontWeight: 800,
                color: palette.text,
                marginTop: '4px'
              }}>{ins.value}</div>
              {ins.trend != null && (
                <div style={{ fontSize: '12px', color: ins.trend >= 0 ? '#10B981' : '#EF4444', marginTop: '2px' }}>
                  {ins.trend > 0 ? '+' : ''}{ins.trend}%
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {drillDown && (
        <div style={{
          background: palette.surface,
          border: `1px solid ${palette.border}`,
          borderRadius: '12px',
          padding: '20px'
        }}>{drillDown}</div>
      )}
    </div>
  );
}
