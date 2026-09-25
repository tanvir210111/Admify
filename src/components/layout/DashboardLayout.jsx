import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Bell, Search, Menu, Settings, LogOut, ChevronDown, Sparkles, ShieldCheck, User, Coins } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Real notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const fullName = user?.user_metadata?.full_name || user?.name || "Student";
  const roleName = user?.user_metadata?.role || user?.role || "student";
  const displayRole = roleName.charAt(0).toUpperCase() + roleName.slice(1);

  // Fetch real notifications if backend is available
  useEffect(() => {
    let isMounted = true;
    async function loadNotifications() {
      try {
        const res = await api.get('/api/notifications');
        if (isMounted && res?.data?.notifications && res.data.notifications.length > 0) {
          setNotifications(res.data.notifications.map((n) => ({
            id: n._id || n.id,
            title: n.title,
            desc: n.message,
            time: "Recently",
            icon: "🔔",
            color: "bg-purple-500/20 text-purple-300 border-purple-500/30",
          })));
          setUnreadCount(res.unreadCount || 0);
        }
      } catch {
        // Fallback default notifications
      }
    }
    loadNotifications();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/student/universities?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050B1F] text-slate-100 relative overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main View Area */}
      <main className="flex-1 lg:pl-68 flex flex-col relative z-10 w-full overflow-hidden min-h-screen">
        {/* Top Sticky Header */}
        <header className="h-20 bg-[#07142D]/80 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between px-4 lg:px-8 relative z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/40 hover:bg-slate-800 transition-colors border border-slate-700/50"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Bar */}
            <form
              onSubmit={handleSearch}
              className="relative w-48 sm:w-72 md:w-96 hidden sm:block"
            >
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search universities, programs, scholarships..."
                className="w-full bg-[#0B1228]/90 border border-slate-700/60 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all text-xs"
              />
            </form>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            {/* Quick Actions / Free Application Indicator */}
            <Link
              to="/student/direct-applications"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:border-cyan-400 transition-all shadow-sm hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Apply Directly (1 Free)</span>
            </Link>

            {/* Notification Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setProfileOpen(false);
                  if (unreadCount > 0) setUnreadCount(0);
                }}
                className="relative p-2.5 text-slate-400 hover:text-white rounded-xl bg-[#0B1228] border border-slate-800 hover:border-slate-700 transition-all"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNotifications(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-[#07142D] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-[#0B1228]/80">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-cyan-400" />
                          <h3 className="text-white font-bold text-sm">Notifications</h3>
                        </div>
                        <button
                          onClick={() => setNotifications([])}
                          className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                        >
                          Clear all
                        </button>
                      </div>

                      <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-slate-800/60">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-400">
                            <Bell className="w-7 h-7 mx-auto mb-2 opacity-40 text-slate-500" />
                            <p className="text-xs">No notifications yet.</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className="p-3.5 hover:bg-[#0B1228] transition-colors cursor-pointer flex gap-3 items-start"
                            >
                              <div
                                className={`w-8 h-8 rounded-xl ${notif.color} border flex items-center justify-center shrink-0 text-sm`}
                              >
                                {notif.icon}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-white mb-0.5 truncate">
                                  {notif.title}
                                </p>
                                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                                  {notif.desc}
                                </p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {notif.time}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <Link
                        to="/student/notifications"
                        onClick={() => setShowNotifications(false)}
                        className="block p-3 text-center bg-[#0B1228] hover:bg-[#0B1228]/90 transition-colors text-xs text-cyan-400 font-semibold border-t border-slate-800"
                      >
                        Open Notification Center →
                      </Link>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-3 pl-3 md:pl-5 border-l border-slate-800 hover:opacity-90 transition-opacity"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 p-[1.5px] shadow-sm">
                  <div className="w-full h-full rounded-[10px] bg-[#07142D] flex items-center justify-center text-xs font-extrabold text-white">
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-white truncate max-w-[120px]">{fullName}</p>
                  <p className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold">
                    {displayRole}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-3 w-56 bg-[#07142D] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
                    >
                      <div className="px-3 py-2 border-b border-slate-800/80 mb-2">
                        <p className="text-xs font-bold text-white">{fullName}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                      </div>

                      {/* Wallet Credits Card */}
                      <div className="mx-1 mb-2 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                            <Coins className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-purple-300/80 tracking-wider">Admify Credits</p>
                            <p className="text-xs font-black text-white">
                              {user?.walletCredits ?? 0} <span className="text-[10px] text-purple-300 font-semibold">CR</span>
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            navigate("/student/wallet");
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 transition-colors"
                        >
                          Top-up
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/student/profile");
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#0B1228] transition-colors text-slate-300 hover:text-white text-xs font-medium"
                      >
                        <User className="w-4 h-4 text-cyan-400" />
                        <span>My Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/student/settings");
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#0B1228] transition-colors text-slate-300 hover:text-white text-xs font-medium"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Settings</span>
                      </button>

                      <div className="h-px w-full bg-slate-800/80 my-1" />

                      <button
                        onClick={async () => {
                          await signOut();
                          navigate("/login");
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-500/10 transition-colors text-slate-400 hover:text-red-400 text-xs font-medium"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Outlet with smooth transition */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
