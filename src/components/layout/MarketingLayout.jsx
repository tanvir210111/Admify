import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { motion, AnimatePresence } from "framer-motion";

// Scroll to top helper
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function MarketingLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-primary-500/30 selection:text-primary-200 flex flex-col relative overflow-x-hidden">
      <ScrollToTop />
      
      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-900/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[-10%] w-[40%] h-[60%] bg-blue-900/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[140px]" />
      </div>

      <Navbar />

      {/* Main Content Area with Page Transitions */}
      <main className="flex-grow pt-24 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default MarketingLayout;
