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
