import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Search, Sparkles, ArrowRight, FileText } from 'lucide-react';
import { CUSTOMER_PALETTE } from '@/design-system-v2/colors';
import { SIDEBAR_FLAT, LEGACY_REDIRECTS } from '@/config/v2/sidebarRegistry';

const labelOf = (entry, lang = 'tr') =>
  (entry.labels && (entry.labels[lang] || entry.labels.tr)) || entry.id;

const fuzzyMatch = (query, text) => {
  if (!query) return 1;
  const q = query.toLowerCase();
  const t = (text || '').toLowerCase();
  if (t.includes(q)) return 1;
  // Token-based fallback
  const tokens = q.split(/\s+/).filter(Boolean);
  let hits = 0;
  for (const tok of tokens) if (t.includes(tok)) hits++;
  return tokens.length > 0 ? hits / tokens.length : 0;
};

const QUICK_ACTIONS = [
  { id: 'qa-new-invoice',   icon: 'Plus',     route: '/sales/invoices?new=1', shortcut: '⌘N',     labels: { tr: 'Yeni Fatura Oluştur', en: 'New Invoice', ar: 'فاتورة جديدة' } },
  { id: 'qa-new-customer',  icon: 'Users',    route: '/customers?new=1',      shortcut: '⌘⇧M',    labels: { tr: 'Müşteri Ekle', en: 'Add Customer', ar: 'إضافة عميل' } },
  { id: 'qa-send-reminder', icon: 'Bell',     route: '/voice/payment-reminder?send=1', shortcut: '⌘⇧R', labels: { tr: 'Tahsilat Hatırlatması Gönder', en: 'Send Payment Reminder', ar: 'إرسال تذكير الدفع' } },
  { id: 'qa-tax-cal',       icon: 'Receipt',  route: '/tax/calendar',         shortcut: '⌘T',     labels: { tr: 'Vergi Takvimi', en: 'Tax Calendar', ar: 'تقويم الضرائب' } }
];

const ICON = (name) => Icons[name] || Icons.Circle;

const customerToken = () =>
  localStorage.getItem('zyrix_token') ||
  localStorage.getItem('customerToken') ||
  localStorage.getItem('token');

const kbdStyle = {
  padding: '2px 8px', background: '#F1F5F9', borderRadius: '4px',
  fontSize: '11px', fontWeight: 700, color: CUSTOMER_PALETTE.text.secondary,
  fontFamily: 'monospace'
};
const kbdStyleSm = {
  padding: '1px 5px', background: '#F1F5F9', borderRadius: '3px',
  fontSize: '10px', fontWeight: 700, color: CUSTOMER_PALETTE.text.secondary,
  fontFamily: 'monospace'
};

