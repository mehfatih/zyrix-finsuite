// ================================================================
// /help[/:topic] — In-app help center (Sprint D-10).
//
// Decision §10.I option I1 — TR/EN/AR JSON loader; reuses the
// existing dashboard i18n pattern. Topic content lives in
// src/i18n/dashboard/help.{tr,en,ar}.json (F11).
//
// Two views in one component:
//   /help            topic index (cinematic grid of cards)
//   /help/:topic     single topic with body paragraphs
// ================================================================
import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sparkles, Bell, Share2, Hash, FileText, Settings, ArrowLeft, ChevronRight, BookOpen } from 'lucide-react';
import { CINEMATIC, RADIUS, SPACE, TYPE_STACK, TYPE_SCALE } from '@/design-system-v2/cinematic/tokens';
import { GlassCard, GradientMesh, NeonBadge } from '@/components/foundation';
import helpTr from '@/i18n/dashboard/helpCenter.tr.json';
import helpEn from '@/i18n/dashboard/helpCenter.en.json';
import helpAr from '@/i18n/dashboard/helpCenter.ar.json';

const BUNDLES = { tr: helpTr, en: helpEn, ar: helpAr };

// Topic order + icon mapping. Translation files key off these ids.
const TOPICS = [
  { id: 'chat',          icon: Sparkles, tone: 'violet' },
  { id: 'insights',      icon: FileText, tone: 'cyan' },
  { id: 'notifications', icon: Bell,     tone: 'cyan' },
  { id: 'reports',       icon: BookOpen, tone: 'mint' },
  { id: 'sharing',       icon: Share2,   tone: 'cyan' },
  { id: 'slack',         icon: Hash,     tone: 'violet' },
  { id: 'settings',      icon: Settings, tone: 'amber' }
];

function pickLocale(language) {
  if (language === 'ar' || language === 'en' || language === 'tr') return language;
  return 'tr';
}

function _(bundle, key, fallback = '') {
  return bundle?.[key] ?? fallback;
}

export default function HelpCenterPage({ language = 'tr' }) {
  const lang = pickLocale(language);
  const bundle = BUNDLES[lang] || BUNDLES.tr;
  const navigate = useNavigate();
  const { topic } = useParams();

  // If a specific topic is selected, render the article view.
  if (topic) {
    return <HelpArticle topic={topic} bundle={bundle} lang={lang} onBack={() => navigate('/help')} />;
  }

  return <HelpIndex bundle={bundle} lang={lang} onPick={(id) => navigate(`/help/${encodeURIComponent(id)}`)} />;
}

// ─── Index view ──────────────────────────────────────────────

