import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { TrendingUp, BookOpen, BarChart3, Tag, ShieldCheck, Globe, ChevronDown, Lock, Star, Briefcase, Terminal, Sparkles, Compass, Crown, Network, Rocket, Gift } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { useUserTier } from "@/hooks/useUserTier";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

const NAV = [
  { to: "/", key: "nav.home", icon: TrendingUp },
  { to: "/manga", key: "nav.manga", icon: BookOpen },
  { to: "/research", key: "nav.research", icon: BarChart3 },
  { to: "/pricing", key: "nav.pricing", icon: Tag },
];

const TOOLS = [
  { to: "/glossary", key: "nav.glossary", tier: "free", icon: BookOpen },
  { to: "/ai-research", key: "nav.air", tier: "free", icon: Sparkles },
  { to: "/discover", key: "nav.discover", tier: "free", icon: Compass },
  { to: "/wealth", key: "nav.wealth", tier: "free", icon: Crown },
  { to: "/company-intel", key: "nav.intel", tier: "free", icon: Network },
  { to: "/ipo", key: "nav.ipo", tier: "free", icon: Rocket },
  { to: "/invite", key: "nav.invite", tier: "free", icon: Gift },
  { to: "/watchlist", key: "nav.watchlist", tier: "starter", icon: Star },
  { to: "/portfolio", key: "nav.portfolio", tier: "pro", icon: Briefcase },
  { to: "/api-access", key: "nav.api", tier: "elite", icon: Terminal },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { lang, setLang, t } = useI18n();
  const { can } = useUserTier();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    base44.auth.me().then((u) => setIsAdmin(u?.role === "admin")).catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-white/10 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-violet-500 to-amber-400 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-5 h-5 text-slate-950" strokeWidth={2.5} />
          </div>
          <div className="leading-none">
            <span className="font-display font-bold text-white tracking-tight text-lg">Collect Trace</span>
            <span className="block text-[10px] text-slate-400 tracking-widest uppercase">Manga × Research</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(({ to, key, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link key={to} to={to} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${active ? "text-white bg-white/10" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
                <Icon className="w-4 h-4" />
                {t(key)}
              </Link>
            );
          })}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors outline-none">
              <Star className="w-4 h-4" /> {t("nav.tools")} <ChevronDown className="w-3.5 h-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-slate-900 border-white/10">
              {TOOLS.map(({ to, key, tier, icon: Icon }) => (
                <DropdownMenuItem key={to} asChild>
                  <Link to={to} className="flex items-center gap-2 cursor-pointer">
                    <Icon className="w-4 h-4" />
                    <span>{t(key)}</span>
                    {!can(tier) && <Lock className="w-3 h-3 text-amber-300 ml-auto" />}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {isAdmin && (
            <Link to="/admin" className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith("/admin") ? "text-white bg-white/10" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
              <ShieldCheck className="w-4 h-4" /> {t("nav.admin")}
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={() => setLang(lang === "jp" ? "en" : "jp")} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 transition-colors" aria-label="Switch language">
            <Globe className="w-4 h-4" />
            <span className="font-mono text-xs">{lang === "jp" ? "JP" : "EN"}</span>
          </button>
          <Link to="/pricing" className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 hover:opacity-90 transition-opacity">
            {t("nav.upgrade")}
          </Link>
        </div>
      </div>
    </header>
  );
}