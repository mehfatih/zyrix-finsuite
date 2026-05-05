// ============================================================
// Zyrix FinSuite - Trendyol Auto-Reconciliation Page
// Track C - Sprint 2 Feature 3 (Frontend)
// ============================================================

import React, { useState, useEffect } from "react";
import { trendyolAPI } from "../../services/api";

const SETTLEMENT_STATUS_COLORS = {
  PENDING:     { bg: "#FEF3C7", color: "#92400E", label: "Bekleniyor" },
  PAID:        { bg: "#DBEAFE", color: "#1E40AF", label: "Odendi" },
  RECONCILED:  { bg: "#D1FAE5", color: "#065F46", label: "Eslestirildi" },
  DISCREPANCY: { bg: "#FEE2E2", color: "#991B1B", label: "Fark Var" },
};

const ORDER_STATUS_COLORS = {
  PENDING:   { bg: "#FEF3C7", color: "#92400E" },
  CONFIRMED: { bg: "#DBEAFE", color: "#1E40AF" },
  SHIPPED:   { bg: "#E0E7FF", color: "#3730A3" },
  DELIVERED: { bg: "#D1FAE5", color: "#065F46" },
  CANCELLED: { bg: "#F1F5F9", color: "#64748B" },
  RETURNED:  { bg: "#FEE2E2", color: "#991B1B" },
};

export default function TrendyolPage() {
  const [tab, setTab] = useState("settlements"); // settlements | orders
  const [connection, setConnection] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [showConnectModal, setShowConnectModal] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, s, o] = await Promise.all([
        trendyolAPI.connection(),
        trendyolAPI.settlements(),
        trendyolAPI.orders(),
      ]);
      setConnection(c?.data || null);
      setSettlements(s?.data || []);
      setOrders(o?.data?.rows || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const onSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      const r = await trendyolAPI.sync();
      const result = r?.data;
      if (result) {
        alert(
          "Senkronizasyon tamam!\n\n" +
          "Yeni siparis: " + result.ordersInserted + " (toplam " + result.ordersFetched + ")\n" +
          "Yeni hakkedis: " + result.settlementsInserted + "\n" +
          "Bankayla eslestirilen: " + result.reconciledCount
        );
      }
      await loadAll();
    } catch (e) {
      alert("Hata: " + e.message);
    } finally {
      setSyncing(false);
    }
  };

  const onDisconnect = async () => {
    if (!confirm("Trendyol baglantisini silmek istediginizden emin misiniz? Tum siparis ve hakkedis verileri silinecek.")) return;
    try {
      await trendyolAPI.disconnect();
      await loadAll();
    } catch (e) {
      alert("Hata: " + e.message);
    }
  };

  const totalRevenue = settlements.reduce((s, x) => s + Number(x.netPayout || 0), 0);
  const reconciled = settlements.filter((s) => s.status === "RECONCILED").length;
  const pending = settlements.filter((s) => s.status === "PENDING" || s.status === "PAID").length;
  const discrepancies = settlements.filter((s) => s.status === "DISCREPANCY").length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#1E1B4B" }}>
            🛍 Trendyol Otomatik Mutabakat
          </h1>
          <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: 13 }}>
            Hakkedisleri banka islemleriyle otomatik eslestirir
            {connection && connection.lastSyncAt && (
              <> · Son senkronizasyon: {new Date(connection.lastSyncAt).toLocaleString("tr-TR")}</>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {!connection && (
            <button
              onClick={() => setShowConnectModal(true)}
              style={btnPrimary}
            >
              ➕ Magaza Bagla
            </button>
          )}
          {connection && (
            <>
              <button onClick={onSync} disabled={syncing} style={{ ...btnPrimary, opacity: syncing ? 0.6 : 1 }}>
                {syncing ? "Senkronize Ediliyor..." : "🔄 Senkronize Et"}
              </button>
              <button onClick={onDisconnect} style={btnDanger}>Baglantiyi Sil</button>
            </>
          )}
        </div>
      </div>

      {error && <div style={{ padding: 14, background: "#FEE2E2", color: "#991B1B", borderRadius: 10, marginBottom: 16 }}>{error}</div>}

      {/* Connection card */}
      {!loading && !connection && (
        <div style={{ padding: 60, textAlign: "center", background: "#F8FAFF", borderRadius: 16, border: "1.5px dashed #E2E8F8" }}>
          <div style={{ fontSize: 56, marginBottom: 14 }}>🛍</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1E1B4B", marginBottom: 6 }}>
            Henuz Trendyol baglantisi yok
          </div>
          <div style={{ color: "#64748B", fontSize: 13, marginBottom: 18 }}>
            Magazanizi baglayarak siparisleri ve hakkedisleri otomatik olarak FinSuite'e cekebilirsiniz.
          </div>
          <button onClick={() => setShowConnectModal(true)} style={btnPrimary}>
            ➕ Magazami Bagla
          </button>
        </div>
      )}

      {/* Stats */}
      {connection && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 20 }}>
          <StatCard label="Toplam Net Hakkedis" value={fmtCurrency(totalRevenue)} color="#10B981" />
          <StatCard label="Eslestirilen" value={reconciled} color="#3B82F6" />
          <StatCard label="Bekleyen" value={pending} color="#F59E0B" />
          <StatCard label="Fark Var" value={discrepancies} color={discrepancies > 0 ? "#EF4444" : "#94A3B8"} />
        </div>
      )}

      {/* Tabs */}
      {connection && (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, borderBottom: "1.5px solid #E2E8F8" }}>
            <TabBtn active={tab === "settlements"} onClick={() => setTab("settlements")}>Hakkedisler ({settlements.length})</TabBtn>
            <TabBtn active={tab === "orders"} onClick={() => setTab("orders")}>Siparisler ({orders.length})</TabBtn>
          </div>

          {loading && <div style={{ padding: 40, textAlign: "center", color: "#64748B" }}>Yukleniyor...</div>}

          {!loading && tab === "settlements" && (
            <SettlementsTable rows={settlements} />
          )}

          {!loading && tab === "orders" && (
            <OrdersTable rows={orders} />
          )}
        </>
      )}

      {showConnectModal && (
        <ConnectModal
          onClose={() => setShowConnectModal(false)}
          onConnected={() => { setShowConnectModal(false); loadAll(); }}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ padding: 16, background: "#fff", borderRadius: 12, border: "1.5px solid #E2E8F8" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color }}>{value}</div>
    </div>
  );
}

