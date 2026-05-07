import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function FeatureAdoptionPage() {
  return (
    <AdminPagePlaceholder
      title="Feature Adoption"
      icon="🚀"
      cluster="Cluster E · Analytics"
      permission="analytics.view"
      features={[
              "% of customers using each of 78 features",
              "Adoption velocity curves",
              "Cohort comparison",
              "Drop-off analysis",
              "Champion users per feature"
      ]}
    />
  );
}
