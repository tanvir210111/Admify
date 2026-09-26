import React, { useState, useEffect } from "react";
import { Outlet, NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  Handshake,
  Users2,
  FileCheck2,
  FolderOpen,
  MessageSquare,
  Megaphone,
  Award,
  Calendar,
  BarChart3,
  Bell,
  AlertCircle,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  Globe,
  MapPin,
  Clock,
  CheckCircle2,
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard",                path: "/university-rep/dashboard" },
  { icon: Building2,       label: "My University",            path: "/university-rep/university" },
  { icon: GraduationCap,   label: "Programs & Departments",   path: "/university-rep/programs" },
  { icon: Handshake,       label: "Agency Partnerships",      path: "/university-rep/partnerships" },
  { icon: Users2,          label: "Connected Agencies",       path: "/university-rep/agencies" },
  { icon: FileCheck2,      label: "Applications / Inquiries", path: "/university-rep/applications" },
  { icon: FolderOpen,      label: "Application Documents",    path: "/university-rep/documents" },
  { icon: MessageSquare,   label: "Messages",                 path: "/university-rep/messages" },
  { icon: Megaphone,       label: "Announcements",            path: "/university-rep/announcements" },
  { icon: Award,           label: "Scholarships",             path: "/university-rep/scholarships" },
  { icon: Calendar,        label: "Intakes & Deadlines",      path: "/university-rep/intakes" },
  { icon: BarChart3,       label: "Analytics",                path: "/university-rep/analytics" },
  { icon: Bell,            label: "Notifications",            path: "/university-rep/notifications" },
  { icon: AlertCircle,     label: "Reports / Issues",         path: "/university-rep/reports" },
  { icon: User,            label: "My Profile",               path: "/university-rep/profile" },
  { icon: Settings,        label: "Settings",                 path: "/university-rep/settings" },
];

export default function UniRepLayout() {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [universityInfo, setUniversityInfo] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const loadUniRepMeta = async () => {
      try {
        const [uniRes, notifRes] = await Promise.allSettled([
          api.get("/api/university-rep/university"),
          api.get("/api/university-rep/notifications"),
        ]);

        if (isMounted) {
          if (uniRes.status === "fulfilled" && uniRes.value?.data?.university) {
            setUniversityInfo(uniRes.value.data.university);
          }
          if (notifRes.status === "fulfilled" && Array.isArray(notifRes.value?.data?.notifications)) {
            const unread = notifRes.value.data.notifications.filter((n) => !n.read && !n.isRead).length;
            setUnreadCount(unread);
          }
        }
      } catch (err) {
        console.warn("Failed to load Uni Rep meta", err);
      }
    };

    loadUniRepMeta();
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const repName = user?.name || user?.user_metadata?.full_name || "University Representative";
  const repDesignation = user?.designation || "Admissions Officer";
  const universityName = universityInfo?.name || "Official University Partner";
  const universityLocation = universityInfo?.location || universityInfo?.country || "International";

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
            className="fixed inset-0 bg-black/80 z-40 xl:hidden backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* ── Fixed Sidebar (Section 8) ── */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 z-50 flex flex-col transition-transform duration-300 xl:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "linear-gradient(180deg, #070B1F 0%, #050B1F 100%)",
          borderRight: "1px solid rgba(255, 255, 255, 0.07)",
        }}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
          <Link to="/university-rep/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0B1228] border border-purple-500/35 flex items-center justify-center shadow-lg shadow-purple-500/20 p-1 overflow-hidden shrink-0">
              <img src="/logo-mark.png" alt="Admify Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-white font-extrabold text-base leading-none">Admify</p>
              <p className="text-purple-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Uni Rep Portal</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="xl:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* University Identity Pill */}
        <div className="mx-3 my-3 px-3 py-2.5 rounded-xl bg-[#0B1228]/80 border border-purple-500/20 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 font-bold text-xs">
            {universityInfo?.logo ? (
              <img src={universityInfo.logo} alt="Logo" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <Building2 className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-white truncate">{universityName}</p>
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" title="Verified University" />
            </div>
            <p className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
              <MapPin className="w-2.5 h-2.5 text-slate-500" />
              {universityLocation}
            </p>
          </div>
        </div>

        {/* Navigation Items (Scrollable) */}
        <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5 custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive: linkActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    linkActive || isActive
                      ? "bg-gradient-to-r from-purple-600/20 to-blue-600/15 text-white border border-purple-500/30 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`
                }
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-purple-400" : "text-slate-400"}`} />
                <span className="truncate">{item.label}</span>
                {item.label === "Notifications" && unreadCount > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-purple-500/30 text-purple-300 rounded-full border border-purple-500/40">
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer Chip */}
        <div className="p-3 border-t border-white/5 flex-shrink-0 bg-[#070E24]/60">
          <div className="flex items-center justify-between gap-2">
            <Link
              to="/university-rep/profile"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-85 transition"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {repName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate leading-tight">{repName}</p>
                <p className="text-[10px] text-purple-300 truncate leading-tight mt-0.5">{repDesignation}</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 xl:ml-64">

        {/* Top Navbar */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/5 backdrop-blur-md"
          style={{ background: "rgba(5, 11, 31, 0.85)" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="xl:hidden p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400">
                Institutional Representative Portal
              </span>
              <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-[240px] sm:max-w-md">
                {universityName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications Button */}
            <Link
              to="/university-rep/notifications"
              className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              )}
            </Link>

            {/* Quick Profile Badge */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-left transition"
              >
                <div className="w-7 h-7 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-300 font-bold text-xs flex items-center justify-center">
                  {repName.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-white leading-tight">{repName}</p>
                  <p className="text-[10px] text-slate-400 leading-tight">Representative</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 mt-2 w-52 rounded-xl bg-[#0B1228] border border-white/10 shadow-2xl p-1.5 z-50"
                  >
                    <div className="px-3 py-2 border-b border-white/5">
                      <p className="text-xs font-semibold text-white truncate">{repName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/university-rep/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition"
                    >
                      <User className="w-3.5 h-3.5 text-purple-400" /> My Profile
                    </Link>
                    <Link
                      to="/university-rep/university"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition"
                    >
                      <Building2 className="w-3.5 h-3.5 text-blue-400" /> University Profile
                    </Link>
                    <Link
                      to="/university-rep/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400" /> Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition text-left mt-1 border-t border-white/5"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
