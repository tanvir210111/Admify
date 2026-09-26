import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  GraduationCap,
  FolderOpen,
  Sparkles,
  Building2,
  GitCompare,
  Award,
  Calculator,
  DollarSign,
  FileEdit,
  ScrollText,
  Send,
  Users2,
  FileCheck2,
  MessageSquare,
  Bot,
  Bell,
  Wallet,
  AlertTriangle,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

// Clean, uncluttered navigation items
const navigationItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/student/dashboard" },
  { icon: Sparkles, label: "AI Recommendations", path: "/student/recommendations" },
  { icon: Building2, label: "Universities", path: "/student/universities" },
  { icon: GitCompare, label: "Compare Universities", path: "/student/compare" },
  { icon: Award, label: "Scholarships", path: "/student/scholarships" },
  { icon: Calculator, label: "Admission Probability", path: "/student/probability" },
  { icon: DollarSign, label: "Cost Estimator", path: "/student/cost-estimator" },
  { icon: Send, label: "Direct Applications", path: "/student/direct-applications" },
  { icon: Users2, label: "Agency Assistance", path: "/student/agency-assistance" },
  { icon: FileCheck2, label: "Application Tracking", path: "/student/applications" },
  { icon: FileEdit, label: "SOP Generator", path: "/student/sop-generator" },
  { icon: ScrollText, label: "LOR Generator", path: "/student/lor-generator" },
  { icon: Bot, label: "Chatbot", path: "/student/chatbot" },
  { icon: MessageSquare, label: "Messages", path: "/student/messages" },
  { icon: FolderOpen, label: "Documents", path: "/student/documents" },
  { icon: User, label: "Profile", path: "/student/profile" },
  { icon: GraduationCap, label: "Academic Profile", path: "/student/academic-profile" },
  { icon: Bell, label: "Notifications", path: "/student/notifications" },
  { 
    icon: Wallet, 
    label: "Wallet & Credits", 
    path: "/student/wallet",
    altPaths: ["/student/credits"]
  },
  { icon: AlertTriangle, label: "Reports & Complaints", path: "/student/reports" },
  { icon: Settings, label: "Settings", path: "/student/settings" },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const fullName = user?.user_metadata?.full_name || user?.name || "Student";

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
            className="fixed inset-0 bg-[#050B1F]/80 backdrop-blur-md z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Balanced, Clean Sidebar (w-64 = 256px) */}
      <aside
        className={`fixed top-0 left-0 w-64 h-screen flex flex-col pt-5 pb-3 z-50 bg-[#07142D] border-r border-slate-800/80 shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="px-4 mb-4 flex items-center justify-between">
          <Link
            to="/student/dashboard"
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
            }}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#0B1228] border border-cyan-500/30 flex items-center justify-center shadow-md p-1.5 overflow-hidden shrink-0 group-hover:border-cyan-400 transition-colors">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <span className="text-base font-extrabold text-white tracking-tight">
                Admify
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Student Portal</p>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clean, Relaxed Navigation List — Comfortable line-height & no crowding */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
          {navigationItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.altPaths && item.altPaths.some((p) => location.pathname === p));

            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 select-none ${
                  isActive
                    ? "bg-purple-600/15 text-purple-300 font-semibold border border-purple-500/30 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive
                      ? "text-purple-400"
                      : "text-slate-400 group-hover:text-slate-200"
                  }`}
                />
                <span className="truncate whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Footer Profile & Logout */}
        <div className="p-2.5 mx-3 mt-1 rounded-2xl bg-[#0B1228] border border-slate-800 flex items-center justify-between">
          <Link
            to="/student/profile"
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
            }}
            className="flex items-center gap-2.5 min-w-0 flex-1 group"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 p-[1.5px] shrink-0">
              <div className="w-full h-full rounded-full bg-[#07142D] flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                {fullName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                {fullName}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                Global Student
              </p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
}
