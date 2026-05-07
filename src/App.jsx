import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, RequireAuth, useAuth } from "./context/AuthContext";
import ScrollToTop from "./components/ScrollToTop.jsx";
import SkeletonScreen from "./components/dashboard/SkeletonScreen.jsx";

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

const PageFallback = () => <SkeletonScreen kind="page" />;

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
            <Route path="/case-studies" element={<CaseStudiesPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/sectors" element={<SectorsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login"        element={<LoginPage />} />
            <Route path="/login/otp"    element={<OtpLogin />} />
            <Route path="/register"     element={<RegisterPage />} />
            <Route path="/dashboard/*"  element={<RequireAuth><CustomerDashboard /></RequireAuth>} />
            <Route path="/payment"      element={<RequireAuth><PaymentPage /></RequireAuth>} />
            <Route path="/admin/*"      element={<RequireAuth role="admin"><AdminPanel /></RequireAuth>} />
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

            {/* Support center (Phase 13) — public KB + ticketing */}
            <Route path="/support"                   element={<SupportHomePage />} />
            <Route path="/destek"                    element={<SupportHomePage />} />
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
