import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import Stripe from "npm:stripe@17.6.0";
import { secrets } from "base44:runtime";

const PRICE_TO_TIER = {
  "price_1UG4JUK883blt89Ki3kqRKjQ": "starter",
  "price_1UG4JUK883blt89KQEsrk9zr": "pro",
  "price_1UG4JUK883blt89KmxfXhsRu": "elite",
};

async function setUserTier(base44, email, tier) {
  try {
    const users = await base44.asServiceRole.entities.User.filter({ email });
    if (users && users.length > 0) {
      await base44.asServiceRole.entities.User.update(users[0].id, { subscription_tier: tier });
      console.log(`Updated ${email} -> ${tier}`);
    } else {
      console.log(`No user found for ${email}`);
    }
  } catch (e) {
    console.error("setUserTier error:", e.message);
  }
}

export default async function (req: Request): Promise<Response> {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    const secret = secrets.get("STRIPE_WEBHOOK_SECRET");
    if (!sig || !secret) {
      return Response.json({ error: "missing signature or secret" }, { status: 400 });
    }
    const stripe = new Stripe(secrets.get("STRIPE_SECRET_KEY"));
    const event = await stripe.webhooks.constructEventAsync(body, sig, secret);
    console.log("Stripe webhook event:", event.type, event.id);

    const base44 = createClientFromRequest(req);

    if (event.type === "checkout.session.completed") {
      const session: any = event.data.object;
      const email = session.customer_email || session.customer_details?.email;
      const subId = session.subscription;
      const sub: any = subId ? await stripe.subscriptions.retrieve(subId) : null;
      const priceId = sub?.items?.data?.[0]?.price?.id;
      const tier = priceId ? PRICE_TO_TIER[priceId] : null;
      if (email && tier) await setUserTier(base44, email, tier);
    } else if (event.type === "customer.subscription.updated") {
      const sub: any = event.data.object;
      const priceId = sub?.items?.data?.[0]?.price?.id;
      const tier = priceId ? PRICE_TO_TIER[priceId] : null;
      const customer: any = sub.customer ? await stripe.customers.retrieve(sub.customer) : null;
      const email = customer?.email;
      if (email && tier) await setUserTier(base44, email, tier);
    } else if (event.type === "customer.subscription.deleted") {
      const sub: any = event.data.object;
      const customer: any = sub.customer ? await stripe.customers.retrieve(sub.customer) : null;
      const email = customer?.email;
      if (email) await setUserTier(base44, email, "free");
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("stripeWebhook error:", error.message);
    return Response.json({ error: error.message }, { status: 400 });
  }
}