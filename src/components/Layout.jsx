import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileTopBar from "@/components/MobileTopBar";
import MobileBottomNav from "@/components/MobileBottomNav";
import PageTransition from "@/components/PageTransition";
import { useReferralCapture } from "@/hooks/useReferralCapture";

export default function Layout() {
  useReferralCapture();
  const location = useLocation();
  return (
    <div className="min-h-screen bg-background text-foreground antialiased relative overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 opacity-60 hidden dark:block">
        <div className="absolute -top-40 -left-40 w-[40rem] h-[40rem] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[36rem] h-[36rem] rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 w-[30rem] h-[30rem] rounded-full bg-amber-500/10 blur-[120px]" />
      </div>
      <div className="relative z-10 flex flex-col min-h-screen pb-safe-nav md:pb-0">
        <MobileTopBar />
        <Navbar />
        <main className="flex-1 pt-12 md:pt-0">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </main>
        <Footer />
      </div>
      <MobileBottomNav />
    </div>
  );
}