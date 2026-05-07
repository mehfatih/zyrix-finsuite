import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function AccessControlPage() {
  return (
    <AdminPagePlaceholder
      title="Access Control (RBAC)"
      icon="🔑"
      cluster="Cluster F · Compliance"
      permission="admin.view"
      features={[
              "Admin user list + roles",
              "Per-permission grant/revoke",
              "Role templates (FINANCE/SUPPORT/etc.)",
              "Audit trail of permission changes",
              "Periodic access review reminders"
      ]}
    />
  );
}
