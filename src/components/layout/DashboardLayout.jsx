import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Bell, Search, Menu, X, CheckCircle2, Settings, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Real-time notification mock state
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Welcome to Admify!", time: "Just now", icon: "👋", color: "bg-primary-500/20 text-primary-400" }
  ]);
  const [unreadCount, setUnreadCount] = useState(1);

  // Simulate incoming real-time notifications
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications(prev => [
        { id: Date.now(), title: "Please complete your profile to get AI recommendations.", time: "Just now", icon: "⚠️", color: "bg-yellow-500/20 text-yellow-400" },
        ...prev
      ]);
      setUnreadCount(prev => prev + 1);
      toast.success("New notification received!", { icon: "🔔" });
    }, 15000); // Trigger after 15 seconds
    
    return () => clearTimeout(timer);
  }, []);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const fullName = user?.user_metadata?.full_name || "Student";
  const roleName = user?.user_metadata?.role || "Student";
  const displayRole = roleName.charAt(0).toUpperCase() + roleName.slice(1);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.success(`Searching for "${searchQuery}"...`, {
        icon: "🔍",
        style: {
          borderRadius: "10px",
          background: "#1e293b",
          color: "#fff",
          border: "1px solid rgba(51, 65, 85, 0.5)",
        },
      });
    }
  };
  return (
    <div className="flex min-h-screen bg-slate-950 relative overflow-hidden font-sans">
      {" "}
      {/* Background gradients */}{" "}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-[120px] pointer-events-none" />{" "}
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />{" "}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />{" "}
      <main className="flex-1 lg:pl-64 flex flex-col relative z-10 w-full overflow-hidden">
        {" "}
        <header className="h-20 glass border-b border-slate-700/50 flex items-center justify-between px-4 lg:px-8 relative z-30">
          {" "}
          <div className="flex items-center gap-4">
            {" "}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              {" "}
              <Menu className="w-6 h-6" />{" "}
            </button>{" "}
            <form
              onSubmit={handleSearch}
              className="relative w-48 sm:w-64 md:w-96 hidden sm:block"
            >
              {" "}
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />{" "}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search universities, programs..."
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-slate-300 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-slate-800/50 transition-all text-sm"
              />{" "}
            </form>{" "}
          </div>{" "}
          <div className="flex items-center gap-4 md:gap-6">
            {" "}
            {/* Notification Dropdown */}{" "}
            <div className="relative">
              {" "}
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setProfileOpen(false);
                  if (unreadCount > 0) setUnreadCount(0);
                }}
                className="relative p-2.5 text-slate-500 hover:text-white rounded-xl hover:bg-slate-800/50 transition-colors"
              >
                {" "}
                <Bell className="w-5 h-5 md:w-6 md:h-6" />{" "}
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900" />
                )}
              </button>{" "}
              <AnimatePresence>
                {" "}
                {showNotifications && (
                  <>
                    {" "}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNotifications(false)}
                    ></div>{" "}
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-full mt-4 w-80 lg:w-96 glass border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/50">
                        <h3 className="text-white font-bold">
                          Notifications
                        </h3>
                        <span 
                          onClick={() => setNotifications([])}
                          className="text-xs text-primary-400 font-medium cursor-pointer hover:text-primary-300"
                        >
                          Clear all
                        </span>
                      </div>
                      <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-500">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No new notifications</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div key={notif.id} className="p-4 border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-3">
                              <div className={`w-8 h-8 rounded-full ${notif.color} flex items-center justify-center flex-shrink-0 text-sm`}>
                                {notif.icon}
                              </div>
                              <div>
                                <p className="text-sm text-slate-300">
                                  {notif.title}
                                </p>
                                <span className="text-xs text-slate-500">
                                  {notif.time}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-3 text-center bg-slate-900 hover:bg-slate-800/50 transition-colors cursor-pointer text-sm text-primary-400 font-medium">
                        View all notifications
                      </div>
                    </motion.div>
                  </>
                )}{" "}
              </AnimatePresence>{" "}
            </div>{" "}
            
            {/* Clickable Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-3 pl-4 md:pl-6 border-l border-slate-700/50 hover:opacity-80 transition-opacity"
              >
                {" "}
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-primary-500 to-blue-500 p-[2px]">
                  {" "}
                  <div className="w-full h-full rounded-full bg-slate-900 border-2 border-transparent overflow-hidden">
                    {" "}
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`}
                      alt="Avatar"
                      className="w-full h-full"
                    />{" "}
                  </div>{" "}
                </div>{" "}
                <div className="hidden md:block text-left">
                  {" "}
                  <p className="text-sm font-bold text-white">{fullName}</p>{" "}
                  <p className="text-[10px] uppercase tracking-wider text-primary-400 font-bold">
                    {displayRole} Account
                  </p>{" "}
                </div>{" "}
                <ChevronDown className="w-4 h-4 text-slate-500 hidden md:block" />
              </button>{" "}

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-full mt-4 w-56 glass border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
                    >
                      <button 
                        onClick={() => {
                          setProfileOpen(false);
                          navigate(`/${roleName}/settings`);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800/80 transition-colors text-slate-300 hover:text-white"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm font-medium">Profile Settings</span>
                      </button>
                      <div className="h-px w-full bg-slate-700/50 my-1" />
                      <button 
                        onClick={async () => {
                          await signOut();
                          navigate("/login");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-colors text-slate-400 hover:text-red-400"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>{" "}
          </div>{" "}
        </header>{" "}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          {" "}
          <AnimatePresence mode="wait">
            {" "}
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="p-4 md:p-8"
            >
              {" "}
              <Outlet />{" "}
            </motion.div>{" "}
          </AnimatePresence>{" "}
        </div>{" "}
      </main>{" "}
    </div>
  );
}
export default DashboardLayout;
