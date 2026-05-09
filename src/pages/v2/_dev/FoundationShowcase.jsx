// ================================================================
// FoundationShowcase — Sprint D-1 internal demo of the cinematic
// foundation primitives. Mounted at /v2/_dev/foundation.
//
// Internal route — not surfaced from any nav. Visitors arrive only
// via direct URL. Used by the engineering team to visually verify
// each component's variants and animations.
// ================================================================
import { useState } from 'react';
import { Sparkles, ArrowRight, Zap, Rocket } from 'lucide-react';
import {
  GlassCard,
  AuroraButton,
  NeonBadge,
  PulseDot,
  GlowRing,
  ParticleField,
  GradientMesh
} from '@/components/foundation';
import { CINEMATIC, TYPE_STACK, TYPE_SCALE, SPACE } from '@/design-system-v2/cinematic/tokens';

const TONES = ['cyan', 'violet', 'mint', 'amber', 'crimson'];

const sectionStyle = {
  position: 'relative',
  marginBottom: SPACE['4xl'],
  padding: SPACE['2xl'],
  borderRadius: 18,
  overflow: 'hidden'
};

const labelStyle = {
  ...TYPE_SCALE.caption,
  fontFamily: TYPE_STACK.body,
  textTransform: 'uppercase',
  color: CINEMATIC.text.pearlFaint,
  marginBottom: SPACE.lg,
  display: 'block'
};

const sectionTitle = {
  ...TYPE_SCALE.headingMd,
  fontFamily: TYPE_STACK.display,
  color: CINEMATIC.text.pearlWhite,
  marginBottom: SPACE.md
};

const rowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: SPACE.lg,
  alignItems: 'center'
};

