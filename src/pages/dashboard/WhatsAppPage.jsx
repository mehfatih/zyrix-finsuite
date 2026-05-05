// ============================================================
// Zyrix FinSuite - WhatsApp Messages Page
// Sprint 1 Phase 1B - Frontend
// ============================================================

import React, { useState, useEffect } from "react";
import { whatsappAPI } from "../../services/api";

const STATUS_LABELS = {
  PENDING:   { tr: "Bekliyor", color: "#94A3B8", bg: "#F1F5F9" },
  QUEUED:    { tr: "Kuyrukta", color: "#0EA5E9", bg: "#E0F2FE" },
  SENT:      { tr: "Gonderildi", color: "#6366F1", bg: "#E0E7FF" },
  DELIVERED: { tr: "Teslim Edildi", color: "#10B981", bg: "#D1FAE5" },
  READ:      { tr: "Okundu", color: "#10B981", bg: "#D1FAE5" },
  FAILED:    { tr: "Hata", color: "#EF4444", bg: "#FEE2E2" },
};

export default function WhatsAppPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const r = await whatsappAPI.list({ limit: 50 });
      setRows(r?.data?.rows || []);
      setTotal(r?.data?.total || 0);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#1E1B4B" }}>WhatsApp Mesajlari</h1>
        <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: 13 }}>
          Faturalariniz icin gonderilen WhatsApp bildirimlerini yonetin · Toplam {total}
        </p>
      </div>

      <div style={{ padding: 16, background: "#E0E7FF", border: "1.5px solid #6366F1", borderRadius: 12, marginBottom: 20 }}>
        <strong style={{ fontSize: 13, color: "#3730A3" }}>💡 WhatsApp ile Faturalama</strong>
        <div style={{ fontSize: 12, color: "#3730A3", marginTop: 4 }}>
          Faturalar sayfasindan herhangi bir faturayi acin ve "WhatsApp ile Gonder" butonuna tiklayin.
        </div>
      </div>

      {loading && <div style={{ padding: 40, textAlign: "center", color: "#64748B" }}>Yukleniyor...</div>}
      {error && <div style={{ padding: 14, background: "#FEE2E2", color: "#991B1B", borderRadius: 10 }}>{error}</div>}

      {!loading && rows.length === 0 && (
        <div style={{ padding: 60, textAlign: "center", background: "#F8FAFF", borderRadius: 16, border: "1.5px dashed #E2E8F8" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1E1B4B" }}>Henuz mesaj yok</div>
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1.5px solid #E2E8F8", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#F8FAFF" }}>
              <tr>
                <th style={th}>Alici</th>
                <th style={th}>Mesaj</th>
                <th style={th}>Durum</th>
                <th style={th}>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const st = STATUS_LABELS[r.status] || STATUS_LABELS.PENDING;
                return (
                  <tr key={r.id} style={{ borderTop: "1px solid #E2E8F8" }}>
                    <td style={td}>{r.recipientPhone}</td>
                    <td style={{ ...td, maxWidth: 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.bodyText || "—"}
                    </td>
                    <td style={td}>
                      <span style={{ background: st.bg, color: st.color, padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                        {st.tr}
                      </span>
                    </td>
                    <td style={td}>{new Date(r.createdAt).toLocaleString("tr-TR")}</td>
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
