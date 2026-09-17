import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, BarChart3, Compass, MoreHorizontal, ChevronRight } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { useI18n } from "@/lib/i18n";
import { base44 } from "@/api/base44Client";

const TABS = [
  { to: "/", key: "nav.home", icon: Home, exact: true },
  { to: "/manga", key: "nav.manga", icon: BookOpen },
  { to: "/research", key: "nav.research", icon: BarChart3 },
  { to: "/discover", key: "nav.discover", icon: Compass },
];

const MORE = [
  { to: "/radar", key: "nav.radar" },
  { to: "/glossary", key: "nav.glossary" },
  { to: "/ai-research", key: "nav.air" },
  { to: "/wealth", key: "nav.wealth" },
  { to: "/company-intel", key: "nav.intel" },
  { to: "/ipo", key: "nav.ipo" },
  { to: "/invite", key: "nav.invite" },
  { to: "/watchlist", key: "nav.watchlist" },
  { to: "/portfolio", key: "nav.portfolio" },
  { to: "/api-access", key: "nav.api" },
  { to: "/pricing", key: "nav.pricing" },
  { to: "/settings", key: "mnav.settings" },
];

// Resolve which primary tab (if any) owns a given pathname.
const findTab = (pathname) => {
  for (const tab of TABS) {
    if (tab.exact ? pathname === tab.to : pathname.startsWith(tab.to)) return tab.to;
  }
  return null;
};

export default function MobileBottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Per-tab navigation stack retention. Each tab keeps its own history of
  // visited paths; switching back to a tab restores its last position.
  const tabStacksRef = useRef(Object.fromEntries(TABS.map((tab) => [tab.to, [tab.to]])));
  const prevTabRef = useRef(findTab(pathname));

  useEffect(() => {
    base44.auth.me().then((u) => setIsAdmin(u?.role === "admin")).catch(() => {});
  }, []);

  // Record every navigation into the owning tab's stack (deduped).
  useEffect(() => {
    const owner = findTab(pathname);
    if (!owner) return; // non-tab pages (glossary, wealth, pricing, ...) don't touch stacks
    const stack = tabStacksRef.current[owner];
    if (stack[stack.length - 1] !== pathname) stack.push(pathname);
    prevTabRef.current = owner;
  }, [pathname]);

  const isActive = (to, exact) => (exact ? pathname === to : pathname.startsWith(to));

  const go = (to, exact) => {
    if (isActive(to, exact)) {
      // Re-selecting the active tab: pop to that tab's root path.
      tabStacksRef.current[to] = [to];
      if (pathname !== to) navigate(to);
    } else {
      // Switching tabs: restore that tab's previous stack top.
      const stack = tabStacksRef.current[to];
      const dest = stack[stack.length - 1] || to;
      navigate(dest);
    }
  };

  const moreItems = isAdmin ? [...MORE, { to: "/admin", key: "nav.admin" }] : MORE;

  return (
    <>
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border pb-safe"
        aria-label="モバイルナビゲーション"
      >
        <div className="flex">
          {TABS.map(({ to, key, icon: Icon, exact }) => {
            const a = isActive(to, exact);
            return (
              <button
                key={to}
                onClick={() => go(to, exact)}
                aria-label={t(key)}
                aria-current={a ? "page" : undefined}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-11"
              >
                <Icon className={`w-5 h-5 ${a ? "text-foreground" : "text-muted-foreground"}`} />
                <span className={`text-sm font-medium ${a ? "text-foreground" : "text-muted-foreground"}`}>{t(key)}</span>
              </button>
            );
          })}
          <button
            onClick={() => setOpen(true)}
            aria-label={t("mnav.more")}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-11"
          >
            <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">{t("mnav.more")}</span>
          </button>
        </div>
      </nav>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="bg-background border-border text-slate-100 pb-safe">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-foreground">{t("mnav.more")}</DrawerTitle>
          </DrawerHeader>
          <div className="px-2 pb-4 max-h-[60vh] overflow-y-auto">
            {moreItems.map(({ to, key }) => (
              <DrawerClose asChild key={to}>
                <Link
                  to={to}
                  className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-foreground/5 min-h-11"
                >
                  <span className="text-sm text-foreground">{t(key)}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/80" />
                </Link>
              </DrawerClose>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}