// Shared AI quota module — daily call caps for free/anonymous users.
// Paid users (starter/pro/elite) are unlimited. Imported by all AI backend functions.

const LIMITS = { anonymous: 3, free: 10 };
const PAID = new Set(["starter", "pro", "elite"]);

function todayStrUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function getIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
  const ip = fwd.split(",")[0].trim();
  return ip || "unknown";
}

export async function resolveIdentity(base44: any, req: Request) {
  let user: any = null;
  try { user = await base44.auth.me(); } catch { user = null; }
  if (user && user.id) {
    const tier = user.subscription_tier || "free";
    return { userId: user.id, tier, ip: getIp(req) };
  }
  return { userId: null, tier: "anonymous", ip: getIp(req) };
}

export async function checkQuota(base44: any, req: Request, functionName = "ai") {
  const identity = await resolveIdentity(base44, req);
  if (PAID.has(identity.tier)) {
    return { allowed: true, identity, limit: Infinity, remaining: Infinity, used: 0 };
  }
  const limit = LIMITS[identity.tier] ?? LIMITS.anonymous;
  const key = identity.userId || `ip:${identity.ip}`;
  const date = todayStrUTC();
  const todayCalls = await base44.asServiceRole.entities.AiCall.filter({ identity: key, date }, "-created_date", 500);
  const used = todayCalls.length;
  if (used >= limit) {
    return { allowed: false, identity, limit, remaining: 0, used };
  }
  return { allowed: true, identity, limit, remaining: limit - used, used };
}

export async function logCall(base44: any, identity: any, functionName = "ai") {
  try {
    const key = identity.userId || `ip:${identity.ip}`;
    await base44.asServiceRole.entities.AiCall.create({
      identity: key,
      date: todayStrUTC(),
      function_name: functionName,
      tier: identity.tier
    });
  } catch {
    // non-fatal: quota logging should never break the feature
  }
}