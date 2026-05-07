import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function DunningRulesPage() {
  return (
    <AdminPagePlaceholder
      title="Dunning Rules"
      icon="📨"
      cluster="Cluster B · Revenue"
      permission="dunning.configure"
      features={[
              "Retry schedule (e.g. 1d, 3d, 7d, 14d)",
              "Email template per attempt",
              "Auto-suspend on N failures",
              "Per-tier overrides",
              "Test rule with sample customer"
      ]}
    />
  );
}
