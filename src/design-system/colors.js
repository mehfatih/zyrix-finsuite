// ================================================================
// Zyrix Admin design-system colors.
// Used by every Overview page (Customers, Revenue, Plans, Support,
// Analytics, Compliance, System, Marketing, Mali Müşavir) so the
// 4 KPI tiles always read in the same positional palette.
// ================================================================

// KPI Card Color System (positional — same order on every Overview page)
export const KPI_COLORS = [
  {
    key: "primary",
    name: "Wine Red",
    color: "#E30A17",
    bg: "rgba(227, 10, 23, 0.08)",
    border: "rgba(227, 10, 23, 0.25)",
    glow: "rgba(227, 10, 23, 0.35)",
  },
  {
    key: "gold",
    name: "Gold",
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.10)",
    border: "rgba(245, 158, 11, 0.30)",
    glow: "rgba(245, 158, 11, 0.35)",
  },
  {
    key: "cyan",
    name: "Cyan Glow",
    color: "#22D3EE",
    bg: "rgba(34, 211, 238, 0.10)",
    border: "rgba(34, 211, 238, 0.30)",
    glow: "rgba(34, 211, 238, 0.35)",
  },
  {
    key: "violet",
    name: "AI Violet",
    color: "#7C3AED",
    bg: "rgba(124, 58, 237, 0.10)",
    border: "rgba(124, 58, 237, 0.30)",
    glow: "rgba(124, 58, 237, 0.35)",
  },
];

// Analytics Block Colors (4 distinct themes)
export const ANALYTICS_COLORS = {
  distribution: {
    primary: "#1A56DB",
    gradient: ["#1A56DB", "#22D3EE", "#7C3AED", "#E30A17"],
  },
  geographic: {
    primary: "#2DD4BF",
    bg: "rgba(45, 212, 191, 0.08)",
    border: "rgba(45, 212, 191, 0.25)",
  },
  risk: {
    primary: "#F59E0B",
    danger: "#EF4444",
    bg: "rgba(245, 158, 11, 0.08)",
    border: "rgba(245, 158, 11, 0.25)",
  },
  ranking: {
    gold: "#FFD700",
    silver: "#C0C0C0",
    bronze: "#CD7F32",
    bg: "rgba(255, 215, 0, 0.06)",
    border: "rgba(255, 215, 0, 0.25)",
  },
};

// Semantic colors
export const SEMANTIC = {
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
  ai: "#7C3AED",
};

// ================================================================
// Sub-Page Archetype Palettes (Bible v2 §16)
// ================================================================
// Sub-pages do NOT use the positional Wine/Gold/Cyan/Violet of
// Overviews. Each archetype has its own palette so users can feel
// the shift from "strategic dashboard" to "operational tool".
// ================================================================

export const ARCHETYPE_PALETTES = {
  // A: Data Explorer — calm, neutral, lets data shine
  explorer: {
    bg: '#FAFBFC',
    surface: '#FFFFFF',
    border: 'rgba(15, 23, 42, 0.08)',
    accent: '#0F172A',
    accentSoft: 'rgba(15, 23, 42, 0.06)',
    text: '#0F172A',
    textMuted: '#64748B',
    sparkline: '#3B82F6',
    rowHover: 'rgba(227, 10, 23, 0.04)',
    selectedRow: 'rgba(59, 130, 246, 0.08)',
  },

  // B: Entity Profile — premium, focused, biographical
  profile: {
    bg: '#FFFFFF',
    surface: '#FAFAFA',
    border: 'rgba(0, 0, 0, 0.08)',
    accent: '#1E293B',
    accentSoft: 'rgba(30, 41, 59, 0.06)',
    timeline: '#7C3AED',
    graph: '#22D3EE',
    text: '#0F172A',
    textMuted: '#64748B',
  },

  // C: Operation Console — high-stakes, vigilant, red-tinted
  console: {
    bg: '#FFFBFB',
    surface: '#FFFFFF',
    border: 'rgba(239, 68, 68, 0.15)',
    accent: '#DC2626',
    accentSoft: 'rgba(220, 38, 38, 0.08)',
    safe: '#10B981',
    danger: '#EF4444',
    progress: '#E30A17',
    text: '#0F172A',
  },

  // D: Configurator — focused, editorial, violet
  configurator: {
    bg: '#FAFAFC',
    surface: '#FFFFFF',
    border: 'rgba(124, 58, 237, 0.15)',
    accent: '#7C3AED',
    accentSoft: 'rgba(124, 58, 237, 0.06)',
    treeBg: '#F4F3F8',
    saveButton: '#10B981',
    text: '#0F172A',
  },

  // E: Analytics Lab — dark, immersive, single-focus
  lab: {
    bg: '#0B1020',
    surface: '#111827',
    border: 'rgba(255, 255, 255, 0.08)',
    accent: '#22D3EE',
    accentSoft: 'rgba(34, 211, 238, 0.10)',
    text: '#F9FAFB',
    textMuted: '#94A3B8',
    chartLine: '#22D3EE',
    chartFill: 'rgba(34, 211, 238, 0.15)',
  },

  // F: Live Monitor — alive, pulse-y, mint+amber
  monitor: {
    bg: '#0F172A',
    surface: '#1E293B',
    border: 'rgba(45, 212, 191, 0.2)',
    accent: '#2DD4BF',
    accentSoft: 'rgba(45, 212, 191, 0.08)',
    healthy: '#10B981',
    warning: '#F59E0B',
    critical: '#EF4444',
    text: '#F9FAFB',
    pulse: '#2DD4BF',
  },

  // G: Card Gallery — airy, magazine-like
  gallery: {
    bg: '#FAFAFA',
    surface: '#FFFFFF',
    border: 'rgba(0, 0, 0, 0.06)',
    accent: '#F59E0B',
    accentSoft: 'rgba(245, 158, 11, 0.06)',
    cardShadow: '0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)',
    text: '#0F172A',
    textMuted: '#64748B',
  },
};

export const getArchetypePalette = (archetype) => ARCHETYPE_PALETTES[archetype];
