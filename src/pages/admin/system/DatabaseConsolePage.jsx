import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function DatabaseConsolePage() {
  return (
    <AdminPagePlaceholder
      title="Database Console"
      icon="🗄"
      cluster="Cluster G · System"
      permission="db.console"
      features={[
              "Read-only SQL by default (super-admin only for writes)",
              "Query history with admin attribution",
              "Saved queries",
              "Result row limit (10K)",
              "Export to CSV"
      ]}
    />
  );
}
