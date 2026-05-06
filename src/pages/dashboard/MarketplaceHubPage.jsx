// ============================================================
// Zyrix FinSuite - Marketplace Hub Page (20 providers)
// Track C - Sprint 2 Feature 4 (Frontend)
// ============================================================

import React, { useState, useEffect } from "react";
import { useI18n } from "../../i18n/i18n";
import { marketplaceAPI } from "../../services/api";

const COUNTRY_FLAGS = { TR: "🇹🇷", SA: "🇸🇦", AE: "🇦🇪" };
const COUNTRY_LABELS = { TR: "Turkiye", SA: "Suudi Arabistan", AE: "Birlesik Arap Emirlikleri" };

const SETTLEMENT_STATUS = {
  PENDING:     { bg: "#FEF3C7", color: "#92400E", label: "Bekleniyor" },
  PAID:        { bg: "#DBEAFE", color: "#1E40AF", label: "Odendi" },
  RECONCILED:  { bg: "#D1FAE5", color: "#065F46", label: "Eslestirildi" },
  DISCREPANCY: { bg: "#FEE2E2", color: "#991B1B", label: "Fark Var" },
};

const TXT_MP = {
  TR: { cancel: "Iptal", marketplace: "Pazaryeri", period: "Donem", gross: "Brut", commission: "Komisyon", expected: "Beklenen", status: "Durum", diff: "Fark", date: "Tarih", order: "Siparis", customer: "Musteri", product: "Urun", quantity: "Adet" },
  EN: { cancel: "Cancel", marketplace: "Marketplace", period: "Period", gross: "Gross", commission: "Commission", expected: "Expected", status: "Status", diff: "Diff", date: "Date", order: "Order", customer: "Customer", product: "Product", quantity: "Qty" },
  AR: { cancel: "إلغاء", marketplace: "المتجر", period: "الفترة", gross: "الإجمالي", commission: "العمولة", expected: "متوقع", status: "الحالة", diff: "الفرق", date: "التاريخ", order: "الطلب", customer: "العميل", product: "المنتج", quantity: "الكمية" },
};

