import React, { useState } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, FileCheck, Building2, Award, FileText, Sparkles,
  MessageSquare, Calendar, Landmark, Bell, User, LogOut, Search, ChevronDown, Menu, X, Globe
} from "lucide-react";

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard",            path: "/agent/dashboard" },
  { icon: Users,           label: "My Students",          path: "/agent/students" },
  { icon: FileCheck,       label: "Applications",         path: "/agent/applications" },
  { icon: Building2,       label: "Universities",         path: "/agent/universities" },
  { icon: Award,           label: "Scholarships",         path: "/agent/scholarships" },
  { icon: FileText,        label: "Document Review",      path: "/agent/documents" },
  { icon: Sparkles,        label: "SOP & LOR",            path: "/agent/sop-lor" },
  { icon: MessageSquare,   label: "Messages",             path: "/agent/messages" },
  { icon: Calendar,        label: "Meetings",             path: "/agent/meetings" },
  { icon: Landmark,        label: "Commissions",          path: "/agent/commissions" },
  { icon: Bell,            label: "Notifications",        path: "/agent/notifications" },
  { icon: User,            label: "Profile Settings",     path: "/agent/profile" },
];

const NOTIFS = [
  { icon: "📄", text: "David Miller uploaded a new bank statement", time: "3m ago" },
  { icon: "🎓", text: "University of Manchester updated eligibility rules", time: "12m ago" },
  { icon: "📅", text: "Counselling meeting starting in 15 mins", time: "18m ago" },
  { icon: "💰", text: "Commission approved: $1,240 for Ahmad Khalid", time: "1h ago" },
];

export default function AgentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => navigate("/login");

  return (
    <div className="flex min-h-screen" style={{ background: "#050B1F", fontFamily: "'Inter',sans-serif" }}>

      {/* ── Mobile Drawer Overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 z-40 xl:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Fixed Sticky Sidebar ── */}
      <aside className={`fixed top-0 left-0 h-screen w-64 z-50 flex flex-col transition-transform duration-300 xl:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "linear-gradient(180deg,#07091e 0%,#050b1f 100%)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="text-white font-black text-lg">A</span>
            </div>
            <div>
              <p className="text-white font-extrabold text-base leading-none">Admify</p>
              <p className="text-blue-400 text-[9px] font-bold uppercase tracking-widest mt-0.5">Agent Portal</p>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="xl:hidden text-slate-500 hover:text-white p-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 custom-scrollbar">
          {NAV.map((item) => (
            <NavLink key={item.path} to={item.path} onClick={() => { if (window.innerWidth < 1280) setSidebarOpen(false); }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                  isActive
                    ? "bg-violet-600/20 border border-violet-500/30 text-white font-bold shadow-[0_0_15px_rgba(139,92,246,0.12)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`flex-shrink-0 transition-colors ${isActive ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300"}`} style={{ width: 17, height: 17 }} />
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout at bottom */}
        <div className="p-3 border-t border-white/5 flex-shrink-0">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm group">
            <LogOut style={{ width: 17, height: 17 }} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 xl:pl-64 flex flex-col min-h-screen">

        {/* ── Sticky Top Header ── */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6 flex-shrink-0"
          style={{ background: "rgba(5,11,31,0.95)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>

          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="xl:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search students, commissions, universities..."
                className="w-60 md:w-80 bg-white/4 border border-white/8 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-all" />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Online Status Status Indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-bold">Online • Available</span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full border border-slate-900" />
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
                      className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden"
                      style={{ background: "#0b1228" }}>
                      <div className="flex justify-between items-center px-4 py-3 border-b border-white/8">
                        <h4 className="text-white font-bold text-sm">Notifications</h4>
                        <span className="text-violet-400 text-xs cursor-pointer hover:text-violet-300">Mark all read</span>
                      </div>
                      {NOTIFS.map((n, i) => (
                        <div key={i} className="flex gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/3 cursor-pointer transition-colors">
                          <span className="text-base flex-shrink-0 mt-0.5">{n.icon}</span>
                          <div><p className="text-slate-300 text-xs">{n.text}</p><p className="text-slate-600 text-[10px] mt-0.5">{n.time}</p></div>
                        </div>
                      ))}
                      <div className="px-4 py-2.5 text-center text-violet-400 text-xs font-medium cursor-pointer hover:text-violet-300">View all →</div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown (Only here in header) */}
            <div className="relative">
              <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 pl-3 border-l border-white/8 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-xs font-black text-white flex-shrink-0">JS</div>
                <div className="hidden md:block text-left">
                  <p className="text-white text-xs font-bold leading-none">Sarah Jenkins</p>
                  <p className="text-slate-400 text-[9px] mt-0.5">EduGlobal Consulting · 🇬🇧 UK</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden md:block" />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
                      className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden py-1"
                      style={{ background: "#0b1228" }}>
                      {[
                        { label: "Profile Settings", path: "/agent/profile", icon: "👤" },
                        { label: "My Students",      path: "/agent/students", icon: "🎓" },
                        { label: "Earnings Center",   path: "/agent/commissions", icon: "💰" },
                      ].map((m, i) => (
                        <button key={i} onClick={() => { navigate(m.path); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-sm text-left">
                          <span>{m.icon}</span> {m.label}
                        </button>
                      ))}
                      <div className="border-t border-white/8 mt-1 pt-1">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-colors text-sm text-left">
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
