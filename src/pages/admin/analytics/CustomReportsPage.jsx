import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function CustomReportsPage() {
  return (
    <AdminPagePlaceholder
      title="Custom Reports"
      icon="📄"
      cluster="Cluster E · Analytics"
      permission="report.create"
      features={[
              "Drag-drop report builder",
              "30+ data sources",
              "Custom visualizations",
              "Save report templates",
              "Share with team"
      ]}
    />
  );
}
