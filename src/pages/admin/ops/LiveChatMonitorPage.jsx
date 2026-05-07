import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function LiveChatMonitorPage() {
  return (
    <AdminPagePlaceholder
      title="Live Chat Monitor"
      icon="💬"
      cluster="Cluster D · Support"
      permission="support.view"
      features={[
              "Real-time active conversations grid",
              "Take over from AI bot",
              "Transfer between agents",
              "Customer typing indicators",
              "Conversation history sidebar"
      ]}
    />
  );
}
