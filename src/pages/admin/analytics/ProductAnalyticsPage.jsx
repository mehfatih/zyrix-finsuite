import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function ProductAnalyticsPage() {
  return (
    <AdminPagePlaceholder
      title="Product Analytics"
      icon="📊"
      cluster="Cluster E · Analytics"
      permission="analytics.view"
      features={[
              "Feature usage heatmap",
              "Most/least used features",
              "User flow diagram",
              "Adoption rate per feature",
              "Time-to-first-action"
      ]}
    />
  );
}
