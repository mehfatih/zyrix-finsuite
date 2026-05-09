// ================================================================
// RecipientPicker — autocomplete recipient selector.
// Shows recent recipients as floating chips, plus a search input
// that filters by name/email/phone. Supports inline "Add new" form.
// ================================================================
import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import { CINEMATIC, RADIUS, TYPE_STACK } from '@/design-system-v2/cinematic/tokens';
import { glowOf } from '@/design-system-v2/cinematic/shadows';
import RecipientAvatarChip from './RecipientAvatarChip';
import { listRecipients, createRecipient } from '@/api/v2/sharing';

const LABEL = {
  searchPlaceholder: { tr: 'İsim, e-posta, telefon ara…', en: 'Search by name, email, or phone…', ar: 'ابحث بالاسم، البريد، أو الهاتف…' },
  recent:            { tr: 'Sık paylaştıkların',         en: 'Recent recipients',                ar: 'المرسل إليهم مؤخرًا' },
  noRecipients:      { tr: 'Henüz alıcı yok',            en: 'No recipients yet',                ar: 'لا يوجد مستلمون' },
  addNew:            { tr: 'Yeni alıcı ekle',            en: 'Add new recipient',                ar: 'أضف مستلمًا جديدًا' },
  fieldName:         { tr: 'İsim',                       en: 'Name',                             ar: 'الاسم' },
  fieldEmail:        { tr: 'E-posta',                    en: 'Email',                            ar: 'البريد الإلكتروني' },
  fieldPhone:        { tr: 'Telefon (E.164)',            en: 'Phone (E.164)',                    ar: 'الهاتف (E.164)' },
  fieldRole:         { tr: 'Rol',                        en: 'Role',                             ar: 'الدور' },
  rolePlaceholder:   { tr: 'örn. Muhasebeci, Ortağım',   en: 'e.g. Accountant, Partner',         ar: 'مثل: محاسب، شريك' },
  save:              { tr: 'Kaydet',                     en: 'Save',                             ar: 'حفظ' },
  cancel:            { tr: 'İptal',                      en: 'Cancel',                           ar: 'إلغاء' },
  emailOrPhone:      { tr: 'E-posta veya telefon gerekli', en: 'Email or phone required',         ar: 'البريد أو الهاتف مطلوب' }
};

function _(key, language) { return LABEL[key]?.[language] || LABEL[key]?.tr || key; }

/**
 * @param {{
 *   selectedId: string | null,
 *   onSelect: (recipient) => void,    // recipient object {id, name, email, phone, role}
 *   onClearSelection?: () => void,
 *   language?: 'tr' | 'ar' | 'en',
 *   channelHint?: 'email' | 'whatsapp' // filters which contact methods are highlighted
 * }} props
 */
