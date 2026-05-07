import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function BackupsPage() {
  return (
    <AdminPagePlaceholder
      title="Backups"
      icon="💾"
      cluster="Cluster G · System"
      permission="system.backup"
      features={[
              "Backup status (last full/incremental)",
              "Manual trigger button",
              "Restore drill scheduler",
              "Per-table backup verification",
              "Geo-replication status"
      ]}
    />
  );
}
