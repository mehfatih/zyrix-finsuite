// Generates AdminPagePlaceholder scaffolds for the remaining ~50 admin pages.
// Run from project root: node scripts/gen-admin-scaffolds.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const SPECS = [
  // Cluster B (8 — RevenueDashboard already deep)
  { dir: "revenue", file: "SubscriptionsPage",     title: "Subscriptions",         icon: "🔁",  cluster: "Cluster B · Revenue", perm: "subscription.view", features: ["All subscriptions list", "Status filter (active/past_due/canceled)", "Tier change with proration", "Schedule cancellation at period end", "View payment method on file", "Attach discount/credit"] },
  { dir: "revenue", file: "FailedPaymentsPage",    title: "Failed Payments",       icon: "⚠",   cluster: "Cluster B · Revenue", perm: "subscription.view", features: ["Queue of failed charges", "Retry now button", "Dunning email status per attempt", "Customer contact actions", "Write-off option for unrecoverable", "Sync with Iyzico/Stripe"] },
  { dir: "revenue", file: "CouponsPage",           title: "Coupons & Promotions",  icon: "🎟",   cluster: "Cluster B · Revenue", perm: "coupon.view", features: ["Coupon CRUD", "Percentage / fixed / free-month types", "Tier targeting", "Max-redemptions cap", "Expiry date", "New-customers-only flag", "Redemption history per coupon"] },
  { dir: "revenue", file: "CohortAnalysisPage",    title: "Cohort Analysis",       icon: "📐",  cluster: "Cluster B · Revenue", perm: "revenue.view", features: ["Acquisition cohorts heatmap", "Retention curves", "Revenue per cohort", "LTV by cohort", "Segment by tier/country/source", "Export cohort to CSV"] },
  { dir: "revenue", file: "RefundsPage",           title: "Refunds",               icon: "↩",   cluster: "Cluster B · Revenue", perm: "subscription.refund", features: ["Issue partial or full refund", "Reason picker (KVKK/GDPR/dispute/goodwill)", "Auto credit-note generation", "Sync to Iyzico/Stripe", "Refund history with admin attribution"] },
  { dir: "revenue", file: "ManualInvoicePage",     title: "Manual Invoice",        icon: "🧾",  cluster: "Cluster B · Revenue", perm: "invoice.create", features: ["Create off-cycle invoice for enterprise deals", "Line items + VAT + due date", "Multi-currency support", "Auto-send to customer email", "Mark as paid / sent / overdue"] },
  { dir: "revenue", file: "DunningRulesPage",      title: "Dunning Rules",         icon: "📨",  cluster: "Cluster B · Revenue", perm: "dunning.configure", features: ["Retry schedule (e.g. 1d, 3d, 7d, 14d)", "Email template per attempt", "Auto-suspend on N failures", "Per-tier overrides", "Test rule with sample customer"] },
  { dir: "revenue", file: "RevenueForecastPage",   title: "Revenue Forecast",      icon: "🔮",  cluster: "Cluster B · Revenue", perm: "revenue.forecast", features: ["90-day MRR projection", "Multiple scenarios (conservative/base/aggressive)", "Per-cohort modeling", "Sensitivity sliders for churn + new MRR", "Export forecast to PDF for board"] },

  // Cluster C (6)
  { dir: "plans", file: "PlansEditorPage",         title: "Plans Editor",          icon: "💎",  cluster: "Cluster C · Plans", perm: "plan.edit",   features: ["7 tiers: Free, Lite, Pro, Business, Enterprise, Lifetime, Custom", "Per-tier feature toggles + limits", "Pricing in TRY/USD/EUR/SAR", "Annual discount config", "Trial duration override", "Publish/unpublish workflow"] },
  { dir: "plans", file: "FeatureTogglesPage",      title: "Feature Toggles",       icon: "🎚",  cluster: "Cluster C · Plans", perm: "plan.edit",   features: ["98+ feature flags per tier", "Bulk toggle by category", "Add-on bundles", "Grandfathered customer overrides", "Preview tier changes before publish"] },
  { dir: "plans", file: "ABTestingPage",           title: "A/B Testing",           icon: "🆎",  cluster: "Cluster C · Plans", perm: "plan.edit",   features: ["A/B test pricing variants", "Traffic split percentage", "Conversion tracking per variant", "Statistical significance calculation", "Auto-promote winner after threshold"] },
  { dir: "plans", file: "CustomQuotesPage",        title: "Custom Quotes",         icon: "📝",  cluster: "Cluster C · Plans", perm: "plan.create", features: ["Build enterprise quote with custom line items", "Auto-PDF generation with branding", "Send via email + DocuSign integration", "Quote expiration", "Convert quote to active subscription"] },
  { dir: "plans", file: "AddonsPage",              title: "Add-ons Management",    icon: "➕",  cluster: "Cluster C · Plans", perm: "plan.edit",   features: ["Extra users", "Extra storage", "Premium AI features pack", "Per-tier add-on availability", "Volume pricing"] },
  { dir: "plans", file: "PricingHistoryPage",      title: "Pricing History",       icon: "🕘",  cluster: "Cluster C · Plans", perm: "plan.view",   features: ["Audit trail of every pricing change", "Grandfathered customer report", "Diff viewer between two snapshots", "Rollback to previous pricing"] },

  // Cluster D (10)
  { dir: "ops", file: "TicketsQueuePage",          title: "Tickets Queue",         icon: "🎫",  cluster: "Cluster D · Support", perm: "support.view",     features: ["Sortable by priority/status/age", "Filters: unassigned, mine, urgent", "Bulk assign to staff", "Bulk close", "SLA timer per ticket", "Reply directly from queue"] },
  { dir: "ops", file: "LiveChatMonitorPage",       title: "Live Chat Monitor",     icon: "💬",  cluster: "Cluster D · Support", perm: "support.view",     features: ["Real-time active conversations grid", "Take over from AI bot", "Transfer between agents", "Customer typing indicators", "Conversation history sidebar"] },
  { dir: "ops", file: "EmailCampaignsPage",        title: "Email Campaigns",       icon: "📣",  cluster: "Cluster D · Support", perm: "campaign.view",    features: ["Drag-drop email builder", "Audience segmentation", "A/B subject lines", "Schedule send", "Open + click tracking", "Unsubscribe management"] },
  { dir: "ops", file: "AnnouncementsPage",         title: "In-App Announcements",  icon: "📢",  cluster: "Cluster D · Support", perm: "announcement.create", features: ["Create banner/modal/toast announcements", "Target by tier/role/feature usage", "Schedule + expiry", "Per-locale content", "Click-through tracking"] },
  { dir: "ops", file: "KnowledgeBaseEditorPage",   title: "Knowledge Base Editor", icon: "📚",  cluster: "Cluster D · Support", perm: "kb.edit",          features: ["Article CRUD with markdown editor", "Trilingual content (TR/EN/AR)", "Category management", "Helpful/not-helpful analytics", "AI-suggested article writing"] },
  { dir: "ops", file: "MacroResponsesPage",        title: "Macro Responses",       icon: "📋",  cluster: "Cluster D · Support", perm: "macro.manage",     features: ["Saved replies for common issues", "Variable substitution {customer.name}", "Per-category organization", "Usage analytics", "Trilingual variants"] },
  { dir: "ops", file: "EscalationRulesPage",       title: "Escalation Rules",     icon: "⤴",   cluster: "Cluster D · Support", perm: "support.escalate", features: ["Auto-escalate by SLA breach", "Auto-escalate by customer tier (Enterprise > 30 min)", "Round-robin staff assignment", "Override rules per customer flag"] },
  { dir: "ops", file: "NPSSurveysPage",            title: "NPS Surveys",          icon: "⭐",   cluster: "Cluster D · Support", perm: "nps.manage",       features: ["NPS campaign creation", "Trigger rules (after invoice paid, after 30 days, etc.)", "Score distribution chart", "Detractor follow-up workflow", "Export responses"] },
  { dir: "ops", file: "WebinarManagerPage",        title: "Webinar Manager",       icon: "📹",  cluster: "Cluster D · Support", perm: "webinar.create",   features: ["Schedule webinars (Zoom/Meet integration)", "Registration page builder", "Email reminders", "Recording library", "Attendance tracking"] },
  { dir: "ops", file: "StatusPageEditorPage",      title: "Status Page Editor",    icon: "🟢",  cluster: "Cluster D · Support", perm: "status.publish",   features: ["Public status page (status.zyrix.co)", "Component status (API/Dashboard/Auth/Email)", "Incident posting workflow", "Subscriber notifications", "Historical uptime chart"] },

  // Cluster E (11)
  { dir: "analytics", file: "ProductAnalyticsPage", title: "Product Analytics",    icon: "📊",  cluster: "Cluster E · Analytics", perm: "analytics.view",    features: ["Feature usage heatmap", "Most/least used features", "User flow diagram", "Adoption rate per feature", "Time-to-first-action"] },
  { dir: "analytics", file: "FeatureAdoptionPage",  title: "Feature Adoption",     icon: "🚀",  cluster: "Cluster E · Analytics", perm: "analytics.view",    features: ["% of customers using each of 78 features", "Adoption velocity curves", "Cohort comparison", "Drop-off analysis", "Champion users per feature"] },
  { dir: "analytics", file: "ChurnAnalysisPage",    title: "Churn Analysis",       icon: "📉",  cluster: "Cluster E · Analytics", perm: "analytics.view",    features: ["Churn reasons taxonomy", "Predictive churn scoring", "Reactivation campaigns", "Exit survey responses", "Churn cost analysis"] },
  { dir: "analytics", file: "PowerUsersPage",       title: "Power Users",          icon: "💪",  cluster: "Cluster E · Analytics", perm: "analytics.view",    features: ["Top 5% by feature usage", "Top 5% by API calls", "Top 5% by login frequency", "Champion identification for case studies", "Outreach automation"] },
  { dir: "analytics", file: "FunnelAnalysisPage",   title: "Funnel Analysis",      icon: "🪣",  cluster: "Cluster E · Analytics", perm: "analytics.funnel",  features: ["Build custom funnel from event sequence", "Drop-off at each step", "Time-to-convert", "Segment funnels by tier/country", "Compare two funnels side-by-side"] },
  { dir: "analytics", file: "SessionReplaysPage",   title: "Session Replays",      icon: "🎥",  cluster: "Cluster E · Analytics", perm: "analytics.replay",  features: ["Replay specific user sessions", "Privacy-preserving (PII redacted)", "Filter by errors/rage clicks", "Bookmark + share replays", "Heatmap overlay"] },
  { dir: "analytics", file: "HeatmapsPage",         title: "Heatmaps",             icon: "🔥",  cluster: "Cluster E · Analytics", perm: "analytics.heatmap", features: ["Click heatmap per page", "Scroll depth heatmap", "Mouse-move heatmap", "Per-device segmentation", "Time-range filter"] },
  { dir: "analytics", file: "CustomReportsPage",    title: "Custom Reports",       icon: "📄",  cluster: "Cluster E · Analytics", perm: "report.create",     features: ["Drag-drop report builder", "30+ data sources", "Custom visualizations", "Save report templates", "Share with team"] },
  { dir: "analytics", file: "ScheduledReportsPage", title: "Scheduled Reports",    icon: "⏰",  cluster: "Cluster E · Analytics", perm: "report.schedule",   features: ["Weekly/monthly auto-email reports", "Per-recipient customization", "PDF/CSV/Excel attachments", "Failure notification"] },
  { dir: "analytics", file: "RealtimeActivityPage", title: "Realtime Activity",    icon: "🟢",  cluster: "Cluster E · Analytics", perm: "analytics.view",    features: ["See who's online right now", "Active page per user", "Live session count", "Geographic activity map"] },
  { dir: "analytics", file: "DataExportPage",       title: "Data Export Center",   icon: "📤",  cluster: "Cluster E · Analytics", perm: "analytics.export",  features: ["Bulk export any entity to CSV/Excel/JSON", "Date range filter", "Field selection", "Async generation for large datasets", "Email when ready"] },

  // Cluster F (8 — AuditLog deep)
  { dir: "compliance", file: "KVKKRequestsPage",        title: "KVKK Requests",          icon: "🇹🇷",  cluster: "Cluster F · Compliance", perm: "kvkk.respond",          features: ["Inbox of KVKK requests (access/correct/delete)", "30-day SLA timer per request", "Generate compliance-grade PDF response", "Request history per customer", "Auto-route to correct admin role"] },
  { dir: "compliance", file: "GDPRRequestsPage",        title: "GDPR Requests",          icon: "🇪🇺",  cluster: "Cluster F · Compliance", perm: "gdpr.respond",          features: ["GDPR Art. 15 (access), 16 (rectify), 17 (erasure), 20 (portability)", "30-day SLA per article", "PDF + JSON export bundle", "EU representative attestation"] },
  { dir: "compliance", file: "AccessControlPage",       title: "Access Control (RBAC)",  icon: "🔑",  cluster: "Cluster F · Compliance", perm: "admin.view",            features: ["Admin user list + roles", "Per-permission grant/revoke", "Role templates (FINANCE/SUPPORT/etc.)", "Audit trail of permission changes", "Periodic access review reminders"] },
  { dir: "compliance", file: "ComplianceReportsPage",   title: "Compliance Reports",     icon: "📋",  cluster: "Cluster F · Compliance", perm: "audit.export",          features: ["KVKK annual compliance report PDF", "GDPR Art. 30 records of processing", "SOC 2 evidence collection", "ISO 27001 control evidence", "Auto-fill auditor questionnaires"] },
  { dir: "compliance", file: "DataRetentionPage",       title: "Data Retention",         icon: "⏳",  cluster: "Cluster F · Compliance", perm: "retention.configure",   features: ["Per-resource retention policy", "Auto-purge cron status", "Legal hold (suspend purge for ongoing case)", "Retention audit log"] },
  { dir: "compliance", file: "SubprocessorsPage",       title: "Subprocessors",          icon: "🤝",  cluster: "Cluster F · Compliance", perm: "subprocessor.manage",   features: ["List of third-party data processors (AWS/Resend/Iyzico/etc.)", "Per-processor DPA links", "Customer notification for new processor", "Audit trail of processor changes"] },
  { dir: "compliance", file: "RightToBeForgottenPage",  title: "Right to Be Forgotten",  icon: "🗑",   cluster: "Cluster F · Compliance", perm: "gdpr.respond",          features: ["GDPR Art. 17 fully automated workflow", "Multi-system data location finder", "Cascading deletion chain", "Verification email to requester", "Compliance attestation generated"] },

  // Cluster G (12 — none deep)
  { dir: "system", file: "SystemHealthPage",       title: "System Health",          icon: "❤️",  cluster: "Cluster G · System", perm: "system.view",         features: ["Service status grid (API/DB/Cache/Email/Storage)", "Latency p50/p95/p99 per service", "Error rate sparklines", "Active alert count", "Uptime SLA percentage"] },
  { dir: "system", file: "ErrorMonitoringPage",    title: "Error Monitoring",       icon: "🚨",  cluster: "Cluster G · System", perm: "errors.view",         features: ["Sentry-style error feed", "Error grouping + frequency", "Stack trace viewer", "Affected user count per error", "Resolve/ignore/snooze workflow"] },
  { dir: "system", file: "AlertsPage",             title: "Alerts",                 icon: "🔔",  cluster: "Cluster G · System", perm: "alerts.manage",       features: ["Alert rule builder", "Severity classification", "PagerDuty/Slack/email routing", "On-call schedule", "Alert acknowledgement workflow"] },
  { dir: "system", file: "BackupsPage",            title: "Backups",                icon: "💾",  cluster: "Cluster G · System", perm: "system.backup",       features: ["Backup status (last full/incremental)", "Manual trigger button", "Restore drill scheduler", "Per-table backup verification", "Geo-replication status"] },
  { dir: "system", file: "APIUsagePage",           title: "API Usage",              icon: "🔌",  cluster: "Cluster G · System", perm: "system.view",         features: ["Per-customer API call volume", "Rate limit status", "Throttled requests count", "Slowest endpoints", "API key management"] },
  { dir: "system", file: "DatabaseConsolePage",    title: "Database Console",       icon: "🗄",   cluster: "Cluster G · System", perm: "db.console",          features: ["Read-only SQL by default (super-admin only for writes)", "Query history with admin attribution", "Saved queries", "Result row limit (10K)", "Export to CSV"] },
  { dir: "system", file: "CacheManagementPage",    title: "Cache Management",       icon: "♻",   cluster: "Cluster G · System", perm: "cache.manage",        features: ["Cache hit ratio per service", "Manual flush per cache key pattern", "Cache size + memory usage", "TTL configuration", "Cache warm-up triggers"] },
  { dir: "system", file: "JobQueuePage",           title: "Job Queue",              icon: "⚙",   cluster: "Cluster G · System", perm: "jobs.manage",         features: ["Background job status per queue", "Failed job retry", "Job history with payload viewer", "Worker scaling controls", "Cron schedule overview"] },
  { dir: "system", file: "DeploymentsPage",        title: "Deployments",            icon: "🚢",  cluster: "Cluster G · System", perm: "system.deploy",       features: ["Deployment history with git SHA", "Rollback to previous deploy", "Per-service deploy status", "Canary deploy controls", "Pre-deploy checklist"] },
  { dir: "system", file: "FeatureFlagsPage",       title: "Feature Flags",          icon: "🚩",  cluster: "Cluster G · System", perm: "feature_flag.manage", features: ["Runtime feature toggle", "% rollout slider", "Target by user/company/tier", "A/B variant assignment", "Audit trail of flag changes"] },
  { dir: "system", file: "MaintenancePage",        title: "Maintenance Mode",       icon: "🔧",  cluster: "Cluster G · System", perm: "system.maintenance",  features: ["Schedule maintenance window", "Customer-facing banner", "Read-only mode (no writes)", "Allowlist for staff access", "Auto-disable at end time"] },
  { dir: "system", file: "SecurityScannerPage",    title: "Security Scanner",       icon: "🛡",   cluster: "Cluster G · System", perm: "security.scan",       features: ["Auto vulnerability scan (npm audit + Snyk)", "Dependency upgrade suggestions", "OWASP Top 10 check", "Security headers verification", "TLS certificate expiry"] },

  // Cluster H (10)
  { dir: "marketing", file: "ReviewsManagerPage",      title: "Reviews Manager",       icon: "⭐",   cluster: "Cluster H · Marketing", perm: "review.moderate",   features: ["Inbox of all customer reviews", "Approve/reject for public display", "Reply to reviews", "Auto-translate to TR/EN/AR", "Schema.org markup for SEO"] },
  { dir: "marketing", file: "LandingEditorPage",       title: "Landing Editor",        icon: "🎨",  cluster: "Cluster H · Marketing", perm: "marketing.edit",    features: ["Drag-drop landing page builder", "Version history with rollback", "A/B test landing variants", "Conversion goal tracking", "Mobile preview"] },
  { dir: "marketing", file: "ConversionAnalyticsPage", title: "Conversion Analytics", icon: "📈",  cluster: "Cluster H · Marketing", perm: "marketing.view",    features: ["Funnel from visit to paid", "Source attribution (GA, ads, organic)", "Per-page conversion rate", "Heatmap overlay on landing pages"] },
  { dir: "marketing", file: "LeadsPage",                title: "Leads",                 icon: "🪝",  cluster: "Cluster H · Marketing", perm: "lead.manage",       features: ["Lead inbox with source tracking", "Lead scoring", "Manual disposition (qualified/disqualified)", "Auto-assign to sales rep", "Sync to CRM"] },
  { dir: "marketing", file: "SEOManagerPage",           title: "SEO Manager",           icon: "🔍",  cluster: "Cluster H · Marketing", perm: "seo.edit",          features: ["Per-page meta tag editor", "Sitemap.xml regeneration", "Robots.txt config", "Schema.org structured data builder", "Search console integration"] },
  { dir: "marketing", file: "BlogCMSPage",              title: "Blog CMS",              icon: "📝",  cluster: "Cluster H · Marketing", perm: "blog.publish",      features: ["Rich text editor", "Per-post SEO meta", "Draft/scheduled/published states", "Author management", "Category + tag system", "RSS feed"] },
  { dir: "marketing", file: "AffiliatesPage",           title: "Affiliates",            icon: "🤝",  cluster: "Cluster H · Marketing", perm: "affiliate.manage",  features: ["Affiliate signup workflow", "Per-affiliate referral link", "Commission tracking", "Payout management", "Affiliate dashboard preview"] },
  { dir: "marketing", file: "ReferralsPage",            title: "Referrals",             icon: "🔗",  cluster: "Cluster H · Marketing", perm: "marketing.view",    features: ["Customer-to-customer referral program", "Reward configuration (% credit/free month/cash)", "Conversion tracking", "Top referrers leaderboard"] },
  { dir: "marketing", file: "SocialSchedulerPage",      title: "Social Scheduler",      icon: "📱",  cluster: "Cluster H · Marketing", perm: "social.schedule",   features: ["Schedule posts to Instagram/Twitter/LinkedIn", "Calendar view", "Per-platform variants", "Hashtag research", "Engagement analytics"] },
  { dir: "marketing", file: "EmailSequencesPage",       title: "Email Sequences",       icon: "🔄",  cluster: "Cluster H · Marketing", perm: "campaign.create",   features: ["Drip campaign builder", "Conditional branching", "Wait steps + delay", "Goal tracking", "Open/click rate per step"] },

  // Cluster I (7)
  { dir: "musavir", file: "PartnersDirectoryPage",    title: "Partners Directory",   icon: "🤝",  cluster: "Cluster I · Mali Müşavir", perm: "musavir.view",       features: ["List of Mali Müşavir partners", "Profile per partner (firm/contact/region)", "Searchable + filterable", "Per-partner client count", "Activate/deactivate"] },
  { dir: "musavir", file: "CommissionsPage",          title: "Commissions",          icon: "💵",  cluster: "Cluster I · Mali Müşavir", perm: "commission.manage",  features: ["Commission rate per tier", "Monthly commission report per partner", "Payout scheduling", "Tax form generation (1099/Stopaj)", "Commission history"] },
  { dir: "musavir", file: "AccountantReferralsPage",  title: "Accountant Referrals", icon: "🔗",  cluster: "Cluster I · Mali Müşavir", perm: "musavir.view",       features: ["Accountant referral link generator", "Per-referral conversion tracking", "Custom landing page per accountant", "Top performers"] },
  { dir: "musavir", file: "OnboardingWorkflowPage",   title: "Onboarding Workflow",  icon: "🚀",  cluster: "Cluster I · Mali Müşavir", perm: "musavir.onboard",    features: ["7-step onboarding (signup → docs → training → first client)", "Progress tracking per partner", "Auto-reminders for stalled steps", "Onboarding completion report"] },
  { dir: "musavir", file: "AccountantMetricsPage",    title: "Accountant Metrics",   icon: "📊",  cluster: "Cluster I · Mali Müşavir", perm: "musavir.view",       features: ["Per-partner client count", "Average client retention by partner", "Partner NPS", "Top partners leaderboard"] },
  { dir: "musavir", file: "TrainingMaterialsPage",    title: "Training Materials",   icon: "🎓",  cluster: "Cluster I · Mali Müşavir", perm: "training.publish",   features: ["Training video library", "Quiz creation", "Certification tracker", "New-feature briefings", "Trilingual content"] },
  { dir: "musavir", file: "AccountantBroadcastPage",  title: "Broadcast",            icon: "📡",  cluster: "Cluster I · Mali Müşavir", perm: "musavir.edit",       features: ["Email/WhatsApp broadcast to all partners", "Segment by region/tier/training-completion", "Schedule send", "Open + click tracking"] },
];

const TPL = ({ name, title, icon, cluster, perm, features }) => `import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function ${name}() {
  return (
    <AdminPagePlaceholder
      title="${title}"
      icon="${icon}"
      cluster="${cluster}"
      permission="${perm}"
      features={${JSON.stringify(features, null, 8).replace(/^/gm, "      ").trimStart()}}
    />
  );
}
`;

const ROOT = "src/pages/admin";
let count = 0;

for (const s of SPECS) {
  const path = join(ROOT, s.dir, `${s.file}.jsx`);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, TPL({ name: s.file, title: s.title, icon: s.icon, cluster: s.cluster, perm: s.perm, features: s.features }), "utf8");
  count++;
}

console.log(`Generated ${count} scaffold pages.`);
