// ================================================================
// /migration — Hub: start, history, exports, concierge
// ================================================================
import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import { getBrandPalette, getMoneyPalette, getCustomerPalette, getMarketPalette } from "../../utils/dashboardPalette";
import PageHeader from "../../components/dashboard/PageHeader";

const TILES = [
  { id: "wizard",    to: "/migration/wizard",    icon: "🚀", palette: "brand"    },
  { id: "history",   to: "/migration/history",   icon: "📜", palette: "customer" },
  { id: "export",    to: "/migration/export",    icon: "📤", palette: "money"    },
  { id: "concierge", to: "/migration/concierge", icon: "🤝", palette: "market"   },
];

export default function MigrationHomePage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("migration");
  const brand = getBrandPalette(String(lang).toLowerCase());
  const money = getMoneyPalette();
  const customer = getCustomerPalette();
  const market = getMarketPalette();
  const palettes = { brand, money, customer, market };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("title")} subtitle={t("subtitle")} icon="📦" palette={brand} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {TILES.map((tile) => {
          const p = palettes[tile.palette];
          const labelKey = tile.id === "wizard" ? "home.start" : tile.id === "history" ? "home.history" : tile.id === "export" ? "home.export" : "home.concierge";
          return (
            <Link
              key={tile.id}
              to={tile.to}
              style={{
                background: "#fff",
                border: `1.5px solid ${p.base}30`,
                borderRadius: 16,
                padding: 22,
                textDecoration: "none",
                color: "inherit",
                boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
                transition: "all .15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 10px 24px ${p.base}25`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 2px 8px rgba(15,23,42,0.04)"; }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 14, background: p.bg, color: p.dark, display: "grid", placeItems: "center", fontSize: 26, marginBottom: 12 }}>
                {tile.icon}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: p.dark }}>{t(labelKey)}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
