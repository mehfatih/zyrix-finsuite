// ================================================================
// ShareInsightModal — full-screen takeover modal (mobile) / centered
// 720px modal (desktop) for sharing an insight or report via email
// or WhatsApp. Composes:
//   - <RecipientPicker /> for recipient selection
//   - <ChannelToggle />   for email/WA tabs with neon underline
//   - <MessagePreview />  for live preview of the recipient view
//
// Hooks the D-3 backend:
//   POST /api/customer/share/email
//   POST /api/customer/share/whatsapp
// ================================================================
import { useEffect, useMemo, useState } from 'react';
import { Send, Mail, MessageCircle, X, Sparkles, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { CINEMATIC, RADIUS, TYPE_STACK } from '@/design-system-v2/cinematic/tokens';
import { glowOf, aurora } from '@/design-system-v2/cinematic/shadows';
import { GradientMesh } from '@/components/foundation';
import RecipientPicker from './RecipientPicker';
import { shareViaEmail, shareViaWhatsApp } from '@/api/v2/sharing';

const LABEL = {
  shareTitle:    { tr: 'Paylaş',                   en: 'Share',                       ar: 'مشاركة' },
  email:         { tr: 'E-posta',                  en: 'Email',                       ar: 'بريد إلكتروني' },
  whatsapp:      { tr: 'WhatsApp',                 en: 'WhatsApp',                    ar: 'واتساب' },
  recipient:     { tr: 'Alıcı',                    en: 'Recipient',                   ar: 'المستلم' },
  customMessage: { tr: 'Mesajını ekle (opsiyonel)', en: 'Add a note (optional)',       ar: 'أضف رسالة (اختياري)' },
  preview:       { tr: 'Önizleme',                 en: 'Preview',                     ar: 'معاينة' },
  send:          { tr: 'Gönder',                   en: 'Send',                       ar: 'إرسال' },
  openWa:        { tr: 'WhatsApp\'ta Aç',          en: 'Open in WhatsApp',           ar: 'افتح في واتساب' },
  cancel:        { tr: 'İptal',                    en: 'Cancel',                     ar: 'إلغاء' },
  close:         { tr: 'Kapat',                    en: 'Close',                      ar: 'إغلاق' },
  sending:       { tr: 'Gönderiliyor…',            en: 'Sending…',                   ar: 'يتم الإرسال…' },
  sent:          { tr: 'Gönderildi',               en: 'Sent',                       ar: 'تم الإرسال' },
  selectRecipient: { tr: 'Bir alıcı seç veya ekle', en: 'Pick or add a recipient',     ar: 'اختر أو أضف مستلمًا' },
  attachedPdf:   { tr: 'PDF eklenecek',            en: 'PDF will be attached',        ar: 'سيتم إرفاق ملف PDF' },
  pdfLink:       { tr: 'PDF linki mesaja eklenecek', en: 'PDF link will be in message', ar: 'سيتم تضمين رابط PDF' },
  pdfBlocked:    { tr: 'PDF işleyici şu anda blokeli — link 7 gün içinde aktif olacak', en: 'PDF renderer currently blocked — link activates once D-2.5 ships', ar: 'مولد PDF موقوف حاليًا — سيتم تفعيل الرابط لاحقًا' },
  emailRequired: { tr: 'E-posta için alıcının e-postası gerekli', en: 'Recipient email required for email channel', ar: 'يلزم بريد المستلم لقناة البريد' }
};
function _(key, lang) { return LABEL[key]?.[lang] || LABEL[key]?.tr || key; }

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   document: {
 *     reportType: 'single_insight' | 'daily_brief' | 'range_report',
 *     insightId?: string,
 *     reportParams?: { date?: string, startDate?: string, endDate?: string, sections?: string[] },
 *     // For preview only:
 *     title: string,
 *     body?: string,
 *     severity?: 'critical' | 'attention' | 'opportunity'
 *   },
 *   language?: 'tr' | 'ar' | 'en',
 *   theme?: 'digital' | 'print',
 *   onShared?: (result) => void
 * }} props
 */
