import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function KnowledgeBaseEditorPage() {
  return (
    <AdminPagePlaceholder
      title="Knowledge Base Editor"
      icon="📚"
      cluster="Cluster D · Support"
      permission="kb.edit"
      features={[
              "Article CRUD with markdown editor",
              "Trilingual content (TR/EN/AR)",
              "Category management",
              "Helpful/not-helpful analytics",
              "AI-suggested article writing"
      ]}
    />
  );
}
