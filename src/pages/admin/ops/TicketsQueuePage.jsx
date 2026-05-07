import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function TicketsQueuePage() {
  return (
    <AdminPagePlaceholder
      title="Tickets Queue"
      icon="🎫"
      cluster="Cluster D · Support"
      permission="support.view"
      features={[
              "Sortable by priority/status/age",
              "Filters: unassigned, mine, urgent",
              "Bulk assign to staff",
              "Bulk close",
              "SLA timer per ticket",
              "Reply directly from queue"
      ]}
    />
  );
}
