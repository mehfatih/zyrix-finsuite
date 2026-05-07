import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function ErrorMonitoringPage() {
  return (
    <AdminPagePlaceholder
      title="Error Monitoring"
      icon="🚨"
      cluster="Cluster G · System"
      permission="errors.view"
      features={[
              "Sentry-style error feed",
              "Error grouping + frequency",
              "Stack trace viewer",
              "Affected user count per error",
              "Resolve/ignore/snooze workflow"
      ]}
    />
  );
}
