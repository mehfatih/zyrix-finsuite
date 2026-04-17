// ================================================================
// Zyrix FinSuite — Login Page
// Handles both admin (finsuite-admin@zyrix.co) and customer login
// ================================================================

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const ADMIN_EMAILS = ["finsuite-admin@zyrix.co"];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) { setError("Please enter email and password."); return; }
    setError("");
    setBusy(true);
    try {
      const user = await login(email, password);
      const isAdmin = user.role === "admin" || user.role === "super_admin" || ADMIN_EMAILS.includes(email);
      window.location.href = isAdmin ? "/admin" : "/dashboard";
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f1117", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 400, padding: "0 20px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 52, height: 52, background: "#6C5DD3", borderRadius: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <span style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>Z</span>
          </div>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700, margin: 0 }}>Zyrix FinSuite</h1>
          <p style={{ color: "#8B8FA8", fontSize: 14, marginTop: 6 }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div style={{ background: "#1a1d27", border: "1px solid #2a2d3e", borderRadius: 16, padding: 28 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: "#8B8FA8", fontSize: 12, display: "block", marginBottom: 6 }}>Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" autoComplete="email" autoFocus
                style={{ width: "100%", background: "#13151f", border: "1px solid #2a2d3e", color: "#fff", borderRadius: 8, padding: "11px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                onFocus={(e) => e.target.style.borderColor = "#6C5DD3"}
                onBlur={(e) => e.target.style.borderColor = "#2a2d3e"}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ color: "#8B8FA8", fontSize: 12, display: "block", marginBottom: 6 }}>Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete="current-password"
                style={{ width: "100%", background: "#13151f", border: "1px solid #2a2d3e", color: "#fff", borderRadius: 8, padding: "11px 14px", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                onFocus={(e) => e.target.style.borderColor = "#6C5DD3"}
                onBlur={(e) => e.target.style.borderColor = "#2a2d3e"}
              />
            </div>

            {error && (
              <div style={{ background: "#FF456015", border: "1px solid #FF456040", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                <p style={{ color: "#FF4560", fontSize: 13, margin: 0 }}>{error}</p>
              </div>
            )}

            <button type="submit" disabled={busy}
              style={{ width: "100%", background: busy ? "#4a3f9e" : "#6C5DD3", border: "none", color: "#fff", borderRadius: 8, padding: "12px", fontSize: 15, fontWeight: 600, cursor: busy ? "not-allowed" : "pointer" }}>
              {busy ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p style={{ color: "#8B8FA8", fontSize: 12, textAlign: "center", marginTop: 20 }}>
          Zyrix FinSuite © {new Date().getFullYear()} — Powered by Zyrix
        </p>
      </div>
    </div>
  );
}