// ================================================================
// useNotificationStream — wraps EventSource around the SSE endpoint.
// Auto-acquires a fresh stream-token (5 min expiry) before connecting,
// auto-reconnects with exponential backoff on close, and refreshes
// the token before each reconnect.
//
// Returns { connected, lastEvent, error } so consumers can react.
// ================================================================
import { useEffect, useRef, useState, useCallback } from 'react';
import { getStreamToken, streamUrl } from '@/api/v2/notifications';

const MAX_BACKOFF_MS = 30_000;
const INITIAL_BACKOFF_MS = 1_000;

/**
 * @param {(eventName: string, payload: any) => void} onEvent
 * @param {{ enabled?: boolean }} [opts]
 */
export function useNotificationStream(onEvent, { enabled = true } = {}) {
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const [error, setError]         = useState(null);

  const esRef       = useRef(null);
  const backoffRef  = useRef(INITIAL_BACKOFF_MS);
  const reconnectTimer = useRef(null);
  const cancelledRef = useRef(false);
  const onEventRef  = useRef(onEvent);

  // Keep onEvent stable across renders without re-triggering effect.
  useEffect(() => { onEventRef.current = onEvent; }, [onEvent]);

  const connect = useCallback(async () => {
    if (cancelledRef.current) return;
    try {
      const { token } = await getStreamToken();
      if (cancelledRef.current) return;
      const url = streamUrl(token);
      const es  = new EventSource(url);
      esRef.current = es;

      es.addEventListener('ready', (e) => {
        setConnected(true);
        setError(null);
        backoffRef.current = INITIAL_BACKOFF_MS;
      });

      es.addEventListener('notification', (e) => {
        try {
          const payload = JSON.parse(e.data);
          setLastEvent({ name: 'notification', payload, at: Date.now() });
          onEventRef.current?.('notification', payload);
        } catch { /* ignore malformed */ }
      });

      es.onerror = () => {
        setConnected(false);
        if (cancelledRef.current) return;
        // Close + retry with backoff.
        try { es.close(); } catch { /* ignore */ }
        const delay = backoffRef.current;
        backoffRef.current = Math.min(MAX_BACKOFF_MS, delay * 2);
        reconnectTimer.current = setTimeout(connect, delay);
      };
    } catch (err) {
      setError(err);
      setConnected(false);
      if (cancelledRef.current) return;
      const delay = backoffRef.current;
      backoffRef.current = Math.min(MAX_BACKOFF_MS, delay * 2);
      reconnectTimer.current = setTimeout(connect, delay);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    cancelledRef.current = false;
    connect();
    return () => {
      cancelledRef.current = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (esRef.current) { try { esRef.current.close(); } catch { /* ignore */ } }
    };
  }, [enabled, connect]);

  return { connected, lastEvent, error };
}
