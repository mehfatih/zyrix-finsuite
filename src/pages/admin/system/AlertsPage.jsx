import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function AlertsPage() {
  return (
    <AdminPagePlaceholder
      title="Alerts"
      icon="🔔"
      cluster="Cluster G · System"
      permission="alerts.manage"
      features={[
              "Alert rule builder",
              "Severity classification",
              "PagerDuty/Slack/email routing",
              "On-call schedule",
              "Alert acknowledgement workflow"
      ]}
    />
  );
}
