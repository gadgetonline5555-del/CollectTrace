import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

// Auto-improvement & self-healing engine.
// Audits data freshness across entities, detects staleness/anomalies,
// verifies user-scoped RLS posture, logs a SystemHealth report, and flags
// whether the Radar needs an immediate refresh (the workflow then self-heals).
// mode:"scheduled" runs server-side without a user (service role bypasses RLS).

const STALE_MS = 2 * 60 * 60 * 1000; // 2 hours

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const scheduled = body?.mode === "scheduled";

    const now = Date.now();
    const issues: string[] = [];
    const actions: string[] = [];

    // 1. Radar freshness
    const radarLatest = await base44.asServiceRole.entities.RadarItem.list("-published_at", 1);
    const radarLatestAt = radarLatest[0]?.published_at || null;
    const radarStale = !radarLatestAt || (now - new Date(radarLatestAt).getTime()) > STALE_MS;
    if (radarStale) issues.push("radar_stale");

    // 2. Volume counts via count() — NOT a list cap (which would undercount).
    //    The previous list("-created_date", 200) reported 200 as "total" when
    //    the real Radar count was 3,100+. Use count() for accurate totals.
    const [radarTotal, researchTotal, mangaTotal] = await Promise.all([
      base44.asServiceRole.entities.RadarItem.count({}),
      base44.asServiceRole.entities.Research.count({}),
      base44.asServiceRole.entities.Manga.count({})
    ]);

    if (radarTotal === 0) issues.push("radar_empty");
    if (researchTotal === 0) issues.push("research_empty");

    // 3. Self-heal decision: stale radar -> workflow triggers refreshRadar
    if (radarStale) actions.push("schedule_radar_refresh");

    // 4. Security posture: Portfolio/Watchlist have created_by_id ownership
    //    rules in their entity schema. This audit does NOT perform runtime
    //    RLS verification — it only notes that schema-level rules exist.
    //    Schema presence ≠ runtime enforcement verified. Do not record as "verified".
    actions.push("rls_rules_present_in_schema_not_runtime_verified");

    const report = {
      report_type: "daily_health" as const,
      generated_at: new Date().toISOString(),
      radar_total: radarTotal,
      radar_latest_at: radarLatestAt,
      radar_stale: radarStale,
      research_total: researchTotal,
      manga_total: mangaTotal,
      actions_taken: JSON.stringify(actions),
      issues: JSON.stringify(issues),
      notes: issues.length === 0 ? "all_healthy" : issues.join(",")
    };

    await base44.asServiceRole.entities.SystemHealth.create(report);

    return Response.json({ ...report, scheduled });
  } catch (error) {
    console.error("systemHealthCheck error:", error?.message || error);
    // On error, do NOT signal stale (avoid runaway refresh loops)
    return Response.json({ error: error?.message || "internal error", radar_stale: false }, { status: 500 });
  }
}