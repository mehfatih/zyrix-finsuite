import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function EmailSequencesPage() {
  return (
    <AdminPagePlaceholder
      title="Email Sequences"
      icon="🔄"
      cluster="Cluster H · Marketing"
      permission="campaign.create"
      features={[
              "Drip campaign builder",
              "Conditional branching",
              "Wait steps + delay",
              "Goal tracking",
              "Open/click rate per step"
      ]}
    />
  );
}
