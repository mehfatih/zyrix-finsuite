import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function PlansEditorPage() {
  return (
    <AdminPagePlaceholder
      title="Plans Editor"
      icon="💎"
      cluster="Cluster C · Plans"
      permission="plan.edit"
      features={[
              "7 tiers: Free, Lite, Pro, Business, Enterprise, Lifetime, Custom",
              "Per-tier feature toggles + limits",
              "Pricing in TRY/USD/EUR/SAR",
              "Annual discount config",
              "Trial duration override",
              "Publish/unpublish workflow"
      ]}
    />
  );
}
