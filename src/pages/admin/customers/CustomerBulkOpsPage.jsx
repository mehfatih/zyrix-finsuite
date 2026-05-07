import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function CustomerBulkOpsPage() {
  return (
    <AdminPagePlaceholder
      title="Bulk Operations"
      subtitle="Apply actions to many customers at once. Use the customer list selection + floating bar for everyday bulk actions."
      icon="⚡"
      cluster="Cluster A · Customer Management"
      permission="customer.bulk"
      features={[
        "Bulk tag/untag",
        "Bulk tier change with confirmation",
        "Bulk discount apply",
        "Bulk suspend/activate",
        "Bulk archive",
        "Bulk export to CSV/Excel",
        "Bulk email send (uses Email Campaigns)",
        "Save/load bulk operation templates",
      ]}
    />
  );
}
