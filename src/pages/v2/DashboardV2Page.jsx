import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlag } from '@/contexts/FeatureFlagsContext';
import CustomerLayoutV2 from '@/components/v2/CustomerLayoutV2';
import { CUSTOMER_PALETTE } from '@/design-system-v2/colors';

/**
 * V2 dashboard placeholder. Renders inside CustomerLayoutV2 (sidebar + main)
 * when `customerDashboardV2` flag is ON; otherwise redirects to legacy
 * /dashboard. Sidebar visibility is gated by a separate `newSidebarV2` flag
 * inside CustomerLayoutV2 itself.
 */
export default function DashboardV2Page() {
  const enabled = useFlag('customerDashboardV2');
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: '', email: '' });

  useEffect(() => {
    if (!enabled) navigate('/dashboard', { replace: true });
  }, [enabled, navigate]);

  // Hydrate user info from localStorage (zyrix_user is what AuthContext writes).
  useEffect(() => {
    try {
      const raw = localStorage.getItem('zyrix_user');
      if (raw) {
        const u = JSON.parse(raw);
        setUser({
          name:  u.name || u.fullName || u.email || 'Kullanıcı',
          email: u.email || ''
        });
      }
    } catch { /* ignore */ }
  }, []);

  const handleSignOut = () => {
    try {
      localStorage.removeItem('zyrix_token');
      localStorage.removeItem('zyrix_user');
    } catch { /* ignore */ }
    navigate('/login');
  };

  if (!enabled) return null;

  return (
    <CustomerLayoutV2 user={user} language="tr" onSignOut={handleSignOut}>
      <div style={{ padding: '24px 28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: CUSTOMER_PALETTE.text.primary, margin: 0 }}>
          Pano (V2 placeholder)
        </h1>
        <p style={{ fontSize: '14px', color: CUSTOMER_PALETTE.text.secondary, marginTop: '6px' }}>
          Sidebar ve Cmd+K hazır. Pano içeriği Prompt 3'te dolacak.
        </p>
        <p style={{ fontSize: '13px', color: CUSTOMER_PALETTE.text.tertiary, marginTop: '12px' }}>
          Cmd+K'ya bas ve "fatura" yaz — komut paleti çalışıyor mu kontrol et.
        </p>
      </div>
    </CustomerLayoutV2>
  );
}
