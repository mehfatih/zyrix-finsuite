import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function ABTestingPage() {
  return (
    <AdminPagePlaceholder
      title="A/B Testing"
      icon="🆎"
      cluster="Cluster C · Plans"
      permission="plan.edit"
      features={[
              "A/B test pricing variants",
              "Traffic split percentage",
              "Conversion tracking per variant",
              "Statistical significance calculation",
              "Auto-promote winner after threshold"
      ]}
    />
  );
}
