import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, RequireAuth, useAuth } from "./context/AuthContext";
import ScrollToTop from "./components/ScrollToTop.jsx";
import SkeletonScreen from "./components/dashboard/SkeletonScreen.jsx";
import BrandedLoader from "./components/BrandedLoader.jsx";

// ── Eagerly loaded (auth + always-on) ──────────────────────────
import LoginPage          from "./pages/LoginPage";
import OtpLogin           from "./pages/OtpLogin";
import RegisterPage       from "./pages/RegisterPage";

// ── Lazy: marketing pages (each ~30-80kb, only one at a time) ──
const LandingPageV2Extended = React.lazy(() => import("./pages/LandingPageV2Extended"));
const AIAnalysisPage      = React.lazy(() => import("./pages/AIAnalysisPage"));
const HowItWorksPage      = React.lazy(() => import("./pages/HowItWorksPage"));
const PricingPage         = React.lazy(() => import("./pages/PricingPage"));
const FeaturesPage        = React.lazy(() => import("./pages/FeaturesPage.jsx"));
const CaseStudiesPage     = React.lazy(() => import("./pages/CaseStudiesPage.jsx"));
const IntegrationsPage    = React.lazy(() => import("./pages/IntegrationsPage.jsx"));
const SectorsPage         = React.lazy(() => import("./pages/SectorsPage.jsx"));
const AboutPage           = React.lazy(() => import("./pages/AboutPage.jsx"));
const ContactPage         = React.lazy(() => import("./pages/ContactPage.jsx"));
const EFaturaPage         = React.lazy(() => import("./pages/features/EFaturaPage.jsx"));
const CRMPage             = React.lazy(() => import("./pages/features/CRMPage.jsx"));
const AIPage              = React.lazy(() => import("./pages/features/AIPage.jsx"));
const MobilPage           = React.lazy(() => import("./pages/features/MobilPage.jsx"));
const AcademyPage         = React.lazy(() => import("./pages/resources/AcademyPage.jsx"));
const HelpCenterPage      = React.lazy(() => import("./pages/resources/HelpCenterPage.jsx"));
const WebinarsPage        = React.lazy(() => import("./pages/resources/WebinarsPage.jsx"));
const KilavuzPage         = React.lazy(() => import("./pages/resources/KilavuzPage.jsx"));
const KariyerPage         = React.lazy(() => import("./pages/resources/KariyerPage.jsx"));
const BasinPage           = React.lazy(() => import("./pages/resources/BasinPage.jsx"));
const PartnersPage        = React.lazy(() => import("./pages/resources/PartnersPage.jsx"));
const CerezPage           = React.lazy(() => import("./pages/resources/CerezPage.jsx"));
const GdprPage            = React.lazy(() => import("./pages/resources/GdprPage.jsx"));
const PrivacyPage         = React.lazy(() => import("./pages/PrivacyPage.jsx"));
const TermsPage           = React.lazy(() => import("./pages/TermsPage.jsx"));
const SecurityPage        = React.lazy(() => import("./pages/SecurityPage.jsx"));
const SecuritySettingsPage = React.lazy(() => import("./pages/dashboard/SecuritySettingsPage.jsx"));
const NotFoundPage        = React.lazy(() => import("./pages/NotFoundPage.jsx"));
const BlogPage            = React.lazy(() => import("./pages/BlogPage.jsx"));
const SitemapPage         = React.lazy(() => import("./pages/SitemapPage.jsx"));
const OnboardingPage      = React.lazy(() => import("./pages/OnboardingPage"));

// ── Lazy: authenticated app shells ─────────────────────────────
const CustomerDashboard   = React.lazy(() => import("./pages/CustomerDashboard"));
const AdminPanel          = React.lazy(() => import("./pages/AdminPanel"));
const PaymentPage         = React.lazy(() => import("./pages/PaymentPage"));
const TeamPage            = React.lazy(() => import("./pages/TeamPage"));
const CampaignsPage       = React.lazy(() => import("./pages/CampaignsPage"));
const InviteAcceptPage    = React.lazy(() => import("./pages/InviteAcceptPage"));

// ── Lazy: public portal (Phase 10) ─────────────────────────────
const CustomerPortalView  = React.lazy(() => import("./pages/public/CustomerPortalView.jsx"));

