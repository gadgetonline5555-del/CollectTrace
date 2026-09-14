import React from "react";
import { Link, useLocation } from "react-router-dom";
import { TrendingUp, BookOpen, BarChart3, Tag } from "lucide-react";

const NAV = [
  { to: "/", label: "ホーム", icon: TrendingUp },
  { to: "/manga", label: "漫画", icon: BookOpen },
  { to: "/research", label: "調査", icon: BarChart3 },
  { to: "/pricing", label: "プラン", icon: Tag },
];

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-white/10">
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
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active ? "text-white bg-white/10" : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <Link
          to="/pricing"
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 hover:opacity-90 transition-opacity"
        >
          アップグレード
        </Link>
      </div>
    </header>
  );
}