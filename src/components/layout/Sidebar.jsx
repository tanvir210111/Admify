import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Target,
  Building2,
  Award,
  FileCheck,
  FileText,
  Wallet,
  Bell,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const studentNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/student/dashboard" },
  {
    icon: Target,
    label: "AI Recommendations",
    path: "/student/recommendations",
  },
  { icon: Building2, label: "Universities", path: "/student/universities" },
  { icon: Award, label: "Scholarships", path: "/student/scholarships" },
  { icon: FileCheck, label: "My Applications", path: "/student/applications" },
  { icon: FileText, label: "SOP & LOR Generator", path: "/student/documents" },
  { icon: Wallet, label: "Wallet & Credits", path: "/student/wallet" },
  { icon: Bell, label: "Notifications", path: "/student/notifications" },
  { icon: Settings, label: "Settings", path: "/student/settings" },
];

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <motion.aside
        className={`fixed top-0 left-0 w-72 lg:w-64 h-screen flex flex-col pt-6 z-50 bg-[#07111f] border-r border-white/10 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="px-8 mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <span className="text-white text-lg font-black">A</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Admify
            </h1>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar pb-6">
          {studentNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? "text-white font-bold bg-purple-500/20 border border-purple-500/30 shadow-[0_0_15px_rgba(139,92,246,0.25)]"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/30"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 transition-colors ${
                    isActive
                      ? "text-white drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]"
                      : "text-slate-300 group-hover:text-white"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-white/10">
          <Link
            to="/login"
            className="flex w-full items-center gap-3 px-4 py-3 text-slate-300 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all group"
          >
            <LogOut className="w-5 h-5 text-slate-300 group-hover:text-red-400 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Logout</span>
          </Link>
        </div>
      </motion.aside>
    </>
  );
}

export default Sidebar;
