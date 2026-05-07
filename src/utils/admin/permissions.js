// ================================================================
// Phase 14 — Admin permission catalog + RBAC helpers.
// Frontend mirror of backend permission strings. SUPER_ADMIN bypasses
// the check. The 98 permissions match the backend seed list 1:1.
// ================================================================

export const PERMISSIONS = {
  // Customer Management
  CUSTOMER_VIEW:        "customer.view",
  CUSTOMER_EDIT:        "customer.edit",
  CUSTOMER_DELETE:      "customer.delete",
  CUSTOMER_ARCHIVE:     "customer.archive",
  CUSTOMER_RESTORE:     "customer.restore",
  CUSTOMER_IMPERSONATE: "customer.impersonate",
  CUSTOMER_BULK:        "customer.bulk",
  // Subscription
  SUBSCRIPTION_VIEW:     "subscription.view",
  SUBSCRIPTION_EDIT:     "subscription.edit",
  SUBSCRIPTION_CANCEL:   "subscription.cancel",
  SUBSCRIPTION_REFUND:   "subscription.refund",
  SUBSCRIPTION_DISCOUNT: "subscription.discount",
  // Plans
  PLAN_VIEW:   "plan.view",
  PLAN_EDIT:   "plan.edit",
  PLAN_CREATE: "plan.create",
  // Coupons
  COUPON_VIEW:   "coupon.view",
  COUPON_CREATE: "coupon.create",
  COUPON_EDIT:   "coupon.edit",
  COUPON_DELETE: "coupon.delete",
  // Revenue
  REVENUE_VIEW:      "revenue.view",
  REVENUE_EXPORT:    "revenue.export",
  REVENUE_FORECAST:  "revenue.forecast",
  INVOICE_CREATE:    "invoice.create",
  DUNNING_CONFIGURE: "dunning.configure",
  // Support
  SUPPORT_VIEW:     "support.view",
  SUPPORT_RESPOND:  "support.respond",
  SUPPORT_ASSIGN:   "support.assign",
  SUPPORT_ESCALATE: "support.escalate",
  MACRO_MANAGE:     "macro.manage",
  KB_EDIT:          "kb.edit",
  // Communications
  CAMPAIGN_VIEW:      "campaign.view",
  CAMPAIGN_CREATE:    "campaign.create",
  CAMPAIGN_SEND:      "campaign.send",
  ANNOUNCEMENT_CREATE:"announcement.create",
  NPS_MANAGE:         "nps.manage",
  // Analytics
  ANALYTICS_VIEW:    "analytics.view",
  ANALYTICS_EXPORT:  "analytics.export",
  ANALYTICS_FUNNEL:  "analytics.funnel",
  ANALYTICS_REPLAY:  "analytics.replay",
  ANALYTICS_HEATMAP: "analytics.heatmap",
  REPORT_CREATE:     "report.create",
  REPORT_SCHEDULE:   "report.schedule",
  DASHBOARD_CREATE:  "dashboard.create",
  // Compliance
  COMPLIANCE_VIEW:    "compliance.view",
  COMPLIANCE_RESPOND: "compliance.respond",
  KVKK_RESPOND:       "kvkk.respond",
  GDPR_RESPOND:       "gdpr.respond",
  AUDIT_VIEW:         "audit.view",
  AUDIT_EXPORT:       "audit.export",
  RETENTION_CONFIGURE:"retention.configure",
  SUBPROCESSOR_MANAGE:"subprocessor.manage",
  // System
  SYSTEM_VIEW:         "system.view",
  SYSTEM_CONFIGURE:    "system.configure",
  SYSTEM_MAINTENANCE:  "system.maintenance",
  SYSTEM_BACKUP:       "system.backup",
  SYSTEM_DEPLOY:       "system.deploy",
  DB_CONSOLE:          "db.console",
  CACHE_MANAGE:        "cache.manage",
  JOBS_MANAGE:         "jobs.manage",
  ALERTS_MANAGE:       "alerts.manage",
  ERRORS_VIEW:         "errors.view",
  FEATURE_FLAG_MANAGE: "feature_flag.manage",
  SECURITY_SCAN:       "security.scan",
  // Marketing
  MARKETING_VIEW:    "marketing.view",
  MARKETING_EDIT:    "marketing.edit",
  REVIEW_MODERATE:   "review.moderate",
  LEAD_MANAGE:       "lead.manage",
  BLOG_PUBLISH:      "blog.publish",
  SEO_EDIT:          "seo.edit",
  AFFILIATE_MANAGE:  "affiliate.manage",
  SOCIAL_SCHEDULE:   "social.schedule",
  // Mali Müşavir
  MUSAVIR_VIEW:       "musavir.view",
  MUSAVIR_EDIT:       "musavir.edit",
  MUSAVIR_ONBOARD:    "musavir.onboard",
  COMMISSION_MANAGE:  "commission.manage",
  TRAINING_PUBLISH:   "training.publish",
  // Admin Management
  ADMIN_VIEW:         "admin.view",
  ADMIN_CREATE:       "admin.create",
  ADMIN_EDIT:         "admin.edit",
  ADMIN_DELETE:       "admin.delete",
  ADMIN_ROLE_ASSIGN:  "admin.role.assign",
  // Audit deep
  AUDIT_REVIEW:             "audit.review",
  AUDIT_PURGE:              "audit.purge",
  AUDIT_SEVERITY_ESCALATE:  "audit.severity.escalate",
  // Webinars
  WEBINAR_CREATE: "webinar.create",
  WEBINAR_HOST:   "webinar.host",
  WEBINAR_DELETE: "webinar.delete",
  STATUS_PUBLISH: "status.publish",
  // Misc
  SETTINGS_VIEW:  "settings.view",
  SETTINGS_EDIT:  "settings.edit",
  TAG_MANAGE:     "tag.manage",
  NOTE_WRITE:     "note.write",
  TIER_OVERRIDE:  "tier.override",
  TRIAL_EXTEND:   "trial.extend",
  MERGE_ACCOUNTS: "merge.accounts",
  RISK_REVIEW:    "risk.review",
  COUPON_BULK:    "coupon.bulk",
  DATA_EXPORT_BULK: "data.export.bulk",
};

export function hasPermission(admin, permission) {
  if (!admin) return false;
  if (admin.role === "SUPER_ADMIN") return true;
  if (Array.isArray(admin.permissions)) {
    if (admin.permissions.includes("*")) return true;
    return admin.permissions.includes(permission);
  }
  return false;
}

export function isSuperAdmin(admin) {
  return admin?.role === "SUPER_ADMIN";
}
