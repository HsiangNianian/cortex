"use client";

/**
 * Premium integration seam — client UI layer.
 *
 * Core files import premium-dependent UI/hooks from this module so they stay
 * identical across branches:
 *   - dev branch:  real components (re-exported from ./premium/*)
 *   - main branch: no-op stubs (render nothing, free-only)
 *
 * In main this file is replaced with stubs that render null / return a
 * free-only hook state, and the ./premium/* files are deleted.
 */

export { usePremium } from "./premium/usePremium";
export { PremiumWrapper } from "./premium/PremiumWrapper";
export { CooldownBanner } from "./premium/CooldownBanner";
export { PremiumBadge } from "./premium/PremiumBadge";
export { TrendSection } from "./premium/TrendSection";
export { AIInterpretSection } from "./premium/AIInterpretSection";
export { CrossPromoSuggestions } from "./premium/CrossPromoSuggestions";
export { CommunityBanner } from "./premium/CommunityBanner";
export { AnnouncementDialog } from "./premium/AnnouncementDialog";
export { ManagePremiumLink } from "./premium/ManagePremiumLink";
export { ExportCsvLink } from "./premium/ExportCsvLink";
