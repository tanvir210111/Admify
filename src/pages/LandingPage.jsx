import React from "react";
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
function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-primary-500/30 selection:text-primary-200">
      {" "}
      <Navbar /> {/* Background ambient effects shared across the page */}{" "}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]">
        {" "}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-900/20 rounded-full blur-[120px]" />{" "}
        <div className="absolute top-[40%] right-[-10%] w-[30%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]" />{" "}
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-primary-900/20 rounded-full blur-[120px]" />{" "}
      </div>{" "}
      <main>
        {" "}
        <Hero /> <Features /> <HowItWorks /> <Universities /> <Scholarships />{" "}
        <DashboardPreview /> <Testimonials /> <Pricing /> <FAQ />{" "}
      </main>{" "}
      <Footer />{" "}
    </div>
  );
}
export default LandingPage;
