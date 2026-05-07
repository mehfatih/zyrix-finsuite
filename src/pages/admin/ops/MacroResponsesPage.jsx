import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function MacroResponsesPage() {
  return (
    <AdminPagePlaceholder
      title="Macro Responses"
      icon="📋"
      cluster="Cluster D · Support"
      permission="macro.manage"
      features={[
              "Saved replies for common issues",
              "Variable substitution {customer.name}",
              "Per-category organization",
              "Usage analytics",
              "Trilingual variants"
      ]}
    />
  );
}
