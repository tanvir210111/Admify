import React from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Sparkles,
  Building2,
  Award,
  FileCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Plane,
} from "lucide-react";

function DashboardPreview() {
  return (
    <section className="py-24 md:py-32 relative z-10 overflow-hidden bg-[#050B1F]">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0B1228] border border-cyan-500/30 text-cyan-300 mb-6 text-xs sm:text-sm font-bold tracking-widest uppercase"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Student Workspace
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-black mb-6 tracking-tight text-white leading-tight"
          >
            Everything in{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              One Place
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-base sm:text-lg md:text-xl font-normal leading-relaxed"
          >
            Manage your global study journey from profile building to application tracking.
          </motion.p>
        </div>

        {/* ── Realistic Admify Student Dashboard Mockup ── */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Subtle Ambient Backlight */}
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-purple-500/15 rounded-[2.5rem] blur-2xl pointer-events-none" />

          {/* Dashboard Container Frame */}
          <div className="relative rounded-2xl md:rounded-[2rem] border border-slate-700/80 bg-[#0B1228] shadow-2xl overflow-hidden">
            {/* Top Window Chrome */}
            <div className="h-11 bg-[#070e22] border-b border-slate-800 flex items-center justify-between px-5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>

              <div className="px-4 py-1 rounded-md bg-[#050B1F] border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>admify.world/student/journey</span>
              </div>

              <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                <span>Dhaka</span>
                <span>✈</span>
                <span className="text-cyan-300">Fall 2027 Intake</span>
              </div>
            </div>

            {/* Dashboard Inner Body */}
            <div className="flex flex-col md:flex-row min-h-[440px] md:min-h-[500px]">
              {/* Left Student Sidebar */}
              <div className="hidden md:flex w-60 border-r border-slate-800/80 p-5 flex-col justify-between bg-[#070e22]/90">
                <div className="space-y-6">
                  {/* Brand Header */}
                  <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
                    <img src="/logo-mark.png" alt="Admify" className="w-7 h-7 object-contain" />
                    <div>
                      <p className="text-white font-bold text-sm leading-tight">Admify Student</p>
                      <p className="text-[10px] text-cyan-400 font-medium">Verified Applicant</p>
                    </div>
                  </div>

                  {/* Nav links */}
                  <nav className="space-y-1.5 text-xs font-semibold">
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-400/30">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>My Journey</span>
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white transition-colors">
                      <Sparkles className="w-4 h-4" />
                      <span>AI Recommendations</span>
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white transition-colors">
                      <Building2 className="w-4 h-4" />
                      <span>Universities (14)</span>
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white transition-colors">
                      <Award className="w-4 h-4" />
                      <span>Scholarships ($45K)</span>
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white transition-colors">
                      <FileCheck className="w-4 h-4" />
                      <span>Applications (3)</span>
                    </div>
                  </nav>
                </div>

                {/* Bottom Wallet / Credits indicator */}
                <div className="p-3 rounded-xl bg-[#050B1F] border border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span>AI Credits</span>
                    <span className="text-cyan-300 font-bold">120 pts</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full w-3/4 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Main Workspace Panel */}
              <div className="flex-1 p-5 md:p-8 bg-[#0B1228] overflow-hidden">
                {/* 4 KPI Milestone Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
                  <div className="p-3.5 md:p-4 rounded-2xl bg-[#070e22] border border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                      Profile Strength
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl md:text-2xl font-extrabold text-cyan-300">88%</span>
                      <span className="text-[10px] text-emerald-400 font-bold">Excellent</span>
                    </div>
                  </div>

                  <div className="p-3.5 md:p-4 rounded-2xl bg-[#070e22] border border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                      Matched Unis
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl md:text-2xl font-extrabold text-white">14</span>
                      <span className="text-[10px] text-cyan-400 font-medium">3 Countries</span>
                    </div>
                  </div>

                  <div className="p-3.5 md:p-4 rounded-2xl bg-[#070e22] border border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                      Active Apps
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl md:text-2xl font-extrabold text-white">3</span>
                      <span className="text-[10px] text-yellow-400 font-medium">In Progress</span>
                    </div>
                  </div>

                  <div className="p-3.5 md:p-4 rounded-2xl bg-[#070e22] border border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                      Matched Grants
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl md:text-2xl font-extrabold text-emerald-400">$45K</span>
                      <span className="text-[10px] text-slate-400 font-medium">Eligible</span>
                    </div>
                  </div>
                </div>

                {/* Live Student Application Tracker */}
                <div className="p-4 md:p-6 rounded-2xl bg-[#070e22] border border-slate-800">
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80 mb-3.5">
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        Live Application Journey
                      </h4>
                    </div>
                    <span className="text-xs text-cyan-400 font-semibold cursor-pointer hover:underline flex items-center gap-1">
                      <span>View All</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* App 1 */}
                    <div className="p-3 rounded-xl bg-[#0B1228] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-base">🇺🇸</span>
                        <div>
                          <p className="font-bold text-white">Stanford University</p>
                          <p className="text-[11px] text-slate-400">M.S. Computer Science • Fall 2027</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-bold text-[10px]">
                          94% Match
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 font-medium text-[10px] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Document Review
                        </span>
                      </div>
                    </div>

                    {/* App 2 */}
                    <div className="p-3 rounded-xl bg-[#0B1228] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-base">🇬🇧</span>
                        <div>
                          <p className="font-bold text-white">University of Oxford</p>
                          <p className="text-[11px] text-slate-400">MSc Advanced CS • Fall 2027</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-bold text-[10px]">
                          91% Match
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 font-medium text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Ready to Submit
                        </span>
                      </div>
                    </div>

                    {/* App 3 */}
                    <div className="p-3 rounded-xl bg-[#0B1228] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-base">🇨🇦</span>
                        <div>
                          <p className="font-bold text-white">University of Toronto</p>
                          <p className="text-[11px] text-slate-400">Master of Applied Computing • Fall 2027</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-bold text-[10px]">
                          95% Match
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Offer Received
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default DashboardPreview;
