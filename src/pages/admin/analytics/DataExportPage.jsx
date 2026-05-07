import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function DataExportPage() {
  return (
    <AdminPagePlaceholder
      title="Data Export Center"
      icon="📤"
      cluster="Cluster E · Analytics"
      permission="analytics.export"
      features={[
              "Bulk export any entity to CSV/Excel/JSON",
              "Date range filter",
              "Field selection",
              "Async generation for large datasets",
              "Email when ready"
      ]}
    />
  );
}
