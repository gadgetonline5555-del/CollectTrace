import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import Stripe from "npm:stripe@17.6.0";
import { secrets } from "base44:runtime";
import { findActiveSubscription } from "../../shared/stripeSubscription.ts";

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Cancel any active Stripe subscription so the user is not charged after deletion.
    try {
      if (user.email) {
        const stripe = new Stripe(secrets.get("STRIPE_SECRET_KEY"));
        const sub = await findActiveSubscription(stripe, user.email);
        if (sub) await stripe.subscriptions.del(sub.id);
      }
    } catch (subErr) {
      // Log but do not block account deletion if subscription cancellation fails.
      console.error("deleteAccount: subscription cancel failed:", subErr.message);
    }

    // Best-effort account deletion via service role.
    await base44.asServiceRole.entities.User.delete(user.id);
    return Response.json({ ok: true });
  } catch (error) {
    console.error('deleteAccount error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}