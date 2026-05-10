// ================================================================
// Sprint D-8 — useChatStream hook.
//
// Consumes the SSE response from /api/customer/chat/stream and
// accumulates the assistant message content + tool calls +
// citations + charts + actions in real time. Mirrors the shape
// of useNotificationStream.js (D-4).
//
// Lifecycle:
//   start({ streamToken, lang, messageId, conversationId })
//     - opens EventSource(streamUrl(token))
//     - listens to: ready, token, tool_call, tool_result, chart,
//                   action, citation, error, done
//     - accumulates into a partial assistant message object the
//       caller can render live
//   stop() — closes the connection (caller invokes on unmount or
//   when the user opens a different conversation)
// ================================================================
import { useCallback, useEffect, useRef, useState } from 'react';
import { streamUrl } from '@/api/v2/chat';

const EMPTY_PARTIAL = () => ({
  id:           null,
  role:         'assistant',
  content:      '',
  toolCalls:    [],
  toolResults:  [],
  citations:    [],
  charts:       [],
  actions:      [],
  tokensUsed:   null,
  latencyMs:    null,
  done:         false,
  error:        null
});

export function useChatStream() {
  const [streaming, setStreaming]   = useState(false);
  const [partial, setPartial]       = useState(EMPTY_PARTIAL());
  const [error, setError]           = useState(null);
  const esRef = useRef(null);

  const cleanup = useCallback(() => {
    try { esRef.current?.close?.(); } catch { /* ignore */ }
    esRef.current = null;
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const start = useCallback(({ streamToken, lang, messageId, conversationId }, callbacks = {}) => {
    cleanup();
    if (!streamToken) return;

    setError(null);
    setStreaming(true);
    setPartial({ ...EMPTY_PARTIAL(), id: messageId || null });

    const es = new EventSource(streamUrl(streamToken, lang));
    esRef.current = es;

    es.addEventListener('ready', () => {
      callbacks.onReady?.();
    });

    es.addEventListener('token', (e) => {
      try {
        const data = JSON.parse(e.data || '{}');
        if (typeof data.text === 'string') {
          setPartial((p) => ({ ...p, content: p.content + data.text }));
        }
      } catch { /* malformed */ }
    });

    es.addEventListener('tool_call', (e) => {
      try {
        const data = JSON.parse(e.data || '{}');
        setPartial((p) => ({ ...p, toolCalls: [...p.toolCalls, data] }));
      } catch { /* ignore */ }
    });

    es.addEventListener('tool_result', (e) => {
      try {
        const data = JSON.parse(e.data || '{}');
        setPartial((p) => ({ ...p, toolResults: [...p.toolResults, data] }));
      } catch { /* ignore */ }
    });

    es.addEventListener('chart', (e) => {
      try {
        const data = JSON.parse(e.data || '{}');
        setPartial((p) => ({ ...p, charts: [...p.charts, data] }));
      } catch { /* ignore */ }
    });

    es.addEventListener('action', (e) => {
      try {
        const data = JSON.parse(e.data || '{}');
        setPartial((p) => ({ ...p, actions: [...p.actions, data] }));
      } catch { /* ignore */ }
    });

    es.addEventListener('citation', (e) => {
      try {
        const data = JSON.parse(e.data || '{}');
        setPartial((p) => ({ ...p, citations: [...p.citations, data] }));
      } catch { /* ignore */ }
    });

    es.addEventListener('error', (e) => {
      // Server-emitted `event: error` payload.
      let msg = 'stream_error';
      try {
        const data = JSON.parse(e.data || '{}');
        if (data.message) msg = data.message;
      } catch { /* ignore */ }
      setError(msg);
      setPartial((p) => ({ ...p, error: msg }));
    });

    es.addEventListener('done', (e) => {
      try {
        const data = JSON.parse(e.data || '{}');
        setPartial((p) => ({
          ...p,
          done:       true,
          tokensUsed: data.tokensUsed ?? null,
          latencyMs:  data.latencyMs  ?? null,
          id:         data.messageId  ?? p.id
        }));
        callbacks.onDone?.({
          conversationId: data.conversationId || conversationId,
          messageId:      data.messageId      || messageId,
          tokensUsed:     data.tokensUsed,
          latencyMs:      data.latencyMs
        });
      } catch { /* ignore */ }
      setStreaming(false);
      cleanup();
    });

    // Native EventSource error (network drop / 4xx response on /stream).
    es.onerror = () => {
      // The 'done' event already cleans up on normal completion.
      // This is a true network error — stop and surface.
      if (es.readyState === EventSource.CLOSED) return;
      setError('stream_disconnected');
      setStreaming(false);
      cleanup();
    };
  }, [cleanup]);

  const stop = useCallback(() => {
    cleanup();
    setStreaming(false);
  }, [cleanup]);

  const reset = useCallback(() => {
    cleanup();
    setStreaming(false);
    setPartial(EMPTY_PARTIAL());
    setError(null);
  }, [cleanup]);

  return { streaming, partial, error, start, stop, reset };
}
