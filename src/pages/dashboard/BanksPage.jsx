// ============================================================
// Zyrix FinSuite - Banks Page (with CSV Import tab, trilingual)
// 3 tabs: Connections | Transactions | CSV Import
// TR / EN / AR
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import { useI18n } from "../../i18n/i18n";
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
  OTHER: "Other",
  GENERIC: "Generic CSV",
};

const IMPORT_STATUS_COLORS = {
  PROCESSING: { bg: "#DBEAFE", color: "#1E40AF" },
  COMPLETED:  { bg: "#D1FAE5", color: "#065F46" },
  PARTIAL:    { bg: "#FEF3C7", color: "#92400E" },
  FAILED:     { bg: "#FEE2E2", color: "#991B1B" },
};

const TXT = {
  TR: {
    pageTitle: "Banka Entegrasyonu",
    pageSubtitle: "Banka hesaplarinizi baglayin, CSV dosyalarini iceri aktarin, islemlerinizi takip edin.",
    tabConnections: "Baglantilar",
    tabTransactions: "Islemler",
    tabCsv: "CSV Import",

    // Connections
    sandboxTitle: "Sandbox Modu",
    sandboxDesc: "Bagli bankalar sandbox veri donduruyor. Gercek API entegrasyonu BBM anlasmasi gerektiriyor. Daha hizli sonuc icin",
    sandboxLink: "CSV Import",
    sandboxDescEnd: "tabini kullanin.",
    emptyConnections: "Henuz banka baglantisi yok. CSV Import tabindan dosya yukleyebilirsiniz.",
    btnSync: "Senkronize Et",
    syncingLabel: "Senkronize ediliyor...",
    lastSync: "Son:",

    // Transactions
    statTotalIn: "Toplam Girdi",
    statTotalOut: "Toplam Cikti",
    statNet: "Net",
    statCount: "Toplam Islem",
    filterAll: "Tum islemler",
    filterInOnly: "Sadece Girdi",
    filterOutOnly: "Sadece Cikti",
    btnRefresh: "Yenile",
    emptyTransactions: "Henuz islem yok.",
    colDate: "Tarih",
    colDescription: "Aciklama",
    colCounterparty: "Karsi Hesap",
    colDirection: "Yon",
    colAmount: "Tutar",
    dirIn: "↓ Girdi",
    dirOut: "↑ Cikti",

    // CSV Import
    csvUploadTitle: "CSV Dosyasi Yukle",
    csvUploadDesc1: "Banka hesabinizdan indirilen CSV dosyasini buraya surukleyin veya tiklayip secin.",
    csvUploadDesc2: "Garanti, Is Bankasi, Yapi Kredi, Akbank, Ziraat formatlari otomatik tanir.",
    btnSelectCsv: "📤 CSV Sec",
    uploadingLabel: "Yukleniyor...",
    errFileTooLarge: "Dosya cok buyuk (max 20MB).",
    successComplete: "✓ Yukleme tamamlandi",
    warningPartial: "⚠ Yukleme kismi tamamlandi",
    csvBank: "Banka",
    csvTotalRows: "Toplam Satir",
    csvAdded: "Eklendi",
    csvDuplicate: "Tekrar",
    csvErrors: "Hata",
    errorDetails: "Hata detaylari",
    errorRowLabel: "Satir",
    historyTitle: "Onceki Yuklemeler",
    emptyHistory: "Henuz CSV yuklemesi yok.",
    colFile: "Dosya",
    colBank: "Banka",
    colStatus: "Durum",
    colTotal: "Toplam",
    colAddedH: "Eklenen",
    colDup: "Tekrar",
    colErr: "Hata",
    colDateH: "Tarih",
    supportedTitle: "💡 Destekenen Bankalar / Formatlar",
    supportedGaranti: "Tarih, Aciklama, Tutar, Bakiye, Dekont sutunlari",
    supportedIs: "Islem Tarihi, Aciklama, Borc, Alacak sutunlari",
    supportedYapi: "Tarih, Aciklama, Cikan, Giren sutunlari",
    supportedAkbank: "Karsi Hesap, Tutar, Bakiye sutunlari",
    supportedZiraat: "Islem Tutari sutunu",
    supportedGeneric: "Diger bankalar icin otomatik sutun esleme",
    maxSize: "Maksimum dosya boyutu: 20 MB",
    loading: "Yukleniyor...",
  },

  EN: {
    pageTitle: "Bank Integration",
    pageSubtitle: "Connect your bank accounts, import CSV files, track your transactions.",
    tabConnections: "Connections",
    tabTransactions: "Transactions",
    tabCsv: "CSV Import",

    sandboxTitle: "Sandbox Mode",
    sandboxDesc: "Connected banks return sandbox data. Real API integration requires BBM agreement. For faster results use",
    sandboxLink: "CSV Import",
    sandboxDescEnd: "tab.",
    emptyConnections: "No bank connections yet. You can upload a file from CSV Import tab.",
    btnSync: "Sync",
    syncingLabel: "Syncing...",
    lastSync: "Last:",

    statTotalIn: "Total In",
    statTotalOut: "Total Out",
    statNet: "Net",
    statCount: "Total Transactions",
    filterAll: "All transactions",
    filterInOnly: "Inbound only",
    filterOutOnly: "Outbound only",
    btnRefresh: "Refresh",
    emptyTransactions: "No transactions yet.",
    colDate: "Date",
    colDescription: "Description",
    colCounterparty: "Counterparty",
    colDirection: "Direction",
    colAmount: "Amount",
    dirIn: "↓ In",
    dirOut: "↑ Out",

    csvUploadTitle: "Upload CSV File",
    csvUploadDesc1: "Drag and drop the CSV downloaded from your bank or click to select.",
    csvUploadDesc2: "Garanti, Is Bankasi, Yapi Kredi, Akbank, Ziraat formats are auto-detected.",
    btnSelectCsv: "📤 Select CSV",
    uploadingLabel: "Uploading...",
    errFileTooLarge: "File too large (max 20MB).",
    successComplete: "✓ Upload complete",
    warningPartial: "⚠ Upload partially complete",
    csvBank: "Bank",
    csvTotalRows: "Total Rows",
    csvAdded: "Added",
    csvDuplicate: "Duplicate",
    csvErrors: "Errors",
    errorDetails: "Error details",
    errorRowLabel: "Row",
    historyTitle: "Previous Uploads",
    emptyHistory: "No CSV uploads yet.",
    colFile: "File",
    colBank: "Bank",
    colStatus: "Status",
    colTotal: "Total",
    colAddedH: "Added",
    colDup: "Duplicate",
    colErr: "Error",
    colDateH: "Date",
    supportedTitle: "💡 Supported Banks / Formats",
    supportedGaranti: "Date, Description, Amount, Balance, Receipt columns",
    supportedIs: "Transaction Date, Description, Debit, Credit columns",
    supportedYapi: "Date, Description, Out, In columns",
    supportedAkbank: "Counterparty, Amount, Balance columns",
    supportedZiraat: "Transaction Amount column",
    supportedGeneric: "Auto column matching for other banks",
    maxSize: "Max file size: 20 MB",
    loading: "Loading...",
  },

  AR: {
    pageTitle: "تكامل البنك",
    pageSubtitle: "اربط حساباتك المصرفية، استورد ملفات CSV، تتبع معاملاتك.",
    tabConnections: "الاتصالات",
    tabTransactions: "المعاملات",
    tabCsv: "استيراد CSV",

    sandboxTitle: "وضع Sandbox",
    sandboxDesc: "البنوك المتصلة تعيد بيانات sandbox. تكامل API الحقيقي يتطلب اتفاقية BBM. للحصول على نتائج أسرع استخدم تبويب",
    sandboxLink: "استيراد CSV",
    sandboxDescEnd: "",
    emptyConnections: "لا توجد اتصالات بنكية بعد. يمكنك تحميل ملف من تبويب استيراد CSV.",
    btnSync: "مزامنة",
    syncingLabel: "جاري المزامنة...",
    lastSync: "آخر:",

    statTotalIn: "إجمالي الوارد",
    statTotalOut: "إجمالي الصادر",
    statNet: "الصافي",
    statCount: "إجمالي المعاملات",
    filterAll: "جميع المعاملات",
    filterInOnly: "الوارد فقط",
    filterOutOnly: "الصادر فقط",
    btnRefresh: "تحديث",
    emptyTransactions: "لا توجد معاملات بعد.",
    colDate: "التاريخ",
    colDescription: "الوصف",
    colCounterparty: "الطرف الآخر",
    colDirection: "الاتجاه",
    colAmount: "المبلغ",
    dirIn: "↓ وارد",
    dirOut: "↑ صادر",

    csvUploadTitle: "تحميل ملف CSV",
    csvUploadDesc1: "اسحب وأفلت ملف CSV الذي تم تنزيله من بنكك أو انقر للاختيار.",
    csvUploadDesc2: "يتم اكتشاف صيغ Garanti, Is Bankasi, Yapi Kredi, Akbank, Ziraat تلقائياً.",
    btnSelectCsv: "📤 اختر CSV",
    uploadingLabel: "جاري التحميل...",
    errFileTooLarge: "الملف كبير جداً (حد أقصى 20 ميجابايت).",
    successComplete: "✓ اكتمل التحميل",
    warningPartial: "⚠ التحميل اكتمل جزئياً",
    csvBank: "البنك",
    csvTotalRows: "إجمالي الصفوف",
    csvAdded: "مضاف",
    csvDuplicate: "مكرر",
    csvErrors: "أخطاء",
    errorDetails: "تفاصيل الخطأ",
    errorRowLabel: "الصف",
    historyTitle: "التحميلات السابقة",
    emptyHistory: "لا توجد تحميلات CSV بعد.",
    colFile: "الملف",
    colBank: "البنك",
    colStatus: "الحالة",
    colTotal: "الإجمالي",
    colAddedH: "مضاف",
    colDup: "مكرر",
    colErr: "خطأ",
    colDateH: "التاريخ",
    supportedTitle: "💡 البنوك / الصيغ المدعومة",
    supportedGaranti: "أعمدة: التاريخ، الوصف، المبلغ، الرصيد، الإيصال",
    supportedIs: "أعمدة: تاريخ المعاملة، الوصف، مدين، دائن",
    supportedYapi: "أعمدة: التاريخ، الوصف، صادر، وارد",
    supportedAkbank: "أعمدة: الطرف الآخر، المبلغ، الرصيد",
    supportedZiraat: "عمود: مبلغ المعاملة",
    supportedGeneric: "مطابقة أعمدة تلقائية للبنوك الأخرى",
    maxSize: "الحد الأقصى لحجم الملف: 20 ميجابايت",
    loading: "جاري التحميل...",
  },
};

