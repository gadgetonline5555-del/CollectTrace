import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    let user: any = null;
    try { user = await base44.auth.me(); } catch { /* anonymous */ }
    if (!user?.id) return Response.json({ count: 0, bonus: 0, authenticated: false });

    const refs = await base44.asServiceRole.entities.Referral.filter({ referrer_id: user.id }, "-created_date", 500);
    const count = refs.length;
    const bonus = Math.min(count, 10) * 3;
    return Response.json({ count, bonus, authenticated: true });
  } catch (error) {
    console.error("getReferralStats error:", error?.message || error);
    return Response.json({ error: error?.message || "internal error" }, { status: 500 });
  }
}