// ── Lazy: onboarding wizard (Phase 12) ─────────────────────────
const WelcomePage         = React.lazy(() => import("./pages/onboarding/WelcomePage.jsx"));
const ImportDataPage      = React.lazy(() => import("./pages/onboarding/ImportDataPage.jsx"));
const ConnectBanksPage    = React.lazy(() => import("./pages/onboarding/ConnectBanksPage.jsx"));
const BrandSetupPage      = React.lazy(() => import("./pages/onboarding/BrandSetupPage.jsx"));
const ReadyToFlyPage      = React.lazy(() => import("./pages/onboarding/ReadyToFlyPage.jsx"));

// ── Lazy: help center (Phase 12) ───────────────────────────────
const KnowledgeBasePage   = React.lazy(() => import("./pages/help/KnowledgeBasePage.jsx"));
const KeyboardShortcutsPage = React.lazy(() => import("./pages/help/KeyboardShortcutsPage.jsx"));
const WhatsNewPage        = React.lazy(() => import("./pages/help/WhatsNewPage.jsx"));

// ── Lazy: Phase 13 support center ──────────────────────────────
const SupportHomePage           = React.lazy(() => import("./pages/support/SupportHomePage.jsx"));
const SupportKnowledgeBasePage  = React.lazy(() => import("./pages/support/KnowledgeBasePage.jsx"));
const ArticleDetailPage         = React.lazy(() => import("./pages/support/ArticleDetailPage.jsx"));
const TicketSubmitPage          = React.lazy(() => import("./pages/support/TicketSubmitPage.jsx"));
const MyTicketsPage             = React.lazy(() => import("./pages/support/MyTicketsPage.jsx"));
const TicketDetailPage          = React.lazy(() => import("./pages/support/TicketDetailPage.jsx"));
const ContactSupportPage        = React.lazy(() => import("./pages/support/ContactSupportPage.jsx"));
const AdminTicketsPage          = React.lazy(() => import("./pages/admin/support/AdminTicketsPage.jsx"));
const AdminTicketDetail         = React.lazy(() => import("./pages/admin/support/AdminTicketDetail.jsx"));
const KnowledgeBaseAdmin        = React.lazy(() => import("./pages/admin/support/KnowledgeBaseAdmin.jsx"));
const SupportAnalyticsPage      = React.lazy(() => import("./pages/admin/support/SupportAnalyticsPage.jsx"));

// ── Lazy: Phase 13 migration engine ────────────────────────────
const MigrationHomePage         = React.lazy(() => import("./pages/migration/MigrationHomePage.jsx"));
const MigrationWizard           = React.lazy(() => import("./pages/migration/MigrationWizard.jsx"));
const MigrationHistoryPage      = React.lazy(() => import("./pages/migration/MigrationHistoryPage.jsx"));
const ExportCenterPage          = React.lazy(() => import("./pages/migration/ExportCenterPage.jsx"));
const MigrationConciergePage    = React.lazy(() => import("./pages/migration/MigrationConciergePage.jsx"));

