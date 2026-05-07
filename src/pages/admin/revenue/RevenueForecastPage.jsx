import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function RevenueForecastPage() {
  return (
    <AdminPagePlaceholder
      title="Revenue Forecast"
      icon="🔮"
      cluster="Cluster B · Revenue"
      permission="revenue.forecast"
      features={[
              "90-day MRR projection",
              "Multiple scenarios (conservative/base/aggressive)",
              "Per-cohort modeling",
              "Sensitivity sliders for churn + new MRR",
              "Export forecast to PDF for board"
      ]}
    />
  );
}
