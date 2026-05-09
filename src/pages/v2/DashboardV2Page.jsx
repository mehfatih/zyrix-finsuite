import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlag } from '@/contexts/FeatureFlagsContext';
import { CUSTOMER_PALETTE } from '@/design-system-v2/colors';

/**
 * Placeholder for the new dashboard. Prompt 3 will fill this in.
 * If the customerDashboardV2 flag is OFF, redirect to legacy /dashboard.
 */
export default function DashboardV2Page() {
  const enabled = useFlag('customerDashboardV2');
  const navigate = useNavigate();

  useEffect(() => {
    if (!enabled) navigate('/dashboard', { replace: true });
  }, [enabled, navigate]);

  if (!enabled) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: CUSTOMER_PALETTE.bg.primary,
      padding: '40px',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: CUSTOMER_PALETTE.text.primary }}>
        V2 Dashboard — Prompt 3 buraya inşa edecek
      </h1>
      <p style={{ fontSize: '14px', color: CUSTOMER_PALETTE.text.secondary, marginTop: '8px' }}>
        Şu anda placeholder olarak duruyor. Sidebar V2 ve Pano V2 bir sonraki promptlarda gelecek.
      </p>
    </div>
  );
}
