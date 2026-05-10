// ================================================================
// /insights/recipients — manage saved sharing recipients.
// Hero with count + last-shared, grid of recipient GlassCards, edit
// inline, delete with confirm, "Add new" CTA.
// ================================================================
import { useEffect, useMemo, useState } from 'react';
import { Pencil, Trash2, UserPlus, Users, X, Save, Mail, Phone, Briefcase } from 'lucide-react';
import { CINEMATIC, RADIUS, TYPE_STACK, TYPE_SCALE, SPACE } from '@/design-system-v2/cinematic/tokens';
import { glowOf } from '@/design-system-v2/cinematic/shadows';
import { GlassCard, GradientMesh, NeonBadge } from '@/components/foundation';
import RecipientAvatarChip from '@/components/v2/sharing/RecipientAvatarChip';
import { CinematicSkeleton, CinematicEmptyState, CinematicErrorBlock } from '@/components/v2/feedback';
import { listRecipients, createRecipient, updateRecipient, deleteRecipient } from '@/api/v2/sharing';

const LABEL = {
  pageTitle:  { tr: 'Paylaşım Alıcıları',  en: 'Sharing Recipients', ar: 'مستلمو المشاركة' },
  subtitle:   { tr: 'AI içgörülerini ve raporları sık paylaştığın kişiler', en: 'People you share insights and reports with most often', ar: 'الأشخاص الذين تشارك معهم رؤى الذكاء الاصطناعي' },
  count:      { tr: '{n} alıcı',            en: '{n} recipients',     ar: '{n} مستلمون' },
  totalShares: { tr: '{n} toplam paylaşım', en: '{n} total shares',   ar: '{n} مشاركات' },
  addNew:     { tr: 'Yeni alıcı',           en: 'New recipient',      ar: 'مستلم جديد' },
  empty:      { tr: 'Henüz alıcı eklenmedi.\nSık paylaştığın muhasebeci, ortağın veya ekip arkadaşını ekle.', en: 'No recipients yet.\nAdd your accountant, partner, or team mate.', ar: 'لا يوجد مستلمون بعد.' },
  edit:       { tr: 'Düzenle',              en: 'Edit',                ar: 'تعديل' },
  remove:     { tr: 'Kaldır',               en: 'Remove',              ar: 'إزالة' },
  cancel:     { tr: 'İptal',                en: 'Cancel',              ar: 'إلغاء' },
  save:       { tr: 'Kaydet',               en: 'Save',                ar: 'حفظ' },
  confirmDelete: { tr: 'Bu alıcıyı silmek istediğine emin misin?', en: 'Delete this recipient?', ar: 'هل تريد حذف هذا المستلم؟' },
  sharesLabel: { tr: 'paylaşım',            en: 'shares',              ar: 'مشاركات' },
  lastShared:  { tr: 'Son paylaşım',        en: 'Last shared',         ar: 'آخر مشاركة' },
  never:       { tr: 'hiç',                 en: 'never',               ar: 'أبدًا' },
  fieldName:   { tr: 'İsim',                en: 'Name',                ar: 'الاسم' },
  fieldEmail:  { tr: 'E-posta',             en: 'Email',               ar: 'البريد' },
  fieldPhone:  { tr: 'Telefon',             en: 'Phone',               ar: 'الهاتف' },
  fieldRole:   { tr: 'Rol',                 en: 'Role',                ar: 'الدور' }
};
function _(k, lang) { return LABEL[k]?.[lang] || LABEL[k]?.tr || k; }