export default function RecipientPicker({
  selectedId, onSelect, onClearSelection, language = 'tr', channelHint = 'email'
}) {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [query, setQuery]           = useState('');
  const [showAdd, setShowAdd]       = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listRecipients()
      .then((rows) => { if (!cancelled) setRecipients(rows); })
      .catch((err) => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return recipients;
    const q = query.trim().toLowerCase();
    return recipients.filter((r) =>
      [r.name, r.email, r.phone, r.role].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
  }, [recipients, query]);

  const selected = recipients.find((r) => r.id === selectedId) || null;

  const handleAdd = async (newR) => {
    const created = await createRecipient(newR);
    setRecipients((p) => [created, ...p]);
    setShowAdd(false);
    onSelect(created);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Selected chip (if any) */}
      {selected && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RecipientAvatarChip
            name={selected.name} role={selected.role} email={selected.email} phone={selected.phone}
            selected
            onRemove={onClearSelection}
          />
        </div>
      )}

      {/* Search input */}
      {!selected && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px',
          background: CINEMATIC.glass.tint1,
          border: `1px solid ${CINEMATIC.glass.border}`,
          borderRadius: RADIUS.md,
          color: CINEMATIC.text.pearlWhite
        }}>
          <Search size={15} color={CINEMATIC.text.pearlFaint} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={_('searchPlaceholder', language)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: CINEMATIC.text.pearlWhite,
              fontFamily: TYPE_STACK.body,
              fontSize: 13
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear"
              style={{ background: 'transparent', border: 'none', color: CINEMATIC.text.pearlFaint, cursor: 'pointer', padding: 0 }}
            ><X size={14} /></button>
          )}
        </div>
      )}

      {/* Recent / filtered list */}
      {!selected && !showAdd && (
        <>
          {loading ? (
            <Loader />
          ) : error ? (
            <ErrorBox message={String(error.message || error)} />
          ) : filtered.length === 0 ? (
            <div style={{ ...emptyBox, color: CINEMATIC.text.pearlFaint }}>
              {_('noRecipients', language)}
            </div>
          ) : (
            <div>
              <div style={listLabel}>{_('recent', language)}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {filtered.slice(0, 12).map((r) => (
                  <RecipientAvatarChip
                    key={r.id}
                    name={r.name} role={r.role} email={r.email} phone={r.phone}
                    onClick={() => onSelect(r)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add new form */}
      {!selected && showAdd && (
        <CreateForm
          language={language}
          onCancel={() => setShowAdd(false)}
          onSave={handleAdd}
        />
      )}

      {/* Action buttons */}
      {!selected && !showAdd && (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          style={addBtnStyle}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = glowOf('violet', 2); }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
        >
          <UserPlus size={14} color={CINEMATIC.accent.plasmaViolet} />
          {_('addNew', language)}
        </button>
      )}
    </div>
  );
}

function CreateForm({ language, onCancel, onSave }) {
  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole]   = useState('');
  const [busy, setBusy]   = useState(false);
  const [err, setErr]     = useState(null);

  const submit = async (e) => {
    e?.preventDefault?.();
    setErr(null);
    if (!name.trim()) { setErr({ message: 'Name is required.' }); return; }
    if (!email.trim() && !phone.trim()) { setErr({ message: _('emailOrPhone', language) }); return; }
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
    <form onSubmit={submit} style={{
      display: 'flex', flexDirection: 'column', gap: 10,
      padding: 14,
      background: CINEMATIC.bg.deepSpace3,
      border: `1px solid ${CINEMATIC.glass.borderStrong}`,
      borderRadius: RADIUS.md
    }}>
      <Field label={_('fieldName', language)}  value={name}  onChange={setName} />
      <Field label={_('fieldEmail', language)} value={email} onChange={setEmail} type="email" />
      <Field label={_('fieldPhone', language)} value={phone} onChange={setPhone} placeholder="+905551234567" />
      <Field label={_('fieldRole', language)}  value={role}  onChange={setRole} placeholder={_('rolePlaceholder', language)} />
      {err && <ErrorBox message={String(err.message || err)} />}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
        <button type="button" onClick={onCancel} disabled={busy} style={cancelBtnStyle}>{_('cancel', language)}</button>
        <button type="submit" disabled={busy} style={primaryBtnStyle}>{_('save', language)}</button>
      </div>
    </form>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: CINEMATIC.text.pearlFaint }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
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

function Loader() {
  return <div style={{ ...emptyBox, color: CINEMATIC.text.pearlDim }}>…</div>;
}
function ErrorBox({ message }) {
  return <div style={{ padding: '8px 12px', background: 'rgba(255, 61, 90, 0.10)', color: CINEMATIC.accent.crimsonGlow, border: `1px solid rgba(255, 61, 90, 0.35)`, borderRadius: 6, fontSize: 12, fontFamily: TYPE_STACK.body }}>{message}</div>;
}

const emptyBox = {
  padding: '12px 14px',
  textAlign: 'center',
  fontSize: 12,
  fontFamily: TYPE_STACK.body,
  color: CINEMATIC.text.pearlFaint
};
const listLabel = {
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: CINEMATIC.text.pearlFaint,
  marginBottom: 8
};
const addBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  alignSelf: 'flex-start',
  padding: '6px 12px',
  background: 'transparent',
  border: `1px dashed ${CINEMATIC.glass.borderStrong}`,
  borderRadius: 999,
  color: CINEMATIC.text.pearlDim,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.04em',
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'box-shadow 200ms ease'
};
const primaryBtnStyle = {
  padding: '8px 16px',
  background: `linear-gradient(135deg, rgba(157, 78, 221, 0.95), rgba(0, 217, 255, 0.75))`,
  color: '#FFFFFF',
  border: '1px solid rgba(157, 78, 221, 0.5)',
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.04em',
  cursor: 'pointer',
  fontFamily: 'inherit'
};
const cancelBtnStyle = {
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
