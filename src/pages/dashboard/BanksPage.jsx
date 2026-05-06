// ============================================================
// Zyrix FinSuite - Banks Page (with CSV Import tab)
// 3 tabs: Connections | Transactions | CSV Import
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import { bankAPI } from "../../services/api";

const COLORS = {
  primary: "#0891B2",
  accent: "#06B6D4",
  text: "#1E1B4B",
  muted: "#64748B",
  border: "#E2E8F8",
  bg: "#F8FAFC",
};

const PROVIDER_NAMES = {
  GARANTI: "Garanti BBVA",
  IS_BANKASI: "Turkiye Is Bankasi",
  YAPI_KREDI: "Yapi Kredi",
  AKBANK: "Akbank",
  ZIRAAT: "Ziraat Bankasi",
  OTHER: "Diger",
  GENERIC: "Generic CSV",
};

const IMPORT_STATUS_COLORS = {
  PROCESSING: { bg: "#DBEAFE", color: "#1E40AF" },
  COMPLETED:  { bg: "#D1FAE5", color: "#065F46" },
  PARTIAL:    { bg: "#FEF3C7", color: "#92400E" },
  FAILED:     { bg: "#FEE2E2", color: "#991B1B" },
};

export default function BanksPage() {
  const [tab, setTab] = useState("connections");

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: COLORS.text }}>
          🏦 Banka Entegrasyonu
        </h1>
        <p style={{ margin: "4px 0 0", color: COLORS.muted, fontSize: 13 }}>
          Banka hesaplarinizi baglayin, CSV dosyalarini iceri aktarin, islemlerinizi takip edin.
        </p>
      </div>

      <div style={{ display: "flex", gap: 4, borderBottom: `1.5px solid ${COLORS.border}`, marginBottom: 24, flexWrap: "wrap" }}>
        <TabBtn active={tab === "connections"}  onClick={() => setTab("connections")}>🔗 Baglantilar</TabBtn>
        <TabBtn active={tab === "transactions"} onClick={() => setTab("transactions")}>💸 Islemler</TabBtn>
        <TabBtn active={tab === "csv"}          onClick={() => setTab("csv")}>📂 CSV Import</TabBtn>
      </div>

      {tab === "connections"  && <ConnectionsTab />}
      {tab === "transactions" && <TransactionsTab />}
      {tab === "csv"          && <CsvImportTab />}
    </div>
  );
}

// ============================================================
// CONNECTIONS TAB
// ============================================================