// ── Lazy: Phase 14 admin operations ────────────────────────────
const AdminLoginPage     = React.lazy(() => import("./pages/admin/AdminLoginPage.jsx"));
const AdminLayout        = React.lazy(() => import("./components/admin/AdminLayout.jsx"));
const AdminDashboardPage = React.lazy(() => import("./pages/admin/AdminDashboardPage.jsx"));
// Cluster A — Customer Management
const AdminCustomerOverview    = React.lazy(() => import("./pages/admin/customers/CustomerOverviewPage.jsx"));
const AdminCustomersList       = React.lazy(() => import("./pages/admin/customers/CustomersListPage.jsx"));
const AdminCustomerDetail      = React.lazy(() => import("./pages/admin/customers/CustomerDetailPage.jsx"));
const AdminCustomerArchive     = React.lazy(() => import("./pages/admin/customers/CustomerArchivePage.jsx"));
const AdminCustomerImpersonate = React.lazy(() => import("./pages/admin/customers/CustomerImpersonatePage.jsx"));
const AdminCustomerBulkOps     = React.lazy(() => import("./pages/admin/customers/CustomerBulkOpsPage.jsx"));
const AdminCustomerMerge       = React.lazy(() => import("./pages/admin/customers/CustomerMergePage.jsx"));
// Cluster B — Revenue
const AdminRevenueDashboard  = React.lazy(() => import("./pages/admin/revenue/RevenueDashboardPage.jsx"));
const AdminSubscriptions     = React.lazy(() => import("./pages/admin/revenue/SubscriptionsPage.jsx"));
const AdminFailedPayments    = React.lazy(() => import("./pages/admin/revenue/FailedPaymentsPage.jsx"));
const AdminCoupons           = React.lazy(() => import("./pages/admin/revenue/CouponsPage.jsx"));
const AdminCohortAnalysis    = React.lazy(() => import("./pages/admin/revenue/CohortAnalysisPage.jsx"));
const AdminRefunds           = React.lazy(() => import("./pages/admin/revenue/RefundsPage.jsx"));
const AdminManualInvoice     = React.lazy(() => import("./pages/admin/revenue/ManualInvoicePage.jsx"));
const AdminDunningRules      = React.lazy(() => import("./pages/admin/revenue/DunningRulesPage.jsx"));
const AdminRevenueForecast   = React.lazy(() => import("./pages/admin/revenue/RevenueForecastPage.jsx"));
// Cluster C — Plans
const AdminPlansEditor    = React.lazy(() => import("./pages/admin/plans/PlansEditorPage.jsx"));
const AdminFeatureToggles = React.lazy(() => import("./pages/admin/plans/FeatureTogglesPage.jsx"));
const AdminABTesting      = React.lazy(() => import("./pages/admin/plans/ABTestingPage.jsx"));
const AdminCustomQuotes   = React.lazy(() => import("./pages/admin/plans/CustomQuotesPage.jsx"));
const AdminAddons         = React.lazy(() => import("./pages/admin/plans/AddonsPage.jsx"));
const AdminPricingHistory = React.lazy(() => import("./pages/admin/plans/PricingHistoryPage.jsx"));
// Cluster D — Support
const AdminTicketsQueue     = React.lazy(() => import("./pages/admin/ops/TicketsQueuePage.jsx"));
const AdminLiveChatMonitor  = React.lazy(() => import("./pages/admin/ops/LiveChatMonitorPage.jsx"));
const AdminEmailCampaigns   = React.lazy(() => import("./pages/admin/ops/EmailCampaignsPage.jsx"));
const AdminAnnouncements    = React.lazy(() => import("./pages/admin/ops/AnnouncementsPage.jsx"));
const AdminKBEditor         = React.lazy(() => import("./pages/admin/ops/KnowledgeBaseEditorPage.jsx"));
const AdminMacroResponses   = React.lazy(() => import("./pages/admin/ops/MacroResponsesPage.jsx"));
const AdminEscalationRules  = React.lazy(() => import("./pages/admin/ops/EscalationRulesPage.jsx"));
const AdminNPSSurveys       = React.lazy(() => import("./pages/admin/ops/NPSSurveysPage.jsx"));
const AdminWebinarManager   = React.lazy(() => import("./pages/admin/ops/WebinarManagerPage.jsx"));
const AdminStatusPageEditor = React.lazy(() => import("./pages/admin/ops/StatusPageEditorPage.jsx"));
// Cluster E — Analytics
const AdminProductAnalytics = React.lazy(() => import("./pages/admin/analytics/ProductAnalyticsPage.jsx"));
const AdminFeatureAdoption  = React.lazy(() => import("./pages/admin/analytics/FeatureAdoptionPage.jsx"));
const AdminChurnAnalysis    = React.lazy(() => import("./pages/admin/analytics/ChurnAnalysisPage.jsx"));
const AdminPowerUsers       = React.lazy(() => import("./pages/admin/analytics/PowerUsersPage.jsx"));
const AdminFunnelAnalysis   = React.lazy(() => import("./pages/admin/analytics/FunnelAnalysisPage.jsx"));
const AdminSessionReplays   = React.lazy(() => import("./pages/admin/analytics/SessionReplaysPage.jsx"));
const AdminHeatmaps         = React.lazy(() => import("./pages/admin/analytics/HeatmapsPage.jsx"));
const AdminCustomReports    = React.lazy(() => import("./pages/admin/analytics/CustomReportsPage.jsx"));
const AdminScheduledReports = React.lazy(() => import("./pages/admin/analytics/ScheduledReportsPage.jsx"));
const AdminRealtimeActivity = React.lazy(() => import("./pages/admin/analytics/RealtimeActivityPage.jsx"));
const AdminDataExport       = React.lazy(() => import("./pages/admin/analytics/DataExportPage.jsx"));
// Cluster F — Compliance
const AdminKVKKRequests       = React.lazy(() => import("./pages/admin/compliance/KVKKRequestsPage.jsx"));
const AdminGDPRRequests       = React.lazy(() => import("./pages/admin/compliance/GDPRRequestsPage.jsx"));
const AdminAuditLog           = React.lazy(() => import("./pages/admin/compliance/AuditLogPage.jsx"));
const AdminAccessControl      = React.lazy(() => import("./pages/admin/compliance/AccessControlPage.jsx"));
const AdminComplianceReports  = React.lazy(() => import("./pages/admin/compliance/ComplianceReportsPage.jsx"));
const AdminDataRetention      = React.lazy(() => import("./pages/admin/compliance/DataRetentionPage.jsx"));
const AdminSubprocessors      = React.lazy(() => import("./pages/admin/compliance/SubprocessorsPage.jsx"));
const AdminRightToBeForgotten = React.lazy(() => import("./pages/admin/compliance/RightToBeForgottenPage.jsx"));
// Cluster G — System
const AdminSystemHealth     = React.lazy(() => import("./pages/admin/system/SystemHealthPage.jsx"));
const AdminErrorMonitoring  = React.lazy(() => import("./pages/admin/system/ErrorMonitoringPage.jsx"));
const AdminAlerts           = React.lazy(() => import("./pages/admin/system/AlertsPage.jsx"));
const AdminBackups          = React.lazy(() => import("./pages/admin/system/BackupsPage.jsx"));
const AdminAPIUsage         = React.lazy(() => import("./pages/admin/system/APIUsagePage.jsx"));
const AdminDatabaseConsole  = React.lazy(() => import("./pages/admin/system/DatabaseConsolePage.jsx"));
const AdminCacheManagement  = React.lazy(() => import("./pages/admin/system/CacheManagementPage.jsx"));
const AdminJobQueue         = React.lazy(() => import("./pages/admin/system/JobQueuePage.jsx"));
const AdminDeployments      = React.lazy(() => import("./pages/admin/system/DeploymentsPage.jsx"));
const AdminFeatureFlags     = React.lazy(() => import("./pages/admin/system/FeatureFlagsPage.jsx"));
const AdminMaintenance      = React.lazy(() => import("./pages/admin/system/MaintenancePage.jsx"));
const AdminSecurityScanner  = React.lazy(() => import("./pages/admin/system/SecurityScannerPage.jsx"));
const AdminAccountSecurity  = React.lazy(() => import("./pages/admin/settings/AccountSecurityPage.jsx"));
// Cluster H — Marketing
const AdminReviewsManager      = React.lazy(() => import("./pages/admin/marketing/ReviewsManagerPage.jsx"));
const AdminLandingEditor       = React.lazy(() => import("./pages/admin/marketing/LandingEditorPage.jsx"));
const AdminConversionAnalytics = React.lazy(() => import("./pages/admin/marketing/ConversionAnalyticsPage.jsx"));
const AdminLeads               = React.lazy(() => import("./pages/admin/marketing/LeadsPage.jsx"));
const AdminSEOManager          = React.lazy(() => import("./pages/admin/marketing/SEOManagerPage.jsx"));
const AdminBlogCMS             = React.lazy(() => import("./pages/admin/marketing/BlogCMSPage.jsx"));
const AdminAffiliates          = React.lazy(() => import("./pages/admin/marketing/AffiliatesPage.jsx"));
const AdminReferrals           = React.lazy(() => import("./pages/admin/marketing/ReferralsPage.jsx"));
const AdminSocialScheduler     = React.lazy(() => import("./pages/admin/marketing/SocialSchedulerPage.jsx"));
const AdminEmailSequences      = React.lazy(() => import("./pages/admin/marketing/EmailSequencesPage.jsx"));
// Cluster I — Mali Müşavir
const AdminPartnersDirectory   = React.lazy(() => import("./pages/admin/musavir/PartnersDirectoryPage.jsx"));
const AdminCommissions         = React.lazy(() => import("./pages/admin/musavir/CommissionsPage.jsx"));
const AdminAccountantReferrals = React.lazy(() => import("./pages/admin/musavir/AccountantReferralsPage.jsx"));
const AdminOnboardingWorkflow  = React.lazy(() => import("./pages/admin/musavir/OnboardingWorkflowPage.jsx"));
const AdminAccountantMetrics   = React.lazy(() => import("./pages/admin/musavir/AccountantMetricsPage.jsx"));
const AdminTrainingMaterials   = React.lazy(() => import("./pages/admin/musavir/TrainingMaterialsPage.jsx"));
const AdminAccountantBroadcast = React.lazy(() => import("./pages/admin/musavir/AccountantBroadcastPage.jsx"));

