import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Bell, Search, Menu, X, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
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
      <Toaster position="top-right" /> {/* Background gradients */}{" "}
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
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:text-white hover:bg-slate-800/50 rounded-full transition-colors"
              >
                {" "}
                <Bell className="w-5 h-5 md:w-6 md:h-6" />{" "}
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-slate-900 rounded-full"></span>{" "}
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
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden"
                    >
                      {" "}
                      <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50">
                        {" "}
                        <h3 className="font-bold text-white">
                          Notifications
                        </h3>{" "}
                        <span className="text-xs text-primary-400 font-medium cursor-pointer hover:text-primary-300">
                          Mark all as read
                        </span>{" "}
                      </div>{" "}
                      <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {" "}
                        <div className="p-4 border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-3">
                          {" "}
                          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                            {" "}
                            <CheckCircle2 className="w-4 h-4 text-green-400" />{" "}
                          </div>{" "}
                          <div>
                            {" "}
                            <p className="text-sm text-slate-300">
                              Stanford application updated
                            </p>{" "}
                            <span className="text-xs text-slate-500">
                              2 min ago
                            </span>{" "}
                          </div>{" "}
                        </div>{" "}
                        <div className="p-4 border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors cursor-pointer flex gap-3">
                          {" "}
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-lg">
                            🎓
                          </div>{" "}
                          <div>
                            {" "}
                            <p className="text-sm text-slate-300">
                              New scholarship match found!
                            </p>{" "}
                            <span className="text-xs text-slate-500">
                              1 hour ago
                            </span>{" "}
                          </div>{" "}
                        </div>{" "}
                      </div>{" "}
                      <div className="p-3 text-center bg-slate-900 hover:bg-slate-800/50 transition-colors cursor-pointer text-sm text-primary-400 font-medium">
                        {" "}
                        View all notifications{" "}
                      </div>{" "}
                    </motion.div>{" "}
                  </>
                )}{" "}
              </AnimatePresence>{" "}
            </div>{" "}
            <div className="flex items-center gap-3 pl-4 md:pl-6 border-l border-slate-700/50 cursor-pointer hover:opacity-80 transition-opacity">
              {" "}
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-tr from-primary-500 to-blue-500 p-[2px]">
                {" "}
                <div className="w-full h-full rounded-full bg-slate-900 border-2 border-transparent">
                  {" "}
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                    alt="Avatar"
                    className="w-full h-full rounded-full"
                  />{" "}
                </div>{" "}
              </div>{" "}
              <div className="hidden md:block">
                {" "}
                <p className="text-sm font-bold text-white">Alex Doe</p>{" "}
                <p className="text-[10px] uppercase tracking-wider text-primary-400 font-bold">
                  Student Account
                </p>{" "}
              </div>{" "}
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
