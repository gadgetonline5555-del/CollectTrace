import Stripe from "npm:stripe@17.6.0";
import { secrets } from "base44:runtime";

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
    return Response.json({ received: true });
  } catch (error) {
    console.error("stripeWebhook error:", error.message);
    return Response.json({ error: error.message }, { status: 400 });
  }
}