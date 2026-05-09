// ================================================================
// RecipientAvatarChip — initials avatar inside a glass circle with
// a tone-coloured ring. Used inside RecipientPicker results and the
// recipient management page.
// ================================================================
import { CINEMATIC, RADIUS, TYPE_STACK } from '@/design-system-v2/cinematic/tokens';
import { glowOf } from '@/design-system-v2/cinematic/shadows';

const TONES = ['cyan', 'violet', 'mint', 'amber', 'crimson'];

function initialsOf(name) {
  if (!name) return '?';
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function toneFor(name) {
  // Stable pick from TONES via name hash.
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length];
}

/**
 * @param {{
 *   name: string,
 *   role?: string,
 *   email?: string,
 *   phone?: string,
 *   size?: 'sm' | 'md' | 'lg',
 *   selected?: boolean,
 *   onClick?: () => void,
 *   onRemove?: () => void,
 *   compact?: boolean
 * }} props
 */
export default function RecipientAvatarChip({
  name, role, email, phone, size = 'md', selected = false, onClick, onRemove, compact = false
}) {
  const tone = toneFor(name);
  const dimensions = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;
  const fontSize = size === 'sm' ? 11 : size === 'lg' ? 16 : 13;

  return (
    <span
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => { if (onClick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(e); } }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: compact ? 6 : 10,
        padding: compact ? '4px 10px 4px 4px' : '6px 14px 6px 6px',
        background: selected ? `${CINEMATIC.bg.deepSpace3}` : CINEMATIC.glass.tint1,
        border: `1px solid ${selected ? `rgba(0, 217, 255, 0.5)` : CINEMATIC.glass.border}`,
        borderRadius: 999,
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: selected ? glowOf(tone, 1) : 'none',
        transition: 'box-shadow 200ms ease, border-color 200ms ease',
        color: CINEMATIC.text.pearlWhite,
        fontFamily: TYPE_STACK.body
      }}
    >
      {/* Avatar */}
      <span style={{
        width: dimensions, height: dimensions,
        borderRadius: '50%',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))`,
        border: `1px solid rgba(${rgbOf(tone)}, 0.5)`,
        boxShadow: `0 0 8px rgba(${rgbOf(tone)}, 0.35)`,
        color: '#FFFFFF',
        fontWeight: 700,
        fontSize,
        letterSpacing: '0.04em',
        flexShrink: 0
      }}>{initialsOf(name)}</span>

      {/* Identity */}
      {!compact && (
        <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.1, color: CINEMATIC.text.pearlWhite, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: 180 }}>
            {name}
          </span>
          <span style={{ fontSize: 10, color: CINEMATIC.text.pearlFaint, lineHeight: 1.1, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: 180 }}>
            {role || email || phone || ''}
          </span>
        </span>
      )}

      {onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          aria-label="Remove"
          style={{
            background: 'transparent', border: 'none',
            color: CINEMATIC.text.pearlFaint,
            cursor: 'pointer', padding: 2, fontSize: 14, lineHeight: 1
          }}
        >×</button>
      )}
    </span>
  );
}

function rgbOf(tone) {
  return { cyan: '0, 217, 255', violet: '157, 78, 221', mint: '6, 255, 165', amber: '255, 184, 0', crimson: '255, 61, 90' }[tone] || '0, 217, 255';
}
