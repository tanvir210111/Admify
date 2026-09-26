import React, { useState, useEffect } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import {
  LayoutDashboard,
  UserCheck,
  Users,
  FileCheck,
  Briefcase,
  Handshake,
  MessageSquare,
  FileText,
  BarChart3,
  Bell,
  AlertCircle,
  History,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Building2,
  CheckCircle2,
  Clock,
} from "lucide-react";

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard",                path: "/agency/dashboard" },
  { icon: UserCheck,       label: "My Agents",                path: "/agency/agents" },
  { icon: Users,           label: "Students",                 path: "/agency/students" },
  { icon: FileCheck,       label: "Applications",             path: "/agency/applications" },
  { icon: Briefcase,       label: "Service Requests",         path: "/agency/service-requests" },
  { icon: Handshake,       label: "University Partnerships",  path: "/agency/university-partnerships" },
  { icon: MessageSquare,   label: "Messages",                 path: "/agency/messages" },
  { icon: FileText,        label: "Documents",                path: "/agency/documents" },
  { icon: BarChart3,       label: "Performance",              path: "/agency/performance" },
  { icon: Bell,            label: "Notifications",            path: "/agency/notifications" },
  { icon: AlertCircle,     label: "Reports / Issues",         path: "/agency/reports" },
  { icon: History,         label: "Service History",          path: "/agency/service-history" },
  { icon: ShieldCheck,     label: "Agency Profile",           path: "/agency/profile" },
  { icon: Settings,        label: "Settings",                 path: "/agency/settings" },
];

export default function AgencyLayout() {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Load agency unread notifications count
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await api.get("/api/agency/notifications");
        if (data?.success && Array.isArray(data.data?.notifications)) {
          const unread = data.data.notifications.filter((n) => !n.read).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.warn("Failed to load notifications:", err);
      }
    };
    fetchUnread();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const agencyName = user?.name || "Partner Agency";
  const isVerified = user?.accountStatus === "ACTIVE" || user?.agencyVerificationStatus === "VERIFIED";

  return (
    <div className="flex min-h-screen" style={{ background: "#050B1F", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Mobile Overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/75 z-40 xl:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* ── Fixed Sidebar ── */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 z-50 flex flex-col transition-transform duration-300 xl:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "linear-gradient(180deg, #07091E 0%, #050B1F 100%)",
          borderRight: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        {/* Logo & Portal Brand */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
          <Link to="/agency/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#070B1A] border border-violet-500/35 flex items-center justify-center shadow-lg shadow-violet-500/20 p-1 overflow-hidden shrink-0">
              <img src="/logo-mark.png" alt="Admify Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-white font-extrabold text-base leading-none">Admify</p>
              <p className="text-violet-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Agency Panel</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="xl:hidden text-slate-500 hover:text-white p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Agency Status Card */}
        <div className="mx-3 my-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold text-xs shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-semibold text-xs truncate">{agencyName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isVerified ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400">
                  <Clock className="w-2.5 h-2.5" /> Review Pending
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5 custom-scrollbar">
          {NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1280) setSidebarOpen(false);
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                  isActive
                    ? "bg-violet-600/25 border border-violet-500/40 text-white font-bold shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={`flex-shrink-0 transition-colors ${
                      isActive ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300"
                    }`}
                    style={{ width: 16, height: 16 }}
                  />
                  <span className="truncate">{item.label}</span>
                  {item.label === "Notifications" && unreadCount > 0 && (
                    <span className="ml-auto px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                      {unreadCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sign Out */}
        <div className="p-3 border-t border-white/5 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs font-semibold group"
          >
            <LogOut style={{ width: 16, height: 16 }} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 xl:pl-64 flex flex-col min-h-screen">
        {/* Fixed Top Header */}
        <header
          className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-8 flex-shrink-0"
          style={{
            background: "rgba(5, 11, 31, 0.92)",
            backdropFilter: "blur(14px)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="xl:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs text-slate-400">Consultancy Operations</span>
              <p className="text-white font-bold text-sm tracking-tight">{agencyName}</p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Verification Badge */}
            {isVerified ? (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Agency</span>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>Verification In Review</span>
              </div>
            )}

            {/* Quick Messages */}
            <Link
              to="/agency/messages"
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              title="Inbox"
            >
              <MessageSquare className="w-4 h-4" />
            </Link>

            {/* Quick Notifications */}
            <Link
              to="/agency/notifications"
              className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </Link>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl bg-white/5 hover:bg-white/8 border border-white/8 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  {agencyName.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline text-xs font-semibold text-white max-w-[120px] truncate">
                  {agencyName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-white/10 shadow-2xl p-2 z-50"
                    style={{ background: "#0B1228" }}
                  >
                    <div className="px-3 py-2 border-b border-white/5">
                      <p className="text-white text-xs font-bold truncate">{agencyName}</p>
                      <p className="text-slate-400 text-[11px] truncate">{user?.email}</p>
                    </div>
                    <div className="py-1 space-y-0.5">
                      <Link
                        to="/agency/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-violet-400" />
                        <span>Agency Profile</span>
                      </Link>
                      <Link
                        to="/agency/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Settings</span>
                      </Link>
                    </div>
                    <div className="pt-1 border-t border-white/5">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
