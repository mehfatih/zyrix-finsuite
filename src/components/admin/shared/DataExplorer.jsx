// ================================================================
// <DataExplorer> — Archetype A (Bible v2 §17.1)
// Filter + table + bulk actions for record list pages.
// ================================================================
import { useState, useMemo } from 'react';
import { Search, X, Download, ChevronUp, ChevronDown } from 'lucide-react';
import { ARCHETYPE_PALETTES } from '@/design-system/colors';

export default function DataExplorer({
  title, subtitle,
  data, columns, filters = [], searchKeys = [],
  rowKey, onRowClick,
  bulkActions = [], primaryCTA, exportEnabled = true,
  aiInsight,
  miniKpis = []
}) {
  const palette = ARCHETYPE_PALETTES.explorer;
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const processed = useMemo(() => {
    let rows = [...data];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) =>
        searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(q))
      );
    }
    Object.entries(activeFilters).forEach(([k, v]) => {
      if (v && v !== '__all__') rows = rows.filter((r) => r[k] === v);
    });
    if (sortKey) {
      rows.sort((a, b) => {
        const av = a[sortKey]; const bv = b[sortKey];
        if (av < bv) return sortDir === 'asc' ? -1 : 1;
        if (av > bv) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return rows;
  }, [data, search, activeFilters, sortKey, sortDir, searchKeys]);

  const pageRows = processed.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleSelect = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const insightText = typeof aiInsight === 'function' ? aiInsight(processed) : aiInsight;

  return (
    <div style={{ background: palette.bg, minHeight: '100%', padding: '0' }}>
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
          }}>
            {subtitle} · {processed.length} of {data.length}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {primaryCTA && (
            <button onClick={primaryCTA.onClick} style={{
              padding: '10px 18px',
              background: primaryCTA.background || palette.accent,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {primaryCTA.icon}
              {primaryCTA.label}
            </button>
          )}
          {exportEnabled && (
            <button style={{
              padding: '10px 14px',
              background: '#FFFFFF',
              color: palette.text,
              border: `1px solid ${palette.border}`,
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Download size={14} /> Export CSV
            </button>
          )}
        </div>
      </div>

      {miniKpis.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${miniKpis.length}, 1fr)`,
          gap: '12px',
          marginBottom: '16px'
        }}>
          {miniKpis.map((k, i) => (
            <div key={i} style={{
              background: palette.surface,
              border: `1px solid ${palette.border}`,
              borderRadius: '10px',
              padding: '12px 14px',
              borderLeft: `3px solid ${k.color || palette.accent}`
            }}>
              <div style={{
                fontSize: '11px',
                color: palette.textMuted,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>{k.label}</div>
              <div style={{
                fontSize: '20px',
                fontWeight: 800,
                color: palette.text,
                marginTop: '4px',
                letterSpacing: '-0.02em'
              }}>{k.value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        background: palette.surface,
        border: `1px solid ${palette.border}`,
        borderRadius: '10px',
        padding: '12px',
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <div style={{
          flex: '1 1 240px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: palette.bg,
          border: `1px solid ${palette.border}`,
          borderRadius: '8px',
          padding: '8px 12px'
        }}>
          <Search size={16} color={palette.textMuted} />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            style={{
              flex: 1, border: 'none', background: 'transparent',
              fontSize: '14px', outline: 'none', color: palette.text
            }}
          />
        </div>
        {filters.map((f) => (
          <select
            key={f.key}
            value={activeFilters[f.key] || '__all__'}
            onChange={(e) => { setActiveFilters({ ...activeFilters, [f.key]: e.target.value }); setPage(0); }}
            style={{
              padding: '8px 12px',
              border: `1px solid ${palette.border}`,
              borderRadius: '8px',
              fontSize: '13px',
              background: palette.surface,
              color: palette.text,
              cursor: 'pointer',
              fontWeight: 600
            }}>
            <option value="__all__">All {f.label}</option>
            {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}
        {(search || Object.values(activeFilters).some((v) => v && v !== '__all__')) && (
          <button onClick={() => { setSearch(''); setActiveFilters({}); }} style={{
            padding: '8px 12px',
            background: 'transparent',
            border: `1px solid ${palette.border}`,
            borderRadius: '8px',
            fontSize: '13px',
            cursor: 'pointer',
            color: palette.text,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {insightText && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(124,58,237,0.06), rgba(34,211,238,0.04))',
          border: '1px solid rgba(124,58,237,0.15)',
          borderRadius: '10px',
          padding: '10px 14px',
          marginBottom: '12px',
          fontSize: '13px',
          color: palette.text,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '14px' }}>💡</span>
          <span style={{ fontWeight: 500 }}>{insightText}</span>
        </div>
      )}

      {selected.size > 0 && bulkActions.length > 0 && (
        <div style={{
          position: 'sticky',
          top: '12px',
          zIndex: 10,
          background: palette.text,
          color: '#FFFFFF',
          borderRadius: '10px',
          padding: '10px 16px',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 8px 24px rgba(15,23,42,0.25)',
          animation: 'slide-down 250ms ease'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600 }}>
            {selected.size} selected
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {bulkActions.map((a, i) => (
              <button key={i} onClick={() => a.onClick(Array.from(selected))} style={{
                padding: '6px 12px',
                background: a.danger ? '#EF4444' : a.primary ? '#10B981' : 'rgba(255,255,255,0.15)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {a.icon} {a.label}
              </button>
            ))}
            <button onClick={() => setSelected(new Set())} style={{
              padding: '6px 10px',
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontSize: '12px'
            }}>Cancel</button>
          </div>
          <style>{`@keyframes slide-down { from { transform: translateY(-12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
        </div>
      )}

      <div style={{
        background: palette.surface,
        border: `1px solid ${palette.border}`,
        borderRadius: '10px',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', minWidth: '720px' }}>
            <thead>
              <tr style={{ background: palette.accentSoft, borderBottom: `1px solid ${palette.border}` }}>
                {bulkActions.length > 0 && (
                  <th style={{ padding: '10px 12px', width: '32px' }}>
                    <input type="checkbox"
                      checked={pageRows.length > 0 && pageRows.every((r) => selected.has(rowKey(r)))}
                      onChange={(e) => {
                        const next = new Set(selected);
                        pageRows.forEach((r) => {
                          if (e.target.checked) next.add(rowKey(r));
                          else next.delete(rowKey(r));
                        });
                        setSelected(next);
                      }}
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th key={col.key} style={{
                    padding: '10px 12px',
                    textAlign: 'start',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: palette.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: col.sortable !== false ? 'pointer' : 'default',
                    width: col.width || 'auto',
                    userSelect: 'none'
                  }}
                  onClick={() => col.sortable !== false && toggleSort(col.key)}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {col.label}
                      {sortKey === col.key && (sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, i) => {
                const id = rowKey(row);
                const isSelected = selected.has(id);
                return (
                  <tr key={id}
                    onClick={(e) => {
                      if (e.target.tagName !== 'INPUT' && onRowClick) onRowClick(row);
                    }}
                    style={{
                      background: isSelected ? palette.selectedRow :
                                  i % 2 === 0 ? palette.surface : palette.bg,
                      cursor: onRowClick ? 'pointer' : 'default',
                      borderBottom: `1px solid ${palette.border}`,
                      transition: 'background 150ms ease',
                      animation: `row-fade ${300 + i * 30}ms ease both`
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = palette.rowHover;
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = i % 2 === 0 ? palette.surface : palette.bg;
                    }}>
                    {bulkActions.length > 0 && (
                      <td style={{ padding: '12px' }}>
                        <input type="checkbox" checked={isSelected}
                          onChange={(e) => { e.stopPropagation(); toggleSelect(id); }} />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} style={{
                        padding: '12px',
                        color: palette.text,
                        fontSize: '14px',
                        fontWeight: 500
                      }}>
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={columns.length + (bulkActions.length ? 1 : 0)} style={{
                    padding: '32px',
                    textAlign: 'center',
                    color: palette.textMuted,
                    fontSize: '13px'
                  }}>
                    No results match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <style>{`@keyframes row-fade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      </div>

      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px',
          fontSize: '13px',
          color: palette.textMuted
        }}>
          <span>Page {page + 1} of {totalPages}</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button disabled={page === 0} onClick={() => setPage(page - 1)} style={paginationBtn(palette, page === 0)}>« Prev</button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)} style={paginationBtn(palette, page >= totalPages - 1)}>Next »</button>
          </div>
        </div>
      )}
    </div>
  );
}

const paginationBtn = (palette, disabled) => ({
  padding: '6px 12px',
  background: disabled ? 'transparent' : palette.surface,
  color: disabled ? palette.textMuted : palette.text,
  border: `1px solid ${palette.border}`,
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: 600,
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.5 : 1
});
