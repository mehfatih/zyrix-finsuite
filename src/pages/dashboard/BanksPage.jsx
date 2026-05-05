// ============================================================
// Zyrix FinSuite - Bank Connections + Transactions Page
// Sprint 1 Phase 1B - Frontend
// ============================================================

import React, { useState, useEffect } from "react";
import { bankAPI } from "../../services/api";

const PROVIDER_NAMES = {
  GARANTI: "Garanti BBVA",
  IS_BANKASI: "Turkiye Is Bankasi",
  YAPI_KREDI: "Yapi Kredi",
  AKBANK: "Akbank",
  ZIRAAT: "Ziraat Bankasi",
  OTHER: "Diger",
};

export default function BanksPage() {
  const [connections, setConnections] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConnect, setShowConnect] = useState(false);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [c, t] = await Promise.all([
        bankAPI.connections(),
        bankAPI.transactions({ limit: 30 }),
      ]);
      setConnections(c?.data || []);
      setTransactions(t?.data?.rows || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onSync = async (id) => {
    setSyncing(id);
    try {
      await bankAPI.sync(id);
      await load();
    } catch (e) { alert("Hata: " + e.message); }
    finally { setSyncing(null); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#1E1B4B" }}>Banka Entegrasyonu</h1>
          <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: 13 }}>
            Banka hesaplarinizi baglayin ve islemlerinizi otomatik takip edin
          </p>
        </div>
        <button onClick={() => setShowConnect(true)} style={btn}>+ Banka Bagla</button>
      </div>

      {error && <div style={{ padding: 14, background: "#FEE2E2", color: "#991B1B", borderRadius: 10, marginBottom: 16 }}>{error}</div>}

      <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1E1B4B", marginBottom: 12 }}>Bagli Bankalar</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12, marginBottom: 28 }}>
        {connections.map((c) => (
          <div key={c.id} style={{ padding: 18, background: "#FFFFFF", borderRadius: 14, border: "1.5px solid #E2E8F8" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "#1E1B4B" }}>{PROVIDER_NAMES[c.provider]}</div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{c.accountHolder}</div>
              </div>
              <span style={{
                background: c.status === "CONNECTED" ? "#D1FAE5" : "#FEF3C7",
                color: c.status === "CONNECTED" ? "#065F46" : "#92400E",
                padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700,
              }}>{c.status}</span>
            </div>
            {c.iban && <div style={{ fontSize: 11, color: "#94A3B8", fontFamily: "monospace", marginBottom: 10 }}>{c.iban}</div>}
            <button onClick={() => onSync(c.id)} disabled={syncing === c.id} style={btnSmall}>
              {syncing === c.id ? "Senkronize ediliyor..." : "🔄 Senkronize Et"}
            </button>
            {c.lastSyncAt && (
              <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 8 }}>
                Son: {new Date(c.lastSyncAt).toLocaleString("tr-TR")}
              </div>
            )}
          </div>
        ))}
        {connections.length === 0 && !loading && (
          <div style={{ padding: 40, textAlign: "center", color: "#64748B", background: "#F8FAFF", borderRadius: 12, gridColumn: "1/-1" }}>
            Henuz banka baglantisi yok
          </div>
        )}
      </div>

      <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1E1B4B", marginBottom: 12 }}>Son Islemler</h3>
      {!loading && transactions.length === 0 && (
        <div style={{ padding: 30, textAlign: "center", color: "#64748B", background: "#F8FAFF", borderRadius: 12 }}>
          Henuz islem yok
        </div>
      )}
      {!loading && transactions.length > 0 && (
        <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1.5px solid #E2E8F8", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#F8FAFF" }}>
              <tr>
                <th style={th}>Tarih</th>
                <th style={th}>Aciklama</th>
                <th style={th}>Karsi Taraf</th>
                <th style={{ ...th, textAlign: "right" }}>Tutar</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} style={{ borderTop: "1px solid #E2E8F8" }}>
                  <td style={td}>{new Date(t.transactionDate).toLocaleDateString("tr-TR")}</td>
                  <td style={td}>{t.description || "—"}</td>
                  <td style={td}>{t.counterpartyName || "—"}</td>
                  <td style={{ ...td, textAlign: "right", fontWeight: 700, color: t.direction === "IN" ? "#10B981" : "#EF4444" }}>
                    {t.direction === "IN" ? "+" : "−"} {Number(t.amount).toFixed(2)} {t.currency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showConnect && <ConnectModal onClose={() => setShowConnect(false)} onConnected={load} />}
    </div>
  );
}

function ConnectModal({ onClose, onConnected }) {
  const [form, setForm] = useState({
    provider: "GARANTI", accountHolder: "", iban: "", currency: "TRY",
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async () => {
    if (!form.accountHolder.trim()) return setErr("Hesap sahibi zorunlu");
    setSubmitting(true);
    setErr(null);
    try {
      await bankAPI.connect(form);
      onConnected();
      onClose();
    } catch (e) { setErr(e.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={modalOverlay}>
      <div style={modalCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Banka Bagla</h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", fontSize: 22, cursor: "pointer", color: "#64748B" }}>×</button>
        </div>

        {err && <div style={{ padding: 10, background: "#FEE2E2", color: "#991B1B", borderRadius: 8, marginBottom: 12, fontSize: 12 }}>{err}</div>}

        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Banka *</label>
          <select value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} style={input}>
            {Object.entries(PROVIDER_NAMES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={lbl}>Hesap Sahibi *</label>
          <input value={form.accountHolder} onChange={(e) => setForm({ ...form, accountHolder: e.target.value })} style={input} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={lbl}>IBAN</label>
          <input value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value.toUpperCase() })} placeholder="TR..." style={input} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={btnSecondary}>Iptal</button>
          <button onClick={submit} disabled={submitting} style={btn}>{submitting ? "Baglaniyor..." : "Bagla"}</button>
        </div>
      </div>
    </div>
  );
}

const th = { padding: "12px 14px", fontSize: 11, fontWeight: 700, color: "#64748B", textAlign: "left", textTransform: "uppercase" };
const td = { padding: "14px", fontSize: 13, color: "#1E1B4B" };
const btn = { background: "linear-gradient(135deg,#6C3AFF,#F43F8E)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer" };
const btnSecondary = { background: "#F8FAFF", color: "#64748B", border: "1.5px solid #E2E8F8", borderRadius: 8, padding: "8px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer" };
const btnSmall = { background: "#F8FAFF", color: "#6C3AFF", border: "1.5px solid #E2E8F8", borderRadius: 8, padding: "7px 12px", fontWeight: 700, fontSize: 12, cursor: "pointer", width: "100%" };
const input = { width: "100%", padding: "8px 10px", border: "1.5px solid #E2E8F8", borderRadius: 8, fontSize: 13, fontFamily: "inherit" };
const lbl = { display: "block", fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 4 };
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 };
const modalCard = { background: "#fff", borderRadius: 18, padding: 24, maxWidth: 480, width: "100%", boxShadow: "0 20px 50px rgba(0,0,0,0.2)" };
