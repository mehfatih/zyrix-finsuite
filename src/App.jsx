import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, RequireAuth, useAuth } from "./context/AuthContext";
import LoginPage         from "./pages/LoginPage";
import RegisterPage      from "./pages/RegisterPage";
import OnboardingPage    from "./pages/OnboardingPage";
const FeaturesPage = React.lazy(() => import("./pages/FeaturesPage.jsx"));
const CaseStudiesPage = React.lazy(() => import("./pages/CaseStudiesPage.jsx"));
const IntegrationsPage = React.lazy(() => import("./pages/IntegrationsPage.jsx"));
const SectorsPage = React.lazy(() => import("./pages/SectorsPage.jsx"));
const AboutPage = React.lazy(() => import("./pages/AboutPage.jsx"));
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminPanel        from "./pages/AdminPanel";
import PaymentPage       from "./pages/PaymentPage";
import TeamPage          from "./pages/TeamPage";
import CampaignsPage     from "./pages/CampaignsPage";
import OtpLogin          from "./pages/OtpLogin";
import InviteAcceptPage  from "./pages/InviteAcceptPage";
const LandingPageV2Extended = React.lazy(() => import("./pages/LandingPageV2Extended"));
const AIAnalysisPage = React.lazy(() => import("./pages/AIAnalysisPage"));
const HowItWorksPage = React.lazy(() => import("./pages/HowItWorksPage"));
const PricingPage = React.lazy(() => import("./pages/PricingPage"));

const ContactPage = React.lazy(() => import("./pages/ContactPage.jsx"));
const PrivacyPage = React.lazy(() => import("./pages/PrivacyPage.jsx"));
const TermsPage = React.lazy(() => import("./pages/TermsPage.jsx"));
const SecurityPage = React.lazy(() => import("./pages/SecurityPage.jsx"));
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<React.Suspense fallback={<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#64748B"}}>Yukleniyor...</div>}><LandingPageV2Extended /></React.Suspense>} />
          <Route path="/ai-analysis" element={<AIAnalysisPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/features" element={<React.Suspense fallback={<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#64748B"}}>Yukleniyor...</div>}><FeaturesPage /></React.Suspense>} />
        <Route path="/case-studies" element={<CaseStudiesPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/sectors" element={<SectorsPage />} />
        <Route path="/about" element={<AboutPage />} />
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/login/otp"    element={<OtpLogin />} />
          <Route path="/register"     element={<RegisterPage />} />
          <Route path="/onboarding"   element={<RequireAuth><OnboardingPage /></RequireAuth>} />
          <Route path="/dashboard/*"  element={<RequireAuth><CustomerDashboard /></RequireAuth>} />
          <Route path="/payment"      element={<RequireAuth><PaymentPage /></RequireAuth>} />
          <Route path="/admin/*"      element={<RequireAuth role="admin"><AdminPanel /></RequireAuth>} />
          <Route path="/team"         element={<RequireAuth><TeamPage /></RequireAuth>} />
          <Route path="/campaigns"    element={<RequireAuth><CampaignsPage /></RequireAuth>} />
          <Route path="/invite/:token" element={<InviteAcceptPage />} />
          <Route path="/home"         element={<HomeRedirect />} />
        
        <Route path="/contact" element={<React.Suspense fallback={<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#64748B"}}>Yukleniyor...</div>}><ContactPage /></React.Suspense>} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/v2-ext" element={<Navigate to="/" replace />} />
        <Route path="/v2-ext/*" element={<Navigate to="/" replace />} />
          {/* Legacy V2 paths redirect to root (V2 is now the home page) */}
          <Route path="/v2" element={<Navigate to="/" replace />} />
          <Route path="/v2-ext" element={<Navigate to="/" replace />} />
          <Route path="/v2-extended" element={<Navigate to="/" replace />} />
          <Route path="/landing-v2" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}