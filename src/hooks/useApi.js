// ================================================================
// Zyrix FinSuite — useApi Hook
// Generic data fetching with loading, error, and refetch support
// ================================================================

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * useApi — fetches data from any async function
 *
 * @param {Function} fetchFn   - async function that returns data
 * @param {Array}    deps      - dependencies that trigger re-fetch
 * @param {Object}   options   - { immediate: bool, initialData: any }
 *
 * @returns { data, loading, error, refetch, setData }
 */
export function useApi(fetchFn, deps = [], options = {}) {
  const { immediate = true, initialData = null } = options;
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      if (mountedRef.current) setData(result);
    } catch (err) {
      if (mountedRef.current) setError(err.message || "An error occurred");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) execute();
  }, [execute, immediate]);

  return { data, loading, error, refetch: execute, setData };
}

/**
 * useMutation — for POST/PUT/DELETE operations
 *
 * @returns { mutate, loading, error, data, reset }
 */
export function useMutation(mutationFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await mutationFn(...args);
      setData(result);
      return result;
    } catch (err) {
      const msg = err.message || "Operation failed";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFn]);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { mutate, loading, error, data, reset };
}

/**
 * usePagination — paginated data fetching
 */
export function usePagination(fetchFn, initialParams = {}) {
  const [params, setParams] = useState({ page: 1, limit: 20, ...initialParams });
  const [allData, setAllData] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (newParams) => {
    const p = newParams || params;
    setLoading(true);
    try {
      const result = await fetchFn(p);
      // Support both { data, meta } and { items, total } response shapes
      const items = result.data || result.items || result.results || result;
      const total = result.meta?.total || result.total || items.length;
      const pages = result.meta?.pages || Math.ceil(total / p.limit) || 1;
      setAllData(Array.isArray(items) ? items : []);
      setMeta({ total, pages });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  const goToPage = (page) => {
    const p = { ...params, page };
    setParams(p);
    fetch(p);
  };

  const applyFilters = (filters) => {
    const p = { ...params, ...filters, page: 1 };
    setParams(p);
    fetch(p);
  };

  return { data: allData, meta, loading, error, params, goToPage, applyFilters, refetch: () => fetch() };
}