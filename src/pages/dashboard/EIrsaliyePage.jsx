// ============================================================
// Zyrix FinSuite - e-Irsaliye (Waybill) Page
// Sprint 1 Phase 1A - Frontend
// ============================================================

import React, { useState, useEffect } from "react";
import { eIrsaliyeAPI } from "../../services/api";

const STATUS_LABELS = {
  DRAFT: { tr: "Taslak", color: "#94A3B8", bg: "#F1F5F9" },
  READY_TO_SEND: { tr: "Gondermeye Hazir", color: "#F59E0B", bg: "#FEF3C7" },
  QUEUED: { tr: "Kuyrukta", color: "#0EA5E9", bg: "#E0F2FE" },
  SENT_PENDING_GIB: { tr: "GIB'e Gonderildi", color: "#6366F1", bg: "#E0E7FF" },
  ACCEPTED: { tr: "Kabul Edildi", color: "#10B981", bg: "#D1FAE5" },
  REJECTED: { tr: "Reddedildi", color: "#EF4444", bg: "#FEE2E2" },
  CANCELLED: { tr: "Iptal Edildi", color: "#64748B", bg: "#F1F5F9" },
};

export default function EIrsaliyePage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await eIrsaliyeAPI.list({ limit: 50 });
      setRows(r?.data?.rows || []);
      setTotal(r?.data?.total || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onQueue = async (id) => {
    try {
      await eIrsaliyeAPI.queue(id);
      await load();
    } catch (e) {
      alert("Hata: " + e.message);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#1E1B4B" }}>e-Irsaliye</h1>
          <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: 13 }}>
            Toplam {total} irsaliye
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{
            background: "linear-gradient(135deg,#6C3AFF,#F43F8E)",
            color: "#fff", border: "none", borderRadius: 10,
            padding: "10px 18px", fontWeight: 700, fontSize: 13,
            cursor: "pointer", boxShadow: "0 4px 12px rgba(108,58,255,0.25)",
          }}
        >
          + Yeni Irsaliye
        </button>
      </div>

      {loading && <div style={{ padding: 40, textAlign: "center", color: "#64748B" }}>Yukleniyor...</div>}
      {error && <div style={{ padding: 14, background: "#FEE2E2", color: "#991B1B", borderRadius: 10 }}>{error}</div>}

      {!loading && !error && rows.length === 0 && (
        <div style={{ padding: 60, textAlign: "center", background: "#F8FAFF", borderRadius: 16, border: "1.5px dashed #E2E8F8" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1E1B4B", marginBottom: 6 }}>Henuz irsaliye yok</div>
          <div style={{ color: "#64748B", fontSize: 13 }}>Ilk irsaliyenizi olusturmak icin "Yeni Irsaliye" tiklayin</div>
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div style={{ background: "#FFFFFF", borderRadius: 16, border: "1.5px solid #E2E8F8", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#F8FAFF" }}>
              <tr>
                <th style={th}>Irsaliye No</th>
                <th style={th}>Alici</th>
                <th style={th}>Tutar</th>
                <th style={th}>Tarih</th>
                <th style={th}>Durum</th>
                <th style={th}>Islemler</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const st = STATUS_LABELS[r.status] || STATUS_LABELS.DRAFT;
                return (
                  <tr key={r.id} style={{ borderTop: "1px solid #E2E8F8" }}>
                    <td style={td}><strong>{r.irsaliyeNo}</strong></td>
                    <td style={td}>{r.buyerTitle}</td>
                    <td style={td}>{Number(r.totalAmount).toFixed(2)} {r.currency}</td>
                    <td style={td}>{new Date(r.createdAt).toLocaleDateString("tr-TR")}</td>
                    <td style={td}>
                      <span style={{
                        background: st.bg, color: st.color,
                        padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700,
                      }}>{st.tr}</span>
                    </td>
                    <td style={td}>
                      {r.status === "DRAFT" && (
                        <button onClick={() => onQueue(r.id)} style={btn}>Gonder</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={load} />}
    </div>
  );
}

// ----------------------------------------------------------------
// Create modal
// ----------------------------------------------------------------
function CreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    buyerTitle: "",
    buyerVkn: "",
    buyerAddress: "",
    deliveryAddress: "",
    vehiclePlate: "",
    driverName: "",
    items: [{ description: "", quantity: 1, unitPrice: 0, vatRate: 0.18 }],
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  const addItem = () => setForm((f) => ({
    ...f, items: [...f.items, { description: "", quantity: 1, unitPrice: 0, vatRate: 0.18 }],
  }));

  const removeItem = (i) => setForm((f) => ({
    ...f, items: f.items.filter((_, idx) => idx !== i),
  }));

  const updateItem = (i, key, value) => setForm((f) => ({
    ...f,
    items: f.items.map((it, idx) => idx === i ? { ...it, [key]: value } : it),
  }));

  const submit = async () => {
    if (!form.buyerTitle.trim()) return setErr("Alici adi zorunludur");
    if (form.items.length === 0 || !form.items[0].description.trim())
      return setErr("En az bir kalem ekleyin");

    setSubmitting(true);
    setErr(null);
    try {
      const payload = {
        ...form,
        items: form.items.map((it) => ({
          description: it.description,
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unitPrice) || 0,
          vatRate: Number(it.vatRate) || 0,
        })),
      };
      await eIrsaliyeAPI.create(payload);
      onCreated();
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={modalOverlay}>
      <div style={modalCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Yeni e-Irsaliye</h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", fontSize: 22, cursor: "pointer", color: "#64748B" }}>×</button>
        </div>

        {err && <div style={{ padding: 10, background: "#FEE2E2", color: "#991B1B", borderRadius: 8, marginBottom: 12, fontSize: 12 }}>{err}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <Field label="Alici Adi *" value={form.buyerTitle} onChange={(v) => setForm({ ...form, buyerTitle: v })} />
          <Field label="Alici VKN" value={form.buyerVkn} onChange={(v) => setForm({ ...form, buyerVkn: v })} />
        </div>
        <Field label="Alici Adresi" value={form.buyerAddress} onChange={(v) => setForm({ ...form, buyerAddress: v })} />
        <Field label="Teslim Adresi" value={form.deliveryAddress} onChange={(v) => setForm({ ...form, deliveryAddress: v })} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <Field label="Plaka" value={form.vehiclePlate} onChange={(v) => setForm({ ...form, vehiclePlate: v })} />
          <Field label="Sofor" value={form.driverName} onChange={(v) => setForm({ ...form, driverName: v })} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <strong style={{ fontSize: 13, color: "#1E1B4B" }}>Kalemler</strong>
            <button onClick={addItem} style={btnSmall}>+ Kalem Ekle</button>
          </div>
          {form.items.map((it, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 80px 100px 80px 30px", gap: 6, marginBottom: 6 }}>
              <input placeholder="Aciklama" value={it.description} onChange={(e) => updateItem(i, "description", e.target.value)} style={input} />
              <input type="number" placeholder="Adet" value={it.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} style={input} />
              <input type="number" step="0.01" placeholder="Birim Fiyat" value={it.unitPrice} onChange={(e) => updateItem(i, "unitPrice", e.target.value)} style={input} />
              <input type="number" step="0.01" placeholder="KDV (0.18)" value={it.vatRate} onChange={(e) => updateItem(i, "vatRate", e.target.value)} style={input} />
              <button onClick={() => removeItem(i)} style={{ background: "#FEE2E2", border: "none", borderRadius: 6, color: "#991B1B", cursor: "pointer" }}>×</button>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button onClick={onClose} style={btnSecondary}>Iptal</button>
          <button onClick={submit} disabled={submitting} style={btn}>{submitting ? "Olusturuluyor..." : "Olustur"}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#64748B", marginBottom: 4 }}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} style={input} />
    </div>
  );
}

const th = { padding: "12px 14px", fontSize: 11, fontWeight: 700, color: "#64748B", textAlign: "left", textTransform: "uppercase" };
const td = { padding: "14px", fontSize: 13, color: "#1E1B4B" };
const btn = { background: "linear-gradient(135deg,#6C3AFF,#F43F8E)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer" };
const btnSecondary = { background: "#F8FAFF", color: "#64748B", border: "1.5px solid #E2E8F8", borderRadius: 8, padding: "8px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer" };
const btnSmall = { background: "#F8FAFF", color: "#6C3AFF", border: "1.5px solid #E2E8F8", borderRadius: 6, padding: "5px 10px", fontWeight: 700, fontSize: 11, cursor: "pointer" };
const input = { width: "100%", padding: "8px 10px", border: "1.5px solid #E2E8F8", borderRadius: 8, fontSize: 13, fontFamily: "inherit" };
const modalOverlay = { position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 };
const modalCard = { background: "#fff", borderRadius: 18, padding: 24, maxWidth: 640, width: "100%", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 50px rgba(0,0,0,0.2)" };
