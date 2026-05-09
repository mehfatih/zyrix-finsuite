/**
 * Per the project plan, real KPI computation lives in the backend
 * (a future endpoint: GET /api/customer/dashboard/kpi-values).
 * For now, return realistic mock values keyed by KPI id so the UI ships
 * with stable data. When the backend endpoint exists, swap the body of
 * fetchKpiValues to call it (and parse `response.data` per project
 * envelope conventions).
 */

function gen(n, min, max) {
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push(min + Math.random() * (max - min));
  }
  return out;
}

const MOCK = {
  mrr:                       { value: 32147,  trend:  12.5, sparkline: gen(14, 28000, 33000) },
  cash_runway:               { value: 87,     trend: -4.0,  sparkline: gen(14, 80, 95) },
  cash_balance:              { value: 245600, trend:  3.2,  sparkline: gen(14, 220000, 260000) },
  customer_health_pct:       { value: 84.2,   trend:  2.1,  sparkline: gen(14, 78, 88) },
  tax_burden:                { value: 28400,  trend:  0,    sparkline: gen(14, 22000, 30000) },
  overdue_receivables:       { value: 18400,  trend:  8.4,  sparkline: gen(14, 14000, 20000) },
  pending_invoices:          { value: 14,     trend: -2.0,  sparkline: gen(14, 8, 18) },
  payable_30d:               { value: 47200,  trend:  1.5,  sparkline: gen(14, 40000, 50000) },
  gross_margin:              { value: 38.6,   trend:  1.2,  sparkline: gen(14, 35, 42) },
  top_customer_revenue:      { value: 58400,  trend:  6.0,  sparkline: gen(14, 50000, 60000) },
  mrr_growth_pct:            { value: 12.5,   trend:  3.1,  sparkline: gen(14, 8, 14) },
  new_customers_30d:         { value: 8,      trend: 33.0,  sparkline: gen(14, 4, 10) },
  churn_rate:                { value: 2.1,    trend: -0.6,  sparkline: gen(14, 1.8, 3.0) },
  nrr:                       { value: 108.4,  trend:  3.2,  sparkline: gen(14, 100, 112) },
  arpu:                      { value: 1295,   trend:  4.0,  sparkline: gen(14, 1200, 1350) },
  ai_actions_taken_today:    { value: 14,     trend:  0,    sparkline: gen(14, 6, 18) },
  predictions_accuracy_30d:  { value: 87.4,   trend:  1.8,  sparkline: gen(14, 82, 92) },
  automation_savings_hours:  { value: 38,     trend:  12.0, sparkline: gen(14, 28, 42) },
  crisis_risk_score:         { value: 22,     trend: -8.0,  sparkline: gen(14, 18, 35) },
  hidden_cash_found_30d:     { value: 14200,  trend:  0,    sparkline: gen(14, 8000, 18000) },
  inventory_turnover:        { value: 4.8,    trend:  0.4,  sparkline: gen(14, 4.2, 5.4) },
  service_utilization:       { value: 76.4,   trend:  2.8,  sparkline: gen(14, 70, 80) },
  kdv_load:                  { value: 28400,  trend:  0,    sparkline: gen(14, 24000, 32000) },
  vat_load:                  { value: 28400,  trend:  0,    sparkline: gen(14, 24000, 32000) },
  zatca_compliance:          { value: 94.0,   trend:  1.0,  sparkline: gen(14, 90, 96) }
};

/**
 * Fetch values for an array of KPI ids.
 * Returns: Record<id, { value, trend, sparkline }>
 */
export async function fetchKpiValues(ids = []) {
  // Simulate network latency for animation honesty
  await new Promise((r) => setTimeout(r, 200));
  const out = {};
  ids.forEach((id) => {
    out[id] = MOCK[id] || { value: 0, trend: 0, sparkline: gen(14, 0, 1) };
  });
  return out;
}