function HelpIndex({ bundle, lang, onPick }) {
  return (
    <div style={pageStyle()}>
      <GradientMesh tone="violet" intensity={0.35} />
      <div style={containerStyle()}>
        <header style={{ display: 'flex', flexDirection: 'column', gap: SPACE.sm, marginBottom: SPACE['3xl'] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: SPACE.md }}>
            <BookOpen size={28} color={CINEMATIC.accent.cyan} aria-hidden="true" />
            <h1 style={{ ...TYPE_SCALE.headingLg, fontFamily: TYPE_STACK.display, margin: 0 }}>
              {_(bundle, 'index.title', 'Yardım Merkezi')}
            </h1>
            <NeonBadge tone="violet" size="sm">{_(bundle, 'index.badge', 'V1')}</NeonBadge>
          </div>
          <p style={{ ...TYPE_SCALE.bodyMd, color: CINEMATIC.text.pearlDim, margin: 0, maxWidth: 640 }}>
            {_(bundle, 'index.subtitle', '')}
          </p>
        </header>

        <div role="list" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: SPACE.lg
        }}>
          {TOPICS.map(({ id, icon: Icon, tone }) => {
            const title = _(bundle, `${id}.title`, id);
            const summary = _(bundle, `${id}.summary`, '');
            return (
              <GlassCard
                key={id}
                variant="standard"
                glow={tone}
                interactive
                onClick={() => onPick(id)}
                aria-label={title}
                role="listitem"
                style={{ cursor: 'pointer', padding: SPACE.xl, height: '100%' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE.md, height: '100%' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    display: 'grid', placeItems: 'center',
                    background: CINEMATIC.glass.tint2,
                    border: `1px solid ${CINEMATIC.glass.border}`,
                    color: CINEMATIC.accent.cyan
                  }} aria-hidden="true">
                    <Icon size={22} />
                  </div>
                  <h2 style={{ ...TYPE_SCALE.headingMd, fontFamily: TYPE_STACK.display, margin: 0 }}>
                    {title}
                  </h2>
                  {summary && (
                    <p style={{ ...TYPE_SCALE.bodyMd, color: CINEMATIC.text.pearlDim, margin: 0, lineHeight: 1.5 }}>
                      {summary}
                    </p>
                  )}
                  <div style={{
                    marginTop: 'auto',
                    display: 'flex', alignItems: 'center', gap: 6,
                    color: CINEMATIC.accent.cyan,
                    ...TYPE_SCALE.caption
                  }}>
                    {_(bundle, 'index.read', 'Oku')}
                    <ChevronRight size={14} aria-hidden="true" />
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>

        <footer style={{ marginTop: SPACE['3xl'], textAlign: 'center', ...TYPE_SCALE.caption, color: CINEMATIC.text.pearlFaint }}>
          {_(bundle, 'index.footer', '')}
        </footer>
      </div>
    </div>
  );
}

// ─── Article view ────────────────────────────────────────────

function HelpArticle({ topic, bundle, lang, onBack }) {
  const meta = TOPICS.find((t) => t.id === topic);
  const title    = _(bundle, `${topic}.title`,   '');
  const summary  = _(bundle, `${topic}.summary`, '');
  const sections = useMemo(() => {
    // body sections are stored as ordered keys: <topic>.section.<n>.title / .body
    const out = [];
    for (let i = 1; i <= 12; i++) {
      const sTitle = _(bundle, `${topic}.section.${i}.title`, '');
      const sBody  = _(bundle, `${topic}.section.${i}.body`,  '');
      if (!sTitle && !sBody) break;
      out.push({ title: sTitle, body: sBody });
    }
    return out;
  }, [bundle, topic]);

  if (!title) {
    return (
      <div style={pageStyle()}>
        <div style={containerStyle()}>
          <button type="button" onClick={onBack} style={backBtnStyle()}>
            <ArrowLeft size={14} /> {_(bundle, 'index.back', 'Geri')}
          </button>
          <p style={{ ...TYPE_SCALE.bodyMd, color: CINEMATIC.text.pearlDim }}>
            {_(bundle, 'index.notFound', 'Konu bulunamadı.')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle()}>
      <GradientMesh tone={meta?.tone || 'cyan'} intensity={0.3} />
      <div style={containerStyle({ maxWidth: 760 })}>
        <button type="button" onClick={onBack} style={backBtnStyle()}>
          <ArrowLeft size={14} aria-hidden="true" /> {_(bundle, 'index.back', 'Geri')}
        </button>

        <article aria-labelledby={`help-${topic}-title`} style={{ display: 'flex', flexDirection: 'column', gap: SPACE.lg }}>
          <h1 id={`help-${topic}-title`} style={{
            ...TYPE_SCALE.headingLg,
            fontFamily: TYPE_STACK.display,
            margin: 0
          }}>{title}</h1>
          {summary && (
            <p style={{ ...TYPE_SCALE.bodyLg, color: CINEMATIC.text.pearlDim, margin: 0, lineHeight: 1.6 }}>
              {summary}
            </p>
          )}

          {sections.map((s, i) => (
            <section key={i} style={{ display: 'flex', flexDirection: 'column', gap: SPACE.sm }}>
              {s.title && (
                <h2 style={{ ...TYPE_SCALE.headingMd, fontFamily: TYPE_STACK.display, margin: 0 }}>
                  {s.title}
                </h2>
              )}
              {s.body && (
                <p style={{ ...TYPE_SCALE.bodyMd, color: CINEMATIC.text.pearlDim, margin: 0, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {s.body}
                </p>
              )}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}

// ─── Style helpers ───────────────────────────────────────────

function pageStyle() {
  return {
    position: 'relative',
    minHeight: '100vh',
    background: CINEMATIC.bg.deepSpace1,
    fontFamily: TYPE_STACK.body,
    color: CINEMATIC.text.pearlWhite,
    padding: `${SPACE['3xl']}px ${SPACE['2xl']}px ${SPACE['4xl']}px`,
    overflow: 'hidden'
  };
}

function containerStyle({ maxWidth = 1080 } = {}) {
  return {
    position: 'relative',
    zIndex: 1,
    maxWidth,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column'
  };
}

function backBtnStyle() {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    padding: '6px 12px',
    marginBottom: SPACE.lg,
    fontFamily: TYPE_STACK.body,
    fontSize: '0.875rem',
    fontWeight: 600,
    color: CINEMATIC.accent.cyan,
    background: 'transparent',
    border: `1px solid ${CINEMATIC.glass.border}`,
    borderRadius: RADIUS.sm,
    cursor: 'pointer'
  };
}
