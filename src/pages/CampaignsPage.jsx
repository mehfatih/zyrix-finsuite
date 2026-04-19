import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL;

const CAMPAIGN_TYPES = [
  { value: 'EMAIL', label: 'Email', icon: '📧', color: '#0ea5e9', bg: '#f0f9ff' },
  { value: 'SMS', label: 'SMS', icon: '💬', color: '#8b5cf6', bg: '#faf5ff' },
  { value: 'DISCOUNT', label: 'İndirim', icon: '🏷️', color: '#16a34a', bg: '#f0fdf4' },
];

const STATUS_MAP = {
  DRAFT: { label: 'Taslak', color: '#6b7280', bg: '#f9fafb' },
  SENT: { label: 'Gönderildi', color: '#16a34a', bg: '#f0fdf4' },
  SCHEDULED: { label: 'Zamanlandı', color: '#0ea5e9', bg: '#f0f9ff' },
  CANCELLED: { label: 'İptal', color: '#dc2626', bg: '#fef2f2' },
};

const EMPTY_FORM = {
  name: '', type: 'EMAIL', subject: '', body: '',
  discountPercent: '', startDate: '', endDate: '', targetSegment: 'ALL',
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(null);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem('zyrix_token');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`${API}/api/campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCampaigns(Array.isArray(data) ? data : []);
    } catch {
      showToast('Kampanyalar yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const handleSave = async () => {
    if (!form.name) return showToast('Kampanya adı gereklidir', 'error');
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.error || 'Hata', 'error');
      showToast('Kampanya oluşturuldu!');
      setShowModal(false);
      setForm(EMPTY_FORM);
      fetchCampaigns();
    } catch {
      showToast('Hata oluştu', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async (id) => {
    if (!confirm('Kampanya şimdi gönderilsin mi?')) return;
    setSending(id);
    try {
      const res = await fetch(`${API}/api/campaigns/${id}/send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.error || 'Hata', 'error');
      showToast(`✅ ${data.sentCount || 0} kişiye gönderildi!`);
      fetchCampaigns();
    } catch {
      showToast('Gönderme hatası', 'error');
    } finally {
      setSending(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Kampanya silinsin mi?')) return;
    try {
      await fetch(`${API}/api/campaigns/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast('Silindi');
      fetchCampaigns();
    } catch {
      showToast('Silme hatası', 'error');
    }
  };

  const typeInfo = (type) => CAMPAIGN_TYPES.find(t => t.value === type) || CAMPAIGN_TYPES[0];
  const statusInfo = (status) => STATUS_MAP[status] || STATUS_MAP.DRAFT;

  const stats = {
    total: campaigns.length,
    sent: campaigns.filter(c => c.status === 'SENT').length,
    draft: campaigns.filter(c => c.status === 'DRAFT').length,
    totalSent: campaigns.reduce((s, c) => s + (c.sentCount || 0), 0),
  };

  return (
    <div style={{ padding: '32px', maxWidth: '960px', margin: '0 auto' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.type === 'error' ? '#fee2e2' : '#f0fdf4',
          border: `1px solid ${toast.type === 'error' ? '#fca5a5' : '#86efac'}`,
          color: toast.type === 'error' ? '#dc2626' : '#16a34a',
          padding: '12px 20px', borderRadius: 10, fontWeight: 600, fontSize: 13,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>Kampanya Yönetimi</h1>
          <p style={{ color: '#64748b', marginTop: 6, fontSize: 14 }}>Email ve indirim kampanyaları oluşturun</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: 'linear-gradient(135deg,#0f172a,#1e3a5f)',
            color: '#fff', border: 'none', borderRadius: 10,
            padding: '12px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}
        >
          + Yeni Kampanya
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Toplam', value: stats.total, icon: '📊', color: '#0f172a' },
          { label: 'Gönderildi', value: stats.sent, icon: '✅', color: '#16a34a' },
          { label: 'Taslak', value: stats.draft, icon: '📝', color: '#d97706' },
          { label: 'Erişim', value: stats.totalSent.toLocaleString('tr-TR'), icon: '👥', color: '#0ea5e9' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#fff', border: '1px solid #e2e8f0',
            borderRadius: 12, padding: '16px 18px',
          }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Campaign Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#94a3b8' }}>Yükleniyor…</div>
      ) : campaigns.length === 0 ? (
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
          padding: 48, textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📣</div>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>Henüz kampanya yok</div>
          <div style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>İlk kampanyanızı oluşturun</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {campaigns.map(c => {
            const t = typeInfo(c.type);
            const s = statusInfo(c.status);
            return (
              <div key={c.id} style={{
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
                padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: t.bg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 20, flexShrink: 0,
                }}>
                  {t.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
                    {c.subject || c.body?.slice(0, 60) || '—'}
                    {c.discountPercent ? ` · %${c.discountPercent} indirim` : ''}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    background: t.bg, color: t.color, padding: '3px 10px',
                    borderRadius: 999, fontSize: 11, fontWeight: 700,
                  }}>
                    {t.label}
                  </span>
                  <span style={{
                    background: s.bg, color: s.color, padding: '3px 10px',
                    borderRadius: 999, fontSize: 11, fontWeight: 600,
                  }}>
                    {s.label}
                    {c.sentCount ? ` (${c.sentCount})` : ''}
                  </span>

                  {c.status === 'DRAFT' && (
                    <button
                      onClick={() => handleSend(c.id)}
                      disabled={sending === c.id}
                      style={{
                        background: '#0ea5e9', color: '#fff', border: 'none',
                        borderRadius: 7, padding: '6px 14px', fontSize: 12,
                        fontWeight: 700, cursor: 'pointer', opacity: sending === c.id ? 0.7 : 1,
                      }}
                    >
                      {sending === c.id ? '…' : 'Gönder'}
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(c.id)}
                    style={{
                      background: '#fff', border: '1px solid #fca5a5', color: '#dc2626',
                      borderRadius: 7, padding: '5px 12px', fontSize: 12,
                      fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Sil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: 20,
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 32,
            width: '100%', maxWidth: 500,
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>
              Yeni Kampanya
            </h2>

            {/* Type Selector */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                Kampanya Türü
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {CAMPAIGN_TYPES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setForm(p => ({ ...p, type: t.value }))}
                    style={{
                      flex: 1, padding: '10px 8px', border: `2px solid ${form.type === t.value ? t.color : '#e2e8f0'}`,
                      borderRadius: 8, background: form.type === t.value ? t.bg : '#fff',
                      cursor: 'pointer', fontSize: 12, fontWeight: 700,
                      color: form.type === t.value ? t.color : '#64748b',
                    }}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fields */}
            {[
              { label: 'Kampanya Adı *', key: 'name', type: 'text', placeholder: 'Yaz Kampanyası 2026' },
              ...(form.type === 'EMAIL' ? [
                { label: 'Email Konusu', key: 'subject', type: 'text', placeholder: 'Özel teklif sizi bekliyor!' },
              ] : []),
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  {f.label}
                </label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{
                    width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
                    borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}

            {(form.type === 'EMAIL' || form.type === 'SMS') && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Mesaj İçeriği
                </label>
                <textarea
                  rows={4}
                  placeholder="Kampanya mesajınızı yazın…"
                  value={form.body}
                  onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                  style={{
                    width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
                    borderRadius: 8, fontSize: 13, outline: 'none',
                    boxSizing: 'border-box', resize: 'vertical',
                  }}
                />
              </div>
            )}

            {(form.type === 'DISCOUNT') && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  İndirim Oranı (%)
                </label>
                <input
                  type="number"
                  placeholder="20"
                  min="1" max="100"
                  value={form.discountPercent}
                  onChange={e => setForm(p => ({ ...p, discountPercent: e.target.value }))}
                  style={{
                    width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
                    borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Başlangıç', key: 'startDate' },
                { label: 'Bitiş', key: 'endDate' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    {f.label}
                  </label>
                  <input
                    type="date"
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{
                      width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
                      borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}
                style={{
                  flex: 1, padding: 11, border: '1px solid #e2e8f0',
                  borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', color: '#374151',
                }}
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 2, padding: 11,
                  background: 'linear-gradient(135deg,#0f172a,#1e3a5f)',
                  border: 'none', borderRadius: 8, color: '#fff',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? 'Kaydediliyor…' : 'Kampanya Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}