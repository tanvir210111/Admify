import React, { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import {
  LayoutDashboard, Users, UserCheck, Headphones, Building2, Award,
  FileCheck, Sparkles, FileText, Wallet, CreditCard, Bell, BarChart3,
  Settings, LogOut, Search, ChevronDown, Menu, X, Activity, Server,
  ShieldCheck, Tag, Globe, MessageSquare, AlertCircle, ShieldAlert,
  Handshake, UserPlus,
} from "lucide-react";

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard",             path: "/admin/dashboard" },
  { icon: Users,           label: "Central Users",         path: "/admin/users" },
  { icon: Users,           label: "Students",              path: "/admin/students" },
  { icon: Building2,       label: "Agencies",              path: "/admin/agencies" },
  { icon: UserCheck,       label: "Agents",                path: "/admin/agents" },
  { icon: UserCheck,       label: "Uni Representatives",   path: "/admin/university-representatives" },
  { icon: Building2,       label: "Universities",          path: "/admin/universities" },
  { icon: FileCheck,       label: "Applications",          path: "/admin/applications" },
  { icon: Handshake,       label: "Partnerships",          path: "/admin/partnerships" },
  { icon: CreditCard,      label: "Payments",              path: "/admin/payments" },
  { icon: Wallet,          label: "Wallet & Credits",      path: "/admin/wallet" },
  { icon: Tag,             label: "Coupons",               path: "/admin/coupons" },
  { icon: Award,           label: "Scholarships",          path: "/admin/scholarships" },
  { icon: Globe,           label: "Countries",             path: "/admin/countries" },
  { icon: AlertCircle,     label: "Reports & Complaints",  path: "/admin/reports" },
  { icon: MessageSquare,   label: "Support Inbox",         path: "/admin/support" },
  { icon: Bell,            label: "Notifications",         path: "/admin/notifications" },
  { icon: Sparkles,        label: "AI Engine",             path: "/admin/ai" },
  { icon: ShieldAlert,     label: "Audit Logs",            path: "/admin/audit-logs" },
  { icon: UserPlus,        label: "Admin Accounts",        path: "/admin/admins" },
  { icon: Settings,        label: "Platform Settings",     path: "/admin/settings" },
];

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Fetch real notifications
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get("/api/admin/notifications");
        if (res?.success) {
          setNotifications(res.data?.notifications || []);
        }
      } catch (err) {
        console.warn("Failed to load admin notifications:", err);
      }
    };
    fetchNotifs();
  }, []);

  // Global search debouncing
  useEffect(() => {
    if (!search.trim() || search.trim().length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/api/admin/search?q=${encodeURIComponent(search.trim())}`);
        if (res?.success) {
          setSearchResults(res.data?.results || []);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.error("Global search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Click outside search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      navigate("/admin/login", { replace: true });
    }
  };

  const adminName = user?.name || user?.user_metadata?.full_name || "Administrator";
  const initials = adminName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "AD";

  return (
    <div className="flex min-h-screen" style={{ background: "#050B1F", fontFamily: "'Inter',sans-serif" }}>

      {/* ── Mobile Overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 z-40 xl:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Fixed Sidebar ── */}
      <aside className={`fixed top-0 left-0 h-screen w-64 z-50 flex flex-col transition-transform duration-300 xl:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "linear-gradient(180deg,#07091e 0%,#050b1f 100%)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>

        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
          <Link to="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#070b1a] border border-cyan-500/35 flex items-center justify-center shadow-lg shadow-cyan-500/25 p-1 overflow-hidden shrink-0">
              <img
                src="/logo-mark.png"
                alt="Admify Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="text-white font-extrabold text-base leading-none">Admify</p>
              <p className="text-violet-400 text-[9px] font-bold uppercase tracking-widest mt-0.5">Control Center</p>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="xl:hidden text-slate-500 hover:text-white p-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 custom-scrollbar">
          {NAV.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => { if (window.innerWidth < 1280) setSidebarOpen(false); }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                  isActive
                    ? "bg-violet-600/25 border border-violet-500/40 text-white font-bold shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`flex-shrink-0 transition-colors ${isActive ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300"}`} style={{ width: 16, height: 16 }} />
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/5 flex-shrink-0">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs font-semibold group">
            <LogOut style={{ width: 16, height: 16 }} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 xl:pl-64 flex flex-col min-h-screen">

        {/* ── Fixed Top Header ── */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-6 flex-shrink-0"
          style={{ background: "rgba(5,11,31,0.95)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>

          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="xl:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Component */}
            <div className="relative hidden sm:block" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}
                placeholder="Global Search (Name, Email, App ID, TxID, Order ID)..."
                className="w-64 md:w-96 bg-white/4 border border-white/8 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-all"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
              )}

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {showSearchDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute left-0 top-full mt-2 w-96 max-h-96 overflow-y-auto rounded-2xl border border-white/10 shadow-2xl z-50 p-2 custom-scrollbar"
                    style={{ background: "#0b1228" }}
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/5 flex justify-between">
                      <span>Search Results ({searchResults.length})</span>
                      <span className="text-violet-400">Click to inspect</span>
                    </div>
                    {searchResults.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">No records found matching "{search}"</div>
                    ) : (
                      searchResults.map((r, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setShowSearchDropdown(false);
                            setSearch("");
                            navigate(r.link);
                          }}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 flex items-start gap-2.5 my-1"
                        >
                          <span className="px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider bg-violet-600/20 text-violet-300 border border-violet-500/30 flex-shrink-0 mt-0.5">
                            {r.type}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate">{r.title}</p>
                            <p className="text-[11px] text-slate-400 truncate">{r.subtitle}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* System Status indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-bold">Admin Engine Live</span>
            </div>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                <Bell className="w-5 h-5" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-900" />
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden"
                      style={{ background: "#0b1228" }}
                    >
                      <div className="flex justify-between items-center px-4 py-3 border-b border-white/8">
                        <h4 className="text-white font-bold text-sm">System Alerts</h4>
                        <span className="text-violet-400 text-xs cursor-pointer hover:text-violet-300 font-semibold">
                          {notifications.length} Total
                        </span>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500">No unread notifications</div>
                      ) : (
                        notifications.slice(0, 5).map((n, i) => (
                          <div
                            key={i}
                            onClick={() => { setNotifOpen(false); navigate(n.link || "/admin/notifications"); }}
                            className="flex gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/3 cursor-pointer transition-colors"
                          >
                            <span className="text-base flex-shrink-0 mt-0.5">🔔</span>
                            <div>
                              <p className="text-slate-200 text-xs font-semibold">{n.title}</p>
                              <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-2">{n.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                      <div
                        onClick={() => { setNotifOpen(false); navigate("/admin/notifications"); }}
                        className="px-4 py-2.5 text-center text-violet-400 text-xs font-bold cursor-pointer hover:text-violet-300 border-t border-white/5"
                      >
                        Open Notification Center →
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 pl-3 border-l border-white/8 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-xs font-black text-white flex-shrink-0">
                  {initials}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-white text-xs font-bold leading-none">{adminName}</p>
                  <p className="text-violet-400 text-[10px] mt-0.5">{user?.email || "Super Administrator"}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden md:block" />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden py-1"
                      style={{ background: "#0b1228" }}
                    >
                      <button
                        onClick={() => { setProfileOpen(false); navigate("/admin/settings"); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-xs font-semibold"
                      >
                        <Settings className="w-4 h-4 text-violet-400" /> Platform Settings
                      </button>
                      <button
                        onClick={() => { setProfileOpen(false); navigate("/admin/audit-logs"); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-xs font-semibold"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-400" /> Audit Log Ledger
                      </button>
                      <div className="border-t border-white/8 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 transition-colors text-xs font-semibold"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
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
