import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, UserCheck, Building2, Award, FileCheck,
  Sparkles, FileText, Wallet, CreditCard, Bell, BarChart3, Settings,
  LogOut, Search, ChevronDown, TrendingUp, TrendingDown, Globe,
  AlertTriangle, CheckCircle2, XCircle, Clock, Cpu, Activity,
  Server, Database, Plus, Download, Eye, MoreHorizontal, Filter,
  ShieldCheck, Zap, Target, GraduationCap, BookOpen, Star,
  ArrowUpRight, ArrowDownRight, RefreshCw, ChevronRight, X, Menu,
} from "lucide-react";

// ─── Sidebar Data ───────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Users, label: "Student Management", id: "students" },
  { icon: UserCheck, label: "Agent Management", id: "agents" },
  { icon: Building2, label: "University Management", id: "universities" },
  { icon: Award, label: "Scholarship Management", id: "scholarships" },
  { icon: FileCheck, label: "Applications", id: "applications" },
  { icon: Sparkles, label: "AI Recommendations", id: "ai" },
  { icon: FileText, label: "SOP & LOR Requests", id: "sop" },
  { icon: Wallet, label: "Wallet & Credits", id: "wallet" },
  { icon: CreditCard, label: "Payments", id: "payments" },
  { icon: Bell, label: "Notifications", id: "notifications" },
  { icon: BarChart3, label: "Reports & Analytics", id: "reports" },
  { icon: Settings, label: "Settings", id: "settings" },
];

// ─── Mock Data ───────────────────────────────────────────────────────────────
const KPI_CARDS = [
  { label: "Total Students", value: "12,450", change: "+8.2%", pos: true, icon: GraduationCap, color: "from-violet-600 to-purple-700", glow: "rgba(139,92,246,0.4)", sub: "847 new this month" },
  { label: "Total Agents", value: "320", change: "+4.1%", pos: true, icon: UserCheck, color: "from-blue-600 to-cyan-600", glow: "rgba(37,99,235,0.4)", sub: "12 pending approval" },
  { label: "Partner Universities", value: "450+", change: "+15", pos: true, icon: Building2, color: "from-emerald-600 to-teal-600", glow: "rgba(5,150,105,0.4)", sub: "23 countries covered" },
  { label: "Total Applications", value: "8,920", change: "+12.5%", pos: true, icon: FileCheck, color: "from-orange-500 to-amber-600", glow: "rgba(234,88,12,0.4)", sub: "2,341 this month" },
  { label: "Monthly Revenue", value: "$184,200", change: "+18.3%", pos: true, icon: TrendingUp, color: "from-pink-600 to-rose-600", glow: "rgba(219,39,119,0.4)", sub: "vs $155.6k last month" },
  { label: "AI Recommendations", value: "2.1M+", change: "+31.7%", pos: true, icon: Sparkles, color: "from-indigo-600 to-violet-600", glow: "rgba(99,102,241,0.4)", sub: "Avg 98ms response" },
];

const APP_STATS = [
  { label: "Submitted", value: 8920, color: "bg-blue-500", pct: 100 },
  { label: "Approved", value: 3840, color: "bg-emerald-500", pct: 43 },
  { label: "Rejected", value: 1120, color: "bg-red-500", pct: 13 },
  { label: "Pending Review", value: 2710, color: "bg-yellow-500", pct: 30 },
  { label: "In Processing", value: 1250, color: "bg-purple-500", pct: 14 },
];

const STUDENTS = [
  { name: "Ahmad Khalid", country: "🇬🇧 UK / Canada", gpa: "3.8", ielts: "7.5", match: 95, status: "approved", avatar: "AK" },
  { name: "Priya Sharma", country: "🇦🇺 Australia", gpa: "3.6", ielts: "7.0", match: 88, status: "in_review", avatar: "PS" },
  { name: "Liu Wei", country: "🇺🇸 USA", gpa: "3.9", ielts: "8.0", match: 97, status: "approved", avatar: "LW" },
  { name: "Fatima Al-Hassan", country: "🇩🇪 Germany", gpa: "3.4", ielts: "6.5", match: 79, status: "pending", avatar: "FA" },
  { name: "Carlos Mendez", country: "🇨🇦 Canada", gpa: "3.7", ielts: "7.0", match: 91, status: "in_review", avatar: "CM" },
  { name: "Aisha Okafor", country: "🇬🇧 UK", gpa: "3.5", ielts: "6.5", match: 82, status: "pending", avatar: "AO" },
];