function TabBtn({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent",
        border: "none",
        padding: "10px 14px",
        fontWeight: active ? 800 : 600,
        color: active ? "#6C3AFF" : "#64748B",
        borderBottom: active ? "2.5px solid #6C3AFF" : "2.5px solid transparent",
        marginBottom: -2,
        cursor: "pointer",
        fontSize: 13,
      }}
    >
      {children}
    </button>
  );
}

function SettlementsTable({ rows }) {
  if (rows.length === 0) {
    return <EmptyState icon="📊" message="Hic hakkedis yok. Senkronize Et butonuna basin." />;
  }
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #E2E8F8", overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: "#F8FAFF", borderBottom: "1.5px solid #E2E8F8" }}>
            <th style={th}>Donem</th>
            <th style={th}>Brut Satis</th>
            <th style={th}>Komisyon</th>
            <th style={th}>Net Hakkedis</th>
            <th style={th}>Beklenen Odeme</th>
            <th style={th}>Durum</th>
            <th style={th}>Fark</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => {
            const cfg = SETTLEMENT_STATUS_COLORS[s.status] || SETTLEMENT_STATUS_COLORS.PENDING;
            return (
              <tr key={s.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={td}>
                  {fmtDate(s.periodStart)} - {fmtDate(s.periodEnd)}
                </td>
                <td style={td}>{fmtCurrency(s.grossSales)}</td>
                <td style={td}>{fmtCurrency(s.totalCommission)}</td>
                <td style={{ ...td, fontWeight: 700, color: "#1E1B4B" }}>{fmtCurrency(s.netPayout)}</td>
                <td style={td}>{s.expectedPayoutDate ? fmtDate(s.expectedPayoutDate) : "—"}</td>
                <td style={td}>
                  <span style={{ background: cfg.bg, color: cfg.color, padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                    {cfg.label}
                  </span>
                </td>
                <td style={{ ...td, color: s.discrepancy && Math.abs(Number(s.discrepancy)) > 0.5 ? "#DC2626" : "#10B981" }}>
                  {s.discrepancy !== null && s.discrepancy !== undefined ? fmtCurrency(s.discrepancy) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function OrdersTable({ rows }) {
  if (rows.length === 0) {
    return <EmptyState icon="📦" message="Hic siparis yok." />;
  }
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1.5px solid #E2E8F8", overflow: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: "#F8FAFF", borderBottom: "1.5px solid #E2E8F8" }}>
            <th style={th}>Tarih</th>
            <th style={th}>Siparis No</th>
            <th style={th}>Musteri</th>
            <th style={th}>Urun</th>
            <th style={th}>Adet</th>
            <th style={th}>Brut</th>
            <th style={th}>Net</th>
            <th style={th}>Durum</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => {
            const cfg = ORDER_STATUS_COLORS[o.status] || ORDER_STATUS_COLORS.PENDING;
            return (
              <tr key={o.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={td}>{fmtDate(o.orderDate)}</td>
                <td style={{ ...td, fontFamily: "monospace" }}>{o.orderNumber}</td>
                <td style={td}>{o.customerName || "—"}</td>
                <td style={td}>{o.productName || "—"}</td>
                <td style={td}>{o.quantity}</td>
                <td style={td}>{fmtCurrency(o.grossAmount)}</td>
                <td style={{ ...td, fontWeight: 700, color: "#1E1B4B" }}>{fmtCurrency(o.netAmount)}</td>
                <td style={td}>
                  <span style={{ background: cfg.bg, color: cfg.color, padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 700 }}>
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

function ConnectModal({ onClose, onConnected }) {
  const [sellerId, setSellerId] = useState("");
  const [storeName, setStoreName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!sellerId.trim()) { alert("Satici ID gerekli"); return; }
    setBusy(true);
    try {
      await trendyolAPI.connect({
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
        <h2 style={{ margin: "0 0 12px", fontSize: 18, color: "#1E1B4B" }}>Trendyol Magaza Bagla</h2>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: "#64748B" }}>
          Sandbox modunda ornek veri uretilir. Gercek API anahtarlari sonra eklenebilir.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Field label="Satici ID *" value={sellerId} onChange={setSellerId} placeholder="ornek: 12345" />
          <Field label="Magaza Adi" value={storeName} onChange={setStoreName} placeholder="Levana Cosmetics" />
          <Field label="API Key (opsiyonel)" value={apiKey} onChange={setApiKey} />
          <Field label="API Secret (opsiyonel)" value={apiSecret} onChange={setApiSecret} type="password" />
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 18 }}>
          <button onClick={onClose} disabled={busy} style={btnSecondary}>Iptal</button>
          <button onClick={submit} disabled={busy || !sellerId.trim()} style={{ ...btnPrimary, opacity: busy ? 0.6 : 1 }}>
            {busy ? "Kaydediliyor..." : "Bagla"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#64748B", marginBottom: 4 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #E2E8F8", borderRadius: 10, fontSize: 13, outline: "none", boxSizing: "border-box" }}
      />
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

function fmtCurrency(n) {
  if (n === null || n === undefined) return "—";
  return Number(n).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " TRY";
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("tr-TR");
}

const th = { padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" };
const td = { padding: "10px 12px", color: "#1E1B4B" };

const btnPrimary = {
  background: "linear-gradient(135deg,#FF6900,#FB8500)",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "9px 16px",
  fontWeight: 700,
  fontSize: 12,
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(255,105,0,0.25)",
};

const btnSecondary = {
  background: "#F1F5F9",
  color: "#64748B",
  border: "1.5px solid #E2E8F8",
  borderRadius: 10,
  padding: "9px 16px",
  fontWeight: 700,
  fontSize: 12,
  cursor: "pointer",
};

const btnDanger = {
  background: "#FEE2E2",
  color: "#991B1B",
  border: "1.5px solid #FCA5A5",
  borderRadius: 10,
  padding: "9px 16px",
  fontWeight: 700,
  fontSize: 12,
  cursor: "pointer",
};
