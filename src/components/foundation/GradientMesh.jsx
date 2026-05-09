// ================================================================
// GradientMesh — animated radial-gradient mesh background.
// 3-4 ellipses on a deep-space base; drift via CSS keyframes (no JS).
//
// Palettes
//   cosmic   — full nebula (violet + cyan + mint + amber)
//   aurora   — calmer cyan + mint + violet
//   sunrise  — amber + crimson "warning" mood
//   mono     — minimal single-cyan glow
//
// Speed
//   slow    36s drift loop (default, ambient)
//   medium  20s drift loop
//
// Renders absolutely-positioned to fill its parent (parent must
// be `position: relative` or another containing block). Layered
// behind content via `z-index: 0`.
// ================================================================
import { meshOf } from '@/design-system-v2/cinematic/gradients';

const SPEEDS = {
  slow:   '36s',
  medium: '20s'
};

export default function GradientMesh({
  palette = 'cosmic',
  speed = 'slow',
  withNoise = true,
  style = {}
}) {
  const duration = SPEEDS[speed] || SPEEDS.slow;
  const background = meshOf(palette);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        borderRadius: 'inherit',
        ...style
      }}
    >
      {/* Drifting mesh layer */}
      <div
        style={{
          position: 'absolute',
          inset: '-10%',
          background,
          backgroundSize: '120% 120%',
          animation: `cn-aurora-drift ${duration} ease-in-out infinite`,
          willChange: 'transform, opacity'
        }}
      />
      {/* Soft vignette to focus attention center-ish */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(10, 14, 39, 0.55) 100%)',
          pointerEvents: 'none'
        }}
      />
      {/* Optional noise overlay — prevents banding on gradients */}
      {withNoise && (
        <div
          className="cn-noise"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        />
      )}
    </div>
  );
}
