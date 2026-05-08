// ================================================================
// /admin/plans/addons — Card Gallery (Bible v2 §17.7)
// ================================================================
import CardGallery from '@/components/admin/shared/CardGallery';

const TIER_BADGE = (label) => ({ label, bg: 'rgba(15,23,42,0.05)', color: '#0F172A' });
const ENT_ONLY = { label: 'Enterprise only', bg: 'rgba(227,10,23,0.08)', color: '#E30A17' };

const addons = [
  { id: 'addon-users',     icon: '👥', title: 'Extra Users',          subtitle: '+₺49/mo per 5 users',     badges: [TIER_BADGE('Pro+')],          footer: '184 monthly redemptions' },
  { id: 'addon-ai',        icon: '🤖', title: 'AI Co-Founder Mode',   subtitle: '+₺99/mo',                  badges: [TIER_BADGE('Business+')],     footer: '92 monthly redemptions' },
  { id: 'addon-reporting', icon: '📊', title: 'Advanced Reporting',   subtitle: '+₺149/mo',                 badges: [TIER_BADGE('Pro+')],          footer: '58 monthly redemptions' },
  { id: 'addon-support',   icon: '🎧', title: 'Premium Support',      subtitle: '+₺199/mo',                 badges: [TIER_BADGE('Business+')],     footer: '34 monthly redemptions' },
  { id: 'addon-api',       icon: '⚡', title: 'API Concurrency Boost',subtitle: '+₺299/mo',                 badges: [TIER_BADGE('Business+')],     footer: '18 monthly redemptions' },
  { id: 'addon-whitelabel',icon: '🎨', title: 'White-label',          subtitle: '+₺499/mo',                 badges: [ENT_ONLY],                    footer: '6 monthly redemptions' },
  { id: 'addon-residency', icon: '🌐', title: 'Data Residency',       subtitle: '+₺399/mo',                 badges: [ENT_ONLY],                    footer: '4 monthly redemptions' },
  { id: 'addon-sso',       icon: '🔐', title: 'SSO / SAML',           subtitle: '+₺249/mo',                 badges: [ENT_ONLY],                    footer: '11 monthly redemptions' }
];

export default function AddonsPage() {
  return (
    <div style={{ padding: '20px' }}>
      <CardGallery
        title="Add-ons"
        subtitle="À-la-carte upsells available alongside any plan"
        items={addons}
        onItemClick={(item) => console.log('open addon', item)}
        onCreate={() => console.log('create addon')}
        createLabel="+ New Add-on"
      />
    </div>
  );
}
