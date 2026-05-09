// Customer Dashboard V2 — animation tokens & helpers.
import { useEffect, useState } from 'react';

export const TIMING = {
  micro:  150,
  short:  250,
  medium: 400,
  data:   800,
  story:  1200
};

export const EASING = {
  default:    'cubic-bezier(0.4, 0, 0.2, 1)',
  energetic:  'cubic-bezier(0.34, 1.56, 0.64, 1)',
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)'
};

/** Count a number up from 0 to `target` over `duration` ms (ease-out cubic). */
export function useCountUp(target, duration = TIMING.data) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (typeof target !== 'number' || !Number.isFinite(target)) {
      setValue(target);
      return undefined;
    }
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const progress = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

export const fadeIn = (delay = 0) => ({
  animation: `fadeInUp ${TIMING.medium}ms ${EASING.decelerate} ${delay}ms both`
});

export const KEYFRAMES = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 currentColor; }
    50%      { box-shadow: 0 0 0 6px transparent; }
  }
  @keyframes drawLine {
    from { stroke-dashoffset: 100%; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;
