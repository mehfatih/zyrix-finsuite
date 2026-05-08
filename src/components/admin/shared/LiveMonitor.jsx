// ================================================================
// <LiveMonitor> — Archetype F (Bible v2 §17.6)
// Streaming feed + heartbeat + status tiles for live observability.
// ================================================================
import { useEffect, useState } from 'react';
import { ARCHETYPE_PALETTES } from '@/design-system/colors';

export default function LiveMonitor({
  title,
  statusTiles,
  eventStream,
  rightPanel,
  refreshInterval = 3000
}) {
  const palette = ARCHETYPE_PALETTES.monitor;
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), refreshInterval);
    return () => clearInterval(id);
  }, [refreshInterval]);

  const statusColor = (s) =>
    s === 'healthy' ? palette.healthy :
    s === 'warning' ? palette.warning :
                      palette.critical;

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
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1 style={{
          fontSize: '22px', fontWeight: 800,
          color: palette.text, margin: 0,
          letterSpacing: '-0.02em', textShadow: 'none'
        }}>{title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '8px', height: '8px',
            borderRadius: '50%',
            background: palette.pulse,
            boxShadow: `0 0 0 0 ${palette.pulse}66`,
            animation: 'live-pulse 1.6s ease-in-out infinite'
          }} />
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            color: palette.pulse,
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}>LIVE</span>
        </div>
      </div>

      {statusTiles && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`,
          gap: '12px',
          marginBottom: '20px'
        }}>
          {statusTiles.map((t, i) => {
            const c = statusColor(t.status);
            return (
              <div key={i} style={{
                background: palette.surface,
                border: `1px solid ${palette.border}`,
                borderLeft: `3px solid ${c}`,
                borderRadius: '10px',
                padding: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{
                    width: '8px', height: '8px',
                    borderRadius: '50%',
                    background: c,
                    animation: t.status !== 'healthy' ? 'live-pulse 1.4s ease-in-out infinite' : 'none'
                  }} />
                  <span style={{
                    fontSize: '11px',
                    color: palette.textMuted,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>{t.label}</span>
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: palette.text
                }}>{t.value}</div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: rightPanel ? 'minmax(0, 1fr) minmax(0, 1fr)' : 'minmax(0, 1fr)',
        gap: '16px'
      }}>
        <div style={{
          background: palette.surface,
          border: `1px solid ${palette.border}`,
          borderRadius: '12px',
          padding: '14px',
          maxHeight: '420px',
          overflow: 'auto'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            color: palette.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '10px'
          }}>Live event stream</div>
          {eventStream.map((e, i) => {
            const c = statusColor(e.severity);
            return (
              <div key={e.id} style={{
                padding: '10px',
                borderLeft: `3px solid ${c}`,
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '6px',
                marginBottom: '6px',
                animation: i === 0 ? 'event-in 400ms ease' : 'none'
              }}>
                <div style={{ fontSize: '11px', color: palette.textMuted, marginBottom: '2px' }}>
                  {e.time}
                </div>
                <div style={{ fontSize: '13px', color: palette.text }}>{e.text}</div>
              </div>
            );
          })}
        </div>
        {rightPanel && (
          <div style={{
            background: palette.surface,
            border: `1px solid ${palette.border}`,
            borderRadius: '12px',
            padding: '20px'
          }}>{rightPanel}</div>
        )}
      </div>

      <style>{`
        @keyframes live-pulse {
          0%, 100% { box-shadow: 0 0 0 0 ${palette.pulse}66; }
          50% { box-shadow: 0 0 0 6px ${palette.pulse}00; }
        }
        @keyframes event-in {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