const AGENTS = [
  { name: "James Thornton", region: "UK & Europe", students: 48, success: 94, revenue: "$22,400", cases: 12, avatar: "JT", rating: 4.9 },
  { name: "Mei Lin", region: "Australia & NZ", students: 62, success: 91, revenue: "$31,200", cases: 18, avatar: "ML", rating: 4.8 },
  { name: "Rahul Verma", region: "USA & Canada", students: 55, success: 88, revenue: "$28,600", cases: 14, avatar: "RV", rating: 4.7 },
  { name: "Sophie Laurent", region: "France & Europe", students: 41, success: 96, revenue: "$19,800", cases: 9, avatar: "SL", rating: 4.9 },
];

const UNIVERSITIES = [
  { name: "University of Toronto", country: "🇨🇦 Canada", rank: "#21", fee: "CAD 35k", apps: 342, status: "active" },
  { name: "University of Manchester", country: "🇬🇧 UK", rank: "#28", fee: "£26k", apps: 289, status: "active" },
  { name: "University of Melbourne", country: "🇦🇺 Australia", rank: "#33", fee: "AUD 44k", apps: 201, status: "active" },
  { name: "TU Munich", country: "🇩🇪 Germany", rank: "#49", fee: "€500", apps: 176, status: "active" },
  { name: "McGill University", country: "🇨🇦 Canada", rank: "#46", fee: "CAD 29k", apps: 154, status: "active" },
  { name: "ETH Zurich", country: "🇨🇭 Switzerland", rank: "#7", fee: "CHF 1.5k", apps: 98, status: "pending" },
];

const AI_SERVICES = [
  { name: "Recommendation Engine", status: "online", latency: "98ms", accuracy: "94.2%", icon: Sparkles },
  { name: "Admission Predictor", status: "online", latency: "142ms", accuracy: "91.8%", icon: Target },
  { name: "SOP Generator", status: "online", latency: "3.2s", accuracy: "97.1%", icon: FileText },
  { name: "Scholarship Matcher", status: "degraded", latency: "380ms", accuracy: "89.4%", icon: Award },
  { name: "API Gateway", status: "online", latency: "12ms", accuracy: "—", icon: Server },
  { name: "Database Cluster", status: "online", latency: "4ms", accuracy: "—", icon: Database },
];

const ACTIVITIES = [
  { icon: "🎓", color: "bg-blue-500/20 text-blue-400", title: "New Student Registered", desc: "Ahmad Khalid from Pakistan — targeting UK universities", time: "2 min ago" },
  { icon: "📋", color: "bg-purple-500/20 text-purple-400", title: "Application Submitted", desc: "Priya Sharma applied to University of Melbourne, M.Sc. Data Science", time: "8 min ago" },
  { icon: "💰", color: "bg-emerald-500/20 text-emerald-400", title: "Scholarship Match Found", desc: "$25,000 Global Excellence Award matched to Liu Wei", time: "15 min ago" },
  { icon: "🤝", color: "bg-orange-500/20 text-orange-400", title: "Agent Assignment", desc: "Fatima Al-Hassan assigned to Agent James Thornton", time: "32 min ago" },
  { icon: "✍️", color: "bg-indigo-500/20 text-indigo-400", title: "SOP Generated", desc: "AI generated SOP for Carlos Mendez — Stanford CS program", time: "1h ago" },
  { icon: "💳", color: "bg-pink-500/20 text-pink-400", title: "Wallet Recharged", desc: "Aisha Okafor topped up 500 credits ($49)", time: "1h 20min ago" },
  { icon: "🏫", color: "bg-teal-500/20 text-teal-400", title: "University Partnership", desc: "New MOU signed with University of Auckland, NZ", time: "3h ago" },
];