// ============================================================
// MAIN
// ============================================================

export default function BanksPage() {
  const { lang } = useI18n();
  const t = TXT[lang] || TXT.TR;
  const [tab, setTab] = useState("connections");

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: COLORS.text }}>
          🏦 {t.pageTitle}
        </h1>
        <p style={{ margin: "4px 0 0", color: COLORS.muted, fontSize: 13 }}>{t.pageSubtitle}</p>
      </div>

      <div style={{ display: "flex", gap: 4, borderBottom: `1.5px solid ${COLORS.border}`, marginBottom: 24, flexWrap: "wrap" }}>
        <TabBtn active={tab === "connections"}  onClick={() => setTab("connections")}>🔗 {t.tabConnections}</TabBtn>
        <TabBtn active={tab === "transactions"} onClick={() => setTab("transactions")}>💸 {t.tabTransactions}</TabBtn>
        <TabBtn active={tab === "csv"}          onClick={() => setTab("csv")}>📂 {t.tabCsv}</TabBtn>
      </div>

      {tab === "connections"  && <ConnectionsTab t={t} lang={lang} />}
      {tab === "transactions" && <TransactionsTab t={t} lang={lang} />}
      {tab === "csv"          && <CsvImportTab t={t} lang={lang} />}
    </div>
  );
}

