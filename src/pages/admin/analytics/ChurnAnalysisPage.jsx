import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function ChurnAnalysisPage() {
  return (
    <AdminPagePlaceholder
      title="Churn Analysis"
      icon="📉"
      cluster="Cluster E · Analytics"
      permission="analytics.view"
      features={[
              "Churn reasons taxonomy",
              "Predictive churn scoring",
              "Reactivation campaigns",
              "Exit survey responses",
              "Churn cost analysis"
      ]}
    />
  );
}