const REVENUE_BARS = [
  { month: "Jan", val: 92 }, { month: "Feb", val: 108 }, { month: "Mar", val: 98 },
  { month: "Apr", val: 124 }, { month: "May", val: 138 }, { month: "Jun", val: 129 },
  { month: "Jul", val: 151 }, { month: "Aug", val: 143 }, { month: "Sep", val: 167 },
  { month: "Oct", val: 158 }, { month: "Nov", val: 178 }, { month: "Dec", val: 184 },
];

// ─── Helper Components ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

function StatusPill({ status }) {
  const map = {
    online: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    degraded: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    offline: "bg-red-500/15 text-red-400 border-red-500/30",
    approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    in_review: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  };
  const label = {
    online: "Online", degraded: "Degraded", offline: "Offline",
    approved: "Approved", in_review: "In Review", pending: "Pending", active: "Active",
  };
  return (
    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${map[status]}`}>
      {label[status]}
    </span>
  );
}

function SectionHeader({ title, sub, action }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
      <div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {sub && <p className="text-slate-400 text-sm mt-0.5">{sub}</p>}
      </div>
      {action && (
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 hover:bg-slate-700 border border-slate-700/50 text-slate-300 text-sm font-medium rounded-xl transition-colors">
          {action.icon} {action.label}
        </button>
      )}
    </div>
  );
}

// ─── Admin Sidebar ───────────────────────────────────────────────────────────
function AdminSidebar({ active, setActive, isOpen, onClose }) {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 xl:hidden"
          />
        )}
      </AnimatePresence>
      <aside
        className={`fixed top-0 left-0 h-screen w-64 z-50 flex flex-col transition-transform duration-300 xl:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "linear-gradient(180deg, #07091a 0%, #050b1f 100%)", borderRight: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <span className="text-white font-black text-lg">A</span>
            </div>
            <div>
              <p className="text-white font-extrabold text-lg leading-none">Admify</p>
              <p className="text-violet-400 text-[9px] font-bold uppercase tracking-widest">Admin Portal</p>
            </div>
          </Link>
          <button onClick={onClose} className="xl:hidden text-slate-500 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActive(item.id); if (window.innerWidth < 1280) onClose(); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 text-left group ${
                  isActive
                    ? "bg-violet-600/20 border border-violet-500/30 text-white font-bold shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300"}`} style={{width:"18px",height:"18px"}} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-violet-400" />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/5 space-y-1">
          <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/3 border border-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-xs font-black text-white flex-shrink-0">SA</div>
            <div className="min-w-0">
              <p className="text-white text-xs font-bold truncate">Super Admin</p>
              <p className="text-violet-400 text-[10px]">admin@admify.io</p>
            </div>
          </div>
          <Link to="/login" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm group">
            <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" style={{width:"16px",height:"16px"}} />
            <span>Logout</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

// ─── Admin Header ────────────────────────────────────────────────────────────
function AdminHeader({ onMenuClick }) {
  const [search, setSearch] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-white/5 flex-shrink-0" style={{ background: "rgba(7,9,26,0.95)", backdropFilter: "blur(12px)" }}>
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="xl:hidden p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students, agents, universities..."
            className="w-64 md:w-80 bg-white/5 border border-white/8 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/8 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* System status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-bold">All Systems Operational</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-900" />
          </button>
          <AnimatePresence>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
                  className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden"
                  style={{ background: "#0d1129" }}
                >
                  <div className="flex justify-between items-center px-4 py-3 border-b border-white/8">
                    <h4 className="text-white font-bold text-sm">Notifications</h4>
                    <span className="text-violet-400 text-xs cursor-pointer hover:text-violet-300">Mark all read</span>
                  </div>
                  {ACTIVITIES.slice(0, 4).map((a, i) => (
                    <div key={i} className="flex gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/3 cursor-pointer transition-colors">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${a.color}`}>{a.icon}</span>
                      <div className="min-w-0">
                        <p className="text-slate-300 text-xs font-medium truncate">{a.title}</p>
                        <p className="text-slate-500 text-[10px] mt-0.5">{a.time}</p>
                      </div>
                    </div>
                  ))}
                  <div className="px-4 py-2.5 text-center text-violet-400 text-xs font-medium cursor-pointer hover:text-violet-300 transition-colors">View all notifications →</div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-white/8 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-xs font-black text-white">SA</div>
          <div className="hidden md:block">
            <p className="text-white text-xs font-bold leading-none">Super Admin</p>
            <p className="text-violet-400 text-[10px] mt-0.5">System Administrator</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden md:block" />
        </div>
      </div>
    </header>
  );
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logFilter, setLogFilter] = useState("ALL");

  return (
    <div className="flex min-h-screen" style={{ background: "#050b1f", fontFamily: "'Inter', sans-serif" }}>
      <AdminSidebar active={activeNav} setActive={setActiveNav} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area */}
      <div className="flex-1 xl:pl-64 flex flex-col min-h-screen">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-6">

          {/* ── Page Title ── */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
                <ShieldCheck className="w-7 h-7 text-violet-400" />
                Admin Dashboard
              </h1>
              <p className="text-slate-400 text-sm mt-1">Admify Platform — Real-time overview & management</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-medium rounded-xl transition-colors">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-shadow">
                <Download className="w-4 h-4" /> Export Report
              </button>
            </div>
          </motion.div>

          {/* ─────────────────────────────────────────────────────────── */}
          {/* SECTION 1 · KPI Cards                                       */}
          {/* ─────────────────────────────────────────────────────────── */}
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {KPI_CARDS.map((k, i) => (
              <motion.div key={i} variants={fadeUp}
                className="relative overflow-hidden rounded-2xl border border-white/8 p-5 group hover:-translate-y-1 transition-transform cursor-default"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${k.color} blur-[60px]`} style={{ opacity: 0.04 }} />
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${k.color} shadow-lg`} style={{ boxShadow: `0 4px 20px ${k.glow}` }}>
                    <k.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${k.pos ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                    {k.pos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {k.change}
                  </span>
                </div>
                <p className="text-3xl font-black text-white mb-0.5">{k.value}</p>
                <p className="text-slate-400 text-sm font-medium">{k.label}</p>
                <p className="text-slate-600 text-xs mt-1">{k.sub}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* ─────────────────────────────────────────────────────────── */}
          {/* SECTION 2 · Application Analytics                           */}
          {/* ─────────────────────────────────────────────────────────── */}
          <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 xl:grid-cols-5 gap-4">
            {/* Bar chart area */}
            <motion.div variants={fadeUp} className="xl:col-span-3 rounded-2xl border border-white/8 p-6" style={{ background: "rgba(255,255,255,0.02)" }}>
              <SectionHeader title="Revenue Overview" sub="Monthly revenue — 2026 ($k)" />
              <div className="flex items-end gap-1.5 h-36 w-full">
                {REVENUE_BARS.map((b, i) => {
                  const maxVal = Math.max(...REVENUE_BARS.map(x => x.val));
                  const pct = (b.val / maxVal) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                      <div className="w-full flex flex-col justify-end relative" style={{ height: "112px" }}>
                        <motion.div
                          initial={{ height: 0 }} animate={{ height: `${pct}%` }}
                          transition={{ delay: i * 0.06, duration: 0.7, ease: "easeOut" }}
                          className="w-full rounded-t-md bg-gradient-to-t from-violet-700 to-blue-500 group-hover:from-violet-500 group-hover:to-cyan-400 transition-all relative"
                        >
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-800 px-1.5 py-0.5 rounded pointer-events-none">${b.val}k</div>
                        </motion.div>
                      </div>
                      <span className="text-[9px] text-slate-600 font-medium">{b.month}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-4 pt-4 border-t border-white/5">
                <div><p className="text-2xl font-black text-white">$184.2k</p><p className="text-emerald-400 text-xs font-bold flex items-center gap-1 mt-0.5"><ArrowUpRight className="w-3 h-3" /> +18.3% vs last month</p></div>
                <div className="text-right"><p className="text-slate-400 text-xs">YTD Total</p><p className="text-xl font-black text-white mt-0.5">$1.58M</p></div>
              </div>
            </motion.div>

            {/* Application status bars */}
            <motion.div variants={fadeUp} className="xl:col-span-2 rounded-2xl border border-white/8 p-6" style={{ background: "rgba(255,255,255,0.02)" }}>
              <SectionHeader title="Application Analytics" sub="Processing breakdown" />
              <div className="space-y-4">
                {APP_STATS.map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-300 font-medium">{s.label}</span>
                      <span className="text-white font-bold">{s.value.toLocaleString()}</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${s.pct}%` }}
                        transition={{ delay: i * 0.1 + 0.3, duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full ${s.color}`}
                      />
                    </div>
                    <p className="text-slate-600 text-[10px] mt-0.5">{s.pct}% of total</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 p-3.5 rounded-xl border border-violet-500/20 bg-violet-500/8">
                <p className="text-xs text-slate-400">Processing Rate</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black text-white">96.2%</span>
                  <span className="text-emerald-400 text-xs font-bold flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" /> +2.1%</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* ─────────────────────────────────────────────────────────── */}
          {/* SECTION 3 · Student Management                              */}
          {/* ─────────────────────────────────────────────────────────── */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="rounded-2xl border border-white/8 p-6" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-violet-400" /> Student Management</h2>
                <p className="text-slate-400 text-sm mt-0.5">12,450 total students • 847 added this month</p>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/8 text-slate-300 text-sm rounded-xl hover:bg-white/10 transition-colors"><Filter className="w-3.5 h-3.5" /> Filter</button>
                <button className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 text-white text-sm font-bold rounded-xl hover:bg-violet-500 transition-colors"><Plus className="w-3.5 h-3.5" /> Add Student</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/8 text-[11px] text-slate-500 uppercase tracking-widest">
                    <th className="pb-3 font-bold">Student</th>
                    <th className="pb-3 font-bold">Country Pref.</th>
                    <th className="pb-3 font-bold">GPA</th>
                    <th className="pb-3 font-bold">IELTS</th>
                    <th className="pb-3 font-bold">Match Score</th>
                    <th className="pb-3 font-bold">Status</th>
                    <th className="pb-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {STUDENTS.map((s, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/3 transition-colors group">
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600/40 to-blue-600/40 border border-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-300 flex-shrink-0">{s.avatar}</div>
                          <span className="text-slate-200 font-semibold text-sm group-hover:text-white transition-colors">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-400 text-sm">{s.country}</td>
                      <td className="py-3.5">
                        <span className={`text-sm font-bold ${parseFloat(s.gpa) >= 3.7 ? "text-emerald-400" : parseFloat(s.gpa) >= 3.4 ? "text-yellow-400" : "text-slate-300"}`}>{s.gpa}</span>
                      </td>
                      <td className="py-3.5 text-slate-300 text-sm font-mono">{s.ielts}</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-white/8 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${s.match >= 90 ? "bg-emerald-500" : s.match >= 80 ? "bg-yellow-500" : "bg-orange-500"}`} style={{ width: `${s.match}%` }} />
                          </div>
                          <span className={`text-xs font-bold ${s.match >= 90 ? "text-emerald-400" : s.match >= 80 ? "text-yellow-400" : "text-orange-400"}`}>{s.match}%</span>
                        </div>
                      </td>
                      <td className="py-3.5"><StatusPill status={s.status} /></td>
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 rounded-lg hover:bg-white/8 text-slate-400 hover:text-white transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                          <button className="p-1.5 rounded-lg hover:bg-white/8 text-slate-400 hover:text-white transition-colors"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
              <span className="text-slate-500 text-xs">Showing 6 of 12,450 students</span>
              <button className="text-violet-400 hover:text-violet-300 text-xs font-medium transition-colors flex items-center gap-1">View all students <ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
          </motion.div>

          {/* ─────────────────────────────────────────────────────────── */}
          {/* SECTION 4 · Agent Performance                               */}
          {/* ─────────────────────────────────────────────────────────── */}
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <SectionHeader title="Agent Performance" sub="320 active agents across 45+ countries" action={{ icon: <Plus className="w-3.5 h-3.5" />, label: "Create Agent" }} />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {AGENTS.map((a, i) => (
                <motion.div key={i} variants={fadeUp} className="rounded-2xl border border-white/8 p-5 hover:border-violet-500/30 transition-all group cursor-pointer" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600/30 to-blue-600/30 border border-violet-500/20 flex items-center justify-center text-sm font-bold text-violet-300">{a.avatar}</div>
                    <div>
                      <p className="text-white font-bold text-sm group-hover:text-violet-300 transition-colors">{a.name}</p>
                      <p className="text-slate-500 text-xs">{a.region}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-yellow-400 text-xs font-bold">{a.rating}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Students", val: a.students },
                      { label: "Success Rate", val: `${a.success}%` },
                      { label: "Revenue", val: a.revenue },
                      { label: "Active Cases", val: a.cases },
                    ].map((m, j) => (
                      <div key={j} className="bg-white/3 rounded-xl p-3 border border-white/5">
                        <p className="text-slate-500 text-[10px] uppercase font-bold mb-1">{m.label}</p>
                        <p className="text-white font-black text-base">{m.val}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ─────────────────────────────────────────────────────────── */}
          {/* SECTION 5 · University Management                           */}
          {/* ─────────────────────────────────────────────────────────── */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="rounded-2xl border border-white/8 p-6" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Building2 className="w-5 h-5 text-emerald-400" /> University Management</h2>
                <p className="text-slate-400 text-sm mt-0.5">450+ partner institutions · 23 countries</p>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-500 transition-colors"><Plus className="w-3.5 h-3.5" /> Add University</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/8 text-[11px] text-slate-500 uppercase tracking-widest">
                    <th className="pb-3 font-bold">University</th>
                    <th className="pb-3 font-bold">Country</th>
                    <th className="pb-3 font-bold">Ranking</th>
                    <th className="pb-3 font-bold">Tuition Fee</th>
                    <th className="pb-3 font-bold">Applications</th>
                    <th className="pb-3 font-bold">Status</th>
                    <th className="pb-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {UNIVERSITIES.map((u, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/3 transition-colors group">
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600/30 to-teal-600/30 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-4 h-4 text-emerald-400" />
                          </div>
                          <span className="text-slate-200 font-semibold text-sm group-hover:text-white transition-colors">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-400 text-sm">{u.country}</td>
                      <td className="py-3.5"><span className="text-violet-400 font-bold text-sm">{u.rank}</span></td>
                      <td className="py-3.5 text-slate-300 font-mono text-sm">{u.fee}</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-sm">{u.apps}</span>
                          <div className="w-12 h-1 bg-white/8 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min((u.apps / 350) * 100, 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5"><StatusPill status={u.status} /></td>
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 rounded-lg hover:bg-white/8 text-slate-400 hover:text-white transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                          <button className="p-1.5 rounded-lg hover:bg-white/8 text-slate-400 hover:text-white transition-colors"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* ─────────────────────────────────────────────────────────── */}
          {/* SECTION 6 · Scholarship Analytics                           */}
          {/* ─────────────────────────────────────────────────────────── */}
          <motion.div variants={stagger} initial="hidden" animate="show">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Award className="w-5 h-5 text-yellow-400" /> Scholarship Analytics</h2>
                <p className="text-slate-400 text-sm mt-0.5">2,100+ scholarships across all categories</p>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-2 bg-yellow-600/80 text-white text-sm font-bold rounded-xl hover:bg-yellow-500 transition-colors"><Plus className="w-3.5 h-3.5" /> Add Scholarship</button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Scholarships", value: "2,100+", icon: Award, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", glow: "from-yellow-600 to-orange-600" },
                { label: "Active Scholarships", value: "1,847", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", glow: "from-emerald-600 to-teal-600" },
                { label: "Scholarship Applications", value: "4,230", icon: FileCheck, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", glow: "from-blue-600 to-cyan-600" },
                { label: "Awarded Students", value: "892", icon: Star, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", glow: "from-purple-600 to-violet-600" },
              ].map((s, i) => (
                <motion.div key={i} variants={fadeUp} className={`rounded-2xl border p-5 ${s.bg} hover:-translate-y-1 transition-transform`}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.glow} flex items-center justify-center mb-3 shadow-lg`}>
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-black text-white">{s.value}</p>
                  <p className={`text-sm font-medium mt-0.5 ${s.color}`}>{s.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ─────────────────────────────────────────────────────────── */}
          {/* SECTION 7 · AI System Monitoring                            */}
          {/* ─────────────────────────────────────────────────────────── */}
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <SectionHeader title="AI System Monitoring" sub="Real-time platform health & model performance" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {AI_SERVICES.map((svc, i) => {
                const statusColor = svc.status === "online" ? { dot: "bg-emerald-400", text: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/8" } : { dot: "bg-yellow-400", text: "text-yellow-400", border: "border-yellow-500/20", bg: "bg-yellow-500/8" };
                return (
                  <motion.div key={i} variants={fadeUp} className="rounded-2xl border border-white/8 p-5 hover:border-violet-500/20 transition-all" style={{ background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
                        <svc.icon className="w-5 h-5 text-violet-400" />
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${statusColor.border} ${statusColor.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusColor.dot} animate-pulse`} />
                        <span className={`text-[10px] font-bold capitalize ${statusColor.text}`}>{svc.status}</span>
                      </div>
                    </div>
                    <p className="text-white font-bold text-sm mb-3">{svc.name}</p>
                    <div className="flex justify-between text-xs">
                      <div>
                        <p className="text-slate-500 mb-0.5">Latency</p>
                        <p className="text-slate-200 font-bold font-mono">{svc.latency}</p>
                      </div>
                      {svc.accuracy !== "—" && (
                        <div className="text-right">
                          <p className="text-slate-500 mb-0.5">Accuracy</p>
                          <p className="text-emerald-400 font-bold">{svc.accuracy}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* ─────────────────────────────────────────────────────────── */}
          {/* SECTION 8+9 · Activities + Quick Actions                    */}
          {/* ─────────────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Recent Activities */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="xl:col-span-2 rounded-2xl border border-white/8 p-6" style={{ background: "rgba(255,255,255,0.02)" }}>
              <SectionHeader title="Recent Activities" sub="Live platform events timeline" />
              <div className="space-y-0">
                {ACTIVITIES.map((a, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className="flex gap-4 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/2 rounded-xl px-2 transition-colors group cursor-default"
                  >
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${a.color} border border-white/8`}>{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 text-sm font-semibold group-hover:text-white transition-colors">{a.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5 truncate">{a.desc}</p>
                    </div>
                    <span className="text-slate-600 text-[10px] flex-shrink-0 pt-0.5">{a.time}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions + Credit Summary */}
            <div className="space-y-4">
              {/* Quick Actions */}
              <motion.div variants={fadeUp} initial="hidden" animate="show" className="rounded-2xl border border-white/8 p-6" style={{ background: "rgba(255,255,255,0.02)" }}>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Zap className="w-4.5 h-4.5 text-yellow-400" style={{width:"18px",height:"18px"}} /> Quick Actions</h2>
                <div className="space-y-2.5">
                  {[
                    { label: "Add University", icon: Building2, color: "hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400" },
                    { label: "Add Scholarship", icon: Award, color: "hover:bg-yellow-500/10 hover:border-yellow-500/30 hover:text-yellow-400" },
                    { label: "Create Agent", icon: UserCheck, color: "hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400" },
                    { label: "Export Reports", icon: Download, color: "hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-400" },
                    { label: "View Analytics", icon: BarChart3, color: "hover:bg-pink-500/10 hover:border-pink-500/30 hover:text-pink-400" },
                  ].map((q, i) => (
                    <button key={i} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/8 bg-white/3 text-slate-300 text-sm font-medium transition-all ${q.color}`}>
                      <q.icon className="w-4 h-4 flex-shrink-0" />
                      {q.label}
                      <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Platform Health Summary */}
              <motion.div variants={fadeUp} initial="hidden" animate="show" className="rounded-2xl border border-violet-500/20 p-5 bg-violet-500/5">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-violet-400" /> Platform Health</h3>
                {[
                  { label: "API Success Rate", val: "99.7%", color: "bg-emerald-500" },
                  { label: "Avg Response Time", val: "142ms", color: "bg-blue-500" },
                  { label: "Active Sessions", val: "1,832", color: "bg-violet-500" },
                ].map((m, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 text-xs">
                    <span className="text-slate-400 flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${m.color}`} />
                      {m.label}
                    </span>
                    <span className="text-white font-bold">{m.val}</span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
