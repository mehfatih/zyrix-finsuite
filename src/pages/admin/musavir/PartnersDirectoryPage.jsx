import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function PartnersDirectoryPage() {
  return (
    <AdminPagePlaceholder
      title="Partners Directory"
      icon="🤝"
      cluster="Cluster I · Mali Müşavir"
      permission="musavir.view"
      features={[
              "List of Mali Müşavir partners",
              "Profile per partner (firm/contact/region)",
              "Searchable + filterable",
              "Per-partner client count",
              "Activate/deactivate"
      ]}
    />
  );
}
