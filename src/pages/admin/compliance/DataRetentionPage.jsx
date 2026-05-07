import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function DataRetentionPage() {
  return (
    <AdminPagePlaceholder
      title="Data Retention"
      icon="⏳"
      cluster="Cluster F · Compliance"
      permission="retention.configure"
      features={[
              "Per-resource retention policy",
              "Auto-purge cron status",
              "Legal hold (suspend purge for ongoing case)",
              "Retention audit log"
      ]}
    />
  );
}