export default function MarketplaceHubPage() {
  const { lang } = useI18n();
  const t = TXT_MP[lang] || TXT_MP.TR;

  const [providers, setProviders] = useState([]);
  const [connections, setConnections] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("hub"); // hub | settlements | orders
  const [filterProvider, setFilterProvider] = useState("");
  const [connectModal, setConnectModal] = useState(null); // provider key

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, c, s, o] = await Promise.all([
        marketplaceAPI.providers(),
        marketplaceAPI.connections(),
        marketplaceAPI.settlements(),
        marketplaceAPI.orders(),
      ]);
      setProviders(p?.data || []);
      setConnections(c?.data || []);
      setSettlements(s?.data || []);
      setOrders(o?.data?.rows || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onSyncAll = async () => {
    if (connections.length === 0) {
      alert("Hic baglanti yok. Once bir magaza baglayin.");
      return;
    }
    setSyncing(true);
    try {
      const r = await marketplaceAPI.syncAll();
      const t = r?.data?.totals;
      if (t) {
        alert(
          "Toplu senkronizasyon tamam!\n\n" +
          "Islenen baglanti: " + r.data.connectionsProcessed + "\n" +
          "Yeni siparis: " + t.ordersInserted + "\n" +
          "Yeni hakkedis: " + t.settlementsInserted + "\n" +
          "Bankayla eslestirilen: " + t.reconciledCount
        );
      }
      await load();
    } catch (e) {
      alert("Hata: " + e.message);
    } finally {
      setSyncing(false);
    }
  };

  const onSyncOne = async (id) => {
    setSyncing(true);
    try {
      const r = await marketplaceAPI.syncOne(id);
      const result = r?.data;
      if (result) {
        alert("Senkronizasyon tamam!\nYeni siparis: " + result.ordersInserted +
              "\nYeni hakkedis: " + result.settlementsInserted +
              "\nEslestirilen: " + result.reconciledCount);
      }
      await load();
    } catch (e) {
      alert("Hata: " + e.message);
    } finally {
      setSyncing(false);
    }
  };

  const onDisconnect = async (id, providerName) => {
    if (!confirm(providerName + " baglantisini silmek istediginizden emin misiniz?")) return;
    try {
      await marketplaceAPI.disconnect(id);
      await load();
    } catch (e) {
      alert("Hata: " + e.message);
    }
  };

  // Group providers by country
  const byCountry = providers.reduce((acc, p) => {
    if (!acc[p.country]) acc[p.country] = [];
    acc[p.country].push(p);
    return acc;
  }, {});

  const connByProviderKey = new Map(connections.map((c) => [c.provider, c]));

  // Filter settlements by provider
  const filteredSettlements = filterProvider
    ? settlements.filter((s) => s.provider === filterProvider)
    : settlements;
  const filteredOrders = filterProvider
    ? orders.filter((o) => o.provider === filterProvider)
    : orders;

  const totalNet = filteredSettlements.reduce((s, x) => s + Number(x.netPayout || 0), 0);
  const reconciled = filteredSettlements.filter((s) => s.status === "RECONCILED").length;
  const pending = filteredSettlements.filter((s) => s.status === "PENDING" || s.status === "PAID").length;
  const discrepancies = filteredSettlements.filter((s) => s.status === "DISCREPANCY").length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#1E1B4B" }}>
            🌐 Pazaryeri Merkezi
          </h1>
          <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: 13 }}>
            20 pazaryeri · Otomatik banka mutabakati · {connections.length} aktif baglanti
          </p>
        </div>
        <button
          onClick={onSyncAll}
          disabled={syncing || connections.length === 0}
          style={{ ...btnPrimary, opacity: syncing ? 0.6 : 1, cursor: connections.length === 0 ? "not-allowed" : "pointer" }}
        >
          {syncing ? "Senkronize Ediliyor..." : "🔄 Hepsini Senkronize Et"}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1.5px solid #E2E8F8" }}>
        <TabBtn active={tab === "hub"} onClick={() => setTab("hub")}>Magazalar (20)</TabBtn>
        <TabBtn active={tab === "settlements"} onClick={() => setTab("settlements")}>Hakkedisler ({settlements.length})</TabBtn>
        <TabBtn active={tab === "orders"} onClick={() => setTab("orders")}>Siparisler ({orders.length})</TabBtn>
      </div>

      {error && <div style={{ padding: 14, background: "#FEE2E2", color: "#991B1B", borderRadius: 10, marginBottom: 16 }}>{error}</div>}

      {/* HUB TAB */}
      {tab === "hub" && !loading && (
        <div>
          {["TR", "SA", "AE"].map((country) => (
            <div key={country} style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 16, color: "#1E1B4B", marginBottom: 12 }}>
                {COUNTRY_FLAGS[country]} {COUNTRY_LABELS[country]} · {(byCountry[country] || []).length} pazaryeri
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
                {(byCountry[country] || []).map((p) => {
                  const conn = connByProviderKey.get(p.key);
                  return (
                    <ProviderCard
                      key={p.key}
                      provider={p}
                      connection={conn}
                      onConnect={() => setConnectModal(p)}
                      onSync={() => onSyncOne(conn.id)}
                      onDisconnect={() => onDisconnect(conn.id, p.displayName)}
                      syncing={syncing}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SETTLEMENTS / ORDERS - shared filter */}
      {(tab === "settlements" || tab === "orders") && (
        <div>
          {/* Stats + Filter */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16, alignItems: "center" }}>
            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: 10, border: "1.5px solid #E2E8F8", fontSize: 13 }}
            >
              <option value="">Tum pazaryerleri</option>
              {connections.map((c) => {
                const p = providers.find((x) => x.key === c.provider);
                return <option key={c.id} value={c.provider}>{p?.displayName || c.provider}</option>;
              })}
            </select>
          </div>

          {tab === "settlements" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginBottom: 16 }}>
                <StatCard label="Toplam Net" value={fmtCurrency(totalNet)} color="#10B981" />
                <StatCard label="Eslestirilen" value={reconciled} color="#3B82F6" />
                <StatCard label="Bekleyen" value={pending} color="#F59E0B" />
                <StatCard label="Fark Var" value={discrepancies} color={discrepancies > 0 ? "#EF4444" : "#94A3B8"} />
              </div>
              <SettlementsTable rows={filteredSettlements} providers={providers} />
            </>
          )}

          {tab === "orders" && (
            <OrdersTable rows={filteredOrders} providers={providers} />
          )}
        </div>
      )}

      {loading && <div style={{ padding: 40, textAlign: "center", color: "#64748B" }}>Yukleniyor...</div>}

      {connectModal && (
        <ConnectModal
          provider={connectModal}
          onClose={() => setConnectModal(null)}
          onConnected={() => { setConnectModal(null); load(); }}
        />
      )}
    </div>
  );
}

// ============================================================
// Components
// ============================================================

