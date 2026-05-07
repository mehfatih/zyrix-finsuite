import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function TrainingMaterialsPage() {
  return (
    <AdminPagePlaceholder
      title="Training Materials"
      icon="🎓"
      cluster="Cluster I · Mali Müşavir"
      permission="training.publish"
      features={[
              "Training video library",
              "Quiz creation",
              "Certification tracker",
              "New-feature briefings",
              "Trilingual content"
      ]}
    />
  );
}
