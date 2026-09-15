import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";

// Zero-cost acquisition: capture ?ref= from the landing URL, then record
// the referral once the visitor becomes a logged-in user. Runs app-wide.
export function useReferralCapture() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const calledRef = useRef(false);

  // 1) On mount: capture ref code from URL into localStorage
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      try { localStorage.setItem("ct_ref", ref); } catch { /* ignore */ }
      // clean the URL so it's shareable / bookmarkable without the ref
      searchParams.delete("ref");
      setSearchParams(searchParams, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 2) Once we know the user: record the referral once
  useEffect(() => {
    if (!user || calledRef.current) return;
    calledRef.current = true;
    let ref = null;
    try { ref = localStorage.getItem("ct_ref"); } catch { ref = null; }
    if (!ref || ref === user.id) {
      try { localStorage.removeItem("ct_ref"); } catch { /* ignore */ }
      return;
    }
    base44.functions.invoke("recordReferral", { referrerId: ref })
      .then(() => { try { localStorage.removeItem("ct_ref"); } catch { /* ignore */ } })
      .catch(() => { /* non-fatal: user still gets the app */ });
  }, [user]);
}