// ── Lazy: Phase 13 trust + security ────────────────────────────
const TrustCenterPage             = React.lazy(() => import("./pages/trust/TrustCenterPage.jsx"));
const SecurityWhitepaperPage      = React.lazy(() => import("./pages/trust/SecurityWhitepaperPage.jsx"));
const ComplianceCertificationsPage = React.lazy(() => import("./pages/trust/ComplianceCertificationsPage.jsx"));
const PenetrationTestReportsPage  = React.lazy(() => import("./pages/trust/PenetrationTestReportsPage.jsx"));
const TwoFactorSetupPage          = React.lazy(() => import("./pages/settings/TwoFactorSetupPage.jsx"));
const ActiveSessionsPage          = React.lazy(() => import("./pages/settings/ActiveSessionsPage.jsx"));
const AuditLogPage                = React.lazy(() => import("./pages/settings/AuditLogPage.jsx"));
const DataExportRequestPage       = React.lazy(() => import("./pages/settings/DataExportRequestPage.jsx"));
const DataResidencyPage           = React.lazy(() => import("./pages/settings/DataResidencyPage.jsx"));

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  const role = user?.role?.toUpperCase();
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  if (isAdmin) return <Navigate to="/admin" replace />;
  if (!user.onboardingDone) return <Navigate to="/onboarding" replace />;
  return <Navigate to="/dashboard" replace />;
}

