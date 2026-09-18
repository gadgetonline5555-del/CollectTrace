import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const TITLES = [
  { match: "/manga", key: "nav.manga" },
  { match: "/research", key: "nav.research" },
  { match: "/screener", key: "nav.screener" },
  { match: "/pricing", key: "nav.pricing" },
  { match: "/glossary", key: "nav.glossary" },
  { match: "/ai-research", key: "nav.air" },
  { match: "/discover", key: "nav.discover" },
  { match: "/wealth", key: "nav.wealth" },
  { match: "/company-intel", key: "nav.intel" },
  { match: "/ipo", key: "nav.ipo" },
  { match: "/invite", key: "nav.invite" },
  { match: "/watchlist", key: "nav.watchlist" },
  { match: "/portfolio", key: "nav.portfolio" },
  { match: "/api-access", key: "nav.api" },
  { match: "/admin", key: "nav.admin" },
  { match: "/settings", key: "mnav.settings" },
  { match: "/s/", key: "snap.type_ai" },
];

function titleFor(pathname, t) {
  const found = TITLES.filter((x) => pathname.startsWith(x.match))
    .sort((a, b) => b.match.length - a.match.length)[0];
  return found ? t(found.key) : "";
}

export default function MobileTopBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const isRoot = pathname === "/";

  return (
    <div className="md:hidden fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border pt-safe">
      <div className="h-12 flex items-center gap-1 px-2">
        {isRoot ? (
          <Link to="/" className="flex items-center gap-2 pl-1" aria-label="Collect Trace">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 via-violet-500 to-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-slate-950" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-foreground tracking-tight">Collect Trace</span>
          </Link>
        ) : (
          <>
            <button
              onClick={() => navigate(-1)}
              aria-label="戻る"
              className="min-h-11 min-w-11 flex items-center justify-center rounded-lg text-foreground hover:bg-foreground/5"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-display font-semibold text-foreground truncate pr-2">{titleFor(pathname, t)}</span>
          </>
        )}
      </div>
    </div>
  );
}