export default function FoundationShowcase() {
  const [particleMode, setParticleMode] = useState('ambient');

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        background: CINEMATIC.bg.deepSpace1,
        color: CINEMATIC.text.pearlWhite,
        fontFamily: TYPE_STACK.body,
        padding: `${SPACE['3xl']}px ${SPACE['2xl']}px`,
        overflow: 'hidden'
      }}
    >
      <GradientMesh palette="cosmic" speed="slow" />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <header style={{ marginBottom: SPACE['4xl'] }}>
          <NeonBadge tone="violet" size="sm" leading={<Sparkles size={11} />}>
            Sprint D-1 · Internal
          </NeonBadge>
          <h1 style={{ ...TYPE_SCALE.displayMd, fontFamily: TYPE_STACK.display, marginTop: SPACE.md, marginBottom: SPACE.sm }}>
            Cinematic Foundation
          </h1>
          <p style={{ ...TYPE_SCALE.bodyLg, color: CINEMATIC.text.pearlDim, maxWidth: 620 }}>
            Visual verification of every foundation primitive. Hover and interact to confirm spring-physics motion, glow halos, and animated borders behave as specified.
          </p>
        </header>

        {/* GlassCard variants */}
        <section style={sectionStyle}>
          <span style={labelStyle}>GlassCard · variants</span>
          <h2 style={sectionTitle}>Glass surfaces</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: SPACE.lg }}>
            {['subtle', 'standard', 'elevated', 'aurora'].map((variant) => (
              <GlassCard key={variant} variant={variant} interactive>
                <span style={{ ...TYPE_SCALE.caption, color: CINEMATIC.text.pearlFaint, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  variant
                </span>
                <span style={{ ...TYPE_SCALE.headingMd, fontFamily: TYPE_STACK.display }}>{variant}</span>
                <p style={{ ...TYPE_SCALE.bodyMd, color: CINEMATIC.text.pearlDim, marginTop: SPACE.md }}>
                  Hover to see spring-driven lift + glow intensification.
                </p>
              </GlassCard>
            ))}
          </div>

          <div style={{ marginTop: SPACE['2xl'] }}>
            <span style={labelStyle}>GlassCard + glow tones</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: SPACE.lg }}>
              {TONES.map((tone) => (
                <GlassCard key={tone} variant="standard" glow={tone} interactive>
                  <PulseDot tone={tone} size="sm" />
                  <span style={{ ...TYPE_SCALE.bodyMd, marginLeft: 8, fontWeight: 600, textTransform: 'capitalize' }}>{tone}</span>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* AuroraButton variants */}
        <section style={sectionStyle}>
          <span style={labelStyle}>AuroraButton · variants × sizes × tones</span>
          <h2 style={sectionTitle}>Buttons</h2>

          <div style={rowStyle}>
            <AuroraButton variant="primary" size="sm" glow="cyan">Primary SM</AuroraButton>
            <AuroraButton variant="primary" size="md" glow="violet">Primary MD</AuroraButton>
            <AuroraButton variant="primary" size="lg" glow="mint" trailing={<ArrowRight size={18} />}>Primary LG</AuroraButton>
          </div>
          <div style={{ ...rowStyle, marginTop: SPACE.lg }}>
            <AuroraButton variant="ghost" size="md" glow="cyan">Ghost cyan</AuroraButton>
            <AuroraButton variant="ghost" size="md" glow="violet" leading={<Zap size={15} />}>Ghost violet</AuroraButton>
            <AuroraButton variant="ghost" size="md" glow="amber">Ghost amber</AuroraButton>
          </div>
          <div style={{ ...rowStyle, marginTop: SPACE.lg }}>
            <AuroraButton variant="glow" glow="cyan" trailing={<Rocket size={15} />}>Glow cyan</AuroraButton>
            <AuroraButton variant="glow" glow="violet">Glow violet</AuroraButton>
            <AuroraButton variant="glow" glow="mint">Glow mint</AuroraButton>
            <AuroraButton variant="glow" glow="crimson">Glow crimson</AuroraButton>
          </div>
          <div style={{ ...rowStyle, marginTop: SPACE.lg }}>
            <AuroraButton variant="primary" disabled>Disabled</AuroraButton>
            <AuroraButton variant="ghost" disabled>Ghost disabled</AuroraButton>
          </div>
        </section>

        {/* NeonBadge */}
        <section style={sectionStyle}>
          <span style={labelStyle}>NeonBadge · tones × pulse</span>
          <h2 style={sectionTitle}>Status badges</h2>
          <div style={rowStyle}>
            {TONES.map((tone) => (
              <NeonBadge key={tone} tone={tone}>{tone}</NeonBadge>
            ))}
            <NeonBadge tone="neutral">neutral</NeonBadge>
          </div>
          <div style={{ ...rowStyle, marginTop: SPACE.lg }}>
            <NeonBadge tone="crimson" pulse leading={<Sparkles size={11} />}>Critical · pulse</NeonBadge>
            <NeonBadge tone="amber" pulse>Attention · pulse</NeonBadge>
            <NeonBadge tone="mint" pulse>Live · pulse</NeonBadge>
          </div>
        </section>

        {/* PulseDot */}
        <section style={sectionStyle}>
          <span style={labelStyle}>PulseDot · sizes × tones</span>
          <h2 style={sectionTitle}>Live indicators</h2>
          <div style={rowStyle}>
            {['xs', 'sm', 'md'].map((size) => (
              <span key={size} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <PulseDot tone="mint" size={size} />
                <span style={{ ...TYPE_SCALE.bodyMd, color: CINEMATIC.text.pearlDim }}>size={size}</span>
              </span>
            ))}
          </div>
          <div style={{ ...rowStyle, marginTop: SPACE.lg }}>
            {TONES.map((tone) => (
              <span key={tone} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <PulseDot tone={tone} size="sm" />
                <span style={{ ...TYPE_SCALE.bodyMd, color: CINEMATIC.text.pearlDim }}>{tone}</span>
              </span>
            ))}
          </div>
        </section>

        {/* GlowRing */}
        <section style={sectionStyle}>
          <span style={labelStyle}>GlowRing · intensity × animated</span>
          <h2 style={sectionTitle}>Decorative rings</h2>
          <div style={{ ...rowStyle, gap: SPACE['2xl'] }}>
            {[1, 2, 3].map((intensity) => (
              <GlowRing key={intensity} tone="cyan" intensity={intensity} size={72}>
                <span style={{ ...TYPE_SCALE.headingMd, fontFamily: TYPE_STACK.display }}>i{intensity}</span>
              </GlowRing>
            ))}
            <GlowRing tone="violet" intensity={3} animated size={72}>
              <Sparkles size={28} />
            </GlowRing>
            <GlowRing tone="mint" intensity={2} animated size={72}>
              <Zap size={28} />
            </GlowRing>
            <GlowRing tone="crimson" intensity={3} animated size={72}>
              <span style={{ ...TYPE_SCALE.headingMd, fontFamily: TYPE_STACK.mono }}>!</span>
            </GlowRing>
          </div>
        </section>

        {/* ParticleField */}
        <section style={{ ...sectionStyle, height: 320, padding: 0, border: `1px solid ${CINEMATIC.glass.border}` }}>
          <ParticleField mode={particleMode} density={2} tone="cyan" />
          <div style={{ position: 'relative', zIndex: 1, padding: SPACE['2xl'], height: '100%' }}>
            <span style={labelStyle}>ParticleField · mode</span>
            <h2 style={sectionTitle}>Particle modes</h2>
            <div style={rowStyle}>
              {['ambient', 'thinking', 'celebration'].map((mode) => (
                <AuroraButton
                  key={mode}
                  variant={particleMode === mode ? 'glow' : 'ghost'}
                  size="sm"
                  glow="cyan"
                  onClick={() => setParticleMode(mode)}
                >
                  {mode}
                </AuroraButton>
              ))}
            </div>
            <p style={{ ...TYPE_SCALE.bodyMd, color: CINEMATIC.text.pearlDim, marginTop: SPACE.lg, maxWidth: 400 }}>
              Click a mode to swap behaviors. Particles auto-respawn at field edges; canvas pauses when the tab is hidden.
            </p>
          </div>
        </section>

        {/* GradientMesh palettes */}
        <section style={sectionStyle}>
          <span style={labelStyle}>GradientMesh · palettes</span>
          <h2 style={sectionTitle}>Animated backgrounds</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: SPACE.lg }}>
            {['cosmic', 'aurora', 'sunrise', 'mono'].map((palette) => (
              <div
                key={palette}
                style={{ position: 'relative', height: 160, borderRadius: 14, overflow: 'hidden', border: `1px solid ${CINEMATIC.glass.border}` }}
              >
                <GradientMesh palette={palette} speed="medium" />
                <div style={{ position: 'relative', zIndex: 1, padding: SPACE.lg }}>
                  <span style={{ ...TYPE_SCALE.caption, color: CINEMATIC.text.pearlFaint, textTransform: 'uppercase', display: 'block' }}>palette</span>
                  <span style={{ ...TYPE_SCALE.headingMd, fontFamily: TYPE_STACK.display, textTransform: 'capitalize' }}>{palette}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section style={sectionStyle}>
          <span style={labelStyle}>Typography · scale</span>
          <h2 style={sectionTitle}>Type</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE.md }}>
            {Object.entries(TYPE_SCALE).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'baseline', gap: SPACE.lg, borderBottom: `1px solid ${CINEMATIC.glass.border}`, paddingBottom: SPACE.sm }}>
                <span style={{ ...TYPE_SCALE.caption, color: CINEMATIC.text.pearlFaint, textTransform: 'uppercase', minWidth: 110 }}>{key}</span>
                <span style={{ ...val, fontFamily: key.startsWith('display') ? TYPE_STACK.display : TYPE_STACK.body, color: CINEMATIC.text.pearlWhite }}>
                  The quick brown fox 2026
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={{ ...TYPE_SCALE.caption, color: CINEMATIC.text.pearlFaint, textAlign: 'center', padding: SPACE['2xl'] }}>
          /v2/_dev/foundation · Sprint D-1 · {new Date().toISOString().slice(0, 10)}
        </footer>
      </div>
    </div>
  );
}
