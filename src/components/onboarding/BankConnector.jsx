// ================================================================
// BankConnector — grid of TR banks with connect-state per bank
// ================================================================
import React, { useState } from "react";
import { getBrandPalette, getSuccessPalette, getCustomerPalette } from "../../utils/dashboardPalette";

const BANKS = [
  { id: "is",        name: "İş Bankası",   color: "#003875" },
  { id: "garanti",   name: "Garanti BBVA", color: "#00853F" },
  { id: "ziraat",    name: "Ziraat",       color: "#C8102E" },
  { id: "yapi",      name: "Yapı Kredi",   color: "#002A8E" },
  { id: "akbank",    name: "Akbank",       color: "#E2231A" },
  { id: "halk",      name: "Halkbank",     color: "#005CB9" },
  { id: "vakif",     name: "VakıfBank",    color: "#FFB800" },
  { id: "deniz",     name: "DenizBank",    color: "#005DAC" },
];

export default function BankConnector({ onChange, lang = "tr", t = (s) => s }) {
  const brand = getBrandPalette(String(lang).toLowerCase());
  const success = getSuccessPalette();
  const customer = getCustomerPalette();
  const [connected, setConnected] = useState([]);

  const toggle = (bank) => {
    const next = connected.includes(bank.id)
      ? connected.filter((b) => b !== bank.id)
      : [...connected, bank.id];
    setConnected(next);
    onChange?.(next);
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        {BANKS.map((b) => {
          const isConnected = connected.includes(b.id);
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => toggle(b)}
              aria-pressed={isConnected}
              style={{
                background: isConnected ? `linear-gradient(135deg, ${success.bg}, #fff)` : "#fff",
                border: `1.5px solid ${isConnected ? success.base + "60" : "#E2E8F0"}`,
                borderRadius: 14,
                padding: 16,
                cursor: "pointer",
                textAlign: "start",
                transition: "all .2s",
                boxShadow: isConnected ? `0 6px 18px ${success.base}25` : "0 2px 6px rgba(15,23,42,0.04)",
                position: "relative",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ""; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: b.color, color: "#fff", display: "grid", placeItems: "center", fontSize: 14, fontWeight: 900 }}>
                  {b.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{b.name}</div>
              </div>
              <div style={{
                fontSize: 11, fontWeight: 700,
                color: isConnected ? success.dark : customer.dark,
                background: isConnected ? success.bg : customer.bg,
                border: `1px solid ${isConnected ? success.base + "40" : customer.base + "30"}`,
                padding: "4px 10px", borderRadius: 999,
                display: "inline-block",
              }}>
                {isConnected ? t("banks.connected") : t("banks.connect")}
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: brand.dark, fontWeight: 700 }}>
        {t("banks.more")}
      </div>
    </div>
  );
}
