import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, RequireAuth, useAuth } from "./context/AuthContext";
import LandingPage       from "./pages/LandingPage";
import LoginPage         from "./pages/LoginPage";
import RegisterPage      from "./pages/RegisterPage";
import OnboardingPage    from "./pages/OnboardingPage";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminPanel        from "./pages/AdminPanel";
import PaymentPage       from "./pages/PaymentPage";

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
        <Routes>
          <Route path="/"             element={<LandingPage />} />
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/register"     element={<RegisterPage />} />
          <Route path="/onboarding"   element={<RequireAuth><OnboardingPage /></RequireAuth>} />
          <Route path="/dashboard/*"  element={<RequireAuth><CustomerDashboard /></RequireAuth>} />
          <Route path="/payment"      element={<RequireAuth><PaymentPage /></RequireAuth>} />
          <Route path="/admin/*"      element={<RequireAuth role="admin"><AdminPanel /></RequireAuth>} />
          <Route path="/home"         element={<HomeRedirect />} />
          <Route path="*"             element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}