export default function ShareInsightModal({
  open, onClose, document: doc, language = 'tr', theme = 'digital', onShared
}) {
  const [channel, setChannel]               = useState('email');
  const [selectedRecipient, setRecipient]   = useState(null);
  const [customMessage, setCustomMessage]   = useState('');
  const [state, setState]                   = useState('idle');  // idle | sending | sent | error
  const [error, setError]                   = useState(null);
  const [waResult, setWaResult]             = useState(null);

  // Reset on close.
  useEffect(() => {
    if (!open) {
      setRecipient(null);
      setCustomMessage('');
      setState('idle');
      setError(null);
      setWaResult(null);
      setChannel('email');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape' && state !== 'sending') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, state, onClose]);

  if (!open) return null;

  const recipientReady = Boolean(selectedRecipient);
  const emailDisabled  = channel === 'email' && (!selectedRecipient?.email);
  const sendDisabled   = !recipientReady || emailDisabled || state === 'sending';

  const handleSend = async () => {
    setError(null);
    setWaResult(null);
    setState('sending');
    const sharePayload = buildSharePayload(doc, selectedRecipient, customMessage, language, theme);
    try {
      if (channel === 'email') {
        const result = await shareViaEmail(sharePayload);
        setState('sent');
        onShared?.({ channel: 'email', ...result });
        setTimeout(() => onClose?.(), 1200);
      } else {
        const result = await shareViaWhatsApp(sharePayload);
        setWaResult(result);
        setState('sent');
        onShared?.({ channel: 'whatsapp', ...result });
        // For WhatsApp we don't auto-close — user needs to tap "Open in WhatsApp"
      }
    } catch (err) {
      setError(err);
      setState('error');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={_('shareTitle', language)}
      onClick={(e) => { if (e.target === e.currentTarget && state !== 'sending') onClose?.(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(10, 14, 39, 0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 720,
        maxHeight: 'min(92vh, 800px)',
        background: CINEMATIC.bg.deepSpace2,
        border: `1px solid ${CINEMATIC.glass.borderStrong}`,
        borderRadius: RADIUS.xl,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        color: CINEMATIC.text.pearlWhite,
        fontFamily: TYPE_STACK.body,
        boxShadow: `${aurora(2)}, 0 22px 70px rgba(0, 0, 0, 0.6)`
      }}>
        {/* Aurora mesh background (decorative, low opacity) */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.45, pointerEvents: 'none' }}>
          <GradientMesh palette="aurora" speed="slow" withNoise={false} />
        </div>

        {/* Header */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: `1px solid ${CINEMATIC.glass.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 30, height: 30, borderRadius: 8,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: `${CINEMATIC.accent.cyan}22`, color: CINEMATIC.accent.cyan,
              boxShadow: glowOf('cyan', 1)
            }}><Sparkles size={15} /></span>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>
              {_('shareTitle', language)}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => state !== 'sending' && onClose?.()}
            aria-label={_('close', language)}
            disabled={state === 'sending'}
            style={{
              background: 'transparent', border: 'none',
              color: CINEMATIC.text.pearlFaint,
              cursor: state === 'sending' ? 'not-allowed' : 'pointer',
              padding: 4
            }}
          ><X size={16} /></button>
        </div>

        {/* Body (scrollable) */}
        <div style={{ position: 'relative', flex: 1, overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Document preview */}
          <DocumentPreview document={doc} language={language} />

          {/* Channel toggle */}
          <ChannelToggle channel={channel} onChange={setChannel} language={language} />

          {/* Recipient picker */}
          <Section label={_('recipient', language)}>
            <RecipientPicker
              selectedId={selectedRecipient?.id || null}
              onSelect={setRecipient}
              onClearSelection={() => setRecipient(null)}
              language={language}
              channelHint={channel}
            />
            {emailDisabled && selectedRecipient && (
              <div style={inlineWarn}>{_('emailRequired', language)}</div>
            )}
          </Section>

          {/* Custom message */}
          <Section label={_('customMessage', language)}>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              maxLength={500}
              rows={3}
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${CINEMATIC.glass.border}`,
                borderRadius: 8,
                color: CINEMATIC.text.pearlWhite,
                padding: '10px 12px',
                fontSize: 13,
                fontFamily: TYPE_STACK.body,
                outline: 'none',
                resize: 'vertical',
                minHeight: 60,
                maxHeight: 160
              }}
            />
          </Section>

          {/* Channel-specific note */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px',
            background: CINEMATIC.glass.tint1,
            border: `1px solid ${CINEMATIC.glass.border}`,
            borderRadius: RADIUS.sm,
            fontSize: 11,
            color: CINEMATIC.text.pearlDim
          }}>
            {channel === 'email'
              ? <><Mail size={12} color={CINEMATIC.accent.cyan} /> {_('attachedPdf', language)}</>
              : <><MessageCircle size={12} color={CINEMATIC.accent.neonMint} /> {_('pdfLink', language)} · <span style={{ color: CINEMATIC.accent.solarAmber }}>{_('pdfBlocked', language)}</span></>
            }
          </div>

          {/* Error / success */}
          {state === 'error' && error && (
            <div role="alert" style={errBox}>{String(error.message || error)}</div>
          )}
          {state === 'sent' && channel === 'whatsapp' && waResult?.shareUrl && (
            <div style={{
              padding: '10px 12px',
              background: 'rgba(6, 255, 165, 0.10)',
              color: CINEMATIC.accent.neonMint,
              border: `1px solid rgba(6, 255, 165, 0.40)`,
              borderRadius: RADIUS.sm,
              fontSize: 12
            }}>
              ✓ {_('sent', language)}. {waResult.message ? '' : ''}
            </div>
          )}
        </div>

        {/* Footer / actions */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '14px 20px', borderTop: `1px solid ${CINEMATIC.glass.border}` }}>
          <button
            type="button"
            onClick={() => state !== 'sending' && onClose?.()}
            disabled={state === 'sending'}
            style={cancelBtn}
          >{_('cancel', language)}</button>

          {channel === 'whatsapp' && state === 'sent' && waResult?.shareUrl ? (
            <a
              href={waResult.shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={primaryAnchor}
            >
              <ExternalLink size={13} />
              {_('openWa', language)}
            </a>
          ) : (
            <button
              type="button"
              onClick={handleSend}
              disabled={sendDisabled}
              style={{ ...primaryBtn, opacity: sendDisabled ? 0.4 : 1, cursor: sendDisabled ? 'not-allowed' : 'pointer' }}
            >
              {state === 'sending'
                ? <><Loader2 size={13} style={{ animation: 'cn-aurora-rotate 0.9s linear infinite' }} />{_('sending', language)}</>
                : state === 'sent' && channel === 'email'
                  ? <><CheckCircle2 size={13} />{_('sent', language)}</>
                  : <><Send size={13} />{_('send', language)}</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function buildSharePayload(doc, recipient, customMessage, locale, theme) {
  return {
    reportType:    doc.reportType,
    insightId:     doc.insightId,
    reportParams:  doc.reportParams,
    recipientId:   recipient?.id || null,
    customMessage: customMessage || undefined,
    locale,
    theme
  };
}

function DocumentPreview({ document: d, language }) {
  const sevColor = d.severity === 'critical' ? CINEMATIC.accent.crimsonGlow
                : d.severity === 'attention' ? CINEMATIC.accent.solarAmber
                : d.severity === 'opportunity' ? CINEMATIC.accent.neonMint
                                                : CINEMATIC.accent.cyan;
  return (
    <div style={{
      padding: 14,
      background: CINEMATIC.glass.tint2,
      border: `1px solid ${CINEMATIC.glass.borderStrong}`,
      borderRadius: RADIUS.md,
      boxShadow: `0 0 0 1px rgba(${rgbOf(sevColor)}, 0.20)`
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: sevColor, marginBottom: 6 }}>
        {d.severity || d.reportType.replace('_', ' ')}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: CINEMATIC.text.pearlWhite, marginBottom: 4, letterSpacing: '-0.01em' }}>
        {d.title}
      </div>
      {d.body && (
        <div style={{ fontSize: 12, lineHeight: 1.5, color: CINEMATIC.text.pearlDim }}>
          {d.body}
        </div>
      )}
    </div>
  );
}

function ChannelToggle({ channel, onChange, language }) {
  const tabs = [
    { key: 'email',    label: _('email',    language), icon: <Mail size={13} /> },
    { key: 'whatsapp', label: _('whatsapp', language), icon: <MessageCircle size={13} /> }
  ];
  return (
    <div style={{ position: 'relative', display: 'flex', gap: 8, borderBottom: `1px solid ${CINEMATIC.glass.border}`, paddingBottom: 6 }}>
      {tabs.map((t) => {
        const active = channel === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            role="tab"
            aria-selected={active}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px',
              background: 'transparent',
              color: active ? CINEMATIC.accent.cyan : CINEMATIC.text.pearlDim,
              border: 'none',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: TYPE_STACK.body,
              letterSpacing: '0.02em',
              cursor: 'pointer',
              position: 'relative',
              transition: 'color 200ms ease'
            }}
          >
            {t.icon}
            {t.label}
            {active && (
              <span style={{
                position: 'absolute', left: 0, right: 0, bottom: -7,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${CINEMATIC.accent.cyanGlow}, transparent)`,
                boxShadow: `0 0 10px ${CINEMATIC.accent.cyanGlow}`
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: CINEMATIC.text.pearlFaint, marginBottom: 8 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function rgbOf(hex) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return '0, 217, 255';
  return `${parseInt(m[1], 16)}, ${parseInt(m[2], 16)}, ${parseInt(m[3], 16)}`;
}

const inlineWarn = {
  marginTop: 8,
  padding: '6px 10px',
  background: 'rgba(255, 184, 0, 0.10)',
  color: CINEMATIC.accent.solarAmber,
  border: `1px solid rgba(255, 184, 0, 0.35)`,
  borderRadius: 6,
  fontSize: 11
};
const errBox = {
  padding: '8px 12px',
  background: 'rgba(255, 61, 90, 0.10)',
  color: CINEMATIC.accent.crimsonGlow,
  border: `1px solid rgba(255, 61, 90, 0.35)`,
  borderRadius: 6,
  fontSize: 12
};
const cancelBtn = {
  padding: '8px 14px',
  background: 'transparent',
  color: CINEMATIC.text.pearlDim,
  border: `1px solid ${CINEMATIC.glass.border}`,
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit'
};
const primaryBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 18px',
  background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.95), rgba(157, 78, 221, 0.75))',
  color: '#FFFFFF',
  border: '1px solid rgba(0, 217, 255, 0.5)',
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.04em',
  fontFamily: 'inherit',
  boxShadow: '0 0 0 1px rgba(0,217,255,0.40), 0 0 16px rgba(0,217,255,0.30)'
};
const primaryAnchor = {
  ...primaryBtn,
  textDecoration: 'none'
};
