import { useState, useEffect, useCallback } from "react";

// Behavioral upgrade funnel: counts a user's "value interactions" (Radar views,
// AI research, research reads, glossary lookups) in localStorage. When the count
// crosses thresholds, an UpgradeNudge surfaces a personalized, contextual upgrade
// prompt — endowed-progress behavioral economics that moves free users toward
// paid tiers naturally, without degrading content quality (which stays equal
// across tiers; only access depth is gated).
const KEY = "ct_value_count";
const DISMISS_KEY = "ct_nudge_dismissed_at";
const DISMISS_WINDOW = 24 * 60 * 60 * 1000;

export function useValueMilestones() {
  const [count, setCount] = useState(0);
  const [dismissedAt, setDismissedAt] = useState(0);

  useEffect(() => {
    setCount(Number(localStorage.getItem(KEY) || "0"));
    setDismissedAt(Number(localStorage.getItem(DISMISS_KEY) || "0"));
  }, []);

  const bump = useCallback(() => {
    setCount((c) => {
      const n = c + 1;
      localStorage.setItem(KEY, String(n));
      return n;
    });
  }, []);

  const dismiss = useCallback(() => {
    const now = Date.now();
    localStorage.setItem(DISMISS_KEY, String(now));
    setDismissedAt(now);
  }, []);

  const recentlyDismissed = Date.now() - dismissedAt < DISMISS_WINDOW;
  const tier = count >= 8 ? "pro" : count >= 3 ? "starter" : null;
  const shouldShow = !!tier && !recentlyDismissed;
  const reasonKey = tier === "pro" ? "nudge.reason_pro" : "nudge.reason_starter";

  return { count, bump, dismiss, shouldShow, tier, reasonKey };
}