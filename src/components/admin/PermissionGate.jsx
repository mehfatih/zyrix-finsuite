// ================================================================
// PermissionGate — only renders children if admin has the permission
// ================================================================
import React from "react";
import { hasPermission } from "../../utils/admin/permissions";

export default function PermissionGate({ admin, permission, fallback = null, children }) {
  if (!permission) return children;
  if (hasPermission(admin, permission)) return children;
  return fallback;
}

export function NoAccessNotice({ permission }) {
  return (
    <div style={{ padding: 40, textAlign: "center", color: "#94A3B8", background: "#F8FAFC", border: "1px dashed #E2E8F0", borderRadius: 14, margin: 20 }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>🔒</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#475569", marginBottom: 6 }}>Insufficient permissions</div>
      <div style={{ fontSize: 11, color: "#94A3B8" }}>You don't have the <code style={{ background: "#fff", padding: "2px 6px", borderRadius: 4 }}>{permission}</code> permission.</div>
    </div>
  );
}
