/**
 * Customer Sidebar V2 Registry
 *
 * Tiers:
 *   1 = Operasyon (always visible)
 *   2 = Zekâ (collapsed by default)
 *   3 = Büyüme (Pro+ collapsed)
 *
 * Each hub has children (or a single-page hub has none).
 * Every leaf has: id, route, labels, icon (lucide name), ai (boolean), legacy (boolean).
 *
 * legacy=true entries are HIDDEN from the sidebar but their routes still resolve
 * (so old bookmarks don't 404). They are listed in LEGACY_REDIRECTS as
 * documentation of the old → new mapping; Cmd+K shows them with a "(eski)"
 * suffix so power users can still find them.
 */

export const SIDEBAR_REGISTRY = [
  // ─────────────────────────────────────────────────────────────
  // TIER 1 — OPERASYON
  // ─────────────────────────────────────────────────────────────
  {
    tier: 1,
    tierLabel: { tr: 'OPERASYON', en: 'OPERATIONS', ar: 'العمليات' },
    hubs: [
      {
        id: 'pano',
        route: '/v2/dashboard',
        icon: 'LayoutDashboard',
        labels: { tr: 'Pano', en: 'Dashboard', ar: 'اللوحة الرئيسية' }
      },
      {
        id: 'satis',
        icon: 'TrendingUp',
        labels: { tr: 'Satış', en: 'Sales', ar: 'المبيعات' },
        children: [
          { id: 'satis-faturalari', route: '/dashboard',  labels: { tr: 'Satış Faturaları', en: 'Sales Invoices', ar: 'فواتير البيع' } },
          { id: 'siparisler',       route: '/dashboard',  labels: { tr: 'Siparişler', en: 'Orders', ar: 'الطلبات' } },
          { id: 'teklifler',        route: '/dashboard',  labels: { tr: 'Teklifler', en: 'Quotes', ar: 'العروض' } },
          { id: 'esnaf-faturasi',   route: '/dashboard',  labels: { tr: 'Esnaf Faturası', en: 'Retail Invoice', ar: 'فاتورة التجزئة' } },
          { id: 'satis-hatti',      route: '/dashboard',  labels: { tr: 'Satış Hattı', en: 'Sales Pipeline', ar: 'خط المبيعات' }, ai: true },
          { id: 'klasik-ozet',      route: '/dashboard',  labels: { tr: 'Klasik Özet', en: 'Classic Summary', ar: 'الملخص الكلاسيكي' } }
        ]
      },
      {
        id: 'alis',
        icon: 'ShoppingCart',
        labels: { tr: 'Alış', en: 'Purchases', ar: 'المشتريات' },
        children: [
          { id: 'alis-faturalari',   route: '/dashboard', labels: { tr: 'Alış Faturaları', en: 'Purchase Invoices', ar: 'فواتير الشراء' } },
          { id: 'alis-siparisleri',  route: '/dashboard', labels: { tr: 'Alış Siparişleri', en: 'Purchase Orders', ar: 'طلبات الشراء' } },
          { id: 'hizmet-alimi',      route: '/dashboard', labels: { tr: 'Hizmet Alımı', en: 'Service Procurement', ar: 'شراء الخدمات' } },
          { id: 'tedarikciler',      route: '/dashboard', labels: { tr: 'Tedarikçiler', en: 'Suppliers', ar: 'الموردون' }, ai: true },
          { id: 'giderler',          route: '/dashboard', labels: { tr: 'Giderler', en: 'Expenses', ar: 'المصروفات' } }
        ]
      },
      {
        id: 'musteriler',
        icon: 'Users',
        labels: { tr: 'Müşteriler', en: 'Customers', ar: 'العملاء' },
        children: [
          { id: 'musteri-listesi', route: '/dashboard', labels: { tr: 'Müşteri Listesi', en: 'Customer List', ar: 'قائمة العملاء' } },
          { id: 'musteri-360',     route: '/dashboard', labels: { tr: 'Müşteri 360°', en: 'Customer 360°', ar: 'نظرة 360' }, ai: true },
          { id: 'musteri-skor',    route: '/dashboard', labels: { tr: 'Müşteri Skor', en: 'Customer Score', ar: 'تقييم العميل' }, ai: true },
          { id: 'anlasmalar',      route: '/dashboard', labels: { tr: 'Anlaşmalar', en: 'Deals', ar: 'الصفقات' } },
          { id: 'gorevler',        route: '/dashboard', labels: { tr: 'Görevler', en: 'Tasks', ar: 'المهام' } },
          { id: 'musteri-portali', route: '/dashboard', labels: { tr: 'Müşteri Portalı', en: 'Customer Portal', ar: 'بوابة العميل' }, ai: true }
        ]
      },
      {
        id: 'nakit-banka',
        icon: 'Wallet',
        labels: { tr: 'Nakit & Banka', en: 'Cash & Bank', ar: 'النقدية والبنوك' },
        children: [
          { id: 'kasa',             route: '/dashboard', labels: { tr: 'Kasa Hesapları', en: 'Cash Registers', ar: 'حسابات الصندوق' } },
          { id: 'banka-mutabakat',  route: '/dashboard', labels: { tr: 'Banka Mutabakatı', en: 'Bank Reconciliation', ar: 'مطابقة البنك' }, ai: true },
          { id: 'cek-senet',        route: '/dashboard', labels: { tr: 'Çek & Senet', en: 'Checks & Notes', ar: 'الشيكات والسندات' } },
          { id: 'finansman',        route: '/dashboard', labels: { tr: 'Finansman', en: 'Financing', ar: 'التمويل' } },
          { id: 'taksit',           route: '/dashboard', labels: { tr: 'Taksit', en: 'Installments', ar: 'الأقساط' } }
        ]
      },
      {
        id: 'efatura-vergi',
        icon: 'Receipt',
        labels: { tr: 'E-Fatura & Vergi', en: 'E-Invoice & Tax', ar: 'الفواتير الإلكترونية والضرائب' },
        children: [
          { id: 'giden-efatura',     route: '/dashboard', labels: { tr: 'Giden e-Fatura', en: 'Outgoing E-Invoices', ar: 'الفواتير الصادرة' } },
          { id: 'gelen-efatura',     route: '/dashboard', labels: { tr: 'Gelen e-Fatura', en: 'Incoming E-Invoices', ar: 'الفواتير الواردة' }, ai: true },
          { id: 'earsiv',            route: '/dashboard', labels: { tr: 'e-Arşiv', en: 'E-Archive', ar: 'الأرشيف الإلكتروني' } },
          { id: 'otomatik-faturalar',route: '/dashboard', labels: { tr: 'Otomatik Faturalar', en: 'Auto Invoices', ar: 'الفواتير التلقائية' }, ai: true },
          { id: 'vergi-otopilot',    route: '/dashboard', labels: { tr: 'Vergi Otopilotu', en: 'Tax Autopilot', ar: 'الطيار الآلي للضريبة' }, ai: true },
          { id: 'vergi-takvim',      route: '/dashboard', labels: { tr: 'Vergi Takvimi', en: 'Tax Calendar', ar: 'تقويم الضرائب' } },
          { id: 'kdv-rapor',         route: '/dashboard', labels: { tr: 'KDV Raporu', en: 'VAT Report', ar: 'تقرير ضريبة القيمة المضافة' } },
          { id: 'mali-musavir',      route: '/dashboard', labels: { tr: 'Mali Müşavir', en: 'Tax Advisor', ar: 'المستشار المالي' } },
          { id: 'mevzuat-takip',     route: '/dashboard', labels: { tr: 'Mevzuat Takibi', en: 'Regulation Tracking', ar: 'متابعة التشريعات' }, ai: true }
        ]
      },
      {
        id: 'stok-urun',
        icon: 'Package',
        labels: { tr: 'Stok & Ürün', en: 'Inventory & Products', ar: 'المخزون والمنتجات' },
        children: [
          { id: 'urun-katalogu',  route: '/dashboard', labels: { tr: 'Ürün Kataloğu', en: 'Product Catalog', ar: 'كتالوج المنتجات' } },
          { id: 'hizmet-katalogu',route: '/dashboard', labels: { tr: 'Hizmet Kataloğu', en: 'Service Catalog', ar: 'كتالوج الخدمات' } },
          { id: 'stok-hareket',   route: '/dashboard', labels: { tr: 'Stok Hareketleri', en: 'Stock Movements', ar: 'حركات المخزون' } },
          { id: 'stok-rapor',     route: '/dashboard', labels: { tr: 'Stok Raporları', en: 'Stock Reports', ar: 'تقارير المخزون' }, ai: true },
          { id: 'eirsaliye',      route: '/dashboard', labels: { tr: 'e-İrsaliye', en: 'E-Dispatch', ar: 'مذكرة الشحن الإلكترونية' } },
          { id: 'fis-okuma',      route: '/dashboard', labels: { tr: 'Fiş Okuma', en: 'Receipt OCR', ar: 'قراءة الإيصالات' }, ai: true },
          { id: 'personel-sgk',   route: '/dashboard', labels: { tr: 'Personel & SGK', en: 'Payroll & Social', ar: 'الموظفون والتأمين' } }
        ]
      },
      {
        id: 'raporlar',
        icon: 'BarChart3',
        labels: { tr: 'Raporlar', en: 'Reports', ar: 'التقارير' },
        children: [
          { id: 'aylik-rapor',     route: '/dashboard', labels: { tr: 'Aylık Rapor', en: 'Monthly Report', ar: 'التقرير الشهري' } },
          { id: 'vergi-takvim-r',  route: '/dashboard', labels: { tr: 'Vergi Takvimi', en: 'Tax Calendar', ar: 'تقويم الضرائب' } },
          { id: 'kdv-rapor-r',     route: '/dashboard', labels: { tr: 'KDV Raporu', en: 'VAT Report', ar: 'تقرير ضريبة القيمة' } },
          { id: 'benchmark',       route: '/dashboard', labels: { tr: 'Benchmark', en: 'Benchmark', ar: 'المقارنة المعيارية' }, ai: true },
          { id: 'mutabakat-otopilot', route: '/dashboard', labels: { tr: 'Mutabakat Otopilotu', en: 'Recon Autopilot', ar: 'الطيار الآلي للمطابقة' }, ai: true }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // TIER 2 — ZEKÂ
  // ─────────────────────────────────────────────────────────────
  {
    tier: 2,
    tierLabel: { tr: 'ZEKÂ', en: 'INTELLIGENCE', ar: 'الذكاء' },
    hubs: [
      {
        id: 'ai-copilot',
        icon: 'Sparkles',
        ai: true,
        hidden: true,
        labels: { tr: 'AI Co-Pilot', en: 'AI Co-Pilot', ar: 'المساعد الذكي' },
        children: [
          { id: 'gunluk-brifing',    route: '/ai/brief',          labels: { tr: 'Günlük Brifing', en: 'Daily Brief', ar: 'الإحاطة اليومية' } },
          { id: 'ai-cfo',            route: '/ai/cfo',            labels: { tr: 'AI CFO', en: 'AI CFO', ar: 'المدير المالي الذكي' } },
          { id: 'ai-asistan',        route: '/ai/assistant',      labels: { tr: 'AI Asistan', en: 'AI Assistant', ar: 'المساعد الذكي' } },
          { id: 'whatsapp-ai',       route: '/ai/whatsapp',       labels: { tr: 'WhatsApp AI', en: 'WhatsApp AI', ar: 'واتساب الذكي' } },
          { id: 'cok-kanal',         route: '/ai/inbox',          labels: { tr: 'Çok Kanal Kutusu', en: 'Multi-Channel Inbox', ar: 'صندوق متعدد القنوات' } },
          { id: 'dokuman-kasasi',    route: '/ai/docs',           labels: { tr: 'Doküman Kasası', en: 'Document Vault', ar: 'خزينة المستندات' } },
          { id: 'muzakere-kocu',     route: '/ai/negotiation',    labels: { tr: 'Müzakere Koçu', en: 'Negotiation Coach', ar: 'مدرب التفاوض' } },
          { id: 'karar-yoneticisi',  route: '/ai/decisions',      labels: { tr: 'Karar Yöneticisi', en: 'Decision Manager', ar: 'مدير القرارات' } },
          { id: 'ai-takvim',         route: '/ai/calendar',       labels: { tr: 'AI Takvim', en: 'AI Calendar', ar: 'التقويم الذكي' } },
          { id: 'dolandiricilik-ai', route: '/ai/fraud',          labels: { tr: 'Dolandırıcılık AI', en: 'Fraud AI', ar: 'الذكاء ضد الاحتيال' } }
        ]
      },
      {
        id: 'tahminler',
        icon: 'TrendingUp',
        hidden: true,
        labels: { tr: 'Tahminler', en: 'Predictions', ar: 'التنبؤات' },
        children: [
          { id: 'nakit-tahmin',  route: '/predictions/cash',     labels: { tr: 'Nakit Tahmini', en: 'Cash Forecast', ar: 'تنبؤ النقد' }, ai: true },
          { id: 'stok-tahmin',   route: '/predictions/stock',    labels: { tr: 'Stok Tahmini', en: 'Stock Forecast', ar: 'تنبؤ المخزون' }, ai: true },
          { id: 'churn-tahmin',  route: '/predictions/churn',    labels: { tr: 'Churn Tahmini', en: 'Churn Forecast', ar: 'تنبؤ الفقد' }, ai: true },
          { id: 'stres-test',    route: '/predictions/stress',   labels: { tr: 'Stres Testi', en: 'Stress Test', ar: 'اختبار الضغط' }, ai: true },
          { id: 'reel-kar',      route: '/predictions/real-profit', labels: { tr: 'Reel Kâr', en: 'Real Profit', ar: 'الربح الحقيقي' }, ai: true }
        ]
      },
      {
        id: 'musteri-dna',
        icon: 'Dna',
        hidden: true,
        labels: { tr: 'Müşteri DNA', en: 'Customer DNA', ar: 'الحمض النووي للعميل' },
        children: [
          { id: 'dna',                 route: '/dna/profile',         labels: { tr: 'Müşteri DNA', en: 'Customer DNA', ar: 'الحمض النووي' }, ai: true },
          { id: 'zaman-dongusu',       route: '/dna/lifecycle',       labels: { tr: 'Zaman Döngüsü', en: 'Time Cycle', ar: 'دورة الزمن' }, ai: true },
          { id: 'akilli-fiyatlama',    route: '/dna/smart-pricing',   labels: { tr: 'Akıllı Fiyatlama', en: 'Smart Pricing', ar: 'التسعير الذكي' }, ai: true },
          { id: 'indirim-optimizer',   route: '/dna/discount-opt',    labels: { tr: 'İndirim Optimizörü', en: 'Discount Optimizer', ar: 'محسّن الخصومات' }, ai: true },
          { id: 'sadakat-ai',          route: '/dna/loyalty',         labels: { tr: 'Sadakat AI', en: 'Loyalty AI', ar: 'الولاء الذكي' }, ai: true },
          { id: 'ozel-gun',            route: '/dna/occasions',       labels: { tr: 'Özel Gün Pazarlama', en: 'Occasion Marketing', ar: 'التسويق المناسباتي' }, ai: true },
          { id: 'inceleme-ai',         route: '/dna/reviews',         labels: { tr: 'İnceleme AI', en: 'Review AI', ar: 'مراجعة ذكية' }, ai: true },
          { id: 'eposta-pazarlama',    route: '/dna/email',           labels: { tr: 'E-posta Pazarlama', en: 'Email Marketing', ar: 'التسويق بالبريد' } },
          { id: 'kampanyalar',         route: '/dna/campaigns',       labels: { tr: 'Kampanyalar', en: 'Campaigns', ar: 'الحملات' } }
        ]
      },
      {
        id: 'risk-saglik',
        icon: 'ShieldAlert',
        hidden: true,
        labels: { tr: 'Risk & Sağlık', en: 'Risk & Health', ar: 'المخاطر والصحة' },
        children: [
          { id: 'is-sagligi',         route: '/risk/business-health', labels: { tr: 'İş Sağlığı', en: 'Business Health', ar: 'صحة العمل' }, ai: true },
          { id: 'kriz-uyari',         route: '/risk/crisis',          labels: { tr: 'Kriz Uyarısı', en: 'Crisis Alert', ar: 'تنبيه الأزمات' }, ai: true },
          { id: 'gizli-para',         route: '/risk/hidden-cash',     labels: { tr: 'Gizli Para Bulucu', en: 'Hidden Cash Finder', ar: 'كاشف النقد المخفي' }, ai: true },
          { id: 'gizli-gelir',        route: '/risk/hidden-revenue',  labels: { tr: 'Gizli Gelir', en: 'Hidden Revenue', ar: 'الإيرادات المخفية' }, ai: true },
          { id: 'gelecek-sen',        route: '/risk/future-you',      labels: { tr: 'Gelecek Sen', en: 'Future You', ar: 'مستقبلك' }, ai: true }
        ]
      },
      {
        id: 'sesli-iletisim',
        icon: 'Mic',
        hidden: true,
        labels: { tr: 'Sesli & İletişim', en: 'Voice & Comms', ar: 'الصوت والاتصالات' },
        children: [
          { id: 'sesli-mod',         route: '/voice/mode',         labels: { tr: 'Sesli Mod', en: 'Voice Mode', ar: 'الوضع الصوتي' }, ai: true },
          { id: 'ar-fis',            route: '/voice/ar-receipt',   labels: { tr: 'AR Fiş Tarayıcı', en: 'AR Receipt Scanner', ar: 'ماسح إيصالات AR' } },
          { id: 'ar-magaza',         route: '/voice/ar-store',     labels: { tr: 'AR Mağaza', en: 'AR Store', ar: 'متجر الواقع المعزز' } },
          { id: 'odeme-hatirlatma',  route: '/voice/payment-reminder', labels: { tr: 'Ödeme Hatırlatma', en: 'Payment Reminder', ar: 'تذكير الدفع' }, ai: true }
        ]
      }
    ]
  },

  // ─────────────────────────────────────────────────────────────
  // TIER 3 — BÜYÜME
  // ─────────────────────────────────────────────────────────────
  {
    tier: 3,
    tierLabel: { tr: 'BÜYÜME', en: 'GROWTH', ar: 'النمو' },
    hubs: [
      {
        id: 'pazar-yeri',
        icon: 'Store',
        hidden: true,
        labels: { tr: 'Pazar Yeri Hub', en: 'Marketplace Hub', ar: 'مركز السوق' },
        children: [
          { id: 'pazar-yeri-h',  route: '/market/hub',          labels: { tr: 'Pazar Yeri', en: 'Marketplace', ar: 'السوق' } },
          { id: 'whatsapp-h',    route: '/market/whatsapp',     labels: { tr: 'WhatsApp', en: 'WhatsApp', ar: 'واتساب' } },
          { id: 'kartvizit',     route: '/market/business-card',labels: { tr: 'Kartvizit', en: 'Business Card', ar: 'بطاقة العمل' } },
          { id: 'pazar-zekasi',  route: '/market/intelligence', labels: { tr: 'Pazaryeri Zekâsı', en: 'Marketplace Intel', ar: 'ذكاء السوق' }, ai: true }
        ]
      },
      {
        id: 'ekosistem',
        icon: 'Network',
        hidden: true,
        labels: { tr: 'Ekosistem', en: 'Ecosystem', ar: 'النظام البيئي' },
        children: [
          { id: 'ai-kurucu-ortak',  route: '/ecosystem/cofounder',     labels: { tr: 'AI Kurucu Ortak', en: 'AI Co-Founder', ar: 'الشريك المؤسس الذكي' }, ai: true },
          { id: 'zyrix-twin',       route: '/ecosystem/twin',          labels: { tr: 'Zyrix Twin', en: 'Zyrix Twin', ar: 'التوأم الرقمي' }, ai: true },
          { id: 'b2b-pazaryeri',    route: '/ecosystem/b2b',           labels: { tr: 'B2B Pazaryeri', en: 'B2B Marketplace', ar: 'سوق B2B' } },
          { id: 'sigorta-pazaryeri',route: '/ecosystem/insurance',     labels: { tr: 'Sigorta Pazaryeri', en: 'Insurance Market', ar: 'سوق التأمين' } },
          { id: 'tedarikci-saglik', route: '/ecosystem/supplier-health', labels: { tr: 'Tedarikçi Sağlık', en: 'Supplier Health', ar: 'صحة المورد' }, ai: true },
          { id: 'acik-bankacilik',  route: '/ecosystem/open-banking',  labels: { tr: 'Açık Bankacılık', en: 'Open Banking', ar: 'الخدمات المصرفية المفتوحة' } },
          { id: 'influencer-roi',   route: '/ecosystem/influencer',    labels: { tr: 'Influencer ROI', en: 'Influencer ROI', ar: 'عائد الاستثمار للمؤثرين' }, ai: true }
        ]
      },
      {
        id: 'capital',
        route: '/capital',
        icon: 'Banknote',
        hidden: true,
        labels: { tr: 'Capital', en: 'Capital', ar: 'رأس المال' }
      },
      {
        id: 'universite',
        route: '/university',
        icon: 'GraduationCap',
        hidden: true,
        labels: { tr: 'Üniversite', en: 'University', ar: 'الجامعة' }
      }
    ]
  }
];

// ─────────────────────────────────────────────────────────────
// LEGACY ENTRY MAP — these old routes still resolve, but DO NOT
// appear in the V2 sidebar. Cmd+K will show them with a "(eski)"
// suffix so power users can still find them.
// ─────────────────────────────────────────────────────────────
export const LEGACY_REDIRECTS = [
  { id: 'faturalar-eski',     legacyRoute: '/legacy/invoices',       newRoute: '/sales/invoices',    labels: { tr: 'Faturalar (Eski)', en: 'Invoices (Legacy)', ar: 'الفواتير (قديم)' } },
  { id: 'efatura-eski',       legacyRoute: '/legacy/einvoice',       newRoute: '/einvoice/outgoing', labels: { tr: 'E-Fatura (Eski)', en: 'E-Invoice (Legacy)', ar: 'الفاتورة الإلكترونية (قديم)' } },
  { id: 'bankalar-eski',      legacyRoute: '/legacy/banks',          newRoute: '/cash/bank-recon',   labels: { tr: 'Bankalar (Eski)', en: 'Banks (Legacy)', ar: 'البنوك (قديم)' } },
  { id: 'cek-eski',           legacyRoute: '/legacy/checks',         newRoute: '/cash/checks',       labels: { tr: 'Çek (Eski)', en: 'Checks (Legacy)', ar: 'الشيكات (قديم)' } },
  { id: 'oto-fatura-eski',    legacyRoute: '/legacy/auto-invoice',   newRoute: '/einvoice/auto',     labels: { tr: 'Oto. Fatura (Eski)', en: 'Auto Invoice (Legacy)', ar: 'الفاتورة الآلية (قديم)' } },
  { id: 'stok-eski',          legacyRoute: '/legacy/stock',          newRoute: '/inventory/movements', labels: { tr: 'Stok (Eski)', en: 'Stock (Legacy)', ar: 'المخزون (قديم)' } },
  { id: 'hizli-oto-fatura',   legacyRoute: '/legacy/quick-auto',     newRoute: '/einvoice/auto',     labels: { tr: 'Hızlı Otomatik Fatura', en: 'Quick Auto Invoice', ar: 'فاتورة آلية سريعة' } },
  { id: 'fatura-otopilot',    legacyRoute: '/legacy/invoice-pilot',  newRoute: '/einvoice/auto',     labels: { tr: 'Fatura Otopilotu', en: 'Invoice Autopilot', ar: 'الطيار الآلي للفواتير' } }
];

// ─────────────────────────────────────────────────────────────
// FLAT LIST helper — used by Cmd+K
// ─────────────────────────────────────────────────────────────
export const flattenSidebar = () => {
  const out = [];
  for (const tier of SIDEBAR_REGISTRY) {
    for (const hub of tier.hubs) {
      if (hub.hidden) continue;
      // Single-page hub
      if (hub.route && !hub.children) {
        out.push({
          id: hub.id, route: hub.route, labels: hub.labels,
          icon: hub.icon, ai: Boolean(hub.ai), tier: tier.tier, breadcrumb: []
        });
      }
      // Hub with children
      if (hub.children) {
        for (const child of hub.children) {
          if (child.hidden) continue;
          out.push({
            id: child.id, route: child.route, labels: child.labels,
            icon: hub.icon, ai: Boolean(child.ai), tier: tier.tier,
            breadcrumb: [hub.labels]
          });
        }
      }
    }
  }
  return out;
};

export const SIDEBAR_FLAT = flattenSidebar();
