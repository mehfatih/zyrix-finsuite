import {
  TrendingUp, Wallet, Users, Receipt, AlertTriangle, FileText, CreditCard,
  PiggyBank, Banknote, Target, ArrowUpRight, UserPlus, UserMinus, Repeat,
  Sparkles, Award, Clock, ShieldAlert, Coins, Package, Briefcase,
  ScrollText, BadgeCheck, BarChart3
} from 'lucide-react';

/**
 * The 25 KPIs (matching backend ALLOWED_KPIS list).
 * Each KPI has:
 *   - id              key in this map
 *   - icon            Lucide component
 *   - colorSlot       cyan / amber / mint / violet / wine — drives card accent
 *   - format          (raw value) → display string
 *   - labels          { tr, en, ar }
 *   - drillRoute      where clicking the card goes
 *   - critical        (optional) value → boolean; when true, card overrides to wine slot
 */

const fmtTRY    = (v) => `₺${Math.round(v ?? 0).toLocaleString('tr-TR')}`;
const fmtPct    = (v) => `${(v ?? 0).toFixed(1)}%`;
const fmtDays   = (v) => `${Math.round(v ?? 0)} gün`;
const fmtNumber = (v) => Math.round(v ?? 0).toLocaleString('tr-TR');
const fmtHours  = (v) => `${Math.round(v ?? 0)} saat`;
const fmtMult   = (v) => `${(v ?? 0).toFixed(2)}x`;

