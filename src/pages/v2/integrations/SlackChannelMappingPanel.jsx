// ================================================================
// SlackChannelMappingPanel — per-severity Slack channel routing.
//
// Per spec § B.7 + decision §10.H option H1: one dropdown per
// severity (CRITICAL, ATTENTION, OPPORTUNITY, SHARE_EVENT) plus an
// enable toggle and a test-send button. Save bar commits all rows
// in a single PUT — server-side replaces the mapping set atomically.
// ================================================================
import { useEffect, useMemo, useState } from 'react';
import {
  Loader2, AlertTriangle, CheckCircle2, Send, Save, Hash, RefreshCw
} from 'lucide-react';
import { CINEMATIC, RADIUS, SPACE, TYPE_STACK, TYPE_SCALE } from '@/design-system-v2/cinematic/tokens';
import { glowOf } from '@/design-system-v2/cinematic/shadows';
import { NeonBadge } from '@/components/foundation';
import {
  listSlackChannels,
  listSlackMappings,
  replaceSlackMappings,
  sendSlackTest
} from '@/api/v2/integrations';

const SEVERITIES = ['CRITICAL', 'ATTENTION', 'OPPORTUNITY', 'SHARE_EVENT'];

const LABEL = {
  heading:    { tr: 'Kanal eşlemesi', en: 'Channel mapping', ar: 'ربط القنوات' },
  subheading: { tr: 'Her olay türü için bir Slack kanalı seç. Boş bırakılan türler gönderilmez.', en: 'Pick a Slack channel for each event type. Types left empty are not sent.', ar: 'اختر قناة Slack لكل نوع حدث. الأنواع المتروكة فارغة لن تُرسل.' },
  none:       { tr: '— Gönderme —', en: '— Do not send —', ar: '— لا تُرسل —' },
  enable:     { tr: 'Aktif', en: 'Enabled', ar: 'مفعّل' },
  test:       { tr: 'Test gönder', en: 'Test send', ar: 'إرسال اختباري' },
  save:       { tr: 'Kaydet', en: 'Save', ar: 'حفظ' },
  saving:     { tr: 'Kaydediliyor…', en: 'Saving…', ar: 'جارٍ الحفظ…' },
  saved:      { tr: 'Kaydedildi', en: 'Saved', ar: 'تم الحفظ' },
  refresh:    { tr: 'Kanalları yenile', en: 'Refresh channels', ar: 'تحديث القنوات' },
  refreshing: { tr: 'Yenileniyor…', en: 'Refreshing…', ar: 'جارٍ التحديث…' },
  loadingChannels: { tr: 'Kanallar yükleniyor…', en: 'Loading channels…', ar: 'جارٍ تحميل القنوات…' },
  loadError:  { tr: 'Slack kanalları yüklenemedi.', en: 'Could not load Slack channels.', ar: 'تعذر تحميل قنوات Slack.' },
  testSent:   { tr: 'Test mesajı gönderildi.', en: 'Test message sent.', ar: 'تم إرسال رسالة الاختبار.' },
  testFailed: { tr: 'Test gönderimi başarısız.', en: 'Test send failed.', ar: 'فشل الإرسال الاختباري.' },
  pickFirst:  { tr: 'Önce kanal seç.', en: 'Pick a channel first.', ar: 'اختر قناة أولًا.' },
  saveFailed: { tr: 'Eşleme kaydedilemedi.', en: 'Could not save mappings.', ar: 'تعذر حفظ الربط.' },
  privateMark:{ tr: 'özel', en: 'private', ar: 'خاص' }
};
const SEVERITY_LABEL = {
  CRITICAL:    { tr: 'Kritik', en: 'Critical', ar: 'حرج' },
  ATTENTION:   { tr: 'Dikkat', en: 'Attention', ar: 'تنبيه' },
  OPPORTUNITY: { tr: 'Fırsat', en: 'Opportunity', ar: 'فرصة' },
  SHARE_EVENT: { tr: 'Paylaşım', en: 'Share',     ar: 'مشاركة' }
};
const SEVERITY_TONE = {
  CRITICAL:    'crimson',
  ATTENTION:   'amber',
  OPPORTUNITY: 'mint',
  SHARE_EVENT: 'cyan'
};
const _ = (k, lang) => LABEL[k]?.[lang] || LABEL[k]?.tr || k;
const sevLabel = (sev, lang) => SEVERITY_LABEL[sev]?.[lang] || sev;

