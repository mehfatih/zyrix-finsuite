import { useEffect, useRef, useState } from 'react';

/**
 * Animate a number from 0 → target over `duration` ms with ease-out cubic.
 * Returns the current animated value. Falls back gracefully when target
 * isn't a finite number.
 */
export function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (target === null || target === undefined || Number.isNaN(target) || !Number.isFinite(target)) {
      setValue(0);
      return undefined;
    }
    if (target === 0) {
      setValue(0);
      return undefined;
    }

    startRef.current = performance.now();
    const startValue = 0;

    const tick = (now) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(startValue + (target - startValue) * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return value;
}
