import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function CohortAnalysisPage() {
  return (
    <AdminPagePlaceholder
      title="Cohort Analysis"
      icon="📐"
      cluster="Cluster B · Revenue"
      permission="revenue.view"
      features={[
              "Acquisition cohorts heatmap",
              "Retention curves",
              "Revenue per cohort",
              "LTV by cohort",
              "Segment by tier/country/source",
              "Export cohort to CSV"
      ]}
    />
  );
}