function ConnectionsTab() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const c = await bankAPI.connections();
      setConnections(c?.data || []);
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

  if (loading) return <Loading>Yukleniyor...</Loading>;
  if (error) return <ErrorBox>{error}</ErrorBox>;

  return (
    <div>
      <div style={{ background: "#FEF3C7", border: "1.5px solid #F59E0B", borderRadius: 12, padding: 14, marginBottom: 20 }}>
        <strong style={{ color: "#92400E", fontSize: 13 }}>⚠ Sandbox Mode</strong>
        <div style={{ fontSize: 12, color: "#92400E", marginTop: 4 }}>
          Bagli bankalar sandbox veri donduruyor. Gercek API entegrasyonu BBM anlasmasi gerektiriyor.
          Daha hizli sonuc icin <strong>CSV Import</strong> tabini kullanin.
        </div>
      </div>

      {connections.length === 0 ? (
        <EmptyState>Henuz banka baglantisi yok. CSV Import tabindan dosya yukleyebilirsiniz.</EmptyState>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {connections.map((c) => (
            <div key={c.id} style={{ padding: 18, background: "#fff", borderRadius: 14, border: `1.5px solid ${COLORS.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: COLORS.text }}>
                    {PROVIDER_NAMES[c.provider] || c.provider}
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{c.accountHolder}</div>
                </div>
                <span style={{
                  background: c.status === "CONNECTED" ? "#D1FAE5" : "#FEF3C7",
                  color: c.status === "CONNECTED" ? "#065F46" : "#92400E",
                  padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700,
                }}>
                  {c.status}
                </span>
              </div>
              {c.iban && <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "monospace", marginBottom: 10 }}>{c.iban}</div>}
              <button
                onClick={() => onSync(c.id)}
                disabled={syncing === c.id}
                style={{ ...btnSm, opacity: syncing === c.id ? 0.5 : 1, width: "100%" }}
              >
                {syncing === c.id ? "Senkronize ediliyor..." : "🔄 Senkronize Et"}
              </button>
              {c.lastSyncAt && (
                <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 8 }}>
                  Son: {new Date(c.lastSyncAt).toLocaleString("tr-TR")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// TRANSACTIONS TAB
// ============================================================

function TransactionsTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [directionFilter, setDirectionFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (directionFilter) params.direction = directionFilter;
      const t = await bankAPI.transactions(params);
      setRows(t?.data?.rows || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [directionFilter]);

  if (loading) return <Loading>Yukleniyor...</Loading>;
  if (error) return <ErrorBox>{error}</ErrorBox>;

  // Stats
  const totalIn = rows.filter((r) => r.direction === "IN").reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const totalOut = rows.filter((r) => r.direction === "OUT").reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const net = totalIn - totalOut;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard label="Toplam Girdi" value={fmt(totalIn)} color="#10B981" />
        <StatCard label="Toplam Cikti" value={fmt(totalOut)} color="#EF4444" />
        <StatCard label="Net" value={fmt(net)} color={net >= 0 ? "#10B981" : "#EF4444"} />
        <StatCard label="Toplam Islem" value={rows.length} />
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
        <select
          value={directionFilter}
          onChange={(e) => setDirectionFilter(e.target.value)}
          style={{ ...inp, width: "auto", padding: "8px 12px" }}
        >
          <option value="">Tum islemler</option>
          <option value="IN">Sadece Girdi</option>
          <option value="OUT">Sadece Cikti</option>
        </select>
        <button onClick={load} style={btnSm}>🔄 Yenile</button>
      </div>

      {rows.length === 0 ? (
        <EmptyState>Henuz islem yok.</EmptyState>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: COLORS.bg }}>
              <tr>
                <Th>Tarih</Th>
                <Th>Aciklama</Th>
                <Th>Karsi Hesap</Th>
                <Th>Yon</Th>
                <Th align="right">Tutar</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                  <Td>
                    <span style={{ fontSize: 12, color: COLORS.muted }}>
                      {new Date(r.transactionDate).toLocaleDateString("tr-TR")}
                    </span>
                  </Td>
                  <Td>
                    <span style={{ fontSize: 12 }}>{r.description || "—"}</span>
                  </Td>
                  <Td>
                    <span style={{ fontSize: 12 }}>{r.counterpartyName || "—"}</span>
                  </Td>
                  <Td>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      background: r.direction === "IN" ? "#D1FAE5" : "#FEE2E2",
                      color: r.direction === "IN" ? "#065F46" : "#991B1B",
                    }}>
                      {r.direction === "IN" ? "↓ Girdi" : "↑ Cikti"}
                    </span>
                  </Td>
                  <Td align="right">
                    <strong style={{
                      color: r.direction === "IN" ? "#065F46" : "#991B1B",
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {fmt(Number(r.amount))} {r.currency}
                    </strong>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// CSV IMPORT TAB
// ============================================================

function CsvImportTab() {
  const [imports, setImports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await bankAPI.listImports(20);
      setImports(r?.data?.rows || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResult(null);

    if (file.size > 20 * 1024 * 1024) {
      setError("Dosya cok buyuk (max 20MB).");
      return;
    }

    setUploading(true);
    try {
      const csvText = await file.text();
      const r = await bankAPI.importCsv({
        csvText,
        filename: file.name,
      });
      setResult(r?.data);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      {/* Upload card */}
      <div style={{ background: "#fff", border: `2px dashed ${COLORS.border}`, borderRadius: 14, padding: 32, textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>📂</div>
        <h3 style={{ margin: "0 0 6px", fontSize: 16, color: COLORS.text }}>CSV Dosyasi Yukle</h3>
        <p style={{ margin: "0 0 20px", fontSize: 12, color: COLORS.muted }}>
          Banka hesabinizdan indirilen CSV dosyasini buraya surukleyin veya tiklayip secin.<br />
          Garanti, Is Bankasi, Yapi Kredi, Akbank, Ziraat formatlari otomatik tanir.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFile}
          disabled={uploading}
          style={{ display: "none" }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{ ...btnPrimary, opacity: uploading ? 0.6 : 1 }}
        >
          {uploading ? "Yukleniyor..." : "📤 CSV Sec"}
        </button>
      </div>

      {error && <ErrorBox>{error}</ErrorBox>}

      {result && (
        <div style={{
          background: result.errorRows > 0 ? "#FEF3C7" : "#D1FAE5",
          color: result.errorRows > 0 ? "#92400E" : "#065F46",
          padding: 18,
          borderRadius: 12,
          marginBottom: 20,
        }}>
          <strong style={{ fontSize: 14 }}>
            {result.errorRows === 0 ? "✓ Yukleme tamamlandi" : "⚠ Yukleme kismi tamamlandi"}
          </strong>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginTop: 12 }}>
            <div>
              <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 600, textTransform: "uppercase" }}>Banka</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{PROVIDER_NAMES[result.bankCode] || result.bankCode}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 600, textTransform: "uppercase" }}>Toplam Satir</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{result.totalRows}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 600, textTransform: "uppercase" }}>Eklendi</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{result.insertedRows}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 600, textTransform: "uppercase" }}>Tekrar</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{result.duplicateRows}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 600, textTransform: "uppercase" }}>Hata</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{result.errorRows}</div>
            </div>
          </div>
          {result.errors && result.errors.length > 0 && (
            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Hata detaylari ({result.errors.length})</summary>
              <ul style={{ marginTop: 8, paddingLeft: 18, fontSize: 11 }}>
                {result.errors.slice(0, 20).map((e, i) => (
                  <li key={i}>Satir {e.row}: {e.reason}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {/* Imports history */}
      <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>Onceki Yuklemeler</h3>

      {loading ? (
        <Loading>Yukleniyor...</Loading>
      ) : imports.length === 0 ? (
        <EmptyState>Henuz CSV yuklemesi yok.</EmptyState>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: COLORS.bg }}>
              <tr>
                <Th>Dosya</Th>
                <Th>Banka</Th>
                <Th>Durum</Th>
                <Th align="right">Toplam</Th>
                <Th align="right">Eklenen</Th>
                <Th align="right">Tekrar</Th>
                <Th align="right">Hata</Th>
                <Th>Tarih</Th>
              </tr>
            </thead>
            <tbody>
              {imports.map((imp) => {
                const sc = IMPORT_STATUS_COLORS[imp.status] || IMPORT_STATUS_COLORS.PROCESSING;
                return (
                  <tr key={imp.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                    <Td>
                      <span style={{ fontSize: 12, fontFamily: "monospace" }}>{imp.filename}</span>
                    </Td>
                    <Td>
                      <span style={{ fontSize: 12 }}>{PROVIDER_NAMES[imp.bankCode] || imp.bankCode}</span>
                    </Td>
                    <Td>
                      <span style={{ background: sc.bg, color: sc.color, padding: "3px 10px", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                        {imp.status}
                      </span>
                    </Td>
                    <Td align="right"><span style={{ fontSize: 12 }}>{imp.totalRows}</span></Td>
                    <Td align="right"><span style={{ fontSize: 12, color: "#065F46", fontWeight: 600 }}>{imp.insertedRows}</span></Td>
                    <Td align="right"><span style={{ fontSize: 12, color: COLORS.muted }}>{imp.duplicateRows}</span></Td>
                    <Td align="right"><span style={{ fontSize: 12, color: imp.errorRows > 0 ? "#991B1B" : COLORS.muted }}>{imp.errorRows}</span></Td>
                    <Td>
                      <span style={{ fontSize: 11, color: COLORS.muted }}>
                        {new Date(imp.startedAt).toLocaleString("tr-TR")}
                      </span>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 24, padding: 18, background: COLORS.bg, borderRadius: 12, fontSize: 12, color: COLORS.muted }}>
        <strong style={{ color: COLORS.text, fontSize: 13 }}>💡 Destekenen Bankalar / Formatlar</strong>
        <ul style={{ marginTop: 8, paddingLeft: 18, lineHeight: 1.7 }}>
          <li><strong>Garanti BBVA</strong>: Tarih, Aciklama, Tutar, Bakiye, Dekont sutunlari</li>
          <li><strong>Is Bankasi</strong>: Islem Tarihi, Aciklama, Borc, Alacak sutunlari</li>
          <li><strong>Yapi Kredi</strong>: Tarih, Aciklama, Cikan, Giren sutunlari</li>
          <li><strong>Akbank</strong>: Karsi Hesap, Tutar, Bakiye sutunlari</li>
          <li><strong>Ziraat Bankasi</strong>: Islem Tutari sutunu</li>
          <li><strong>Generic</strong>: Diger bankalar icin otomatik sutun esleme</li>
        </ul>
        <div style={{ marginTop: 8 }}>Maksimum dosya boyutu: 20 MB</div>
      </div>
    </div>
  );
}

// ============================================================
// SHARED COMPONENTS
// ============================================================

function fmt(n) {
  return new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent",
        border: "none",
        padding: "10px 18px",
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        color: active ? COLORS.primary : COLORS.muted,
        borderBottom: active ? `2px solid ${COLORS.primary}` : "2px solid transparent",
        cursor: "pointer",
        marginBottom: -1.5,
      }}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || COLORS.text, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function Th({ children, align }) {
  return (
    <th style={{
      padding: "12px 14px",
      fontSize: 11,
      fontWeight: 700,
      color: COLORS.muted,
      textAlign: align || "left",
      textTransform: "uppercase",
    }}>
      {children}
    </th>
  );
}

function Td({ children, align }) {
  return <td style={{ padding: "12px 14px", fontSize: 13, color: COLORS.text, textAlign: align || "left" }}>{children}</td>;
}

function Loading({ children }) {
  return <div style={{ padding: 40, textAlign: "center", color: COLORS.muted }}>{children}</div>;
}

function ErrorBox({ children }) {
  return <div style={{ padding: 14, background: "#FEE2E2", color: "#991B1B", borderRadius: 10, marginBottom: 16 }}>{children}</div>;
}

function EmptyState({ children }) {
  return (
    <div style={{
      padding: 40,
      textAlign: "center",
      color: COLORS.muted,
      background: "#fff",
      borderRadius: 12,
      border: `1px dashed ${COLORS.border}`,
    }}>
      {children}
    </div>
  );
}

const inp = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: `1.5px solid ${COLORS.border}`,
  fontSize: 13,
  outline: "none",
  fontFamily: "inherit",
};

const btnPrimary = {
  background: COLORS.primary,
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "12px 24px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};

const btnSm = {
  background: "transparent",
  color: COLORS.text,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  padding: "6px 12px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};
