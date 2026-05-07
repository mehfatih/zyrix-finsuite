import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function AccountantMetricsPage() {
  return (
    <AdminPagePlaceholder
      title="Accountant Metrics"
      icon="📊"
      cluster="Cluster I · Mali Müşavir"
      permission="musavir.view"
      features={[
              "Per-partner client count",
              "Average client retention by partner",
              "Partner NPS",
              "Top partners leaderboard"
      ]}
    />
  );
}
