// ================================================================
// <Configurator> — Archetype D (Bible v2 §17.4)
// Tree + editor + live preview for settings/rules pages.
// ================================================================
import { useState } from 'react';
import { ChevronRight, ChevronDown, Save } from 'lucide-react';
import { ARCHETYPE_PALETTES } from '@/design-system/colors';

export default function Configurator({
  title,
  tree,
  selectedKey,
  onSelect,
  editorPanel,
  preview,
  onSave,
  saveDisabled
}) {
  const palette = ARCHETYPE_PALETTES.configurator;

  return (
    <div style={{ background: palette.bg, minHeight: '100%' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <h1 style={{
          fontSize: '22px', fontWeight: 800,
          color: palette.text, margin: 0,
          letterSpacing: '-0.02em', textShadow: 'none'
        }}>{title}</h1>
        <button onClick={onSave} disabled={saveDisabled} style={{
          padding: '10px 18px',
          background: saveDisabled ? '#94A3B8' : palette.saveButton,
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 800,
          cursor: saveDisabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: saveDisabled ? 'none' : '0 4px 12px rgba(16,185,129,0.25)'
        }}>
          <Save size={14} /> Save Changes
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 260px) minmax(0, 1fr)',
        gap: '16px',
        minHeight: '500px'
      }}>
        <div style={{
          background: palette.treeBg,
          border: `1px solid ${palette.border}`,
          borderRadius: '12px',
          padding: '8px',
          alignSelf: 'flex-start'
        }}>
          <Tree nodes={tree} level={0} selectedKey={selectedKey} onSelect={onSelect} accent={palette.accent} accentSoft={palette.accentSoft} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
          <div style={{
            background: '#FFFFFF',
            border: `1px solid ${palette.border}`,
            borderRadius: '12px',
            padding: '20px',
            flex: 1
          }}>{editorPanel}</div>
          {preview && (
            <div style={{
              background: '#FFFFFF',
              border: `1px solid ${palette.border}`,
              borderRadius: '12px',
              padding: '16px'
            }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '10px'
              }}>Live Preview</div>
              {preview}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Tree({ nodes, level, selectedKey, onSelect, accent, accentSoft }) {
  const [expanded, setExpanded] = useState(() => new Set(nodes.map((n) => n.key)));
  const toggle = (key) => {
    const next = new Set(expanded);
    if (next.has(key)) next.delete(key); else next.add(key);
    setExpanded(next);
  };
  return (
    <div>
      {nodes.map((n) => {
        const hasChildren = n.children && n.children.length > 0;
        const isOpen = expanded.has(n.key);
        const isSelected = selectedKey === n.key;
        return (
          <div key={n.key}>
            <div
              onClick={() => { hasChildren && toggle(n.key); onSelect?.(n); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 8px',
                paddingLeft: `${8 + level * 16}px`,
                borderRadius: '6px',
                cursor: 'pointer',
                background: isSelected ? accent : 'transparent',
                color: isSelected ? '#FFFFFF' : '#0F172A',
                fontSize: '13px',
                fontWeight: isSelected ? 700 : 500,
                transition: 'background 150ms ease'
              }}
              onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = accentSoft; }}
              onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
            >
              {hasChildren && (isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />)}
              {n.icon && <span>{n.icon}</span>}
              <span>{n.label}</span>
            </div>
            {hasChildren && isOpen && (
              <Tree nodes={n.children} level={level + 1} selectedKey={selectedKey} onSelect={onSelect} accent={accent} accentSoft={accentSoft} />
            )}
          </div>
        );
      })}
    </div>
  );
}
