import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function MaintenancePage() {
  return (
    <AdminPagePlaceholder
      title="Maintenance Mode"
      icon="🔧"
      cluster="Cluster G · System"
      permission="system.maintenance"
      features={[
              "Schedule maintenance window",
              "Customer-facing banner",
              "Read-only mode (no writes)",
              "Allowlist for staff access",
              "Auto-disable at end time"
      ]}
    />
  );
}
