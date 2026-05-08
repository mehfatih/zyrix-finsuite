// ================================================================
// /admin/revenue/coupons — Card Gallery (Bible v2 §17.7)
// ================================================================
import CardGallery from '@/components/admin/shared/CardGallery';

const ACTIVE = { label: 'Active',  bg: 'rgba(16,185,129,0.1)', color: '#10B981' };
const PAUSED = { label: 'Paused',  bg: 'rgba(245,158,11,0.1)', color: '#F59E0B' };
const EXPIRED = { label: 'Expired', bg: 'rgba(148,163,184,0.15)', color: '#64748B' };

const coupons = [
  { id: 'SUMMER25',   icon: '☀',  title: 'SUMMER25',     subtitle: '25% off first 3 months',  badges: [ACTIVE,  { label: 'Pro+' }],         footer: '142 redeemed · expires 2026-08-31' },
  { id: 'WELCOME50',  icon: '👋', title: 'WELCOME50',    subtitle: '50% off first month',     badges: [ACTIVE,  { label: 'New users' }],    footer: '824 redeemed · no expiry' },
  { id: 'ENTER100',   icon: '💎', title: 'ENTERPRISE100',subtitle: '₺100 credit, Enterprise', badges: [ACTIVE,  { label: 'Enterprise' }],   footer: '12 redeemed · expires 2026-12-31' },
  { id: 'BLACK24',    icon: '🛒', title: 'BLACKFRIDAY24',subtitle: '40% off annual',          badges: [EXPIRED, { label: 'All' }],          footer: '1,248 redeemed · ended 2024-11-30' },
  { id: 'KOBI25',     icon: '🇹🇷', title: 'KOBI2025',    subtitle: '20% off Pro for SMBs',    badges: [ACTIVE,  { label: 'Pro' }],          footer: '38 redeemed · expires 2026-06-30' },
  { id: 'STARTER',    icon: '🌱', title: 'STARTER10',    subtitle: '10% off Lite plan',       badges: [PAUSED,  { label: 'Lite' }],         footer: '210 redeemed · paused by admin' },
  { id: 'AI100',      icon: '🤖', title: 'AICOFOUNDER',  subtitle: '₺100 off AI Co-Founder', badges: [ACTIVE,  { label: 'Add-on' }],       footer: '64 redeemed · expires 2026-09-30' },
  { id: 'PARTNER25',  icon: '🤝', title: 'PARTNER25',    subtitle: '25% lifetime — accountants', badges: [ACTIVE, { label: 'Mali Müşavir' }], footer: '92 redeemed · no expiry' }
];

export default function CouponsPage() {
  return (
    <div style={{ padding: '20px' }}>
      <CardGallery
        title="Coupons"
        subtitle="Discount codes and credits"
        items={coupons}
        onItemClick={(item) => console.log('open coupon', item)}
        onCreate={() => console.log('create coupon')}
        createLabel="+ New Coupon"
      />
    </div>
  );
}
