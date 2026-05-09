// ================================================================
// usePdfDownload — small state machine for PDF export buttons.
// Wraps an async generator function with idle/loading/error states
// and an optimistic "downloaded" pulse for the UI to react to.
// ================================================================
import { useCallback, useState } from 'react';

export function usePdfDownload() {
  const [state,    setState]    = useState('idle'); // idle | loading | success | error
  const [error,    setError]    = useState(null);
  const [progress, setProgress] = useState(0);      // not granular — set 0/0.5/1 to animate

  const run = useCallback(async (fn) => {
    setState('loading');
    setError(null);
    setProgress(0.1);
    try {
      const result = await fn();
      setProgress(1);
      setState('success');
      // Auto-reset to idle after 2s so the button can be re-used.
      setTimeout(() => { setState('idle'); setProgress(0); }, 2000);
      return result;
    } catch (err) {
      setError(err);
      setState('error');
      setTimeout(() => { setState('idle'); setProgress(0); }, 4000);
      throw err;
    }
  }, []);

  return { state, error, progress, run, isLoading: state === 'loading' };
}
