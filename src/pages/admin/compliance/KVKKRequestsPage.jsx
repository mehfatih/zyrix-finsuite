import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function KVKKRequestsPage() {
  return (
    <AdminPagePlaceholder
      title="KVKK Requests"
      icon="🇹🇷"
      cluster="Cluster F · Compliance"
      permission="kvkk.respond"
      features={[
              "Inbox of KVKK requests (access/correct/delete)",
              "30-day SLA timer per request",
              "Generate compliance-grade PDF response",
              "Request history per customer",
              "Auto-route to correct admin role"
      ]}
    />
  );
}