// ─── Component ───────────────────────────────────────────────

export default function SlackChannelMappingPanel({ installationId, language = 'tr', onChanged }) {
  const [channels, setChannels]       = useState(null);
  const [channelsErr, setChannelsErr] = useState(null);
  const [refreshing, setRefreshing]   = useState(false);
  const [rows, setRows]               = useState(() => seedRows());
  const [savedSnapshot, setSnapshot]  = useState(() => JSON.stringify(seedRows()));
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [savedFlag, setSaved]         = useState(false);
  const [error, setError]             = useState(null);
  const [testingFor, setTestingFor]   = useState(null);
  const [testResult, setTestResult]   = useState(null);

  // Initial fetch — channels + mappings together.
  useEffect(() => {
    if (!installationId) return;
    let cancelled = false;
    (async () => {
      setLoading(true); setError(null);
      try {
        const [chData, mapData] = await Promise.all([
          listSlackChannels(installationId).catch((err) => { setChannelsErr(err); return null; }),
          listSlackMappings(installationId)
        ]);
        if (cancelled) return;
        if (chData) setChannels(chData.channels || []);
        const fromServer = hydrateRows(mapData || []);
        setRows(fromServer);
        setSnapshot(JSON.stringify(fromServer));
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [installationId]);

  const dirty = useMemo(() => JSON.stringify(rows) !== savedSnapshot, [rows, savedSnapshot]);

  const updateRow = (severity, patch) => {
    setRows((prev) => prev.map((r) => r.severity === severity ? { ...r, ...patch } : r));
  };

  const refreshChannels = async () => {
    if (!installationId) return;
    setRefreshing(true); setChannelsErr(null);
    try {
      const data = await listSlackChannels(installationId);
      setChannels(data.channels || []);
    } catch (err) {
      setChannelsErr(err);
    } finally {
      setRefreshing(false);
    }
  };

  const save = async () => {
    setSaving(true); setError(null);
    try {
      // Filter out rows with no channelId — they're "do not send".
      const payload = rows
        .filter((r) => r.channelId)
        .map((r) => ({
          insightType: r.severity,
          channelId:   r.channelId,
          channelName: r.channelName,
          enabled:     r.enabled
        }));
      const result = await replaceSlackMappings(installationId, payload);
      const fresh = hydrateRows(result || []);
      setRows(fresh);
      setSnapshot(JSON.stringify(fresh));
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
      onChanged?.();
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  const runTest = async (severity) => {
    const row = rows.find((r) => r.severity === severity);
    if (!row?.channelId) {
      setTestResult({ tone: 'amber', text: _('pickFirst', language) });
      setTimeout(() => setTestResult(null), 3000);
      return;
    }
    setTestingFor(severity); setTestResult(null);
    try {
      await sendSlackTest(installationId, row.channelId);
      setTestResult({ tone: 'mint', text: `${_('testSent', language)} (#${row.channelName})` });
    } catch (err) {
      setTestResult({ tone: 'crimson', text: `${_('testFailed', language)} — ${err.message || ''}` });
    } finally {
      setTestingFor(null);
      setTimeout(() => setTestResult(null), 4000);
    }
  };

  // ─── Render ────────────────────────────────────────────────

  return (
    <div style={{
      marginTop: SPACE.lg,
      paddingTop: SPACE.lg,
      borderTop: `1px solid ${CINEMATIC.glass.border}`,
      display: 'flex',
      flexDirection: 'column',
      gap: SPACE.md
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: SPACE.md, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ ...TYPE_SCALE.headingMd, fontFamily: TYPE_STACK.display, margin: 0 }}>
            {_('heading', language)}
          </h3>
          <p style={{ ...TYPE_SCALE.caption, color: CINEMATIC.text.pearlFaint, margin: `${SPACE.xs}px 0 0` }}>
            {_('subheading', language)}
          </p>
        </div>
        <button
          type="button"
          onClick={refreshChannels}
          disabled={refreshing || loading}
          style={ghostBtnStyle(refreshing)}
          title={_('refresh', language)}
        >
          {refreshing
            ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> {_('refreshing', language)}</>
            : <><RefreshCw size={14} /> {_('refresh', language)}</>
          }
        </button>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACE.sm, color: CINEMATIC.text.pearlDim, padding: SPACE.md }}>
          <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> {_('loadingChannels', language)}
        </div>
      )}

      {channelsErr && !loading && (
        <div style={errorBoxStyle()}>
          <AlertTriangle size={16} color={CINEMATIC.accent.crimsonGlow} />
          <span>{_('loadError', language)} {channelsErr.message ? `— ${channelsErr.message}` : ''}</span>
        </div>
      )}

      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE.sm }}>
          {SEVERITIES.map((sev) => {
            const row = rows.find((r) => r.severity === sev) || { severity: sev, channelId: '', channelName: '', enabled: true };
            return (
              <div key={sev} style={rowStyle()}>
                <div style={{ display: 'flex', alignItems: 'center', gap: SPACE.sm, minWidth: 130 }}>
                  <NeonBadge tone={SEVERITY_TONE[sev]} size="md">{sevLabel(sev, language)}</NeonBadge>
                </div>

                <select
                  value={row.channelId || ''}
                  onChange={(e) => {
                    const next = e.target.value;
                    if (!next) { updateRow(sev, { channelId: '', channelName: '' }); return; }
                    const ch = (channels || []).find((c) => c.id === next);
                    updateRow(sev, { channelId: next, channelName: ch?.name || '' });
                  }}
                  disabled={!channels}
                  style={selectStyle()}
                >
                  <option value="">{_('none', language)}</option>
                  {(channels || []).map((c) => (
                    <option key={c.id} value={c.id}>
                      #{c.name}{c.is_private ? ` (${_('privateMark', language)})` : ''}
                    </option>
                  ))}
                </select>

                <label style={toggleLabelStyle()}>
                  <input
                    type="checkbox"
                    checked={!!row.enabled}
                    onChange={(e) => updateRow(sev, { enabled: e.target.checked })}
                    disabled={!row.channelId}
                  />
                  <span>{_('enable', language)}</span>
                </label>

                <button
                  type="button"
                  onClick={() => runTest(sev)}
                  disabled={!row.channelId || testingFor === sev}
                  style={ghostBtnStyle(testingFor === sev)}
                  title={_('test', language)}
                >
                  {testingFor === sev
                    ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    : <Send size={14} />
                  }
                  <span>{_('test', language)}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {testResult && (
        <div style={{ ...toastStyle(testResult.tone), display: 'flex', alignItems: 'center', gap: SPACE.sm }}>
          {testResult.tone === 'mint' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          <span>{testResult.text}</span>
        </div>
      )}
      {error && (
        <div style={errorBoxStyle()}>
          <AlertTriangle size={16} color={CINEMATIC.accent.crimsonGlow} />
          <span>{_('saveFailed', language)} — {error.message || ''}</span>
        </div>
      )}

      {/* Save bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: SPACE.sm, marginTop: SPACE.sm }}>
        <button
          type="button"
          onClick={save}
          disabled={!dirty || saving}
          style={primaryBtnStyle(!dirty || saving)}
        >
          {saving
            ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> {_('saving', language)}</>
            : savedFlag
              ? <><CheckCircle2 size={14} /> {_('saved', language)}</>
              : <><Save size={14} /> {_('save', language)}</>
          }
        </button>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────

function seedRows() {
  return SEVERITIES.map((s) => ({ severity: s, channelId: '', channelName: '', enabled: true }));
}

function hydrateRows(serverMappings) {
  const bySeverity = new Map(serverMappings.map((m) => [m.insightType, m]));
  return SEVERITIES.map((sev) => {
    const m = bySeverity.get(sev);
    return {
      severity:    sev,
      channelId:   m?.channelId   || '',
      channelName: m?.channelName || '',
      enabled:     m?.enabled !== false
    };
  });
}

function rowStyle() {
  return {
    display: 'grid',
    gridTemplateColumns: 'minmax(120px, 140px) 1fr auto auto',
    alignItems: 'center',
    gap: SPACE.md,
    padding: `${SPACE.sm}px ${SPACE.md}px`,
    background: CINEMATIC.glass.tint1,
    border: `1px solid ${CINEMATIC.glass.border}`,
    borderRadius: RADIUS.md
  };
}

function selectStyle() {
  return {
    padding: '8px 10px',
    background: CINEMATIC.bg.deepSpace2,
    color: CINEMATIC.text.pearlWhite,
    border: `1px solid ${CINEMATIC.glass.border}`,
    borderRadius: RADIUS.sm,
    fontFamily: TYPE_STACK.body,
    fontSize: '0.875rem',
    minWidth: 0,
    width: '100%'
  };
}

function toggleLabelStyle() {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: '0.8125rem',
    color: CINEMATIC.text.pearlDim,
    fontFamily: TYPE_STACK.body
  };
}

function ghostBtnStyle(busy) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    fontFamily: TYPE_STACK.body,
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: CINEMATIC.accent.cyan,
    background: 'transparent',
    border: `1px solid ${CINEMATIC.glass.border}`,
    borderRadius: RADIUS.sm,
    cursor: busy ? 'not-allowed' : 'pointer',
    opacity: busy ? 0.6 : 1
  };
}

function primaryBtnStyle(disabled) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    fontFamily: TYPE_STACK.body,
    fontSize: '0.875rem',
    fontWeight: 600,
    color: CINEMATIC.text.pearlWhite,
    background: disabled ? CINEMATIC.glass.tint2 : `linear-gradient(135deg, ${CINEMATIC.accent.plasmaViolet}, ${CINEMATIC.accent.cyan})`,
    border: `1px solid ${CINEMATIC.glass.borderStrong}`,
    borderRadius: RADIUS.md,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    boxShadow: disabled ? 'none' : glowOf('violet', 0.35),
    transition: 'opacity 150ms ease, box-shadow 150ms ease'
  };
}

function toastStyle(tone) {
  return {
    padding: SPACE.md,
    borderRadius: RADIUS.md,
    border: `1px solid ${CINEMATIC.glass.border}`,
    background: CINEMATIC.glass.tint1,
    color: tone === 'mint' ? CINEMATIC.accent.neonMint
         : tone === 'crimson' ? CINEMATIC.accent.crimsonGlow
         : tone === 'amber' ? CINEMATIC.accent.amberGlow
         : CINEMATIC.text.pearlDim,
    ...TYPE_SCALE.bodyMd
  };
}

function errorBoxStyle() {
  return {
    padding: SPACE.md,
    borderRadius: RADIUS.md,
    border: `1px solid ${CINEMATIC.accent.crimsonDeep}`,
    background: 'rgba(255, 61, 90, 0.08)',
    color: CINEMATIC.accent.crimsonGlow,
    display: 'flex',
    alignItems: 'center',
    gap: SPACE.sm,
    ...TYPE_SCALE.bodyMd
  };
}
