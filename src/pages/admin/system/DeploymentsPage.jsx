import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function DeploymentsPage() {
  return (
    <AdminPagePlaceholder
      title="Deployments"
      icon="🚢"
      cluster="Cluster G · System"
      permission="system.deploy"
      features={[
              "Deployment history with git SHA",
              "Rollback to previous deploy",
              "Per-service deploy status",
              "Canary deploy controls",
              "Pre-deploy checklist"
      ]}
    />
  );
}
