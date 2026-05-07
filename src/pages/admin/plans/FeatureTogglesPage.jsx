import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function FeatureTogglesPage() {
  return (
    <AdminPagePlaceholder
      title="Feature Toggles"
      icon="🎚"
      cluster="Cluster C · Plans"
      permission="plan.edit"
      features={[
              "98+ feature flags per tier",
              "Bulk toggle by category",
              "Add-on bundles",
              "Grandfathered customer overrides",
              "Preview tier changes before publish"
      ]}
    />
  );
}
