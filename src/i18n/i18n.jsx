// ================================================================
// Zyrix FinSuite — i18n System
// دعم العربية والتركية والإنجليزية
// الاستخدام: import { t, useI18n } from '@i18n/index'
// ================================================================

// ── Translations ──────────────────────────────────────────────
const translations = {
  TR: {
    // Navigation
    'nav.overview':     'Genel Bakış',
    'nav.customers':    'Müşteriler',
    'nav.deals':        'Anlaşmalar',
    'nav.invoices':     'Faturalar',
    'nav.tasks':        'Görevler',
    'nav.efatura':      'E-Fatura',
    'nav.factoring':    'Finansman',
    'nav.stock':        'Stok',
    'nav.installments': 'Taksit',
    'nav.checks':       'Çek & Senet',
    'nav.personnel':    'Personel & SGK',
    'nav.kartvizit':    'Kartvizit',
    'nav.recurring':    'Oto. Fatura',
    'nav.marketplace':  'Pazar Yeri',
    'nav.taxcalendar':  'Vergi Takvimi',
    'nav.benchmark':    'Benchmark',
    'nav.team':         'Ekip',
    'nav.campaigns':    'Kampanyalar',
    'nav.ai':           'AI Asistan',
    'nav.settings':     'Ayarlar',
    'nav.notifications':'Bildirimler',
    'nav.logout':       'Çıkış',

    // Common
    'common.save':      'Kaydet',
    'common.cancel':    'İptal',
    'common.delete':    'Sil',
    'common.edit':      'Düzenle',
    'common.add':       'Ekle',
    'common.search':    'Ara',
    'common.loading':   'Yükleniyor...',
    'common.nodata':    'Veri yok',
    'common.total':     'Toplam',
    'common.status':    'Durum',
    'common.date':      'Tarih',
    'common.actions':   'İşlemler',
    'common.create':    'Oluştur',
    'common.update':    'Güncelle',
    'common.view':      'Görüntüle',
    'common.export':    'Dışa Aktar',
    'common.back':      'Geri',
    'common.next':      'Sonraki',
    'common.yes':       'Evet',
    'common.no':        'Hayır',
    'common.success':   'Başarılı',
    'common.error':     'Hata',
    'common.warning':   'Uyarı',
    'common.info':      'Bilgi',

    // Invoice
    'invoice.title':       'Faturalar',
    'invoice.new':         'Yeni Fatura',
    'invoice.number':      'Fatura No',
    'invoice.customer':    'Müşteri',
    'invoice.amount':      'Tutar',
    'invoice.due_date':    'Vade Tarihi',
    'invoice.status.draft':    'Taslak',
    'invoice.status.sent':     'Gönderildi',
    'invoice.status.paid':     'Ödendi',
    'invoice.status.overdue':  'Gecikmiş',
    'invoice.status.cancelled':'İptal',
    'invoice.mark_paid':   'Ödendi Olarak İşaretle',
    'invoice.download_pdf':'PDF İndir',

    // Dashboard
    'dashboard.revenue':      'Gelir',
    'dashboard.this_month':   'Bu Ay',
    'dashboard.last_month':   'Geçen Ay',
    'dashboard.customers':    'Toplam Müşteri',
    'dashboard.overdue':      'Vadesi Geçen',
    'dashboard.pipeline':     'Pipeline Değeri',
    'dashboard.tasks':        'Bekleyen Görev',
    'dashboard.growth':       'Büyüme',
    'dashboard.greeting.morning':   'Günaydın',
    'dashboard.greeting.afternoon': 'İyi öğleden sonralar',
    'dashboard.greeting.evening':   'İyi akşamlar',

    // Auth
    'auth.login':       'Giriş Yap',
    'auth.register':    'Kayıt Ol',
    'auth.email':       'E-posta',
    'auth.password':    'Şifre',
    'auth.phone':       'Telefon',
    'auth.name':        'Ad Soyad',
    'auth.otp_login':   'Kodsuz Giriş (OTP)',
    'auth.logout':      'Çıkış Yap',
    'auth.forgot':      'Şifremi Unuttum',
    'auth.no_account':  'Hesabın yok mu?',
    'auth.has_account': 'Zaten hesabın var mı?',

    // Personnel
    'personnel.title':      'Personel & SGK',
    'personnel.add':        'Personel Ekle',
    'personnel.name':       'Ad Soyad',
    'personnel.position':   'Pozisyon',
    'personnel.department': 'Departman',
    'personnel.salary':     'Brüt Maaş',
    'personnel.net':        'Net Maaş',
    'personnel.calculate':  'Maaş Hesapla',
    'personnel.slip':       'Bordro Oluştur',

    // Tax Calendar
    'tax.title':       'Vergi Takvimi',
    'tax.generate':    'Takvim Oluştur',
    'tax.prepared':    'Hazırlandı',
    'tax.submitted':   'Gönderildi',
    'tax.days_left':   'gün kaldı',
    'tax.overdue':     'Gecikmiş',

    // Admin Login
    'adminLogin.brand':              'ZYRIX FINSUITE',
    'adminLogin.title':              'Yönetici İşlemleri',
    'adminLogin.email':              'E-posta',
    'adminLogin.emailPlaceholder':   'admin@zyrix.co',
    'adminLogin.password':           'Şifre',
    'adminLogin.signIn':             'Yöneticiye Giriş',
    'adminLogin.signingIn':          'Giriş yapılıyor…',
    'adminLogin.customerLink':       '← Müşteri girişi',
    'adminLogin.twoFAPrompt':        'Doğrulama uygulamanızdaki 6 haneli kodu girin',
    'adminLogin.twoFALabel':         '2FA Kodu',
    'adminLogin.verifySignIn':       'Doğrula ve Giriş Yap',
    'adminLogin.changePwdPrompt':    'Geçici şifrenizi değiştirmelisiniz',
    'adminLogin.newPwd':             'Yeni Şifre (en az 10 karakter)',
    'adminLogin.confirmPwd':         'Şifreyi Onayla',
    'adminLogin.updatePwd':          'Şifreyi Güncelle',
    'adminLogin.setup2FAPrompt':     'Yönetici hesapları için 2FA kayıt zorunludur',
    'adminLogin.scan':               'Google Authenticator ile tarayın',
    'adminLogin.code6':              'Uygulamadan 6 haneli kod',
    'adminLogin.verifyEnable':       'Doğrula ve 2FA\'yı Etkinleştir',
    'adminLogin.errorPwdLen':        'Yeni şifre en az 10 karakter olmalı',
    'adminLogin.errorPwdMatch':      'Şifreler eşleşmiyor',
    'adminLogin.errorLoginFailed':   'Giriş başarısız',
    'adminLogin.errorPwdChange':     'Şifre değiştirilemedi',
    'adminLogin.errorInvalidCode':   'Geçersiz kod',
    'adminLogin.langSwitcher':       'Dil',
  },

  AR: {
    // Navigation
    'nav.overview':     'نظرة عامة',
    'nav.customers':    'العملاء',
    'nav.deals':        'الصفقات',
    'nav.invoices':     'الفواتير',
    'nav.tasks':        'المهام',
    'nav.efatura':      'الفاتورة الإلكترونية',
    'nav.factoring':    'التمويل',
    'nav.stock':        'المخزون',
    'nav.installments': 'الأقساط',
    'nav.checks':       'الشيكات',
    'nav.personnel':    'الموظفون',
    'nav.kartvizit':    'بطاقة الأعمال',
    'nav.recurring':    'الفواتير التلقائية',
    'nav.marketplace':  'الأسواق',
    'nav.taxcalendar':  'التقويم الضريبي',
    'nav.benchmark':    'المقارنة',
    'nav.team':         'الفريق',
    'nav.campaigns':    'الحملات',
    'nav.ai':           'المساعد الذكي',
    'nav.settings':     'الإعدادات',
    'nav.notifications':'الإشعارات',
    'nav.logout':       'تسجيل الخروج',

    // Common
    'common.save':      'حفظ',
    'common.cancel':    'إلغاء',
    'common.delete':    'حذف',
    'common.edit':      'تعديل',
    'common.add':       'إضافة',
    'common.search':    'بحث',
    'common.loading':   'جاري التحميل...',
    'common.nodata':    'لا توجد بيانات',
    'common.total':     'الإجمالي',
    'common.status':    'الحالة',
    'common.date':      'التاريخ',
    'common.actions':   'الإجراءات',
    'common.create':    'إنشاء',
    'common.update':    'تحديث',
    'common.view':      'عرض',
    'common.export':    'تصدير',
    'common.back':      'رجوع',
    'common.next':      'التالي',
    'common.yes':       'نعم',
    'common.no':        'لا',
    'common.success':   'نجاح',
    'common.error':     'خطأ',
    'common.warning':   'تحذير',
    'common.info':      'معلومة',

    // Invoice
    'invoice.title':       'الفواتير',
    'invoice.new':         'فاتورة جديدة',
    'invoice.number':      'رقم الفاتورة',
    'invoice.customer':    'العميل',
    'invoice.amount':      'المبلغ',
    'invoice.due_date':    'تاريخ الاستحقاق',
    'invoice.status.draft':    'مسودة',
    'invoice.status.sent':     'مرسلة',
    'invoice.status.paid':     'مدفوعة',
    'invoice.status.overdue':  'متأخرة',
    'invoice.status.cancelled':'ملغية',
    'invoice.mark_paid':   'تحديد كمدفوعة',
    'invoice.download_pdf':'تحميل PDF',

    // Dashboard
    'dashboard.revenue':      'الإيرادات',
    'dashboard.this_month':   'هذا الشهر',
    'dashboard.last_month':   'الشهر الماضي',
    'dashboard.customers':    'إجمالي العملاء',
    'dashboard.overdue':      'فواتير متأخرة',
    'dashboard.pipeline':     'قيمة المبيعات',
    'dashboard.tasks':        'مهام معلقة',
    'dashboard.growth':       'النمو',
    'dashboard.greeting.morning':   'صباح الخير',
    'dashboard.greeting.afternoon': 'مساء الخير',
    'dashboard.greeting.evening':   'مساء النور',

    // Auth
    'auth.login':       'تسجيل الدخول',
    'auth.register':    'إنشاء حساب',
    'auth.email':       'البريد الإلكتروني',
    'auth.password':    'كلمة المرور',
    'auth.phone':       'رقم الهاتف',
    'auth.name':        'الاسم الكامل',
    'auth.otp_login':   'الدخول بكود OTP',
    'auth.logout':      'تسجيل الخروج',
    'auth.forgot':      'نسيت كلمة المرور',
    'auth.no_account':  'ليس لديك حساب؟',
    'auth.has_account': 'لديك حساب بالفعل؟',

    // Personnel
    'personnel.title':      'الموظفون والتأمينات',
    'personnel.add':        'إضافة موظف',
    'personnel.name':       'الاسم الكامل',
    'personnel.position':   'المنصب',
    'personnel.department': 'القسم',
    'personnel.salary':     'الراتب الإجمالي',
    'personnel.net':        'الراتب الصافي',
    'personnel.calculate':  'حساب الراتب',
    'personnel.slip':       'إنشاء كشف راتب',

    // Tax Calendar
    'tax.title':       'التقويم الضريبي',
    'tax.generate':    'إنشاء التقويم',
    'tax.prepared':    'تم التحضير',
    'tax.submitted':   'تم التقديم',
    'tax.days_left':   'يوم متبقي',
    'tax.overdue':     'متأخر',

    // Admin Login
    'adminLogin.brand':              'ZYRIX FINSUITE',
    'adminLogin.title':              'عمليات المسؤول',
    'adminLogin.email':              'البريد الإلكتروني',
    'adminLogin.emailPlaceholder':   'admin@zyrix.co',
    'adminLogin.password':           'كلمة المرور',
    'adminLogin.signIn':             'دخول المسؤول',
    'adminLogin.signingIn':          'جاري الدخول…',
    'adminLogin.customerLink':       '→ دخول العملاء',
    'adminLogin.twoFAPrompt':        'أدخل الرمز المكون من 6 أرقام من تطبيق المصادقة',
    'adminLogin.twoFALabel':         'رمز 2FA',
    'adminLogin.verifySignIn':       'تحقق وسجل الدخول',
    'adminLogin.changePwdPrompt':    'يجب تغيير كلمة المرور المؤقتة',
    'adminLogin.newPwd':             'كلمة المرور الجديدة (10 أحرف على الأقل)',
    'adminLogin.confirmPwd':         'تأكيد كلمة المرور',
    'adminLogin.updatePwd':          'تحديث كلمة المرور',
    'adminLogin.setup2FAPrompt':     'تسجيل 2FA إلزامي لحسابات المسؤول',
    'adminLogin.scan':               'امسح ضوئياً باستخدام Google Authenticator',
    'adminLogin.code6':              'رمز مكون من 6 أرقام من التطبيق',
    'adminLogin.verifyEnable':       'تحقق وفعّل 2FA',
    'adminLogin.errorPwdLen':        'يجب أن تتكون كلمة المرور الجديدة من 10 أحرف على الأقل',
    'adminLogin.errorPwdMatch':      'كلمات المرور غير متطابقة',
    'adminLogin.errorLoginFailed':   'فشل تسجيل الدخول',
    'adminLogin.errorPwdChange':     'فشل تغيير كلمة المرور',
    'adminLogin.errorInvalidCode':   'رمز غير صالح',
    'adminLogin.langSwitcher':       'اللغة',
  },

  EN: {
    // Navigation
    'nav.overview':     'Overview',
    'nav.customers':    'Customers',
    'nav.deals':        'Deals',
    'nav.invoices':     'Invoices',
    'nav.tasks':        'Tasks',
    'nav.efatura':      'E-Invoice',
    'nav.factoring':    'Financing',
    'nav.stock':        'Inventory',
    'nav.installments': 'Installments',
    'nav.checks':       'Checks',
    'nav.personnel':    'Personnel & SGK',
    'nav.kartvizit':    'Business Card',
    'nav.recurring':    'Auto Invoice',
    'nav.marketplace':  'Marketplace',
    'nav.taxcalendar':  'Tax Calendar',
    'nav.benchmark':    'Benchmark',
    'nav.team':         'Team',
    'nav.campaigns':    'Campaigns',
    'nav.ai':           'AI Assistant',
    'nav.settings':     'Settings',
    'nav.notifications':'Notifications',
    'nav.logout':       'Sign Out',

    // Common
    'common.save':      'Save',
    'common.cancel':    'Cancel',
    'common.delete':    'Delete',
    'common.edit':      'Edit',
    'common.add':       'Add',
    'common.search':    'Search',
    'common.loading':   'Loading...',
    'common.nodata':    'No data',
    'common.total':     'Total',
    'common.status':    'Status',
    'common.date':      'Date',
    'common.actions':   'Actions',
    'common.create':    'Create',
    'common.update':    'Update',
    'common.view':      'View',
    'common.export':    'Export',
    'common.back':      'Back',
    'common.next':      'Next',
    'common.yes':       'Yes',
    'common.no':        'No',
    'common.success':   'Success',
    'common.error':     'Error',
    'common.warning':   'Warning',
    'common.info':      'Info',

    // Invoice
    'invoice.title':       'Invoices',
    'invoice.new':         'New Invoice',
    'invoice.number':      'Invoice #',
    'invoice.customer':    'Customer',
    'invoice.amount':      'Amount',
    'invoice.due_date':    'Due Date',
    'invoice.status.draft':    'Draft',
    'invoice.status.sent':     'Sent',
    'invoice.status.paid':     'Paid',
    'invoice.status.overdue':  'Overdue',
    'invoice.status.cancelled':'Cancelled',
    'invoice.mark_paid':   'Mark as Paid',
    'invoice.download_pdf':'Download PDF',

    // Dashboard
    'dashboard.revenue':      'Revenue',
    'dashboard.this_month':   'This Month',
    'dashboard.last_month':   'Last Month',
    'dashboard.customers':    'Total Customers',
    'dashboard.overdue':      'Overdue Invoices',
    'dashboard.pipeline':     'Pipeline Value',
    'dashboard.tasks':        'Pending Tasks',
    'dashboard.growth':       'Growth',
    'dashboard.greeting.morning':   'Good morning',
    'dashboard.greeting.afternoon': 'Good afternoon',
    'dashboard.greeting.evening':   'Good evening',

    // Auth
    'auth.login':       'Sign In',
    'auth.register':    'Sign Up',
    'auth.email':       'Email',
    'auth.password':    'Password',
    'auth.phone':       'Phone',
    'auth.name':        'Full Name',
    'auth.otp_login':   'Passwordless Login (OTP)',
    'auth.logout':      'Sign Out',
    'auth.forgot':      'Forgot Password',
    'auth.no_account':  "Don't have an account?",
    'auth.has_account': 'Already have an account?',

    // Personnel
    'personnel.title':      'Personnel & SGK',
    'personnel.add':        'Add Employee',
    'personnel.name':       'Full Name',
    'personnel.position':   'Position',
    'personnel.department': 'Department',
    'personnel.salary':     'Gross Salary',
    'personnel.net':        'Net Salary',
    'personnel.calculate':  'Calculate Salary',
    'personnel.slip':       'Generate Payslip',

    // Tax Calendar
    'tax.title':       'Tax Calendar',
    'tax.generate':    'Generate Calendar',
    'tax.prepared':    'Prepared',
    'tax.submitted':   'Submitted',
    'tax.days_left':   'days left',
    'tax.overdue':     'Overdue',

    // Admin Login
    'adminLogin.brand':              'ZYRIX FINSUITE',
    'adminLogin.title':              'Admin Operations',
    'adminLogin.email':              'Email',
    'adminLogin.emailPlaceholder':   'admin@zyrix.co',
    'adminLogin.password':           'Password',
    'adminLogin.signIn':             'Sign In to Admin',
    'adminLogin.signingIn':          'Signing in…',
    'adminLogin.customerLink':       '← Customer login',
    'adminLogin.twoFAPrompt':        'Enter the 6-digit code from your authenticator app',
    'adminLogin.twoFALabel':         '2FA Code',
    'adminLogin.verifySignIn':       'Verify & Sign In',
    'adminLogin.changePwdPrompt':    'You must change your temporary password',
    'adminLogin.newPwd':             'New Password (min 10 chars)',
    'adminLogin.confirmPwd':         'Confirm Password',
    'adminLogin.updatePwd':          'Update Password',
    'adminLogin.setup2FAPrompt':     '2FA enrollment is mandatory for admin accounts',
    'adminLogin.scan':               'Scan with Google Authenticator',
    'adminLogin.code6':              '6-digit code from app',
    'adminLogin.verifyEnable':       'Verify & Enable 2FA',
    'adminLogin.errorPwdLen':        'New password must be at least 10 characters',
    'adminLogin.errorPwdMatch':      'Passwords do not match',
    'adminLogin.errorLoginFailed':   'Login failed',
    'adminLogin.errorPwdChange':     'Password change failed',
    'adminLogin.errorInvalidCode':   'Invalid code',
    'adminLogin.langSwitcher':       'Language',
  },
};

