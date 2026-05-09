// Customer Dashboard V2 — color tokens.
// See docs/customer-dashboard-bible.md §2 for distribution rules.

export const CUSTOMER_PALETTE = {
  bg: {
    primary:      '#F8FAFC',
    secondary:    '#FFFFFF',
    tertiary:     '#F1F5F9',
    sidebar:      '#0A1530',
    sidebarHover: '#112044',
    inverse:      '#0F172A'
  },
  brand: {
    wine:       '#E30A17',
    wineSoft:   'rgba(227,10,23,0.06)',
    wineBorder: 'rgba(227,10,23,0.18)',
    wineGlow:   'rgba(227,10,23,0.25)'
  },
  accent: {
    cyan:       '#22D3EE',
    cyanSoft:   'rgba(34,211,238,0.08)',
    cyanGlow:   'rgba(34,211,238,0.20)',
    violet:     '#7C3AED',
    violetSoft: 'rgba(124,58,237,0.06)',
    mint:       '#2DD4BF',
    mintSoft:   'rgba(45,212,191,0.08)',
    amber:      '#F59E0B',
    amberSoft:  'rgba(245,158,11,0.08)',
    gold:       '#F59E0B'
  },
  text: {
    primary:        '#0F172A',
    secondary:      '#475569',
    tertiary:       '#94A3B8',
    inverse:        '#F9FAFB',
    onSidebar:      '#FFFFFF',
    onSidebarMuted: 'rgba(255,255,255,0.65)'
  },
  border: {
    subtle:  'rgba(15,23,42,0.06)',
    default: 'rgba(15,23,42,0.10)',
    strong:  'rgba(15,23,42,0.14)'
  },
  status: {
    healthy:  '#10B981',
    info:     '#22D3EE',
    warning:  '#F59E0B',
    critical: '#E30A17',
    neutral:  '#94A3B8'
  }
};

export const KPI_SLOT_COLORS = ['cyan', 'amber', 'mint', 'violet'];

export const getKpiColor = (slot) => {
  const map = {
    cyan:   { fg: CUSTOMER_PALETTE.accent.cyan,   bg: CUSTOMER_PALETTE.accent.cyanSoft   },
    amber:  { fg: CUSTOMER_PALETTE.accent.amber,  bg: CUSTOMER_PALETTE.accent.amberSoft  },
    mint:   { fg: CUSTOMER_PALETTE.accent.mint,   bg: CUSTOMER_PALETTE.accent.mintSoft   },
    violet: { fg: CUSTOMER_PALETTE.accent.violet, bg: CUSTOMER_PALETTE.accent.violetSoft },
    wine:   { fg: CUSTOMER_PALETTE.brand.wine,    bg: CUSTOMER_PALETTE.brand.wineSoft    }
  };
  return map[slot] || map.cyan;
};
