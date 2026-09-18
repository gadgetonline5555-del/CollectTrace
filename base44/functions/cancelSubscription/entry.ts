import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import Stripe from "npm:stripe@17.6.0";
import { secrets } from "base44:runtime";
import { findActiveSubscription } from "../../shared/stripeSubscription.ts";

// Cancels the current user's active Stripe subscription at period end,
// so the user keeps paid access until the period ends, then downgrades to free
// (handled by the customer.subscription.deleted webhook event).
export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.email) return Response.json({ error: "メールアドレスが取得できません" }, { status: 400 });

    const stripe = new Stripe(secrets.get("STRIPE_SECRET_KEY"));
    const sub = await findActiveSubscription(stripe, user.email);
    if (!sub) {
      return Response.json({ error: "no_subscription", message: "有効なサブスクリプションが見つかりません" }, { status: 404 });
    }

    const canceled = await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true });
    console.log(`cancelSubscription: ${user.email} sub ${sub.id} -> cancel_at_period_end`);
    return Response.json({
      ok: true,
      cancel_at_period_end: true,
      current_period_end: canceled.current_period_end,
    });
  } catch (error) {
    console.error("cancelSubscription error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}