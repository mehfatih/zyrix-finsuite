import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function AnnouncementsPage() {
  return (
    <AdminPagePlaceholder
      title="In-App Announcements"
      icon="📢"
      cluster="Cluster D · Support"
      permission="announcement.create"
      features={[
              "Create banner/modal/toast announcements",
              "Target by tier/role/feature usage",
              "Schedule + expiry",
              "Per-locale content",
              "Click-through tracking"
      ]}
    />
  );
}
