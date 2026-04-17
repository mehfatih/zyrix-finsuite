import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("zyrix_token");
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
  return data;
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const cached = localStorage.getItem("zyrix_user");
      const token  = localStorage.getItem("zyrix_token");
      if (cached && token) setUser(JSON.parse(cached));
    } catch {}
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    // Try admin login first
    try {
      const res = await apiFetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const token   = res?.data?.token;
      const userObj = { ...res?.data?.admin, role: res?.data?.admin?.role || "SUPER_ADMIN", _type: "admin" };
      if (!token) throw new Error("No token");
      localStorage.setItem("zyrix_token", token);
      localStorage.setItem("zyrix_user", JSON.stringify(userObj));
      setUser(userObj);
      return userObj;
    } catch (adminErr) {
      // Not an admin — try merchant login
      try {
        const res = await apiFetch("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        const token   = res?.data?.token;
        const userObj = { ...res?.data?.merchant, role: "MERCHANT", _type: "merchant" };
        if (!token) throw new Error("No token");
        localStorage.setItem("zyrix_token", token);
        localStorage.setItem("zyrix_user", JSON.stringify(userObj));
        setUser(userObj);
        return userObj;
      } catch (merchantErr) {
        throw new Error("Invalid credentials");
      }
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("zyrix_token");
    localStorage.removeItem("zyrix_user");
    setUser(null);
    window.location.href = "/login";
  }, []);

  const role    = user?.role?.toUpperCase();
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  const isMerchant = role === "MERCHANT";

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isMerchant }}>
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
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!user) { window.location.href = "/login"; return null; }
  if (role === "admin" && !isAdmin) { window.location.href = "/dashboard"; return null; }

  return children;
}