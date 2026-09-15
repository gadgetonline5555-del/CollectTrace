import { useAuth } from "@/lib/AuthContext";
import { canAccess } from "@/lib/plans";

export function useUserTier() {
  const { user } = useAuth();
  const tier = user?.subscription_tier || "free";
  const can = (contentTier) => canAccess(tier, contentTier);
  return { tier, can, user };
}