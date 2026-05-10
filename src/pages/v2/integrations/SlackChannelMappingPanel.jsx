// ================================================================
// SlackChannelMappingPanel — placeholder shipped in B.7. Fully
// implemented in B.8: per-severity dropdown, enable toggle, test-send
// button, save bar.
// ================================================================
import { CINEMATIC, SPACE, TYPE_SCALE } from '@/design-system-v2/cinematic/tokens';

export default function SlackChannelMappingPanel({ installationId, language = 'tr' /* , onChanged */ }) {
  const HINT = {
    tr: 'Kanal eşlemesi yakında bu kart içinde görünecek.',
    en: 'Channel mapping appears here in the next commit.',
    ar: 'سيظهر ربط القنوات هنا في التحديث التالي.'
  };
  return (
    <div style={{
      marginTop: SPACE.lg,
      padding: SPACE.md,
      borderTop: `1px solid ${CINEMATIC.glass.border}`,
      ...TYPE_SCALE.caption,
      color: CINEMATIC.text.pearlFaint
    }}>
      {HINT[language] || HINT.tr}
      {/* installationId is intentionally captured here so future commits
          don't break the prop wiring. */}
      {installationId ? '' : ''}
    </div>
  );
}
