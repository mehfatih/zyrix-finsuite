import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function OnboardingWorkflowPage() {
  return (
    <AdminPagePlaceholder
      title="Onboarding Workflow"
      icon="🚀"
      cluster="Cluster I · Mali Müşavir"
      permission="musavir.onboard"
      features={[
              "7-step onboarding (signup → docs → training → first client)",
              "Progress tracking per partner",
              "Auto-reminders for stalled steps",
              "Onboarding completion report"
      ]}
    />
  );
}
