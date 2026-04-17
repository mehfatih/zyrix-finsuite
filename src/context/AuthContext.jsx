import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI, tokenUtils } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const cached = localStorage.getItem("zyrix_user");
        if (cached && tokenUtils.isValid()) {
          setUser(JSON.parse(cached));
        } else {
          tokenUtils.clear();
        }
      } catch {
        tokenUtils.clear();
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authAPI.login(email, password);
    // Backend returns: { success: true, data: { token, admin: {...} } }
    const token = data?.data?.token || data?.token;
    const userObj = data?.data?.admin || data?.data?.user || data?.user || data;
    if (!token) throw new Error("No token received");
    tokenUtils.set(token);
    localStorage.setItem("zyrix_user", JSON.stringify(userObj));
    setUser(userObj);
    return userObj;
  }, []);

  const logout = useCallback(() => {
    tokenUtils.clear();
    setUser(null);
    window.location.href = "/login";
  }, []);

  const role = user?.role?.toUpperCase();
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  const isCustomer = role === "CUSTOMER" || role === "USER";

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isCustomer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function RequireAuth({ children, role }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0f1117" }}>
      <div style={{ width: 40, height: 40, border: "3px solid #2a2d3e", borderTopColor: "#6C5DD3", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  if (role === "admin" && !isAdmin) {
    window.location.href = "/dashboard";
    return null;
  }

  return children;
}