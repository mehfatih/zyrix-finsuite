// ================================================================
// Sprint D-8 — Citation chip with deep-link routing.
//
// Citation shape: { type, id, label }. The engine derives these
// from tool results (B.3 derive() helper):
//   type='customer'  → /customers (filter by name client-side)
//   type='invoice'   → /sales/invoices?id=...
//   type='insight'   → /notifications (insight surfaces today)
//
// Click navigates via react-router. Subtle hover state + cyan
// glow per design tokens.
// ================================================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, User, Lightbulb, Link2 } from 'lucide-react';
import { CINEMATIC } from '@/design-system-v2/cinematic/tokens';

const TYPE_ICONS = {
  invoice:  FileText,
  customer: User,
  insight:  Lightbulb
};

function routeFor(citation) {
  if (!citation) return null;
  switch (citation.type) {
    case 'invoice':  return citation.id ? `/sales/invoices?id=${encodeURIComponent(citation.id)}` : '/sales/invoices';
    case 'customer': return '/customers';
    case 'insight':  return '/notifications';
    default:         return null;
  }
}

export default function CitationChip({ citation }) {
  const navigate = useNavigate();
  const Icon = TYPE_ICONS[citation?.type] || Link2;
  const route = routeFor(citation);

  const handleClick = () => {
    if (route) navigate(route);
  };

  const styleBase = {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 8px',
    background: 'rgba(0, 217, 255, 0.10)',
    border: '1px solid rgba(0, 217, 255, 0.30)',
    borderRadius: 999,
    color: CINEMATIC.accent.cyanGlow,
    fontSize: 10, fontWeight: 700,
    cursor: route ? 'pointer' : 'default',
    fontFamily: 'inherit',
    transition: 'box-shadow 160ms ease'
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!route}
      style={styleBase}
      title={route ? `Open ${citation.type}` : citation?.type}
      onMouseEnter={(e) => { if (route) e.currentTarget.style.boxShadow = '0 0 0 1px rgba(0, 217, 255, 0.45)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
    >
      <Icon size={10} />
      <span>{citation?.label || citation?.id || '—'}</span>
    </button>
  );
}
