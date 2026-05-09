import SidebarV2 from '@/components/v2/sidebar/SidebarV2';
import { useCmdK } from '@/contexts/CmdKContext';
import { useFlag } from '@/contexts/FeatureFlagsContext';
import { CUSTOMER_PALETTE } from '@/design-system-v2/colors';
import { useViewport } from '@/hooks/v2/useIsMobile';

/**
 * Wraps V2 pages with the new sidebar.
 * If `newSidebarV2` flag is OFF, falls through to children only — the
 * page is then responsible for its own legacy chrome.
 */
export default function CustomerLayoutV2({ children, user, language = 'tr', onSignOut }) {
  const newSidebar = useFlag('newSidebarV2');
  const { openPalette } = useCmdK();
  const { isMobile } = useViewport();

  if (!newSidebar) {
    return <>{children}</>;
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: CUSTOMER_PALETTE.bg.primary,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: CUSTOMER_PALETTE.text.primary
    }}>
      <SidebarV2
        language={language}
        user={user}
        onOpenCmdK={openPalette}
        onSignOut={onSignOut}
      />
      <main style={{
        flex: 1,
        minWidth: 0,
        overflow: 'auto',
        paddingTop: isMobile ? '64px' : 0
      }}>
        {children}
      </main>
    </div>
  );
}
