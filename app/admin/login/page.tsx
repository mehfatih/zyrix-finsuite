"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("zyrix_admin_token", data.data.token);
        localStorage.setItem("zyrix_admin", JSON.stringify(data.data.admin));
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#1E293B", borderRadius: "16px", padding: "48px", width: "100%", maxWidth: "420px", border: "1px solid #334155" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "32px", fontWeight: "800", color: "#B8892A", marginBottom: "8px" }}>ZYRIX</div>
          <div style={{ fontSize: "18px", fontWeight: "600", color: "#FFFFFF", marginBottom: "4px" }}>Admin Panel</div>
          <div style={{ fontSize: "14px", color: "#64748B" }}>Sign in to your admin account</div>
        </div>

        {error && (
          <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#94A3B8", marginBottom: "8px" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "12px 16px", background: "#0F172A", border: "1px solid #334155", borderRadius: "8px", color: "#FFFFFF", fontSize: "15px", outline: "none", boxSizing: "border-box" }}
              placeholder="admin@zyrix.co"
            />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#94A3B8", marginBottom: "8px" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "12px 16px", background: "#0F172A", border: "1px solid #334155", borderRadius: "8px", color: "#FFFFFF", fontSize: "15px", outline: "none", boxSizing: "border-box" }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "14px", background: loading ? "#334155" : "#2563EB", color: "#FFFFFF", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "12px", color: "#475569" }}>
          Zyrix FinSuite Admin Panel — Confidential
        </div>
      </div>
    </div>
  );
}
