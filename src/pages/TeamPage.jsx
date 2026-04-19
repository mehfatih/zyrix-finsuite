import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL;

const ROLES = [
  { value: 'ADMIN', label: 'Admin', color: '#dc2626', bg: '#fef2f2', desc: 'Tam yetki' },
  { value: 'ACCOUNTANT', label: 'Muhasebeci', color: '#0ea5e9', bg: '#f0f9ff', desc: 'Fatura + raporlar' },
  { value: 'SALES', label: 'Satış', color: '#16a34a', bg: '#f0fdf4', desc: 'Müşteri + fatura oluşturma' },
  { value: 'VIEWER', label: 'Görüntüleyici', color: '#6b7280', bg: '#f9fafb', desc: 'Sadece okuma' },
];

const STATUS_MAP = {
  ACTIVE: { label: 'Aktif', color: '#16a34a', bg: '#f0fdf4' },
  PENDING: { label: 'Bekliyor', color: '#d97706', bg: '#fffbeb' },
  DISABLED: { label: 'Devre Dışı', color: '#6b7280', bg: '#f9fafb' },
};

export default function TeamPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', name: '', role: 'VIEWER' });
  const [inviting, setInviting] = useState(false);
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem('zyrix_token');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch(`${API}/api/team`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch {
      showToast('Ekip yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleInvite = async () => {
    if (!inviteForm.email) return showToast('Email gereklidir', 'error');
    setInviting(true);
    try {
      const res = await fetch(`${API}/api/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(inviteForm),
      });
      const data = await res.json();
      if (!res.ok) return showToast(data.error || 'Hata', 'error');
      showToast('Davet gönderildi!');
      setShowInvite(false);
      setInviteForm({ email: '', name: '', role: 'VIEWER' });
      fetchMembers();
    } catch {
      showToast('Bağlantı hatası', 'error');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (id, name) => {
    if (!confirm(`${name} ekipten çıkarılsın mı?`)) return;
    try {
      const res = await fetch(`${API}/api/team/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return showToast('Silme başarısız', 'error');
      showToast('Üye kaldırıldı');
      fetchMembers();
    } catch {
      showToast('Hata oluştu', 'error');
    }
  };

  const roleInfo = (role) => ROLES.find(r => r.value === role) || ROLES[3];
  const statusInfo = (status) => STATUS_MAP[status] || STATUS_MAP.PENDING;

  return (
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.type === 'error' ? '#fee2e2' : '#f0fdf4',
          border: `1px solid ${toast.type === 'error' ? '#fca5a5' : '#86efac'}`,
          color: toast.type === 'error' ? '#dc2626' : '#16a34a',
          padding: '12px 20px', borderRadius: '10px', fontWeight: 600, fontSize: 13,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>Ekip Yönetimi</h1>
          <p style={{ color: '#64748b', marginTop: 6, fontSize: 14 }}>Ekip üyelerini davet edin ve rollerini yönetin</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          style={{
            background: 'linear-gradient(135deg,#0f172a,#1e3a5f)',
            color: '#fff', border: 'none', borderRadius: 10,
            padding: '12px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}
        >
          + Üye Davet Et
        </button>
      </div>

      {/* Rol açıklamaları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
        {ROLES.map(r => (
          <div key={r.value} style={{
            background: r.bg, border: `1px solid ${r.color}22`,
            borderRadius: 10, padding: '12px 14px',
          }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: r.color }}>{r.label}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 3 }}>{r.desc}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Üye', 'Rol', 'Durum', 'Katılım', 'İşlem'].map(h => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left',
                  fontSize: 11, fontWeight: 700, color: '#64748b',
                  textTransform: 'uppercase', letterSpacing: '0.8px',
                  borderBottom: '1px solid #e2e8f0',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Yükleniyor…</td></tr>
            ) : members.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
                <div style={{ fontWeight: 600 }}>Henüz ekip üyesi yok</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Davet göndererek başlayın</div>
              </td></tr>
            ) : members.map((m, i) => {
              const role = roleInfo(m.role);
              const status = statusInfo(m.status);
              return (
                <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#0f172a,#0ea5e9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: 14,
                      }}>
                        {(m.name || m.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{m.name || '—'}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      background: role.bg, color: role.color,
                      padding: '4px 10px', borderRadius: 999,
                      fontSize: 11, fontWeight: 700,
                    }}>
                      {role.label}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      background: status.bg, color: status.color,
                      padding: '4px 10px', borderRadius: 999,
                      fontSize: 11, fontWeight: 600,
                    }}>
                      {status.label}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 12, color: '#64748b' }}>
                    {new Date(m.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button
                      onClick={() => handleRemove(m.id, m.name || m.email)}
                      style={{
                        background: '#fff', border: '1px solid #fca5a5', color: '#dc2626',
                        borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Kaldır
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 32,
            width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 20 }}>
              Ekip Üyesi Davet Et
            </h2>

            {[
              { label: 'Email *', key: 'email', type: 'email', placeholder: 'ornek@email.com' },
              { label: 'Ad Soyad', key: 'name', type: 'text', placeholder: 'İsteğe bağlı' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  {f.label}
                </label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={inviteForm[f.key]}
                  onChange={e => setInviteForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{
                    width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
                    borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Rol
              </label>
              <select
                value={inviteForm.role}
                onChange={e => setInviteForm(p => ({ ...p, role: e.target.value }))}
                style={{
                  width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
                  borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box',
                  background: '#fff',
                }}
              >
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowInvite(false)}
                style={{
                  flex: 1, padding: '11px', border: '1px solid #e2e8f0',
                  borderRadius: 8, background: '#fff', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', color: '#374151',
                }}
              >
                İptal
              </button>
              <button
                onClick={handleInvite}
                disabled={inviting}
                style={{
                  flex: 2, padding: '11px',
                  background: 'linear-gradient(135deg,#0f172a,#1e3a5f)',
                  border: 'none', borderRadius: 8, color: '#fff',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  opacity: inviting ? 0.7 : 1,
                }}
              >
                {inviting ? 'Gönderiliyor…' : 'Davet Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}