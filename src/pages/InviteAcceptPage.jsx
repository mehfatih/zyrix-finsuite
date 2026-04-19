import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

export default function InviteAcceptPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleAccept = async () => {
    if (!password || password.length < 6) return setError('Şifre en az 6 karakter olmalıdır');
    if (password !== confirm) return setError('Şifreler eşleşmiyor');
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/team/accept/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Geçersiz davet');
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch {
      setError('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0ea5e9 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '40px 36px',
        width: '100%', maxWidth: 400,
        boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>
            Zyrix <span style={{ color: '#0ea5e9' }}>FinSuite</span>
          </div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>Ekip Daveti</div>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#16a34a' }}>Davet kabul edildi!</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>Giriş sayfasına yönlendiriliyorsunuz…</div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 24, textAlign: 'center', lineHeight: 1.6 }}>
              Hesabınız için bir şifre belirleyin.
            </p>

            {[
              { label: 'Şifre', value: password, setter: setPassword },
              { label: 'Şifre Tekrar', value: confirm, setter: setConfirm },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  {f.label}
                </label>
                <input
                  type="password"
                  value={f.value}
                  onChange={e => { f.setter(e.target.value); setError(''); }}
                  style={{
                    width: '100%', padding: '11px 14px', border: `1px solid ${error ? '#fca5a5' : '#e2e8f0'}`,
                    borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}

            {error && (
              <div style={{ color: '#dc2626', fontSize: 12, marginBottom: 12, fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handleAccept}
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg,#0f172a,#1e3a5f)',
                border: 'none', borderRadius: 10, color: '#fff',
                fontSize: 14, fontWeight: 700, cursor: loading ? 'default' : 'pointer',
              }}
            >
              {loading ? 'Kaydediliyor…' : 'Daveti Kabul Et ✓'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}