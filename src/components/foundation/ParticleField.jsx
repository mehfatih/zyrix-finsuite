// ================================================================
// ParticleField — canvas-based ambient particle system.
//
// Modes
//   ambient      — slow drift, low density, used behind hero sections
//   thinking     — fast convergence toward center, used during AI loading
//   celebration  — radial burst from center, used on success states
//
// Density 1-3 (~30, 60, 100 particles)
// Tone    cyan | violet | mint | amber | crimson
//
// Renders an absolutely-positioned <canvas> filling its parent
// (parent must be `position: relative` or similar).
//
// Performance: capped DPR (2), pause when document hidden, cleans up
// on unmount. Lightweight by design — under 5 KB worth of code.
// ================================================================
import { useEffect, useRef } from 'react';
import { toneRgb, TIMING } from '@/design-system-v2/cinematic/tokens';

const DENSITY_MAP = { 1: 30, 2: 60, 3: 100 };

export default function ParticleField({
  mode = 'ambient',
  density = 2,
  tone = 'cyan',
  style = {}
}) {
  const canvasRef = useRef(null);
  const rafRef    = useRef();
  const stateRef  = useRef({ particles: [], w: 0, h: 0, dpr: 1 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rgb = toneRgb(tone);
    const count = DENSITY_MAP[density] || DENSITY_MAP[2];

    const resize = () => {
      const parent = canvas.parentElement;
      const dpr    = Math.min(window.devicePixelRatio || 1, 2);
      const w      = parent.clientWidth;
      const h      = parent.clientHeight;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width  = w + 'px';
      canvas.style.height = h + 'px';
      ctx.scale(dpr, dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stateRef.current.w   = w;
      stateRef.current.h   = h;
      stateRef.current.dpr = dpr;
    };

    const seed = () => {
      const { w, h } = stateRef.current;
      const particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(makeParticle(mode, w, h));
      }
      stateRef.current.particles = particles;
    };

    const tick = () => {
      const { particles, w, h } = stateRef.current;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        if (mode === 'thinking') {
          // Pull toward center
          const cx = w / 2, cy = h / 2;
          p.vx += (cx - p.x) * 0.0006;
          p.vy += (cy - p.y) * 0.0006;
          p.vx *= 0.985; p.vy *= 0.985;
        } else if (mode === 'celebration') {
          // Outward drift accelerating
          p.vy += 0.005;
        }
        // ambient: pure inertia, no force
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;

        // Wrap or respawn
        if (p.life <= 0 || p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) {
          Object.assign(p, makeParticle(mode, w, h));
        }

        const alpha = Math.min(1, p.life / 60) * p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${alpha.toFixed(3)})`;
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    resize();
    seed();
    rafRef.current = requestAnimationFrame(tick);
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [mode, density, tone]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        ...style
      }}
    />
  );
}

function makeParticle(mode, w, h) {
  if (mode === 'thinking') {
    const angle = Math.random() * Math.PI * 2;
    const r     = Math.max(w, h) * 0.6;
    return {
      x: w / 2 + Math.cos(angle) * r,
      y: h / 2 + Math.sin(angle) * r,
      vx: 0, vy: 0,
      r: 1.3 + Math.random() * 1.4,
      life: 200 + Math.floor(Math.random() * 200),
      alpha: 0.4 + Math.random() * 0.5
    };
  }
  if (mode === 'celebration') {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3;
    return {
      x: w / 2,
      y: h / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: 1.5 + Math.random() * 1.8,
      life: 80 + Math.floor(Math.random() * 80),
      alpha: 0.6 + Math.random() * 0.4
    };
  }
  // ambient
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.18,
    r: 0.8 + Math.random() * 1.6,
    life: 200 + Math.floor(Math.random() * 400),
    alpha: 0.25 + Math.random() * 0.5
  };
}
