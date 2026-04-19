import { useState, useEffect } from 'react';

// ── usePWA Hook ────────────────────────────────────────────────
export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled]     = useState(false);
  const [isOnline, setIsOnline]           = useState(navigator.onLine);

  useEffect(() => {
    // Capture install prompt
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Online/offline
    const onOnline  = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) return false;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setInstallPrompt(null);
      return true;
    }
    return false;
  };

  return { installPrompt, isInstalled, isOnline, install };
}

// ── PWA Install Banner ─────────────────────────────────────────
export function PWAInstallBanner() {
  const { installPrompt, isInstalled, isOnline, install } = usePWA();
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('pwa_banner_dismissed') === 'true'
  );

  if (isInstalled || dismissed || !installPrompt) return (
    !isOnline ? (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9998,
        background: '#f59e0b', color: '#fff',
        padding: '10px 20px', textAlign: 'center',
        fontSize: 13, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        📵 Çevrimdışısınız — veriler önbellekten gösteriliyor
      </div>
    ) : null
  );

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      background: '#0f172a', color: '#fff', borderRadius: 16,
      padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14,
      zIndex: 9997, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      maxWidth: 380, width: 'calc(100% - 32px)',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: 'linear-gradient(135deg,#6C3AFF,#F43F8E)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, fontWeight: 900, color: '#fff',
      }}>Z</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
          Uygulamayı Yükle
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>
          Ana ekrana ekle — daha hızlı erişim
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => { setDismissed(true); localStorage.setItem('pwa_banner_dismissed','true'); }}
          style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
            borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 12,
          }}
        >
          Sonra
        </button>
        <button
          onClick={install}
          style={{
            background: 'linear-gradient(135deg,#6C3AFF,#F43F8E)', border: 'none',
            color: '#fff', borderRadius: 8, padding: '6px 14px',
            cursor: 'pointer', fontSize: 12, fontWeight: 700,
          }}
        >
          Yükle
        </button>
      </div>
    </div>
  );
}