export default function RecipientsPage({ language = 'tr' }) {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [editingId, setEditingId]   = useState(null);
  const [creating, setCreating]     = useState(false);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listRecipients();
      setRecipients(rows);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { reload(); }, []);

  const totalShares = useMemo(
    () => recipients.reduce((s, r) => s + (r.shareCount || 0), 0),
    [recipients]
  );
  const lastShared = useMemo(() => {
    let last = null;
    for (const r of recipients) if (r.lastUsedAt) {
      const t = new Date(r.lastUsedAt).getTime();
      if (last == null || t > last) last = t;
    }
    return last ? new Date(last) : null;
  }, [recipients]);

  const handleSave = async (id, patch) => {
    if (id === '__new') {
      const created = await createRecipient(patch);
      setRecipients((p) => [created, ...p]);
      setCreating(false);
    } else {
      const updated = await updateRecipient(id, patch);
      setRecipients((p) => p.map((r) => r.id === id ? updated : r));
      setEditingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(_('confirmDelete', language))) return;
    await deleteRecipient(id);
    setRecipients((p) => p.filter((r) => r.id !== id));
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: CINEMATIC.bg.deepSpace1,
      color: CINEMATIC.text.pearlWhite,
      fontFamily: TYPE_STACK.body,
      padding: `${SPACE['3xl']}px ${SPACE['2xl']}px`,
      overflow: 'hidden'
    }}>
      <GradientMesh palette="cosmic" speed="slow" />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto' }}>

        {/* Hero */}
        <header style={{ marginBottom: SPACE['2xl'] }}>
          <NeonBadge tone="violet" size="sm" leading={<Users size={11} />}>
            Sprint D-3
          </NeonBadge>
          <h1 style={{ ...TYPE_SCALE.displayMd, fontFamily: TYPE_STACK.display, marginTop: SPACE.md, marginBottom: SPACE.sm }}>
            {_('pageTitle', language)}
          </h1>
          <p style={{ ...TYPE_SCALE.bodyLg, color: CINEMATIC.text.pearlDim, maxWidth: 620, marginBottom: SPACE.lg }}>
            {_('subtitle', language)}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: SPACE.md, alignItems: 'center' }}>
            <NeonBadge tone="cyan">{_('count', language).replace('{n}', String(recipients.length))}</NeonBadge>
            <NeonBadge tone="mint">{_('totalShares', language).replace('{n}', String(totalShares))}</NeonBadge>
            {lastShared && (
              <NeonBadge tone="amber">
                {_('lastShared', language)}: {formatDate(lastShared, language)}
              </NeonBadge>
            )}
            <span style={{ flex: 1 }} />
            <button
              type="button"
              onClick={() => { setCreating(true); setEditingId(null); }}
              style={primaryBtn}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = glowOf('violet', 3); }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = glowOf('violet', 1); }}
            >
              <UserPlus size={13} color={CINEMATIC.accent.plasmaViolet} />
              {_('addNew', language)}
            </button>
          </div>
        </header>

        {/* Create form */}
        {creating && (
          <GlassCard variant="elevated" style={{ marginBottom: SPACE.lg }}>
            <RecipientForm
              language={language}
              initial={{ name: '', email: '', phone: '', role: '' }}
              onCancel={() => setCreating(false)}
              onSave={(payload) => handleSave('__new', payload)}
            />
          </GlassCard>
        )}

        {/* Grid */}
        {loading ? (
          <CinematicSkeleton variant="list" rows={4} ariaLabel="loading recipients" />
        ) : error ? (
          <CinematicErrorBlock error={error} language={language} />
        ) : recipients.length === 0 && !creating ? (
          <GlassCard variant="subtle" style={{ padding: SPACE.md }}>
            <CinematicEmptyState
              icon={<Users />}
              title={_('empty', language).split('\n')[0]}
              description={_('empty', language).split('\n').slice(1).join(' ')}
              tone="violet"
            />
          </GlassCard>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: SPACE.lg
          }}>
            {recipients.map((r) => (
              <GlassCard key={r.id} variant="standard" interactive style={{ position: 'relative' }}>
                {editingId === r.id ? (
                  <RecipientForm
                    language={language}
                    initial={r}
                    onCancel={() => setEditingId(null)}
                    onSave={(payload) => handleSave(r.id, payload)}
                  />
                ) : (
                  <RecipientCard
                    recipient={r}
                    language={language}
                    onEdit={() => { setEditingId(r.id); setCreating(false); }}
                    onDelete={() => handleDelete(r.id)}
                  />
                )}
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RecipientCard({ recipient, language, onEdit, onDelete }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <RecipientAvatarChip name={recipient.name} role={recipient.role} compact size="lg" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: CINEMATIC.text.pearlWhite, letterSpacing: '-0.01em' }}>
          {recipient.name}
        </div>
        {recipient.role && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: CINEMATIC.text.pearlDim }}>
            <Briefcase size={11} /> {recipient.role}
          </div>
        )}
        {recipient.email && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: CINEMATIC.text.pearlDim, wordBreak: 'break-all' }}>
            <Mail size={11} /> {recipient.email}
          </div>
        )}
        {recipient.phone && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: CINEMATIC.text.pearlDim }}>
            <Phone size={11} /> {recipient.phone}
          </div>
        )}
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 10px',
        background: CINEMATIC.glass.tint1,
        border: `1px solid ${CINEMATIC.glass.border}`,
        borderRadius: 8,
        fontSize: 11,
        color: CINEMATIC.text.pearlFaint
      }}>
        <span>{recipient.shareCount || 0} {_('sharesLabel', language)}</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>{recipient.lastUsedAt ? formatDate(new Date(recipient.lastUsedAt), language) : _('never', language)}</span>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        <button type="button" onClick={onEdit} style={miniBtn} title={_('edit', language)}>
          <Pencil size={12} /> {_('edit', language)}
        </button>
        <button type="button" onClick={onDelete} style={{ ...miniBtn, color: CINEMATIC.accent.crimsonGlow, borderColor: 'rgba(255, 61, 90, 0.30)' }} title={_('remove', language)}>
          <Trash2 size={12} /> {_('remove', language)}
        </button>
      </div>
    </div>
  );
}

