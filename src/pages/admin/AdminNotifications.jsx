import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Search, Filter, ShieldAlert, Award, FileCheck2, User, Users, Info } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

const NOTIFICATIONS = [
  { id: 1, text: "Ahmad Khalid updated his preferred study destination to Canada.", type: "students", priority: "low", time: "2 minutes ago", status: "unread", icon: User },
  { id: 2, text: "New application submitted for MSc Computer Science at Toronto by Ahmad Khalid.", type: "applications", priority: "high", time: "8 minutes ago", status: "unread", icon: FileCheck2 },
  { id: 3, text: "Sarah Jenkins matched to 'Commonwealth Shared Scholarship' ($15k).", type: "scholarships", priority: "medium", time: "15 minutes ago", status: "unread", icon: Award },
  { id: 4, text: "System Alert: Live Chat response time exceeded 5 mins for agent 'Sarah'.", type: "system", priority: "high", time: "32 minutes ago", status: "read", icon: ShieldAlert },
  { id: 5, text: "Agent Partner 'EduGlobal Agency' registration request pending review.", type: "agents", priority: "medium", time: "1 hour ago", status: "read", icon: Users },
  { id: 6, text: "MOU Signed: University of Melbourne is now an active partner.", type: "applications", priority: "low", time: "3 hours ago", status: "read", icon: Info },
  { id: 7, text: "Server latency spikes detected in ML recommendation API gateway.", type: "system", priority: "high", time: "1 day ago", status: "read", icon: ShieldAlert },
];

const PRIO_MAP = {
  high:   { label: "High",   cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  medium: { label: "Medium", cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  low:    { label: "Low",    cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
};

export default function AdminNotifications() {
  const [activeTab, setActiveTab] = useState("all");
  const [notifs, setNotifs] = useState(NOTIFICATIONS);

  const handleMarkAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, status: "read" })));
  };

  const filtered = notifs.filter(n => activeTab === "all" || n.type === activeTab);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-[1200px] mx-auto">
      {/* Title */}
      <motion.div variants={fade} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-violet-400" /> Notification Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">Audit log alerts, study platform events, support requests, and system telemetry</p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="px-3.5 py-2 bg-white/5 border border-white/8 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl transition-all"
        >
          Mark all as read
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fade} className="flex flex-wrap gap-2 border-b border-white/6 pb-2">
        {["all", "students", "agents", "applications", "scholarships", "system"].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
              activeTab === t
                ? "bg-violet-600/20 border-violet-500/40 text-white"
                : "bg-transparent border-transparent text-slate-400 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </motion.div>

      {/* Notifications List */}
      <motion.div variants={fade} className="space-y-3">
        {filtered.map(n => (
          <div
            key={n.id}
            className={`p-4 rounded-2xl border flex items-start gap-4 transition-all hover:bg-white/3 ${
              n.status === "unread" ? "border-violet-500/20 bg-violet-600/3" : "border-white/6 bg-white/1"
            }`}
          >
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${
              n.status === "unread"
                ? "bg-violet-500/10 border-violet-500/20 text-violet-400"
                : "bg-slate-800 border-slate-700/50 text-slate-400"
            }`}>
              <n.icon className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${PRIO_MAP[n.priority].cls}`}>
                  {PRIO_MAP[n.priority].label}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                {n.status === "unread" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                )}
              </div>
              <p className="text-slate-200 text-sm mt-1.5 leading-relaxed">{n.text}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