// Brand-coloured full-viewport loader. Replaces the previous light skeleton so
// lazy-route transitions don't flash a white screen before the next page paints.
// SkeletonScreen is still imported for in-app dashboard loading states.
const PageFallback = () => <BrandedLoader />;
void SkeletonScreen;

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <a href="#main-content" className="skip-to-content" style={skipLinkStyle}>Skip to main content</a>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<LandingPageV2Extended />} />
            <Route path="/ai-analysis" element={<AIAnalysisPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            {/* Per-feature dedicated landing pages (P2 — 4 priority features) */}
            <Route path="/e-fatura" element={<EFaturaPage />} />
            <Route path="/crm"      element={<CRMPage />} />
            <Route path="/ai"       element={<AIPage />} />
            <Route path="/mobil"    element={<MobilPage />} />
            {/* KAYNAKLAR — resource pages on the shared ResourcePage shell */}
            <Route path="/akademi"    element={<AcademyPage />} />
            <Route path="/destek"     element={<HelpCenterPage />} />
            <Route path="/webinarlar" element={<WebinarsPage />} />
            <Route path="/kilavuz"    element={<KilavuzPage />} />
            <Route path="/kariyer"    element={<KariyerPage />} />
            <Route path="/basin"      element={<BasinPage />} />
            <Route path="/partners"   element={<PartnersPage />} />
            <Route path="/cerez"      element={<CerezPage />} />
            <Route path="/gdpr"       element={<GdprPage />} />
            <Route path="/case-studies" element={<CaseStudiesPage />} />
            {/* Turkish-slug aliases for existing pages (footer uses these) */}
            <Route path="/basarilar"  element={<CaseStudiesPage />} />
            <Route path="/hakkimizda" element={<AboutPage />} />
            <Route path="/iletisim"   element={<ContactPage />} />
            <Route path="/sartlar"    element={<TermsPage />} />
            <Route path="/gizlilik"   element={<PrivacyPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/sectors" element={<SectorsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login"        element={<LoginPage />} />
            <Route path="/login/otp"    element={<OtpLogin />} />
            <Route path="/register"     element={<RegisterPage />} />
            <Route path="/dashboard/*"  element={<RequireAuth><CustomerDashboard /></RequireAuth>} />
            <Route path="/payment"      element={<RequireAuth><PaymentPage /></RequireAuth>} />
            {/* Phase 14 — Admin Operations Center (separate auth) */}
            <Route path="/admin/login"  element={<AdminLoginPage />} />
            <Route path="/admin"        element={<AdminLayout />}>
              <Route index            element={<AdminDashboardPage />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />

              {/* Cluster A — Customer Management */}
              <Route path="customers/overview"    element={<AdminCustomerOverview />} />
              <Route path="customers"             element={<AdminCustomersList />} />
              <Route path="customers/archive"     element={<AdminCustomerArchive />} />
              <Route path="customers/impersonate" element={<AdminCustomerImpersonate />} />
              <Route path="customers/bulk"        element={<AdminCustomerBulkOps />} />
              <Route path="customers/merge"       element={<AdminCustomerMerge />} />
              <Route path="customers/:id"         element={<AdminCustomerDetail />} />

              {/* Cluster B — Revenue */}
              <Route path="revenue"                  element={<AdminRevenueDashboard />} />
              <Route path="revenue/subscriptions"    element={<AdminSubscriptions />} />
              <Route path="revenue/failed-payments"  element={<AdminFailedPayments />} />
              <Route path="revenue/coupons"          element={<AdminCoupons />} />
              <Route path="revenue/cohorts"          element={<AdminCohortAnalysis />} />
              <Route path="revenue/refunds"          element={<AdminRefunds />} />
              <Route path="revenue/invoice"          element={<AdminManualInvoice />} />
              <Route path="revenue/dunning"          element={<AdminDunningRules />} />
              <Route path="revenue/forecast"         element={<AdminRevenueForecast />} />

              {/* Cluster C — Plans */}
              <Route path="plans"          element={<AdminPlansEditor />} />
              <Route path="plans/features" element={<AdminFeatureToggles />} />
              <Route path="plans/ab-test"  element={<AdminABTesting />} />
              <Route path="plans/quotes"   element={<AdminCustomQuotes />} />
              <Route path="plans/addons"   element={<AdminAddons />} />
              <Route path="plans/history"  element={<AdminPricingHistory />} />

              {/* Cluster D — Support */}
              <Route path="ops/tickets"       element={<AdminTicketsQueue />} />
              <Route path="ops/chat"          element={<AdminLiveChatMonitor />} />
              <Route path="ops/campaigns"     element={<AdminEmailCampaigns />} />
              <Route path="ops/announcements" element={<AdminAnnouncements />} />
              <Route path="ops/kb"            element={<AdminKBEditor />} />
              <Route path="ops/macros"        element={<AdminMacroResponses />} />
              <Route path="ops/escalation"    element={<AdminEscalationRules />} />
              <Route path="ops/nps"           element={<AdminNPSSurveys />} />
              <Route path="ops/webinars"      element={<AdminWebinarManager />} />
              <Route path="ops/status-page"   element={<AdminStatusPageEditor />} />

              {/* Cluster E — Analytics */}
              <Route path="analytics/product"     element={<AdminProductAnalytics />} />
              <Route path="analytics/adoption"    element={<AdminFeatureAdoption />} />
              <Route path="analytics/churn"       element={<AdminChurnAnalysis />} />
              <Route path="analytics/power-users" element={<AdminPowerUsers />} />
              <Route path="analytics/funnels"     element={<AdminFunnelAnalysis />} />
              <Route path="analytics/replays"     element={<AdminSessionReplays />} />
              <Route path="analytics/heatmaps"    element={<AdminHeatmaps />} />
              <Route path="analytics/reports"     element={<AdminCustomReports />} />
              <Route path="analytics/scheduled"   element={<AdminScheduledReports />} />
              <Route path="analytics/realtime"    element={<AdminRealtimeActivity />} />
              <Route path="analytics/export"      element={<AdminDataExport />} />

              {/* Cluster F — Compliance */}
              <Route path="compliance/kvkk"          element={<AdminKVKKRequests />} />
              <Route path="compliance/gdpr"          element={<AdminGDPRRequests />} />
              <Route path="compliance/audit"         element={<AdminAuditLog />} />
              <Route path="compliance/access"        element={<AdminAccessControl />} />
              <Route path="compliance/reports"       element={<AdminComplianceReports />} />
              <Route path="compliance/retention"     element={<AdminDataRetention />} />
              <Route path="compliance/subprocessors" element={<AdminSubprocessors />} />
              <Route path="compliance/forgotten"     element={<AdminRightToBeForgotten />} />

              {/* Cluster G — System */}
              <Route path="system/health"      element={<AdminSystemHealth />} />
              <Route path="system/errors"      element={<AdminErrorMonitoring />} />
              <Route path="system/alerts"      element={<AdminAlerts />} />
              <Route path="system/backups"     element={<AdminBackups />} />
              <Route path="system/api"         element={<AdminAPIUsage />} />
              <Route path="system/db"          element={<AdminDatabaseConsole />} />
              <Route path="system/cache"       element={<AdminCacheManagement />} />
              <Route path="system/jobs"        element={<AdminJobQueue />} />
              <Route path="system/deploy"      element={<AdminDeployments />} />
              <Route path="system/flags"       element={<AdminFeatureFlags />} />
              <Route path="system/maintenance" element={<AdminMaintenance />} />
              <Route path="system/security"    element={<AdminSecurityScanner />} />

              {/* Admin account settings — opt-in 2FA, password, etc. */}
              <Route path="settings/security"  element={<AdminAccountSecurity />} />

              {/* Cluster H — Marketing */}
              <Route path="marketing/reviews"    element={<AdminReviewsManager />} />
              <Route path="marketing/landing"    element={<AdminLandingEditor />} />
              <Route path="marketing/conversion" element={<AdminConversionAnalytics />} />
              <Route path="marketing/leads"      element={<AdminLeads />} />
              <Route path="marketing/seo"        element={<AdminSEOManager />} />
              <Route path="marketing/blog"       element={<AdminBlogCMS />} />
              <Route path="marketing/affiliates" element={<AdminAffiliates />} />
              <Route path="marketing/referrals"  element={<AdminReferrals />} />
              <Route path="marketing/social"     element={<AdminSocialScheduler />} />
              <Route path="marketing/sequences"  element={<AdminEmailSequences />} />

              {/* Cluster I — Mali Müşavir */}
              <Route path="musavir/partners"    element={<AdminPartnersDirectory />} />
              <Route path="musavir/commissions" element={<AdminCommissions />} />
              <Route path="musavir/referrals"   element={<AdminAccountantReferrals />} />
              <Route path="musavir/onboarding"  element={<AdminOnboardingWorkflow />} />
              <Route path="musavir/metrics"     element={<AdminAccountantMetrics />} />
              <Route path="musavir/training"    element={<AdminTrainingMaterials />} />
              <Route path="musavir/broadcast"   element={<AdminAccountantBroadcast />} />
            </Route>
            {/* Legacy customer-side admin panel — kept for now */}
            <Route path="/admin-legacy/*" element={<RequireAuth role="admin"><AdminPanel /></RequireAuth>} />
            <Route path="/team"         element={<RequireAuth><TeamPage /></RequireAuth>} />
            <Route path="/campaigns"    element={<RequireAuth><CampaignsPage /></RequireAuth>} />
            <Route path="/invite/:token" element={<InviteAcceptPage />} />
            <Route path="/home"         element={<HomeRedirect />} />

            {/* Onboarding wizard (Phase 12) — authenticated 5-step setup */}
            <Route path="/onboarding/setup"           element={<RequireAuth><WelcomePage /></RequireAuth>} />
            <Route path="/onboarding/setup/import"    element={<RequireAuth><ImportDataPage /></RequireAuth>} />
            <Route path="/onboarding/setup/banks"     element={<RequireAuth><ConnectBanksPage /></RequireAuth>} />
            <Route path="/onboarding/setup/brand"     element={<RequireAuth><BrandSetupPage /></RequireAuth>} />
            <Route path="/onboarding/setup/ready"     element={<RequireAuth><ReadyToFlyPage /></RequireAuth>} />

            {/* Help center (Phase 12) */}
            <Route path="/help"           element={<RequireAuth><KnowledgeBasePage /></RequireAuth>} />
            <Route path="/help/shortcuts" element={<RequireAuth><KeyboardShortcutsPage /></RequireAuth>} />
            <Route path="/help/whats-new" element={<RequireAuth><WhatsNewPage /></RequireAuth>} />

            {/* Support center (Phase 13) — public KB + ticketing.
                /destek belongs to the KAYNAKLAR resource shell above
                (HelpCenterPage), so do NOT re-register it here. */}
            <Route path="/support"                   element={<SupportHomePage />} />
            <Route path="/support/kb"                element={<SupportKnowledgeBasePage />} />
            <Route path="/support/article/:slug"     element={<ArticleDetailPage />} />
            <Route path="/support/contact"           element={<ContactSupportPage />} />
            <Route path="/support/tickets/new"       element={<RequireAuth><TicketSubmitPage /></RequireAuth>} />
            <Route path="/support/tickets"           element={<RequireAuth><MyTicketsPage /></RequireAuth>} />
            <Route path="/support/tickets/:id"       element={<RequireAuth><TicketDetailPage /></RequireAuth>} />
            <Route path="/admin/support"             element={<RequireAuth role="admin"><AdminTicketsPage /></RequireAuth>} />
            <Route path="/admin/support/tickets/:id" element={<RequireAuth role="admin"><AdminTicketDetail /></RequireAuth>} />
            <Route path="/admin/support/kb"          element={<RequireAuth role="admin"><KnowledgeBaseAdmin /></RequireAuth>} />
            <Route path="/admin/support/analytics"   element={<RequireAuth role="admin"><SupportAnalyticsPage /></RequireAuth>} />

            {/* Migration engine (Phase 13) — auth required */}
            <Route path="/migration"           element={<RequireAuth><MigrationHomePage /></RequireAuth>} />
            <Route path="/migration/wizard"    element={<RequireAuth><MigrationWizard /></RequireAuth>} />
            <Route path="/migration/history"   element={<RequireAuth><MigrationHistoryPage /></RequireAuth>} />
            <Route path="/migration/export"    element={<RequireAuth><ExportCenterPage /></RequireAuth>} />
            <Route path="/migration/concierge" element={<RequireAuth><MigrationConciergePage /></RequireAuth>} />

            {/* Trust Center (Phase 13) — public.
                /guvenlik is the public-facing Security page (with NavV2
                + FooterV2 brand shell); the Trust Center keeps /trust. */}
            <Route path="/trust"             element={<TrustCenterPage />} />
            <Route path="/guvenlik"          element={<SecurityPage />} />
            <Route path="/trust/whitepaper"  element={<SecurityWhitepaperPage />} />
            <Route path="/trust/compliance"  element={<ComplianceCertificationsPage />} />
            <Route path="/trust/pentest"     element={<PenetrationTestReportsPage />} />

            {/* Security settings (Phase 13) — auth required */}
            <Route path="/settings/2fa"          element={<RequireAuth><TwoFactorSetupPage /></RequireAuth>} />
            <Route path="/settings/sessions"     element={<RequireAuth><ActiveSessionsPage /></RequireAuth>} />
            <Route path="/settings/audit-log"    element={<RequireAuth><AuditLogPage /></RequireAuth>} />
            <Route path="/settings/data-export"  element={<RequireAuth><DataExportRequestPage /></RequireAuth>} />
            <Route path="/settings/residency"    element={<RequireAuth><DataResidencyPage /></RequireAuth>} />

            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/sitemap"     element={<SitemapPage />} />
            <Route path="/portal/:slug" element={<CustomerPortalView />} />
            <Route path="/blog"        element={<BlogPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/dashboard/security" element={<SecuritySettingsPage />} />
            {/* Legacy V2 paths redirect to root (V2 is now the home page) */}
            <Route path="/v2" element={<Navigate to="/" replace />} />
            <Route path="/v2-ext" element={<Navigate to="/" replace />} />
            <Route path="/v2-ext/*" element={<Navigate to="/" replace />} />
            <Route path="/v2-extended" element={<Navigate to="/" replace />} />
            <Route path="/landing-v2" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

const skipLinkStyle = {
  position: "absolute",
  insetInlineStart: 8,
  top: 8,
  background: "#0F172A",
  color: "#fff",
  padding: "10px 16px",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 800,
  textDecoration: "none",
  zIndex: 9999,
  transform: "translateY(-150%)",
  transition: "transform .2s",
};
