import { secrets } from "base44:runtime";

const PRICES = {
  starter: "price_1UG4JUK883blt89Ki3kqRKjQ",
  pro: "price_1UG4JUK883blt89KQEsrk9zr",
  elite: "price_1UG4JUK883blt89KmxfXhsRu",
};

export default async function (req: Request): Promise<Response> {
  try {
    const { plan_tier } = await req.json();
    const priceId = PRICES[plan_tier];
    if (!priceId) return Response.json({ error: "無効なプランです" }, { status: 400 });

    const key = secrets.get("STRIPE_SECRET_KEY");
    const appId = Deno.env.get("BASE44_APP_ID") || "";
    const origin = new URL(req.url).origin;

    const params = new URLSearchParams();
    params.append("mode", "subscription");
    params.append("line_items[0][price]", priceId);
    params.append("line_items[0][quantity]", "1");
    params.append("success_url", `${origin}/pricing?status=success`);
    params.append("cancel_url", `${origin}/pricing?status=cancelled`);
    params.append("metadata[base44_app_id]", appId);
    params.append("subscription_data[metadata][base44_app_id]", appId);

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Stripe-Version": "2025-10-29.clover",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: params,
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("Stripe checkout error:", data.error?.message);
      return Response.json({ error: data.error?.message || "決済セッションの作成に失敗しました" }, { status: 500 });
    }
    return Response.json({ url: data.url });
  } catch (error) {
    console.error("createCheckout error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}