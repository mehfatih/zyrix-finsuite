import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext';
import { CUSTOMER_PALETTE } from '@/design-system-v2/colors';
import { useViewport } from '@/hooks/v2/useIsMobile';

/**
 * Floating pill at top-right of customer dashboard pages.
 * Visible only on /dashboard/* and /v2/dashboard/*. Toggles the suite of
 * V2 flags on and routes to the matching dashboard.
 */
export default function DashboardSwitchPill() {
  const { isMobile } = useViewport();
  const { setFlag } = useFeatureFlags();
  const navigate = useNavigate();
  const location = useLocation();

  const onV2          = location.pathname.startsWith('/v2/dashboard');
  const onLegacyDash  = location.pathname.startsWith('/dashboard');
  if (!onV2 && !onLegacyDash) return null;

  const switchTo = (toV2) => {
    if (toV2) {
      setFlag('customerDashboardV2', true);
      setFlag('newSidebarV2', true);
      setFlag('aiCoPilotStrip', true);
      setFlag('customizableKpis', true);
      setFlag('taxIntelligenceCal', true);
      setFlag('cmdKPalette', true);
      navigate('/v2/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <button
      onClick={() => switchTo(!onV2)}
      style={{
        position: 'fixed', top: '16px', right: '16px', zIndex: 9997,
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '8px 14px', borderRadius: '999px',
        minHeight: isMobile ? '44px' : undefined,
        background: onV2 ? CUSTOMER_PALETTE.accent.violet : CUSTOMER_PALETTE.bg.secondary,
        color:      onV2 ? '#FFFFFF' : CUSTOMER_PALETTE.accent.violet,
        border:     onV2 ? 'none' : `1px solid ${CUSTOMER_PALETTE.accent.violet}`,
        fontSize:   '12px', fontWeight: 700,
        cursor:     'pointer',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        boxShadow: '0 6px 18px rgba(124,58,237,0.22)'
      }}
    >
      <Sparkles size={12} />
      {onV2 ? 'Yeni Pano (Beta)' : 'Yeni Panoyu Dene'}
    </button>
  );
}