function ProviderCard({ provider, connection, onConnect, onSync, onDisconnect, syncing }) {
  const isConnected = !!connection;
  return (
    <div
      style={{
        background: "#fff",
        border: "1.5px solid " + (isConnected ? provider.brandColor + "40" : "#E2E8F8"),
        borderLeft: "4px solid " + provider.brandColor,
        borderRadius: 12,
        padding: 14,
        position: "relative",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, color: "#1E1B4B" }}>{provider.displayName}</div>
          <div style={{ fontSize: 10, color: "#64748B", textTransform: "uppercase", marginTop: 2 }}>
            {provider.category} · {(provider.commissionRate * 100).toFixed(0)}% kom.
          </div>
        </div>
        {isConnected && (
          <span style={{
            background: "#D1FAE5", color: "#065F46",
            padding: "2px 8px", borderRadius: 10, fontSize: 9, fontWeight: 700,
          }}>
            ✓ AKTIF
          </span>
        )}
      </div>

      {isConnected && connection.lastSyncAt && (
        <div style={{ fontSize: 10, color: "#94A3B8", marginBottom: 8 }}>
          Son: {new Date(connection.lastSyncAt).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}
        </div>
      )}

      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        {!isConnected && (
          <button onClick={onConnect} style={{ ...btnSmall, background: provider.brandColor, color: "#fff", flex: 1 }}>
            Bagla
          </button>
        )}
        {isConnected && (
          <>
            <button onClick={onSync} disabled={syncing} style={{ ...btnSmall, background: "#F8FAFF", color: "#6C3AFF", border: "1.5px solid #C7D2FE", flex: 1 }}>
              🔄 Sync
            </button>
            <button onClick={onDisconnect} style={{ ...btnSmall, background: "#FEE2E2", color: "#991B1B", border: "1.5px solid #FCA5A5" }}>
              🗑
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ConnectModal({ provider, onClose, onConnected }) {
  const { lang } = useI18n();
  const t = TXT_MP[lang] || TXT_MP.TR;

  const [sellerId, setSellerId] = useState("");
  const [storeName, setStoreName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!sellerId.trim()) { alert("Satici ID gerekli"); return; }
    setBusy(true);
    try {
      await marketplaceAPI.connect({
        provider: provider.key,
        sellerId: sellerId.trim(),
        storeName: storeName.trim() || undefined,
        apiKey: apiKey.trim() || undefined,
        apiSecret: apiSecret.trim() || undefined,
      });
      onConnected();
    } catch (e) {
      alert("Baglanti hatasi: " + e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, maxWidth: 480, width: "90%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 20 }}>{COUNTRY_FLAGS[provider.country]}</span>
          <h2 style={{ margin: 0, fontSize: 18, color: "#1E1B4B" }}>{provider.displayName}</h2>
        </div>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: "#64748B" }}>
          Sandbox modunda ornek veri uretilir. Gercek API anahtarlari sonra eklenebilir.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Field label="Satici ID *" value={sellerId} onChange={setSellerId} placeholder="ornek: 12345" />
          <Field label="Magaza Adi" value={storeName} onChange={setStoreName} placeholder={provider.displayName + " Magazam"} />
          <Field label="API Key (opsiyonel)" value={apiKey} onChange={setApiKey} />
          <Field label="API Secret (opsiyonel)" value={apiSecret} onChange={setApiSecret} type="password" />
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 18 }}>
          <button onClick={onClose} disabled={busy} style={btnSecondary}>{t.cancel}</button>
          <button onClick={submit} disabled={busy || !sellerId.trim()} style={{ ...btnPrimary, background: provider.brandColor, opacity: busy ? 0.6 : 1 }}>
            {busy ? "Kaydediliyor..." : "Bagla"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SettlementsTable({ rows, providers }) {
  const { lang } = useI18n();
  const t = TXT_MP[lang] || TXT_MP.TR;

  if (rows.length === 0) {
    return <EmptyState icon="📊" message="Hic hakkedis yok. Once bir magaza baglayip senkronize edin." />;
  }
  const provMap = new Map(providers.map((p) => [p.key, p]));
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #E2E8F8", overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: "#F8FAFF", borderBottom: "1.5px solid #E2E8F8" }}>
            <th style={th}>{t.marketplace}</th>
            <th style={th}>{t.period}</th>
            <th style={th}>{t.gross}</th>
            <th style={th}>{t.commission}</th>
            <th style={th}>Net</th>
            <th style={th}>{t.expected}</th>
            <th style={th}>{t.status}</th>
            <th style={th}>{t.diff}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const cfg = SETTLEMENT_STATUS[s.status] || SETTLEMENT_STATUS.PENDING;
            const prov = provMap.get(s.provider);
            return (
              <tr key={s.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={td}>
                  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 4, background: prov?.brandColor || "#94A3B8", marginRight: 6 }} />
                  {prov?.displayName || s.provider}
                </td>
                <td style={td}>{fmtDate(s.periodStart)}</td>
                <td style={td}>{fmtCurrency(s.grossSales, s.currency)}</td>
                <td style={td}>{fmtCurrency(s.totalCommission, s.currency)}</td>
                <td style={{ ...td, fontWeight: 700, color: "#1E1B4B" }}>{fmtCurrency(s.netPayout, s.currency)}</td>
                <td style={td}>{s.expectedPayoutDate ? fmtDate(s.expectedPayoutDate) : "—"}</td>
                <td style={td}>
                  <span style={{ background: cfg.bg, color: cfg.color, padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                    {cfg.label}
                  </span>
                </td>
                <td style={{ ...td, color: s.discrepancy && Math.abs(Number(s.discrepancy)) > 0.5 ? "#DC2626" : "#10B981" }}>
                  {s.discrepancy !== null && s.discrepancy !== undefined ? fmtCurrency(s.discrepancy, s.currency) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function OrdersTable({ rows, providers }) {
  const { lang } = useI18n();
  const t = TXT_MP[lang] || TXT_MP.TR;

  if (rows.length === 0) {
    return <EmptyState icon="📦" message="Hic siparis yok." />;
  }
  const provMap = new Map(providers.map((p) => [p.key, p]));
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #E2E8F8", overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: "#F8FAFF", borderBottom: "1.5px solid #E2E8F8" }}>
            <th style={th}>{t.marketplace}</th>
            <th style={th}>{t.date}</th>
            <th style={th}>{t.order}</th>
            <th style={th}>{t.customer}</th>
            <th style={th}>{t.product}</th>
            <th style={th}>{t.quantity}</th>
            <th style={th}>Net</th>
            <th style={th}>{t.status}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => {
            const prov = provMap.get(o.provider);
            return (
              <tr key={o.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={td}>
                  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 4, background: prov?.brandColor || "#94A3B8", marginRight: 6 }} />
                  {prov?.displayName || o.provider}
                </td>
                <td style={td}>{fmtDate(o.orderDate)}</td>
                <td style={{ ...td, fontFamily: "monospace" }}>{o.orderNumber}</td>
                <td style={td}>{o.customerName || "—"}</td>
                <td style={td}>{o.productName || "—"}</td>
                <td style={td}>{o.quantity}</td>
                <td style={{ ...td, fontWeight: 700 }}>{fmtCurrency(o.netAmount, o.currency)}</td>
                <td style={td}>
                  <span style={{ background: "#F1F5F9", color: "#64748B", padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 700 }}>
                    {o.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// Helpers
// ============================================================

function StatCard({ label, value, color }) {
  return (
    <div style={{ padding: 12, background: "#fff", borderRadius: 10, border: "1.5px solid #E2E8F8" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: color }}>{value}</div>
    </div>
  );
}

function TabBtn({ active, children, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: "transparent", border: "none",
      padding: "10px 14px", fontWeight: active ? 800 : 600,
      color: active ? "#6C3AFF" : "#64748B",
      borderBottom: active ? "2.5px solid #6C3AFF" : "2.5px solid transparent",
      marginBottom: -2, cursor: "pointer", fontSize: 13,
    }}>{children}</button>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 4 }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #E2E8F8", borderRadius: 10, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
    </div>
  );
}

function EmptyState({ icon, message }) {
  return (
    <div style={{ padding: 40, textAlign: "center", background: "#F8FAFF", borderRadius: 12, border: "1.5px dashed #E2E8F8" }}>
      <div style={{ fontSize: 40, marginBottom: 8 }}>{icon}</div>
      <div style={{ color: "#64748B", fontSize: 13 }}>{message}</div>
    </div>
  );
}

function fmtCurrency(n, cur) {
  if (n === null || n === undefined) return "—";
  return Number(n).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " " + (cur || "TRY");
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR");
}

const th = { padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" };
const td = { padding: "10px 12px", color: "#1E1B4B" };

const btnPrimary = {
  background: "linear-gradient(135deg,#6C3AFF,#F43F8E)",
  color: "#fff", border: "none", borderRadius: 10,
  padding: "9px 16px", fontWeight: 700, fontSize: 12, cursor: "pointer",
  boxShadow: "0 4px 12px rgba(108,58,255,0.25)",
};

const btnSecondary = {
  background: "#F1F5F9", color: "#64748B",
  border: "1.5px solid #E2E8F8", borderRadius: 10,
  padding: "9px 16px", fontWeight: 700, fontSize: 12, cursor: "pointer",
};

const btnSmall = {
  border: "1.5px solid transparent", borderRadius: 8,
  padding: "6px 10px", fontWeight: 700, fontSize: 11, cursor: "pointer",
};
