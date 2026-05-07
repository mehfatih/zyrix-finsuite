// ================================================================
// Phase 12 — Feature flags by subscription tier.
// Single source of truth for which features each tier unlocks.
// Tiers map to pricing (Lite / Pro / Business / Enterprise).
// ================================================================

export const TIERS = ["lite", "pro", "business", "enterprise"];

// Each flag lists the LOWEST tier that can use it. All higher tiers inherit.
const FLAGS = {
  // Phase 6 autopilots
  invoiceAutopilot:        "pro",
  reconciliationAutopilot: "pro",
  whatsappAgent:           "pro",
  multiChannelInbox:       "business",
  documentVault:           "pro",

  // Phase 7 intelligence
  hiddenCash:              "pro",
  dailyBriefing:           "pro",
  monthlyReport:           "business",
  smartPricing:            "business",
  discountOptimizer:       "business",

  // Phase 8 predictive
  businessDeathPredictor:  "business",
  customerDna:             "business",
  churnPrediction:         "pro",
  timeLoopSimulator:       "business",
  inventoryForecast:       "pro",
  cashflowStressTest:      "business",

  // Phase 9 cognitive
  negotiationCoach:        "enterprise",
  decisionManager:         "business",
  wellnessIndex:           "pro",
  futureSelf:              "enterprise",
  predictiveCalendar:      "business",
  arStorefront:            "enterprise",
  arReceipt:               "pro",
  fraudDetection:          "business",

  // Phase 10 voice + CX
  voiceMode:               "pro",
  customerPortals:         "pro",
  paymentNudgeAI:          "pro",
  loyaltyAI:               "business",
  birthdayMarketing:       "pro",
  reviewOptimizer:         "pro",
  emailMarketing:          "lite",
  campaigns:               "pro",

  // Phase 11 ecosystem
  coFounderMode:           "enterprise",
  zyrixTwin:               "business",
  b2bMarketplace:          "business",
  zyrixCapital:            "business",
  insuranceMarketplace:    "pro",
  zyrixUniversity:         "lite",
  networkIntelligence:     "business",
  supplierHealth:          "pro",
  openBankingAI:           "business",
  influencerTracking:      "pro",
};

export function tierRank(tier) {
  return TIERS.indexOf(String(tier || "lite").toLowerCase());
}

export function hasFeature(flag, userTier) {
  const required = FLAGS[flag];
  if (!required) return true; // unknown flag → allow (fail open)
  return tierRank(userTier) >= tierRank(required);
}

export function userTier(user) {
  // Pull tier from the auth user object — falls back to lite.
  return String(user?.tier || user?.subscription?.tier || "lite").toLowerCase();
}

// React hook helper
import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";

export function useFeatureFlag(flag) {
  const { user } = useAuth();
  return useMemo(() => hasFeature(flag, userTier(user)), [flag, user]);
}

export function useTier() {
  const { user } = useAuth();
  return userTier(user);
}

export default FLAGS;
