/**
 * Real KPI value fetcher.
 *
 * Calls GET /api/customer/dashboard/kpi-values?ids=... on the backend
 * and returns a map id -> { value, trend, sparkline }. The function
 * signature matches the previous mock so DashboardV2Page never had to
 * change.
 *
 * Defensive: any fetch / auth / parse failure returns a map of zero
 * entries instead of throwing, so the dashboard never crashes on a
 * backend hiccup.
 */
const API_BASE = import.meta.env.VITE_API_URL || 'https://finsuite-backend-production.up.railway.app';

const customerToken = () =>
  localStorage.getItem('zyrix_token') ||
  localStorage.getItem('customerToken') ||
  localStorage.getItem('token');

const EMPTY = () => ({ value: 0, trend: 0, sparkline: new Array(14).fill(0) });

export async function fetchKpiValues(ids = []) {
  if (!ids.length) return {};

  const fallback = () => {
    const out = {};
    for (const id of ids) out[id] = EMPTY();
    return out;
  };

  try {
    const url = `${API_BASE}/api/customer/dashboard/kpi-values?ids=${encodeURIComponent(ids.join(','))}`;
    const token = customerToken();
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error(`KPI fetch failed: ${res.status}`);
    const json = await res.json();
    const data = (json && json.data) || {};

    const out = {};
    for (const id of ids) {
      const r = data[id];
      // Backend may legitimately return value: null for KPIs without
      // a backing model (e.g. payable_30d, churn_rate). Coerce to 0
      // for UI, but keep the sparkline shape if backend provided one.
      if (r && r.value !== null && r.value !== undefined) {
        out[id] = {
          value: Number(r.value) || 0,
          trend: Number(r.trend) || 0,
          sparkline: Array.isArray(r.sparkline) ? r.sparkline : new Array(14).fill(0)
        };
      } else {
        out[id] = EMPTY();
      }
    }
    return out;
  } catch {
    return fallback();
  }
}