function RecipientForm({ initial, onSave, onCancel, language }) {
  const [name, setName]   = useState(initial.name || '');
  const [email, setEmail] = useState(initial.email || '');
  const [phone, setPhone] = useState(initial.phone || '');
  const [role, setRole]   = useState(initial.role || '');
  const [busy, setBusy]   = useState(false);
  const [err, setErr]     = useState(null);

  const submit = async (e) => {
    e?.preventDefault?.();
    setErr(null);
    if (!name.trim()) { setErr({ message: 'Name required.' }); return; }
    if (!email.trim() && !phone.trim()) { setErr({ message: 'Email or phone required.' }); return; }
    setBusy(true);
    try {
      await onSave({
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        role: role.trim() || null
      });
    } catch (e2) {
      setErr(e2);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Input label={_('fieldName', language)}  value={name}  onChange={setName} />
      <Input label={_('fieldEmail', language)} value={email} onChange={setEmail} type="email" />
      <Input label={_('fieldPhone', language)} value={phone} onChange={setPhone} placeholder="+905551234567" />
      <Input label={_('fieldRole', language)}  value={role}  onChange={setRole} placeholder="Muhasebeci, Partner…" />
      {err && <div style={errBox}>{String(err.message || err)}</div>}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} disabled={busy} style={miniBtn}><X size={12} /> {_('cancel', language)}</button>
        <button type="submit" disabled={busy} style={{ ...miniBtn, color: CINEMATIC.accent.cyan, borderColor: 'rgba(0,217,255,0.40)', boxShadow: glowOf('cyan', 1) }}>
          <Save size={12} /> {_('save', language)}
        </button>
      </div>
    </form>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: CINEMATIC.text.pearlFaint }}>
        {label}
      </span>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: `1px solid ${CINEMATIC.glass.border}`,
          borderRadius: 6,
          color: CINEMATIC.text.pearlWhite,
          padding: '8px 10px',
          fontSize: 12,
          fontFamily: TYPE_STACK.body,
          outline: 'none',
          colorScheme: 'dark'
        }}
      />
    </label>
  );
}

function formatDate(d, locale) {
  const lc = locale === 'tr' ? 'tr-TR' : locale === 'ar' ? 'ar-SA' : 'en-US';
  try {
    return new Intl.DateTimeFormat(lc, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
  } catch {
    return d.toISOString().slice(0, 16).replace('T', ' ');
  }
}

const primaryBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 14px',
  background: `linear-gradient(135deg, ${CINEMATIC.bg.deepSpace2}, ${CINEMATIC.bg.deepSpace3})`,
  color: CINEMATIC.text.pearlWhite,
  border: `1px solid rgba(157, 78, 221, 0.45)`,
  borderRadius: 6,
  fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
  cursor: 'pointer',
  fontFamily: 'inherit',
  boxShadow: glowOf('violet', 1),
  transition: 'box-shadow 220ms ease'
};
const miniBtn = {
  display: 'inline-flex', alignItems: 'center', gap: 4,
  padding: '5px 10px',
  background: 'transparent',
  color: CINEMATIC.text.pearlDim,
  border: `1px solid ${CINEMATIC.glass.border}`,
  borderRadius: 6,
  fontSize: 11, fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit'
};
const emptyCenter = {
  textAlign: 'center',
  padding: SPACE['2xl'],
  color: CINEMATIC.text.pearlDim,
  fontSize: 13
};
const errBox = {
  padding: '6px 10px',
  background: 'rgba(255, 61, 90, 0.10)',
  color: CINEMATIC.accent.crimsonGlow,
  border: `1px solid rgba(255, 61, 90, 0.35)`,
  borderRadius: 6,
  fontSize: 11
};