export default function CommandPalette({ open, onClose, language = 'tr' }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Focus input on open, reset state on close
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setActiveIdx(0);
      setAiSuggestion(null);
    }
  }, [open]);

  // AI suggestion (debounced)
  useEffect(() => {
    if (!open || !query || query.trim().length < 4) {
      setAiSuggestion(null);
      setAiLoading(false);
      return;
    }
    setAiLoading(true);
    const handle = setTimeout(async () => {
      try {
        const tok = customerToken();
        const API = import.meta.env.VITE_API_URL || 'https://finsuite-backend-production.up.railway.app';
        const res = await fetch(`${API}/api/customer/cmdk-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
          body: JSON.stringify({ query: query.trim(), language })
        });
        if (res.ok) {
          const json = await res.json();
          // Backend envelope: { success: true, data: { suggestion } }
          setAiSuggestion(json?.data?.suggestion || null);
        } else {
          setAiSuggestion(null);
        }
      } catch {
        setAiSuggestion(null);
      } finally {
        setAiLoading(false);
      }
    }, 350);
    return () => clearTimeout(handle);
  }, [query, open, language]);

  // Build result groups
  const results = useMemo(() => {
    const trimmedQ = query.trim();
    if (!trimmedQ) {
      return {
        pages:    SIDEBAR_FLAT.slice(0, 6),
        actions:  QUICK_ACTIONS,
        legacy:   []
      };
    }
    const scored = SIDEBAR_FLAT
      .map((p) => ({ p, score: fuzzyMatch(trimmedQ, labelOf(p, language) + ' ' + p.id) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => x.p);

    const actions = QUICK_ACTIONS
      .map((a) => ({ a, score: fuzzyMatch(trimmedQ, labelOf(a, language)) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((x) => x.a);

    const legacy = LEGACY_REDIRECTS
      .map((l) => ({ l, score: fuzzyMatch(trimmedQ, labelOf(l, language)) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((x) => x.l);

    return { pages: scored, actions, legacy };
  }, [query, language]);

  // Flat list for keyboard navigation
  const flatItems = useMemo(() => {
    const list = [];
    if (aiSuggestion) list.push({ kind: 'ai', item: aiSuggestion });
    results.actions.forEach((a) => list.push({ kind: 'action', item: a }));
    results.pages.forEach((p) => list.push({ kind: 'page', item: p }));
    results.legacy.forEach((l) => list.push({ kind: 'legacy', item: l }));
    return list;
  }, [aiSuggestion, results]);

  const onActivate = useCallback((item) => {
    if (!item) return;
    onClose();
    if (item.kind === 'ai') {
      if (item.item?.route) navigate(item.item.route);
    } else if (item.kind === 'page' || item.kind === 'action') {
      navigate(item.item.route);
    } else if (item.kind === 'legacy') {
      navigate(item.item.newRoute);
    }
  }, [navigate, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, flatItems.length - 1)); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); return; }
      if (e.key === 'Enter')     { e.preventDefault(); onActivate(flatItems[activeIdx]); return; }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, flatItems, activeIdx, onActivate, onClose]);

  // Reset active index when results change
  useEffect(() => { setActiveIdx(0); }, [query]);

  if (!open) return null;

  let runningIdx = 0;
  const itemIdx = () => runningIdx++;

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', zIndex: 10000 }}
      />
      <div style={{
        position: 'fixed',
        top: '14vh',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(640px, 92vw)',
        maxHeight: '70vh',
        background: '#FFFFFF',
        borderRadius: '14px',
        boxShadow: '0 24px 60px rgba(15,23,42,0.30)',
        zIndex: 10001,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '14px 18px',
          borderBottom: `1px solid ${CUSTOMER_PALETTE.border.default}`
        }}>
          <Search size={18} color={CUSTOMER_PALETTE.text.tertiary} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Ne yapmak istersin? Sayfa, müşteri, fatura..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontSize: '15px', fontWeight: 500,
              background: 'transparent', color: CUSTOMER_PALETTE.text.primary
            }}
          />
          <kbd style={{
            padding: '2px 6px', background: '#F1F5F9', borderRadius: '4px',
            fontSize: '11px', fontWeight: 700, color: CUSTOMER_PALETTE.text.tertiary,
            fontFamily: 'monospace'
          }}>ESC</kbd>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
          {/* AI suggestion */}
          {(aiLoading || aiSuggestion) && (
            <Section title="AI ÖNERİSİ">
              {aiLoading ? (
                <div style={{ padding: '10px 18px', fontSize: '13px', color: CUSTOMER_PALETTE.text.tertiary }}>
                  AI düşünüyor...
                </div>
              ) : aiSuggestion && (
                <Row
                  active={activeIdx === itemIdx() - 1}
                  onClick={() => onActivate({ kind: 'ai', item: aiSuggestion })}
                  icon={<Sparkles size={16} color={CUSTOMER_PALETTE.accent.violet} />}
                  title={aiSuggestion.title || 'AI önerisi'}
                  subtitle={aiSuggestion.description}
                  trailing={<ArrowRight size={14} color={CUSTOMER_PALETTE.accent.violet} />}
                />
              )}
            </Section>
          )}

          {/* Quick actions */}
          {results.actions.length > 0 && (
            <Section title="HIZLI AKSIYONLAR">
              {results.actions.map((a) => {
                const I = ICON(a.icon);
                const idx = itemIdx();
                return (
                  <Row
                    key={a.id}
                    active={activeIdx === idx}
                    onClick={() => onActivate({ kind: 'action', item: a })}
                    icon={<I size={16} color={CUSTOMER_PALETTE.accent.cyan} />}
                    title={labelOf(a, language)}
                    trailing={<kbd style={kbdStyle}>{a.shortcut}</kbd>}
                  />
                );
              })}
            </Section>
          )}

          {/* Pages */}
          {results.pages.length > 0 && (
            <Section title="SAYFALAR">
              {results.pages.map((p) => {
                const I = ICON(p.icon);
                const idx = itemIdx();
                return (
                  <Row
                    key={p.id}
                    active={activeIdx === idx}
                    onClick={() => onActivate({ kind: 'page', item: p })}
                    icon={<I size={16} color={CUSTOMER_PALETTE.text.secondary} />}
                    title={labelOf(p, language)}
                    subtitle={p.breadcrumb && p.breadcrumb.length > 0 ? labelOf({ labels: p.breadcrumb[0] }, language) : undefined}
                    trailing={p.ai ? <Sparkles size={12} color={CUSTOMER_PALETTE.accent.violet} /> : null}
                  />
                );
              })}
            </Section>
          )}

          {/* Legacy */}
          {results.legacy.length > 0 && (
            <Section title="ESKİ SAYFALAR (yeni adresine yönlendirir)">
              {results.legacy.map((l) => {
                const idx = itemIdx();
                return (
                  <Row
                    key={l.id}
                    active={activeIdx === idx}
                    onClick={() => onActivate({ kind: 'legacy', item: l })}
                    icon={<FileText size={16} color={CUSTOMER_PALETTE.text.tertiary} />}
                    title={labelOf(l, language)}
                    subtitle={`→ ${l.newRoute}`}
                  />
                );
              })}
            </Section>
          )}

          {flatItems.length === 0 && !aiLoading && (
            <div style={{ padding: '40px 18px', textAlign: 'center', color: CUSTOMER_PALETTE.text.tertiary, fontSize: '13px' }}>
              Sonuç bulunamadı.
            </div>
          )}
        </div>

        {/* Footer hints */}
        <div style={{
          padding: '8px 18px',
          borderTop: `1px solid ${CUSTOMER_PALETTE.border.subtle}`,
          display: 'flex', gap: '14px',
          fontSize: '11px', color: CUSTOMER_PALETTE.text.tertiary
        }}>
          <span><kbd style={kbdStyleSm}>↑↓</kbd> hareket</span>
          <span><kbd style={kbdStyleSm}>↵</kbd> aç</span>
          <span><kbd style={kbdStyleSm}>esc</kbd> kapat</span>
          <span style={{ marginInlineStart: 'auto', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={11} color={CUSTOMER_PALETTE.accent.violet} /> Gemini ile güçlendirildi
          </span>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '4px' }}>
      <div style={{
        padding: '8px 18px 4px',
        fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em',
        color: CUSTOMER_PALETTE.text.tertiary, textTransform: 'uppercase'
      }}>{title}</div>
      {children}
    </div>
  );
}

function Row({ active, onClick, icon, title, subtitle, trailing }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '10px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: active ? CUSTOMER_PALETTE.accent.cyanSoft : 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'start',
        fontFamily: 'inherit'
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = '#F8FAFC'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{ flexShrink: 0, display: 'inline-flex' }}>{icon}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: CUSTOMER_PALETTE.text.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: '12px', color: CUSTOMER_PALETTE.text.tertiary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {subtitle}
          </div>
        )}
      </span>
      {trailing && <span style={{ flexShrink: 0 }}>{trailing}</span>}
    </button>
  );
}
