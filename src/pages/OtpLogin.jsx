import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

// ─── OtpLogin component — kullanımı:
// LoginPage.jsx içinde import edip <OtpLogin /> olarak ekle
// YA DA doğrudan /login route'una bağla
export default function OtpLogin({ onSuccess }) {
  const navigate = useNavigate();
  const [step, setStep] = useState('input');   // 'input' | 'verify'
  const [channel, setChannel] = useState('email');  // 'email' | 'phone'
  const [value, setValue] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentTo, setSentTo] = useState('');

  const handleRequest = async () => {
    if (!value) return setError('Email veya telefon giriniz');
    setError('');
    setLoading(true);
    try {
      const body = channel === 'email' ? { email: value } : { phone: value };
      const res = await fetch(`${API}/api/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Hata oluştu');
      setSentTo(value);
      setStep('verify');
    } catch {
      setError('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code || code.length < 6) return setError('6 haneli kodu giriniz');
    setError('');
    setLoading(true);
    try {
      const body = channel === 'email'
        ? { email: sentTo, code }
        : { phone: sentTo, code };

      const res = await fetch(`${API}/api/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error || 'Geçersiz kod');

      // Token kaydet
      localStorage.setItem('zyrix_token', data.token);
      localStorage.setItem('zyrix_user', JSON.stringify(data.merchant));

      // Auth flow — rapordaki ile aynı mantık
      if (onSuccess) {
        onSuccess(data);
      } else {
        if (!data.merchant.onboardingDone) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      }
    } catch {
      setError('Doğrulama hatası');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0ea5e9 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '40px 36px',
        width: '100%', maxWidth: 420,
        boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>
            Zyrix <span style={{ color: '#0ea5e9' }}>FinSuite</span>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            Güvenli Giriş
          </div>
        </div>

        {step === 'input' ? (
          <>
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 20, textAlign: 'center', lineHeight: 1.6 }}>
              Giriş kodunu almak için email veya telefon numaranızı girin.
            </p>

            {/* Channel toggle */}
            <div style={{ display: 'flex', marginBottom: 16, background: '#f8fafc', borderRadius: 10, padding: 4 }}>
              {[
                { v: 'email', l: '📧 Email' },
                { v: 'phone', l: '📱 Telefon' },
              ].map(c => (
                <button
                  key={c.v}
                  onClick={() => { setChannel(c.v); setValue(''); setError(''); }}
                  style={{
                    flex: 1, padding: '9px', border: 'none', borderRadius: 8,
                    fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    background: channel === c.v ? '#fff' : 'transparent',
                    color: channel === c.v ? '#0f172a' : '#94a3b8',
                    boxShadow: channel === c.v ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {c.l}
                </button>
              ))}
            </div>

            <input
              type={channel === 'email' ? 'email' : 'tel'}
              placeholder={channel === 'email' ? 'ornek@email.com' : '+90 555 000 00 00'}
              value={value}
              onChange={e => { setValue(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleRequest()}
              style={{
                width: '100%', padding: '13px 16px', border: `2px solid ${error ? '#fca5a5' : '#e2e8f0'}`,
                borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                marginBottom: error ? 8 : 16,
                transition: 'border-color 0.2s',
              }}
            />

            {error && (
              <div style={{ color: '#dc2626', fontSize: 12, marginBottom: 12, fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handleRequest}
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg,#0f172a,#1e3a5f)',
                border: 'none', borderRadius: 10, color: '#fff',
                fontSize: 14, fontWeight: 700, cursor: loading ? 'default' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {loading ? 'Gönderiliyor…' : 'Kod Gönder →'}
            </button>
          </>
        ) : (
          <>
            <div style={{
              background: '#f0f9ff', border: '1px solid #bae6fd',
              borderRadius: 10, padding: '12px 16px', marginBottom: 24, textAlign: 'center',
            }}>
              <div style={{ fontSize: 12, color: '#0369a1', fontWeight: 600 }}>
                Kod gönderildi →
              </div>
              <div style={{ fontSize: 14, color: '#0f172a', fontWeight: 700, marginTop: 2 }}>
                {sentTo}
              </div>
            </div>

            <p style={{ fontSize: 13, color: '#475569', marginBottom: 16, textAlign: 'center' }}>
              6 haneli doğrulama kodunu girin. Kod 10 dakika geçerlidir.
            </p>

            {/* OTP Input */}
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="• • • • • •"
              value={code}
              onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
              style={{
                width: '100%', padding: '16px', border: `2px solid ${error ? '#fca5a5' : '#e2e8f0'}`,
                borderRadius: 10, fontSize: 28, fontWeight: 800, textAlign: 'center',
                letterSpacing: '12px', outline: 'none', boxSizing: 'border-box',
                marginBottom: error ? 8 : 16,
                color: '#0f172a',
              }}
            />

            {error && (
              <div style={{ color: '#dc2626', fontSize: 12, marginBottom: 12, fontWeight: 600 }}>
                ⚠️ {error}
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={loading || code.length < 6}
              style={{
                width: '100%', padding: '13px',
                background: (loading || code.length < 6) ? '#94a3b8' : 'linear-gradient(135deg,#0f172a,#1e3a5f)',
                border: 'none', borderRadius: 10, color: '#fff',
                fontSize: 14, fontWeight: 700,
                cursor: (loading || code.length < 6) ? 'default' : 'pointer',
                marginBottom: 12,
              }}
            >
              {loading ? 'Doğrulanıyor…' : 'Giriş Yap ✓'}
            </button>

            <button
              onClick={() => { setStep('input'); setCode(''); setError(''); }}
              style={{
                width: '100%', padding: '10px',
                background: 'transparent', border: '1px solid #e2e8f0',
                borderRadius: 10, color: '#64748b', fontSize: 13,
                fontWeight: 600, cursor: 'pointer',
              }}
            >
              ← Geri Dön
            </button>
          </>
        )}
      </div>
    </div>
  );
}