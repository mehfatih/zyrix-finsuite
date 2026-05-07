import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function PricingHistoryPage() {
  return (
    <AdminPagePlaceholder
      title="Pricing History"
      icon="🕘"
      cluster="Cluster C · Plans"
      permission="plan.view"
      features={[
              "Audit trail of every pricing change",
              "Grandfathered customer report",
              "Diff viewer between two snapshots",
              "Rollback to previous pricing"
      ]}
    />
  );
}
