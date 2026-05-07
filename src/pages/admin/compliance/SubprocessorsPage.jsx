import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function SubprocessorsPage() {
  return (
    <AdminPagePlaceholder
      title="Subprocessors"
      icon="🤝"
      cluster="Cluster F · Compliance"
      permission="subprocessor.manage"
      features={[
              "List of third-party data processors (AWS/Resend/Iyzico/etc.)",
              "Per-processor DPA links",
              "Customer notification for new processor",
              "Audit trail of processor changes"
      ]}
    />
  );
}
