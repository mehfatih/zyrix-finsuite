// ================================================================
// GeoMismatchBanner — Sprint D-11.
//
// Subtle banner shown once per session when the merchant's IP country
// differs from their registered country. Per discovery decision §10.H:
// not a modal, not a block — a low-friction notice that the user can
// dismiss with [Tamam] or escalate via [Yardım al].
//
// Reads from RegulatoryProvider; tracks dismissal in sessionStorage so
// the banner doesn't reappear on every navigation. ARIA-correct
// (role=status, aria-live=polite).
// ================================================================
import { useEffect, useState } from 'react';
import { Globe, X, HelpCircle } from 'lucide-react';
import { CINEMATIC, RADIUS, SPACE, TYPE_STACK, TYPE_SCALE } from '@/design-system-v2/cinematic/tokens';
import { useRegulatory } from '@/contexts/RegulatoryContext';
import { useI18n } from '@/i18n/i18n';

const STORAGE_KEY = 'zyrix_geo_mismatch_dismissed';

const COPY = {
  tr: {
    title:    "Farklı bir ülkeden bağlanıyorsun",
    body:     "Hesabın {registered} ülkesinde kayıtlı, ancak şu an {ip} adresinden bağlanıyorsun. Seyahatteysen bu normaldir.",
    dismiss:  "Tamam",
    help:     "Yardım al"
  },
  en: {
    title:    "You're connecting from a different country",
    body:     "Your account is registered in {registered} but you're connecting from {ip}. This is normal if you're traveling.",
    dismiss:  "Dismiss",
    help:     "Get help"
  },
  ar: {
    title:    "أنت تتصل من دولة مختلفة",
    body:     "حسابك مسجل في {registered} ولكنك تتصل الآن من {ip}. هذا طبيعي إذا كنت مسافرًا.",
    dismiss:  "حسناً",
    help:     "احصل على مساعدة"
  }
};

function pickLocale(lang) {
  if (lang === 'AR') return 'ar';
  if (lang === 'EN') return 'en';
  return 'tr';
}

function readDismissed() {
  try { return sessionStorage.getItem(STORAGE_KEY) === '1'; }
  catch { return false; }
}

function setDismissed() {
  try { sessionStorage.setItem(STORAGE_KEY, '1'); }
  catch { /* private mode / quota — banner stays dismissed in-memory */ }
}

export default function GeoMismatchBanner() {
  const { mismatch, geo, ready } = useRegulatory();
  const { lang } = useI18n();
  const [dismissed, setDismissedState] = useState(() => readDismissed());

  // Re-read sessionStorage when the mismatch flag changes (covers
  // back-to-back logins by different merchants in the same tab).
  useEffect(() => {
    setDismissedState(readDismissed());
  }, [mismatch, geo?.registeredCountry]);

  if (!ready) return null;
  if (!mismatch) return null;
  if (dismissed) return null;

  const locale = pickLocale(lang);
  const copy   = COPY[locale] || COPY.tr;
  const body   = copy.body
    .replace('{registered}', geo.registeredCountry || '—')
    .replace('{ip}',         geo.ipCountry || '—');

  const onDismiss = () => {
    setDismissed();
    setDismissedState(true);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'fixed',
        top: '14px',
        // Sit to the LEFT of the FloatingLanguageSwitcher (which is at
        // top-right). On AR layouts the dir=rtl flip handles this for us.
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9996,
        maxWidth: 560,
        width: 'calc(100% - 28px)',
        padding: `${SPACE.sm}px ${SPACE.md}px`,
        background: 'rgba(13, 18, 48, 0.92)',
        border: `1px solid rgba(255, 184, 0, 0.4)`,
        borderRadius: RADIUS.md,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(12px)',
        color: CINEMATIC.text.pearlWhite,
        fontFamily: TYPE_STACK.body,
        display: 'flex',
        alignItems: 'flex-start',
        gap: SPACE.sm
      }}
    >
      <Globe size={16} color={CINEMATIC.accent.solarAmber} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...TYPE_SCALE.bodyMd, fontWeight: 600, marginBottom: 2 }}>
          {copy.title}
        </div>
        <div style={{ ...TYPE_SCALE.caption, color: CINEMATIC.text.pearlDim, lineHeight: 1.45 }}>
          {body}
        </div>
        <div style={{ display: 'flex', gap: SPACE.sm, marginTop: SPACE.xs, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onDismiss}
            style={btnStyle(true)}
            aria-label={copy.dismiss}
          >
            {copy.dismiss}
          </button>
          <a
            href="mailto:destek@zyrix.co?subject=Geo%20mismatch"
            onClick={onDismiss}
            style={{ ...btnStyle(false), textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <HelpCircle size={12} aria-hidden="true" /> {copy.help}
          </a>
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={copy.dismiss}
        style={{
          background: 'transparent',
          border: 'none',
          color: CINEMATIC.text.pearlFaint,
          cursor: 'pointer',
          padding: 4,
          marginInlineStart: 4
        }}
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

function btnStyle(primary) {
  return {
    padding: '4px 10px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: primary ? CINEMATIC.text.pearlWhite : CINEMATIC.accent.cyan,
    background: primary ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
    border: `1px solid ${primary ? CINEMATIC.glass.borderStrong : CINEMATIC.glass.border}`,
    borderRadius: RADIUS.sm,
    cursor: 'pointer',
    fontFamily: TYPE_STACK.body
  };
}
