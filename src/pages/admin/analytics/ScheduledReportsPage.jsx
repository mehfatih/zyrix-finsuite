import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function ScheduledReportsPage() {
  return (
    <AdminPagePlaceholder
      title="Scheduled Reports"
      icon="⏰"
      cluster="Cluster E · Analytics"
      permission="report.schedule"
      features={[
              "Weekly/monthly auto-email reports",
              "Per-recipient customization",
              "PDF/CSV/Excel attachments",
              "Failure notification"
      ]}
    />
  );
}
