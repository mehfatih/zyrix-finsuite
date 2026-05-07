import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function AddonsPage() {
  return (
    <AdminPagePlaceholder
      title="Add-ons Management"
      icon="➕"
      cluster="Cluster C · Plans"
      permission="plan.edit"
      features={[
              "Extra users",
              "Extra storage",
              "Premium AI features pack",
              "Per-tier add-on availability",
              "Volume pricing"
      ]}
    />
  );
}
