// ================================================================
// FloatingLanguageSwitcher — Sprint D-11.
//
// Mounts the existing LanguageSwitcher as a fixed top-right control
// available from every authenticated route (customer + admin
// dashboards). Hidden on public marketing routes by listening for
// pathname changes and the auth-token presence.
//
// Decision §10.E: hot-swap (no reload). The underlying useI18n.setLang
// already flips document.documentElement.dir for AR.
// ================================================================
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import LanguageSwitcher from '../LanguageSwitcher.jsx';

const PUBLIC_PATH_PREFIXES = [
  '/',                   // landing
  '/login',
  '/register',
  '/admin/login',
  '/about',
  '/pricing',
  '/integrations',
  '/sectors',
  '/case-studies',
  '/basarilar',
  '/hakkimizda',
  '/iletisim',
  '/sartlar',
  '/gizlilik',
  '/cerez',
  '/gdpr',
  '/destek',
  '/akademi',
  '/webinarlar',
  '/kilavuz',
  '/kariyer',
  '/basin',
  '/partners',
  '/features',
  '/how-it-works',
  '/ai-analysis',
  '/e-fatura',
  '/crm',
  '/ai',
  '/mobil',
  '/share',
  '/s/',
  '/og/',
  '/unsubscribe',
  '/unsubscribe-weekly'
];

function isPublicRoute(pathname) {
  if (pathname === '/') return true;
  for (const p of PUBLIC_PATH_PREFIXES) {
    if (p === '/') continue;
    if (pathname === p || pathname.startsWith(p + '/')) return true;
  }
  return false;
}

function hasToken() {
  try {
    return Boolean(
      localStorage.getItem('zyrix_token') ||
      localStorage.getItem('customerToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('zyrix_admin_token')
    );
  } catch {
    return false;
  }
}

export default function FloatingLanguageSwitcher() {
  const { pathname } = useLocation();
  const [authed, setAuthed] = useState(hasToken());

  // Re-check auth on route change (covers login → dashboard transition).
  useEffect(() => {
    setAuthed(hasToken());
  }, [pathname]);

  if (isPublicRoute(pathname)) return null;
  if (!authed) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '14px',
      right: '14px',
      zIndex: 9997
    }}>
      <LanguageSwitcher compact />
    </div>
  );
}
