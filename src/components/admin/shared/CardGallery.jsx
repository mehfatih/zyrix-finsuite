// ================================================================
// <CardGallery> — Archetype G (Bible v2 §17.7)
// Magazine-style card grid for semi-visual browse pages.
// ================================================================
import { Plus } from 'lucide-react';
import { ARCHETYPE_PALETTES } from '@/design-system/colors';

export default function CardGallery({
  title, subtitle,
  items,
  onItemClick,
  onCreate,
  createLabel = '+ New'
}) {
  const palette = ARCHETYPE_PALETTES.gallery;

  return (
    <div style={{ background: palette.bg, minHeight: '100%' }}>
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
            fontSize: '24px', fontWeight: 800,
            color: palette.text, margin: 0,
            letterSpacing: '-0.02em', textShadow: 'none'
          }}>{title}</h1>
          <p style={{
            fontSize: '13px',
            color: palette.textMuted,
            margin: '4px 0 0',
            textShadow: 'none'
          }}>{subtitle} · {items.length} items</p>
        </div>
        {onCreate && (
          <button onClick={onCreate} style={{
            padding: '10px 18px',
            background: palette.accent,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(245,158,11,0.25)'
          }}>
            <Plus size={14} /> {createLabel}
          </button>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {items.map((item, i) => (
          <div key={item.id}
            onClick={() => onItemClick?.(item)}
            style={{
              background: palette.surface,
              border: `1px solid ${palette.border}`,
              borderRadius: '14px',
              padding: '16px',
              cursor: onItemClick ? 'pointer' : 'default',
              boxShadow: palette.cardShadow,
              transition: 'transform 250ms ease, box-shadow 250ms ease',
              animation: `card-in ${300 + i * 40}ms ease both`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = palette.cardShadow;
            }}>
            {item.image && (
              <div style={{
                width: '100%', aspectRatio: '16/9',
                borderRadius: '10px',
                background: item.image,
                marginBottom: '12px'
              }} />
            )}
            {item.icon && (
              <div style={{
                width: '44px', height: '44px',
                borderRadius: '10px',
                background: palette.accentSoft,
                color: palette.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 800,
                marginBottom: '12px'
              }}>{item.icon}</div>
            )}
            <h3 style={{
              fontSize: '15px',
              fontWeight: 700,
              color: palette.text,
              margin: 0,
              textShadow: 'none'
            }}>{item.title}</h3>
            <p style={{
              fontSize: '13px',
              color: palette.textMuted,
              margin: '4px 0 8px',
              textShadow: 'none',
              lineHeight: 1.4
            }}>{item.subtitle}</p>
            {item.badges && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {item.badges.map((b, idx) => (
                  <span key={idx} style={{
                    padding: '2px 8px',
                    background: b.bg || palette.accentSoft,
                    color: b.color || palette.accent,
                    borderRadius: '999px',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>{b.label}</span>
                ))}
              </div>
            )}
            {item.footer && (
              <div style={{
                fontSize: '12px',
                color: palette.textMuted,
                fontWeight: 600,
                paddingTop: '8px',
                borderTop: `1px solid ${palette.border}`
              }}>{item.footer}</div>
            )}
          </div>
        ))}
      </div>
      <style>{`@keyframes card-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
