// ================================================================
// useInsightHistory — Sprint D-1 hook for the insight log.
// Fetches `GET /api/customer/insights/history?days=N` once on mount
// and exposes a refetch + an optimistic-status mutator.
//
// Returns { insights, loading, error, refetch, updateStatus }
//
// Usage:
//   const { insights, loading, updateStatus } = useInsightHistory({ days: 7 });
//   ...
//   await updateStatus(insight.id, 'DISMISSED');
// ================================================================
import { useCallback, useEffect, useState } from 'react';
import { getInsightHistory, patchInsightStatus } from '@/api/v2/insights';

export function useInsightHistory({ days = 7, limit = 100 } = {}) {
  const [insights, setInsights] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await getInsightHistory({ days, limit });
      setInsights(rows);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [days, limit]);

  useEffect(() => { refetch(); }, [refetch]);

  // Optimistic status update.
  const updateStatus = useCallback(async (id, status) => {
    const prev = insights;
    setInsights((rows) =>
      rows.map((r) => (r.id === id ? { ...r, status } : r))
    );
    try {
      const updated = await patchInsightStatus(id, status);
      setInsights((rows) =>
        rows.map((r) => (r.id === id ? { ...r, ...updated } : r))
      );
      return updated;
    } catch (err) {
      // Roll back on failure.
      setInsights(prev);
      throw err;
    }
  }, [insights]);

  return { insights, loading, error, refetch, updateStatus };
}
