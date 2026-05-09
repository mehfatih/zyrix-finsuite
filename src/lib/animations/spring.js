// ================================================================
// spring.js — RAF-based spring physics + count-up + staggering.
// Self-contained, zero deps. Used by every cinematic component
// and chart in src/components/foundation and src/components/charts/cinematic.
//
// Spring math (per-frame integration, critically-damped):
//   velocity += -tension * (current - target) * dt - friction * velocity * dt
//   current  +=  velocity * dt
//
// Exports:
//   useSpring(target, config?)
//   useCountUp(target, options?)         — extends src/design-system-v2/animations.js
//   useStagger(count, delayMs?)          — per-index delays for staggered mounts
//   useSpringTransform(target, config?)  — 2D transform spring → CSS string
//   SPRING_CONFIGS                       — gentle / wobbly / stiff / slow / default
// ================================================================
import { useEffect, useMemo, useRef, useState } from 'react';

export const SPRING_CONFIGS = {
  gentle:  { tension: 120, friction: 14 },
  wobbly:  { tension: 180, friction: 12 },
  stiff:   { tension: 210, friction: 20 },
  slow:    { tension: 280, friction: 60 },
  default: { tension: 170, friction: 26 }
};

const REST_VELOCITY     = 0.001;
const REST_DISPLACEMENT = 0.001;
const MAX_DT_SECONDS    = 0.064;   // cap to handle tab-switch hiccups

/**
 * useSpring — animate a single numeric value toward `target` using spring physics.
 *
 * @param {number} target
 * @param {{ tension?: number, friction?: number }} [config=SPRING_CONFIGS.default]
 * @returns {number} animated value
 */
export function useSpring(target, config = SPRING_CONFIGS.default) {
  const [value, setValue] = useState(target);
  const stateRef = useRef({ current: target, velocity: 0 });
  const rafRef   = useRef();

  useEffect(() => {
    const tension  = config.tension  ?? 170;
    const friction = config.friction ?? 26;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, MAX_DT_SECONDS);
      last = now;
      const s = stateRef.current;
      const force   = -tension  * (s.current - target);
      const damping = -friction *  s.velocity;
      s.velocity += (force + damping) * dt;
      s.current  +=  s.velocity * dt;

      const atRest =
        Math.abs(s.velocity)              < REST_VELOCITY &&
        Math.abs(s.current - target)      < REST_DISPLACEMENT;

      if (atRest) {
        s.current  = target;
        s.velocity = 0;
        setValue(target);
        return;
      }
      setValue(s.current);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, config.tension, config.friction]);

  return value;
}

/**
 * useCountUp — ease-out cubic ramp from 0 to `target` over `duration` ms.
 * NaN-safe (passes non-finite values through unchanged so labels can show "—").
 *
 * @param {number} target
 * @param {number | { duration?: number, easing?: (t:number)=>number }} [options=800]
 * @returns {number}
 */
export function useCountUp(target, options = 800) {
  const opts     = typeof options === 'number' ? { duration: options } : options;
  const duration = opts.duration ?? 800;
  const easing   = opts.easing   ?? ((t) => 1 - Math.pow(1 - t, 3));
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (typeof target !== 'number' || !Number.isFinite(target)) {
      setValue(target);
      return;
    }
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min((t - start) / duration, 1);
      setValue(target * easing(p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

/**
 * useStagger — produce per-index delays for staggered mount animations.
 * Returned array is memoised on (count, delayMs).
 *
 * @param {number} count
 * @param {number} [delayMs=60]
 * @returns {number[]}
 */
export function useStagger(count, delayMs = 60) {
  return useMemo(
    () => Array.from({ length: count }, (_, i) => i * delayMs),
    [count, delayMs]
  );
}

/**
 * useSpringTransform — animate a 2D transform target {x, y, scale, rotate}.
 * Each prop has its own spring; result is a single CSS transform string.
 *
 * @param {{ x?: number, y?: number, scale?: number, rotate?: number }} target
 * @param {{ tension?: number, friction?: number }} [config=SPRING_CONFIGS.default]
 * @returns {string}
 */
export function useSpringTransform(target = {}, config = SPRING_CONFIGS.default) {
  const x  = useSpring(target.x      ?? 0, config);
  const y  = useSpring(target.y      ?? 0, config);
  const sc = useSpring(target.scale  ?? 1, config);
  const ro = useSpring(target.rotate ?? 0, config);
  return `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${sc.toFixed(3)}) rotate(${ro.toFixed(2)}deg)`;
}
