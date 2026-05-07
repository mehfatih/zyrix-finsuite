import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function WebinarManagerPage() {
  return (
    <AdminPagePlaceholder
      title="Webinar Manager"
      icon="📹"
      cluster="Cluster D · Support"
      permission="webinar.create"
      features={[
              "Schedule webinars (Zoom/Meet integration)",
              "Registration page builder",
              "Email reminders",
              "Recording library",
              "Attendance tracking"
      ]}
    />
  );
}
