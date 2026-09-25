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
  MessageCircle,
  Bot,
  Bell,
  Crown,
  Wallet,
  AlertTriangle,
  Settings,
  LogOut,
  X,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { studentService } from "../../services/studentService";

// Clean Navigation List
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
  { icon: Wallet, label: "Wallet & Credits", path: "/student/wallet" },
  { icon: AlertTriangle, label: "Reports & Complaints", path: "/student/reports" },
  { icon: Settings, label: "Settings", path: "/student/settings" },
];

function Sidebar({ isOpen, onClose }) {
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

      {/* Sidebar Desktop & Mobile Drawer */}
      <motion.aside
        className={`fixed top-0 left-0 w-72 lg:w-68 h-screen flex flex-col pt-5 pb-4 z-50 bg-[#07142D] border-r border-slate-800/80 shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="px-6 mb-5 flex items-center justify-between">
          <Link
            to="/student/dashboard"
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
            }}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0B1228] border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/15 p-1.5 overflow-hidden shrink-0 group-hover:border-cyan-400 transition-all">
              <img
                src="/logo-mark.png"
                alt="Admify Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <Sparkles className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Admify
              </span>
              <p className="text-[11px] text-slate-400 font-medium">Student Portal</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Clean Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar pr-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium ${
                  isActive
                    ? "text-white font-semibold bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-purple-500/20 border border-cyan-500/40 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                    : "text-slate-300 hover:text-white hover:bg-[#0B1228]/80 hover:border hover:border-slate-800"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <item.icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive
                        ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                        : "text-slate-400 group-hover:text-cyan-400"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Footer Profile & Logout */}
        <div className="p-3 mx-3 mt-2 rounded-2xl bg-[#0B1228] border border-slate-800/80 flex items-center justify-between">
          <Link
            to="/student/profile"
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
            }}
            className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-85 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 p-[1.5px] shrink-0">
              <div className="w-full h-full rounded-full bg-[#07142D] flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                {fullName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{fullName}</p>
              <p className="text-[10px] text-cyan-400 truncate">Global Student</p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </motion.aside>
    </>
  );
}

export default Sidebar;