export const KPI_DEFINITIONS = {
  // ── Operational ──────────────────────────────────────────────
  mrr: {
    icon: TrendingUp, colorSlot: 'cyan', format: fmtTRY,
    labels: { tr: 'Aylık Gelir', en: 'MRR', ar: 'الإيرادات الشهرية' },
    drillRoute: '/reports/monthly'
  },
  cash_runway: {
    icon: Clock, colorSlot: 'amber', format: fmtDays,
    labels: { tr: 'Nakit Ömrü', en: 'Cash Runway', ar: 'مدة بقاء النقد' },
    drillRoute: '/predictions/cash',
    critical: (v) => (v ?? 999) < 30
  },
  cash_balance: {
    icon: Wallet, colorSlot: 'mint', format: fmtTRY,
    labels: { tr: 'Hazır Nakit', en: 'Cash Balance', ar: 'الرصيد النقدي' },
    drillRoute: '/cash/registers'
  },
  customer_health_pct: {
    icon: Users, colorSlot: 'mint', format: fmtPct,
    labels: { tr: 'Sağlıklı Müşteri', en: 'Healthy Customers', ar: 'العملاء الأصحاء' },
    drillRoute: '/customers/score'
  },
  tax_burden: {
    icon: Receipt, colorSlot: 'violet', format: fmtTRY,
    labels: { tr: 'Vergi Yükü', en: 'Tax Burden', ar: 'العبء الضريبي' },
    drillRoute: '/tax/calendar'
  },
  overdue_receivables: {
    icon: AlertTriangle, colorSlot: 'amber', format: fmtTRY,
    labels: { tr: 'Gecikmiş Alacak', en: 'Overdue Receivables', ar: 'الذمم المتأخرة' },
    drillRoute: '/sales/invoices?filter=overdue',
    critical: (v) => (v ?? 0) > 50000
  },
  pending_invoices: {
    icon: FileText, colorSlot: 'cyan', format: fmtNumber,
    labels: { tr: 'Bekleyen Fatura', en: 'Pending Invoices', ar: 'الفواتير المعلقة' },
    drillRoute: '/sales/invoices?filter=pending'
  },
  payable_30d: {
    icon: CreditCard, colorSlot: 'amber', format: fmtTRY,
    labels: { tr: '30 Gün Borç', en: '30-Day Payables', ar: 'مستحقات 30 يومًا' },
    drillRoute: '/purchase/invoices'
  },
  gross_margin: {
    icon: PiggyBank, colorSlot: 'mint', format: fmtPct,
    labels: { tr: 'Brüt Kâr Marjı', en: 'Gross Margin', ar: 'هامش الربح الإجمالي' },
    drillRoute: '/reports/monthly'
  },
  top_customer_revenue: {
    icon: Award, colorSlot: 'cyan', format: fmtTRY,
    labels: { tr: 'En Büyük Müşteri', en: 'Top Customer Revenue', ar: 'أكبر عميل' },
    drillRoute: '/customers'
  },

  // ── Growth ───────────────────────────────────────────────────
  mrr_growth_pct: {
    icon: ArrowUpRight, colorSlot: 'mint', format: fmtPct,
    labels: { tr: 'MRR Büyüme', en: 'MRR Growth', ar: 'نمو الإيرادات' },
    drillRoute: '/reports/monthly'
  },
  new_customers_30d: {
    icon: UserPlus, colorSlot: 'cyan', format: fmtNumber,
    labels: { tr: '30 Gün Yeni Müşteri', en: 'New Customers (30d)', ar: 'عملاء جدد 30 يومًا' },
    drillRoute: '/customers'
  },
  churn_rate: {
    icon: UserMinus, colorSlot: 'amber', format: fmtPct,
    labels: { tr: 'Müşteri Kaybı', en: 'Churn Rate', ar: 'معدل الفقد' },
    drillRoute: '/predictions/churn',
    critical: (v) => (v ?? 0) > 10
  },
  nrr: {
    icon: Repeat, colorSlot: 'violet', format: fmtPct,
    labels: { tr: 'Net Tutma (NRR)', en: 'Net Retention', ar: 'الاحتفاظ الصافي' },
    drillRoute: '/customers/score'
  },
  arpu: {
    icon: Coins, colorSlot: 'mint', format: fmtTRY,
    labels: { tr: 'Müşteri Başına Gelir', en: 'ARPU', ar: 'الإيراد لكل مستخدم' },
    drillRoute: '/customers'
  },

  // ── Intelligence ─────────────────────────────────────────────
  ai_actions_taken_today: {
    icon: Sparkles, colorSlot: 'violet', format: fmtNumber,
    labels: { tr: 'Bugün AI Aksiyonu', en: 'AI Actions Today', ar: 'إجراءات AI اليوم' },
    drillRoute: '/ai/brief'
  },
  predictions_accuracy_30d: {
    icon: Target, colorSlot: 'mint', format: fmtPct,
    labels: { tr: 'Tahmin Doğruluğu', en: 'Prediction Accuracy', ar: 'دقة التنبؤات' },
    drillRoute: '/predictions/cash'
  },
  automation_savings_hours: {
    icon: Briefcase, colorSlot: 'cyan', format: fmtHours,
    labels: { tr: 'Otomasyon Tasarrufu', en: 'Automation Savings', ar: 'توفير الأتمتة' },
    drillRoute: '/ai/brief'
  },
  crisis_risk_score: {
    icon: ShieldAlert, colorSlot: 'amber', format: (v) => `${Math.round(v ?? 0)}/100`,
    labels: { tr: 'Kriz Risk Skoru', en: 'Crisis Risk Score', ar: 'مخاطر الأزمات' },
    drillRoute: '/risk/crisis',
    critical: (v) => (v ?? 0) >= 70
  },
  hidden_cash_found_30d: {
    icon: Banknote, colorSlot: 'mint', format: fmtTRY,
    labels: { tr: 'Bulunan Gizli Nakit', en: 'Hidden Cash Found', ar: 'نقد مخفي مكتشف' },
    drillRoute: '/risk/hidden-cash'
  },

  // ── Industry ─────────────────────────────────────────────────
  inventory_turnover: {
    icon: Package, colorSlot: 'cyan', format: fmtMult,
    labels: { tr: 'Stok Devir Hızı', en: 'Inventory Turnover', ar: 'دوران المخزون' },
    drillRoute: '/inventory/reports'
  },
  service_utilization: {
    icon: BarChart3, colorSlot: 'mint', format: fmtPct,
    labels: { tr: 'Hizmet Kullanım', en: 'Service Utilization', ar: 'استخدام الخدمات' },
    drillRoute: '/inventory/services'
  },
  kdv_load: {
    icon: ScrollText, colorSlot: 'violet', format: fmtTRY,
    labels: { tr: 'KDV Yükü', en: 'KDV Load', ar: 'حمل KDV' },
    drillRoute: '/tax/vat-report'
  },
  vat_load: {
    icon: ScrollText, colorSlot: 'violet', format: fmtTRY,
    labels: { tr: 'VAT Yükü', en: 'VAT Load', ar: 'حمل ضريبة القيمة المضافة' },
    drillRoute: '/tax/vat-report'
  },
  zatca_compliance: {
    icon: BadgeCheck, colorSlot: 'mint', format: fmtPct,
    labels: { tr: 'ZATCA Uyumu', en: 'ZATCA Compliance', ar: 'امتثال ZATCA' },
    drillRoute: '/tax/regulations'
  }
};

export const KPI_IDS = Object.keys(KPI_DEFINITIONS);

export const labelOf = (id, lang = 'tr') => {
  const def = KPI_DEFINITIONS[id];
  if (!def) return id;
  return (def.labels && (def.labels[lang] || def.labels.tr)) || id;
};
