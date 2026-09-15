import { base44 } from "@/api/base44Client";

// Fire-and-forget activity tracking for operator insights.
// Never blocks UI; silently ignored if the user is unauthenticated or the write fails.
export function track(event_type, props = {}) {
  try {
    const lang = (typeof localStorage !== "undefined" && localStorage.getItem("ct_lang")) || null;
    base44.entities.UserActivity.create({
      event_type,
      target_id: props.target_id || null,
      target_type: props.target_type || null,
      title: props.title || null,
      category: props.category || null,
      keyword: props.keyword || null,
      ticker: props.ticker || null,
      content_tier: props.content_tier || null,
      language: props.language || lang
    }).catch(() => {});
  } catch (e) {
    /* ignore */
  }
}