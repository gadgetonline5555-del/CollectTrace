// Shared Stripe subscription lookup used by cancelSubscription and deleteAccount.
// Finds the user's active subscription by email. Returns the subscription or null.

export async function findActiveSubscription(stripe, email) {
  if (!email) return null;
  const customers = await stripe.customers.list({ email, limit: 1 });
  const customer = customers.data[0];
  if (!customer) return null;
  const subs = await stripe.subscriptions.list({ customer: customer.id, status: "active", limit: 1 });
  return subs.data[0] || null;
}