// ============================================================
// CONNECTIONS TAB
// ============================================================

function ConnectionsTab({ t, lang }) {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(null);

  const localeStr = lang === "TR" ? "tr-TR" : lang === "AR" ? "ar-EG" : "en-US";

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
    } catch (e) { alert("Error: " + e.message); }
    finally { setSyncing(null); }
  };

  if (loading) return <Loading>{t.loading}</Loading>;
  if (error) return <ErrorBox>{error}</ErrorBox>;

  return (
    <div>
      <div style={{ background: "#FEF3C7", border: "1.5px solid #F59E0B", borderRadius: 12, padding: 14, marginBottom: 20 }}>
        <strong style={{ color: "#92400E", fontSize: 13 }}>⚠ {t.sandboxTitle}</strong>
        <div style={{ fontSize: 12, color: "#92400E", marginTop: 4 }}>
          {t.sandboxDesc} <strong>{t.sandboxLink}</strong> {t.sandboxDescEnd}
        </div>
      </div>

      {connections.length === 0 ? (
        <EmptyState>{t.emptyConnections}</EmptyState>
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
                {syncing === c.id ? t.syncingLabel : "🔄 " + t.btnSync}
              </button>
              {c.lastSyncAt && (
                <div style={{ fontSize: 10, color: COLORS.muted, marginTop: 8 }}>
                  {t.lastSync} {new Date(c.lastSyncAt).toLocaleString(localeStr)}
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

function TransactionsTab({ t, lang }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [directionFilter, setDirectionFilter] = useState("");

  const localeStr = lang === "TR" ? "tr-TR" : lang === "AR" ? "ar-EG" : "en-US";

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (directionFilter) params.direction = directionFilter;
      const tx = await bankAPI.transactions(params);
      setRows(tx?.data?.rows || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [directionFilter]);

  if (loading) return <Loading>{t.loading}</Loading>;
  if (error) return <ErrorBox>{error}</ErrorBox>;

  const totalIn = rows.filter((r) => r.direction === "IN").reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const totalOut = rows.filter((r) => r.direction === "OUT").reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const net = totalIn - totalOut;

  const fmt = (n) => new Intl.NumberFormat(localeStr, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard label={t.statTotalIn} value={fmt(totalIn)} color="#10B981" />
        <StatCard label={t.statTotalOut} value={fmt(totalOut)} color="#EF4444" />
        <StatCard label={t.statNet} value={fmt(net)} color={net >= 0 ? "#10B981" : "#EF4444"} />
        <StatCard label={t.statCount} value={rows.length} />
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
        <select
          value={directionFilter}
          onChange={(e) => setDirectionFilter(e.target.value)}
          style={{ ...inp, width: "auto", padding: "8px 12px" }}
        >
          <option value="">{t.filterAll}</option>
          <option value="IN">{t.filterInOnly}</option>
          <option value="OUT">{t.filterOutOnly}</option>
        </select>
        <button onClick={load} style={btnSm}>🔄 {t.btnRefresh}</button>
      </div>

      {rows.length === 0 ? (
        <EmptyState>{t.emptyTransactions}</EmptyState>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: COLORS.bg }}>
              <tr>
                <Th>{t.colDate}</Th>
                <Th>{t.colDescription}</Th>
                <Th>{t.colCounterparty}</Th>
                <Th>{t.colDirection}</Th>
                <Th align="right">{t.colAmount}</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                  <Td><span style={{ fontSize: 12, color: COLORS.muted }}>{new Date(r.transactionDate).toLocaleDateString(localeStr)}</span></Td>
                  <Td><span style={{ fontSize: 12 }}>{r.description || "—"}</span></Td>
                  <Td><span style={{ fontSize: 12 }}>{r.counterpartyName || "—"}</span></Td>
                  <Td>
                    <span style={{
                      padding: "2px 8px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                      background: r.direction === "IN" ? "#D1FAE5" : "#FEE2E2",
                      color: r.direction === "IN" ? "#065F46" : "#991B1B",
                    }}>
                      {r.direction === "IN" ? t.dirIn : t.dirOut}
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

function CsvImportTab({ t, lang }) {
  const [imports, setImports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const localeStr = lang === "TR" ? "tr-TR" : lang === "AR" ? "ar-EG" : "en-US";

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
      setError(t.errFileTooLarge);
      return;
    }

    setUploading(true);
    try {
      const csvText = await file.text();
      const r = await bankAPI.importCsv({ csvText, filename: file.name });
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
      <div style={{ background: "#fff", border: `2px dashed ${COLORS.border}`, borderRadius: 14, padding: 32, textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>📂</div>
        <h3 style={{ margin: "0 0 6px", fontSize: 16, color: COLORS.text }}>{t.csvUploadTitle}</h3>
        <p style={{ margin: "0 0 20px", fontSize: 12, color: COLORS.muted }}>
          {t.csvUploadDesc1}<br />{t.csvUploadDesc2}
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
          {uploading ? t.uploadingLabel : t.btnSelectCsv}
        </button>
      </div>

      {error && <ErrorBox>{error}</ErrorBox>}

      {result && (
        <div style={{
          background: result.errorRows > 0 ? "#FEF3C7" : "#D1FAE5",
          color: result.errorRows > 0 ? "#92400E" : "#065F46",
          padding: 18, borderRadius: 12, marginBottom: 20,
        }}>
          <strong style={{ fontSize: 14 }}>
            {result.errorRows === 0 ? t.successComplete : t.warningPartial}
          </strong>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginTop: 12 }}>
            <div>
              <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 600, textTransform: "uppercase" }}>{t.csvBank}</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{PROVIDER_NAMES[result.bankCode] || result.bankCode}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 600, textTransform: "uppercase" }}>{t.csvTotalRows}</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{result.totalRows}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 600, textTransform: "uppercase" }}>{t.csvAdded}</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{result.insertedRows}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 600, textTransform: "uppercase" }}>{t.csvDuplicate}</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{result.duplicateRows}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 600, textTransform: "uppercase" }}>{t.csvErrors}</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{result.errorRows}</div>
            </div>
          </div>
          {result.errors && result.errors.length > 0 && (
            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{t.errorDetails} ({result.errors.length})</summary>
              <ul style={{ marginTop: 8, paddingLeft: 18, fontSize: 11 }}>
                {result.errors.slice(0, 20).map((e, i) => (
                  <li key={i}>{t.errorRowLabel} {e.row}: {e.reason}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      <h3 style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>{t.historyTitle}</h3>

      {loading ? (
        <Loading>{t.loading}</Loading>
      ) : imports.length === 0 ? (
        <EmptyState>{t.emptyHistory}</EmptyState>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: COLORS.bg }}>
              <tr>
                <Th>{t.colFile}</Th>
                <Th>{t.colBank}</Th>
                <Th>{t.colStatus}</Th>
                <Th align="right">{t.colTotal}</Th>
                <Th align="right">{t.colAddedH}</Th>
                <Th align="right">{t.colDup}</Th>
                <Th align="right">{t.colErr}</Th>
                <Th>{t.colDateH}</Th>
              </tr>
            </thead>
            <tbody>
              {imports.map((imp) => {
                const sc = IMPORT_STATUS_COLORS[imp.status] || IMPORT_STATUS_COLORS.PROCESSING;
                return (
                  <tr key={imp.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                    <Td><span style={{ fontSize: 12, fontFamily: "monospace" }}>{imp.filename}</span></Td>
                    <Td><span style={{ fontSize: 12 }}>{PROVIDER_NAMES[imp.bankCode] || imp.bankCode}</span></Td>
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
                        {new Date(imp.startedAt).toLocaleString(localeStr)}
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
        <strong style={{ color: COLORS.text, fontSize: 13 }}>{t.supportedTitle}</strong>
        <ul style={{ marginTop: 8, paddingLeft: 18, lineHeight: 1.7 }}>
          <li><strong>Garanti BBVA</strong>: {t.supportedGaranti}</li>
          <li><strong>Is Bankasi</strong>: {t.supportedIs}</li>
          <li><strong>Yapi Kredi</strong>: {t.supportedYapi}</li>
          <li><strong>Akbank</strong>: {t.supportedAkbank}</li>
          <li><strong>Ziraat Bankasi</strong>: {t.supportedZiraat}</li>
          <li><strong>Generic</strong>: {t.supportedGeneric}</li>
        </ul>
        <div style={{ marginTop: 8 }}>{t.maxSize}</div>
      </div>
    </div>
  );
}

// ============================================================
// SHARED COMPONENTS
// ============================================================

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent", border: "none", padding: "10px 18px",
        fontSize: 13, fontWeight: active ? 700 : 500,
        color: active ? COLORS.primary : COLORS.muted,
        borderBottom: active ? `2px solid ${COLORS.primary}` : "2px solid transparent",
        cursor: "pointer", marginBottom: -1.5,
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
      padding: "12px 14px", fontSize: 11, fontWeight: 700,
      color: COLORS.muted, textAlign: align || "left", textTransform: "uppercase",
    }}>{children}</th>
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
      padding: 40, textAlign: "center", color: COLORS.muted,
      background: "#fff", borderRadius: 12, border: `1px dashed ${COLORS.border}`,
    }}>
      {children}
    </div>
  );
}

const inp = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: `1.5px solid ${COLORS.border}`, fontSize: 13,
  outline: "none", fontFamily: "inherit",
};

const btnPrimary = {
  background: COLORS.primary, color: "#fff", border: "none",
  borderRadius: 10, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer",
};

const btnSm = {
  background: "transparent", color: COLORS.text, border: `1px solid ${COLORS.border}`,
  borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
};
