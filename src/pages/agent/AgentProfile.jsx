import React, { useState } from "react";
import { motion } from "framer-motion";
import { User, ShieldCheck, Landmark, Key, Users, CheckCircle2 } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

export default function AgentProfile() {
  const [saving, setSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 max-w-[1200px] mx-auto">
      {/* Title */}
      <motion.div variants={fade} className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <User className="w-6 h-6 text-violet-400" /> Profile & Performance
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage agency profile parameters, check student success statistics, and set credentials security</p>
        </div>
      </motion.div>

      {/* Performance Metrics Stats Cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Students Managed", val: "48", color: "text-violet-400", icon: Users },
          { label: "Admissions Success Rate", val: "94.2%", color: "text-emerald-400", icon: CheckCircle2 },
          { label: "Apps Processed", val: "134", color: "text-blue-400", icon: ShieldCheck },
          { label: "Visa Approvals", val: "28", color: "text-indigo-400", icon: CheckCircle2 },
          { label: "Commission Earned", val: "$84,920", color: "text-emerald-400", icon: Landmark },
        ].map((s, i) => (
          <motion.div key={i} variants={fade} className="p-4 rounded-2xl border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-slate-400 text-xs mt-0.5 font-semibold">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: General Profile Form */}
        <motion.div variants={fade} className="lg:col-span-2 p-5 rounded-2xl border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
          <h3 className="text-white font-bold text-base border-b border-white/5 pb-2 mb-4">Profile Information</h3>
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="flex gap-4 items-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-xl font-black text-white">JS</div>
              <div>
                <p className="text-white font-bold text-sm">Sarah Jenkins</p>
                <p className="text-slate-500 text-xs mt-0.5">EduGlobal Consulting Agency</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Full Name</label>
                <input defaultValue="Sarah Jenkins" className="w-full bg-white/4 border border-white/8 rounded-xl py-2 px-3 text-slate-300 focus:outline-none focus:border-violet-500/50" />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Agency Name</label>
                <input defaultValue="EduGlobal Consulting" className="w-full bg-white/4 border border-white/8 rounded-xl py-2 px-3 text-slate-300 focus:outline-none focus:border-violet-500/50" />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Email Address</label>
                <input defaultValue="sarah.j@eduglobal.study" className="w-full bg-white/4 border border-white/8 rounded-xl py-2 px-3 text-slate-300 focus:outline-none focus:border-violet-500/50" />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Phone Number</label>
                <input defaultValue="+44 7700 900077" className="w-full bg-white/4 border border-white/8 rounded-xl py-2 px-3 text-slate-300 focus:outline-none focus:border-violet-500/50" />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Target Country Specialization</label>
                <input defaultValue="United Kingdom, Canada, Australia" className="w-full bg-white/4 border border-white/8 rounded-xl py-2 px-3 text-slate-300 focus:outline-none focus:border-violet-500/50" />
              </div>
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Counselling Experience</label>
                <input defaultValue="6+ Years Experience" className="w-full bg-white/4 border border-white/8 rounded-xl py-2 px-3 text-slate-300 focus:outline-none focus:border-violet-500/50" />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:brightness-110 text-white font-bold rounded-xl shadow transition-all"
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Right Side: Security & Logins */}
        <motion.div variants={fade} className="p-5 rounded-2xl border space-y-4" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
          <h3 className="text-white font-bold text-sm border-b border-white/5 pb-2 flex items-center gap-1.5"><Key className="w-4 h-4 text-violet-400" /> Security Controls</h3>
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center p-3 bg-white/3 rounded-xl border border-white/4">
              <div>
                <p className="text-slate-200 font-bold">Two-Factor Authentication (2FA)</p>
                <p className="text-slate-500 text-[10px] mt-0.5">Enforce SMS/Authenticator verification codes on logins</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-violet-600 cursor-pointer" />
            </div>

            <div className="space-y-2">
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Device History</p>
              <div className="flex justify-between text-slate-400 border-b border-white/4 pb-1">
                <span>Vivaldi Browser · Windows OS</span>
                <span className="font-mono text-emerald-400">Current</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Safari Browser · macOS OS</span>
                <span className="font-mono">June 18</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
