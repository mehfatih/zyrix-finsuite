import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function JobQueuePage() {
  return (
    <AdminPagePlaceholder
      title="Job Queue"
      icon="⚙"
      cluster="Cluster G · System"
      permission="jobs.manage"
      features={[
              "Background job status per queue",
              "Failed job retry",
              "Job history with payload viewer",
              "Worker scaling controls",
              "Cron schedule overview"
      ]}
    />
  );
}
