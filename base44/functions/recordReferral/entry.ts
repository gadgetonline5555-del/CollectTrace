import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const referrerId = String(body?.referrerId || "").trim();

    let user: any = null;
    try { user = await base44.auth.me(); } catch { /* not authenticated */ }
    if (!user?.id) return Response.json({ recorded: false, reason: "no_auth" });
    if (!referrerId) return Response.json({ recorded: false, reason: "no_ref" });
    if (referrerId === user.id) return Response.json({ recorded: false, reason: "self" });

    const existing = await base44.asServiceRole.entities.Referral.filter({ referrer_id: referrerId, referred_id: user.id }, "-created_date", 1);
    if (existing.length) return Response.json({ recorded: false, already: true });

    await base44.asServiceRole.entities.Referral.create({ referrer_id: referrerId, referred_id: user.id, status: "active" });
    return Response.json({ recorded: true });
  } catch (error) {
    console.error("recordReferral error:", error?.message || error);
    return Response.json({ error: error?.message || "internal error" }, { status: 500 });
  }
}