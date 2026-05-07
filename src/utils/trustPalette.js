// ================================================================
// Phase 13 — Trust Blue palette (security UI ONLY).
// Per build rule #15: never use this for general accents.
// ================================================================

export const TRUST_PALETTE = {
  id:    "trust",
  bg:    "#DBEAFE",       // Trust Blue light
  base:  "#1E40AF",       // Trust Blue
  dark:  "#1E3A8A",       // Trust Blue hover
  chart: "#3B82F6",
};

export const COMPLIANCE_BADGES = {
  kvkk:     { bg: "#E0F2FE", base: "#0EA5E9", dark: "#075985", label: "KVKK" },
  gdpr:     { bg: "#EAEDFF", base: "#6366F1", dark: "#3730A3", label: "GDPR" },
  soc2:     { bg: "#F3EFFF", base: "#8B5CF6", dark: "#5B21B6", label: "SOC 2 Type II" },
  iso27001: { bg: "#FCE7F3", base: "#EC4899", dark: "#9D174D", label: "ISO 27001" },
  pci:      { bg: "#DCFCE7", base: "#10B981", dark: "#047857", label: "PCI DSS" },
};
