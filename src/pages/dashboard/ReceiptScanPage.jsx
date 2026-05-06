// ============================================================
// Zyrix FinSuite - Receipt OCR Scanner Page
// Sprint 1 Phase 1A - Frontend
// ============================================================

import React, { useState, useEffect } from "react";
import { useI18n } from "../../i18n/i18n";
import { receiptScanAPI } from "../../services/api";

const STATUS_LABELS = {
  PENDING: { tr: "Bekliyor", color: "#94A3B8", bg: "#F1F5F9" },
  PROCESSING: { tr: "Isleniyor", color: "#F59E0B", bg: "#FEF3C7" },
  PARSED: { tr: "Cozumlendi", color: "#0EA5E9", bg: "#E0F2FE" },
  FAILED: { tr: "Hata", color: "#EF4444", bg: "#FEE2E2" },
  CONVERTED: { tr: "Gidere Eklendi", color: "#10B981", bg: "#D1FAE5" },
};

const TXT = {
  TR: { vendor: "Saticy", amount: "Tutar", date: "Tarih", category: "Kategori", status: "Durum" },
  EN: { vendor: "Vendor",  amount: "Amount", date: "Date", category: "Category", status: "Status" },
  AR: { vendor: "البائع",   amount: "المبلغ", date: "التاريخ", category: "الفئة", status: "الحالة" },
};

export default function ReceiptScanPage() {
  const { lang } = useI18n();
  const t = TXT[lang] || TXT.TR;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await receiptScanAPI.list({ limit: 50 });
      setRows(r?.data?.rows || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert("Dosya boyutu 5MB'i gecemez");

    setScanning(true);
    setError(null);
    setScanResult(null);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target.result;
      const base64 = dataUrl.split(",")[1];
      try {
        const r = await receiptScanAPI.scan(base64, file.type, true);
        setScanResult(r?.data);
        await load();
      } catch (e) {
        setError(e.message);
      } finally {
        setScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#1E1B4B" }}>Akilli Fis Okuma</h1>
        <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: 13 }}>
          Fis fotografi yukleyin, otomatik olarak gider olusturulsun
        </p>
      </div>

      <div style={{
        background: "linear-gradient(135deg,#6C3AFF15,#F43F8E15)",
        border: "2px dashed #6C3AFF",
        borderRadius: 16,
        padding: 32,
        textAlign: "center",
        marginBottom: 24,
        position: "relative",
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1E1B4B", marginBottom: 6 }}>
          Fisinizin Fotografini Yukleyin
        </div>
        <div style={{ fontSize: 12, color: "#64748B", marginBottom: 16 }}>
          JPG, PNG, WebP - max 5MB
        </div>
        <label style={{
          display: "inline-block",
          background: "linear-gradient(135deg,#6C3AFF,#F43F8E)",
          color: "#fff", borderRadius: 10,
          padding: "12px 24px", fontWeight: 700, fontSize: 13,
          cursor: "pointer", boxShadow: "0 4px 12px rgba(108,58,255,0.25)",
        }}>
          {scanning ? "Tarayniyor..." : "Fis Sec"}
          <input type="file" accept="image/*" onChange={onUpload} disabled={scanning}
            style={{ display: "none" }} />
        </label>
      </div>

      {error && <div style={{ padding: 14, background: "#FEE2E2", color: "#991B1B", borderRadius: 10, marginBottom: 16 }}>{error}</div>}

      {scanResult && (
        <div style={{ padding: 18, background: "#D1FAE5", border: "1.5px solid #10B981", borderRadius: 12, marginBottom: 24 }}>
          <strong style={{ color: "#065F46" }}>✅ Basarili!</strong>
          <div style={{ marginTop: 8, fontSize: 13, color: "#065F46" }}>
            {scanResult.parsed?.vendor && <>Saticy: <strong>{scanResult.parsed.vendor}</strong> · </>}
            {scanResult.parsed?.amount && <>Tutar: <strong>{scanResult.parsed.amount} {scanResult.parsed.currency}</strong> · </>}
            {scanResult.expense && <>Gider olusturuldu (#{scanResult.expense.id?.substring(0, 8)})</>}
          </div>
        </div>
      )}

      <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1E1B4B", marginBottom: 12 }}>Gecmis Taramalar</h3>
      {loading && <div style={{ padding: 40, textAlign: "center", color: "#64748B" }}>Yukleniyor...</div>}
      {!loading && rows.length === 0 && (
        <div style={{ padding: 30, textAlign: "center", color: "#64748B", background: "#F8FAFF", borderRadius: 12 }}>
          Henuz tarama yok
        </div>
      )}
      {!loading && rows.length > 0 && (
        <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1.5px solid #E2E8F8", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#F8FAFF" }}>
              <tr>
                <th style={th}>{t.vendor}</th>
                <th style={th}>{t.amount}</th>
                <th style={th}>{t.date}</th>
                <th style={th}>{t.category}</th>
                <th style={th}>{t.status}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const st = STATUS_LABELS[r.status] || STATUS_LABELS.PENDING;
                return (
                  <tr key={r.id} style={{ borderTop: "1px solid #E2E8F8" }}>
                    <td style={td}>{r.parsedVendor || "—"}</td>
                    <td style={td}>{r.parsedAmount ? `${Number(r.parsedAmount).toFixed(2)} ${r.parsedCurrency}` : "—"}</td>
                    <td style={td}>{r.parsedDate ? new Date(r.parsedDate).toLocaleDateString("tr-TR") : "—"}</td>
                    <td style={td}>{r.parsedCategory || "—"}</td>
                    <td style={td}>
                      <span style={{ background: st.bg, color: st.color, padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                        {st.tr}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const th = { padding: "12px 14px", fontSize: 11, fontWeight: 700, color: "#64748B", textAlign: "left", textTransform: "uppercase" };
const td = { padding: "14px", fontSize: 13, color: "#1E1B4B" };
