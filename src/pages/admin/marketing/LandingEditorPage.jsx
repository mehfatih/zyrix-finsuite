import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function LandingEditorPage() {
  return (
    <AdminPagePlaceholder
      title="Landing Editor"
      icon="🎨"
      cluster="Cluster H · Marketing"
      permission="marketing.edit"
      features={[
              "Drag-drop landing page builder",
              "Version history with rollback",
              "A/B test landing variants",
              "Conversion goal tracking",
              "Mobile preview"
      ]}
    />
  );
}