// ── i18n Context ──────────────────────────────────────────────
import { createContext, useContext, useState, useEffect } from 'react';
import { landingV2Translations } from './landingV2.translations';

import { getLangForCountry } from "../utils/countryProfiles.js";
// Merge Landing V2 translations into main translations
Object.keys(landingV2Translations).forEach(lang => {
  if (translations[lang]) {
    Object.assign(translations[lang], landingV2Translations[lang]);
  }
});

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    // أولوية: localStorage → merchant language → browser → TR
    const stored = localStorage.getItem('zyrix_lang');
    if (stored && translations[stored]) return stored;
    const user = JSON.parse(localStorage.getItem('zyrix_user') || '{}');
    if (user?.language && translations[user.language]) return user.language;
    // NEW: country-driven default (from useCountry / IP detection)
    const country = localStorage.getItem('zyrix_country');
    if (country) {
      const langFromCountry = getLangForCountry(country);
      if (langFromCountry && translations[langFromCountry]) return langFromCountry;
    }
    const browser = navigator.language?.slice(0, 2).toUpperCase();
    if (browser === 'AR') return 'AR';
    if (browser === 'EN') return 'EN';
    return 'TR';
  });

  const setLang = (l) => {
    setLangState(l);
    localStorage.setItem('zyrix_lang', l);
    // RTL for Arabic
    document.documentElement.dir = l === 'AR' ? 'rtl' : 'ltr';
    document.documentElement.lang = l.toLowerCase();
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'AR' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang.toLowerCase();
  }, [lang]);

  const t = (key, vars = {}) => {
    const dict = translations[lang] || translations.TR;
    let text = dict[key] || translations.TR[key] || key;
    // Variable substitution: t('hello', { name: 'Ali' }) → 'Hello Ali'
    Object.entries(vars).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
    return text;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, isRTL: lang === 'AR' }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}

// Standalone t() function (outside components — fallback to TR)
export function t(key, vars = {}, lang = 'TR') {
  const dict = translations[lang] || translations.TR;
  let text = dict[key] || translations.TR[key] || key;
  Object.entries(vars).forEach(([k, v]) => {
    text = text.replace(`{${k}}`, String(v));
  });
  return text;
}

export const SUPPORTED_LANGS = [
  { code: 'TR', label: 'Türkçe',  flag: '🇹🇷' },
  { code: 'AR', label: 'العربية', flag: '🇸🇦' },
  { code: 'EN', label: 'English', flag: '🇬🇧' },
];

export default translations;