import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, User, FileCheck, Landmark, ShieldAlert, Award, Calendar, Circle } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const NOTIFICATIONS = [
  { id: 1, type: "applications", prio: "high", title: "Visa Pending Update", desc: "Ahmad Khalid application stage moved to Visa Pending. Prepare submission files.", time: "3 minutes ago", status: "unread", icon: FileCheck },
  { id: 2, type: "scholarships", prio: "medium", title: "Scholarship Match", desc: "Ahmad Khalid was matched to Toronto Global Excellence Scholarship (CAD 15k).", time: "15 minutes ago", status: "unread", icon: Award },
  { id: 3, type: "meetings", prio: "low", title: "Meeting Scheduled", desc: "Consultation booked with Sarah Jenkins tomorrow at 2:00 PM.", time: "18 minutes ago", status: "unread", icon: Calendar },
  { id: 4, type: "payments", prio: "medium", title: "Commission Approved", desc: "Commission invoice #INV-928 ($1,240) approved for Ahmad Khalid enrollment.", time: "1 hour ago", status: "read", icon: Landmark },
  { id: 5, type: "universities", prio: "low", title: "MOU Update", desc: "University of Manchester updated BSc Data Science eligibility IELTS requirements.", time: "3 hours ago", status: "read", icon: InfoIcon },
  { id: 6, type: "system", prio: "high", title: "API Outage Warning", desc: "Recommendation service experienced a 5-minute latency spike.", time: "1 day ago", status: "read", icon: ShieldAlert },
];

const PRIO_MAP = {
  high:   { label: "High",   cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  medium: { label: "Medium", cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  low:    { label: "Low",    cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
};

export default function AgentNotifications() {
  const [activeTab, setActiveTab] = useState("all");
  const [notifs, setNotifs] = useState(NOTIFICATIONS);

  const handleMarkRead = (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, status: "read" } : n));
  };

  const handleDelete = (id) => {
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  const filtered = notifs.filter(n => activeTab === "all" || n.type === activeTab);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-[1200px] mx-auto">
      {/* Title */}
      <motion.div variants={fade} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-violet-400" /> Notifications Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">Audit log alerts, study platform events, student meeting warnings, and system payouts updates</p>
        </div>
        <button
          onClick={() => setNotifs(prev => prev.map(n => ({ ...n, status: "read" })))}
          className="px-3.5 py-2 bg-white/5 border border-white/8 hover:bg-white/10 text-slate-300 text-xs font-bold rounded-xl transition-all"
        >
          Mark all as read
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fade} className="flex flex-wrap gap-2 border-b border-white/6 pb-2">
        {["all", "applications", "universities", "scholarships", "meetings", "payments", "system"].map(t => (
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
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${PRIO_MAP[n.prio].cls}`}>
                    {PRIO_MAP[n.prio].label}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{n.time}</span>
                  {n.status === "unread" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  )}
                </div>
                <div className="flex gap-2">
                  {n.status === "unread" && (
                    <button onClick={() => handleMarkRead(n.id)} className="text-[10px] text-violet-400 hover:underline">Mark read</button>
                  )}
                  <button onClick={() => handleDelete(n.id)} className="text-[10px] text-red-400 hover:underline">Delete</button>
                </div>
              </div>
              <h4 className="text-white text-xs font-bold mt-2">{n.title}</h4>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">{n.desc}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

function InfoIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
