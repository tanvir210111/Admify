import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import GlobalJourneyIntro from "../components/intro/GlobalJourneyIntro";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import Universities from "../components/landing/Universities";
import Scholarships from "../components/landing/Scholarships";
import DashboardPreview from "../components/landing/DashboardPreview";
import Testimonials from "../components/landing/Testimonials";
import Pricing from "../components/landing/Pricing";
import FAQ from "../components/landing/FAQ";
import FinalCTA from "../components/landing/FinalCTA";
import GlobalEducationBackground from "../components/landing/GlobalEducationBackground";

function LandingPage() {
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return sessionStorage.getItem("admify_intro_seen") !== "true";
    } catch {
      return false;
    }
  });

  const handleIntroComplete = () => {
    try {
      sessionStorage.setItem("admify_intro_seen", "true");
      window.dispatchEvent(new Event("admify_intro_finished"));
    } catch {}
    setShowIntro(false);
  };

  return (
    <>
      <AnimatePresence>
        {showIntro && <GlobalJourneyIntro onComplete={handleIntroComplete} />}
      </AnimatePresence>

      <div className="min-h-screen bg-[#050B1F] text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative">
        <Navbar />
        {/* Subtle Live Global Education Network Background */}
        <GlobalEducationBackground />

        <main className="relative z-10">
          <Hero />
          <Features />
          <HowItWorks />
          <Universities />
          <Scholarships />
          <DashboardPreview />
          <Testimonials />
          <Pricing />
          <FAQ />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default LandingPage;
