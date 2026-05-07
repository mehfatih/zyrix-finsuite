import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function AccountantBroadcastPage() {
  return (
    <AdminPagePlaceholder
      title="Broadcast"
      icon="📡"
      cluster="Cluster I · Mali Müşavir"
      permission="musavir.edit"
      features={[
              "Email/WhatsApp broadcast to all partners",
              "Segment by region/tier/training-completion",
              "Schedule send",
              "Open + click tracking"
      ]}
    />
  );
}
