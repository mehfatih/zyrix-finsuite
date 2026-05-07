import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function StatusPageEditorPage() {
  return (
    <AdminPagePlaceholder
      title="Status Page Editor"
      icon="🟢"
      cluster="Cluster D · Support"
      permission="status.publish"
      features={[
              "Public status page (status.zyrix.co)",
              "Component status (API/Dashboard/Auth/Email)",
              "Incident posting workflow",
              "Subscriber notifications",
              "Historical uptime chart"
      ]}
    />
  );
}
